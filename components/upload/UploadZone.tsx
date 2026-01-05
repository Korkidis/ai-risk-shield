'use client'

/**
 * Upload Zone Component
 *
 * Drag-and-drop file upload with:
 * - Visual feedback for drag state
 * - File validation before upload
 * - Preview of selected file
 * - Upload progress indicator
 */

import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { validateFile, formatFileSize, type ValidationResult } from '@/lib/upload/validators'

type UploadState = 'idle' | 'dragging' | 'validating' | 'uploading' | 'error' | 'success'

type UploadZoneProps = {
  onFileSelect: (file: File, fileType: 'image' | 'video') => Promise<void>
  disabled?: boolean
}

export function UploadZone({ onFileSelect, disabled = false }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Handle file validation and selection
  const handleFile = useCallback(
    async (file: File) => {
      setState('validating')
      setError(null)

      // Validate file
      const validation: ValidationResult = validateFile(file)

      if (!validation.valid) {
        setState('error')
        setError(validation.error!.message)
        return
      }

      // Create preview for images
      if (validation.fileType === 'image') {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }

      setSelectedFile(file)
      setState('uploading')

      try {
        await onFileSelect(file, validation.fileType!)
        setState('success')
      } catch (err) {
        setState('error')
        setError(err instanceof Error ? err.message : 'Upload failed')
      }
    },
    [onFileSelect]
  )

  // Drag and drop handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setState('dragging')
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setState('idle')
  }, [])

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setState('idle')

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        await handleFile(files[0])
      }
    },
    [disabled, handleFile]
  )

  // File input change handler
  const handleFileInputChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        await handleFile(files[0])
      }
    },
    [handleFile]
  )

  // Reset handler
  const handleReset = useCallback(() => {
    setState('idle')
    setSelectedFile(null)
    setPreview(null)
    setError(null)
  }, [])

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${state === 'dragging' ? 'border-brand-500 bg-brand-50' : 'border-gray-300'}
          ${disabled || state === 'uploading' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${state === 'error' ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        {/* Idle/Dragging State */}
        {(state === 'idle' || state === 'dragging') && (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-brand-600 hover:text-brand-500 font-medium">
                  Upload a file
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/x-msvideo,video/webm"
                  onChange={handleFileInputChange}
                  disabled={disabled}
                />
              </label>
              <span className="text-gray-600"> or drag and drop</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Images (JPEG, PNG, WebP, GIF) up to 100MB or Videos (MP4, MOV, AVI, WebM) up to 500MB
            </p>
          </>
        )}

        {/* Uploading State */}
        {state === 'uploading' && (
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-brand-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-900">Uploading and scanning...</p>
            {selectedFile && (
              <p className="mt-1 text-xs text-gray-500">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex flex-col items-center">
            <svg
              className="h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-red-900">Upload failed</p>
            <p className="mt-1 text-xs text-red-700">{error}</p>
            <button
              onClick={handleReset}
              className="mt-4 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Success State */}
        {state === 'success' && (
          <div className="flex flex-col items-center">
            <svg
              className="h-12 w-12 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-900">Upload successful!</p>
            {selectedFile && (
              <p className="mt-1 text-xs text-gray-500">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
            <button
              onClick={handleReset}
              className="mt-4 rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Upload another
            </button>
          </div>
        )}
      </div>

      {/* Preview (if image) */}
      {preview && state !== 'error' && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 rounded-lg border border-gray-200 mx-auto"
          />
        </div>
      )}
    </div>
  )
}
