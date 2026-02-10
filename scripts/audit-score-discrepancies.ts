/**
 * Audit Script: Score Discrepancies
 * ==================================
 * Reads all scans with sub-scores from the DB, recomputes canonical composite
 * using computeCompositeScore(), and reports mismatches.
 *
 * Usage: npx tsx scripts/audit-score-discrepancies.ts
 * 
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */

import { createClient } from '@supabase/supabase-js'
import { computeCompositeScore, computeRiskLevel, type C2PAStatus } from '../lib/risk/scoring'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface ScanRow {
    id: string
    composite_score: number | null
    ip_risk_score: number | null
    safety_risk_score: number | null
    provenance_status: string | null
    risk_level: string | null
    status: string
    created_at: string
}

async function audit() {
    console.log('🔍 Fetching completed scans with sub-scores...\n')

    const { data: scans, error } = await supabase
        .from('scans')
        .select('id, composite_score, ip_risk_score, safety_risk_score, provenance_status, risk_level, status, created_at')
        .eq('status', 'complete')
        .not('composite_score', 'is', null)
        .not('ip_risk_score', 'is', null)
        .not('safety_risk_score', 'is', null)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('❌ DB query failed:', error.message)
        process.exit(1)
    }

    if (!scans || scans.length === 0) {
        console.log('No completed scans with sub-scores found.')
        return
    }

    console.log(`Found ${scans.length} scans to audit.\n`)

    const discrepancies: {
        id: string
        created: string
        stored: number
        canonical: number
        delta: number
        storedLevel: string | null
        canonicalLevel: string
    }[] = []

    for (const scan of scans as ScanRow[]) {
        // Map provenance_status to C2PAStatus (default to 'missing' if null/unknown)
        const c2paStatus: C2PAStatus =
            (scan.provenance_status as C2PAStatus) || 'missing'

        const canonicalScore = computeCompositeScore({
            ipScore: scan.ip_risk_score!,
            safetyScore: scan.safety_risk_score!,
            c2paStatus,
        })
        const canonicalLevel = computeRiskLevel(canonicalScore)

        const delta = Math.abs(canonicalScore - (scan.composite_score ?? 0))

        if (delta > 1 || scan.risk_level !== canonicalLevel) {
            discrepancies.push({
                id: scan.id,
                created: scan.created_at,
                stored: scan.composite_score ?? 0,
                canonical: canonicalScore,
                delta,
                storedLevel: scan.risk_level,
                canonicalLevel,
            })
        }
    }

    // ─── Report ────────────────────────────────────────────────────────────────

    console.log('═══════════════════════════════════════════════════════════')
    console.log('              SCORE DISCREPANCY AUDIT REPORT              ')
    console.log('═══════════════════════════════════════════════════════════\n')

    console.log(`Total scans audited:  ${scans.length}`)
    console.log(`Discrepancies found:  ${discrepancies.length}`)
    console.log(`Discrepancy rate:     ${((discrepancies.length / scans.length) * 100).toFixed(1)}%\n`)

    if (discrepancies.length === 0) {
        console.log('✅ All stored scores match canonical scoring. No action needed.')
        return
    }

    // Show details
    console.log('─── Discrepancies ──────────────────────────────────────────\n')

    for (const d of discrepancies) {
        const levelChange = d.storedLevel !== d.canonicalLevel
            ? ` [LEVEL SHIFT: ${d.storedLevel} → ${d.canonicalLevel}]`
            : ''
        console.log(
            `  ${d.id}  stored=${d.stored}  canonical=${d.canonical}  Δ=${d.delta}${levelChange}`
        )
    }

    // Distribution summary
    const deltaGroups = {
        '1-5': discrepancies.filter(d => d.delta >= 1 && d.delta <= 5).length,
        '6-10': discrepancies.filter(d => d.delta >= 6 && d.delta <= 10).length,
        '11-20': discrepancies.filter(d => d.delta >= 11 && d.delta <= 20).length,
        '20+': discrepancies.filter(d => d.delta > 20).length,
        'level-only': discrepancies.filter(d => d.delta <= 1 && d.storedLevel !== d.canonicalLevel).length,
    }

    console.log('\n─── Delta Distribution ─────────────────────────────────────\n')
    for (const [range, count] of Object.entries(deltaGroups)) {
        if (count > 0) console.log(`  Δ ${range}: ${count} scans`)
    }

    console.log('\n⚠️  Review discrepancies above before proceeding with any backfill.')
}

audit().catch(e => {
    console.error('Script error:', e)
    process.exit(1)
})
