'use client'

import { useState } from 'react'
import { BillingToggle } from '@/components/pricing/BillingToggle'
import { PricingCard } from '@/components/pricing/PricingCard'
import { PLANS, type PlanId } from '@/lib/plans'
import { RSPanel } from '../rs/RSPanel'

const BASIC_PLANS: PlanId[] = ['free', 'pro', 'team']

export function PricingSection() {
    const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')

    const handleSelectPlan = (planId: PlanId, billingInterval: 'monthly' | 'annual') => {
        if (planId === 'free') {
            window.location.href = '/dashboard'
            return
        }

        window.location.href = `/pricing?plan=${planId}&interval=${billingInterval}&persona=default`
    }

    return (
        <section id="pricing" className="scroll-mt-24 overflow-hidden bg-[var(--rs-bg-surface)] py-24 rs-edge-top relative">
            <div className="relative mx-auto max-w-7xl px-6">
                <div className="space-y-4 pb-12 pt-12 text-center">
                    <h2 className="mt-8 text-4xl rs-header-bold-italic uppercase tracking-tighter text-[var(--rs-text-primary)] md:text-5xl">
                        Clearance <span className="text-[var(--rs-signal)]">Access</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-base text-[var(--rs-text-secondary)] rs-type-body">
                        Select the intelligence depth required for your mitigation theater.
                    </p>
                    <div className="flex justify-center pt-6">
                        <BillingToggle interval={interval} onChange={setInterval} />
                    </div>
                </div>

                <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8">
                    {BASIC_PLANS.map((planId) => (
                        <div
                            key={planId}
                            className={planId === 'pro' ? 'relative z-10' : 'relative z-0'}
                        >
                            <PricingCard
                                plan={PLANS[planId]}
                                interval={interval}
                                isPopular={planId === 'pro'}
                                onSelect={handleSelectPlan}
                                allowFreeSelection
                                freeCtaLabel="Get Started"
                            />
                        </div>
                    ))}
                </div>

                <div className="relative z-10 mt-16 grid max-w-5xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:px-0">
                    <RSPanel
                        className="group cursor-pointer border border-[var(--rs-border-primary)]/40 bg-[var(--rs-bg-surface)] p-8 shadow-sm transition-all duration-300 hover:border-[var(--rs-border-primary)] hover:shadow-[8px_8px_0_var(--rs-signal)]"
                        onClick={() => window.location.href = `/pricing?persona=agency&interval=${interval}`}
                    >
                        <div className="flex h-full flex-col justify-between">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded border border-[var(--rs-border-primary)]/40 bg-[var(--rs-bg-surface)] text-[var(--rs-text-primary)] transition-colors group-hover:border-[var(--rs-signal)]">
                                        <span className="rs-type-mono text-[10px] font-bold text-[var(--rs-signal)]">L3</span>
                                    </div>
                                    <h3 className="rs-type-section text-lg uppercase text-[var(--rs-text-primary)]">Agencies</h3>
                                </div>
                                <p className="mb-6 text-sm text-[var(--rs-text-secondary)] rs-type-body">
                                    White-label client reports, multi-brand management, and priority processing.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--rs-signal)]">
                                Explore Agency Plan <span className="transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </div>
                    </RSPanel>

                    <RSPanel
                        className="group cursor-pointer border border-[var(--rs-border-primary)]/40 bg-[var(--rs-bg-surface)] p-8 shadow-sm transition-all duration-300 hover:border-[var(--rs-border-primary)] hover:shadow-[8px_8px_0_var(--rs-text-primary)]"
                        onClick={() => window.location.href = `/pricing?persona=enterprise&interval=${interval}`}
                    >
                        <div className="flex h-full flex-col justify-between">
                            <div>
                                <div className="mb-4 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded border border-[var(--rs-border-primary)]/40 bg-[var(--rs-bg-surface)] text-[var(--rs-text-primary)] transition-colors group-hover:border-[var(--rs-text-primary)]">
                                        <span className="rs-type-mono text-[10px] font-bold">L4</span>
                                    </div>
                                    <h3 className="rs-type-section text-lg uppercase text-[var(--rs-text-primary)]">Enterprise</h3>
                                </div>
                                <p className="mb-6 text-sm text-[var(--rs-text-secondary)] rs-type-body">
                                    Unlimited scans, SSO/SAML governance, custom SLAs, and dedicated success engineering.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--rs-text-primary)]">
                                Contact Sales <span className="transition-transform group-hover:translate-x-1">→</span>
                            </div>
                        </div>
                    </RSPanel>
                </div>
            </div>

            <div className="relative mt-24 w-full bg-[#111] py-20 text-white">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--rs-signal)]/10 to-transparent opacity-50" />
                <div className="relative z-10 mx-auto max-w-7xl px-6">
                    <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
                        <div className="max-w-2xl flex-1 space-y-6 text-center lg:text-left">
                            <h3 className="text-3xl font-black uppercase tracking-tighter text-white lg:text-4xl">On-Demand Mitigation</h3>
                            <p className="leading-relaxed text-[var(--rs-text-tertiary)]">
                                Not ready for a subscription? Single Forensic Mitigation Reports are available for <span className="font-bold text-white">$29/ea</span> on demand. Ideal for acute crisis response.
                            </p>
                            <div className="border-t border-white/10 pt-6">
                                <p className="rs-type-mono text-xs uppercase tracking-widest leading-relaxed text-white/50">
                                    <span className="font-bold text-white">System Context:</span> The average cost of a manual forensic legal assessment is $3,500. By subscribing, our Pro tier computes the identical intelligence at <span className="font-bold text-[var(--rs-signal)]">$0.98 per asset</span>.
                                </p>
                            </div>
                        </div>
                        <div className="w-full shrink-0 lg:w-auto">
                            <button
                                className="w-full bg-[var(--rs-signal)] px-10 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl transition-colors hover:bg-[#e64000] lg:w-auto"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                Purchase Single Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
