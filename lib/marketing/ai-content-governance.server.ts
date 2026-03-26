import 'server-only'

/**
 * Server-only live governance data fetchers.
 *
 * Separated from ai-content-governance.ts because that module is imported
 * by client components (help page, MarketExposure). These fetchers use
 * lib/governance/query.ts → lib/supabase/admin.ts which cannot enter a
 * client bundle.
 *
 * Import from '@/lib/marketing/ai-content-governance.server' in Server
 * Components only (e.g., app/ai-content-governance/page.tsx).
 */

import type { RiskWatchItem } from './ai-content-governance'
import { riskIndexSnapshot, riskWatchItems, policySignals } from './ai-content-governance'

// ─── DB → RiskWatchItem normalization ────────────────────────────────────────

function normalizePrecedentCategory(caseType: string): RiskWatchItem['category'] {
    switch (caseType) {
        case 'settlement': return 'settlement'
        case 'litigation':
        case 'ruling': return 'litigation'
        case 'enforcement': return 'market'
        case 'advisory':
        default: return 'standard'
    }
}

function normalizePrecedentStatus(caseType: string): string {
    switch (caseType) {
        case 'settlement': return 'proposed'
        case 'litigation': return 'active'
        case 'ruling': return 'decided'
        case 'enforcement': return 'active'
        case 'advisory': return 'released'
        default: return 'tracked'
    }
}

// ─── Live Governance Data (DB-backed with hardcoded fallback) ───────────────

/**
 * Get live risk index snapshot from governance DB.
 * Falls back to hardcoded riskIndexSnapshot if DB unavailable.
 */
export async function getLiveRiskIndexSnapshot(): Promise<typeof riskIndexSnapshot> {
    try {
        const { getGovernanceStats } = await import('@/lib/governance/query')
        const stats = await getGovernanceStats()

        return {
            asOf: new Date().toISOString().split('T')[0],
            knownSettlementTotalUsd: stats.totalFinancialExposure || riskIndexSnapshot.knownSettlementTotalUsd,
            trackedCaseCountLabel: stats.trackedCaseCount > 0 ? `${stats.trackedCaseCount}+` : riskIndexSnapshot.trackedCaseCountLabel,
            trackedCaseCountContext: `AI and copyright cases tracked in governance database, including settlements, rulings, and enforcement actions.`,
            recentFilingsLabel: riskIndexSnapshot.recentFilingsLabel,
            recentFilingsContext: riskIndexSnapshot.recentFilingsContext,
            standardsAdoptionLabel: riskIndexSnapshot.standardsAdoptionLabel,
            standardsAdoptionContext: riskIndexSnapshot.standardsAdoptionContext,
            sourceCount: stats.totalPolicies + stats.totalPrecedents,
            methodology: riskIndexSnapshot.methodology,
        }
    } catch {
        return riskIndexSnapshot
    }
}

/**
 * Get live risk watch items from governance DB precedents.
 * Merges DB precedents with hardcoded items, deduplicating by case_ref/title.
 */
export async function getLiveRiskWatchItems(): Promise<RiskWatchItem[]> {
    try {
        const { getPrecedentsForHub } = await import('@/lib/governance/query')
        const dbPrecedents = await getPrecedentsForHub(15)

        if (dbPrecedents.length === 0) return riskWatchItems

        const dbItems: RiskWatchItem[] = dbPrecedents.map(p => ({
            title: p.case_ref,
            date: p.date,
            category: normalizePrecedentCategory(p.case_type),
            status: normalizePrecedentStatus(p.case_type),
            summary: p.summary,
            sourceLabel: 'Governance Database',
            sourceUrl: p.source_url || '',
        }))

        const dbTitles = new Set(dbItems.map(i => i.title.toLowerCase()))
        const uniqueHardcoded = riskWatchItems.filter(
            item => !dbTitles.has(item.title.toLowerCase())
        )

        return [...dbItems, ...uniqueHardcoded].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    } catch {
        return riskWatchItems
    }
}

/**
 * Get live policy signals from governance DB.
 * Falls back to hardcoded policySignals if DB unavailable.
 */
export async function getLivePolicySignals(): Promise<RiskWatchItem[]> {
    try {
        const { getPolicySignalsForHub } = await import('@/lib/governance/query')
        const dbPolicies = await getPolicySignalsForHub()

        if (dbPolicies.length === 0) return policySignals

        const dbSignals: RiskWatchItem[] = dbPolicies
            .filter(p => p.authority && p.authority.length > 0)
            .slice(0, 10)
            .map(p => ({
                title: p.authority,
                date: p.effective_date || p.created_at.split('T')[0],
                category: 'standard' as const,
                status: p.expiry_date ? 'active' : 'enacted',
                summary: p.rule_text,
                sourceLabel: p.scope_value,
                sourceUrl: p.authority_url || '',
            }))

        const dbTitles = new Set(dbSignals.map(s => s.title.toLowerCase()))
        const uniqueHardcoded = policySignals.filter(
            s => !dbTitles.has(s.title.toLowerCase())
        )

        return [...dbSignals, ...uniqueHardcoded].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
    } catch {
        return policySignals
    }
}
