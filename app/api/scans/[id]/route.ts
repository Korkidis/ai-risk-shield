import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

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
                file_size
            )
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

            data = fallback.data
            error = fallback.error
        }

        // Check Access
        const { getOrCreateSessionId } = await import('@/lib/session')
        const sessionId = await getOrCreateSessionId()

        // Check Auth User
        const authClient = await createClient()
        const { data: { user } } = await authClient.auth.getUser()

        let isAuthorized = false

        if (error || !data) {
            console.error('Database error fetching scan:', error)
            return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
        }

        const scan = data as any

        // Authorization Logic
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
                console.log(`[AuthDebug] Tenant mismatch: User ${userTenantId} vs Scan ${scan.tenant_id} `)
            }
        }

        // 3. User Match (Direct user assignment)
        if (user && scan.analyzed_by === user.id) {
            isAuthorized = true
        } else if (user) {
            console.log(`[AuthDebug] User mismatch: User ${user.id} vs Scan AnalyzedBy ${scan.analyzed_by} `)
        }

        if (!isAuthorized) {
            console.warn(`[AuthDebug] 403 Access Denied.ScanId: ${params.id}, User: ${user?.id}, Session: ${sessionId} `)
            return NextResponse.json({ error: 'Unauthorized access to scan' }, { status: 403 })
        }

        // If the stored risk_profile blob exists, return it directly.
        // This preserves the full Gemini multi-persona analysis (teasers, reasoning, etc.)
        // Only fall back to reconstruction for legacy scans that predate blob storage.
        let riskProfile: any;

        if (scan.risk_profile) {
            // Rich path: stored blob from analyzeImageMultiPersona
            riskProfile = scan.risk_profile

            // SOFT GATE: Mask sensitive details if anonymous & no email captured
            // Allow full access if user is authenticated OR email is already associated
            const isFullyUnlocked = (user && isAuthorized) || (scan.email && scan.email.length > 0)

            if (!isFullyUnlocked) {
                // Mask sensitive fields
                riskProfile = {
                    ...riskProfile,
                    chief_officer_strategy: "Analysis complete. Unlock full report to view strategic mitigation steps.",
                    ip_report: { ...riskProfile.ip_report, reasoning: "Unlock to view detailed reasoning." },
                    safety_report: { ...riskProfile.safety_report, reasoning: "Unlock to view safety details." },
                    // Hide raw manifest details?
                    c2pa_report: { ...riskProfile.c2pa_report, raw_manifest: undefined, history: undefined }
                }
                // Mask findings (don't send them at all in scan_findings relation?)
                // scan.scan_findings = [] // Or filtered
            }
        } else {
            // Legacy fallback: reconstruct from individual columns
            const getTeaser = (type: string) => {
                const critical = scan.scan_findings?.find((f: any) => f.finding_type?.startsWith(type) && f.severity === 'critical')
                if (critical) return critical.title

                const high = scan.scan_findings?.find((f: any) => f.finding_type?.startsWith(type) && f.severity === 'high')
                if (high) return high.title

                return 'No significant risks detected.'
            }

            riskProfile = {
                composite_score: scan.composite_score || 0,
                verdict: (scan.risk_level === 'critical' ? 'Critical Risk' :
                    scan.risk_level === 'high' ? 'High Risk' :
                        scan.risk_level === 'review' ? 'Medium Risk' :
                            scan.risk_level === 'caution' ? 'Low Risk' : 'Low Risk') as any,
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

        return NextResponse.json({
            ...scan,
            risk_profile: riskProfile
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

        const updateData: Record<string, any> = {}

        if (action === 'share') {
            // Generate share token valid for 7 days
            updateData.share_token = uuidv4()
            updateData.share_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        } else {
            // General update
            if (notes !== undefined) updateData.notes = notes
            if (tags !== undefined) updateData.tags = tags
        }

        const { data: updatedScan, error: updateError } = await (supabase
            .from('scans') as any)
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
