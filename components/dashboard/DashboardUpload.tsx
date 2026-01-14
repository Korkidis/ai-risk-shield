'use client'

import { UploadCloud } from 'lucide-react'

type Props = {
    onFileSelect: (file: File) => void
}

export function DashboardUpload({ onFileSelect }: Props) {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } }) => {
        const selected = e.target.files?.[0]
        if (selected) {
            onFileSelect(selected)
        }
    }

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 hover:bg-slate-900/40 hover:border-indigo-500/50 transition-all cursor-pointer group"
            onClick={() => document.getElementById('dash-file-input')?.click()}
        >
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50 group-hover:scale-110 transition-transform duration-500">
                <UploadCloud className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Upload Asset</h3>
            <p className="text-slate-500 text-sm max-w-xs text-center">
                Drag & drop or click to upload.
                <br />
                <span className="text-xs opacity-60">Supports JPG, PNG, MP4 (Max 50MB)</span>
            </p>

            <input
                id="dash-file-input"
                type="file"
                className="hidden"
                accept="image/*,video/mp4"
                onChange={handleFileSelect}
            />
        </div>
    )
}
