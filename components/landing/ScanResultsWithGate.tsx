'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UpgradeModal } from './UpgradeModal'
import { RiskProfile } from '@/lib/gemini-types'
import { RSRadialMeter } from '../rs/RSRadialMeter'
import { RSPanel } from '../rs/RSPanel'
import { RSSystemLog } from '../rs/RSSystemLog'
import { RSButton } from '../rs/RSButton'
import { cn } from '@/lib/utils'

export function ScanResultsWithGate({ scanId, riskProfile }: { scanId: string, riskProfile: RiskProfile }) {

    const [showUpgrade, setShowUpgrade] = useState(false)
    const router = useRouter()
    // const [mounted, setMounted] = useState(false)
    const [logs, setLogs] = useState<{ id: string, message: string, status: 'pending' | 'active' | 'done' | 'error', timestamp: string }[]>([])

    useEffect(() => {
        // Simulate log loading
        const initialLogs = [
            { id: '1', message: "ANALYZING_VISUAL_SPECTRUM", status: 'done', timestamp: '00:01' },
            { id: '2', message: "CHECKING_C2PA_PROVENANCE", status: 'done', timestamp: '00:04' },
            { id: '3', message: "CROSS_REFERENCING_IP_DB", status: 'done', timestamp: '00:12' },
            { id: '4', message: "RISK_PROBABILITY_CALCULATED", status: 'done', timestamp: '00:15' },
            // Dynamic entries based on score
            { id: '5', message: `VERDICT: ${riskProfile.verdict.toUpperCase().replace(/ /g, '_')}`, status: riskProfile.composite_score > 50 ? 'error' : 'done', timestamp: '00:16' }
        ] as any
        setLogs(initialLogs)
    }, [riskProfile])

    // Map risk profile to simple level for meter
    const riskLevel = riskProfile.composite_score >= 85 ? 'critical' :
        riskProfile.composite_score >= 60 ? 'high' :
            riskProfile.composite_score >= 40 ? 'medium' :
                riskProfile.composite_score > 0 ? 'low' : 'safe';

    return (
        <div className="space-y-12 max-w-6xl mx-auto px-4">
            {showUpgrade && <UpgradeModal scanId={scanId} onClose={() => setShowUpgrade(false)} />}

            <div className="grid lg:grid-cols-12 gap-8 items-start">

                {/* Left: Main Monitor (8 Cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <RSPanel
                        className="bg-[var(--rs-bg-surface)] border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)] relative overflow-hidden"
                    >
                        {/* Monitor Header */}
                        <div className="flex justify-between items-center border-b border-[var(--rs-border-primary)] pb-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-[var(--rs-safe)] animate-pulse shadow-[0_0_8px_var(--rs-safe)]" />
                                <h3 className="text-sm font-bold tracking-widest text-[var(--rs-text-primary)] uppercase">MONITOR_ACTIVE</h3>
                            </div>
                            <span className="rs-type-mono text-xs text-[var(--rs-text-tertiary)]">ID: {scanId.substring(0, 8).toUpperCase()}</span>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-8">
                            {/* GAUGE */}
                            <div className="relative">
                                <RSRadialMeter
                                    value={riskProfile.composite_score}
                                    level={riskLevel}
                                    size={240}
                                />
                                {/* Overlay Glare or Scanline if needed, essentially cleaner now */}
                            </div>

                            {/* VERDICT DETAILS */}
                            <div className="text-center md:text-left space-y-4 max-w-xs">
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-[var(--rs-text-tertiary)] font-bold mb-1">VERDICT</div>
                                    <div className={cn(
                                        "text-3xl font-black uppercase tracking-tighter leading-none",
                                        riskLevel === 'critical' ? 'text-[var(--rs-signal)]' :
                                            riskLevel === 'high' ? 'text-[var(--rs-risk-high)]' :
                                                'text-[var(--rs-text-primary)]'
                                    )}>
                                        {riskProfile.verdict}
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-[var(--rs-text-secondary)] leading-relaxed">
                                    {riskProfile.ip_report.teaser}
                                </p>
                            </div>
                        </div>

                        {/* RISKS GRID */}
                        <div className="grid grid-cols-3 gap-px bg-[var(--rs-border-primary)]/30 mt-8 border-t border-[var(--rs-border-primary)]">
                            <RiskMetric label="IP EXPOSURE" value={riskProfile.ip_report.score} />
                            <RiskMetric label="BRAND SAFETY" value={riskProfile.safety_report.score} />
                            <RiskMetric label="PROVENANCE" value={riskProfile.provenance_report.score} />
                        </div>

                    </RSPanel>
                </div>

                {/* Right: Forensic Log & Actions (4 Cols) */}
                <div className="lg:col-span-5 space-y-6 h-full flex flex-col">

                    {/* SYSTEM LOG */}
                    <div className="flex-grow">
                        <RSSystemLog logs={logs} maxHeight="300px" className="h-full border-[var(--rs-border-primary)]" />
                    </div>

                    {/* ACTIONS PANEL */}
                    <RSPanel className="bg-[var(--rs-bg-element)] border-[var(--rs-border-primary)]">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded">
                                    <span className="text-xl">🔒</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--rs-text-primary)] uppercase">RESTRICTED DATA</h4>
                                    <p className="text-xs text-[var(--rs-text-secondary)] mt-1">
                                        Detailed IP mapping, evidence logs, and legal mitigation strategies are encrypted.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 space-y-3">
                                <label className="block text-[10px] uppercase tracking-widest font-bold text-[var(--rs-text-tertiary)]">
                                    AUTHORIZED RECIPIENT (EMAIL)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="officer@company.com"
                                        className="flex-1 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] text-[var(--rs-text-primary)] text-sm px-3 py-2 rounded-[var(--rs-radius-small)] outline-none focus:border-[var(--rs-text-primary)] transition-colors placeholder:text-[var(--rs-text-tertiary)]"
                                        id="email-input-forensic"
                                    />
                                </div>
                                <div className="p-1 rounded-[var(--rs-radius-element)] border border-[var(--rs-border-primary)] bg-[var(--rs-bg-element)] shadow-[var(--rs-shadow-l1)]">
                                    <RSButton
                                        className="w-full justify-center tracking-widest text-xs font-bold"
                                        variant="primary"
                                        onClick={async () => {
                                            const email = (document.getElementById('email-input-forensic') as HTMLInputElement)?.value;
                                            if (!email || !email.includes('@')) {
                                                alert('Please enter a valid email');
                                                return;
                                            }

                                            try {
                                                const res = await fetch('/api/scans/capture-email', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ scanId, email })
                                                });

                                                if (!res.ok) {
                                                    const errorData = await res.json();
                                                    const errorMsg = errorData.details || errorData.error || 'Failed to send email';
                                                    throw new Error(errorMsg);
                                                }

                                                alert('✅ Authentication successful! Unlocking full report...');
                                                router.push(`/scan/${scanId}?verified=true&email_captured=true`)
                                            } catch (error) {
                                                console.error(error);
                                                alert(`❌ ${error instanceof Error ? error.message : 'Failed to send email. Please try again.'}`);
                                            }
                                        }}
                                    >
                                        UNLOCK FULL REPORT
                                    </RSButton>
                                </div>
                            </div>
                        </div>
                    </RSPanel>
                </div>
            </div>
        </div>
    )
}

function RiskMetric({ label, value }: { label: string, value: number }) {
    const getColorStyle = (v: number) => {
        if (v >= 70) return 'text-[var(--rs-signal)]'
        if (v >= 40) return 'text-[var(--rs-risk-caution)]'
        return 'text-[var(--rs-safe)]'
    }

    return (
        <div className="bg-[var(--rs-bg-surface)] p-4 flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)]">{label}</span>
            <span className={cn("text-xl font-bold font-mono", getColorStyle(value))}>{value}%</span>
        </div>
    )
}
