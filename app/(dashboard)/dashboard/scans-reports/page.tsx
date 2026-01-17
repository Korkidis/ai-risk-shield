'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    Trash2,
    Share2,
    Download,
    Loader2,
    SortAsc,
    Grid,
    Plus,
    ChevronRight,
    MessageSquare,
    Tag as TagIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanWithRelations } from '@/types/database'
import { format } from 'date-fns'
import { CustomSelect } from '@/components/ui/CustomSelect'

export default function ScansReportsPage() {
    const [scans, setScans] = useState<ScanWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedScan, setSelectedScan] = useState<ScanWithRelations | null>(null)
    const [filterRisk, setFilterRisk] = useState('all')
    const [filterType, setFilterType] = useState('all')
    const [sortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState('desc')
    const [updating, setUpdating] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchScans()
    }, [filterRisk, filterType, sortBy, sortOrder])

    const fetchScans = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                risk_level: filterRisk,
                file_type: filterType,
                sort_by: sortBy,
                sort_order: sortOrder
            })
            const res = await fetch(`/api/scans/list?${params.toString()}`)
            const data = await res.json()
            setScans(data.scans || [])
        } catch (err) {
            console.error('Failed to fetch scans:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveNotes = async (notes: string) => {
        if (!selectedScan) return
        setUpdating(true)
        try {
            await fetch(`/api/scans/${selectedScan.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ notes })
            })
            // Update local state
            setScans(prev => prev.map(s => s.id === selectedScan.id ? { ...s, notes } : s))
            setSelectedScan(prev => prev ? { ...prev, notes } : null)
        } catch (err) {
            console.error('Failed to save notes:', err)
        } finally {
            setUpdating(false)
        }
    }

    const handleAddTag = async () => {
        if (!selectedScan) return
        const tag = prompt('Enter a new tag:')
        if (!tag) return

        const newTags = [...(selectedScan.tags || []), tag]
        setUpdating(true)
        try {
            await fetch(`/api/scans/${selectedScan.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ tags: newTags })
            })
            setScans(prev => prev.map(s => s.id === selectedScan.id ? { ...s, tags: newTags } : s))
            setSelectedScan(prev => prev ? { ...prev, tags: newTags } : null)
        } catch (err) {
            console.error('Failed to add tag:', err)
        } finally {
            setUpdating(false)
        }
    }

    const handleRemoveTag = async (tagToRemove: string) => {
        if (!selectedScan) return
        const newTags = (selectedScan.tags || []).filter(t => t !== tagToRemove)
        setUpdating(true)
        try {
            await fetch(`/api/scans/${selectedScan.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ tags: newTags })
            })
            setScans(prev => prev.map(s => s.id === selectedScan.id ? { ...s, tags: newTags } : s))
            setSelectedScan(prev => prev ? { ...prev, tags: newTags } : null)
        } catch (err) {
            console.error('Failed to remove tag:', err)
        } finally {
            setUpdating(false)
        }
    }

    const handleShare = async () => {
        if (!selectedScan) return
        try {
            const res = await fetch(`/api/scans/${selectedScan.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ action: 'share' })
            })
            const data = await res.json()
            const shareUrl = `${window.location.origin}/report/share/${data.scan.share_token}`
            navigator.clipboard.writeText(shareUrl)
            alert('Share link copied to clipboard! Valid for 7 days.')
        } catch (err) {
            console.error('Failed to share:', err)
        }
    }

    const handleDelete = async () => {
        if (!selectedScan) return
        if (!confirm('Are you sure you want to delete this scan permanently?')) return

        try {
            await fetch(`/api/scans/${selectedScan.id}`, { method: 'DELETE' })
            setScans(prev => prev.filter(s => s.id !== selectedScan.id))
            setSelectedScan(null)
        } catch (err) {
            console.error('Failed to delete:', err)
        }
    }

    const handleDownloadPDF = async () => {
        if (!selectedScan) return

        try {
            const { jsPDF } = await import('jspdf')
            const doc = new jsPDF()

            doc.setFontSize(22)
            doc.text('AI Risk Shield - Forensic Report', 20, 20)

            doc.setFontSize(12)
            doc.text(`Filename: ${selectedScan.assets?.filename}`, 20, 40)
            doc.text(`Date: ${format(new Date(selectedScan.created_at), 'PPP')}`, 20, 50)
            doc.text(`Risk Level: ${selectedScan.risk_level?.toUpperCase()}`, 20, 60)
            doc.text(`Composite Score: ${selectedScan.composite_score}%`, 20, 70)

            doc.text('--- Risk Breakdown ---', 20, 90)
            doc.text(`IP Risk: ${selectedScan.ip_risk_score}%`, 20, 100)
            doc.text(`Brand Safety: ${selectedScan.safety_risk_score}%`, 20, 110)
            doc.text(`Provenance & Credentials: ${selectedScan.provenance_risk_score}%`, 20, 120)

            if (selectedScan.notes) {
                doc.text('--- Assessment Notes ---', 20, 140)
                doc.text(selectedScan.notes, 20, 150, { maxWidth: 170 })
            }

            doc.save(`Forensic_Report_${selectedScan.id.split('-')[0]}.pdf`)
        } catch (err) {
            console.error('Failed to generate PDF:', err)
            alert('Failed to generate PDF.')
        }
    }

    const filteredScans = scans.filter(s =>
        s.assets?.filename.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex h-full gap-6 relative overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white">Scans & Reports</h1>
                        <p className="text-slate-500 text-sm">Review risk history and compliance data.</p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by filename..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                            />
                        </div>

                        <div className="h-4 w-px bg-slate-800 mx-2 hidden md:block" />

                        <CustomSelect
                            value={filterRisk}
                            onChange={setFilterRisk}
                            options={[
                                { value: 'all', label: 'Risk Level: All' },
                                { value: 'critical', label: 'Risk Level: Critical' },
                                { value: 'high', label: 'Risk Level: High' },
                                { value: 'review', label: 'Risk Level: Review' },
                                { value: 'safe', label: 'Risk Level: Safe' }
                            ]}
                        />

                        <CustomSelect
                            value={filterType}
                            onChange={setFilterType}
                            options={[
                                { value: 'all', label: 'Asset Type: All' },
                                { value: 'image', label: 'Asset Type: Image' },
                                { value: 'video', label: 'Asset Type: Video' }
                            ]}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            className="p-2.5 text-slate-400 hover:text-white bg-slate-800/50 border border-slate-700/50 rounded-xl transition-all"
                            title="Toggle Sort Direction"
                        >
                            <SortAsc className={`w-4 h-4 transition-transform duration-300 ${sortOrder === 'asc' ? '' : 'rotate-180'}`} />
                        </button>
                    </div>
                </div>

                {/* Grid View */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                            <p className="text-slate-500 text-sm font-medium animate-pulse">Syncing reports...</p>
                        </div>
                    ) : filteredScans.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/10">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                                <Grid className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-medium">No scans found</p>
                            <p className="text-xs mt-1">Try adjusting your filters or upload a new asset.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
                            {filteredScans.map((scan) => (
                                <ScanCard
                                    key={scan.id}
                                    scan={scan}
                                    isSelected={selectedScan?.id === scan.id}
                                    onClick={() => setSelectedScan(scan)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Side Panel / Detail Sidebar */}
            <AnimatePresence>
                {selectedScan && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-96 bg-[#020617] border-l border-slate-800 p-8 flex flex-col gap-8 shadow-2xl z-[60]"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Report Details</h2>
                                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">ID: {selectedScan.id.split('-')[0]}...</p>
                            </div>
                            <button
                                onClick={() => setSelectedScan(null)}
                                className="p-2 text-slate-500 hover:text-white bg-slate-900 rounded-lg border border-slate-800 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Preview Area */}
                        <div className="aspect-video bg-slate-950 rounded-2xl border-2 border-slate-800 flex flex-col items-center justify-center overflow-hidden group/preview relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 to-transparent" />
                            <div className="relative z-10 text-center space-y-2">
                                <Search className="w-8 h-8 text-slate-800 mx-auto group-hover/preview:text-indigo-500/50 transition-colors" />
                                <div className="text-[10px] font-black text-slate-700 group-hover/preview:text-slate-500 transition-colors uppercase tracking-[0.2em]">
                                    {selectedScan.assets?.file_type === 'video' ? 'VIDEO SOURCE' : 'IMAGE SOURCE'}
                                </div>
                            </div>
                        </div>

                        {/* Scores */}
                        <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800">
                            <ScoreRow label="Composite Risk" score={selectedScan.composite_score || 0} isMain />
                            <div className="grid grid-cols-3 gap-3 mt-6">
                                <ScoreMini label="IP" score={selectedScan.ip_risk_score || 0} />
                                <ScoreMini label="Safety" score={selectedScan.safety_risk_score || 0} />
                                <ScoreMini label="Prov." score={selectedScan.provenance_risk_score || 0} />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={handleDownloadPDF}
                                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl text-xs font-black transition-all border border-slate-700 active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                PDF
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl text-xs font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                            >
                                <Share2 className="w-4 h-4" />
                                SHARE
                            </button>
                        </div>

                        {/* Notes & Tags */}
                        <div className="flex-1 flex flex-col gap-8 min-h-0">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3 text-indigo-500" /> Assessment Notes
                                    </span>
                                    {updating && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />}
                                </div>
                                <textarea
                                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 min-h-[140px] placeholder:text-slate-800 transition-all resize-none font-medium leading-relaxed"
                                    placeholder="Add internal findings, legal notes, or approval status..."
                                    defaultValue={selectedScan.notes || ''}
                                    onBlur={(e) => handleSaveNotes(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <TagIcon className="w-3 h-3 text-indigo-500" /> Tags & Labels
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedScan.tags || []).map(t => (
                                        <div key={t} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-400 flex items-center gap-2 group/tag">
                                            {t}
                                            <button
                                                onClick={() => handleRemoveTag(t)}
                                                className="opacity-0 group-hover/tag:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={handleAddTag}
                                        className="w-8 h-8 rounded-lg border-2 border-slate-800 flex items-center justify-center text-slate-600 hover:text-indigo-400 hover:border-indigo-500/50 border-dashed transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Dangerous Zone */}
                        <div className="pt-6 border-t border-slate-800/50">
                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-center gap-2 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all w-full py-4 bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/20 active:scale-95"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Purge Forensic Record
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ScanCard({ scan, isSelected, onClick }: { scan: ScanWithRelations; isSelected: boolean; onClick: () => void }) {
    const color = (s: number) => {
        if (s > 75) return 'text-red-400 border-red-500/30 bg-red-500/10'
        if (s > 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10'
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    }

    return (
        <motion.div
            whileHover={{ y: -4 }}
            onClick={onClick}
            className={`group cursor-pointer bg-slate-900/40 border-2 rounded-2xl p-4 transition-all ${isSelected ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'}`}
        >
            <div className="aspect-video bg-slate-950 rounded-xl border border-slate-800/50 mb-4 overflow-hidden relative">
                {/* Real image would go here */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                    <span className="text-[8px] font-mono text-slate-800 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">Forensic Preview</span>
                </div>

                {/* Score Badge */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg border backdrop-blur-md text-[10px] font-black uppercase tracking-tight ${color(scan.composite_score || 0)}`}>
                    {scan.composite_score}%
                </div>
            </div>

            <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{scan.assets?.filename || 'Untitled Scan'}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{format(new Date(scan.created_at), 'MMM dd, yyyy • HH:mm')}</p>
                </div>
                <div className="flex-shrink-0 pt-1">
                    <div className={`w-2 h-2 rounded-full ${scan.status === 'processing' ? 'bg-indigo-500 animate-pulse' : scan.status === 'failed' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                </div>
            </div>
        </motion.div>
    )
}

function ScoreRow({ label, score, isMain = false }: { label: string; score: number; isMain?: boolean }) {
    const getColor = (s: number) => {
        if (s > 75) return 'text-red-500'
        if (s > 40) return 'text-amber-500'
        return 'text-emerald-500'
    }

    return (
        <div className="flex items-center justify-between group">
            <span className={`text-slate-500 font-bold uppercase tracking-widest ${isMain ? 'text-xs' : 'text-[10px]'}`}>{label}</span>
            <span className={`font-black tracking-tighter ${isMain ? 'text-4xl' : 'text-lg'} ${getColor(score)}`}>
                {score}<span className="text-slate-700 text-sm ml-0.5 font-normal">/100</span>
            </span>
        </div>
    )
}

function ScoreMini({ label, score }: { label: string; score: number }) {
    return (
        <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-center">
            <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mb-1">{label}</div>
            <div className={`text-sm font-black ${score > 75 ? 'text-red-400' : score > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{score}</div>
        </div>
    )
}
