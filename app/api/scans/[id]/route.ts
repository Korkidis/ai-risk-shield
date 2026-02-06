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

        // Fetch scan with risk scores and findings
        const { data, error } = await supabase
            .from('scans')
            .select(`
                id,
                created_at,
                composite_score,
                ip_risk_score,
                safety_risk_score,
                provenance_risk_score,
                risk_level,
                provenance_data,
                scan_findings(*),
                assets (
                    filename,
                    file_type,
                    mime_type,
                    file_size
                )
            `)
            .eq('id', params.id)
            .single()

        if (error || !data) {
            console.error('Database error fetching scan:', error)
            return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
        }

        const scan = data as any;

        // Reconstruct RiskProfile for frontend compatibility
        // The DB stores individual scores, but frontend/PDF expects a nested 'risk_profile' object

        const getTeaser = (type: string) => {
            // Find critical findings first
            const critical = scan.scan_findings?.find((f: any) => f.finding_type?.startsWith(type) && f.severity === 'critical')
            if (critical) return critical.title

            const high = scan.scan_findings?.find((f: any) => f.finding_type?.startsWith(type) && f.severity === 'high')
            if (high) return high.title

            return 'No significant risks detected.'
        }

        const riskProfile = {
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
            c2pa_report: scan.provenance_data || { status: 'missing' },
            chief_officer_strategy: "Automated analysis indicates legal review may be required for identified high-risk elements."
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
