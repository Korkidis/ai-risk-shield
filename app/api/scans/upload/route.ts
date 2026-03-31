
import { NextResponse, after } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId, requireAuth } from '@/lib/supabase/auth'
import { createHash } from 'crypto'
import { checkRateLimit } from '@/lib/ratelimit'
import { getPlan, type PlanId } from '@/lib/plans'
import { detectFileType } from '@/lib/file-validation'
// FFmpeg is dynamically imported only when processing video (avoids bundling ~70MB binary for image uploads)
// import { getVideoDuration } from '@/lib/video/processor'

/**
 * POST /api/scans/upload
 *
 * Authenticated file upload for dashboard users
 * Creates asset + scan linked to tenant
 */
export async function POST(request: Request) {
    try {
        const user = await requireAuth()
        const tenantId = await getTenantId()

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized: No Linked Tenant' }, { status: 401 })
        }

        // Rate limit: 10 uploads per minute per tenant (burst protection)
        const rl = await checkRateLimit({ action: 'upload', key: tenantId, maxAttempts: 10, windowSeconds: 60 })
        if (!rl.allowed) {
            return NextResponse.json(
                { error: 'Upload rate limit exceeded. Please wait before uploading again.' },
                { status: 429, headers: { 'Retry-After': String(rl.retryAfter || 10) } }
            )
        }

        const formData = await request.formData()
        const file = formData.get('file') as File
        const guidelineId = formData.get('guidelineId') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file size (100MB for images, 250MB for videos — memory safety)
        const MAX_IMAGE_SIZE = 100 * 1024 * 1024
        const MAX_VIDEO_SIZE = 250 * 1024 * 1024
        const sizeLimit = file.type.startsWith('video/') ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
        if (file.size > sizeLimit) {
            return NextResponse.json({
                error: 'File too large',
                details: `Maximum file size is ${sizeLimit / (1024 * 1024)}MB`
            }, { status: 413 })
        }

        // Validate file type
        const isImage = file.type.startsWith('image/')
        const isVideo = file.type.startsWith('video/')

        if (!isImage && !isVideo) {
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
        }

        const fileType = isImage ? 'image' : 'video'

        const supabase = await createClient()

        // 1. Check Usage Quota
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('monthly_scan_limit, scans_used_this_month, plan, retention_days')
            .eq('id', tenantId)
            .single() as unknown as { data: { monthly_scan_limit: number; scans_used_this_month: number; plan: string; retention_days: number } | null, error: { message?: string } | null }

        if (tenantError || !tenant) {
            console.error('Tenant fetch error:', tenantError)
            return NextResponse.json({ error: 'Failed to fetch tenant usage' }, { status: 500 })
        }

        const limit = tenant.monthly_scan_limit || 3 // Default low limit if missing
        const used = tenant.scans_used_this_month || 0
        const plan = tenant.plan || 'free'
        const retentionDays = tenant.retention_days || 7 // Default 7 days
        const isOverage = used >= limit

        // Video uploads require a paid plan
        if (isVideo && plan === 'free') {
            return NextResponse.json({
                error: 'Video analysis requires a paid plan',
                code: 'VIDEO_REQUIRES_PAID'
            }, { status: 403 })
        }

        // Read file buffer once (used for duration check, checksum, and upload)
        const fileBuffer = Buffer.from(await file.arrayBuffer())

        // Server-side file type validation (don't trust client MIME)
        const detected = detectFileType(fileBuffer)
        if (!detected) {
            return NextResponse.json({ error: 'Unrecognized file format' }, { status: 400 })
        }
        if (detected.category !== fileType) {
            return NextResponse.json({ error: 'File content does not match declared type' }, { status: 400 })
        }
        // Use server-detected MIME for storage and DB (overrides client-supplied)
        const trustedMime = detected.mime

        // Video duration enforcement (plan-tier limits)
        if (isVideo) {
            const planConfig = getPlan(plan as PlanId)
            if (planConfig.videoMaxDurationSeconds === 0) {
                return NextResponse.json({
                    error: 'Video analysis is not available on your current plan',
                    code: 'VIDEO_NOT_AVAILABLE'
                }, { status: 403 })
            }

            try {
                const { getVideoDuration } = await import('@/lib/video/processor')
                const duration = await getVideoDuration(fileBuffer, trustedMime)
                if (duration > planConfig.videoMaxDurationSeconds) {
                    return NextResponse.json({
                        error: `Video duration (${duration}s) exceeds your plan limit (${planConfig.videoMaxDurationSeconds}s). Upgrade for longer video support.`,
                        code: 'VIDEO_DURATION_EXCEEDED',
                        duration,
                        limit: planConfig.videoMaxDurationSeconds,
                    }, { status: 413 })
                }
            } catch (durationError) {
                console.error('Video duration check failed:', durationError)
                // If we can't determine duration, allow the upload but cap frame extraction
                // The scan processor will handle frame limits
            }
        }

        // Block FREE users at limit - paid plans can proceed with overage
        if (isOverage && plan === 'free') {
            return NextResponse.json({
                error: 'Monthly scan limit reached'
            }, { status: 403 })
        }

        // Calculate deletion date
        const deleteAfter = new Date()
        deleteAfter.setDate(deleteAfter.getDate() + retentionDays)
        const sha256Checksum = createHash('sha256').update(fileBuffer).digest('hex')

        // Use service role client for storage (bypasses RLS folder restrictions)
        const adminClient = await createServiceRoleClient()

        // Upload to storage with tenant-based path
        const fileName = `${tenantId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('uploads')
            .upload(fileName, fileBuffer, {
                cacheControl: '3600',
                upsert: false,
                contentType: trustedMime,
            })

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError)
            return NextResponse.json({
                error: 'Upload failed'
            }, { status: 500 })
        }

        // Create asset record
        const assetData = {
            tenant_id: tenantId,
            filename: file.name,
            file_type: fileType,
            mime_type: trustedMime,
            file_size: file.size,
            storage_path: uploadData.path,
            storage_bucket: 'uploads',
            sha256_checksum: sha256Checksum,
            uploaded_by: user.id,
            delete_after: deleteAfter.toISOString()
        }

        const { data: asset, error: assetError } = await supabase
            .from('assets')
            .insert(assetData)
            .select()
            .single()

        if (assetError) {
            console.error('Asset creation error:', assetError)
            // Rollback storage upload? (Optional but recommended)
            await adminClient.storage.from('uploads').remove([uploadData.path])

            return NextResponse.json({
                error: 'Failed to create asset'
            }, { status: 500 })
        }

        // Validate brand guideline if provided (tenant-scoped, UUID format check)
        const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        let validatedGuidelineId: string | null = null
        let guidelineWarning: string | undefined
        if (guidelineId && guidelineId !== 'default' && UUID_REGEX.test(guidelineId)) {
            const { data: guideline } = await supabase
                .from('brand_guidelines')
                .select('id')
                .eq('id', guidelineId)
                .eq('tenant_id', tenantId)
                .single() as unknown as { data: { id: string } | null }
            if (guideline) {
                validatedGuidelineId = guideline.id
            } else {
                guidelineWarning = 'Requested brand guideline not found. Scan processed without custom rules.'
                console.warn(`[Upload] Brand guideline ${guidelineId} not found for tenant ${tenantId}`)
            }
        }

        // Create scan record
        const scanData = {
            tenant_id: tenantId,
            asset_id: asset!.id,
            is_video: fileType === 'video',
            status: 'processing', // Must match check constraint: processing, complete, failed
            analyzed_by: user.id,
            guideline_id: validatedGuidelineId
        }

        const { data: scan, error: scanError } = await supabase
            .from('scans')
            .insert(scanData)
            .select()
            .single()

        if (scanError) {
            console.error('Scan creation error:', scanError)
            return NextResponse.json({
                error: 'Failed to create scan'
            }, { status: 500 })
        }

        // NOTE: Quota increment moved to scan-processor.ts (Sprint 10.1)
        // Usage is charged at scan COMPLETION, not at upload.
        // Failed scans are free. Stripe usage is also reported at completion.

        // Trigger background processing — after() keeps the Vercel function alive until complete
        after(async () => {
            try {
                const { processScan } = await import('@/lib/ai/scan-processor')
                await processScan(scan!.id)
            } catch (err) {
                console.error('Background analysis failed:', err)
                // Mark scan as failed so the UI stops spinning and recovery can work.
                // processScan's own catch handler marks failures too, but if the import
                // or an outer error prevents reaching it, this is the safety net.
                try {
                    const adminClient = await createServiceRoleClient()
                    await adminClient
                        .from('scans')
                        .update({
                            status: 'failed',
                            error_message: `Background processing error: ${(err as Error).message?.substring(0, 200) || 'Unknown'}`,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', scan!.id)
                        .eq('status', 'processing') // Only update if still processing (don't overwrite a completed scan)
                } catch (updateErr) {
                    console.error('Failed to mark scan as failed after background error:', updateErr)
                }
            }
        })

        return NextResponse.json({
            success: true,
            scanId: scan!.id,
            isOverage,
            overageWarning: isOverage ? 'This scan will incur overage charges at your plan rate.' : null,
            ...(guidelineWarning && { warning: guidelineWarning })
        })
    } catch (error: unknown) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }
}
