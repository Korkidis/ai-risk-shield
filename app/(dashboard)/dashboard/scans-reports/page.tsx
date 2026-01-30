"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Search,
    ChevronRight,
    Loader2,
    AlertOctagon,
    Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanWithRelations } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { RSTextarea } from '@/components/rs/RSTextarea'
import { RSButton } from '@/components/rs/RSButton'
import { RSBulkActionBar } from '@/components/rs/RSBulkActionBar'
import { getRiskTier } from '@/lib/risk-utils'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSModal } from '@/components/rs/RSModal'
import { RSFileUpload } from '@/components/rs/RSFileUpload'
import { ProvenanceTelemetryStream } from '@/components/rs/ProvenanceTelemetryStream'
import { RSProcessingPanel } from '@/components/rs/RSProcessingPanel'

// Wrapper to handle Suspense boundary for useSearchParams
export default function ScansReportsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-rs-text-tertiary" />
            </div>
        }>
            <ScansReportsContent />
        </Suspense>
    );
}

function ScansReportsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')
    const [sortBy] = useState(searchParams.get('sort') || 'date_desc')
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

    // Upload State
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

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
    const fetchScans = async (isBackground = false) => {
        if (!isBackground) setIsLoading(true)
        setError(null)
        try {
            const response = await fetch('/api/scans/list', { cache: 'no-store' })
            if (!response.ok) throw new Error('Failed to fetch records')
            const data = await response.json()

            const mappedScans: ScanWithRelations[] = data.scans.map((s: any) => ({
                ...s,
                // Normalize status: DB stores 'complete', frontend expects 'completed'
                status: s.status === 'complete' ? 'completed' : s.status,
                filename: s.assets?.filename || 'Unnamed Asset',
                file_type: s.assets?.file_type || 'image',
                scan_findings: s.scan_findings || [],
                // Provenance Details mapping (handle array from join)
                provenance_details: Array.isArray(s.provenance_details) ? s.provenance_details[0] : s.provenance_details,
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

    // Polling Logic
    useEffect(() => {
        const hasActiveScans = scans.some(s => s.status === 'pending' || s.status === 'processing');
        if (hasActiveScans) {
            const interval = setInterval(() => fetchScans(true), 3000);
            return () => clearInterval(interval);
        }
    }, [scans]);

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

    const handleUpload = async (file: File) => {
        setIsUploading(true)
        setUploadError(null)

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/scans/upload', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed')
            }

            // Success
            setShowUploadModal(false)
            fetchScans() // Refresh list
        } catch (err: any) {
            setUploadError(err.message)
        } finally {
            setIsUploading(false)
        }
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
        <RSBackground
            variant="technical"
            showGrid={true}
            className="bg-[#F9F8F6]"
        >
            <div className="flex flex-col h-full w-full overflow-hidden">
                {/* Header Module - Precision Toolbar */}
                <header className="w-full border-b border-[var(--rs-border-primary)] bg-white px-6 md:px-12 py-5 z-20 shrink-0">
                    <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-6">
                        {/* Title & Quota */}
                        <div className="flex items-center gap-6 shrink-0">
                            <h1 className="text-xl rs-header-bold-italic tracking-tight text-rs-text-primary whitespace-nowrap rs-etched">
                                VALIDATION_ARCHIVE
                            </h1>
                            <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)] rounded-[var(--rs-radius-element)]">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-secondary)] rs-etched opacity-60">Usage_Quota</span>
                                <span className="text-[10px] font-mono font-bold text-rs-text-primary">15/50_SCANS</span>
                            </div>
                        </div>

                        {/* Horizontal Control Bay */}
                        <div className="flex-1 flex items-center justify-center gap-3 max-w-4xl">
                            {/* Search Registry */}
                            <div className="relative w-full max-w-[320px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--rs-text-tertiary)]" />
                                <input
                                    type="text"
                                    placeholder="QUERY_ARCHIVE..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-10 pl-10 pr-4 bg-[var(--rs-bg-well)] border-none text-[10px] font-bold font-mono uppercase text-[var(--rs-text-primary)] rounded-[var(--rs-radius-element)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-1 focus:ring-[var(--rs-text-primary)] transition-all placeholder:text-[var(--rs-text-tertiary)]"
                                />
                            </div>

                            {/* Filter Segmented Control */}
                            <div className="flex items-center p-1 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)] h-10">
                                {(['all', 'high', 'critical'] as const).map((risk) => (
                                    <button
                                        key={risk}
                                        onClick={() => setFilterRisk(risk)}
                                        className={cn(
                                            "h-8 px-4 text-[9px] font-bold uppercase tracking-widest transition-all rounded-[var(--rs-radius-element)] flex items-center",
                                            filterRisk === risk
                                                ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] shadow-[var(--rs-shadow-l2)]"
                                                : "text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-element)]/50"
                                        )}
                                    >
                                        <span className={filterRisk === risk ? "rs-etched" : ""}>{risk === 'all' ? 'All' : risk}</span>
                                    </button>
                                ))}
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center p-1 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)] h-10">
                                {(['grid', 'list'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={cn(
                                            "w-8 h-8 flex items-center justify-center transition-all rounded-[var(--rs-radius-element)]",
                                            viewMode === mode
                                                ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] shadow-[var(--rs-shadow-l2)]"
                                                : "text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)]"
                                        )}
                                    >
                                        {mode === 'grid'
                                            ? <div className="w-3 h-3 border-2 border-current rounded-[1px]" />
                                            : <div className="w-3 h-[2px] bg-current rounded-[1px]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Primary Action */}
                        <div className="flex items-center gap-4 shrink-0">
                            <RSButton
                                icon={<Plus size={16} />}
                                className="bg-[var(--rs-risk-high)] text-white shadow-[var(--rs-shadow-l2)] hover:brightness-110"
                                onClick={() => router.push('/dashboard')}
                            >
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
                                <RSButton variant="ghost" onClick={() => fetchScans()} className="mt-10 uppercase tracking-widest text-xs">Re-Establish_Link</RSButton>
                            </div>
                        ) : scans.length === 0 ? (
                            <div className="w-full aspect-[2/1] min-h-[400px] flex flex-col items-center justify-center border border-rs-border-primary border-dashed bg-white/50">
                                <div className="w-16 h-16 rounded-full bg-rs-gray-100 flex items-center justify-center mb-6">
                                    <div className="w-1.5 h-1.5 bg-rs-text-tertiary rounded-full" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-rs-text-primary mb-2">Archive_Empty</h3>
                                <p className="text-[10px] text-rs-text-secondary max-w-xs text-center mb-8 leading-relaxed">
                                    No forensic validations have been recorded for this tenant. Initialize a new scan to begin analysis.
                                </p>
                                <RSButton
                                    onClick={() => setShowUploadModal(true)}
                                    className="bg-rs-text-primary text-white shadow-lg shadow-rs-text-primary/20 hover:scale-105 transition-transform"
                                >
                                    INITIALIZE_SCAN
                                </RSButton>
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "grid gap-8",
                                    viewMode === 'grid'
                                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Max 4 cols
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
                                            src={selectedScan?.asset_url || '/placeholder.png'}
                                            alt="Asset_Visual"
                                            className="w-full h-full object-contain grayscale-[0.2] transition-all group-hover:grayscale-0"
                                        />
                                    </div>
                                    <div className="absolute bottom-4 left-4 px-2 py-1 bg-white/90 backdrop-blur-sm border border-rs-border-primary text-[8px] font-mono text-rs-text-tertiary uppercase tracking-widest shadow-sm">
                                        ID: {selectedScan?.id.slice(0, 8).toUpperCase()}
                                    </div>
                                </div>

                                {/* Risk Diagnostic Summary */}
                                <div className="space-y-6">
                                    <div className="p-5 bg-white border border-rs-border-primary relative overflow-hidden shadow-sm">
                                        <div className="flex items-center justify-between mb-4 relative z-10">
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary block mb-1">Forensic_Verdict</span>
                                                <div
                                                    className="text-2xl font-black uppercase tracking-tighter"
                                                    style={{ color: getRiskTier(selectedScan?.risk_profile?.composite_score || 0).colorVar }}
                                                >
                                                    {getRiskTier(selectedScan?.risk_profile?.composite_score || 0).label}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-4xl font-black tracking-tighter text-rs-text-primary">
                                                    {selectedScan?.risk_profile?.composite_score}
                                                </div>
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-rs-text-tertiary">Global_Score</span>
                                            </div>
                                        </div>

                                        {/* Horizontal Meter */}
                                        <div className="w-full h-1.5 bg-rs-gray-100 rounded-full overflow-hidden relative z-10">
                                            <div
                                                className="h-full transition-all duration-1000 ease-out"
                                                style={{
                                                    width: `${selectedScan?.risk_profile?.composite_score}%`,
                                                    backgroundColor: getRiskTier(selectedScan?.risk_profile?.composite_score || 0).colorVar
                                                }}
                                            />
                                        </div>

                                        <p className="text-[10px] text-rs-text-secondary leading-relaxed font-medium mt-4 relative z-10">
                                            {selectedScan?.risk_profile?.chief_officer_strategy || `Forensic analysis suggests provenance signature with system confidence of ${selectedScan?.risk_profile?.composite_score}%.`}
                                        </p>

                                        {/* Background Watermark */}
                                        <div className="absolute -bottom-8 -right-8 text-9xl font-black text-rs-gray-50 z-0 select-none opacity-50">
                                            {selectedScan?.risk_profile?.composite_score}
                                        </div>
                                    </div>

                                    {/* Findings List (Timeline Style) */}
                                    <div className="border border-rs-border-primary bg-white">
                                        <div className="px-5 py-3 border-b border-rs-border-primary bg-rs-gray-50/50 flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">Detected_Anomalies</span>
                                            <div className="px-2 py-0.5 bg-rs-text-primary text-white text-[9px] font-bold rounded-[1px]">
                                                {selectedScan?.scan_findings?.length || 0}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            {selectedScan?.scan_findings && selectedScan.scan_findings.length > 0 ? (
                                                <div className="relative border-l border-dashed border-rs-border-primary space-y-8 ml-2">
                                                    {selectedScan.scan_findings.map((finding: any) => (
                                                        <div key={finding.id} className="relative pl-6">
                                                            {/* Timeline Dot */}
                                                            <div className={cn(
                                                                "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white",
                                                                finding.severity === 'critical' ? 'bg-rs-destruct' :
                                                                    finding.severity === 'high' ? 'bg-rs-alert' : 'bg-rs-signal'
                                                            )} />

                                                            <div className="space-y-1">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-bold text-rs-text-primary uppercase tracking-tight">{finding.title}</span>
                                                                    <span className="text-[9px] font-mono text-rs-text-tertiary">{finding.confidence_score}%_CONF</span>
                                                                </div>
                                                                <p className="text-[10px] text-rs-text-secondary leading-relaxed bg-rs-gray-50 p-3 rounded-[2px] border border-rs-border-primary/50 relative">
                                                                    {/* Speech bubble notch */}
                                                                    <span className="absolute top-2 -left-1 w-2 h-2 bg-rs-gray-50 border-t border-l border-rs-border-primary/50 -rotate-45" />
                                                                    {finding.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <span className="text-[10px] font-mono text-rs-text-tertiary uppercase tracking-widest opacity-50">No_Anomalies_Recorded</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Score Breakdown (Horizontal Bars) */}
                                    <div className="border border-rs-border-primary bg-white divide-y divide-rs-border-primary/40">
                                        {[
                                            { label: 'IP_PROVENANCE', score: selectedScan?.risk_profile?.ip_report?.score || 0 },
                                            { label: 'SAFETY_THRESHOLD', score: selectedScan?.risk_profile?.safety_report?.score || 0 },
                                            { label: 'PROVENANCE_INTEGRITY', score: selectedScan?.risk_profile?.provenance_report?.score || 0 },
                                        ].map((metric, i) => (
                                            <div key={i} className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">{metric.label}</span>
                                                    <span className="text-[10px] font-bold text-rs-text-primary">{metric.score}/100</span>
                                                </div>
                                                <div className="w-full h-1 bg-rs-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-rs-text-primary"
                                                        style={{ width: `${metric.score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* C2PA Forensic Manifest Stream */}
                                    <div className="pt-2">
                                        <ProvenanceTelemetryStream
                                            details={selectedScan?.provenance_details}
                                            scanStatus={selectedScan?.status || 'completed'}
                                        />
                                    </div>
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


                {/* Upload Modal */}
                <RSModal
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    title="NEW_FORENSIC_VALIDATION"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-rs-gray-50 border border-rs-border-primary/50 text-[11px] text-rs-text-secondary leading-relaxed">
                            Upload media assets for forensic analysis. Supported formats: JPG, PNG, MP4, MOV, AVI, MKV.
                            Analysis includes AI-driven IP detection, brand safety checks, and C2PA provenance verification.
                        </div>

                        <RSFileUpload
                            onFileSelect={handleUpload}
                            accept="image/*,video/*,.mp4,.mov,.avi,.mkv,.webm,.wmv"
                            maxSizeMB={50}
                        />

                        {isUploading && (
                            <div className="flex items-center justify-center py-8 gap-3 text-rs-text-primary animate-pulse">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-xs font-mono uppercase tracking-widest">Uploading_&_Processing...</span>
                            </div>
                        )}

                        {uploadError && (
                            <div className="p-3 bg-red-50 border border-rs-destruct/20 text-rs-destruct text-xs font-mono">
                                ERROR: {uploadError}
                            </div>
                        )}
                    </div>
                </RSModal>
            </div>
        </RSBackground>
    )
}

const ANALYSIS_STEPS = [
    "Initializing Vision Model...",
    "Extracting Features...",
    "Querying IP Database...",
    "Matching Assets...",
    "Analyzing Safety...",
    "Verifying C2PA...",
    "Validating Signatures...",
    "Finalizing Score..."
];

function ScanCard({ scan, isSelected, isBulkSelected, onBulkToggle, onClick }: {
    scan: ScanWithRelations;
    isSelected: boolean;
    isBulkSelected: boolean;
    onBulkToggle: (checked: boolean) => void;
    onClick: () => void
}) {
    const score = scan.risk_profile?.composite_score || 0;
    const thumbnailPath = scan.tenant_id && scan.asset_id ? `${scan.tenant_id}/${scan.asset_id}_thumb.jpg` : null;
    const thumbnailUrl = thumbnailPath ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${thumbnailPath}` : null;
    const [imgSrc, setImgSrc] = useState(thumbnailUrl || scan.asset_url || scan.image_url);
    const [imgError, setImgError] = useState(false);

    // Telemetry Animation State
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        if (scan.status === 'processing' || scan.status === 'pending') {
            const interval = setInterval(() => {
                setStepIndex(prev => (prev + 1) % ANALYSIS_STEPS.length);
            }, 800); // Change step every 800ms
            return () => clearInterval(interval);
        }
    }, [scan.status]);

    const riskTier = getRiskTier(score);

    // Reset image state when scan changes
    useEffect(() => {
        setImgSrc(thumbnailUrl || scan.asset_url || scan.image_url);
        setImgError(false);
    }, [scan.id, thumbnailUrl, scan.asset_url, scan.image_url]);

    const handleImgError = () => {
        // If we were trying to load the thumbnail and failed, try the full asset URL
        if (imgSrc === thumbnailUrl && scan.asset_url) {
            setImgSrc(scan.asset_url);
        } else {
            setImgError(true);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClick}
            className={cn(
                "group/card cursor-pointer bg-[var(--rs-bg-surface)] relative transition-all duration-300 overflow-hidden flex flex-col",
                "h-[325px] w-full", // Fixed height per spec
                "rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20",
                "hover:scale-[1.01] hover:shadow-[var(--rs-shadow-l3)]",
                isSelected ? "ring-2 ring-rs-text-primary z-10" : ""
            )}
        >
            {/* Physics: Parting Line */}
            <div className="absolute inset-0 rounded-[inherit] border-t border-l border-white/40 pointer-events-none z-20" />
            <div className="absolute inset-0 rounded-[inherit] border-b border-r border-black/10 pointer-events-none z-20" />

            {/* 1. Thumbnail Area (60%) */}
            <div className="relative h-[60%] w-full bg-[#FAFAF9] overflow-hidden p-3 transition-colors group-hover/card:bg-[#F2F2F0]">
                {/* Image Container */}
                <div className="w-full h-full relative group/thumb overflow-hidden bg-white shadow-sm ring-1 ring-black/5 rounded-[var(--rs-radius-element)]">
                    {!imgError && imgSrc ? (
                        scan.file_type === 'video' && (imgError || imgSrc === scan.asset_url) ? (
                            <video
                                src={imgSrc}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                playsInline
                                onMouseOver={e => e.currentTarget.play()}
                                onMouseOut={e => e.currentTarget.pause()}
                            />
                        ) : (
                            <img
                                src={imgSrc}
                                onError={handleImgError}
                                className="w-full h-full object-cover transition-all duration-700 grayscale-[0.1] contrast-[1.05] group-hover:grayscale-0"
                                alt={scan.filename}
                            />
                        )
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-rs-gray-100">
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    background: `linear-gradient(135deg, var(--rs-gray-50) 0%, ${riskTier.colorVar} 100%)`
                                }}
                            />

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 text-[var(--rs-text-primary)] flex flex-col items-center gap-2">
                                {scan.file_type === 'video' ? (
                                    <>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg>
                                        <span className="text-[8px] font-mono uppercase tracking-widest">NO_PREVIEW</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                        <span className="text-[8px] font-mono uppercase tracking-widest">ASSET_MISSING</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Live Telemetry Overlay for Processing/Pending */}
                    {(scan.status === 'processing' || scan.status === 'pending') && (
                        <div className="absolute inset-0 z-20">
                            <RSProcessingPanel
                                filename={scan.filename}
                                progress={((stepIndex + 1) / ANALYSIS_STEPS.length) * 100}
                                statusMessage={ANALYSIS_STEPS[stepIndex]}
                                imageSrc={imgSrc}
                                isVideo={scan.file_type === 'video'}
                            />
                        </div>
                    )}
                </div>

                {/* A. Status Badge (Top-Right) */}
                <div
                    className="absolute top-[8px] right-[8px] h-[28px] px-2 flex items-center justify-center rounded-full z-30 shadow-md backdrop-blur-sm"
                    style={{
                        backgroundColor:
                            scan.status === 'processing' || scan.status === 'pending' ? 'var(--rs-text-tertiary)' :
                                scan.status === 'failed' ? 'var(--rs-destruct)' :
                                    riskTier.colorVar
                    }}
                >
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider leading-none flex items-center gap-1">
                        {(scan.status === 'processing' || scan.status === 'pending') && <Loader2 className="w-3 h-3 animate-spin" />}
                        {scan.status === 'processing' || scan.status === 'pending' ? 'ANALYZING' :
                            scan.status === 'failed' ? 'FAILED' :
                                riskTier.label === 'CRITICAL RISK' ? 'CRITICAL' :
                                    riskTier.label === 'HIGH RISK' ? 'HIGH RISK' :
                                        riskTier.label === 'REVIEW REQ' ? 'REVIEW' : 'SAFE'}
                    </span>
                </div>

                {/* B. Checkbox (Top-Left) */}
                <div
                    className="absolute top-[12px] left-[12px] z-40"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative w-[24px] h-[24px] bg-white/80 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm">
                        <input
                            type="checkbox"
                            checked={isBulkSelected}
                            onChange={(e) => onBulkToggle(e.target.checked)}
                            className={cn(
                                "w-5 h-5 appearance-none border-2 border-rs-border-primary bg-transparent transition-all cursor-pointer rounded-[2px]",
                                "checked:bg-[#1E40AF] checked:border-[#1E40AF] relative",
                                "after:content-[''] after:hidden checked:after:block after:w-2 after:h-2 after:bg-white after:absolute after:top-[3px] after:left-[3px] after:rounded-[1px]"
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* 2-5. Metadata & Actions Area */}
            <div className="flex-1 w-full px-3 pb-3 pt-3 flex flex-col relative z-10">
                {/* 2. Score Number */}
                <div className="flex items-baseline gap-1" style={{ color: scan.status === 'completed' ? riskTier.colorVar : 'var(--rs-text-tertiary)' }}>
                    {scan.status === 'completed' ? (
                        <>
                            <span className="text-[32px] font-bold font-mono leading-none tracking-tighter">{score}</span>
                            <span className="text-[18px] font-mono opacity-60 leading-none">/100</span>
                        </>
                    ) : (
                        <span className="text-[14px] font-mono font-bold tracking-widest uppercase">
                            {scan.status === 'failed' ? 'ERROR' : 'PENDING...'}
                        </span>
                    )}
                </div>

                {/* 3. Filename */}
                <div className="mt-[6px] flex items-center gap-1.5 overflow-hidden">
                    {scan.file_type === 'video' ?
                        <svg className="w-4 h-4 text-rs-text-secondary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg> :
                        <svg className="w-4 h-4 text-rs-text-secondary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                    }
                    <span className="text-[13px] font-medium text-rs-text-primary truncate" title={scan.filename}>
                        {scan.filename}
                    </span>
                </div>

                {/* 4. Metadata */}
                <div className="mt-[4px] flex items-center gap-2 text-[10px] text-rs-text-tertiary">
                    <span>{formatDistanceToNow(new Date(scan.created_at || new Date()))} ago</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-current" />
                    <span>2.4 MB</span>
                </div>

                {/* Spacer to push actions to bottom */}
                <div className="flex-1" />

                {/* 5. Action Buttons (Standard Row) */}
                <div className="mt-[8px] flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); console.log('Download', scan.id); }}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-rs-text-secondary hover:text-rs-text-primary hover:bg-rs-gray-50 transition-all group/btn"
                        title="Download report"
                    >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); console.log('Share', scan.id); }}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-rs-text-secondary hover:text-rs-text-primary hover:bg-rs-gray-50 transition-all group/btn"
                        title="Share scan"
                    >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
