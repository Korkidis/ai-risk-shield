/**
 * File Upload Validators
 *
 * Validates files before upload:
 * - File type (image/video only)
 * - File size (max 100MB for images, 500MB for videos)
 * - File format support
 */

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
]

export const MAX_IMAGE_SIZE = 100 * 1024 * 1024 // 100MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024 // 500MB

export type ValidationError = {
  code: 'INVALID_TYPE' | 'TOO_LARGE' | 'QUOTA_EXCEEDED'
  message: string
}

export type ValidationResult = {
  valid: boolean
  error?: ValidationError
  fileType?: 'image' | 'video'
}

export function validateFile(file: File): ValidationResult {
  // Check if file type is supported
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.type)
  const isVideo = SUPPORTED_VIDEO_TYPES.includes(file.type)

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: {
        code: 'INVALID_TYPE',
        message: 'File must be an image (JPEG, PNG, WebP, GIF) or video (MP4, MOV, AVI, WebM)',
      },
    }
  }

  // Check file size
  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (file.size > maxSize) {
    const maxSizeMB = isImage ? 100 : 500
    return {
      valid: false,
      error: {
        code: 'TOO_LARGE',
        message: `File too large. Maximum size is ${maxSizeMB}MB for ${isImage ? 'images' : 'videos'}`,
      },
    }
  }

  return {
    valid: true,
    fileType: isImage ? 'image' : 'video',
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
