'use client'


import { Check, X, ShieldAlert } from 'lucide-react'
import { MitigationPurchaseButton } from '@/components/billing/MitigationPurchaseButton'
import { UpgradeButton } from '@/components/billing/UpgradeButton'
import { RSPanel } from '@/components/rs/RSPanel'

interface AuditModalProps {
    isOpen: boolean
    onClose: () => void
    scanId: string
    compositeScore?: number
    findingCount?: number
}

export function AuditModal({ isOpen, onClose, scanId, compositeScore, findingCount }: AuditModalProps) {
    if (!isOpen) return null

    // Personalized urgency copy based on scan risk
    const urgencyLabel = compositeScore && compositeScore >= 70
        ? 'Critical Exposure Detected'
        : compositeScore && compositeScore >= 40
            ? 'Elevated Risk Detected'
            : 'Analysis Complete'

    const urgencyColor = compositeScore && compositeScore >= 70
        ? 'text-[var(--rs-signal)]'
        : compositeScore && compositeScore >= 40
            ? 'text-[var(--rs-risk-caution)]'
            : 'text-[var(--rs-safe)]'

    const urgencyDotColor = compositeScore && compositeScore >= 70
        ? 'bg-[var(--rs-signal)]'
        : compositeScore && compositeScore >= 40
            ? 'bg-[var(--rs-risk-caution)]'
            : 'bg-[var(--rs-safe)]'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[var(--rs-bg-root)]/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Chassis */}
            <div className="relative w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300">
                <RSPanel className="bg-[var(--rs-bg-surface)] border-[var(--rs-border-strong)] shadow-[var(--rs-shadow-l3)] overflow-hidden">

                    {/* Header */}
                    <div className="flex items-start justify-between p-8 border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]">
                        <div>
                            <div className="inline-flex items-center gap-2 mb-2">
                                <span className={`w-2 h-2 rounded-full ${urgencyDotColor} animate-pulse`} />
                                <span className={`text-[10px] uppercase tracking-[0.2em] ${urgencyColor} font-mono`}>
                                    {urgencyLabel}
                                </span>
                            </div>
                            <h2 className="text-3xl font-black italic text-[var(--rs-text-primary)] uppercase tracking-tight">
                                Get Remediation Guidance
                            </h2>
                            <p className="text-[var(--rs-text-secondary)] mt-1 max-w-lg">
                                {compositeScore && findingCount
                                    ? `Your scan found ${findingCount} risk${findingCount !== 1 ? 's' : ''} with a composite score of ${compositeScore}/100. Get a detailed mitigation plan with step-by-step remediation actions.`
                                    : 'Your scan is complete. Get a detailed mitigation report with bias audit, compliance checks, and actionable remediation steps.'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-[var(--rs-bg-element)] rounded-lg transition-colors group"
                        >
                            <X className="w-6 h-6 text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-text-primary)]" />
                        </button>
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--rs-border-primary)]">

                        {/* Option 1: One-Time Mitigation Report */}
                        <div className="p-8 bg-[var(--rs-bg-surface)]">
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-5 h-5 text-[var(--rs-text-primary)]" />
                                        <h3 className="text-xl font-bold text-[var(--rs-text-primary)] uppercase">
                                            Mitigation Report
                                        </h3>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black text-[var(--rs-text-primary)]">$29</span>
                                        <span className="text-[var(--rs-text-tertiary)] uppercase font-mono text-xs">/ One-time</span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {[
                                            "Step-by-Step Remediation Plan",
                                            "Bias & Fairness Audit",
                                            "Compliance Matrix (GDPR, EU AI Act)",
                                            "RAI Considerations & Legal Guidance",
                                            "Downloadable PDF Report"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-[var(--rs-text-secondary)]">
                                                <Check className="w-4 h-4 text-[var(--rs-text-primary)] mt-0.5 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <MitigationPurchaseButton scanId={scanId} />
                                <p className="text-[10px] text-[var(--rs-text-tertiary)] mt-3 leading-relaxed text-center">
                                    Deep analysis of this specific scan. Includes bias audit, compliance roadmap, and remediation priorities. No subscription required.
                                </p>
                            </div>
                        </div>

                        {/* Option 2: Pro Membership */}
                        <div className="p-8 bg-[var(--rs-bg-element)] relative overflow-hidden">
                            {/* "Best Value" Badge */}
                            <div className="absolute top-0 right-0 bg-[var(--rs-signal)] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                                Recommended
                            </div>

                            <div className="flex flex-col h-full justify-between relative z-10">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--rs-text-primary)] mb-2 uppercase">
                                        Pro Membership
                                    </h3>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black text-[var(--rs-text-primary)]">$49</span>
                                        <span className="text-[var(--rs-text-tertiary)] uppercase font-mono text-xs">/ Month</span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {[
                                            "2 Mitigation Reports / Month Included",
                                            "50 Scans / Month",
                                            "Brand Profile Support",
                                            "30-Day History Retention",
                                            "Video Analysis Support"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-[var(--rs-text-secondary)]">
                                                <div className="rounded-full bg-[var(--rs-text-primary)] p-0.5 mt-0.5">
                                                    <Check className="w-3 h-3 text-[var(--rs-bg-root)] shrink-0" />
                                                </div>
                                                <span className="font-medium text-[var(--rs-text-primary)]">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <UpgradeButton scanId={scanId} />
                                    <p className="text-center text-[10px] text-[var(--rs-text-tertiary)] leading-relaxed">
                                        Monthly subscription. Cancel anytime. Mitigation credits refresh monthly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </RSPanel>
            </div>
        </div>
    )
}
