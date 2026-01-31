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
        <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[var(--rs-border-primary)] rounded-3xl bg-[var(--rs-bg-element)]/20 hover:bg-[var(--rs-bg-element)]/40 hover:border-[var(--rs-action-primary)]/50 transition-all cursor-pointer group"
            onClick={() => document.getElementById('dash-file-input')?.click()}
        >
            <div className="w-20 h-20 bg-[var(--rs-bg-element)] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-black/50 group-hover:scale-110 transition-transform duration-500">
                <UploadCloud className="w-10 h-10 text-[var(--rs-text-secondary)] group-hover:text-[var(--rs-action-primary)] transition-colors" />
            </div>

            <h3 className="text-xl font-bold text-[var(--rs-text-primary)] mb-2">Upload Asset</h3>
            <p className="text-[var(--rs-text-secondary)] text-sm max-w-xs text-center">
                Drag & drop or click to upload.
                <br />
                <span className="text-xs opacity-60">Supports JPG, PNG, MP4, MOV, WEBM (Max 50MB)</span>
            </p>

            <input
                id="dash-file-input"
                type="file"
                className="hidden"
                accept="image/*,video/mp4,video/quicktime,video/webm"
                onChange={handleFileSelect}
            />
        </div>
    )
}
