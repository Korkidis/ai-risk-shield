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
import { OneTimePurchaseButton } from '@/components/billing/OneTimePurchaseButton'
import { AuditModal } from '@/components/marketing/AuditModal'

export default function ScanResultPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const scanId = params.id as string
    const verified = searchParams.get('verified') === 'true'

    const [loading, setLoading] = useState(true)
    const [scan, setScan] = useState<any>(null)
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
    const [showAuditModal, setShowAuditModal] = useState(false)

    useEffect(() => {
        async function loadScan() {
            try {
                // If verified just now, try to assign scan to user
                if (verified) {
                    try {
                        await fetch('/api/scans/assign-to-user', { method: 'POST' })

                        // Show modal after a brief delay
                        setTimeout(() => setShowAuditModal(true), 1500)
                    } catch (err) {
                        console.error('Failed to assign scan:', err)
                    }
                }

                const res = await fetch(`/api/scans/${scanId}`)
                if (!res.ok) throw new Error('Failed to load scan')

                const data = await res.json()
                setScan(data)
                setRiskProfile(data.risk_profile)

                // Trigger Auto-Download if verified and data is loaded
                if (verified && data && data.risk_profile) {
                    // Slight delay to ensure UI renders first
                    setTimeout(() => {
                        const filename = (data.assets as any)?.filename || 'scan-result'
                        const is_video = (data.assets as any)?.file_type === 'video'
                        // Generate sample report automatically
                        generateForensicReport({ ...data, filename, is_video } as any, data.risk_profile, true)
                    }, 1000)
                }

            } catch (error) {
                console.error('Failed to load scan:', error)
            } finally {
                setLoading(false)
            }
        }

        loadScan()
    }, [scanId, verified])

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

            <AuditModal
                isOpen={showAuditModal}
                onClose={() => setShowAuditModal(false)}
                scanId={scan.id}
            />

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
                                // NOT PURCHASED: Gate View or Standard View
                                <div className="w-full flex flex-col gap-4">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-black uppercase text-[var(--rs-text-primary)] mb-2">
                                            Unlock Full Forensic Report
                                        </h3>
                                        <p className="text-sm text-[var(--rs-text-secondary)]">
                                            Get the complete audit trail, deep IP analysis, and mitigation steps.
                                        </p>
                                    </div>

                                    <UpgradeButton scanId={scan.id} />

                                    <div className="relative my-2 text-center">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[var(--rs-border-primary)]"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[var(--rs-bg-surface)] px-2 text-[var(--rs-text-tertiary)]">Or</span>
                                        </div>
                                    </div>

                                    <OneTimePurchaseButton scanId={scan.id} />

                                    <button
                                        onClick={() => {
                                            if (!riskProfile) return
                                            const filename = (scan.assets as any)?.filename || 'scan-result'
                                            const is_video = (scan.assets as any)?.file_type === 'video'
                                            generateForensicReport({ ...scan, filename, is_video } as any, riskProfile, true)
                                        }}
                                        className="mt-4 text-xs text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-secondary)] underline transition-colors uppercase tracking-wide text-center block w-full"
                                    >
                                        Download Redacted Sample Only
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </RSPanel>
            </main>
        </RSBackground>
    )
}
