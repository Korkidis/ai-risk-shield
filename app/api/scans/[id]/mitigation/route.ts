import { createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentUser, getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'
import { generateMitigationReport, getGeneratorVersion } from '@/lib/ai/mitigation-generator'

/**
 * POST /api/scans/[id]/mitigation
 *
 * Generate a mitigation report for a completed scan.
 * Uses extracted `generateMitigationReport()` from lib/ai/mitigation-generator.ts (Sprint 10.9).
 *
 * Response contract:
 *   { code: string, message: string, report?: MitigationRow, cached?: boolean, creditsRemaining?: number }
 *
 * Status codes:
 *   200 — report returned (new or cached)
 *   202 — report already processing (idempotent double-click guard)
 *   400 — scan not complete
 *   402 — credits exhausted, purchase required
 *   500 — generation or server error
 */
export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: scanId } = await params
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ code: 'unauthorized', message: 'Authentication required' }, { status: 401 })
        }

        const tenantId = await getTenantId()
        const supabase = await createServiceRoleClient()

        // 1. Load scan with risk_profile and findings
        const { data: scan, error: scanError } = await supabase
            .from('scans')
            .select(`
        id, status, tenant_id, composite_score, risk_level,
        ip_risk_score, safety_risk_score, provenance_risk_score,
        provenance_status, risk_profile, guideline_id,
        scan_findings(id, title, severity, finding_type, description, recommendation, confidence_score),
        assets(filename, file_type, file_size)
      `)
            .eq('id', scanId)
            .single()

        if (scanError || !scan) {
            return NextResponse.json({ code: 'not_found', message: 'Scan not found' }, { status: 404 })
        }

        // 2. Authorization + status checks
        if (scan.tenant_id !== tenantId) {
            return NextResponse.json({ code: 'forbidden', message: 'Access denied' }, { status: 403 })
        }
        if (scan.status !== 'complete') {
            return NextResponse.json({ code: 'scan_incomplete', message: 'Scan must be complete before generating mitigation report' }, { status: 400 })
        }

        // 3. Check for existing report (idempotency)
        const { data: existingReport } = await supabase
            .from('mitigation_reports')
            .select('id, status, report_content, report_version, created_at, completed_at, error_message')
            .eq('scan_id', scanId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (existingReport) {
            if (existingReport.status === 'complete') {
                return NextResponse.json({
                    code: 'success',
                    message: 'Mitigation report ready',
                    report: existingReport,
                    cached: true,
                })
            }
            if (existingReport.status === 'processing' || existingReport.status === 'pending') {
                return NextResponse.json({
                    code: 'processing',
                    message: 'Mitigation report is already being generated',
                    report: existingReport,
                }, { status: 202 })
            }
            // If failed, allow retry — fall through
        }

        // 4. Credit check
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id, plan, monthly_mitigation_limit, mitigations_used_this_month')
            .eq('id', tenantId)
            .single()

        if (!tenant) {
            return NextResponse.json({ code: 'not_found', message: 'Tenant not found' }, { status: 404 })
        }

        const limit = tenant.monthly_mitigation_limit ?? 0
        const used = tenant.mitigations_used_this_month ?? 0

        if (used >= limit) {
            return NextResponse.json({
                code: 'purchase_required',
                message: 'Mitigation credits exhausted',
                creditsRemaining: 0,
            }, { status: 402 })
        }

        // Atomic credit decrement via dedicated RPC (prevents race conditions)
        const { error: rpcError } = await supabase.rpc('increment_tenant_mitigation_usage', {
            p_tenant_id: tenantId,
            p_amount: 1,
        })
        if (rpcError) {
            console.error('[Mitigation] Failed to decrement credits:', rpcError.message)
            return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 })
        }

        // 5. Create or reuse report row
        let reportId: string
        const findings = Array.isArray(scan.scan_findings) ? scan.scan_findings : []

        if (existingReport && existingReport.status === 'failed') {
            // Reuse failed row for retry
            await supabase
                .from('mitigation_reports')
                .update({ status: 'processing', error_message: null })
                .eq('id', existingReport.id)
            reportId = existingReport.id
        } else {
            const insertPayload = {
                scan_id: scanId,
                tenant_id: tenantId,
                advice_content: '', // Required by current schema, will contain report summary
                status: 'processing',
                created_by: user.id,
                report_version: 1,
                generator_version: getGeneratorVersion(),
                generation_inputs: {
                    scan_id: scanId,
                    composite_score: scan.composite_score,
                    risk_level: scan.risk_level,
                    findings_count: findings.length,
                },
            }

            const { data: newRow, error: insertError } = await supabase
                .from('mitigation_reports')
                .insert(insertPayload)
                .select('id')
                .single()

            if (insertError || !newRow) {
                console.error('[Mitigation] Failed to create report row:', insertError)
                return NextResponse.json({ code: 'server_error', message: 'Failed to initialize report' }, { status: 500 })
            }
            reportId = newRow.id
        }

        // 6. Fetch brand guideline if present (for compliance matrix)
        let guideline: { name: string; prohibitions?: string[] | null; requirements?: string[] | null; target_markets?: string[] | null; target_platforms?: string[] | null } | null = null
        if (scan.guideline_id) {
            const { data: gl } = await supabase
                .from('brand_guidelines')
                .select('name, prohibitions, requirements, target_markets, target_platforms')
                .eq('id', scan.guideline_id)
                .single()
            if (gl) guideline = gl
        }

        // 7. Generate via extracted lib (Sprint 10.9)
        const assets = scan.assets as { filename?: string; file_type?: string; file_size?: number } | null

        let reportContent: Record<string, unknown>

        try {
            reportContent = await generateMitigationReport({
                scan: {
                    composite_score: scan.composite_score,
                    risk_level: scan.risk_level,
                    ip_risk_score: scan.ip_risk_score,
                    safety_risk_score: scan.safety_risk_score,
                    provenance_risk_score: scan.provenance_risk_score,
                    provenance_status: scan.provenance_status,
                },
                asset: assets ? {
                    filename: assets.filename || 'Unknown',
                    file_type: assets.file_type || 'unknown',
                    file_size: assets.file_size || 0,
                } : null,
                findings,
                riskProfile: scan.risk_profile as Record<string, unknown> | null,
                guideline,
            }) as unknown as Record<string, unknown>
        } catch (genError) {
            console.error('[Mitigation] Generation failed:', genError)
            await supabase
                .from('mitigation_reports')
                .update({ status: 'failed', error_message: String((genError as Error).message || 'Generation failed') })
                .eq('id', reportId)

            return NextResponse.json({ code: 'generation_failed', message: 'Report generation failed' }, { status: 500 })
        }

        // 8. Save completed report
        const now = new Date().toISOString()
        await supabase
            .from('mitigation_reports')
            .update({
                status: 'complete',
                advice_content: (reportContent as { executive_summary?: { rationale?: string } })?.executive_summary?.rationale || 'Mitigation report generated',
                report_content: { ...reportContent, generated_at: now },
                completed_at: now,
            })
            .eq('id', reportId)

        // 9. Return completed report
        const { data: rawCompleted } = await supabase
            .from('mitigation_reports')
            .select('id, status, report_content, report_version, created_at, completed_at')
            .eq('id', reportId)
            .single()

        return NextResponse.json({
            code: 'success',
            message: 'Mitigation report generated',
            report: rawCompleted,
            cached: false,
            creditsRemaining: Math.max(0, limit - used - 1),
        })

    } catch (error) {
        console.error('[Mitigation] Unexpected error:', error)
        return NextResponse.json({ code: 'server_error', message: 'Internal server error' }, { status: 500 })
    }
}
