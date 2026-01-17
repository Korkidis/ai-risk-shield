'use client'

import { useState } from 'react'

import { RiskProfile } from '@/lib/gemini'
import { RSUploadZone } from '../rs/RSUploadZone'
import { RSProcessingPanel } from '../rs/RSProcessingPanel'

type Props = {
  onUploadStart: () => void
  onUploadComplete: (profile: RiskProfile) => void
}

export function FreeUploadContainer({ onUploadStart, onUploadComplete }: Props) {
  // State: 'ready' | 'processing'
  // Note: 'results' state is handled by the parent page component switching views

  const [isProcessing, setIsProcessing] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  // Processing Simulation State
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Initializing forensic engine...")

  const handleInitiateScan = async (file: File) => {
    setCurrentFile(file)
    setIsProcessing(true)
    onUploadStart() // Notify parent to switch layout mode if needed

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Start Simulation Interval
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
        p += 0.5 // Slower, more deliberate for "wow" factor
        if (p > 90) p = 90 // Cap until real completion

        setProgress(p)
        setStatusMessage(steps[Math.floor((p / 100) * steps.length)] || "Finalizing analysis...")
      }, 100)

      // Store interval for cleanup
      const cleanupSimulation = () => clearInterval(interval)


      // 1. Upload to API
      const uploadRes = await fetch('/api/scans/anonymous-upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadRes.ok) {
        cleanupSimulation()
        const errorData = await uploadRes.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const { scanId } = await uploadRes.json()

      // 2. Poll for scan completion
      let attempts = 0
      const maxAttempts = 60 // 60 seconds max wait

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second

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

          // Construct risk profile from scan status
          const riskProfile: RiskProfile = {
            composite_score: scanStatus.composite_score || 0,
            verdict: scanStatus.risk_level === 'critical' ? 'Critical Risk' :
              scanStatus.risk_level === 'high' ? 'High Risk' :
                scanStatus.risk_level === 'review' ? 'Medium Risk' : 'Low Risk',
            ip_report: {
              score: scanStatus.ip_risk_score || 0,
              teaser: 'IP risk analysis complete',
              reasoning: 'Analysis complete. Full details available after email capture.'
            },
            safety_report: {
              score: scanStatus.safety_risk_score || 0,
              teaser: 'Brand safety analysis complete',
              reasoning: 'Analysis complete. Full details available after email capture.'
            },
            provenance_report: {
              score: scanStatus.provenance_risk_score || 0,
              teaser: 'Provenance analysis complete',
              reasoning: 'Analysis complete. Full details available after email capture.'
            },
            c2pa_report: {
              status: 'missing'
            },
            chief_officer_strategy: 'Free scan completed. Upgrade for full forensic analysis.'
          }

          // Small delay to show 100% completion before switching
          setTimeout(() => {
            onUploadComplete(riskProfile)
          }, 1500) // Longer delay to admire the 100% state

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
      console.error('Upload error details:', {
        message: err.message,
        stack: err.stack,
        error: err
      })

      let errorMessage = 'Analysis failed. Please try again.'

      if (err.message.includes('Scan limit reached')) {
        errorMessage = 'Limit reached: 3 free scans per month.'
      } else if (err.message.includes('Upload failed')) {
        errorMessage = 'Upload connection failed.'
      } else if (err.message.includes('Invalid file type')) {
        errorMessage = 'Invalid format use JPG, PNG, or MP4.'
      }

      alert(errorMessage)
      setIsProcessing(false)
      setCurrentFile(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12">

      {/* Hero Text - Fade out on processing */}
      <div className={`text-center space-y-6 transition-all duration-500 ${isProcessing ? 'opacity-50 blur-sm scale-95' : 'opacity-100'}`}>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-rs-black">
          AI Risk <span className="text-rs-gray-400">Validation</span>
        </h1>
        <p className="text-rs-gray-600 text-lg max-w-xl mx-auto font-medium">
          Forensic auditing for IP, Brand Safety, and Content Provenance.
        </p>
      </div>

      {/* INTERACTIVE ZONE */}
      <div className="w-full max-w-2xl mx-auto">
        {!isProcessing ? (
          <RSUploadZone
            onFileSelect={handleInitiateScan}
            maxSizeMB={50}
            className="bg-rs-white shadow-[var(--rs-shadow-sm)]"
          />
        ) : (
          <div className="animate-in zoom-in-95 duration-700 ease-out">
            <RSProcessingPanel
              filename={currentFile?.name || "unknown_asset"}
              progress={progress}
              statusMessage={statusMessage}
              imageSrc={currentFile ? URL.createObjectURL(currentFile) : null}
            />
          </div>
        )}
      </div>

      {/* Footer Info */}
      {!isProcessing && (
        <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-6 text-xs font-mono text-rs-gray-400 uppercase tracking-widest">
            <span>Free: 3 scans/mo</span>
            <span>•</span>
            <span>Secure Processing</span>
            <span>•</span>
            <span>Auto-Deletion</span>
          </div>
        </div>
      )}
    </div>
  )
}
