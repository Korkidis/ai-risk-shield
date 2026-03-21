import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * Shape of scan data returned by our dynamic select + joins.
 * Supabase can't statically infer types from template-literal select strings,
 * so we define the expected shape here and cast after the null check.
 */
type ScanApiResult = {
    id: string
    created_at: string
    tenant_id: string | null
    analyzed_by: string | null
    session_id: string | null
    email: string | null
    email_captured_at: string | null
    composite_score: number | null
    ip_risk_score: number | null
    safety_risk_score: number | null
    provenance_risk_score: number | null
    risk_level: string | null
    provenance_status: string | null
    provenance_data: Record<string, unknown> | null
    status: string
    share_token: string | null
    share_expires_at: string | null
    risk_profile?: Record<string, unknown> | null
    scan_findings: Array<{
        id: string
        title: string | null
        severity: string | null
        finding_type: string | null
        description: string | null
        confidence_score: number | null
    }>
    assets: {
        filename: string | null
        file_type: string | null
        mime_type: string | null
        file_size: number | null
        storage_path: string | null
    } | null
    provenance_details: Array<{
        id: string
        signature_status: string
        creator_name: string | null
        creation_tool: string | null
        creation_tool_version: string | null
        creation_timestamp: string | null
        certificate_issuer: string | null
        certificate_serial: string | null
        hashing_algorithm: string | null
        edit_history: unknown[] | null
        raw_manifest: unknown | null
        created_at: string
    }>
    mitigation_reports: Array<{
        id: string
        advice_content?: string
        status?: string
        report_content?: unknown | null
        report_version?: number
        generator_version?: string
        completed_at?: string | null
        error_message?: string | null
        created_at: string
    }>
}

/**
 * GET /api/scans/[id]
 * Fetch scan results (public access for magic link verified users)
 */
