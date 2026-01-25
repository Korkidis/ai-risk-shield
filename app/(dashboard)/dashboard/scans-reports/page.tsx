"use client";

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Search,
    ChevronRight,
    Loader2,
    AlertOctagon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanWithRelations } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { RSInput } from '@/components/rs/RSInput'
import { RSTextarea } from '@/components/rs/RSTextarea'
import { RSButton } from '@/components/rs/RSButton'
import { RSBulkActionBar } from '@/components/rs/RSBulkActionBar'
import { RSCardActionOverlay } from '@/components/rs/RSCardActionOverlay'
import { RSTechnicalDraftingSubstrate } from '@/components/rs/RSTechnicalDraftingSubstrate'

// Helper for risk colors matching Braun aesthetic
const getRiskColor = (v: string) => {
    const lowerV = v.toLowerCase();
    if (lowerV.includes('safe') || lowerV.includes('low')) return 'var(--rs-safe)';
    if (lowerV.includes('review')) return 'var(--rs-signal)';
    if (lowerV.includes('high')) return 'var(--rs-alert)';
    if (lowerV.includes('critical')) return 'var(--rs-destruct)';
    return 'var(--rs-text-tertiary)';
}

export default function ScansReportsPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date_desc')
    const [filterRisk, setFilterRisk] = useState(searchParams.get('risk') || 'all')
    const [page, setPage] = useState(1)
    const itemsPerPage = 20

    const [scans, setScans] = useState<ScanWithRelations[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedScanId, setSelectedScanId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
    const [showDetails, setShowDetails] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // URL Sync
    const updateUrl = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (searchTerm) params.set('q', searchTerm)
        else params.delete('q')
        if (sortBy !== 'date_desc') params.set('sort', sortBy)
        else params.delete('sort')
        if (filterRisk !== 'all') params.set('risk', filterRisk)
        else params.delete('risk')

        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }, [searchTerm, sortBy, filterRisk, searchParams, router, pathname])

    useEffect(() => {
        const timer = setTimeout(updateUrl, 500)
        return () => clearTimeout(timer)
    }, [updateUrl])

    // Data Fetching
    const fetchScans = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/scans/list')
            if (!response.ok) throw new Error('Failed to fetch records')
            const data = await response.json()

            const mappedScans: ScanWithRelations[] = data.scans.map((s: any) => ({
                ...s,
                filename: s.assets?.filename || 'Unnamed Asset',
                file_type: s.assets?.file_type || 'image',
                risk_profile: s.risk_profile || {
                    verdict: s.risk_level === 'critical' ? 'Critical Risk' :
                        s.risk_level === 'high' ? 'High Risk' :
                            s.risk_level === 'review' ? 'Review Recommended' : 'Low Risk',
                    composite_score: s.composite_score || 0,
                    ip_report: { score: s.ip_risk_score || 0 },
                    safety_report: { score: s.safety_risk_score || 0 },
                    provenance_report: { score: s.provenance_risk_score || 0 },
                    c2pa_report: { status: s.provenance_status }
                }
            }))

            setScans(mappedScans)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchScans()
    }, [])

    const selectedScan = scans.find(s => s.id === selectedScanId)

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
        if (confirm('Are you sure you want to purge this record from the archive?')) {
            setScans(prev => prev.filter(s => s.id !== id))
            setSelectedIds(prev => prev.filter(v => v !== id))
            if (selectedScanId === id) {
                setSelectedScanId(null)
                setShowDetails(false)
            }
        }
    }

    const [notesBuffer, setNotesBuffer] = useState('')

    // Sync buffer when selection changes
    useEffect(() => {
        if (selectedScan) {
            setNotesBuffer(selectedScan.notes || '')
        }
    }, [selectedScanId, scans]) // Update when scan selection or data changes

    const handleSaveNotes = (newNotes: string) => {
        if (!selectedScanId) return
        // Only save if changed
        const currentNotes = scans.find(s => s.id === selectedScanId)?.notes
        if (newNotes === currentNotes) return

        setUpdating(true)
        // Simulate API call
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
                const matchesRisk = filterRisk === 'all' || s.risk_profile?.verdict.toLowerCase().includes(filterRisk.toLowerCase())
                return matchesSearch && matchesRisk
            })
            .sort((a, b) => {
                const dateA = new Date(a.created_at).getTime()
                const dateB = new Date(b.created_at).getTime()
                return sortBy === 'date_desc' ? dateB - dateA : dateA - dateB
            })
    }, [scans, searchTerm, filterRisk, sortBy])

    const visibleScans = useMemo(() => {
        return filteredScans.slice(0, page * itemsPerPage)
    }, [filteredScans, page])

    return (
        <RSTechnicalDraftingSubstrate
            showRulers={false}
            showWatermark={true}
            showFocalPoint={false}
            showGridLines={true}
            contentPadding="p-0"
            className="bg-[#F9F8F6]"
        >
            <div className="flex flex-col h-full w-full overflow-hidden">
                {/* Header Module - Precision Toolbar */}
                <header className="w-full border-b border-[var(--rs-border-primary)] bg-white px-6 md:px-12 py-5 z-20 shrink-0">
                    <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-6">
                        {/* Title & Quota */}
                        <div className="flex items-center gap-6 shrink-0">
                            <h1 className="text-rs-text-primary text-xl font-black tracking-tight rs-type-section whitespace-nowrap">
                                VALIDATION_ARCHIVE
                            </h1>
                            <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-[#f8f8f7] border border-rs-border-primary/30 rounded-[2px]">
                                <span className="text-[9px] font-mono text-rs-text-tertiary uppercase tracking-widest">Usage_Quota:</span>
                                <span className="text-[10px] font-mono font-bold text-rs-text-primary">15/50_SCANS</span>
                            </div>
                        </div>

                        {/* Horizontal Control Bay */}
                        <div className="flex-1 flex items-center justify-center gap-3 max-w-4xl">
                            {/* Search Registry */}
                            <div className="relative w-full max-w-[280px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rs-text-tertiary" />
                                <RSInput
                                    placeholder="QUERY_ARCHIVE..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-8 pl-9 bg-white border-rs-border-primary text-[10px] font-mono uppercase focus:ring-1 focus:ring-rs-text-primary rounded-[2px] transition-all placeholder:text-rs-text-tertiary/50"
                                />
                            </div>

                            {/* Filter Segmented Control */}
                            <div className="flex items-center p-0.5 bg-rs-gray-50 border border-rs-border-primary rounded-[2px] h-8">
                                {(['all', 'high', 'critical'] as const).map((risk) => (
                                    <button
                                        key={risk}
                                        onClick={() => setFilterRisk(risk)}
                                        className={cn(
                                            "h-full px-3 text-[9px] font-black uppercase tracking-widest transition-all rounded-[1px] flex items-center",
                                            filterRisk === risk
                                                ? "bg-white text-rs-text-primary shadow-sm ring-1 ring-black/5"
                                                : "text-rs-text-tertiary hover:text-rs-text-primary hover:bg-black/5"
                                        )}
                                    >
                                        {risk === 'all' ? 'All' : risk}
                                    </button>
                                ))}
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center p-0.5 bg-rs-gray-50 border border-rs-border-primary rounded-[2px] h-8">
                                {(['grid', 'list'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={cn(
                                            "w-8 h-full flex items-center justify-center transition-all rounded-[1px]",
                                            viewMode === mode
                                                ? "bg-white text-rs-text-primary shadow-sm ring-1 ring-black/5"
                                                : "text-rs-text-tertiary hover:text-rs-text-primary hover:bg-black/5"
                                        )}
                                    >
                                        {mode === 'grid'
                                            ? <div className="w-3 h-3 border-2 border-current rounded-[0.5px]" />
                                            : <div className="w-3 h-[2px] bg-current rounded-[0.5px]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Primary Action */}
                        <div className="flex items-center gap-4 shrink-0">
                            <RSButton variant="primary" className="h-8 px-6 text-[10px] font-black tracking-widest uppercase bg-rs-text-primary hover:bg-rs-text-primary/95 text-white rounded-[2px] shadow-sm">
                                NEW_VALIDATION
                            </RSButton>
                        </div>
                    </div>
                </header>

                {/* Forensic Field Substrate */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
                    <div className="max-w-[1800px] w-full mx-auto px-6 md:px-12 py-12 flex-1 z-10">
                        {isLoading ? (
                            <div className="w-full aspect-[2/1] min-h-[400px] flex flex-col items-center justify-center border border-rs-border-primary/20 border-dashed bg-white">
                                <Loader2 className="w-8 h-8 text-rs-text-primary/10 animate-spin mb-6" />
                                <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-rs-text-tertiary">Accessing_Dossier_Archive...</span>
                            </div>
                        ) : error ? (
                            <div className="w-full aspect-[2/1] min-h-[400px] flex flex-col items-center justify-center border border-rs-destruct/10 bg-rs-destruct/5">
                                <AlertOctagon className="w-10 h-10 text-rs-destruct mb-6" />
                                <span className="text-[10px] uppercase font-mono tracking-widest text-rs-destruct font-bold">{error}</span>
                                <RSButton variant="ghost" onClick={fetchScans} className="mt-10 uppercase tracking-widest text-xs">Re-Establish_Link</RSButton>
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "grid gap-8",
                                    viewMode === 'grid'
                                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
                                        : "grid-cols-1"
                                )}>
                                    <AnimatePresence mode="popLayout">
                                        {visibleScans.map(scan => (
                                            <ScanCard
                                                key={scan.id}
                                                scan={scan}
                                                isSelected={selectedScanId === scan.id}
                                                isBulkSelected={selectedIds.includes(scan.id)}
                                                onBulkToggle={(checked) => {
                                                    setSelectedIds(prev => checked
                                                        ? [...prev, scan.id]
                                                        : prev.filter(id => id !== scan.id)
                                                    )
                                                }}
                                                onClick={() => handleScanClick(scan.id)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {filteredScans.length > visibleScans.length && (
                                    <div className="mt-24 flex justify-center pb-12">
                                        <RSButton
                                            variant="ghost"
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-16 py-6 text-[10px] font-mono font-black border border-dashed border-rs-border-primary hover:border-rs-text-primary hover:bg-white transition-all uppercase tracking-[0.3em]"
                                        >
                                            Load_Next_Batch
                                        </RSButton>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Braun Diagnostic Detail Drawer */}
                <AnimatePresence>
                    {showDetails && selectedScan && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
                            className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#FDFDFC] border-l border-rs-border-strong shadow-[-40px_0_100px_rgba(0,0,0,0.1)] flex flex-col z-50 overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="h-16 border-b border-rs-border-primary flex items-center justify-between px-6 bg-white/50 backdrop-blur-md">
                                <div className="space-y-0.5">
                                    <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-rs-text-tertiary">Registry_Entry</h2>
                                    <p className="text-[10px] font-bold text-rs-text-primary uppercase tracking-wider truncate max-w-[280px]">{selectedScan?.filename}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="w-8 h-8 flex items-center justify-center border border-rs-border-primary hover:border-rs-text-primary text-rs-text-tertiary hover:text-rs-text-primary transition-all rounded-[1px] hover:bg-white"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                {/* Visual Asset Proof */}
                                <div className="relative aspect-video bg-[#F2F2F0] border border-rs-border-primary p-2 group shadow-inner">
                                    <div className="w-full h-full relative overflow-hidden border border-rs-border-primary/50 bg-white">
                                        <img
                                            src={selectedScan?.image_url || '/placeholder.png'}
                                            alt="Asset_Visual"
                                            className="w-full h-full object-contain grayscale-[0.2] transition-all group-hover:grayscale-0"
                                        />
                                    </div>
                                    <div className="absolute bottom-4 left-4 px-2 py-1 bg-white/90 backdrop-blur-sm border border-rs-border-primary text-[8px] font-mono text-rs-text-tertiary uppercase tracking-widest shadow-sm">
                                        ID: {selectedScan?.id.slice(0, 8).toUpperCase()}
                                    </div>
                                </div>

                                {/* Risk Diagnostic Summary */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">Forensic_Verdict</span>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                                style={{ backgroundColor: getRiskColor(selectedScan?.risk_profile?.verdict || '') }}
                                            />
                                            <span className="text-[10px] font-black font-mono text-rs-text-primary uppercase">Risk_Level_{selectedScan?.risk_profile?.composite_score}</span>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-white border border-rs-border-primary relative overflow-hidden shadow-sm">
                                        <div
                                            className="text-2xl font-black uppercase tracking-tighter mb-2"
                                            style={{ color: getRiskColor(selectedScan?.risk_profile?.verdict || '') }}
                                        >
                                            {selectedScan?.risk_profile?.verdict?.replace('_', ' ') || 'PENDING'}
                                        </div>
                                        <p className="text-[10px] text-rs-text-secondary leading-relaxed font-medium">
                                            {selectedScan?.risk_profile?.chief_officer_strategy || 'Forensic analysis suggest provenance signature with system confidence of ' + selectedScan?.risk_profile?.composite_score + '%.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Modular Metrics Bay */}
                                <div className="grid grid-cols-2 gap-px bg-rs-border-primary border border-rs-border-primary">
                                    {[
                                        { label: 'IP_PROVENANCE', score: selectedScan?.risk_profile?.ip_report?.score, max: 100 },
                                        { label: 'SAFETY_THRESHOLD', score: selectedScan?.risk_profile?.safety_report?.score, max: 100 },
                                        { label: 'C2PA_INTEGRITY', score: selectedScan?.risk_profile?.c2pa_report?.status === 'valid' ? 'VALID' : 'VOID', type: 'status' },
                                        { label: 'CHRONO_REF', score: formatDistanceToNow(new Date(selectedScan?.created_at || new Date())).toUpperCase(), type: 'date' }
                                    ].map((metric, i) => (
                                        <div key={i} className="bg-white p-3 space-y-1 hover:bg-rs-gray-50 transition-colors">
                                            <span className="text-[8px] font-mono text-rs-text-tertiary uppercase tracking-widest">{metric.label}</span>
                                            <div className="text-[11px] font-black text-rs-text-primary uppercase tracking-tight">
                                                {metric.score !== undefined ? metric.score : 'N/A'}{metric.max ? `/${metric.max}` : ''}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Internal Annotations */}
                                <div className="space-y-2 pt-4 border-t border-rs-border-primary/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">Analyst_Notes</span>
                                        {updating && <Loader2 className="w-3 h-3 text-rs-text-tertiary animate-spin" />}
                                    </div>
                                    <RSTextarea
                                        placeholder="// START_KEYBOARD_STREAM..."
                                        rows={4}
                                        value={notesBuffer}
                                        onChange={(e) => setNotesBuffer(e.target.value)}
                                        onBlur={(e) => handleSaveNotes(e.target.value)}
                                        className="bg-white border-rs-border-primary text-[10px] font-mono p-3 focus:border-rs-text-primary rounded-[1px] shadow-none resize-none"
                                    />
                                </div>

                                {/* Management Actions */}
                                <div className="pt-8 flex flex-col gap-2">
                                    <RSButton variant="ghost" className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-rs-border-primary hover:bg-rs-gray-50 hover:border-rs-text-primary transition-all">Export_Dossier</RSButton>
                                    <RSButton
                                        variant="ghost"
                                        className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-rs-border-primary text-rs-destruct hover:bg-rs-destruct/5 hover:border-rs-destruct transition-all"
                                        onClick={(e) => handleDelete(e, selectedScan?.id || '')}
                                    >
                                        Purge_Archive
                                    </RSButton>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bulk Action Bar Integration */}
                <RSBulkActionBar
                    selectedCount={selectedIds.length}
                    onClear={() => setSelectedIds([])}
                    onDownload={() => console.log('Download batch', selectedIds)}
                    onShare={() => console.log('Share batch', selectedIds)}
                    onDelete={() => {
                        if (confirm(`Purge ${selectedIds.length} records from the archive?`)) {
                            setScans(prev => prev.filter(s => !selectedIds.includes(s.id)))
                            setSelectedIds([])
                        }
                    }}
                />
            </div>
        </RSTechnicalDraftingSubstrate>
    )
}

function ScanCard({ scan, isSelected, isBulkSelected, onBulkToggle, onClick }: {
    scan: ScanWithRelations;
    isSelected: boolean;
    isBulkSelected: boolean;
    onBulkToggle: (checked: boolean) => void;
    onClick: () => void
}) {
    const verdict = scan.risk_profile?.verdict || 'PENDING';
    const score = scan.risk_profile?.composite_score || 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClick}
            className={cn(
                "group/card cursor-pointer bg-white relative transition-all duration-300 overflow-hidden shadow-sm",
                "hover:shadow-md",
                isSelected ? "ring-2 ring-rs-text-primary z-10" : ""
            )}
        >
            {/* 1. Thumbnail Area (60%) */}
            <div className="relative aspect-[16/10] w-full bg-[#FAFAF9] overflow-hidden p-3 transition-colors group-hover/card:bg-[#F2F2F0]">
                {/* Image Container with precise border */}
                <div className="w-full h-full relative group/thumb overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                    {scan.image_url ? (
                        <img
                            src={scan.image_url}
                            className="w-full h-full object-cover transition-all duration-700 grayscale-[0.1] contrast-[1.05] group-hover:grayscale-0 group-hover:scale-105"
                            alt={scan.filename}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-rs-gray-50/50 to-white/20" />
                            <div className="w-12 h-12 rounded-full border border-rs-border-primary flex items-center justify-center mb-2 bg-white/50 backdrop-blur-sm">
                                <div className="text-[10px] font-black opacity-30">IMG</div>
                            </div>
                            <div className="text-[32px] font-black opacity-10 tracking-tighter">{score}</div>
                        </div>
                    )}

                    {/* Score Badge (Top-Right) */}
                    <div className={cn(
                        "absolute top-0 right-0 w-12 h-10 flex flex-col items-center justify-center text-white z-20 transition-transform group-hover/thumb:scale-105 shadow-md backdrop-blur-sm",
                        verdict.toLowerCase().includes('critical') ? "bg-rs-destruct/90" :
                            verdict.toLowerCase().includes('high') ? "bg-rs-alert/90" :
                                verdict.toLowerCase().includes('review') ? "bg-rs-signal/90" : "bg-rs-safe/90"
                    )}>
                        <span className="text-[14px] font-black leading-none tracking-tight">{score}</span>
                        <span className="text-[7px] font-mono opacity-80 mt-[1px]">/100</span>
                    </div>

                    {/* File Type Icon (Top-Left) */}
                    <div className="absolute top-2 left-2 p-1.5 bg-rs-text-primary/10 backdrop-blur-md border border-white/20 text-rs-text-primary z-10 opacity-70 group-hover/card:opacity-100 transition-opacity">
                        {scan.file_type === 'video' ? <div className="w-3 h-3 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent ml-0.5" /> : <div className="w-3 h-3 border-[1.5px] border-current rounded-[1px]" />}
                    </div>

                    {/* Hover Action Overlay Integration */}
                    <RSCardActionOverlay
                        onDownload={(e) => { e.stopPropagation(); console.log('Download', scan.id); }}
                        onShare={(e) => { e.stopPropagation(); console.log('Share', scan.id); }}
                        className="opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200"
                    />
                </div>

                {/* Bulk Selector */}
                <div
                    className="absolute top-1 left-1 z-40 p-1.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={isBulkSelected}
                        onChange={(e) => onBulkToggle(e.target.checked)}
                        className={cn(
                            "w-4 h-4 appearance-none border border-rs-border-primary bg-white shadow-sm transition-all cursor-pointer rounded-[2px]",
                            "checked:bg-rs-text-primary checked:border-rs-text-primary relative",
                            "after:content-[''] after:hidden checked:after:block after:w-2 after:h-2 after:bg-white after:absolute after:top-1 after:left-1 after:rounded-[1px]"
                        )}
                    />
                </div>
            </div>

            {/* 2. Metadata Area */}
            <div className="px-4 pb-5 pt-2 space-y-3 bg-white">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full",
                            verdict.toLowerCase().includes('critical') ? "bg-rs-destruct" :
                                verdict.toLowerCase().includes('high') ? "bg-rs-alert" :
                                    verdict.toLowerCase().includes('review') ? "bg-rs-signal" : "bg-rs-safe"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: getRiskColor(verdict) }}>
                            {verdict.replace('_', ' ')}
                        </span>
                    </div>
                    <h3 className="text-[11px] font-bold text-rs-text-primary uppercase tracking-normal leading-tight truncate">
                        {scan.filename}
                    </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-rs-border-primary/40">
                    <div className="flex items-center gap-2 text-[9px] font-mono text-rs-text-tertiary uppercase tracking-normal">
                        <span>{formatDistanceToNow(new Date(scan.created_at), { addSuffix: true }).replace('about ', '')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-60">
                        <span className="text-[9px] font-black text-rs-text-tertiary uppercase tracking-widest">
                            {scan.id.slice(-4)}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
