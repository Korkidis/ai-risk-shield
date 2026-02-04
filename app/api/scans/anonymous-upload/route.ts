import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getOrCreateSessionId } from '@/lib/session'
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

    if (!isDev) {
      const { checkAnonymousQuota, recordAnonymousScan } = await import('@/lib/ratelimit')
      const quota = await checkAnonymousQuota(sessionId)

      if (!quota.allowed) {
        return NextResponse.json({
          error: 'Scan limit reached',
          details: 'You have reached the limit of 3 free scans per month.',
          code: 'LIMIT_REACHED'
        }, { status: 429 })
      }
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

    // Use service role to bypass RLS (anonymous users don't have tenant_id)
    const supabase = await createServiceRoleClient()

    // Upload to storage with session-based path
    const fileName = `${sessionId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { data: uploadData, error: uploadError } = await supabase.storage
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
      sha256_checksum: 'pending',
      delete_after: deleteAfter.toISOString(),
    }

    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert(assetData as any) // Supabase insert requires exact type
      .select()
      .single()

    if (assetError) {
      return NextResponse.json({
        error: 'Failed to create asset',
        details: assetError.message,
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

    // 4. Queue async analysis
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scans/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanId: createdScan.id })
    }).catch(err => console.error('Failed to trigger analysis:', err))

    // 5. Record scan for quota tracking (only in production)
    if (!isDev) {
      const { recordAnonymousScan } = await import('@/lib/ratelimit')
      await recordAnonymousScan(sessionId).catch(err =>
        console.error('Failed to record anonymous scan:', err)
      )
    }

    return NextResponse.json({
      scanId: createdScan.id,
      assetId: (asset as ExtendedAsset).id,
      remaining: isDev ? 999 : 2 // Dev mode shows unlimited, prod shows remaining
    })
  } catch (error) {
    console.error('Anonymous upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

