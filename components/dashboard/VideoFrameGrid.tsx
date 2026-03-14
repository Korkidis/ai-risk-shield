"use client"

import { useEffect, useState } from 'react'
import { RSRiskBadge, type RiskLevel } from '@/components/rs/RSRiskBadge'
import { cn } from '@/lib/utils'

interface FrameData {
    frameNumber: number
    timestampMs: number
    compositeScore: number | null
    ipScore: number | null
    safetyScore: number | null
    signedUrl: string | null
}

interface VideoFrameGridProps {
    scanId: string
    shareToken?: string | null
    className?: string
}

function scoreToRiskLevel(score: number | null): RiskLevel {
    if (score === null) return 'unknown'
    if (score >= 85) return 'critical'
    if (score >= 65) return 'high'
    if (score >= 45) return 'warning'
    if (score >= 25) return 'medium'
    return 'safe'
}

export function VideoFrameGrid({ scanId, shareToken, className }: VideoFrameGridProps) {
    const [frames, setFrames] = useState<FrameData[]>([])
    const [highestRiskFrame, setHighestRiskFrame] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchFrames() {
            try {
                const params = new URLSearchParams()
                if (shareToken) params.set('token', shareToken)
                const url = `/api/scans/${scanId}/frames${params.toString() ? `?${params}` : ''}`
                const res = await fetch(url)
                if (!res.ok) {
                    throw new Error('Failed to load frame data')
                }
                const data = await res.json()
                setFrames(data.frames || [])
                setHighestRiskFrame(data.highestRiskFrame ?? null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load frames')
            } finally {
                setLoading(false)
            }
        }
        fetchFrames()
    }, [scanId, shareToken])

    if (loading) {
        return (
            <div className={cn("space-y-3", className)}>
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">
                        FRAME ANALYSIS
                    </span>
                    <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] animate-pulse">
                        LOADING...
                    </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-video rounded-sm bg-[var(--rs-bg-element)] animate-pulse border border-[var(--rs-border-primary)]/30"
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (error || frames.length === 0) {
        return null // Don't show section if no frames
    }

    return (
        <div className={cn("space-y-3", className)}>
            {/* Section header — mono micro-label */}
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">
                    FRAME ANALYSIS
                </span>
                <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                    {frames.length} FRAME{frames.length !== 1 ? 'S' : ''} EXTRACTED
                </span>
            </div>

            {/* Frame grid — recessed bays on matte surface */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {frames.map((frame) => {
                    const isHighestRisk = frame.frameNumber === highestRiskFrame
                    const riskLevel = scoreToRiskLevel(frame.compositeScore)

                    return (
                        <div
                            key={frame.frameNumber}
                            className={cn(
                                "relative group rounded-sm overflow-hidden",
                                "border transition-colors",
                                "bg-[var(--rs-bg-element)]",
                                isHighestRisk
                                    ? "border-[var(--rs-risk-review)] ring-1 ring-[var(--rs-risk-review)]/40"
                                    : "border-[var(--rs-border-primary)]/40 hover:border-[var(--rs-border-primary)]"
                            )}
                        >
                            {/* Frame thumbnail */}
                            <div className="aspect-video relative bg-[var(--rs-bg-inset)]">
                                {frame.signedUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={frame.signedUrl}
                                        alt={`Frame ${frame.frameNumber + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase">
                                            NO PREVIEW
                                        </span>
                                    </div>
                                )}

                                {/* Score badge overlay — top-right */}
                                {frame.compositeScore !== null && (
                                    <div className="absolute top-1 right-1">
                                        <RSRiskBadge
                                            level={riskLevel}
                                            value={String(frame.compositeScore)}
                                            size="sm"
                                        />
                                    </div>
                                )}

                                {/* Highest risk indicator */}
                                {isHighestRisk && (
                                    <div className="absolute top-1 left-1">
                                        <span className="text-[7px] font-mono font-bold text-[var(--rs-risk-review)] bg-[var(--rs-bg-surface)]/90 px-1 py-0.5 rounded-sm uppercase tracking-wider">
                                            PEAK RISK
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Frame label — mono micro-label below thumbnail */}
                            <div className="px-1.5 py-1 bg-[var(--rs-bg-surface)]">
                                <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                                    FRAME {String(frame.frameNumber + 1).padStart(2, '0')}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
