'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSPanel } from '@/components/rs/RSPanel'
import { RSRadialMeter } from '@/components/rs/RSRadialMeter'
import { Header } from '@/components/layout/Header'
import { RiskProfile } from '@/lib/gemini-types'
import Link from 'next/link'
import { generateForensicReport } from '@/lib/pdf-generator'
import { UpgradeButton } from '@/components/billing/UpgradeButton'
import { FileText } from 'lucide-react'

export default function ScanResultPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const scanId = params.id as string
    const verified = searchParams.get('verified') === 'true'

    const [loading, setLoading] = useState(true)
    const [scan, setScan] = useState<any>(null)
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)

    useEffect(() => {
        async function loadScan() {
            try {
                const res = await fetch(`/api/scans/${scanId}`)
                if (!res.ok) throw new Error('Failed to load scan')

                const data = await res.json()
                setScan(data)
                setRiskProfile(data.risk_profile)
            } catch (error) {
                console.error('Failed to load scan:', error)
            } finally {
                setLoading(false)
            }
        }

        loadScan()
    }, [scanId])

    if (loading) {
        return (
            <RSBackground variant="standard">
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-[var(--rs-text-secondary)]">Loading scan results...</p>
                </div>
            </RSBackground>
        )
    }

    if (!scan || !riskProfile) {
        return (
            <RSBackground variant="standard">
                <Header />
                <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                    <p className="text-[var(--rs-text-primary)] text-lg">Scan not found</p>
                    <Link href="/" className="text-[var(--rs-border-focus)] hover:underline">
                        Return to homepage
                    </Link>
                </div>
            </RSBackground>
        )
    }

    const riskLevel = riskProfile.composite_score >= 85 ? 'critical' :
        riskProfile.composite_score >= 60 ? 'high' :
            riskProfile.composite_score >= 40 ? 'medium' :
                riskProfile.composite_score > 0 ? 'low' : 'safe'

    return (
        <RSBackground variant="standard">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-12">
                {verified && (
                    <div className="mb-8 bg-[var(--rs-safe)]/10 border border-[var(--rs-safe)] rounded-lg p-4 text-center">
                        <p className="text-[var(--rs-safe)] font-bold">✓ Email verified! You now have full access to this report.</p>
                    </div>
                )}

                <RSPanel className="bg-[var(--rs-bg-surface)] border-[var(--rs-border-primary)]">
                    <div className="text-center py-12">
                        <div className="inline-block mb-8">
                            <RSRadialMeter
                                value={riskProfile.composite_score}
                                level={riskLevel}
                                size={280}
                            />
                        </div>

                        <h1 className="text-4xl font-black uppercase mb-4 text-[var(--rs-text-primary)]">
                            {riskProfile.verdict}
                        </h1>

                        <p className="text-[var(--rs-text-secondary)] max-w-2xl mx-auto mb-8">
                            {riskProfile.ip_report.teaser}
                        </p>

                        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                            <div className="bg-[var(--rs-bg-element)] p-4 rounded">
                                <p className="text-xs text-[var(--rs-text-tertiary)] mb-2 uppercase">IP Risk</p>
                                <p className="text-2xl font-bold text-[var(--rs-text-primary)]">{riskProfile.ip_report.score}%</p>
                            </div>
                            <div className="bg-[var(--rs-bg-element)] p-4 rounded">
                                <p className="text-xs text-[var(--rs-text-tertiary)] mb-2 uppercase">Safety</p>
                                <p className="text-2xl font-bold text-[var(--rs-text-primary)]">{riskProfile.safety_report.score}%</p>
                            </div>
                            <div className="bg-[var(--rs-bg-element)] p-4 rounded">
                                <p className="text-xs text-[var(--rs-text-tertiary)] mb-2 uppercase">Provenance</p>
                                <p className="text-2xl font-bold text-[var(--rs-text-primary)]">{riskProfile.provenance_report.score}%</p>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col gap-4 items-center max-w-md mx-auto">
                            {scan.purchased ? (
                                // PURCHASED: Download Full Report
                                <button
                                    onClick={() => {
                                        if (!riskProfile) return
                                        const filename = (scan.assets as any)?.filename || 'scan-result'
                                        const is_video = (scan.assets as any)?.file_type === 'video'
                                        generateForensicReport({ ...scan, filename, is_video } as any, riskProfile, false)
                                    }}
                                    className="w-full inline-flex justify-center items-center gap-2 bg-[var(--rs-text-primary)] text-[var(--rs-bg-root)] px-8 py-4 rounded-lg font-bold hover:bg-[var(--rs-text-secondary)] transition-colors uppercase tracking-wider"
                                >
                                    <FileText className="w-5 h-5" />
                                    DOWNLOAD FULL FORENSIC REPORT
                                </button>
                            ) : (
                                // NOT PURCHASED: Upgrade (Primary) + Sample (Secondary)
                                <>
                                    <div className="w-full">
                                        <UpgradeButton scanId={scan.id} />
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!riskProfile) return
                                            const filename = (scan.assets as any)?.filename || 'scan-result'
                                            const is_video = (scan.assets as any)?.file_type === 'video'
                                            generateForensicReport({ ...scan, filename, is_video } as any, riskProfile, true)
                                        }}
                                        className="text-sm text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] underline underline-offset-4 decoration-[var(--rs-border-strong)] transition-colors uppercase tracking-wide font-medium"
                                    >
                                        Download Redacted Sample Report
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </RSPanel>
            </main>
        </RSBackground>
    )
}
