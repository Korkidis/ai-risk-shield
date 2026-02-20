import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getOrCreateSessionId } from '@/lib/session'
import { createHash } from 'crypto'
import type { ExtendedAsset, ExtendedScan } from '@/types/database'

/**
 * POST /api/scans/anonymous-upload
 *
 * Anonymous file upload for freemium users
 * Creates asset + scan with session_id (no auth required)
 */
export async function POST(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId()

    // 1. Check anonymous quota (skip in dev mode)
    const isDev = process.env.NODE_ENV === 'development'
    let quotaRemaining = 3 // Default for dev mode

    if (!isDev) {
      const { checkAnonymousQuota } = await import('@/lib/ratelimit')
      const quota = await checkAnonymousQuota(sessionId)

      if (!quota.allowed) {
        return NextResponse.json({
          error: 'Scan limit reached',
          details: 'You have reached the limit of 3 free scans per month.',
          code: 'LIMIT_REACHED'
        }, { status: 429 })
      }

      // remaining BEFORE this scan is consumed (will be decremented after processing)
      quotaRemaining = quota.remaining
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

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

    // Video uploads require a paid plan — block for anonymous users
    if (isVideo) {
      return NextResponse.json({
        error: 'Video analysis requires a paid plan',
        code: 'VIDEO_REQUIRES_PAID'
      }, { status: 403 })
    }

    const fileType = isImage ? 'image' : 'video'

    // Read file buffer for checksum + upload
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const sha256Checksum = createHash('sha256').update(fileBuffer).digest('hex')

    // Use service role to bypass RLS (anonymous users don't have tenant_id)
    const supabase = await createServiceRoleClient()

    // Upload to storage with session-based path
    const fileName = `${sessionId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { data: uploadData, error: uploadError } = await supabase.storage
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
    const deleteAfter = new Date()
    deleteAfter.setDate(deleteAfter.getDate() + 7) // 7 day retention for anonymous

    const assetData: Partial<ExtendedAsset> = {
      session_id: sessionId,
      tenant_id: null,
      uploaded_by: null,
      filename: file.name,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
      storage_path: uploadData.path,
      storage_bucket: 'uploads',
      sha256_checksum: sha256Checksum,
      delete_after: deleteAfter.toISOString(),
    }

    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert(assetData as any) // Supabase insert requires exact type
      .select()
      .single()

    if (assetError) {
      return NextResponse.json({
        error: 'Failed to create asset'
      }, { status: 500 })
    }


    // Create scan record
    const scanData: Partial<ExtendedScan> = {
      session_id: sessionId,
      tenant_id: null as any, // Explicitly null for anonymous scans
      analyzed_by: null as any, // Explicitly null for anonymous scans
      asset_id: (asset as ExtendedAsset).id,
      is_video: fileType === 'video',
      status: 'processing',
    }

    const { data: newScan, error: scanError } = await supabase
      .from('scans')
      .insert(scanData as any) // Supabase insert requires exact type
      .select()
      .single()

    if (scanError || !newScan) {
      return NextResponse.json({ error: 'Failed to create scan' }, { status: 500 })
    }

    const createdScan = newScan as ExtendedScan

    // 4. Queue async analysis (Direct call, bypass Auth-gated API)
    // Fire-and-forget
    import('@/lib/ai/scan-processor').then(({ processScan }) => {
      processScan(createdScan.id).catch(err => console.error('Background analysis failed:', err))
    })

    // 5. Record scan for quota tracking (only in production)
    if (!isDev) {
      const { recordAnonymousScan } = await import('@/lib/ratelimit')
      await recordAnonymousScan().catch(err =>
        console.error('Failed to record anonymous scan:', err)
      )
      // Decrement remaining since we just consumed a scan
      quotaRemaining = Math.max(0, quotaRemaining - 1)
    }

    return NextResponse.json({
      scanId: createdScan.id,
      assetId: (asset as ExtendedAsset).id,
      remaining: quotaRemaining
    })
  } catch (error) {
    console.error('Anonymous upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

