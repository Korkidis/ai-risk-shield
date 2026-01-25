
import React from 'react'
import { motion } from 'framer-motion'
import { Download, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RSCardActionOverlayProps {
    onDownload: (e: React.MouseEvent) => void
    onShare: (e: React.MouseEvent) => void
    className?: string
}

export function RSCardActionOverlay({
    onDownload,
    onShare,
    className
}: RSCardActionOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className={cn(
                "absolute inset-0 bg-rs-text-primary/10 backdrop-blur-[1px] flex items-center justify-center gap-6 z-30 transition-opacity duration-200",
                className
            )}
        >
            <ActionTrigger
                icon={<Download size={20} className="text-rs-text-primary" />}
                label="Download"
                onClick={onDownload}
            />
            <ActionTrigger
                icon={<Share2 size={20} className="text-rs-text-primary" />}
                label="Share"
                onClick={onShare}
            />
        </motion.div>
    )
}

function ActionTrigger({
    icon,
    label,
    onClick
}: {
    icon: React.ReactNode,
    label: string,
    onClick: (e: React.MouseEvent) => void
}) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation()
                onClick(e)
            }}
            className="flex flex-col items-center gap-2 group/btn transition-transform hover:scale-105"
        >
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-rs-border-primary/50 group-hover/btn:border-rs-text-primary transition-colors">
                {icon}
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-rs-text-primary bg-white/80 px-2 py-0.5 rounded-[1px] shadow-sm">{label}</span>
        </button>
    )
}
