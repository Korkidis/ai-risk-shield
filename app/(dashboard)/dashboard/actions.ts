'use server'

/**
 * Dashboard Server Actions
 *
 * Handles file upload and scan creation:
 * - Check quota before upload
 * - Upload file to storage
 * - Create scan record
 * - Decrement quota atomically
 */

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, getCurrentProfile, getTenant } from '@/lib/supabase/auth'

export type UploadResult = {
  success: boolean
  scanId?: string
  error?: string
}

/**
 * Upload file and create scan
 *
 * This is called from the client with the file already uploaded to storage
 * We just need to create the scan record and decrement quota
 */
export async function createScan(
  filePath: string,
  _fileUrl: string,
  fileName: string,
  fileSize: number,
  fileType: 'image' | 'video'
): Promise<UploadResult> {
  try {
    const user = await getCurrentUser()
    const profile = await getCurrentProfile()
    const tenant = await getTenant()

    if (!user || !profile || !tenant) {
      return {
        success: false,
        error: 'Authentication required',
      }
    }

    const supabase = await createClient()

    // Check quota before creating scan
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    const { count: monthlyScans } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', (tenant as any).id)
      .gte('created_at', `${currentMonth}-01`)

    if ((monthlyScans || 0) >= (tenant as any).monthly_scan_limit) {
      return {
        success: false,
        error: `Monthly scan limit reached (${(tenant as any).monthly_scan_limit} scans). Please upgrade your plan.`,
      }
    }

    // Step 1: Create asset record
    const retentionDays = (tenant as any).retention_days || 7
    const deleteAfter = new Date()
    deleteAfter.setDate(deleteAfter.getDate() + retentionDays)

    const { data: asset, error: assetError } = await supabase
      .from('assets')
      // @ts-ignore - Supabase types require generation from live schema
      .insert({
        tenant_id: (tenant as any).id,
        filename: fileName,
        file_type: fileType,
        mime_type: fileType === 'image' ? 'image/jpeg' : 'video/mp4', // Simplified, could detect actual mime type
        file_size: fileSize,
        storage_path: filePath,
        storage_bucket: 'uploads',
        sha256_checksum: 'pending', // TODO: Calculate actual checksum
        uploaded_by: (user as any).id,
        delete_after: deleteAfter.toISOString(),
      })
      .select()
      .single()

    if (assetError) {
      console.error('Failed to create asset:', assetError)
      return {
        success: false,
        error: 'Failed to create asset record',
      }
    }

    // Step 2: Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('scans')
      // @ts-ignore - Supabase types require generation from live schema
      .insert({
        tenant_id: (tenant as any).id,
        asset_id: (asset as any).id,
        analyzed_by: (user as any).id,
        is_video: fileType === 'video',
        status: 'processing',
      })
      .select()
      .single()

    if (scanError) {
      console.error('Failed to create scan:', scanError)
      return {
        success: false,
        error: 'Failed to create scan record',
      }
    }

    return {
      success: true,
      scanId: (scan as any).id,
    }
  } catch (err) {
    console.error('Unexpected error in createScan:', err)
    return {
      success: false,
      error: 'An unexpected error occurred',
    }
  }
}

/**
 * Get monthly scan usage for current tenant
 */
export async function getMonthlyUsage(): Promise<{
  used: number
  limit: number
  remaining: number
}> {
  const tenant = await getTenant()
  const supabase = await createClient()

  const currentMonth = new Date().toISOString().slice(0, 7)

  const { count } = await supabase
    .from('scans')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', (tenant as any).id)
    .gte('created_at', `${currentMonth}-01`)

  const used = count || 0
  const limit = (tenant as any).monthly_scan_limit
  const remaining = Math.max(0, limit - used)

  return { used, limit, remaining }
}
