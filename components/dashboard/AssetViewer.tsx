'use client'

import { DashboardUpload } from './DashboardUpload'
import { RefreshCw, X } from 'lucide-react'

type Props = {
    file: File | null
    preview: string | null
    onFileSelect: (file: File) => void
    onClear: () => void
}

export function AssetViewer({ file, preview, onFileSelect, onClear }: Props) {
    if (!preview || !file) {
        return (
            <div className="h-full min-h-[500px]">
                <DashboardUpload onFileSelect={onFileSelect} />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Asset Preview</h3>
                <button onClick={onClear} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Viewer */}
            <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative flex items-center justify-center group">
                {file.type.startsWith('video') ? (
                    <video src={preview} className="w-full h-full object-contain" controls />
                ) : (
                    <img src={preview} className="w-full h-full object-contain" alt="Preview" />
                )}

                {/* Overlay Info */}
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="text-white font-medium truncate">{file.name}</div>
                    <div className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
            </div>
        </div>
    )
}
