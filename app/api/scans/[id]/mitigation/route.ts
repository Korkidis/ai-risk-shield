import { createServiceRoleClient } from '@/lib/supabase/server'
import { getCurrentUser, getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

/**
 * POST /api/scans/[id]/mitigation
 *
 * Generate a mitigation report for a completed scan.
 * Uses Gemini to produce structured remediation content matching MitigationReportContent.
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
        provenance_status, risk_profile,
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

        // NOTE: Types are now perfectly synced
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

        // Atomic credit increment — use existing consume_quota RPC or direct update
        const { error: rpcError } = await supabase.rpc('consume_quota', {
            p_tenant_id: tenantId,
            p_amount: 1,
        })
        if (rpcError) {
            // Fallback: direct update if RPC doesn't handle mitigation column
            console.warn('[Mitigation] RPC fallback, using direct update:', rpcError.message)
            await supabase
                .from('tenants')
                .update({ mitigations_used_this_month: used + 1 })
                .eq('id', tenant.id)
        }

        // 5. Create or reuse report row
        let reportId: string

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
                generator_version: '1.0.0',
                generation_inputs: {
                    scan_id: scanId,
                    composite_score: scan.composite_score,
                    risk_level: scan.risk_level,
                    findings_count: Array.isArray(scan.scan_findings) ? scan.scan_findings.length : 0,
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

        // 6. Generate via Gemini — prompt matches MitigationReportContent schema
        const riskProfile = scan.risk_profile as Record<string, unknown> | null
        const findings = Array.isArray(scan.scan_findings) ? scan.scan_findings : []
        const assets = scan.assets as { filename?: string; file_type?: string; file_size?: number } | null

        const findingsSummary = findings
            .map((f: { title?: string | null; severity?: string | null; description?: string | null; finding_type?: string | null; confidence_score?: number | null }) =>
                `- [${f.severity?.toUpperCase() || 'UNKNOWN'}] ${f.finding_type || 'general'}: ${f.title || 'Untitled'} — ${f.description || 'No description'} (confidence: ${f.confidence_score ?? 0}%)`
            )
            .join('\n')

        const prompt = `You are a Chief Risk Mitigation Officer at a digital media compliance firm generating a structured mitigation report.

SCAN CONTEXT:
- Asset: "${assets?.filename || 'Unknown'}" (${assets?.file_type || 'unknown'}, ${assets?.file_size ? Math.round(assets.file_size / 1024) + 'KB' : 'unknown size'})
- Composite Risk Score: ${scan.composite_score || 0}/100
- Risk Level: ${scan.risk_level || 'unknown'}
- IP Risk Score: ${scan.ip_risk_score || 0}/100
- Safety Risk Score: ${scan.safety_risk_score || 0}/100
- Provenance Risk Score: ${scan.provenance_risk_score || 0}/100
- Provenance Status: ${scan.provenance_status || 'missing'}

FINDINGS:
${findingsSummary || 'No specific findings flagged.'}

CHIEF STRATEGY:
${(riskProfile as Record<string, unknown>)?.chief_officer_strategy || 'No strategy available.'}

OUTPUT: Generate a JSON object matching this EXACT schema. Output ONLY valid JSON.

{
  "executive_summary": {
    "decision": "clear|watch|hold|block",
    "confidence": <number 0-100>,
    "approver_level": "analyst|manager|legal|executive",
    "rationale": "<2-3 sentence summary>"
  },
  "asset_context": {
    "filename": "${assets?.filename || 'Unknown'}",
    "type": "${assets?.file_type || 'unknown'}",
    "size": ${assets?.file_size || 0},
    "declared_origin": null,
    "c2pa_chain_status": "${scan.provenance_status || 'missing'}",
    "creator_metadata": null
  },
  "ip_analysis": {
    "severity": "critical|high|medium|low|none",
    "confidence": <number 0-100>,
    "exposures": [{"type": "<type>", "description": "<desc>", "evidence_ref": "scan_finding", "legal_rationale": "<rationale>"}],
    "remediation_status": "required|not_required"
  },
  "safety_analysis": {
    "severity": "critical|high|medium|low|none",
    "confidence": <number 0-100>,
    "exposures": [{"type": "<type>", "description": "<desc>", "evidence_ref": "scan_finding", "legal_rationale": "<rationale>"}],
    "remediation_status": "required|not_required"
  },
  "provenance_analysis": {
    "severity": "critical|high|medium|low|none",
    "confidence": <number 0-100>,
    "exposures": [{"type": "<type>", "description": "<desc>", "evidence_ref": "provenance_check", "legal_rationale": "<rationale>"}],
    "remediation_status": "required|not_required"
  },
  "bias_analysis": {
    "applicable": <boolean>,
    "severity": "<severity or null>",
    "confidence": <number or null>,
    "findings": [],
    "not_applicable_reason": "<reason or null>"
  },
  "guideline_mapping": {
    "guideline_name": null,
    "mappings": []
  },
  "compliance_matrix": {
    "jurisdictions": [{"name": "<jurisdiction>", "source": "inferred", "status": "pass|review|fail|not_applicable", "rationale": "<why>"}],
    "platforms": [{"name": "<platform>", "source": "inferred", "status": "pass|review|fail|not_applicable", "rationale": "<why>"}]
  },
  "mitigation_plan": {
    "actions": [
      {"priority": 1, "domain": "ip|safety|provenance", "action": "<specific action>", "owner": "<role>", "effort": "<time estimate>", "risk_reduction": "<impact>", "verification": "<how to verify>"}
    ]
  },
  "residual_risk": {
    "remaining_risk": "<summary of remaining risk after mitigations>",
    "publish_decision": "approved|conditional|blocked",
    "conditions": ["<condition 1>"],
    "maintenance_checks": ["<periodic check 1>"]
  }
}

Rules:
1. Match the scan data — do NOT invent findings that weren't detected.
2. If a domain score is <25, severity should be "low" or "none".
3. Generate 1-4 mitigation actions, prioritized by risk reduction.
4. compliance_matrix should include 1-3 jurisdictions and 1-2 platforms.
5. Be specific and actionable — this is a paid premium report.
6. Output ONLY the JSON object, no markdown fences or commentary.`

        let reportContent: Record<string, unknown>

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
            const result = await model.generateContent([prompt])
            const text = result.response.text()

            // Parse JSON from response (strip markdown fences if present)
            const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            reportContent = JSON.parse(jsonStr)
        } catch (genError) {
            console.error('[Mitigation] Gemini generation failed:', genError)
            await supabase
                .from('mitigation_reports')
                .update({ status: 'failed', error_message: String((genError as Error).message || 'Generation failed') })
                .eq('id', reportId)

            return NextResponse.json({ code: 'generation_failed', message: 'Report generation failed' }, { status: 500 })
        }

        // 7. Save completed report
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

        // 8. Return completed report
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
