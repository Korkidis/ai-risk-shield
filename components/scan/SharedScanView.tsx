'use client'

import { useState, useEffect } from 'react'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSRiskPanel } from '@/components/rs/RSRiskPanel'
import { RSFindingsDossier } from '@/components/rs/RSFindingsDossier'
import { RSEmptyState } from '@/components/rs/RSEmptyState'
import { RSButton } from '@/components/rs/RSButton'
import { Shield, AlertOctagon, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { RiskLevel } from '@/components/rs/RSRiskScore'

/**
 * Map scan risk_level ('review'/'caution') to RSRiskPanel level type
 */
function toRiskPanelLevel(level?: string): RiskLevel {
    switch (level) {
        case 'critical': return 'critical'
        case 'high': return 'high'
        case 'review': return 'medium'
        case 'caution': return 'low'
        case 'safe': return 'safe'
        default: return 'info'
    }
}

interface SharedScanViewProps {
    scanId: string
    token: string
}

export default function SharedScanView({ scanId, token }: SharedScanViewProps) {
    const [scan, setScan] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchScan() {
            try {
                const res = await fetch(`/api/scans/${scanId}?token=${token}`)
                if (res.status === 403) {
                    setError('expired')
                    return
                }
                if (res.status === 404) {
                    setError('not_found')
                    return
                }
                if (!res.ok) {
                    setError('error')
                    return
                }
                const data = await res.json()
                setScan(data)
            } catch {
                setError('error')
            } finally {
                setLoading(false)
            }
        }
        fetchScan()
    }, [scanId, token])

    // Loading state
    if (loading) {
        return (
            <RSBackground variant="technical" className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[var(--rs-signal)] border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs uppercase tracking-widest text-[var(--rs-text-secondary)] animate-pulse">
                        Loading forensic report...
                    </span>
                </div>
            </RSBackground>
        )
    }

    // Error states
    if (error) {
        const config = {
            expired: {
                icon: <Clock className="w-8 h-8 text-[var(--rs-risk-caution)]" />,
                title: 'Link Expired',
                description: 'This shared report link has expired. Share links are valid for 7 days. Ask the report owner to generate a new link.'
            },
            not_found: {
                icon: <AlertOctagon className="w-8 h-8 text-[var(--rs-text-tertiary)]" />,
                title: 'Report Not Found',
                description: 'This scan report does not exist or has been deleted.'
            },
            error: {
                icon: <AlertOctagon className="w-8 h-8 text-[var(--rs-signal)]" />,
                title: 'Unable to Load Report',
                description: 'An error occurred loading this report. Please try again later.'
            }
        }[error] || { icon: null, title: 'Error', description: 'Something went wrong.' }

        return (
            <RSBackground variant="technical" className="min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full mx-4">
                    <RSEmptyState
                        icon={config.icon}
                        title={config.title}
                        description={config.description}
                        action={
                            <Link href="/">
                                <RSButton variant="primary">
                                    Go to AI Risk Shield
                                </RSButton>
                            </Link>
                        }
                    />
                </div>
            </RSBackground>
        )
    }

    // Success: render the shared scan
    const riskProfile = scan.risk_profile
    const level = toRiskPanelLevel(scan.risk_level)

    return (
        <RSBackground variant="technical" className="min-h-screen">
            {/* Header */}
            <header className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Shield className="w-5 h-5 text-[var(--rs-signal)] group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--rs-text-primary)]">
                            AI Risk Shield
                        </span>
                    </Link>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--rs-text-tertiary)]">
                        Shared Report
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* File info */}
                <div className="flex items-center gap-3 font-mono text-xs text-[var(--rs-text-secondary)]">
                    <span className="uppercase tracking-widest font-bold text-[var(--rs-text-tertiary)]">Asset:</span>
                    <span>{scan.assets?.filename || 'Unknown file'}</span>
                    <span className="text-[var(--rs-text-tertiary)]">|</span>
                    <span>{new Date(scan.created_at).toLocaleDateString()}</span>
                </div>

                {/* Asset preview */}
                {scan.asset_url && (
                    <div className="rounded-lg overflow-hidden border border-[var(--rs-border-primary)] bg-black/20 max-h-[400px] flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={scan.asset_url}
                            alt="Scanned asset"
                            className="max-h-[400px] object-contain"
                        />
                    </div>
                )}

                {/* Risk Panel */}
                <RSRiskPanel
                    id={scanId.substring(0, 8).toUpperCase()}
                    score={scan.composite_score || 0}
                    level={level}
                    ipScore={scan.ip_risk_score || 0}
                    safetyScore={scan.safety_risk_score || 0}
                    provenanceScore={scan.provenance_risk_score || 0}
                    status="completed"
                />

                {/* Findings */}
                <RSFindingsDossier
                    isComplete={true}
                    findings={scan.scan_findings}
                    riskProfile={riskProfile}
                    scanId={scanId}
                    ctaMode="free"
                />
            </main>

            {/* CTA Footer */}
            <footer className="border-t border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]/80 backdrop-blur-sm mt-12">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center space-y-4">
                    <p className="font-mono text-sm text-[var(--rs-text-secondary)]">
                        Protect your AI-generated content from copyright, safety, and provenance risks.
                    </p>
                    <Link href="/">
                        <RSButton
                            variant="primary"
                            size="lg"
                            icon={<ArrowRight className="w-4 h-4" />}
                        >
                            Run a Free Scan
                        </RSButton>
                    </Link>
                </div>
            </footer>
        </RSBackground>
    )
}
