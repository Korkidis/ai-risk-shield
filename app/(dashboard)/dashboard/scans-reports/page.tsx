"use client";

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
    Search,
    Grid,
    MoreVertical,
    FileText,
    Share2,
    Download,
    Trash2,
    Plus,
    ChevronRight,
    MessageSquare,
    CheckCircle2,
    AlertTriangle,
    AlertOctagon,
    Loader2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanWithRelations } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { MOCK_SCANS } from '@/lib/mock-data'
import { RSSelect } from '@/components/rs/RSSelect'
import { RSInput } from '@/components/rs/RSInput'
import { RSTextarea } from '@/components/rs/RSTextarea'
import { RSButton } from '@/components/rs/RSButton'
import { RSDraftingBoard } from '@/components/rs/RSDraftingBoard'

export default function ScansReportsPage() {
    const [scans, setScans] = useState<ScanWithRelations[]>(MOCK_SCANS)
    const [selectedScanId, setSelectedScanId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('date_desc')
    const [filterRisk, setFilterRisk] = useState('all')

    // Details Panel State
    const [showDetails, setShowDetails] = useState(false)
    const [updating, setUpdating] = useState(false)

    // Derived State
    const selectedScan = scans.find(s => s.id === selectedScanId)

    // Handlers
    const handleScanClick = (id: string) => {
        if (selectedScanId === id) {
            setShowDetails(!showDetails)
        } else {
            setSelectedScanId(id)
            setShowDetails(true)
        }
    }

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this scan record?')) {
            setScans(prev => prev.filter(s => s.id !== id))
            if (selectedScanId === id) {
                setSelectedScanId(null)
                setShowDetails(false)
            }
        }
    }

    const handleSaveNotes = (newNotes: string) => {
        if (!selectedScanId) return
        setUpdating(true)
        setTimeout(() => {
            setScans(prev => prev.map(s =>
                s.id === selectedScanId ? { ...s, notes: newNotes } : s
            ))
            setUpdating(false)
        }, 800)
    }

    const filteredScans = useMemo(() => {
        return scans
            .filter(s => {
                const matchesSearch = s.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    s.id.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesRisk = filterRisk === 'all' || s.risk_profile?.verdict.toLowerCase() === filterRisk
                return matchesSearch && matchesRisk
            })
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime()
                const dateB = new Date(b.created_at).getTime()
                return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB
            })
    }, [scans, searchTerm, filterRisk, sortBy])

    return (
        <RSDraftingBoard className="flex h-full gap-6 p-6">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden z-10 w-full h-full relative">
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div>
                        <h1 className="text-[var(--rs-text-primary)] text-lg font-medium tracking-tight flex items-center gap-3">
                            <span className="w-2 h-2 bg-rs-signal rounded-full shadow-[0_0_8px_var(--rs-signal)] animate-pulse" />
                            SCANS_&_REPORTS_DATABASE
                        </h1>
                        <p className="text-xs font-mono text-rs-text-tertiary mt-1 uppercase tracking-widest pl-5">
                            // ARCHIVE_ID: {scans.length.toString().padStart(4, '0')} // RECORDS_FOUND: {filteredScans.length}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex bg-[var(--rs-bg-element)] p-1 rounded-[var(--rs-radius-small)] border border-rs-border-primary shadow-[var(--rs-shadow-socket)]">
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-1.5 rounded-[2px] transition-all",
                                    viewMode === 'list' ? "bg-rs-text-primary text-[var(--rs-bg-surface)]" : "text-rs-text-tertiary hover:text-rs-text-primary"
                                )}
                            >
                                <MoreVertical size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-1.5 rounded-[2px] transition-all",
                                    viewMode === 'grid' ? "bg-rs-text-primary text-[var(--rs-bg-surface)]" : "text-rs-text-tertiary hover:text-rs-text-primary"
                                )}
                            >
                                <Grid size={14} />
                            </button>
                        </div>
                        <RSButton variant="primary" icon={<Plus size={14} />}>NEW_SCAN</RSButton>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-end bg-[#EBE7E0] p-4 border border-black/5 rounded-[4px] shadow-[var(--rs-shadow-socket)]">
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rs-text-tertiary" />
                            <RSInput
                                placeholder="SEARCH_PROTOCOL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-xs font-mono uppercase bg-rs-white shadow-[var(--rs-shadow-socket)]"
                                icon={<Search className="w-4 h-4 text-rs-text-tertiary" />}
                            />
                        </div>

                        <RSSelect
                            value={filterRisk}
                            onChange={(e) => setFilterRisk(e.target.value)}
                            options={[
                                { value: 'all', label: 'RISK: ALL' },
                                { value: 'safe', label: 'RISK: SAFE' },
                                { value: 'high', label: 'RISK: HIGH' },
                                { value: 'critical', label: 'RISK: CRITICAL' }
                            ]}
                            className="w-40 bg-rs-white shadow-[var(--rs-shadow-socket)]"
                        />

                        <RSSelect
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            options={[
                                { value: 'date_desc', label: 'SORT: NEWEST' },
                                { value: 'date_asc', label: 'SORT: OLDEST' }
                            ]}
                            className="w-40 bg-rs-white shadow-[var(--rs-shadow-socket)]"
                        />
                    </div>
                </div>

                {/* Scrollable List Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <motion.div
                        layout
                        className={cn(
                            "grid gap-3 pb-20",
                            viewMode === 'grid' ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                        )}
                    >
                        <AnimatePresence>
                            {filteredScans.map(scan => (
                                <ScanCard
                                    key={scan.id}
                                    scan={scan}
                                    isSelected={selectedScanId === scan.id}
                                    onClick={() => handleScanClick(scan.id)}
                                />
                            ))}
                        </AnimatePresence>

                        {filteredScans.length === 0 && (
                            <div className="col-span-full h-32 flex flex-col items-center justify-center border border-dashed border-black/10 rounded text-rs-text-disabled">
                                <FileText size={24} className="opacity-20 mb-2" />
                                <span className="text-xs uppercase tracking-widest">No Records Found</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Slide-out Details Panel */}
            <AnimatePresence>
                {showDetails && selectedScan && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="w-[450px] bg-[#EBE7E0] border-l border-white/50 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] flex flex-col relative z-20"
                    >
                        {/* Panel Header */}
                        <div className="h-16 border-b border-black/5 flex items-center justify-between px-6 bg-[#E6E2DB]">
                            <div className="flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-rs-signal" />
                                <div>
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--rs-text-primary)]">Details_Log</h2>
                                    <p className="text-[10px] font-mono text-rs-text-tertiary">{selectedScan.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="text-rs-text-tertiary hover:text-rs-text-primary transition-colors"
                            >
                                <ChevronRight />
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                            {/* Preview Image */}
                            <div className="relative aspect-video bg-black rounded-[4px] border-2 border-white/50 shadow-[var(--rs-shadow-socket)] overflow-hidden group">
                                <img
                                    src={selectedScan.image_url || '/placeholder.png'}
                                    alt="Scan Target"
                                    className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute top-2 right-2 bg-black/80 text-white text-[9px] px-2 py-0.5 font-mono border border-white/20">
                                    IMG_PREVIEW
                                </div>
                            </div>

                            {/* Risk Verdict */}
                            <div className="p-4 bg-[var(--rs-bg-element)] border border-rs-border-primary rounded-[var(--rs-radius-small)] shadow-[var(--rs-shadow-bevel)]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-widest text-rs-text-tertiary">Verdict Analysis</span>
                                    {selectedScan.risk_profile?.verdict === 'safe' && <CheckCircle2 className="text-rs-safe w-4 h-4" />}
                                    {selectedScan.risk_profile?.verdict === 'high' && <AlertTriangle className="text-rs-alert w-4 h-4" />}
                                    {selectedScan.risk_profile?.verdict === 'critical' && <AlertOctagon className="text-rs-destruct w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "text-2xl font-black uppercase tracking-tighter mb-1",
                                    selectedScan.risk_profile?.verdict === 'critical' ? "text-rs-destruct" :
                                        selectedScan.risk_profile?.verdict === 'high' ? "text-rs-alert" : "text-rs-safe"
                                )}>
                                    {selectedScan.risk_profile?.verdict || 'PENDING'}
                                </div>
                                <p className="text-xs text-rs-text-secondary leading-relaxed">
                                    {selectedScan.risk_profile?.summary || 'Analysis in progress...'}
                                </p>
                            </div>

                            {/* Scores */}
                            <div className="space-y-3 font-mono text-xs">
                                <div className="flex justify-between items-center py-2 border-b border-black/5 border-dashed">
                                    <span className="text-rs-text-tertiary">IP_SCORE</span>
                                    <span className="text-[var(--rs-text-primary)]">{selectedScan.risk_profile?.ip_report?.score || 0}/100</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-black/5 border-dashed">
                                    <span className="text-rs-text-tertiary">SAFETY_SCORE</span>
                                    <span className="text-[var(--rs-text-primary)]">{selectedScan.risk_profile?.safety_report?.score || 0}/100</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-black/5 border-dashed">
                                    <span className="text-rs-text-tertiary">C2PA_VERIFIED</span>
                                    <span className={selectedScan.risk_profile?.c2pa_report?.status === 'verified' ? "text-rs-safe" : "text-rs-destruct"}>
                                        {selectedScan.risk_profile?.c2pa_report?.status ? 'YES' : 'NO'}
                                    </span>
                                </div>
                            </div>

                            {/* Field Notes (Editable) */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rs-text-secondary">
                                        <MessageSquare size={12} />
                                        Field Notes
                                    </div>
                                    {updating && <Loader2 className="w-3 h-3 text-rs-signal animate-spin" />}
                                </div>
                                <RSTextarea
                                    placeholder="// ENTER FIELD NOTES..."
                                    minRows={5}
                                    value={selectedScan.notes || ''}
                                    onBlur={(e) => handleSaveNotes(e.target.value)}
                                    className="bg-rs-white shadow-[var(--rs-shadow-socket)]"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-black/5 flex gap-2">
                                <RSButton className="flex-1" variant="ghost" icon={<Share2 size={14} />}>Share</RSButton>
                                <RSButton className="flex-1" variant="ghost" icon={<Download size={14} />}>Export</RSButton>
                                <RSButton
                                    className="flex-1 text-rs-destruct hover:bg-rs-destruct/10 hover:border-rs-destruct"
                                    variant="ghost"
                                    icon={<Trash2 size={14} />}
                                    onClick={(e) => handleDelete(e, selectedScan.id)}
                                >
                                    Delete
                                </RSButton>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </RSDraftingBoard>
    )
}

