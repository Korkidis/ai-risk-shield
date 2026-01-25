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
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]"
                >
                    <div className="bg-rs-text-primary text-white px-8 py-4 flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 rounded-[2px] min-w-[500px]">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                                {selectedCount}_RECORD(S)_SELECTED
                            </span>
                            <button
                                onClick={onClear}
                                className="p-1 hover:bg-white/10 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="h-4 w-[1px] bg-white/20" />

                        <div className="flex items-center gap-6">
                            <button
                                onClick={onDownload}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-rs-safe transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Download_Batch</span>
                            </button>
                            <button
                                onClick={onShare}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-rs-signal transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Share_Batch</span>
                            </button>
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-rs-destruct transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Purge_Selection</span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
