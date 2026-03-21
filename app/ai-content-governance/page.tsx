import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Fingerprint, Scale, Workflow } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/layout/Header'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSPanel } from '@/components/rs/RSPanel'
import { RSButton } from '@/components/rs/RSButton'
import {
    formatLongDate,
    formatUsdCompact,
    governanceGuides,
    riskIndexSnapshot,
    riskWatchItems,
} from '@/lib/marketing/ai-content-governance'
import { getAbsoluteUrl } from '@/lib/site'

const hubUrl = '/ai-content-governance'
const hubDescription =
    'AI Content Governance is a structured guide hub for enterprise teams managing AI IP risk, provenance, human review workflows, and operational controls before publishing.'

export const metadata: Metadata = {
    title: 'AI Content Governance',
    description: hubDescription,
    alternates: {
        canonical: hubUrl,
    },
    openGraph: {
        title: 'AI Content Governance | AI Content Risk Score',
        description: hubDescription,
        url: hubUrl,
        type: 'website',
    },
}

export default function AIContentGovernancePage() {
    const schema = [
        {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'AI Content Governance',
            description: hubDescription,
            url: getAbsoluteUrl(hubUrl),
            dateModified: riskIndexSnapshot.asOf,
            publisher: {
                '@type': 'Organization',
                name: 'AI Content Risk Score',
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'AI Content Governance Guides',
            itemListElement: governanceGuides.map((guide, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: guide.title,
                url: getAbsoluteUrl(`/ai-content-governance/${guide.slug}`),
                description: guide.description,
            })),
        },
    ]

    return (
        <RSBackground
            variant="technical"
            className="flex min-h-screen flex-col overflow-x-hidden selection:bg-[var(--rs-border-primary)] selection:text-[var(--rs-text-primary)]"
        >
            <Header />

            <main className="flex-1">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />

                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]">
                    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-20 md:py-24">
                        <div className="max-w-4xl space-y-8">
                            <span className="rs-type-micro inline-flex items-center gap-3 text-[var(--rs-text-tertiary)] tracking-[0.3em] uppercase font-bold">
                                <span className="h-px w-12 bg-[var(--rs-signal)]" />
                                AI Content Governance
                            </span>
                            <h1 className="max-w-4xl text-5xl md:text-7xl uppercase italic font-black leading-[0.9] text-[var(--rs-text-primary)] tracking-tight text-balance">
                                ENTERPRISE GUIDANCE FOR <span className="text-[var(--rs-signal)]">AI&#8209;ASSISTED&nbsp;CONTENT.</span>
                            </h1>
                            <p className="max-w-2xl text-base leading-relaxed text-[var(--rs-text-secondary)] md:text-lg text-pretty">
                                The defensive playbook for marketing teams, brand reviewers, procurement,
                                and in-house legal groups. Protect your brand's integrity before publishing by establishing ironclad human-in-the-loop workflows.
                            </p>
                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <Link href="/register">
                                    <RSButton variant="primary" size="lg" icon={<Fingerprint className="w-4 h-4" />}>
                                        Start Free Scan
                                    </RSButton>
                                </Link>
                                <Link href="/pricing">
                                    <RSButton variant="secondary" size="lg">
                                        View Enterprise Plans
                                    </RSButton>
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            <SignalPanel
                                label="Known public settlements tracked"
                                value={`${formatUsdCompact(riskIndexSnapshot.knownSettlementTotalUsd)}+`}
                                detail="Disclosed settlement dollars only. No guessed damages."
                                icon={<Scale className="h-5 w-5" />}
                            />
                            <SignalPanel
                                label="AI copyright case velocity"
                                value={riskIndexSnapshot.trackedCaseCountLabel}
                                detail={riskIndexSnapshot.trackedCaseCountContext}
                                icon={<Workflow className="h-5 w-5" />}
                            />
                            <SignalPanel
                                label="Provenance ecosystem adoption"
                                value={riskIndexSnapshot.standardsAdoptionLabel}
                                detail={riskIndexSnapshot.standardsAdoptionContext}
                                icon={<Fingerprint className="h-5 w-5" />}
                            />
                        </div>
                    </div>
                </section>

                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)]">
                    <div className="mx-auto max-w-7xl px-6 py-16">
                        <div className="mb-14 max-w-2xl space-y-4">
                            <p className="rs-type-micro text-[var(--rs-text-signal)] font-bold">
                                Establish your baseline
                            </p>
                            <h2 className="text-3xl md:text-5xl uppercase italic font-black tracking-tighter text-[var(--rs-text-primary)] text-balance">
                                THE GOVERNANCE PLAYBOOK.
                            </h2>
                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                Scale operations without scaling liability. Track, trace, and control AI assets through every stage of the enterprise lifecycle. These targeted frameworks give your legal, marketing, and procurement teams the exact blueprints needed to safely integrate generated content.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {governanceGuides.map((guide) => (
                                <Link
                                    key={guide.slug}
                                    href={`/ai-content-governance/${guide.slug}`}
                                    className="group"
                                >
                                    <RSPanel className="flex h-full flex-col justify-between bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_theme(colors.black)] transition-all duration-300 group-hover:border-[var(--rs-text-primary)] group-hover:shadow-[12px_12px_0_var(--rs-signal)]">
                                        <div>
                                            <div className="mb-6 flex items-start justify-between gap-4">
                                                <p className="rs-type-micro text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-signal)] transition-colors">
                                                    {guide.intent}
                                                </p>
                                                <ArrowUpRight className="h-4 w-4 text-[var(--rs-text-tertiary)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--rs-signal)]" />
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-tighter text-[var(--rs-text-primary)] text-balance italic">
                                                {guide.title.replace(/ (and|or|for|with|in) /gi, ' $1\u00A0')}
                                            </h3>
                                            <p className="mt-4 text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty font-medium">
                                                {guide.description}
                                            </p>
                                        </div>

                                        <div className="mt-8 border-t-[3px] border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)] -mx-6 -mb-6 px-6 py-5">
                                            <p className="rs-type-label text-[var(--rs-text-tertiary)]">
                                                Audience
                                            </p>
                                            <p className="mt-1 text-xs leading-relaxed text-[var(--rs-text-primary)] font-mono">
                                                {guide.audience}
                                            </p>
                                        </div>
                                    </RSPanel>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[var(--rs-bg-surface)]">
                    <div className="mx-auto max-w-7xl px-6 py-16">
                        <div className="mb-14 max-w-3xl space-y-4">
                            <p className="rs-type-micro text-[var(--rs-text-tertiary)] font-bold">
                                Litigation and standards watch
                            </p>
                            <h2 className="text-3xl md:text-5xl uppercase italic font-black tracking-tighter text-[var(--rs-text-primary)] text-balance">
                                PUBLIC SIGNALS WORTH TRACKING.
                            </h2>
                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                Updated {formatLongDate(riskIndexSnapshot.asOf)}. The threat landscape isn't theoretical—it's actively compounding in federal courts. Below are the verified settlement anchors and case momentum signals driving the urgent demand for enterprise-grade asset provenance.
                            </p>
                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] mt-2">
                                Current public settlement anchor: <span className="font-bold text-[var(--rs-signal)]">{`${formatUsdCompact(riskIndexSnapshot.knownSettlementTotalUsd)}+`}</span>.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {riskWatchItems.map((item) => (
                                <RSPanel key={`${item.title}-${item.date}`} className="group hover:-translate-y-1 hover:shadow-[12px_12px_0_theme(colors.black)] transition-all duration-300 bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_var(--rs-border-primary)] overflow-hidden p-0">
                                    <div className="flex flex-col md:flex-row md:items-stretch h-full">
                                        <div className="flex-1 p-6 md:p-8">
                                            <p className="rs-type-micro text-[var(--rs-text-tertiary)]">
                                                {item.category} <span className="mx-2 text-[var(--rs-signal)]">|</span> {item.status}
                                            </p>
                                            <h3 className="mt-4 text-2xl font-black uppercase tracking-tighter text-[var(--rs-text-primary)] text-balance italic">
                                                {item.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty max-w-2xl font-medium">
                                                {item.summary}
                                            </p>
                                        </div>
                                        <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l-[3px] border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)] p-6 md:p-8 md:min-w-[300px] group-hover:bg-[var(--rs-border-primary)] transition-colors">
                                            <p className="rs-type-label text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-bg-surface)] mb-2">
                                                Source
                                            </p>
                                            <a
                                                href={item.sourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-start gap-2 text-sm font-bold text-[var(--rs-text-primary)] group-hover:text-black transition-colors"
                                            >
                                                {item.sourceLabel}
                                                <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                                            </a>
                                            <p className="mt-4 text-xs font-mono text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-bg-secondary)]">
                                                {formatLongDate(item.date)}
                                            </p>
                                        </div>
                                    </div>
                                </RSPanel>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final Closing CTA Section */}
                <section className="bg-[var(--rs-bg-base)] border-t border-[var(--rs-border-primary)] py-24">
                    <div className="mx-auto max-w-4xl px-6 text-center space-y-8">
                        <h2 className="text-4xl md:text-6xl uppercase italic font-black leading-[0.9] tracking-tight text-[var(--rs-text-primary)] text-balance">
                            READY TO SECURE YOUR <span className="text-[var(--rs-signal)]">CONTENT&nbsp;PIPELINE?</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-base leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                            Don't let unverified AI assets expose your brand to IP litigation. Run a free forensic scan today, or upgrade your entire team to establish an ironclad provenance workflow.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                            <Link href="/register">
                                <RSButton variant="primary" size="lg" icon={<Fingerprint className="w-4 h-4" />}>
                                    Run a Forensic Scan
                                </RSButton>
                            </Link>
                            <Link href="/pricing">
                                <RSButton variant="secondary" size="lg">
                                    View Enterprise Plans
                                </RSButton>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </RSBackground>
    )
}

function SignalPanel({
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
        <RSPanel className="group relative overflow-hidden bg-[var(--rs-bg-surface)] border-[var(--rs-border-primary)] transition-colors hover:border-[var(--rs-border-strong)]">
            <div className="flex flex-col h-full justify-between">
                <div>
                    <div className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-[var(--rs-radius-element)] border border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] text-[var(--rs-text-primary)] transition-colors group-hover:border-[var(--rs-signal)] group-hover:text-[var(--rs-signal)]">
                        {icon}
                    </div>
                    <p className="rs-type-display text-4xl tracking-tight text-[var(--rs-text-primary)] mb-2">
                        {value}
                    </p>
                    <p className="rs-type-label text-[var(--rs-text-tertiary)]">
                        {label}
                    </p>
                </div>
                <div className="mt-8 border-t border-[var(--rs-border-primary)] pt-4">
                    <p className="text-xs leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                        {detail}
                    </p>
                </div>
            </div>
        </RSPanel>
    )
}
