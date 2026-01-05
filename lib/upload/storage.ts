/**
 * Supabase Storage Upload Helpers
 *
 * Handles file uploads to Supabase Storage buckets:
 * - Generates unique file paths
 * - Uploads to correct bucket based on file type
 * - Returns public URL for uploaded file
 */

import { createClient } from '@/lib/supabase/client'

export type UploadResult = {
  success: boolean
  path?: string
  publicUrl?: string
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
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      success: true,
      path: data.path,
      publicUrl,
    }
  } catch (err) {
    console.error('Unexpected upload error:', err)
    return {
      success: false,
      error: 'Failed to upload file',
    }
  }
}
