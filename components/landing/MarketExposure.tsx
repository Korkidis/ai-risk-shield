'use client'

import Link from 'next/link'
import { RSPanel } from '../rs/RSPanel'
import { ArrowUpRight, Fingerprint, Scale, Workflow } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'
import { formatUsdCompact, riskIndexSnapshot } from '@/lib/marketing/ai-content-governance'

export function MarketExposure() {
    return (
        <section id="benchmarks" className="scroll-mt-24 py-24 bg-[var(--rs-bg-surface)] border-b border-[var(--rs-border-primary)] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">

                <div className="mx-auto mb-14 max-w-4xl text-center">
                    <span className="rs-type-micro inline-block text-[var(--rs-text-tertiary)] bg-[var(--rs-bg-surface)] px-4 tracking-[0.28em] uppercase">
                        AI Content Governance
                    </span>
                    <h2 className="mt-4 text-4xl md:text-6xl rs-header-bold-italic tracking-tighter text-[var(--rs-text-primary)] text-balance mx-auto">
                        THE OPERATING LAYER BETWEEN <span className="text-[var(--rs-signal)]">AI SPEED</span> AND PUBLISH-READY CONTENT.
                    </h2>
                    <p className="mt-4 mx-auto max-w-2xl text-base leading-snug text-[var(--rs-text-secondary)] text-balance">
                        Built for teams that need more than headlines. Connect your compliance policies directly to the creative workflow before a single asset ships.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <MetricCard
                        label="Known public settlements tracked"
                        value={`${formatUsdCompact(riskIndexSnapshot.knownSettlementTotalUsd)}+`}
                        detail="Disclosed settlement value. No guessed damages."
                        icon={<Scale className="h-4 w-4" />}
                    />
                    <MetricCard
                        label="AI copyright case velocity"
                        value={riskIndexSnapshot.trackedCaseCountLabel}
                        detail="Active AI copyright infringement dockets."
                        icon={<Workflow className="h-4 w-4" />}
                    />
                    <MetricCard
                        label="Provenance ecosystem adoption"
                        value={riskIndexSnapshot.standardsAdoptionLabel}
                        detail="Verified enterprise supply chain deployments."
                        icon={<Fingerprint className="h-4 w-4" />}
                    />
                </div>

                <div className="mt-10 flex justify-center">
                    <Link
                        href="/ai-content-governance"
                        onClick={() => trackEvent('governance_hub_cta_clicked', { source: 'homepage_governance_metrics' })}
                        className="inline-flex items-center gap-2 border border-[var(--rs-border-primary)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-primary)] transition-colors hover:border-[var(--rs-text-primary)]"
                    >
                        Explore the governance hub
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

function MetricCard({
    label,
    value,
    detail,
    icon,
}: {
    label: string
    value: string
    detail: string
    icon: React.ReactNode
}) {
    return (
        <RSPanel className="bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_theme(colors.black)] p-6 md:p-8 flex flex-col justify-between h-full transition-shadow duration-300 hover:shadow-[12px_12px_0_var(--rs-signal)] group">
            <div className="flex items-start justify-between gap-4">
                <p className="max-w-[14rem] text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--rs-text-tertiary)]">
                    {label}
                </p>
                <div className="text-[var(--rs-signal)]">{icon}</div>
            </div>

            <div>
                <p className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-[var(--rs-text-primary)] rs-type-mono">
                    {value}
                </p>
                <p className="mt-3 text-xs md:text-sm leading-relaxed text-[var(--rs-text-secondary)] text-balance">
                    {detail}
                </p>
            </div>
        </RSPanel>
    )
}
