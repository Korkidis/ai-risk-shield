'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { RSButton } from '@/components/rs/RSButton'
import { Check, X } from 'lucide-react'
import type { PlanConfig, PlanId } from '@/lib/plans'

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
                "p-6 border transition-all",
                isPopular
                    ? "border-[var(--rs-signal)] shadow-[0_0_0_2px_var(--rs-signal),var(--rs-shadow-l3)]"
                    : "border-[var(--rs-border-primary)]/50 shadow-[var(--rs-shadow-l2)]",
                isCurrentPlan && "ring-2 ring-[var(--rs-safe)]"
            )}
        >
            {/* Popular badge */}
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--rs-signal)] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Most Popular
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                    {plan.name}
                </h3>
                <p className="text-xs text-[var(--rs-text-tertiary)] mt-1">
                    {plan.tagline}
                </p>
            </div>

            {/* Price */}
            <div className="mb-6">
                {isEnterprise ? (
                    <div className="text-3xl font-black text-[var(--rs-text-primary)]">
                        Custom
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[var(--rs-text-primary)]">
                                ${Math.round(price / 100)}
                            </span>
                            <span className="text-xs text-[var(--rs-text-tertiary)]">/mo</span>
                        </div>
                        {interval === 'annual' && !isFree && (
                            <p className="text-[10px] text-[var(--rs-safe)] mt-1">
                                Billed ${(plan.annualPriceCents / 100).toFixed(0)}/year
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* CTA Button */}
            <div className="mb-6">
                {isCurrentPlan ? (
                    <RSButton variant="secondary" fullWidth disabled>
                        Current Plan
                    </RSButton>
                ) : isFree ? (
                    <RSButton variant="secondary" fullWidth disabled>
                        Free Forever
                    </RSButton>
                ) : isEnterprise ? (
                    <RSButton
                        variant="secondary"
                        fullWidth
                        onClick={() => window.location.href = 'mailto:sales@airiskshield.com?subject=Enterprise%20Inquiry'}
                    >
                        Contact Sales
                    </RSButton>
                ) : (
                    <RSButton
                        variant={isPopular ? 'primary' : 'secondary'}
                        fullWidth
                        onClick={handleSelect}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Get Started'}
                    </RSButton>
                )}
            </div>

            {/* Features */}
            <ul className="space-y-2 flex-1">
                {features.map((feature, idx) => (
                    <li
                        key={idx}
                        className={cn(
                            "flex items-center gap-2 text-xs",
                            feature.included
                                ? "text-[var(--rs-text-primary)]"
                                : "text-[var(--rs-text-tertiary)] line-through"
                        )}
                    >
                        {feature.included ? (
                            <Check className="w-3.5 h-3.5 text-[var(--rs-safe)]" />
                        ) : (
                            <X className="w-3.5 h-3.5 text-[var(--rs-text-tertiary)]" />
                        )}
                        {feature.label}
                    </li>
                ))}
            </ul>

            {/* Overage info */}
            {!isFree && !isEnterprise && (
                <div className="mt-4 pt-4 border-t border-[var(--rs-border-primary)]/30">
                    <p className="text-[9px] text-[var(--rs-text-tertiary)] uppercase tracking-wider">
                        Overage: ${(plan.scanOverageCents / 100).toFixed(2)}/scan
                    </p>
                </div>
            )}
        </div>
    )
}
