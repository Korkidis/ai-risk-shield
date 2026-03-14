import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/scans/[id]/frames
 *
 * Returns video frame analysis results with signed URLs for frame thumbnails.
 * Auth: same-tenant match, session match, or valid share token.
 */
export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const scanId = params.id
        const supabase = await createServiceRoleClient()

        // 1. Fetch scan to validate access
        const { data: scan, error: scanError } = await supabase
            .from('scans')
            .select('id, tenant_id, session_id, share_token, share_expires_at, is_video, highest_risk_frame')
            .eq('id', scanId)
            .single()

        if (scanError || !scan) {
            return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
        }

        if (!scan.is_video) {
            return NextResponse.json({ error: 'Scan is not a video' }, { status: 400 })
        }

        // 2. Authorization (mirrors scans/[id]/route.ts pattern)
        let isAuthorized = false

        // Share token access
        const tokenParam = _req.nextUrl.searchParams.get('token')
        if (tokenParam && scan.share_token === tokenParam) {
            const expiresAt = scan.share_expires_at ? new Date(scan.share_expires_at) : null
            if (expiresAt && expiresAt > new Date()) {
                isAuthorized = true
            }
        }

        // Session match (anonymous creator)
        if (!isAuthorized) {
            const { getOrCreateSessionId } = await import('@/lib/session')
            const sessionId = await getOrCreateSessionId()
            if (scan.session_id && scan.session_id === sessionId) {
                isAuthorized = true
            }
        }

        // Tenant match (authenticated user)
        if (!isAuthorized) {
            const authClient = await createClient()
            const { data: { user } } = await authClient.auth.getUser()
            if (user && scan.tenant_id) {
                const userTenantId = await getTenantId().catch(() => null)
                if (userTenantId === scan.tenant_id) {
                    isAuthorized = true
                }
            }
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // 3. Fetch video frames
        const { data: frames, error: framesError } = await supabase
            .from('video_frames')
            .select('id, frame_number, timestamp_ms, storage_path, ip_risk_score, safety_risk_score, composite_score')
            .eq('scan_id', scanId)
            .order('frame_number', { ascending: true })

        if (framesError) {
            console.error('Error fetching video frames:', framesError)
            return NextResponse.json({ error: 'Failed to load frame data' }, { status: 500 })
        }

        // 4. Generate signed URLs for frame thumbnails (60-minute expiry)
        const framesWithUrls = await Promise.all(
            (frames || []).map(async (frame) => {
                let signedUrl: string | null = null
                if (frame.storage_path && !frame.storage_path.startsWith('temp_')) {
                    const { data: urlData } = await supabase.storage
                        .from('uploads')
                        .createSignedUrl(frame.storage_path, 3600) // 60 min
                    signedUrl = urlData?.signedUrl || null
                }

                return {
                    frameNumber: frame.frame_number,
                    timestampMs: frame.timestamp_ms,
                    compositeScore: frame.composite_score,
                    ipScore: frame.ip_risk_score,
                    safetyScore: frame.safety_risk_score,
                    signedUrl,
                }
            })
        )

        return NextResponse.json({
            frames: framesWithUrls,
            highestRiskFrame: scan.highest_risk_frame,
            totalFrames: framesWithUrls.length,
        })
    } catch (error) {
        console.error('Frames API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
