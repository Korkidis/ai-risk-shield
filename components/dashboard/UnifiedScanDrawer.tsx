"use client"

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X, Loader2, ExternalLink, Shield, FileText, Clock, Hash } from 'lucide-react'
import { motion } from 'framer-motion'
import { ScanWithRelations, ProvenanceDetails, MitigationReport } from '@/types/database'
import { RSTextarea } from '@/components/rs/RSTextarea'
import { RSButton } from '@/components/rs/RSButton'
import { RSRiskPanel } from '@/components/rs/RSRiskPanel'
import { RSCallout } from '@/components/rs/RSCallout'
import { type RiskLevel } from '@/components/rs/RSRiskScore'
import { format } from 'date-fns'
import { formatBytes } from '@/lib/utils'
import { generateMitigationPDF } from '@/lib/pdf-generator'
import { Download } from 'lucide-react'
import Image from 'next/image'
import { VideoFrameGrid } from '@/components/dashboard/VideoFrameGrid'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DrawerEntitlements {
    /** Can the user view the full scan report (findings, provenance, etc.)? Always true for authenticated users. */
    canViewScanReport: boolean
    /** @deprecated Use canViewScanReport. Kept for backward compat. */
    canViewFull?: boolean
    /** @deprecated No longer needed — if drawer is open, user can see findings. */
    canViewTeaser?: boolean
    mitigationCredits: {
        included: number
        used: number
        canGenerate: boolean
        overageCents: number
    }
}

export interface UnifiedScanDrawerProps {
    scan: ScanWithRelations
    isOpen: boolean
    onClose: () => void
    entitlements: DrawerEntitlements
    onGenerateMitigation: (scanId: string) => void
    onShare: (scanId: string) => void
    onDelete: (scanId: string) => void
    onNotesUpdate: (scanId: string, notes: string) => void
    onDownload: (scan: ScanWithRelations) => void
    onUnlock: () => void
    notesBuffer: string
    onNotesChange: (value: string) => void
    isUpdatingNotes: boolean
    shareToast: string | null
    showDownloadBanner: boolean
    onDismissDownloadBanner: () => void
    /** Authenticated user's tenant ID — used to suppress mitigation CTA on cross-tenant scans */
    userTenantId?: string
}

// ─── Provenance Helpers ──────────────────────────────────────────────────────

function getProvenanceData(scan: ScanWithRelations): Partial<ProvenanceDetails> | null {
    // Prefer DB join data, fallback to risk_profile.c2pa_report blob
    if (scan.provenance_details) return scan.provenance_details
    if (scan.risk_profile?.c2pa_report) {
        const c2pa = scan.risk_profile.c2pa_report
        return {
            signature_status: c2pa.status === 'valid' ? 'valid' :
                c2pa.status === 'caution' ? 'caution' : 'invalid',
            creator_name: c2pa.creator || null,
            creation_tool: c2pa.tool || null,
            creation_tool_version: null,
            creation_timestamp: c2pa.timestamp || null,
            raw_manifest: c2pa.raw_manifest || null,
            edit_history: c2pa.history || null,
            certificate_issuer: null,
            certificate_serial: null,
            hashing_algorithm: 'sha256',
        } as Partial<ProvenanceDetails>
    }
    return null
}

function parseAiDeclaration(rawManifest: unknown): { declared: boolean; tool: string | null } {
    if (!rawManifest) return { declared: false, tool: null }
    try {
        const manifest = rawManifest as Record<string, unknown>
        // Look for AI generation assertions in C2PA manifest
        const manifestStr = typeof rawManifest === 'string' ? rawManifest : JSON.stringify(rawManifest)
        const aiPatterns = ['c2pa.ai_generated', 'c2pa.ai_training', 'ai_generative', 'generativeAI']
        const hasAiAssertion = aiPatterns.some(p => manifestStr.toLowerCase().includes(p.toLowerCase()))
        // Try to extract the tool name from assertions
        if (hasAiAssertion && typeof rawManifest === 'object' && rawManifest !== null) {
            const assertions = (manifest.assertions || (manifest.claim as Record<string, unknown>)?.assertions || []) as Array<Record<string, unknown>>
            for (const a of assertions) {
                const data = a?.data as Record<string, unknown> | undefined
                const label = a?.label as string | undefined
                if (data?.['dc:title'] || label?.includes('ai')) {
                    return { declared: true, tool: (data?.['dc:title'] as string) || 'AI Tool' }
                }
            }
        }
        return { declared: hasAiAssertion, tool: null }
    } catch {
        return { declared: false, tool: null }
    }
}

