import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, Trash2, X } from 'lucide-react'

interface RSBulkActionBarProps {
    selectedCount: number
    onClear: () => void
    onDownload: () => void
    onShare: () => void
    onDelete: () => void
}

export function RSBulkActionBar({
    selectedCount,
    onClear,
    onDownload,
    onShare,
    onDelete
}: RSBulkActionBarProps) {
    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 right-0 left-0 md:left-20 lg:left-64 h-20 z-50 border-t border-rs-border-primary bg-rs-black/95 backdrop-blur-md flex items-center justify-between px-8 md:px-12"
                >
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-white tracking-tighter tabular-nums">
                                {selectedCount}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-rs-text-tertiary uppercase tracking-widest leading-none">Records</span>
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest leading-none">Selected</span>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-white/10 mx-2" />

                        <button
                            onClick={onClear}
                            className="text-[10px] font-mono text-rs-text-tertiary hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            <X className="w-3 h-3" />
                            <span>Deselect_All</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onDownload}
                            className="h-10 px-6 rs-bevel hover:border-white text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-[2px] hover:bg-white/5 flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download</span>
                        </button>
                        <button
                            onClick={onShare}
                            className="h-10 px-6 rs-bevel hover:border-white text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-[2px] hover:bg-white/5 flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                        </button>
                        <button
                            onClick={onDelete}
                            className="h-10 px-6 bg-rs-destruct hover:bg-rs-destruct/90 text-white text-[10px] font-black uppercase tracking-widest transition-all rounded-[2px] flex items-center gap-2 border border-transparent shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Purge</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
