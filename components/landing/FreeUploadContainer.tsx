'use client'

import { useState } from 'react'

import { RiskProfile } from '@/lib/gemini'

type Props = {
  onUploadStart: () => void
  onUploadComplete: (profile: RiskProfile) => void
}

export function FreeUploadContainer({ onUploadStart, onUploadComplete }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreview(ev.target?.result as string)
      }
      reader.readAsDataURL(selected)
    }
  }

  const handleInitiate = async () => {
    if (!file) return
    onUploadStart()

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })

      if (!res.ok) throw new Error('Analysis failed')

      const data = await res.json()
      onUploadComplete(data)

    } catch (err) {
      console.error(err)
      alert('Analysis failed. Please try again.')
      setFile(null)
      setPreview(null)
      window.location.reload()
    }
  }

  return (
    <div className="max-w-4xl mx-auto text-center space-y-12 py-10">

      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-white">AI Risk Validation.</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">Forensic auditing for IP, Brand Safety, and Content Provenance.</p>
      </div>

      {!preview && (
        <div className="relative group cursor-pointer max-w-2xl mx-auto">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

          {/* Card Content */}
          <div
            className="relative glass rounded-[3rem] p-16 border-2 border-dashed border-slate-700 group-hover:border-indigo-500/50 transition-all text-center flex flex-col items-center justify-center min-h-[320px]"
            onClick={() => document.getElementById('hidden-file-input')?.click()}
          >
            {/* Icon Wrapper - Strict Size */}
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-white">Upload Asset</h2>
            <p className="text-slate-500 text-sm">Image or Video (MP4) Supported</p>
          </div>

          <input
            id="hidden-file-input"
            type="file"
            className="hidden"
            accept="image/*,video/mp4"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {/* Preview View */}
      {preview && (
        <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-300">
          <div className="rounded-3xl border border-slate-700 shadow-2xl overflow-hidden mb-8 aspect-square bg-slate-900 flex items-center justify-center">
            {file?.type.startsWith('video') ? (
              <video src={preview} className="w-full h-full object-cover" controls />
            ) : (
              <img src={preview} className="w-full h-full object-cover" alt="Preview" />
            )}
          </div>
          <button
            onClick={handleInitiate}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-sm"
          >
            Initiate Forensic Audit
          </button>
        </div>
      )}
    </div>
  )
}
