"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Search,
    Loader2,
    AlertOctagon,
    Plus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanWithRelations } from '@/types/database'
import { RSBreadcrumb } from '@/components/rs/RSBreadcrumb'
import { RSButton } from '@/components/rs/RSButton'
import { RSBulkActionBar } from '@/components/rs/RSBulkActionBar'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSModal } from '@/components/rs/RSModal'
import { RSFileUpload } from '@/components/rs/RSFileUpload'
import { useRealtimeScans } from '@/hooks/useRealtimeScans'
import { ScanCard } from '@/components/dashboard/ScanCard'
import { UnifiedScanDrawer } from '@/components/dashboard/UnifiedScanDrawer'
import { getTenantBillingStatus, BillingStatus } from '@/app/actions/billing'
import { generateForensicReport } from '@/lib/pdf-generator'
import { Entitlements } from '@/lib/entitlements'
import { type PlanId } from '@/lib/plans'
import { AuditModal } from '@/components/marketing/AuditModal'
import { createClient } from '@/lib/supabase/client'

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
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'date_desc')
    const [filterRisk, setFilterRisk] = useState(searchParams.get('risk') || 'all')
    const [page, setPage] = useState(1)
    const itemsPerPage = 20
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [scans, setScans] = useState<ScanWithRelations[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedScanId, setSelectedScanId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
    const [showDetails, setShowDetails] = useState(false)
    const [updating, setUpdating] = useState(false)

    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Entitlements State
    const [userContext, setUserContext] = useState<{ id: string; tenant_id: string; plan: PlanId } | null>(null)
    const [showAuditModal, setShowAuditModal] = useState(false)
    const [shareToast, setShareToast] = useState<string | null>(null)
    const [purchaseToast, setPurchaseToast] = useState(false)
    const [showDownloadBanner, setShowDownloadBanner] = useState(false)

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

    // Data Fetching — passes search/sort/filter to server
    const fetchScans = async (isBackground = false) => {
        if (!isBackground) setIsLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (searchTerm.trim()) params.set('search', searchTerm.trim())
            if (filterRisk !== 'all') params.set('risk_level', filterRisk)
            // Map UI sort values to API params
            const sortMap: Record<string, { sort_by: string; sort_order: string }> = {
                date_desc: { sort_by: 'created_at', sort_order: 'desc' },
                date_asc: { sort_by: 'created_at', sort_order: 'asc' },
                score_desc: { sort_by: 'composite_score', sort_order: 'desc' },
                score_asc: { sort_by: 'composite_score', sort_order: 'asc' },
            }
            const sortConfig = sortMap[sortBy] || sortMap.date_desc
            params.set('sort_by', sortConfig.sort_by)
            params.set('sort_order', sortConfig.sort_order)

            const response = await fetch(`/api/scans/list?${params.toString()}`, { cache: 'no-store' })
            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: null }))
                throw new Error(err.error || `Failed to fetch records (HTTP ${response.status})`)
            }
            const data = await response.json()

            const mappedScans: ScanWithRelations[] = data.scans.map((s: Record<string, unknown> & { assets?: Record<string, unknown>; scan_findings?: unknown[]; provenance_details?: unknown; mitigation_reports?: unknown[]; risk_profile?: Record<string, unknown>; risk_level?: string; composite_score?: number; ip_risk_score?: number; safety_risk_score?: number; provenance_risk_score?: number; provenance_status?: string; status?: string }) => ({
                ...s,
                status: s.status,
                filename: s.assets?.filename || 'Unnamed Asset',
                file_type: s.assets?.file_type || 'image',
                file_size: s.assets?.file_size || 0,
                scan_findings: s.scan_findings || [],
                provenance_details: Array.isArray(s.provenance_details) ? s.provenance_details[0] : s.provenance_details,
                mitigation_reports: s.mitigation_reports || [],
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
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to fetch records')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchScans()
    }, [])

    // Re-fetch when sort or filter changes (debounced for search)
    useEffect(() => {
        setPage(1)
        fetchScans()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, filterRisk])

    // Debounced search — re-fetches from server after 300ms
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        searchTimerRef.current = setTimeout(() => {
            setPage(1)
            fetchScans()
        }, 300)
        return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current) }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm])

    // Realtime subscription for processing scans (replaces polling)
    const handleScanUpdate = useCallback((updated: Partial<ScanWithRelations> & { id: string }) => {
        setScans(prev => prev.map(s =>
            s.id === updated.id ? { ...s, ...updated } : s
        ))
        // Full data refetch on completion — gets findings, risk_profile, provenance
        if (updated.status === 'complete') {
            fetch(`/api/scans/${updated.id}`)
                .then(r => r.ok ? r.json() : null)
                .then(detail => {
                    if (!detail) return
                    setScans(prev => prev.map(s => {
                        if (s.id !== updated.id) return s
                        return {
                            ...s,
                            ...detail,
                            filename: s.filename, // Keep the mapped filename
                            file_type: s.file_type,
                            file_size: s.file_size,
                        }
                    }))
                })
                .catch(err => console.error('Detail refetch failed:', err))
        }
    }, [])

    const { ephemeralState } = useRealtimeScans({
        scans,
        onScanUpdate: handleScanUpdate
    })

    // ─────────────────────────────────────────────────────────────────────────────
    // Smart Dashboard Logic: Highlight & Assignment
    // ─────────────────────────────────────────────────────────────────────────────
    const processedParams = React.useRef<Set<string>>(new Set())

    useEffect(() => {
        const highlightId = searchParams.get('highlight')
        const isVerified = searchParams.get('verified') === 'true'
        const isPurchased = searchParams.get('purchased') === 'true'

        // 1. Handle Highlight (Auto-Select)
        if (highlightId && !selectedScanId && scans.length > 0) {
            // Check if scan exists in current list
            const targetScan = scans.find(s => s.id === highlightId)
            if (targetScan) {
                setSelectedScanId(highlightId)
                setShowDetails(true)
            } else {
                // If not in list, maybe we need to fetch it specifically or it's on another page?
                // For now, assume it's in the list if recently created.
            }
        }

        // 2. Handle Assignment (Claim Anonymous Scan)
        if (isVerified && highlightId && !processedParams.current.has(`assign-${highlightId}`)) {
            processedParams.current.add(`assign-${highlightId}`)

            // Call API to assign
            fetch('/api/scans/assign-to-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scanId: highlightId })
            })
                .then(res => {
                    if (!res.ok) throw new Error(`HTTP ${res.status}`)
                    return res.json()
                })
                .then(data => {
                    if (data.success) {
                        console.log('✅ Scan assigned to user')
                        // Refresh list to show updated ownership if needed
                        fetchScans(true)
                    } else {
                        console.error('Failed to assign scan:', data.error)
                    }
                })
                .catch(err => console.error('Assignment error:', err))
        }

        // 3. Handle Post-Purchase Feedback
        if (isPurchased && highlightId && !processedParams.current.has(`purchase-${highlightId}`)) {
            processedParams.current.add(`purchase-${highlightId}`)
            setPurchaseToast(true)
            setTimeout(() => setPurchaseToast(false), 6000)

            // Refresh scans to get updated purchased status, then auto-download
            fetchScans(true).then(() => {
                // Auto-download after a brief delay to let state settle
                const downloadTimeout = setTimeout(() => {
                    const purchasedScan = scans.find(s => s.id === highlightId)
                    if (purchasedScan && purchasedScan.status === 'complete' && purchasedScan.risk_profile) {
                        try {
                            generateForensicReport(purchasedScan, purchasedScan.risk_profile, false)
                        } catch {
                            // Browser may block auto-download — show fallback banner
                            setShowDownloadBanner(true)
                        }
                    } else {
                        // Scan data not ready yet — show download banner as fallback
                        setShowDownloadBanner(true)
                    }
                }, 1500)
                return () => clearTimeout(downloadTimeout)
            })

            // Clean purchased param from URL to prevent re-triggering
            const cleanParams = new URLSearchParams(searchParams.toString())
            cleanParams.delete('purchased')
            const cleanUrl = cleanParams.toString()
                ? `${pathname}?${cleanParams.toString()}`
                : pathname
            router.replace(cleanUrl, { scroll: false })
        }

    }, [searchParams, scans, selectedScanId]) // Re-run when scans load so we can find the highlighted one

    const selectedScan = scans.find(s => s.id === selectedScanId)

    const handleScanClick = (id: string) => {
        if (selectedScanId === id) {
            setShowDetails(!showDetails)
        } else {
            setSelectedScanId(id)
            setShowDetails(true)
        }
    }

    // Fetch full detail from /api/scans/[id] when drawer opens
    // This consumes Sprint 7.4 joins: normalized provenance_details + sorted mitigation_reports
    useEffect(() => {
        if (!showDetails || !selectedScanId) return
        let cancelled = false
        fetch(`/api/scans/${selectedScanId}`)
            .then(res => res.ok ? res.json() : null)
            .then(detail => {
                if (cancelled || !detail) return
                setScans(prev => prev.map(s => {
                    if (s.id !== selectedScanId) return s
                    return {
                        ...s,
                        // Merge enriched fields from detail endpoint
                        provenance_details: detail.provenance_details ?? s.provenance_details,
                        mitigation_reports: detail.mitigation_reports ?? s.mitigation_reports,
                        risk_profile: detail.risk_profile ?? s.risk_profile,
                        scan_findings: detail.scan_findings ?? s.scan_findings,
                        asset_url: detail.asset_url ?? s.asset_url,
                    }
                }))
            })
            .catch(err => console.error('Detail fetch failed:', err))
        return () => { cancelled = true }
    }, [showDetails, selectedScanId])

    // Polling removed - now using useRealtimeScans hook above

    const handleDrawerDelete = (id: string) => {
        if (confirm('Are you sure you want to purge this record from the archive?')) {
            // Optimistic UI + real API delete
            fetch(`/api/scans/${id}`, { method: 'DELETE' })
                .catch(err => console.error('Delete API failed:', err))
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

    const handleSaveNotes = async (newNotes: string) => {
        if (!selectedScanId) return
        // Only save if changed
        const currentNotes = scans.find(s => s.id === selectedScanId)?.notes
        if (newNotes === currentNotes) return

        setUpdating(true)
        try {
            await fetch(`/api/scans/${selectedScanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: newNotes })
            })
            setScans(prev => prev.map(s =>
                s.id === selectedScanId ? { ...s, notes: newNotes } : s
            ))
        } catch (err) {
            console.error('Failed to save notes:', err)
        } finally {
            setUpdating(false)
        }
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
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    // Server handles search/sort/filter — just pass through scans for display
    const filteredScans = scans

    const visibleScans = useMemo(() => {
        return filteredScans.slice(0, page * itemsPerPage)
    }, [filteredScans, page])

    // Billing Status for Header
    const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)

    const fetchBilling = () => {
        getTenantBillingStatus().then(setBillingStatus).catch(err => console.error('Billing fetch error', err))
    }

    useEffect(() => {
        fetchBilling()
    }, [scans]) // Refresh quota when scans list updates

    // Build user context for entitlement checks
    useEffect(() => {
        if (!billingStatus || scans.length === 0) return
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                const tenantId = scans[0]?.tenant_id || ''
                setUserContext({ id: user.id, tenant_id: tenantId, plan: (billingStatus.planId || 'free') as PlanId })
            }
        })
    }, [billingStatus, scans])

    // Computed entitlements for selected scan
    const canViewFull = selectedScan && userContext
        ? Entitlements.canViewFullReport(userContext, selectedScan)
        : false

    // Mitigation entitlement (requires billing data for tenant context)
    const mitigationEntitlement = useMemo(() => {
        if (!billingStatus) return { included: 0, used: 0, canGenerate: false, overageCents: 2900 }
        return Entitlements.getMitigationEntitlement({
            id: userContext?.tenant_id || '',
            plan: (billingStatus.planId || 'free') as PlanId,
            monthly_scan_limit: billingStatus.monthlyScanLimit,
            monthly_report_limit: billingStatus.monthlyReportLimit ?? 0,
            seat_limit: billingStatus.seatLimit ?? 1,
            brand_profile_limit: billingStatus.brandProfileLimit ?? 1,
            monthly_mitigation_limit: billingStatus.monthlyMitigationLimit ?? 0,
            mitigations_used_this_month: billingStatus.mitigationsUsedThisMonth ?? 0,
        })
    }, [billingStatus, userContext?.tenant_id])

    const handleDownload = (scan: ScanWithRelations) => {
        if (!scan) return
        try {
            if (scan.status !== 'complete' || !scan.risk_profile) {
                console.warn("Cannot download incomplete report")
                return
            }

            // Entitlement-gated: sample PDF for free users, full for paid/purchased
            const isSample = userContext ? !Entitlements.canViewFullReport(userContext, scan) : true
            generateForensicReport(scan, scan.risk_profile, isSample)
        } catch (e) {
            console.error("PDF Generation failed", e)
            alert("Failed to generate PDF report. Please contact support.")
        }
    }

    const handleShare = async (scanId: string) => {
        try {
            const res = await fetch(`/api/scans/${scanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'share' })
            })
            if (!res.ok) throw new Error('Failed to generate share link')
            const data = await res.json()
            const shareUrl = `${window.location.origin}/scan/${scanId}?token=${data.scan.share_token}`
            await navigator.clipboard.writeText(shareUrl)
            setShareToast('Link_Copied')
            setTimeout(() => setShareToast(null), 2500)
        } catch (err) {
            console.error('Share failed:', err)
            setShareToast('Share_Failed')
            setTimeout(() => setShareToast(null), 2500)
        }
    }

    return (
        <RSBackground
            variant="technical"
            showGrid={true}
            className="bg-[var(--rs-bg-surface)]"
        >
            <div className="flex flex-col h-full w-full overflow-hidden">
                {/* Breadcrumb Navigation */}
                <div className="px-6 md:px-12 pt-4 shrink-0">
                    <RSBreadcrumb items={[{ label: "Scans & Reports" }]} />
                </div>
                {/* Header Module - Precision Toolbar */}
                <header className="sticky top-0 z-30 bg-[var(--rs-bg-master)]/95 backdrop-blur-xl border-b border-[var(--rs-border-primary)] pt-8 pb-4 transition-colors duration-500 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                    <div className="px-6 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-black tracking-tight uppercase">Scans & Reports</h1>
                            {billingStatus && (
                                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-rs-gray-200/50 rounded-full border border-rs-gray-200 text-xs font-mono shadow-sm">
                                    <span className="text-rs-gray-500 uppercase">Quota:</span>
                                    <span className={cn(
                                        "font-bold",
                                        billingStatus.scansUsed >= billingStatus.monthlyScanLimit ? "text-rs-signal" : "text-rs-black"
                                    )}>
                                        {billingStatus.scansUsed} / {billingStatus.monthlyScanLimit}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div className="w-full border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] px-6 md:px-12 py-5 z-20 shrink-0">
                    <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6 shrink-0">
                            <h1 className="text-xl rs-header-bold-italic tracking-tight text-rs-text-primary whitespace-nowrap rs-etched">
                                VALIDATION_ARCHIVE
                            </h1>
                        </div>
                        <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)] rounded-[var(--rs-radius-element)]">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-secondary)] rs-etched opacity-60">Usage_Quota</span>
                            <span className="text-[10px] font-mono font-bold text-rs-text-primary">
                                {billingStatus ? `${billingStatus.scansUsed}/${billingStatus.monthlyScanLimit}_SCANS` : '..._SCANS'}
                            </span>
                        </div>
                    </div>

                    {/* Horizontal Control Bay */}
                    <div className="flex flex-1 items-center justify-center gap-3 max-w-4xl mt-4">
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

                        {/* Sort Select */}
                        <div className="relative h-10">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-10 pl-3 pr-8 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] text-[9px] font-bold font-mono uppercase tracking-widest text-[var(--rs-text-primary)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l1)] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--rs-text-primary)] transition-all"
                            >
                                <option value="date_desc">NEWEST</option>
                                <option value="date_asc">OLDEST</option>
                                <option value="score_desc">RISK ↓</option>
                                <option value="score_asc">RISK ↑</option>
                            </select>
                            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-rs-text-tertiary pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
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
                    <div className="flex items-center gap-4 shrink-0 mt-4">
                        <RSButton
                            icon={<Plus size={16} />}
                            className="bg-[var(--rs-risk-high)] text-white shadow-[var(--rs-shadow-l2)] hover:brightness-110"
                            onClick={() => router.push('/dashboard')}
                        >
                            NEW_VALIDATION
                        </RSButton>
                    </div>
                </div>

                {/* Forensic Field Substrate */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
                    <div className="max-w-[1800px] w-full mx-auto px-6 md:px-12 py-12 flex-1 z-10">
                        {isLoading ? (
                            <div className="w-full aspect-[2/1] min-h-[400px] flex flex-col items-center justify-center border border-rs-border-primary/20 border-dashed bg-[var(--rs-bg-well)]">
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
                            <div className="w-full aspect-[2/1] min-h-[400px] flex flex-col items-center justify-center border border-rs-border-primary border-dashed bg-[var(--rs-bg-well)]/60">
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
                                {visibleScans.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                        {scans.length === 0 ? (
                                            <>
                                                <div className="w-16 h-16 mb-4 rounded-full bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-rs-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-rs-text-primary mb-1">No Scans Yet</h3>
                                                <p className="text-sm text-rs-text-secondary mb-4 max-w-sm">Upload an image or video to start your first forensic analysis.</p>
                                                <RSButton variant="primary" onClick={() => setShowUploadModal(true)}>
                                                    Upload_Asset
                                                </RSButton>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 mb-4 rounded-full bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-rs-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                                                </div>
                                                <h3 className="text-lg font-bold text-rs-text-primary mb-1">No Results Found</h3>
                                                <p className="text-sm text-rs-text-secondary mb-4">No scans match your current search or filters.</p>
                                                <RSButton variant="secondary" onClick={() => { setSearchTerm(''); setFilterRisk('all') }}>
                                                    Clear_Filters
                                                </RSButton>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "grid gap-8",
                                        viewMode === 'grid'
                                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" // Max 4 cols
                                            : "grid-cols-1"
                                    )}>
                                        <AnimatePresence>
                                            {visibleScans.map(scan => (
                                                <ScanCard
                                                    key={scan.id}
                                                    scan={scan}
                                                    isSelected={selectedScanId === scan.id}
                                                    isBulkSelected={selectedIds.includes(scan.id)}
                                                    liveProgress={ephemeralState[scan.id]?.progress}
                                                    liveMessage={ephemeralState[scan.id]?.message}
                                                    onBulkToggle={(checked) => {
                                                        setSelectedIds(prev => checked
                                                            ? [...prev, scan.id]
                                                            : prev.filter(id => id !== scan.id)
                                                        )
                                                    }}
                                                    onClick={() => handleScanClick(scan.id)}
                                                    onDownload={() => handleDownload(scan)}
                                                    onShare={() => handleShare(scan.id)}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {filteredScans.length > visibleScans.length && (
                                    <div className="mt-24 flex justify-center pb-12">
                                        <RSButton
                                            variant="ghost"
                                            onClick={() => setPage(p => p + 1)}
                                            className="px-16 py-6 text-[10px] font-mono font-black border border-dashed border-rs-border-primary hover:border-rs-text-primary hover:bg-[var(--rs-bg-element)] transition-all uppercase tracking-[0.3em]"
                                        >
                                            Load_Next_Batch
                                        </RSButton>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Unified Scan Workspace Drawer */}
                <AnimatePresence>
                    {showDetails && selectedScan && (
                        <UnifiedScanDrawer
                            scan={selectedScan!}
                            isOpen={showDetails}
                            onClose={() => setShowDetails(false)}
                            entitlements={{
                                canViewFull: !!canViewFull,
                                canViewTeaser: selectedScan ? Entitlements.canViewTeaser(userContext, selectedScan) : false,
                                mitigationCredits: mitigationEntitlement,
                            }}
                            onGenerateMitigation={async () => {
                                if (!selectedScanId) return
                                // Optimistic: mark as processing immediately
                                setScans(prev => prev.map(s => {
                                    if (s.id !== selectedScanId) return s
                                    return { ...s, mitigation_reports: [{ id: 'temp', scan_id: s.id, tenant_id: s.tenant_id || '', advice_content: '', status: 'processing' as const, report_content: null, report_version: 0, generator_version: '1.0.0', generation_inputs: null, idempotency_key: null, created_by: null, completed_at: null, error_message: null, created_at: new Date().toISOString() }] }
                                }))
                                try {
                                    const res = await fetch(`/api/scans/${selectedScanId}/mitigation`, { method: 'POST' })
                                    const data = await res.json()

                                    if (res.ok && data.report) {
                                        // Merge completed report into scan state
                                        setScans(prev => prev.map(s => {
                                            if (s.id !== selectedScanId) return s
                                            return { ...s, mitigation_reports: [data.report] }
                                        }))
                                        setShareToast('Mitigation report generated')
                                        setTimeout(() => setShareToast(null), 3000)
                                    } else if (res.status === 202) {
                                        setShareToast('Report already generating...')
                                        setTimeout(() => setShareToast(null), 3000)
                                    } else if (res.status === 402) {
                                        setShareToast('Credits exhausted — purchase required')
                                        setTimeout(() => setShareToast(null), 4000)
                                    } else {
                                        throw new Error(data.message || 'Generation failed')
                                    }
                                } catch (err) {
                                    console.error('Mitigation generation error:', err)
                                    setShareToast('Failed to generate report')
                                    setTimeout(() => setShareToast(null), 3000)
                                    // Revert optimistic update
                                    setScans(prev => prev.map(s => {
                                        if (s.id !== selectedScanId) return s
                                        return { ...s, mitigation_reports: [] }
                                    }))
                                }
                            }}
                            onShare={handleShare}
                            onDelete={handleDrawerDelete}
                            onNotesUpdate={(_scanId, notes) => handleSaveNotes(notes)}
                            onDownload={handleDownload}
                            onUnlock={() => setShowAuditModal(true)}
                            notesBuffer={notesBuffer}
                            onNotesChange={setNotesBuffer}
                            isUpdatingNotes={updating}
                            shareToast={shareToast}
                            showDownloadBanner={showDownloadBanner}
                            onDismissDownloadBanner={() => setShowDownloadBanner(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Bulk Action Bar Integration */}
                <RSBulkActionBar
                    selectedCount={selectedIds.length}
                    onClear={() => setSelectedIds([])}
                    onDownload={() => {
                        selectedIds.forEach(id => {
                            const scan = scans.find(s => s.id === id)
                            if (scan && scan.status === 'complete') handleDownload(scan)
                        })
                    }}
                    onShare={() => {
                        // Share the first selected scan (batch share needs dedicated API)
                        if (selectedIds.length > 0) handleShare(selectedIds[0])
                    }}
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
                        <div className="p-4 bg-[var(--rs-bg-well)] border border-rs-border-primary/50 text-[11px] text-rs-text-secondary leading-relaxed">
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
                            <div className="p-3 bg-[var(--rs-destruct)]/10 border border-rs-destruct/20 text-rs-destruct text-xs font-mono">
                                ERROR: {uploadError}
                            </div>
                        )}
                    </div>
                </RSModal>

                {/* Audit Modal — Unlock Full Report CTA */}
                <AuditModal
                    isOpen={showAuditModal}
                    onClose={() => setShowAuditModal(false)}
                    scanId={selectedScanId || ''}
                />

                {/* Purchase Toast */}
                <AnimatePresence>
                    {purchaseToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-[var(--rs-safe)] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-[2px] shadow-lg flex items-center gap-2"
                        >
                            <span>&#10003;</span> Payment confirmed — your full report is downloading
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Share Toast */}
                <AnimatePresence>
                    {shareToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-rs-text-primary text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-[2px] shadow-lg"
                        >
                            {shareToast}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </RSBackground>
    )
}
