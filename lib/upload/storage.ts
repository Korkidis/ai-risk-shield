/**
 * Supabase Storage Upload Helpers
 *
 * Handles file uploads to Supabase Storage buckets:
 * - Generates unique file paths
 * - Uploads to correct bucket based on file type
 * - Returns signed URL with 24hr expiry (egress optimized)
 */

import { createClient } from '@/lib/supabase/client'

export type UploadResult = {
  success: boolean
  path?: string
  publicUrl?: string // Now contains signed URL with expiry
  error?: string
}

/**
 * Generate unique file path for upload
 * Format: {userId}/{timestamp}-{randomId}.{ext}
 */
export function generateFilePath(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = fileName.split('.').pop()?.toLowerCase() || 'bin'

  return `${userId}/${timestamp}-${randomId}.${extension}`
}

/**
 * Upload file to Supabase Storage
 * Returns signed URL with 24hr expiry to reduce egress bandwidth
 */
export async function uploadFile(
  file: File,
  userId: string,
  _fileType: 'image' | 'video'
): Promise<UploadResult> {
  const supabase = createClient()

  // Determine bucket based on file type
  const bucket = 'uploads'

  // Generate unique path
  const filePath = generateFilePath(userId, file.name)

  try {
    // Upload file to storage with 1-year cache (immutable assets)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year (egress optimization)
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get signed URL with 24hr expiry (reduces egress vs public URLs)
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(data.path, 86400) // 24 hours

    if (signedError) {
      console.error('Signed URL error:', signedError)
      return {
        success: false,
        error: signedError.message,
      }
    }

    return {
      success: true,
      path: data.path,
      publicUrl: signedData.signedUrl, // Signed URL instead of public
    }
  } catch (err) {
    console.error('Unexpected upload error:', err)
    return {
      success: false,
      error: 'Failed to upload file',
    }
  }
}
