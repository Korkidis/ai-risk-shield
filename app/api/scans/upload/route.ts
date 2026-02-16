
import { NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId } from '@/lib/supabase/auth'
import { reportScanUsage } from '@/lib/stripe-usage'

/**
 * POST /api/scans/upload
 *
 * Authenticated file upload for dashboard users
 * Creates asset + scan linked to tenant
 */
export async function POST(request: Request) {
    try {
        const tenantId = await getTenantId()
        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
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
            .select('monthly_scan_limit, scans_used_this_month, plan')
            .eq('id', tenantId)
            .single() as unknown as { data: any, error: any }

        if (tenantError) {
            return NextResponse.json({ error: 'Failed to fetch tenant usage' }, { status: 500 })
        }

        const limit = tenant.monthly_scan_limit || 3 // Default low limit if missing
        const used = tenant.scans_used_this_month || 0
        const plan = tenant.plan || 'free'
        const isOverage = used >= limit

        // Block FREE users at limit - paid plans can proceed with overage
        if (isOverage && plan === 'free') {
            return NextResponse.json({
                error: 'Monthly scan limit reached',
                details: `You have used ${used} of ${limit} scans. Please upgrade your plan.`
            }, { status: 403 })
        }

        // Use service role client for storage (bypasses RLS folder restrictions)
        const adminClient = await createServiceRoleClient()

        // Upload to storage with tenant-based path
        const fileName = `${tenantId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { data: uploadData, error: uploadError } = await adminClient.storage
            .from('uploads')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError)
            return NextResponse.json({
                error: 'Upload failed',
                details: uploadError.message
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
            sha256_checksum: 'pending',
        }

        const { data: asset, error: assetError } = await supabase
            .from('assets')
            // @ts-ignore
            .insert(assetData)
            .select()
            .single()

        if (assetError) {
            return NextResponse.json({
                error: 'Failed to create asset',
                details: assetError.message,
            }, { status: 500 })
        }

        // Create scan record
        const scanData = {
            tenant_id: tenantId,
            asset_id: (asset as any).id,
            is_video: fileType === 'video',
            status: 'pending', // Mark as pending so processPendingScans can pick it up or direct trigger
        }

        const { data: scan, error: scanError } = await supabase
            .from('scans')
            // @ts-ignore
            .insert(scanData)
            .select()
            .single()

        if (scanError) {
            return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
        }

        // 2. Increment Usage (Fire and Forget or Await?)
        // We await to ensure data integrity, though it adds latency.
        const { error: rpcError } = await (supabase.rpc as any)('increment_scans_used', {
            p_tenant: tenantId
        })

        if (rpcError) {
            console.error('Failed to increment scan usage', rpcError)
            // We do NOT fail the request here, as the scan was created successfully.
            // Just log it for audit.
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
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
