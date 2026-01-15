'use client'

import { useState } from 'react'
import { AssetViewer } from '@/components/dashboard/AssetViewer'
import { IntelligenceRail } from '@/components/dashboard/IntelligenceRail'
import { RiskProfile } from '@/lib/gemini'

export default function DashboardPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setStatus('idle')
    setRiskProfile(null) // Reset results on new file

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
      // Auto-start scan for "Pro" feel
      startScan(selectedFile)
    }
    reader.readAsDataURL(selectedFile)
  }

  const startScan = async (fileToScan: File) => {
    setStatus('scanning')

    try {
      const formData = new FormData()
      formData.append('file', fileToScan)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Analysis failed')

      const data = await res.json()
      setRiskProfile(data)
      setStatus('complete')
    } catch (err) {
      console.error(err)
      alert('Analysis failed. Please try again.')
      setStatus('idle')
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setRiskProfile(null)
    setStatus('idle')
  }

  return (
    <div className="h-[calc(100vh-8rem)] min-h-[600px] grid grid-cols-12 gap-6">
      {/* Left Primary Canvas: Asset Viewer */}
      <div className="col-span-12 lg:col-span-7 h-full">
        <AssetViewer
          file={file}
          preview={preview}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
        />
      </div>

      {/* Right Rail: Intelligence & Actions */}
      <div className="col-span-12 lg:col-span-5 h-full">
        <IntelligenceRail
          status={status}
          profile={riskProfile}
        />
      </div>
    </div>
  )
}