export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const supabase = await createServiceRoleClient()
        const baseSelect = `
            id,
            created_at,
            tenant_id,
            analyzed_by,
            session_id,
            email,
            email_captured_at,
            composite_score,
            ip_risk_score,
            safety_risk_score,
            provenance_risk_score,
            risk_level,
            provenance_status,
            provenance_data,
            scan_findings(*),
            assets (
                filename,
                file_type,
                mime_type,
                file_size,
                storage_path
            ),
            provenance_details(*),
            mitigation_reports(*),
            share_token,
            share_expires_at,
            status
        `

        // Fetch scan with risk scores, findings, and the stored risk_profile blob
        // NOTE: risk_profile may not exist yet in older DBs. We retry without it if needed.
        let { data, error } = await supabase
            .from('scans')
            .select(`${baseSelect}, risk_profile`)
            .eq('id', params.id)
            .single()

        if (error && error.code !== 'PGRST116') {
            console.warn('Retrying scan fetch without risk_profile blob due to error:', error.message)
            const fallback = await supabase
                .from('scans')
                .select(baseSelect)
                .eq('id', params.id)
                .single()

            data = fallback.data as typeof data
            error = fallback.error
        }

        // Check Access
        const { getOrCreateSessionId } = await import('@/lib/session')
        const sessionId = await getOrCreateSessionId()

        // Check Auth User
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        let isAuthorized = false

        if (error) {
            console.error('Database error fetching scan:', error)
            return NextResponse.json({ error: 'Failed to load scan data' }, { status: 500 })
        }

        if (!data) {
            return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
        }

        // Dynamic select means Supabase can't statically infer join types.
        // Cast to our locally-defined ScanApiResult shape.
        const scan = data as unknown as ScanApiResult

        // Authorization Logic
        // 0. Share Token Access (public, no auth required)
        const tokenParam = _req.nextUrl.searchParams.get('token')
        if (tokenParam && scan.share_token === tokenParam) {
            const expiresAt = scan.share_expires_at ? new Date(scan.share_expires_at) : null
            if (expiresAt && expiresAt > new Date()) {
                isAuthorized = true
            }
        }

        // 1. Session Match (Anonymous creator)
        if (scan.session_id && scan.session_id === sessionId) {
            isAuthorized = true
        }

        // 2. Tenant Match (Authenticated User)
        if (user && scan.tenant_id) {
            const userTenantId = await getTenantId().catch(() => null)
            if (userTenantId === scan.tenant_id) {
                isAuthorized = true
            } else {
                console.log('[AuthDebug] Tenant mismatch on scan access')
            }
        }

        // 3. User Match (Direct user assignment)
        if (user && scan.analyzed_by === user.id) {
            isAuthorized = true
        } else if (user) {
            console.log('[AuthDebug] User mismatch on scan access')
        }

        if (!isAuthorized) {
            console.warn('[AuthDebug] 403 Access Denied on scan access')
            return NextResponse.json({ error: 'Unauthorized access to scan' }, { status: 403 })
        }

        // If the stored risk_profile blob exists, return it directly.
        // This preserves the full Gemini multi-persona analysis (teasers, reasoning, etc.)
        // Only fall back to reconstruction for legacy scans that predate blob storage.
        // riskProfile is a JSON blob built for the API response — may come from DB or be constructed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic JSON blob from Supabase
        let riskProfile: Record<string, any>;
        let responseFindingsOverride: ScanApiResult['scan_findings'] | undefined;

        if (scan.risk_profile) {
            // Rich path: stored blob from analyzeImageMultiPersona
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic JSON blob from Supabase
            riskProfile = scan.risk_profile as Record<string, any>

            // SOFT GATE: Mask sensitive details if anonymous & no email captured
            // Allow full access if user is authenticated OR email is already associated
            const isFullyUnlocked = (user && isAuthorized) || !!scan.email_captured_at

            if (!isFullyUnlocked) {
                // Mask sensitive fields
                riskProfile = {
                    ...riskProfile,
                    chief_officer_strategy: "Analysis complete. Unlock full report to view strategic mitigation steps.",
                    ip_report: { ...riskProfile.ip_report, reasoning: "Unlock to view detailed reasoning." },
                    safety_report: { ...riskProfile.safety_report, reasoning: "Unlock to view safety details." },
                    provenance_report: { ...riskProfile.provenance_report, reasoning: "Unlock to view provenance details." },
                    c2pa_report: { ...riskProfile.c2pa_report, raw_manifest: undefined, history: undefined }
                }
                // Strip detailed findings — only titles/severity visible, descriptions hidden
                responseFindingsOverride = (scan.scan_findings || []).map((f) => ({
                    id: f.id,
                    title: f.title,
                    severity: f.severity,
                    finding_type: f.finding_type,
                    description: 'Unlock full report to view details.',
                    confidence_score: f.confidence_score,
                }))
            }
        } else {
            // Legacy fallback: reconstruct from individual columns
            const getTeaser = (type: string) => {
                const critical = scan.scan_findings?.find(f => f.finding_type?.startsWith(type) && f.severity === 'critical')
                if (critical) return critical.title

                const high = scan.scan_findings?.find(f => f.finding_type?.startsWith(type) && f.severity === 'high')
                if (high) return high.title

                return 'No significant risks detected.'
            }

            riskProfile = {
                composite_score: scan.composite_score || 0,
                verdict: (scan.risk_level === 'critical' ? 'Critical Risk' :
                    scan.risk_level === 'high' ? 'High Risk' :
                        scan.risk_level === 'review' ? 'Medium Risk' :
                            scan.risk_level === 'caution' ? 'Low Risk' : 'Low Risk'),
                ip_report: {
                    score: scan.ip_risk_score || 0,
                    teaser: getTeaser('ip'),
                    reasoning: "Analysis based on visual matching and database cross-referencing."
                },
                safety_report: {
                    score: scan.safety_risk_score || 0,
                    teaser: getTeaser('safety'),
                    reasoning: "Checked against major ad platform content safety guidelines."
                },
                provenance_report: {
                    score: scan.provenance_risk_score || 0,
                    teaser: "Provenance analysis",
                    reasoning: "Digital signature verification."
                },
                c2pa_report: {
                    ...(scan.provenance_data || {}),
                    status: scan.provenance_data?.status || scan.provenance_status || 'missing'
                },
                chief_officer_strategy: "Automated analysis indicates legal review may be required for identified high-risk elements."
            }
        }

        // Generate signed URL for asset preview
        let assetUrl = null
        if (scan.assets?.storage_path) {
            const { data: signedData } = await supabase.storage
                .from('uploads')
                .createSignedUrl(scan.assets.storage_path, 3600) // 1 hour
            assetUrl = signedData?.signedUrl || null
        }

        // Strip share_token from response (don't leak to clients)
        const { share_token: _shareToken, share_expires_at: _shareExpires, scan_findings: _findings, provenance_details: _prov, mitigation_reports: _mitigations, ...scanResponse } = scan
        // _shareToken and _shareExpires intentionally destructured and discarded to strip from response
        void _shareToken; void _shareExpires;

        // Normalize provenance_details: array from join → single object (or null)
        const provenanceDetails = Array.isArray(_prov) && _prov.length > 0 ? _prov[0] : null

        // Sort mitigation_reports by created_at desc, return all for history
        const mitigationReports = Array.isArray(_mitigations)
            ? _mitigations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            : []

        return NextResponse.json({
            ...scanResponse,
            scan_findings: responseFindingsOverride || _findings || [],
            risk_profile: riskProfile,
            asset_url: assetUrl,
            provenance_details: provenanceDetails,
            mitigation_reports: mitigationReports,
        })
    } catch (error) {
        console.error('Failed to fetch scan:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}


export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const tenantId = await getTenantId()
        const supabase = await createClient()
        const body = await req.json()
        const { notes, tags, action } = body

        // 1. Check if scan exists and belongs to tenant
        const { data: scan, error: fetchError } = await supabase
            .from('scans')
            .select('id')
            .eq('id', params.id)
            .eq('tenant_id', tenantId)
            .single()

        if (fetchError || !scan) {
            return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
        }

        const updateData: Record<string, string | string[]> = {}

        if (action === 'share') {
            // Generate share token valid for 7 days
            updateData.share_token = uuidv4()
            updateData.share_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        } else {
            // General update
            if (notes !== undefined) updateData.notes = notes
            if (tags !== undefined) updateData.tags = tags
        }

        const { data: updatedScan, error: updateError } = await supabase
            .from('scans')
            .update(updateData)
            .eq('id', params.id)
            .select()
            .single()

        if (updateError) {
            console.error('Update failed:', updateError)
            return NextResponse.json({ error: 'Failed to update scan' }, { status: 500 })
        }

        return NextResponse.json({ scan: updatedScan })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const tenantId = await getTenantId()
        const supabase = await createClient()

        const { error } = await supabase
            .from('scans')
            .delete()
            .eq('id', params.id)
            .eq('tenant_id', tenantId)

        if (error) {
            console.error('Delete failed:', error)
            return NextResponse.json({ error: 'Failed to delete scan' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
