'use client'

import { useState, useEffect } from 'react'
import { AssetViewer } from '@/components/dashboard/AssetViewer'
import { IntelligenceRail } from '@/components/dashboard/IntelligenceRail'
import { RiskProfile } from '@/lib/gemini'
import { BrandGuideline } from '@/types/database'
import { Shield, ChevronDown } from 'lucide-react'

export default function DashboardPage() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([])
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string>('none')

  useEffect(() => {
    fetchGuidelines()
  }, [])

  const fetchGuidelines = async () => {
    try {
      const res = await fetch('/api/guidelines')
      const data = await res.json()
      const list = data.guidelines || []
      setGuidelines(list)

      // Auto-select the default profile if it exists
      const defaultProfile = list.find((g: BrandGuideline) => g.is_default)
      if (defaultProfile) {
        setSelectedGuidelineId(defaultProfile.id)
      } else {
        setSelectedGuidelineId('none')
      }
    } catch (err) {
      console.error('Failed to fetch guidelines:', err)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile)
    setStatus('idle')
    setRiskProfile(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string)
      startScan(selectedFile)
    }
    reader.readAsDataURL(selectedFile)
  }

  const startScan = async (fileToScan: File) => {
    setStatus('scanning')

    try {
      const formData = new FormData()
      formData.append('file', fileToScan)
      formData.append('guidelineId', selectedGuidelineId)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || 'Analysis failed')
      }

      const data = await res.json()
      setRiskProfile(data)
      setStatus('complete')
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Analysis failed. Please try again.')
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
    <div className="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col gap-6">
      {/* Policy Selector Bar */}
      <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 px-6 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
            <Shield className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Analysis Guidelines</div>
            <div className="flex items-center gap-2 group cursor-pointer relative">
              <select
                value={selectedGuidelineId}
                onChange={(e) => setSelectedGuidelineId(e.target.value)}
                className="bg-transparent text-sm font-bold text-white focus:outline-none appearance-none pr-8 cursor-pointer hover:text-indigo-400 transition-colors"
              >
                <option value="none" className="bg-[#020617]">Industry Standard (Baseline)</option>
                <option value="default" className="bg-[#020617]">Default Brand Profile</option>
                {guidelines.map(g => (
                  <option key={g.id} value={g.id} className="bg-[#020617]">Custom Profile: {g.name}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-500 absolute right-0 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Evaluation Engine</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Forensic 2.5 Active
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
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
        <div className="col-span-12 lg:col-span-5 h-full overflow-y-auto custom-scrollbar">
          <IntelligenceRail
            status={status}
            profile={riskProfile}
          />
        </div>
      </div>


    </div>
  )
}
