
import { useState, useEffect } from 'react'
import { RiskProfile } from '@/lib/gemini-types'
import { RSFileUpload } from '../rs/RSFileUpload'
import { RSProcessingPanel } from '../rs/RSProcessingPanel'
import { RSScanner } from '../rs/RSScanner'
import { RSPanel } from '../rs/RSPanel'
import { RSButton } from '../rs/RSButton'
import { cn } from '@/lib/utils'

type Props = {
  onUploadStart: () => void
  onUploadComplete: (profile: RiskProfile, scanId: string) => void
}

export function FreeUploadContainer({ onUploadStart, onUploadComplete }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Initializing forensic engine...")
  const [scansRemaining, setScansRemaining] = useState(3)
  const [limit, setLimit] = useState(3)

  // Sprint 10.1: Email capture gate removed — handled by Scans Workspace

  useEffect(() => {
    // Fetch real quota — must handle all failure modes for incognito/blocked contexts
    fetch('/api/scans/anonymous-quota')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (data.remaining !== undefined) setScansRemaining(data.remaining)
        if (data.limit !== undefined) setLimit(data.limit)
      })
      .catch(() => {
        // Fail gracefully — default quota shown, user can still try uploading
        setScansRemaining(3)
        setLimit(3)
      })
  }, [])

  /* Cleanup preview URL on unmount */
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleInitiateScan = async (file: File) => {
    // Client-side video gate: anonymous users cannot upload video
    if (file.type.startsWith('video/')) {
      alert('Video scanning requires a paid plan.\n\nSign up for PRO to unlock video analysis, bulk scanning, and full forensic reports.')
      return
    }

    // Immediate preview for responsiveness
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setCurrentFile(file)
    setIsProcessing(true)
    onUploadStart()

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Sprint 10.1: Realtime subscription removed — workspace handles processing state

      // 1. Upload
      const uploadRes = await fetch('/api/scans/anonymous-upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        let errorMessage = 'Upload failed'
        try {
          const errorData = await uploadRes.json()
          errorMessage = errorData.details
            ? `${errorData.error}: ${errorData.details}`
            : errorData.error || errorMessage
        } catch {
          errorMessage = `Upload failed (HTTP ${uploadRes.status})`
        }
        throw new Error(errorMessage)
      }

      const { scanId, remaining } = await uploadRes.json()
      if (remaining !== undefined) setScansRemaining(remaining)

      // Sprint 10.1: Immediate redirect to canonical workspace.
      // Processing, realtime progress, email capture, and findings gating
      // are all handled natively within the Scans Workspace.
      setProgress(30)
      setStatusMessage("Scan record created. Redirecting to workspace...")

      // Brief visual feedback before redirect (500ms)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect immediately — workspace will show processing state + realtime updates
      onUploadComplete(
        { composite_score: 0, verdict: 'Low Risk', ip_report: { score: 0, teaser: '', reasoning: '' }, safety_report: { score: 0, teaser: '', reasoning: '' }, provenance_report: { score: 0, teaser: '', reasoning: '' }, c2pa_report: { status: 'missing' } } as RiskProfile,
        scanId
      )

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.error('Upload error details:', err)

      let errorMessage = 'Analysis failed. Please try again.'
      if (errMsg.includes('Scan limit reached')) errorMessage = 'Limit reached: 3 free scans per month.'
      else if (errMsg.includes('Upload failed')) errorMessage = 'Upload connection failed.'
      else if (errMsg.includes('Video analysis requires')) errorMessage = 'Video scanning requires a paid plan.'
      else if (errMsg.includes('Invalid file type')) errorMessage = 'Invalid format. Use JPG, PNG, or WebP.'

      alert(`${errorMessage}\n\nTechnical Details: ${errMsg}`)
      setIsProcessing(false)
      setCurrentFile(null)
    }
  }

  // Sprint 10.1: handleEmailSubmit and handleEmailSkip removed
  // Email capture is now handled by the Scans Workspace after redirect

  return (
    <div className="w-full relative group perspective-1000">
      {/* APERTURE CHASSIS WRAPPER */}
      <RSPanel className="p-4 md:p-6 border border-[var(--rs-border-primary)] relative bg-[var(--rs-bg-surface)] shadow-[var(--rs-shadow-l2)]">

        {/* Chassis Header */}
        <div className="flex justify-between items-center px-2 mb-4">
          <div className="flex items-center gap-3 opacity-90">
            {/* System Status Indicator - Green Diode */}
            <div className="relative flex items-center justify-center mr-2">
              <div className="w-3 h-3 rounded-full bg-[var(--rs-safe)] shadow-[0_0_8px_var(--rs-safe)] animate-pulse motion-reduce:animate-none" />
              <div className="absolute w-full h-full rounded-full bg-[var(--rs-safe)] opacity-40 blur-md animate-ping motion-reduce:animate-none" />
            </div>
            <span className="rs-type-micro text-[var(--rs-text-primary)] tracking-widest uppercase font-bold">SYSTEM STATUS: LIVE</span>
          </div>
          <div className="bg-[var(--rs-bg-secondary)] px-3 py-1.5 rounded-full shadow-inner border border-[var(--rs-border-primary)]">
            <span className="rs-type-micro font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">{scansRemaining}/{limit} REMAINING</span>
          </div>
        </div>

        <RSScanner
          active={isProcessing}
          status={isProcessing ? 'scanning' : 'idle'}
          isDragActive={isDragActive}
          className="rounded-[16px] border-none shadow-[var(--rs-shadow-l1)] bg-[var(--rs-bg-dark)] min-h-[340px] relative overflow-hidden"
        >
          {!isProcessing ? (
            <div className="relative w-full h-full p-8 flex flex-col justify-center items-center z-40 text-center select-none group/screen">

              {/* Rams Motion Element: Active Breathing Reticle */}
              {!isDragActive && (
                <div className="relative mb-10 transition-opacity duration-300">
                  {/* Ambient Glow */}
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse motion-reduce:animate-none" />

                  {/* Rotating Outer Ring */}
                  <div className="absolute inset-[-12px] border border-white/10 rounded-full border-dashed animate-spin-slow opacity-40 motion-reduce:animate-none" />

                  {/* Main Circle */}
                  <div className="w-24 h-24 rounded-full rs-bevel flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.05)] bg-white/5 backdrop-blur-sm group-hover/screen:border-[var(--rs-signal)] group-hover/screen:shadow-[0_0_20px_var(--rs-signal)] transition-all duration-500">
                    {/* Upload Icon - Arrow Up */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 animate-pulse group-hover/screen:text-[var(--rs-signal)] motion-reduce:animate-none"><path d="M12 17V3" /><path d="m6 9 6-6 6 6" /><path d="M5 21h14" /></svg>
                  </div>

                  {/* Orbiting blip */}
                  <div className="absolute inset-0 animate-spin-slow motion-reduce:animate-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-1.5 h-1.5 bg-[var(--rs-signal)] rounded-full shadow-[0_0_10px_var(--rs-signal)] opacity-80" />
                  </div>
                </div>
              )}

              <div className={cn("flex flex-col items-center gap-3 opacity-80 transition-opacity duration-300", isDragActive ? "opacity-0" : "opacity-100")}>
                <span className="rs-type-mono text-xs text-[var(--rs-signal)] tracking-[0.2em] uppercase font-bold animate-pulse shadow-black drop-shadow-md motion-reduce:animate-none">UPLOAD ASSET</span>
                <div className="w-12 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[var(--rs-signal)] -translate-x-full animate-[shimmer_2s_infinite] motion-reduce:animate-none" />
                </div>
                <span className="rs-type-mono text-[10px] text-white/50 tracking-[0.15em] uppercase mt-1">JPG, PNG, WebP • Max 50 MB • 100% Free</span>
              </div>

              <RSFileUpload
                id="anonymous-upload-input"
                onFileSelect={handleInitiateScan}
                onDragChange={setIsDragActive}
                maxSizeMB={50}
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer z-50"
              />
            </div>
          ) : (
            <div className="relative w-full h-full z-40">
              <RSProcessingPanel
                filename={currentFile?.name || "unknown_asset"}
                progress={progress}
                statusMessage={statusMessage}
                imageSrc={previewUrl}
                className="h-full"
                isVideo={currentFile?.type.startsWith('video/')}
              />
            </div>
          )}
        </RSScanner>

        {/* External Control Button (Chassis Mounted) */}
        {!isProcessing && (
          <div className="mt-4 md:mt-6">
            <RSButton
              variant="primary"
              fullWidth
              size="lg"
              onClick={() => document.getElementById('anonymous-upload-input')?.click()}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              }
            >
              Run Free Heuristic Scan
            </RSButton>
          </div>
        )}

      </RSPanel>
    </div>
  )
}
