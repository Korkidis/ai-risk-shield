'use client'


import { Check, X, ShieldAlert, TrendingUp } from 'lucide-react'
import { MitigationPurchaseButton } from '@/components/billing/MitigationPurchaseButton'
import { UpgradeButton } from '@/components/billing/UpgradeButton'
import { RSPanel } from '@/components/rs/RSPanel'
import { cn } from '@/lib/utils'
import { PLANS, type PlanId } from '@/lib/plans'

interface AuditModalProps {
    isOpen: boolean
    onClose: () => void
    scanId: string
    compositeScore?: number
    findingCount?: number
    planId?: PlanId
}

export function AuditModal({ isOpen, onClose, scanId, compositeScore, findingCount, planId }: AuditModalProps) {
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

    // Tier-based emphasis: recommend upgrade for free/pro users, recommend $29 for team/agency
    const emphasizeUpgrade = !planId || planId === 'free' || planId === 'pro'
    const upgradeTarget: PlanId = !planId || planId === 'free'
        ? 'pro'
        : planId === 'pro'
            ? 'team'
            : planId === 'team'
                ? 'agency'
                : 'enterprise'
    const upgradePlan = PLANS[upgradeTarget]
    const upgradePriceLabel = upgradeTarget === 'enterprise'
        ? 'Custom'
        : `$${Math.round(upgradePlan.monthlyPriceCents / 100)}`
    const upgradePeriodLabel = upgradeTarget === 'enterprise' ? 'Contact us' : '/ month'
    const upgradeHeading = upgradeTarget === 'enterprise' ? 'Enterprise Plan' : `Upgrade to ${upgradePlan.name}`
    const upgradeButtonLabel = upgradeTarget === 'enterprise'
        ? 'Explore Enterprise'
        : `Upgrade to ${upgradePlan.name}`
    const upgradeBenefits = upgradeTarget === 'pro'
        ? [
            `${upgradePlan.monthlyMitigations} mitigation credits per month`,
            `${upgradePlan.monthlyScans} scans per month`,
            `${upgradePlan.brandProfiles} brand profile included`,
            'Video analysis',
            `${upgradePlan.retentionDays}-day retention`,
        ]
        : upgradeTarget === 'team'
            ? [
                `${upgradePlan.monthlyMitigations} mitigation credits per month`,
                `${upgradePlan.monthlyScans} scans per month`,
                `Up to ${upgradePlan.seats} seats`,
                'Bulk upload',
                `${upgradePlan.brandProfiles} brand profiles`,
            ]
            : upgradeTarget === 'agency'
                ? [
                    `${upgradePlan.monthlyMitigations} mitigation credits per month`,
                    `${upgradePlan.monthlyScans} scans per month`,
                    `Up to ${upgradePlan.seats} seats`,
                    'White-label delivery',
                    'Priority queue',
                ]
                : [
                    'Custom mitigation capacity',
                    'Custom scan volume',
                    'SSO and enterprise controls',
                    'Dedicated support',
                    'Negotiated commercial terms',
                ]

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

                    {/* Content Grid — Two Options */}
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--rs-border-primary)]">

                        {/* Left: One-Time Mitigation Report */}
                        <div className={cn(
                            "p-8 bg-[var(--rs-bg-surface)] relative",
                            !emphasizeUpgrade && "ring-1 ring-[var(--rs-text-primary)] ring-inset"
                        )}>
                            {!emphasizeUpgrade && (
                                <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.2em] bg-[var(--rs-text-primary)] text-[var(--rs-text-inverse)] px-2 py-0.5">
                                    Recommended
                                </span>
                            )}
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-5 h-5 text-[var(--rs-text-primary)]" />
                                        <h3 className="text-lg font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                                            Mitigation Report
                                        </h3>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black text-[var(--rs-text-primary)]">$29</span>
                                        <span className="text-[var(--rs-text-tertiary)] uppercase font-mono text-xs">/ One-time</span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {[
                                            "Step-by-step remediation plan",
                                            "Bias & fairness audit",
                                            "Compliance matrix (GDPR, EU AI Act)",
                                            "RAI considerations",
                                            "Downloadable PDF report"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--rs-text-secondary)]">
                                                <Check className="w-4 h-4 text-[var(--rs-text-primary)] mt-0.5 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <MitigationPurchaseButton scanId={scanId} />
                                    <p className="text-[11px] text-[var(--rs-text-tertiary)] mt-3 leading-relaxed">
                                        One-time analysis for this scan. No subscription required.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Upgrade Plan */}
                        <div className={cn(
                            "p-8 bg-[var(--rs-bg-surface)] relative",
                            emphasizeUpgrade && "ring-1 ring-[var(--rs-text-primary)] ring-inset"
                        )}>
                            {emphasizeUpgrade && (
                                <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-[0.2em] bg-[var(--rs-text-primary)] text-[var(--rs-text-inverse)] px-2 py-0.5">
                                    Recommended
                                </span>
                            )}
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-[var(--rs-text-primary)]" />
                                        <h3 className="text-lg font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                                            {upgradeHeading}
                                        </h3>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-6">
                                        <span className="text-4xl font-black text-[var(--rs-text-primary)]">{upgradePriceLabel}</span>
                                        <span className="text-[var(--rs-text-tertiary)] uppercase font-mono text-xs">{upgradePeriodLabel}</span>
                                    </div>

                                    <ul className="space-y-3 mb-8">
                                        {upgradeBenefits.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--rs-text-secondary)]">
                                                <Check className="w-4 h-4 text-[var(--rs-text-primary)] mt-0.5 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <UpgradeButton scanId={scanId} targetPlan={upgradeTarget} label={upgradeButtonLabel} />
                                    <p className="text-[11px] text-[var(--rs-text-tertiary)] mt-3 leading-relaxed">
                                        {upgradeTarget === 'enterprise'
                                            ? 'Best fit for high-volume or governed deployment needs.'
                                            : 'Includes recurring mitigation capacity and higher monthly scan volume.'}
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