function ScanCard({ scan, isSelected, onClick }: { scan: ScanWithRelations; isSelected: boolean; onClick: () => void }) {
    return (
        <motion.div
            layout
            onClick={onClick}
            className={cn(
                "group cursor-pointer bg-rs-white border-2 rounded-[6px] p-4 transition-all duration-200 relative overflow-hidden font-mono",
                isSelected
                    ? "border-rs-black shadow-[var(--rs-shadow-bevel)] z-10 scale-[1.02]"
                    : "border-rs-gray-200 hover:border-rs-black hover:shadow-[var(--rs-shadow-bevel)] hover:-translate-y-1"
            )}
        >
            {/* Status Indicator LED */}
            <div className={cn(
                "absolute top-0 right-0 w-16 h-16 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20",
                scan.risk_profile?.verdict === 'critical' ? 'bg-rs-destruct' :
                    scan.risk_profile?.verdict === 'high' ? 'bg-rs-alert' : 'bg-rs-safe'
            )} style={{ filter: 'blur(20px)' }} />

            <div className="flex justify-between items-start relative z-10">
                <div className="flex gap-4 items-center">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 bg-black border border-rs-border-primary rounded-[2px] overflow-hidden relative shrink-0 shadow-[var(--rs-shadow-socket)]">
                        {scan.image_url ? (
                            <img src={scan.image_url} className="w-full h-full object-cover opacity-80" alt="thumb" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-rs-text-tertiary text-[8px]">NO_IMG</div>
                        )}
                    </div>

                    {/* Meta */}
                    <div>
                        <h3 className="text-[var(--rs-text-primary)] font-medium text-sm leading-tight mb-1 group-hover:text-rs-black transition-colors">
                            {scan.filename}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] font-mono text-rs-text-tertiary">
                            <span>ID: {scan.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}</span>
                        </div>
                    </div>
                </div>

                {/* Score Badge based on Verdict */}
                <div className={cn(
                    "px-2 py-1 rounded-[2px] border text-[10px] font-black uppercase tracking-wider",
                    scan.risk_profile?.verdict === 'critical' ? "bg-rs-destruct/10 border-rs-destruct text-rs-destruct" :
                        scan.risk_profile?.verdict === 'high' ? "bg-rs-alert/10 border-rs-alert text-rs-alert" :
                            "bg-rs-safe/10 border-rs-safe text-rs-safe"
                )}>
                    {scan.risk_profile?.verdict || 'PENDING'}
                </div>
            </div>

            {/* Mini Viz Bar */}
            <div className="mt-3 h-1 w-full bg-rs-gray-100 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]">
                <div
                    className={cn(
                        "h-full transition-all duration-500",
                        scan.risk_profile?.verdict === 'critical' ? "bg-rs-destruct" :
                            scan.risk_profile?.verdict === 'high' ? "bg-rs-alert" : "bg-rs-safe"
                    )}
                    style={{ width: `${Math.max(scan.risk_profile?.ip_report?.score || 0, scan.risk_profile?.safety_report?.score || 0)}%` }}
                />
            </div>
        </motion.div>
    )
}
