
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
    // Immediate preview for responsiveness
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setCurrentFile(file)
    setIsProcessing(true)
    onUploadStart()

    try {
      const formData = new FormData()
      formData.append('file', file)

      // 0. Init Realtime Client
      const supabase = createClient()

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

      // 1.5. Subscribe to Realtime Progress
      const channel = supabase.channel(`scan-${scanId}`)
      channel
        .on('broadcast', { event: 'progress' }, (payload) => {
          if (payload.payload && payload.payload.progress) {
            setProgress(payload.payload.progress)
          }
          if (payload.payload && payload.payload.message) {
            setStatusMessage(payload.payload.message)
          }
        })
        .subscribe()

      // 2. Poll (Reduced frequency, checks for completion)
      let attempts = 0
      const maxAttempts = 60

      const cleanupRealtime = () => {
        supabase.removeChannel(channel)
      }

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Poll slower, rely on realtime for visuals

        const statusRes = await fetch(`/api/scans/${scanId}/status`)
        if (!statusRes.ok) {
          cleanupRealtime()
          throw new Error('Failed to check scan status')
        }

        let scanStatus
        try {
          scanStatus = await statusRes.json()
        } catch {
          cleanupRealtime()
          throw new Error('Invalid response from status endpoint')
        }

        if (scanStatus.status === 'complete') {
          cleanupRealtime()
          setProgress(100)
          setStatusMessage("Analysis complete. Compiling dossier.")

          const riskProfile: RiskProfile = {
            composite_score: scanStatus.composite_score || 0,
            verdict: scanStatus.risk_level === 'critical' ? 'Critical Risk' :
              scanStatus.risk_level === 'high' ? 'High Risk' :
                scanStatus.risk_level === 'review' ? 'Medium Risk' : 'Low Risk',
            ip_report: {
              score: scanStatus.ip_risk_score || 0,
              teaser: 'IP risk analysis complete',
              reasoning: 'Analysis complete.'
            },
            safety_report: {
              score: scanStatus.safety_risk_score || 0,
              teaser: 'Brand safety analysis complete',
              reasoning: 'Analysis complete.'
            },
            provenance_report: {
              score: scanStatus.provenance_risk_score || 0,
              teaser: 'Provenance analysis complete',
              reasoning: 'Analysis complete.'
            },
            c2pa_report: {
              status: 'missing'
            },
            chief_officer_strategy: 'Free scan completed.'
          }

          setTimeout(() => {
            onUploadComplete(riskProfile, scanId)
          }, 1500)

          return
        } else if (scanStatus.status === 'failed') {
          cleanupRealtime()
          throw new Error(scanStatus.error_message || 'Analysis failed')
        }

        attempts++
      }

      cleanupRealtime()
      throw new Error('Analysis timed out. Please try again.')

    } catch (err: any) {
      console.error('Upload error details:', err)

      // DEV MODE FALLBACK: REMOVED to force real telemetry testing.
      // if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') { ... }

      let errorMessage = 'Analysis failed. Please try again.'
      if (err.message.includes('Scan limit reached')) errorMessage = 'Limit reached: 3 free scans per month.'
      else if (err.message.includes('Upload failed')) errorMessage = 'Upload connection failed.'
      else if (err.message.includes('Invalid file type')) errorMessage = 'Invalid format. Use JPG, PNG, or MP4.'

      alert(`${errorMessage}\n\nTechnical Details: ${err.message || JSON.stringify(err)}`)
      setIsProcessing(false)
      setCurrentFile(null)
    }
  }

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
          className="rounded-[16px] border-none shadow-[var(--rs-shadow-l1)] bg-rs-black min-h-[340px] relative overflow-hidden"
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
              </div>

              <RSFileUpload
                id="anonymous-upload-input"
                onFileSelect={handleInitiateScan}
                onDragChange={setIsDragActive}
                maxSizeMB={50}
                accept="image/*,video/*,.mp4,.mov,.avi,.mkv,.webm,.wmv"
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
