'use client'

import { useState, useEffect } from 'react'
import { RiskProfile } from '@/lib/gemini'
import { RSFileUpload } from '../rs/RSFileUpload'
import { RSProcessingPanel } from '../rs/RSProcessingPanel'
import { RSScanner } from '../rs/RSScanner'
import { RSPanel } from '../rs/RSPanel'
import { RSButton } from '../rs/RSButton'
import { cn } from '@/lib/utils'

type Props = {
  onUploadStart: () => void
  onUploadComplete: (profile: RiskProfile) => void
}

export function FreeUploadContainer({ onUploadStart, onUploadComplete }: Props) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Initializing forensic engine...")

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

      // Simulation Steps
      let p = 0
      const steps = [
        "Verifying digital signature...",
        "Analyzing visual spectrum...",
        "Cross-referencing IP databases...",
        "Checking C2PA provenance...",
        "Calculating risk probability...",
        "Generating forensic report..."
      ]

      const interval = setInterval(() => {
        p += 0.5
        if (p > 90) p = 90
        setProgress(p)
        setStatusMessage(steps[Math.floor((p / 100) * steps.length)] || "Finalizing analysis...")
      }, 100)

      const cleanupSimulation = () => clearInterval(interval)

      // 1. Upload
      const uploadRes = await fetch('/api/scans/anonymous-upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        cleanupSimulation()
        const errorData = await uploadRes.json()
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Upload failed'
        throw new Error(errorMessage)
      }

      const { scanId } = await uploadRes.json()

      // 2. Poll
      let attempts = 0
      const maxAttempts = 60

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const statusRes = await fetch(`/api/scans/${scanId}/status`)
        if (!statusRes.ok) {
          cleanupSimulation()
          throw new Error('Failed to check scan status')
        }

        const scanStatus = await statusRes.json()

        if (scanStatus.status === 'complete') {
          cleanupSimulation()
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
            onUploadComplete(riskProfile)
          }, 1500)

          return
        } else if (scanStatus.status === 'failed') {
          cleanupSimulation()
          throw new Error('Analysis failed')
        }

        attempts++
      }

      cleanupSimulation()
      throw new Error('Analysis timed out. Please try again.')

    } catch (err: any) {
      console.error('Upload error details:', err)

      // DEV MODE FALLBACK: If server fails, we still want to show the visual experience for testing.
      if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
        console.warn("Dev Mode: Server failed, running simulation fallback.");

        // Clear any previous text
        setStatusMessage("Dev Mode: Server offline. Simulating forensic scan...");
        setProgress(0);

        let simProgress = 0;
        const fallbackInterval = setInterval(() => {
          simProgress += 2;
          if (simProgress > 100) simProgress = 100;

          setProgress(simProgress);

          if (simProgress >= 100) {
            clearInterval(fallbackInterval);
            setStatusMessage("Analysis complete. Compiling dossier.");

            const mockProfile: RiskProfile = {
              composite_score: 85,
              verdict: 'High Risk',
              ip_report: { score: 90, teaser: 'Detected potential copyright match', reasoning: 'Visual match to known assets.' },
              safety_report: { score: 10, teaser: 'No safety issues', reasoning: 'Content appears safe.' },
              provenance_report: { score: 80, teaser: 'Missing C2PA credentials', reasoning: 'Metadata stripped.' },
              c2pa_report: { status: 'missing' },
              chief_officer_strategy: 'Dev Mode Simulation Complete.'
            };

            setTimeout(() => onUploadComplete(mockProfile), 1000);
          }
        }, 50);
        return;
      }

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
              <div className="w-3 h-3 rounded-full bg-[var(--rs-safe)] shadow-[0_0_8px_var(--rs-safe)] animate-pulse" />
              <div className="absolute w-full h-full rounded-full bg-[var(--rs-safe)] opacity-40 blur-md animate-ping" />
            </div>
            <span className="rs-type-micro text-[var(--rs-text-primary)] tracking-widest uppercase font-bold">SYSTEM STATUS: LIVE</span>
          </div>
          <div className="bg-[var(--rs-bg-secondary)] px-3 py-1.5 rounded-full shadow-inner border border-[var(--rs-border-primary)]">
            <span className="rs-type-micro font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">3/3 REMAINING</span>
          </div>
        </div>

        <RSScanner
          active={isProcessing}
          status={isProcessing ? 'scanning' : 'idle'}
          isDragActive={isDragActive}
          className="rounded-[16px] border-none shadow-[var(--rs-shadow-l1)] bg-black min-h-[340px] relative overflow-hidden"
        >
          {!isProcessing ? (
            <div className="relative w-full h-full p-8 flex flex-col justify-center items-center z-40 text-center select-none group/screen">

              {/* Rams Motion Element: Active Breathing Reticle */}
              {!isDragActive && (
                <div className="relative mb-10 transition-opacity duration-300">
                  {/* Ambient Glow */}
                  <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse" />

                  {/* Rotating Outer Ring */}
                  <div className="absolute inset-[-12px] border border-white/10 rounded-full border-dashed animate-spin-slow opacity-40" />

                  {/* Main Circle */}
                  <div className="w-24 h-24 rounded-full border-[2px] border-white/20 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(255,255,255,0.05)] bg-white/5 backdrop-blur-sm group-hover/screen:border-[var(--rs-signal)] group-hover/screen:shadow-[0_0_20px_var(--rs-signal)] transition-all duration-500">
                    {/* Upload Icon - Arrow Up */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60 animate-pulse group-hover/screen:text-[var(--rs-signal)]"><path d="M12 17V3" /><path d="m6 9 6-6 6 6" /><path d="M5 21h14" /></svg>
                  </div>

                  {/* Orbiting blip */}
                  <div className="absolute inset-0 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-1.5 h-1.5 bg-[var(--rs-signal)] rounded-full shadow-[0_0_10px_var(--rs-signal)] opacity-80" />
                  </div>
                </div>
              )}

              <div className={cn("flex flex-col items-center gap-3 opacity-80 transition-opacity duration-300", isDragActive ? "opacity-0" : "opacity-100")}>
                <span className="rs-type-mono text-xs text-[var(--rs-signal)] tracking-[0.2em] uppercase font-bold animate-pulse shadow-black drop-shadow-md">UPLOAD ASSET</span>
                <div className="w-12 h-0.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[var(--rs-signal)] -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>

              <RSFileUpload
                onFileSelect={handleInitiateScan}
                onDragChange={setIsDragActive}
                maxSizeMB={50}
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
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
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
