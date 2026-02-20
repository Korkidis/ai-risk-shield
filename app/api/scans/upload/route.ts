
import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId, requireAuth } from '@/lib/supabase/auth'
import { reportScanUsage } from '@/lib/stripe-usage'
import { createHash } from 'crypto'

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

        const formData = await request.formData()
        const file = formData.get('file') as File
        const guidelineId = formData.get('guidelineId') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file size (100MB for images, 500MB for videos)
        const MAX_IMAGE_SIZE = 100 * 1024 * 1024
        const MAX_VIDEO_SIZE = 500 * 1024 * 1024
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
            .single() as unknown as { data: any, error: any }

        if (tenantError) {
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

        // Block FREE users at limit - paid plans can proceed with overage
        if (isOverage && plan === 'free') {
            return NextResponse.json({
                error: 'Monthly scan limit reached'
            }, { status: 403 })
        }

        // Calculate deletion date
        const deleteAfter = new Date()
        deleteAfter.setDate(deleteAfter.getDate() + retentionDays)

        // Read file buffer for checksum + upload
        const fileBuffer = Buffer.from(await file.arrayBuffer())
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
                contentType: file.type,
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
            mime_type: file.type,
            file_size: file.size,
            storage_path: uploadData.path,
            storage_bucket: 'uploads',
            sha256_checksum: sha256Checksum,
            uploaded_by: user.id,
            delete_after: deleteAfter.toISOString()
        }

        const { data: asset, error: assetError } = await supabase
            .from('assets')
            // @ts-ignore
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
        if (guidelineId && guidelineId !== 'default' && UUID_REGEX.test(guidelineId)) {
            const { data: guideline } = await supabase
                .from('brand_guidelines')
                .select('id')
                .eq('id', guidelineId)
                .eq('tenant_id', tenantId)
                .single() as unknown as { data: { id: string } | null }
            if (guideline) {
                validatedGuidelineId = guideline.id
            }
            // If not found, silently proceed without guideline (don't block upload)
        }

        // Create scan record
        const scanData = {
            tenant_id: tenantId,
            asset_id: (asset as any).id,
            is_video: fileType === 'video',
            status: 'processing', // Must match check constraint: processing, complete, failed
            analyzed_by: user.id,
            guideline_id: validatedGuidelineId
        }

        const { data: scan, error: scanError } = await supabase
            .from('scans')
            // @ts-ignore
            .insert(scanData)
            .select()
            .single()

        if (scanError) {
            console.error('Scan creation error:', scanError)
            return NextResponse.json({
                error: 'Failed to create scan'
            }, { status: 500 })
        }

        // 2. Increment Usage — Direct update (increment_scans_used RPC not deployed)
        const { error: usageError } = await supabase
            .from('tenants')
            // @ts-ignore - scans_used_this_month may not be in generated types
            .update({ scans_used_this_month: used + 1 })
            .eq('id', tenantId)

        if (usageError) {
            console.error('Failed to increment scan usage:', usageError)
            // Non-blocking — scan was created successfully, usage is best-effort
        }

        // 3. Report usage to Stripe for metered billing (fire-and-forget)
        // This enables automatic overage billing at period end
        reportScanUsage(tenantId).catch(err =>
            console.error('Failed to report usage to Stripe:', err)
        )

        // Trigger background processing
        // Trigger background processing (Direct call, bypass Auth-gated API)
        import('@/lib/ai/scan-processor').then(({ processScan }) => {
            processScan((scan as any).id).catch(err => console.error('Background analysis failed:', err))
        })

        return NextResponse.json({
            success: true,
            scanId: (scan as any).id,
            isOverage,
            overageWarning: isOverage ? 'This scan will incur overage charges at your plan rate.' : null
        })
    } catch (error: any) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
    }
}
