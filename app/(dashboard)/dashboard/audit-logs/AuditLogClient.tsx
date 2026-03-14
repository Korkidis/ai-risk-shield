'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

interface AuditEntry {
    id: string
    action: string
    resource_type: string
    resource_id: string | null
    user_id: string | null
    metadata: Record<string, unknown> | null
    created_at: string
    user_agent: string | null
}

interface Filters {
    action: string
    resource_type: string
    from: string
    to: string
}

export function AuditLogClient() {
    const [entries, setEntries] = useState<AuditEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [filters, setFilters] = useState<Filters>({
        action: '',
        resource_type: '',
        from: '',
        to: '',
    })
    const limit = 25

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('page', String(page))
            params.set('limit', String(limit))
            if (filters.action) params.set('action', filters.action)
            if (filters.resource_type) params.set('resource_type', filters.resource_type)
            if (filters.from) params.set('from', filters.from)
            if (filters.to) params.set('to', filters.to)

            const res = await fetch(`/api/audit-logs?${params}`)
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setEntries(data.data || [])
            setTotal(data.total || 0)
            setHasMore(data.hasMore || false)
        } catch (err) {
            console.error('Audit log fetch failed:', err)
        } finally {
            setLoading(false)
        }
    }, [page, filters])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPage(1)
    }

    return (
        <div className="space-y-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                        Audit Logs
                    </h1>
                    <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                        {total} EVENTS RECORDED
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 p-3 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)]/40 rounded-sm">
                <FilterSelect
                    label="ACTION"
                    value={filters.action}
                    onChange={(v) => handleFilterChange('action', v)}
                    options={[
                        { value: '', label: 'All Actions' },
                        { value: 'scan_created', label: 'Scan Created' },
                        { value: 'scan_completed', label: 'Scan Completed' },
                        { value: 'report_purchased', label: 'Report Purchased' },
                        { value: 'user_login', label: 'User Login' },
                        { value: 'user_signup', label: 'User Signup' },
                        { value: 'plan_changed', label: 'Plan Changed' },
                        { value: 'share_link_created', label: 'Share Link Created' },
                        { value: 'signature_verification_failed', label: 'Signature Failed' },
                    ]}
                />
                <FilterSelect
                    label="RESOURCE"
                    value={filters.resource_type}
                    onChange={(v) => handleFilterChange('resource_type', v)}
                    options={[
                        { value: '', label: 'All Resources' },
                        { value: 'scan', label: 'Scan' },
                        { value: 'tenant', label: 'Tenant' },
                        { value: 'user', label: 'User' },
                        { value: 'stripe_webhook', label: 'Stripe Webhook' },
                        { value: 'subscription', label: 'Subscription' },
                    ]}
                />
                <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest mr-1">FROM</span>
                    <input
                        type="date"
                        value={filters.from}
                        onChange={(e) => handleFilterChange('from', e.target.value)}
                        className="px-2 py-1 text-[10px] font-mono bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)]/40 rounded-sm text-[var(--rs-text-primary)]"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest mr-1">TO</span>
                    <input
                        type="date"
                        value={filters.to}
                        onChange={(e) => handleFilterChange('to', e.target.value)}
                        className="px-2 py-1 text-[10px] font-mono bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)]/40 rounded-sm text-[var(--rs-text-primary)]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="border border-[var(--rs-border-primary)]/40 rounded-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[140px_1fr_1fr_100px_40px] gap-0 bg-[var(--rs-bg-element)] border-b border-[var(--rs-border-primary)]/40">
                    <TableHeader>TIMESTAMP</TableHeader>
                    <TableHeader>ACTION</TableHeader>
                    <TableHeader>RESOURCE</TableHeader>
                    <TableHeader>USER</TableHeader>
                    <TableHeader></TableHeader>
                </div>

                {/* Table Body */}
                {loading ? (
                    <div className="p-8 text-center">
                        <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest animate-pulse">
                            LOADING AUDIT TRAIL...
                        </span>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                            NO EVENTS FOUND
                        </span>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id}>
                            <div
                                className={cn(
                                    "grid grid-cols-[140px_1fr_1fr_100px_40px] gap-0 border-b border-[var(--rs-border-primary)]/20",
                                    "hover:bg-[var(--rs-bg-element)]/40 cursor-pointer transition-colors"
                                )}
                                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            >
                                <TableCell className="font-mono text-[var(--rs-text-tertiary)]">
                                    {formatTimestamp(entry.created_at)}
                                </TableCell>
                                <TableCell>
                                    <span className="px-1.5 py-0.5 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)]/30 rounded-sm text-[var(--rs-text-primary)] font-bold">
                                        {entry.action}
                                    </span>
                                </TableCell>
                                <TableCell className="text-[var(--rs-text-secondary)]">
                                    {entry.resource_type}
                                    {entry.resource_id && (
                                        <span className="ml-1 text-[var(--rs-text-tertiary)]">
                                            {entry.resource_id.substring(0, 8)}...
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="font-mono text-[var(--rs-text-tertiary)]">
                                    {entry.user_id ? entry.user_id.substring(0, 8) : '—'}
                                </TableCell>
                                <TableCell className="flex items-center justify-center">
                                    {expandedId === entry.id
                                        ? <ChevronUp className="w-3 h-3 text-[var(--rs-text-tertiary)]" />
                                        : <ChevronDown className="w-3 h-3 text-[var(--rs-text-tertiary)]" />
                                    }
                                </TableCell>
                            </div>

                            {/* Expanded details panel */}
                            {expandedId === entry.id && entry.metadata && (
                                <div className="px-4 py-3 bg-[var(--rs-bg-well)] border-b border-[var(--rs-border-primary)]/20">
                                    <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest block mb-2">
                                        EVENT METADATA
                                    </span>
                                    <pre className="text-[10px] font-mono text-[var(--rs-text-secondary)] bg-[var(--rs-bg-surface)] p-3 rounded-sm border border-[var(--rs-border-primary)]/30 overflow-x-auto max-h-48">
                                        {JSON.stringify(entry.metadata, null, 2)}
                                    </pre>
                                    {entry.user_agent && (
                                        <div className="mt-2">
                                            <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                                                USER AGENT: {entry.user_agent.substring(0, 60)}...
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {total > 0 && (
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                        PAGE {page} OF {Math.ceil(total / limit)}
                    </span>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className={cn(
                                "p-1.5 rounded-sm border border-[var(--rs-border-primary)]/40 transition-colors",
                                page <= 1
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-[var(--rs-bg-element)] cursor-pointer"
                            )}
                        >
                            <ChevronLeft className="w-3 h-3 text-[var(--rs-text-secondary)]" />
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={!hasMore}
                            className={cn(
                                "p-1.5 rounded-sm border border-[var(--rs-border-primary)]/40 transition-colors",
                                !hasMore
                                    ? "opacity-30 cursor-not-allowed"
                                    : "hover:bg-[var(--rs-bg-element)] cursor-pointer"
                            )}
                        >
                            <ChevronRight className="w-3 h-3 text-[var(--rs-text-secondary)]" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function TableHeader({ children }: { children?: React.ReactNode }) {
    return (
        <div className="px-3 py-2.5 text-[8px] font-mono font-bold text-[var(--rs-text-tertiary)] uppercase tracking-widest">
            {children}
        </div>
    )
}

function TableCell({ children, className }: { children?: React.ReactNode; className?: string }) {
    return (
        <div className={cn("px-3 py-2.5 text-[10px] flex items-center", className)}>
            {children}
        </div>
    )
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    options: { value: string; label: string }[]
}) {
    return (
        <div className="flex items-center gap-1">
            <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest mr-1">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="px-2 py-1 text-[10px] font-mono bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)]/40 rounded-sm text-[var(--rs-text-primary)] appearance-none cursor-pointer"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    )
}

function formatTimestamp(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}
