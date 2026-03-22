'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RSButton } from '@/components/rs/RSButton'
import { Check, X } from 'lucide-react'
import type { PlanConfig, PlanId } from '@/lib/plans'
import { PLAN_CONTENT } from '@/lib/marketing/plans-content'

interface PricingCardProps {
    plan: PlanConfig
    interval: 'monthly' | 'annual'
    isPopular?: boolean
    currentPlan?: PlanId
    onSelect: (planId: PlanId, interval: 'monthly' | 'annual') => void
    allowFreeSelection?: boolean
    freeCtaLabel?: string
}

export function PricingCard({
    plan,
    interval,
    isPopular = false,
    currentPlan,
    onSelect,
    allowFreeSelection = false,
    freeCtaLabel
}: PricingCardProps) {
    const [loading, setLoading] = useState(false)
    const content = PLAN_CONTENT[plan.id]

    const price = interval === 'monthly'
        ? plan.monthlyPriceCents
        : Math.round(plan.annualPriceCents / 12)

    const isCurrentPlan = currentPlan === plan.id
    const isEnterprise = plan.id === 'enterprise'
    const isFree = plan.id === 'free'
    const showsBaseCommitmentLabel = !isEnterprise && !isFree && Boolean(content.baseCommitment)

    const handleSelect = async () => {
        if (isCurrentPlan || (isFree && !allowFreeSelection)) return
        setLoading(true)
        try {
            await onSelect(plan.id, interval)
        } finally {
            setLoading(false)
        }
    }

    const fmt = (n: number, singular: string, plural: string) => n >= 9000 ? `Custom` : `${n} ${n === 1 ? singular : plural}`;

    const isBasicTier = ['free', 'pro', 'team'].includes(plan.id);

    const features = [
        { label: `${fmt(plan.monthlyScans, 'report', 'reports')}/mo`, included: true, tooltip: content.overageRate && content.overageRate !== '-' ? `Additional reports automatically billed at ${content.overageRate}.` : undefined },
        { label: `${fmt(plan.monthlyMitigations, 'deep mitigation report', 'deep mitigation reports')}/mo`, included: plan.monthlyMitigations > 0, tooltip: "Additional deep mitigation reports are available for $29 each." },
        ...(plan.brandProfiles > 0 ? [{ label: `${fmt(plan.brandProfiles, 'brand profile', 'brand profiles')}`, included: true }] : []),
        { label: plan.seats >= 9000 ? 'Custom' : plan.seats > 1 ? `Up to ${fmt(plan.seats, 'administrator', 'administrators')}` : `${fmt(plan.seats, 'administrator', 'administrators')}`, included: true },
        { label: 'Full Report Access', included: plan.features.fullReportAccess },
        { label: 'Bulk Upload', included: plan.features.bulkUpload },
        { label: 'Co-Branding', included: plan.features.coBranding },
        { label: 'White-Label', included: plan.features.whiteLabel },
        ...(!isBasicTier ? [{ label: 'Priority Queue', included: plan.features.priorityQueue }] : []),
        { label: 'Audit Logs', included: plan.features.auditLogs },
        { label: 'SSO', included: plan.features.sso },
    ]

    return (
        <div
            className={cn(
                "relative flex flex-col bg-[var(--rs-bg-surface)] rounded-xl",
                "p-8 border transition-all duration-300 h-full",
                isPopular
                    ? "border-[var(--rs-text-primary)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-[1.02] hover:shadow-[12px_12px_0_var(--rs-text-primary)] hover:-translate-y-1 hover:border-2"
                    : "border-[var(--rs-border-primary)]/20 shadow-sm hover:shadow-[12px_12px_0_theme(colors.black)] hover:border-[var(--rs-border-primary)]",
                isCurrentPlan && "ring-2 ring-[var(--rs-safe)]"
            )}
        >
            {/* Popular badge */}
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--rs-signal)] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 z-10 border-2 border-[var(--rs-border-primary)]">
                    Recommended
                </div>
            )}

            {/* Header */}
            <div className="mb-6 border-b border-[var(--rs-border-primary)]/30 pb-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-[var(--rs-text-primary)] uppercase tracking-tight">
                        {content.name}
                    </h3>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-bold text-[var(--rs-text-primary)] leading-tight pr-4">
                        {content.audience}
                    </p>
                    <p className="text-xs font-medium text-[var(--rs-text-secondary)]">
                        {content.tagline}
                    </p>
                </div>
            </div>

            {/* Price */}
            <div className="mb-6 flex-shrink-0">
                {isEnterprise ? (
                    <div className="text-4xl font-black text-[var(--rs-text-primary)] tracking-tighter">
                        Custom
                    </div>
                ) : (
                    <>
                        {showsBaseCommitmentLabel && (
                            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--rs-signal)]">
                                Base commitment
                            </p>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-[var(--rs-text-primary)] tracking-tighter leading-none">
                                ${Math.round(price / 100)}
                            </span>
                            <span className="text-xs font-mono text-[var(--rs-text-tertiary)] uppercase tracking-wider">/mo</span>
                        </div>
                        <div className="min-h-[50px] mt-2 flex flex-col gap-1 items-start">
                            {content.effectiveRate && (
                                <div className="flex flex-col items-start w-full">
                                    <div className="flex items-center gap-1.5 group/overage cursor-help relative mb-0.5">
                                        <p className="text-sm font-bold text-[var(--rs-text-primary)] tracking-tight">
                                            {content.effectiveRate}
                                        </p>
                                        {content.overageRate && (
                                            <>
                                                <div className="w-4 h-4 rounded-full border border-[var(--rs-border-primary)] flex items-center justify-center text-[var(--rs-text-tertiary)] group-hover/overage:border-[var(--rs-text-primary)] group-hover/overage:text-[var(--rs-text-primary)] transition-colors">
                                                    <span className="text-[10px] font-bold italic">i</span>
                                                </div>
                                                {/* Tooltip */}
                                                <div className="absolute left-0 bottom-full mb-2 w-56 p-3 bg-[var(--rs-bg-root)] border border-[var(--rs-border-primary)] shadow-xl rounded text-xs text-[var(--rs-text-secondary)] opacity-0 group-hover/overage:opacity-100 transition-opacity pointer-events-none z-50">
                                                    <span className="block font-bold mb-1 text-[var(--rs-text-primary)]">Overage Details</span>
                                                    <span className="italic block mb-2 leading-tight">Additional scans beyond volume are automatically billed at {content.overageRate}.</span>
                                                    <span className="block leading-tight border-t border-[var(--rs-border-primary)] pt-2 mt-2">Optional Mitigation Reports are available for <strong className="text-[var(--rs-text-primary)]">$29 each</strong> if you need hands-on legal remediation.</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            {interval === 'annual' && !isFree && (
                                <p className="text-[10px] text-[var(--rs-safe)] font-bold uppercase tracking-wider">
                                    Billed ${(plan.annualPriceCents / 100).toFixed(0)}/year
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* CTA Button */}
            <div className="mb-8 flex-shrink-0">
                {isCurrentPlan ? (
                    <RSButton variant="secondary" fullWidth disabled className="opacity-50">
                        Current Plan
                    </RSButton>
                ) : isFree && !allowFreeSelection ? (
                    <RSButton variant="secondary" fullWidth disabled className="opacity-50">
                        Included Active
                    </RSButton>
                ) : (
                    <RSButton
                        variant={isFree ? 'ghost' : isPopular ? 'primary' : 'secondary'}
                        fullWidth
                        onClick={handleSelect}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : isFree ? (freeCtaLabel ?? content.ctaPrimary) : content.ctaPrimary}
                    </RSButton>
                )}
            </div>

            {/* Features List */}
            <div className="flex-1 flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-primary)] mb-3 inline-block">
                    Top Features
                </span>
                <ul className="space-y-3 flex-1 mb-6">
                    {features.map((feature, idx) => (
                        <li
                            key={idx}
                            className={cn(
                                "flex items-start gap-3",
                                feature.included
                                    ? "text-[var(--rs-text-secondary)]"
                                    : "text-[var(--rs-text-tertiary)] opacity-60 hidden sm:flex"
                            )}
                        >
                            {feature.included ? (
                                <div className="mt-0.5 w-4 h-4 rounded-full bg-[var(--rs-text-primary)] flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5 text-[var(--rs-bg-root)]" />
                                </div>
                            ) : (
                                <div className="mt-0.5 w-4 h-4 flex items-center justify-center shrink-0">
                                    <X className="w-3 h-3 text-[var(--rs-text-tertiary)]" />
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 group/ftooltip relative">
                                <span className={cn("text-xs leading-tight", feature.included && "font-medium text-[var(--rs-text-primary)]")}>
                                    {feature.label}
                                </span>
                                {feature.tooltip && (
                                    <>
                                        <div className="w-3.5 h-3.5 rounded-full border border-[var(--rs-border-primary)] flex items-center justify-center transition-colors text-[var(--rs-text-tertiary)] group-hover/ftooltip:border-[var(--rs-text-primary)] cursor-help">
                                            <span className="text-[9px] font-bold italic">i</span>
                                        </div>
                                        <div className="absolute left-2 text-left bottom-full mb-2 w-48 p-2 bg-[var(--rs-bg-root)] border border-[var(--rs-border-primary)] shadow-xl rounded text-[10px] text-[var(--rs-text-secondary)] opacity-0 group-hover/ftooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                            {feature.tooltip}
                                        </div>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Overage block removed intentionally per user request to rely on transparent tooltips */}
            </div>
        </div>
    )
}
