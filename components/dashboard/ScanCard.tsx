"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ScanWithRelations } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { getRiskTier } from '@/lib/risk-utils'
import { RSProcessingPanel } from '@/components/rs/RSProcessingPanel'
import { formatBytes } from '@/lib/utils'

export interface ScanCardProps {
    scan: ScanWithRelations
    isSelected: boolean
    isBulkSelected: boolean
    liveProgress?: number
    liveMessage?: string
    onBulkToggle: (checked: boolean) => void
    onClick: () => void
    onDownload: () => void
    onShare: () => void
}

export function ScanCard({ scan, isSelected, isBulkSelected, liveProgress, liveMessage, onBulkToggle, onClick, onDownload, onShare }: ScanCardProps) {
    const score = scan.risk_profile?.composite_score || 0;
    const thumbnailPath = scan.tenant_id && scan.asset_id ? `${scan.tenant_id}/${scan.asset_id}_thumb.jpg` : null;
    const thumbnailUrl = thumbnailPath ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/thumbnails/${thumbnailPath}` : null;
    const [imgSrc, setImgSrc] = useState(thumbnailUrl || scan.asset_url || scan.image_url);
    const [imgError, setImgError] = useState(false);

    const riskTier = getRiskTier(score);

    // Only reset image state when scan ID changes (not on every data update)
    useEffect(() => {
        setImgSrc(thumbnailUrl || scan.asset_url || scan.image_url);
        setImgError(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scan.id]); // Intentionally only depend on ID to prevent flicker

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
            <div className="relative h-[60%] w-full bg-[var(--rs-bg-element)] overflow-hidden p-3 transition-colors group-hover/card:bg-[var(--rs-bg-well)]">
                {/* Image Container */}
                <div className="w-full h-full relative group/thumb overflow-hidden bg-[var(--rs-bg-surface)] shadow-sm ring-1 ring-[var(--rs-border-primary)]/50 rounded-[var(--rs-radius-element)]">
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
                                progress={liveProgress || 0}
                                statusMessage={liveMessage || "INITIALIZING..."}
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
                    <div className="relative w-[24px] h-[24px] bg-[var(--rs-bg-surface)]/80 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm">
                        <input
                            type="checkbox"
                            checked={isBulkSelected}
                            onChange={(e) => onBulkToggle(e.target.checked)}
                            className={cn(
                                "w-5 h-5 appearance-none border-2 border-rs-border-primary bg-transparent transition-all cursor-pointer rounded-[2px]",
                                "checked:bg-[var(--rs-info)] checked:border-[var(--rs-info)] relative",
                                "after:content-[''] after:hidden checked:after:block after:w-2 after:h-2 after:bg-white after:absolute after:top-[3px] after:left-[3px] after:rounded-[1px]"
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* 2-5. Metadata & Actions Area */}
            <div className="flex-1 w-full px-3 pb-3 pt-3 flex flex-col relative z-10">
                {/* 2. Score Number */}
                <div className="flex items-baseline gap-1" style={{ color: scan.status === 'complete' ? riskTier.colorVar : 'var(--rs-text-tertiary)' }}>
                    {scan.status === 'complete' ? (
                        <>
                            <span className="text-[32px] font-bold font-mono leading-none tracking-[-0.05em]">{score}</span>
                            <span className="text-[14px] font-mono opacity-60 leading-none">/100</span>
                        </>
                    ) : (
                        <span className="text-[12px] font-mono font-bold tracking-widest uppercase">
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
                <div className="mt-[4px] flex items-center gap-2 text-[10px] text-rs-text-tertiary font-mono uppercase tracking-wide">
                    <span>{formatDistanceToNow(new Date(scan.created_at || new Date()))} AGO</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-current" />
                    <span>{scan.file_size ? formatBytes(scan.file_size) : '---'}</span>
                </div>

                {/* Spacer to push actions to bottom */}
                <div className="flex-1" />

                {/* 5. Action Buttons (Standard Row) */}
                <div className="mt-[8px] flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload(); }}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-rs-text-secondary hover:text-rs-text-primary hover:bg-[var(--rs-bg-element)] transition-all group/btn"
                        title="Download report"
                    >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onShare(); }}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[4px] text-rs-text-secondary hover:text-rs-text-primary hover:bg-[var(--rs-bg-element)] transition-all group/btn"
                        title="Share scan"
                    >
                        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
