'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RSButton } from '@/components/rs/RSButton'
import { Check, X } from 'lucide-react'
import type { PlanConfig, PlanId } from '@/lib/plans'
import { PLAN_CONTENT } from '@/lib/marketing/plans-content'
import { trackEvent } from '@/lib/analytics'

interface PricingCardProps {
    plan: PlanConfig
    interval: 'monthly' | 'annual'
    isPopular?: boolean
    currentPlan?: PlanId
    onSelect: (planId: PlanId, interval: 'monthly' | 'annual') => void
}

export function PricingCard({
    plan,
    interval,
    isPopular = false,
    currentPlan,
    onSelect
}: PricingCardProps) {
    const [loading, setLoading] = useState(false)
    const content = PLAN_CONTENT[plan.id]

    const price = interval === 'monthly'
        ? plan.monthlyPriceCents
        : Math.round(plan.annualPriceCents / 12)

    const isCurrentPlan = currentPlan === plan.id
    const isEnterprise = plan.id === 'enterprise'
    const isFree = plan.id === 'free'

    const handleSelect = async () => {
        if (isCurrentPlan || isFree) return
        setLoading(true)
        await onSelect(plan.id, interval)
        setLoading(false)
    }

    const features = [
        { label: `${plan.monthlyScans} scans/mo`, included: true },
        { label: `${plan.monthlyReports} reports/mo`, included: plan.monthlyReports > 0 },
        { label: `${plan.seats} seat${plan.seats > 1 ? 's' : ''}`, included: true },
        { label: 'Full Report Access', included: plan.features.fullReportAccess },
        { label: 'Bulk Upload', included: plan.features.bulkUpload },
        { label: 'Co-Branding', included: plan.features.coBranding },
        { label: 'White-Label', included: plan.features.whiteLabel },
        { label: 'Priority Queue', included: plan.features.priorityQueue },
        { label: 'Audit Logs', included: plan.features.auditLogs },
        { label: 'SSO', included: plan.features.sso },
    ]

    return (
        <div
            className={cn(
                "relative flex flex-col bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)]",
                "p-6 border transition-all h-full",
                isPopular
                    ? "border-[var(--rs-signal)] shadow-[0_0_0_2px_var(--rs-signal),var(--rs-shadow-l3)] scale-[1.02]"
                    : "border-[var(--rs-border-primary)]/50 shadow-[var(--rs-shadow-l2)] hover:border-[var(--rs-text-tertiary)]",
                isCurrentPlan && "ring-2 ring-[var(--rs-safe)]"
            )}
        >
            {/* Popular badge */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--rs-signal)] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-full z-10 shadow-sm">
                    Recommended
                </div>
            )}

            {/* Header */}
            <div className="mb-6 border-b border-[var(--rs-border-primary)]/30 pb-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-[var(--rs-text-primary)] uppercase tracking-tight">
                        {content.name}
                    </h3>
                    <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] bg-[var(--rs-bg-element)] px-2 py-0.5 rounded-[2px] uppercase tracking-widest hidden sm:inline-block">
                        {content.audience}
                    </span>
                </div>
                <p className="text-xs font-medium text-[var(--rs-text-secondary)]">
                    {content.tagline}
                </p>
            </div>

            {/* Price */}
            <div className="mb-6 flex-shrink-0">
                {isEnterprise ? (
                    <div className="text-4xl font-black text-[var(--rs-text-primary)] tracking-tighter">
                        Custom
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-[var(--rs-text-primary)] tracking-tighter">
                                ${Math.round(price / 100)}
                            </span>
                            <span className="text-xs font-mono text-[var(--rs-text-tertiary)] uppercase tracking-wider">/mo</span>
                        </div>
                        <div className="min-h-[20px] mt-1">
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
                ) : isFree ? (
                    <RSButton variant="secondary" fullWidth disabled className="opacity-50">
                        Included Active
                    </RSButton>
                ) : isEnterprise ? (
                    <div className="flex flex-col gap-2 w-full">
                        <RSButton
                            variant="primary"
                            fullWidth
                            onClick={() => {
                                trackEvent('contact_sales_clicked', { source: 'pricing_card_primary', planId: plan.id });
                                window.location.href = 'mailto:sales@airiskshield.com?subject=Enterprise%20Inquiry';
                            }}
                        >
                            {content.ctaPrimary}
                        </RSButton>
                        {content.ctaSecondary && (
                             <RSButton
                                variant="ghost"
                                fullWidth
                                className="text-[10px] uppercase tracking-widest border border-[var(--rs-border-primary)]"
                                onClick={() => {
                                    trackEvent('contact_sales_clicked', { source: 'pricing_card_secondary', planId: plan.id });
                                    window.location.href = 'mailto:sales@airiskshield.com?subject=Enterprise%20Demo';
                                }}
                            >
                                {content.ctaSecondary}
                            </RSButton>
                        )}
                    </div>
                ) : (
                    <RSButton
                        variant={isPopular ? 'primary' : 'secondary'}
                        fullWidth
                        onClick={handleSelect}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : content.ctaPrimary}
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
                            <span className={cn("text-xs leading-tight", feature.included && "font-medium text-[var(--rs-text-primary)]")}>
                                {feature.label}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Overage info */}
                {!isFree && !isEnterprise && (
                    <div className="mt-auto pt-4 border-t border-[var(--rs-border-primary)]/30">
                        <p className="text-[9px] text-[var(--rs-text-tertiary)] uppercase tracking-wider font-mono">
                            Overage: ${(plan.scanOverageCents / 100).toFixed(2)}/scan
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
