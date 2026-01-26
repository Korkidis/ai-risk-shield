'use client'

/**
 * Upload Container
 *
 * Orchestrates the complete upload flow:
 * 1. Check quota
 * 2. Upload file to Supabase Storage
 * 3. Create scan record via Server Action
 * 4. Show success/error state
 */

import { useCallback } from 'react'
import { UploadZone } from './UploadZone'
import { uploadFile } from '@/lib/upload/storage'
import { createScan } from '@/app/(dashboard)/dashboard/actions'
import { uploadThumbnail } from '@/lib/thumbnails'
import { useRouter } from 'next/navigation'

type UploadContainerProps = {
  userId: string
  monthlyUsage: {
    used: number
    limit: number
    remaining: number
  }
}

export function UploadContainer({ userId, monthlyUsage }: UploadContainerProps) {
  const router = useRouter()

  const handleFileSelect = useCallback(
    async (file: File, fileType: 'image' | 'video') => {
      // Check quota first (client-side check for UX)
      if (monthlyUsage.remaining <= 0) {
        throw new Error(
          `Monthly scan limit reached (${monthlyUsage.limit} scans). Please upgrade your plan.`
        )
      }

      // Upload file to Supabase Storage
      const uploadResult = await uploadFile(file, userId, fileType)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file')
      }

      // Create scan record via Server Action
      const scanResult = await createScan(
        uploadResult.path!,
        uploadResult.publicUrl!,
        file.name,
        file.size,
        fileType
      )

      if (!scanResult.success || !scanResult.assetId || !scanResult.tenantId) {
        throw new Error(scanResult.error || 'Failed to create scan')
      }

      // Generate and upload thumbnail (non-blocking, best effort)
      uploadThumbnail(file, scanResult.assetId, scanResult.tenantId).catch(err => {
        console.error("Thumbnail upload failed", err);
      });

      // Trigger AI analysis in background (non-blocking)
      if (scanResult.scanId) {
        fetch('/api/scans/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scanId: scanResult.scanId }),
        }).catch((err) => {
          console.error('Failed to trigger scan processing:', err)
          // Don't fail the upload if background processing fails
        })
      }

      // Refresh the page to update scan list and quota
      router.refresh()
    },
    [userId, monthlyUsage, router]
  )

  return (
    <div>
      {/* Quota Display - Dark & Glass */}
      <div className="mb-6 p-5 bg-slate-900/50 border border-indigo-500/20 rounded-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-300">Monthly Allowance</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              Running at <span className="text-white font-bold">{Math.round((monthlyUsage.used / monthlyUsage.limit) * 100)}%</span> capacity
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white">{monthlyUsage.remaining}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Scans Available</p>
          </div>
        </div>

        {/* Progress Bar - Glowing */}
        <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden shadow-inner">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{
              width: `${Math.min(100, (monthlyUsage.used / monthlyUsage.limit) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Upload Zone */}
      <UploadZone
        onFileSelect={handleFileSelect}
        disabled={monthlyUsage.remaining <= 0}
      />

      {/* Quota Warning */}
      {monthlyUsage.remaining <= 0 && (
        <div className="mt-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Limit Reached
            </h3>
            <p className="text-sm text-red-300 leading-relaxed">
              Scan allowance exhausted. Upgrade your plan to continue intelligence gathering operations.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