// ─── Status Helpers ──────────────────────────────────────────────────────────

type SignatureStatus = 'valid' | 'caution' | 'invalid'

function signatureStatusConfig(status: SignatureStatus | undefined) {
    switch (status) {
        case 'valid': return { label: 'VERIFIED', color: 'var(--rs-safe)', barWidth: 100 }
        case 'caution': return { label: 'CAUTION', color: 'var(--rs-risk-caution)', barWidth: 60 }
        case 'invalid': return { label: 'INVALID', color: 'var(--rs-signal)', barWidth: 30 }
        default: return { label: 'MISSING', color: 'var(--rs-signal)', barWidth: 5 }
    }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function UnifiedScanDrawer({
    scan,
    isOpen,
    onClose,
    entitlements,
    onGenerateMitigation,
    onShare,
    onDelete,
    onNotesUpdate,
    onDownload,
    onUnlock,
    notesBuffer,
    onNotesChange,
    isUpdatingNotes,
    shareToast,
    showDownloadBanner,
    onDismissDownloadBanner,
    userTenantId,
}: UnifiedScanDrawerProps) {
    const provenance = getProvenanceData(scan)
    const aiDeclaration = parseAiDeclaration(provenance?.raw_manifest)
    const sigConfig = signatureStatusConfig(provenance?.signature_status as SignatureStatus | undefined)
    const manifestDetected = !!provenance?.raw_manifest
    const hasEditHistory = Array.isArray(provenance?.edit_history) && provenance.edit_history.length > 0
    const latestMitigation: MitigationReport | null = scan.mitigation_reports?.[0] || null

    // Scan report access: always true when drawer is open (scan report = free baseline).
    // The drawer is only opened for authenticated or post-email users.
    const canViewScanReport = entitlements.canViewScanReport || entitlements.canViewFull || false
    const canViewProvenance = canViewScanReport
    const canViewBaselineReport = canViewScanReport

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null

    return (
        <>
            <motion.button
                type="button"
                aria-label="Close scan report"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px]"
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
                className="fixed inset-y-0 right-0 w-full sm:w-[900px] bg-[var(--rs-bg-surface)] border-l border-rs-border-strong shadow-[-40px_0_100px_rgba(0,0,0,0.1)] flex flex-col z-50 overflow-hidden"
            >
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="h-16 border-b border-rs-border-primary flex items-center justify-between px-6 bg-[var(--rs-bg-element)]/80 backdrop-blur-md shrink-0">
                <div className="space-y-0.5">
                    <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-rs-text-tertiary">Scan_Workspace</h2>
                    <p className="text-[10px] font-bold text-rs-text-primary uppercase tracking-wider truncate max-w-[280px]">{scan.filename}</p>
                </div>
                <button
                    onClick={onClose}
                    className="h-8 px-3 flex items-center gap-1.5 justify-center border border-rs-border-primary hover:border-rs-text-primary text-rs-text-tertiary hover:text-rs-text-primary transition-all rounded-[1px] hover:bg-[var(--rs-bg-element)] text-[9px] font-black uppercase tracking-wider"
                >
                    <X className="w-3.5 h-3.5" />
                    Close
                </button>
            </div>

            {/* ═══════════════ SCROLLABLE CONTENT ═══════════════ */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* ── Section 1: Scan Summary ── */}
                <section>
                    {/* Asset Preview */}
                    <div className="relative aspect-video bg-[var(--rs-bg-well)] border border-rs-border-primary p-2 group shadow-inner">
                        <div className="w-full h-full relative overflow-hidden border border-rs-border-primary/50 bg-[var(--rs-bg-surface)]">
                            {scan.file_type === 'video' ? (
                                <video
                                    src={scan.asset_url || ''}
                                    className="w-full h-full object-contain"
                                    controls
                                    muted
                                    playsInline
                                />
                            ) : (
                                <Image
                                    src={scan.asset_url || '/placeholder.png'}
                                    alt="Asset"
                                    fill
                                    className="object-contain grayscale-[0.2] transition-all group-hover:grayscale-0"
                                    unoptimized
                                />
                            )}
                        </div>
                        <div className="absolute bottom-4 left-4 px-2 py-1 bg-[var(--rs-bg-surface)]/90 backdrop-blur-sm border border-rs-border-primary text-[8px] font-mono text-rs-text-tertiary uppercase tracking-widest shadow-sm">
                            ID: {scan.id.slice(0, 8).toUpperCase()}
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <MetadataField icon={<FileText className="w-3 h-3" />} label="File" value={`${scan.filename} (${scan.file_type})`} />
                        <MetadataField icon={<Hash className="w-3 h-3" />} label="Size" value={scan.file_size ? formatBytes(scan.file_size) : '---'} />
                        <MetadataField icon={<Clock className="w-3 h-3" />} label="Created" value={format(new Date(scan.created_at), 'MMM d, yyyy HH:mm')} />
                        <MetadataField
                            icon={<Shield className="w-3 h-3" />}
                            label="Status"
                            value={scan.status.toUpperCase()}
                            valueClass={scan.status === 'complete' ? 'text-[var(--rs-safe)]' : scan.status === 'failed' ? 'text-[var(--rs-signal)]' : ''}
                        />
                        {scan.guideline_id && (
                            <MetadataField icon={<FileText className="w-3 h-3" />} label="Guideline" value={scan.brand_guidelines?.name || 'Custom'} className="col-span-2" />
                        )}
                    </div>
                </section>

                {/* ── Section 2: Risk Overview ── */}
                <section>
                    {scan.status === 'failed' ? (
                        <RSCallout variant="danger" title="Analysis Failed">
                            {(scan as unknown as { error_message?: string }).error_message || 'This scan could not be completed. Try uploading again.'}
                        </RSCallout>
                    ) : (
                        <RSRiskPanel
                            id={scan.id.slice(0, 8).toUpperCase()}
                            status={
                                scan.status === 'processing' || scan.status === 'pending' ? 'scanning' : 'completed'
                            }
                            score={scan.risk_profile?.composite_score || 0}
                            level={
                                scan.risk_level === 'review' ? 'medium' :
                                    scan.risk_level === 'caution' ? 'low' :
                                        (scan.risk_level || 'low') as RiskLevel
                            }
                            ipScore={scan.risk_profile?.ip_report?.score || 0}
                            safetyScore={scan.risk_profile?.safety_report?.score || 0}
                            provenanceScore={scan.risk_profile?.provenance_report?.score || 0}
                            className="shadow-sm"
                        />
                    )}
                </section>

                {/* ── Section 3: Findings (hidden for failed scans) ── */}
                {scan.status !== 'failed' && <section className="border border-rs-border-primary bg-[var(--rs-bg-surface)]">
                    <div className="px-5 py-3 border-b border-rs-border-primary bg-[var(--rs-bg-element)]/70 flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">Detected_Anomalies</span>
                        <div className="px-2 py-0.5 bg-rs-text-primary text-white text-[9px] font-bold rounded-[1px]">
                            {scan.scan_findings?.length || 0}
                        </div>
                    </div>
                    <div className="p-6">
                        {canViewBaselineReport ? (
                            // Full access: all findings visible
                            scan.scan_findings && scan.scan_findings.length > 0 ? (
                                <div className="relative border-l border-dashed border-rs-border-primary space-y-8 ml-2">
                                    {scan.scan_findings.map((finding) => (
                                        <div key={finding.id} className="relative pl-6">
                                            <div className={cn(
                                                "absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[var(--rs-bg-surface)]",
                                                finding.severity === 'critical' ? 'bg-rs-destruct' :
                                                    finding.severity === 'high' ? 'bg-rs-alert' : 'bg-rs-signal'
                                            )} />
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-rs-text-primary uppercase tracking-tight">{finding.title}</span>
                                                    <span className="text-[9px] font-mono text-rs-text-tertiary">{finding.confidence_score}%_CONF</span>
                                                </div>
                                                <p className="text-[10px] text-rs-text-secondary leading-relaxed bg-[var(--rs-bg-well)] p-3 rounded-[2px] border border-rs-border-primary/50 relative">
                                                    <span className="absolute top-2 -left-1 w-2 h-2 bg-[var(--rs-bg-well)] border-t border-l border-rs-border-primary/50 -rotate-45" />
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
                            )
                        ) : (
                            // Locked: show gated teaser
                            <div className="text-center py-8 space-y-4">
                                <div className="w-12 h-12 mx-auto rounded-full bg-[var(--rs-bg-element)] flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-rs-text-tertiary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-rs-text-primary uppercase tracking-widest">
                                        {scan.scan_findings?.length || 0} Findings_Detected
                                    </p>
                                    <p className="text-[10px] text-rs-text-secondary max-w-xs mx-auto leading-relaxed">
                                        Detailed analysis, severity levels, and mitigation strategies are restricted. Unlock the full report to view.
                                    </p>
                                </div>
                                <RSButton
                                    variant="primary"
                                    className="mx-auto text-[9px] uppercase tracking-widest font-black"
                                    onClick={onUnlock}
                                >
                                    Unlock_Full_Report
                                </RSButton>
                            </div>
                        )}
                    </div>
                </section>}

                {/* ── Section 3.5: Video Frame Analysis (video scans only) ── */}
                {scan.is_video && (scan.frames_analyzed ?? 0) > 0 && (
                    <section className="border border-rs-border-primary bg-[var(--rs-bg-surface)]">
                        <div className="px-5 py-3 border-b border-rs-border-primary bg-[var(--rs-bg-element)]/70 flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">Frame_Analysis</span>
                            <span className="text-[9px] font-mono text-rs-text-tertiary">
                                Worst-case scoring across {scan.frames_analyzed} analyzed frames
                            </span>
                        </div>
                        <div className="p-5">
                            <VideoFrameGrid scanId={scan.id} />
                        </div>
                    </section>
                )}

                {/* ── Section 4: Provenance & Creation ── */}
                <section>
                    <div className="relative w-full">
                        {/* Forensic Instrument Housing */}
                        <div className="relative bg-[var(--rs-bg-well)] rounded-[var(--rs-radius-container)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)] overflow-hidden flex flex-col font-mono text-[10px]">

                            {/* Header */}
                            <div className="px-6 py-4 border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-element)]/70 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        provenance?.signature_status === 'valid' ? 'bg-[var(--rs-safe)]' :
                                            provenance?.signature_status === 'caution' ? 'bg-[var(--rs-risk-caution)]' :
                                                manifestDetected ? 'bg-[var(--rs-signal)]' : 'bg-[var(--rs-text-tertiary)]'
                                    )} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--rs-text-tertiary)]">
                                        Content_Credentials
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: sigConfig.color }}>
                                    {manifestDetected ? sigConfig.label : 'NO_MANIFEST'}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">

                                {/* Manifest Status */}
                                <ProvenanceRow
                                    label="C2PA Manifest"
                                    value={manifestDetected ? 'Present' : 'Not Found'}
                                    status={manifestDetected ? 'success' : 'error'}
                                    barWidth={manifestDetected ? 95 : 5}
                                />

                                {/* Signature Verification */}
                                <ProvenanceRow
                                    label="Digital Signature"
                                    value={sigConfig.label}
                                    status={provenance?.signature_status === 'valid' ? 'success' : provenance?.signature_status === 'caution' ? 'warning' : 'error'}
                                    barWidth={sigConfig.barWidth}
                                    detail={provenance?.signature_status === 'valid'
                                        ? 'Cryptographic chain intact — asset has not been modified since signing.'
                                        : provenance?.signature_status === 'caution'
                                            ? 'Signature present but chain may have been modified.'
                                            : undefined}
                                />

                                {/* Creator Identity */}
                                <ProvenanceRow
                                    label="Creator Identity"
                                    value={provenance?.creator_name || 'Unknown'}
                                    status={provenance?.creator_name ? 'success' : 'warning'}
                                    barWidth={provenance?.creator_name ? 88 : 20}
                                    detail={provenance?.creation_tool
                                        ? `Tool: ${provenance.creation_tool}${provenance.creation_tool_version ? ` v${provenance.creation_tool_version}` : ''}`
                                        : undefined}
                                    blurred={!canViewProvenance}
                                />

                                {/* Signing Authority */}
                                {canViewProvenance && (
                                    <ProvenanceRow
                                        label="Signing Authority"
                                        value={provenance?.certificate_issuer || 'Not Available'}
                                        status={provenance?.certificate_issuer ? 'success' : 'warning'}
                                        barWidth={provenance?.certificate_issuer ? 80 : 10}
                                        detail={provenance?.certificate_serial ? `Serial: ${provenance.certificate_serial}` : undefined}
                                    />
                                )}

                                {/* AI Content Declaration */}
                                <ProvenanceRow
                                    label="AI Content Declaration"
                                    value={aiDeclaration.declared ? 'Declared' : 'Undeclared'}
                                    status={aiDeclaration.declared ? 'info' : 'warning'}
                                    barWidth={aiDeclaration.declared ? 100 : 15}
                                    detail={aiDeclaration.tool ? `Generator: ${aiDeclaration.tool}` : undefined}
                                    blurred={!canViewProvenance}
                                />

                                {/* Chain of Custody (edit history) */}
                                {canViewProvenance && hasEditHistory && (
                                    <div className="pt-2 border-t border-[var(--rs-border-primary)]/50">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] mb-2 block">
                                            Chain of Custody
                                        </span>
                                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                                            {provenance!.edit_history!.map((entry: { action?: string; label?: string; tool?: string; timestamp?: string }, i: number) => (
                                                <div key={i} className="flex items-center gap-3 text-[9px] py-1 px-2 bg-[var(--rs-bg-surface)] rounded border border-[var(--rs-border-primary)]/30">
                                                    <span className="w-4 text-[var(--rs-text-tertiary)] font-bold">{i + 1}</span>
                                                    <span className="text-[var(--rs-text-primary)] font-medium flex-1 truncate">
                                                        {entry.action || entry.label || 'Edit'}
                                                    </span>
                                                    {entry.tool && (
                                                        <span className="text-[var(--rs-text-tertiary)]">{entry.tool}</span>
                                                    )}
                                                    {entry.timestamp && (
                                                        <span className="text-[var(--rs-text-tertiary)] shrink-0">
                                                            {format(new Date(entry.timestamp), 'MMM d HH:mm')}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cryptographic Evidence */}
                                {canViewProvenance && manifestDetected && (
                                    <div className="pt-2 border-t border-[var(--rs-border-primary)]/50">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] mb-1 block">
                                            Cryptographic Evidence
                                        </span>
                                        <div className="text-[9px] text-[var(--rs-text-secondary)] space-y-0.5">
                                            <div>Hash Algorithm: <span className="text-[var(--rs-text-primary)] font-medium">{provenance?.hashing_algorithm || 'SHA-256'}</span></div>
                                            {provenance?.creation_timestamp && (
                                                <div>Signed At: <span className="text-[var(--rs-text-primary)] font-medium">{format(new Date(provenance.creation_timestamp), 'MMM d, yyyy HH:mm:ss')}</span></div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Blurred overlay for pre-email users */}
                                {!canViewProvenance && (
                                    <div className="pt-2 border-t border-[var(--rs-border-primary)]/50">
                                        <div className="text-center py-3">
                                            <p className="text-[9px] text-[var(--rs-text-tertiary)] uppercase tracking-wider">
                                                Additional provenance data available after account creation
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Verify Externally */}
                                <div className="pt-2 border-t border-[var(--rs-border-primary)]/50">
                                    <a
                                        href="https://contentcredentials.org/verify"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[var(--rs-info)] hover:underline"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Verify on ContentCredentials.org
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Section 4.5: Mitigation Report ── */}
                {latestMitigation?.status === 'complete' && latestMitigation.report_content && (() => {
                    const rc = latestMitigation.report_content
                    const decisionColors: Record<string, string> = {
                        clear: 'text-[var(--rs-safe)] border-[var(--rs-safe)]/40',
                        watch: 'text-[var(--rs-info)] border-[var(--rs-info)]/40',
                        hold: 'text-[var(--rs-warn)] border-[var(--rs-warn)]/40',
                        block: 'text-rs-destruct border-rs-destruct/40',
                    }
                    return (
                        <section className="space-y-3 pt-4 border-t border-rs-border-primary/50">
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">Mitigation_Report</span>

                            {/* Executive Summary */}
                            <div className="p-3 bg-[var(--rs-bg-well)] rounded-[2px] space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border rounded-[1px] ${decisionColors[rc.executive_summary.decision] || 'text-rs-text-secondary border-rs-border-primary'}`}>
                                        {rc.executive_summary.decision}
                                    </span>
                                    <span className="text-[8px] text-rs-text-tertiary">
                                        Confidence: {rc.executive_summary.confidence}% · Approver: {rc.executive_summary.approver_level}
                                    </span>
                                </div>
                                <p className="text-[10px] text-rs-text-secondary leading-relaxed">{rc.executive_summary.rationale}</p>
                            </div>

                            {/* Domain Analyses */}
                            {[
                                { label: 'IP_Analysis', data: rc.ip_analysis },
                                { label: 'Safety_Analysis', data: rc.safety_analysis },
                                { label: 'Provenance_Analysis', data: rc.provenance_analysis },
                            ].map(({ label, data }) => data && (
                                <div key={label} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-rs-text-tertiary">{label}</span>
                                        <span className={`text-[8px] font-bold uppercase ${data.severity === 'critical' || data.severity === 'high' ? 'text-rs-destruct' : data.severity === 'medium' ? 'text-[var(--rs-warn)]' : 'text-[var(--rs-safe)]'}`}>
                                            {data.severity}
                                        </span>
                                        <span className="text-[8px] text-rs-text-tertiary">
                                            {data.remediation_status === 'required' ? '⚠ Remediation Required' : '✓ No Remediation Needed'}
                                        </span>
                                    </div>
                                    {data.exposures?.length > 0 && (
                                        <div className="pl-2 space-y-1">
                                            {data.exposures.map((e: { type: string; description: string }, i: number) => (
                                                <div key={i} className="text-[9px] text-rs-text-secondary">
                                                    <span className="text-rs-text-primary font-medium">{e.type}:</span> {e.description}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Mitigation Actions */}
                            {rc.mitigation_plan?.actions?.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-rs-text-tertiary">Action_Plan</span>
                                    <div className="space-y-2">
                                        {rc.mitigation_plan.actions.map((a: { priority: number; domain: string; action: string; owner: string; effort: string; verification: string }, i: number) => (
                                            <div key={i} className="p-2 bg-[var(--rs-bg-surface)] border border-rs-border-primary rounded-[2px]">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[8px] font-black text-rs-text-primary">#{a.priority}</span>
                                                    <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--rs-info)]">{a.domain}</span>
                                                    <span className="text-[8px] text-rs-text-tertiary ml-auto">{a.effort}</span>
                                                </div>
                                                <p className="text-[9px] text-rs-text-primary font-medium">{a.action}</p>
                                                <p className="text-[8px] text-rs-text-tertiary mt-0.5">Owner: {a.owner} · Verify: {a.verification}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Residual Risk */}
                            {rc.residual_risk && (
                                <div className="p-2 bg-[var(--rs-bg-well)] rounded-[2px] space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-rs-text-tertiary">Residual_Risk</span>
                                        <span className={`text-[8px] font-black uppercase ${rc.residual_risk.publish_decision === 'approved' ? 'text-[var(--rs-safe)]' : rc.residual_risk.publish_decision === 'conditional' ? 'text-[var(--rs-warn)]' : 'text-rs-destruct'}`}>
                                            {rc.residual_risk.publish_decision}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-rs-text-secondary">{rc.residual_risk.remaining_risk}</p>
                                    {rc.residual_risk.conditions?.length > 0 && (
                                        <div className="text-[8px] text-rs-text-tertiary">
                                            Conditions: {rc.residual_risk.conditions.join(' · ')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Download Mitigation PDF (Sprint 10.10) */}
                            <RSButton
                                variant="ghost"
                                className="w-full h-8 text-[8px] uppercase tracking-widest font-black border border-rs-border-primary hover:bg-[var(--rs-bg-element)] hover:border-rs-text-primary transition-all mt-3"
                                onClick={() => {
                                    generateMitigationPDF(
                                        rc,
                                        scan,
                                        latestMitigation.id,
                                        latestMitigation.completed_at || undefined,
                                    )
                                }}
                            >
                                <Download className="w-3 h-3 mr-1.5" />
                                Export_Mitigation_PDF
                            </RSButton>
                        </section>
                    )
                })()}

                {/* ── Section 5: Collaboration (Notes) ── */}
                <section className="space-y-2 pt-4 border-t border-rs-border-primary/50">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary">Compliance_Log</span>
                        {isUpdatingNotes && <Loader2 className="w-3 h-3 text-rs-text-tertiary animate-spin" />}
                    </div>
                    <RSTextarea
                        placeholder="Add compliance notes, reviewer observations, or audit trail entries..."
                        rows={4}
                        value={notesBuffer}
                        onChange={(e) => onNotesChange(e.target.value)}
                        onBlur={(e) => onNotesUpdate(scan.id, e.target.value)}
                        className="bg-[var(--rs-bg-surface)] border-rs-border-primary text-[10px] font-mono p-3 focus:border-rs-text-primary rounded-[1px] shadow-none resize-none"
                    />
                </section>

                {/* Post-Purchase Download Banner */}
                {showDownloadBanner && canViewScanReport && (
                    <div className="p-4 bg-[var(--rs-safe)]/10 border border-[var(--rs-safe)]/30 rounded-[2px] flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-[var(--rs-text-primary)] uppercase tracking-wide">Report Ready</p>
                            <p className="text-[10px] text-[var(--rs-text-secondary)]">Your full forensic report is ready to download.</p>
                        </div>
                        <RSButton
                            variant="primary"
                            className="text-[9px] uppercase tracking-widest font-black shrink-0"
                            onClick={() => {
                                onDownload(scan)
                                onDismissDownloadBanner()
                            }}
                        >
                            Download
                        </RSButton>
                    </div>
                )}

                {/* ── Section 6: Actions ── */}
                <section className="pt-8 flex flex-col gap-2">
                    {/* Download Scan Report */}
                            <RSButton
                                variant="ghost"
                                className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-rs-border-primary hover:bg-[var(--rs-bg-element)] hover:border-rs-text-primary transition-all"
                                onClick={() => onDownload(scan)}
                            >
                                Export_Dossier
                            </RSButton>

                    {/* Share */}
                    <RSButton
                        variant="ghost"
                        className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-rs-border-primary hover:bg-[var(--rs-bg-element)] hover:border-rs-text-primary transition-all"
                        onClick={() => onShare(scan.id)}
                    >
                        {shareToast || 'Share_Link'}
                    </RSButton>

                    {/* Delete */}
                    <RSButton
                        variant="ghost"
                        className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-rs-border-primary text-rs-destruct hover:bg-rs-destruct/5 hover:border-rs-destruct transition-all"
                        onClick={() => onDelete(scan.id)}
                    >
                        Purge_Archive
                    </RSButton>
                </section>
            </div>

            {/* ═══════════════ STICKY FOOTER: Mitigation CTA ═══════════════ */}
            {scan.status === 'complete' && (!userTenantId || scan.tenant_id === userTenantId) && (
                <div className="shrink-0 border-t border-[var(--rs-border-primary)] px-6 py-4 bg-[var(--rs-bg-element)]/80 backdrop-blur-md">
                    <MitigationCTA
                        latestMitigation={latestMitigation}
                        entitlements={entitlements}
                        onGenerate={() => onGenerateMitigation(scan.id)}
                    />
                </div>
            )}
            </motion.div>
        </>
    )
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function MetadataField({ icon, label, value, valueClass, className }: {
    icon: React.ReactNode
    label: string
    value: string
    valueClass?: string
    className?: string
}) {
    return (
        <div className={cn("flex items-start gap-2 py-2 px-3 bg-[var(--rs-bg-well)] border border-[var(--rs-border-primary)]/30 rounded-[2px]", className)}>
            <div className="text-[var(--rs-text-tertiary)] mt-0.5 shrink-0">{icon}</div>
            <div className="min-w-0">
                <div className="text-[8px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)]">{label}</div>
                <div className={cn("text-[10px] font-medium text-[var(--rs-text-primary)] truncate", valueClass)}>{value}</div>
            </div>
        </div>
    )
}

function ProvenanceRow({ label, value, status, barWidth, detail, blurred }: {
    label: string
    value: string
    status: 'success' | 'warning' | 'error' | 'info'
    barWidth: number
    detail?: string
    blurred?: boolean
}) {
    const colors: Record<string, string> = {
        success: 'var(--rs-safe)',
        warning: 'var(--rs-risk-caution)',
        error: 'var(--rs-signal)',
        info: 'var(--rs-info)',
    }
    const color = colors[status] || colors.info

    return (
        <div className={cn("space-y-1", blurred && "blur-[3px] select-none pointer-events-none")}>
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)]">{label}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color }}>{value}</span>
            </div>
            <div className="w-full h-1 bg-[var(--rs-bg-surface)] rounded-full overflow-hidden">
                <div
                    className="h-full transition-all duration-700 rounded-full"
                    style={{ width: `${barWidth}%`, backgroundColor: color, opacity: 0.7 }}
                />
            </div>
            {detail && (
                <p className="text-[8px] text-[var(--rs-text-tertiary)] leading-relaxed">{detail}</p>
            )}
        </div>
    )
}

function MitigationCTA({ latestMitigation, entitlements, onGenerate }: {
    latestMitigation: MitigationReport | null
    entitlements: DrawerEntitlements
    onGenerate: () => void
}) {
    // If mitigation exists for this scan
    if (latestMitigation) {
        if (latestMitigation.status === 'complete') {
            return (
                <RSButton
                    variant="ghost"
                    className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-[var(--rs-safe)]/40 text-[var(--rs-safe)] hover:bg-[var(--rs-safe)]/5 hover:border-[var(--rs-safe)] transition-all"
                    onClick={onGenerate}
                >
                    View_Mitigation_Report
                </RSButton>
            )
        }
        if (latestMitigation.status === 'processing' || latestMitigation.status === 'pending') {
            return (
                <RSButton
                    variant="ghost"
                    className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-rs-border-primary text-rs-text-tertiary cursor-wait"
                    disabled
                >
                    <Loader2 className="w-3 h-3 animate-spin mr-2 inline" />
                    Generating_Report...
                </RSButton>
            )
        }
        if (latestMitigation.status === 'failed') {
            return (
                <RSButton
                    variant="ghost"
                    className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-rs-destruct/40 text-rs-destruct hover:bg-rs-destruct/5 transition-all"
                    onClick={onGenerate}
                >
                    Retry_Mitigation_Report
                </RSButton>
            )
        }
    }

    // No mitigation yet — show generate CTA
    const { mitigationCredits } = entitlements
    const hasCredits = mitigationCredits.included > 0 && mitigationCredits.used < mitigationCredits.included
    const remaining = mitigationCredits.included - mitigationCredits.used

    if (hasCredits) {
        return (
            <RSButton
                variant="ghost"
                className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-[var(--rs-info)]/40 text-[var(--rs-info)] hover:bg-[var(--rs-info)]/5 hover:border-[var(--rs-info)] transition-all"
                onClick={onGenerate}
            >
                Generate_Mitigation ({remaining} of {mitigationCredits.included} remaining)
            </RSButton>
        )
    }

    // No credits — $29 purchase
    return (
        <RSButton
            variant="ghost"
            className="w-full h-9 text-[9px] uppercase tracking-widest font-black border border-[var(--rs-info)]/40 text-[var(--rs-info)] hover:bg-[var(--rs-info)]/5 hover:border-[var(--rs-info)] transition-all"
            onClick={onGenerate}
        >
            Generate_Mitigation — $29
        </RSButton>
    )
}
