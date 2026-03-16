import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Fingerprint, Scale, Workflow } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/layout/Header'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSPanel } from '@/components/rs/RSPanel'
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
        title: 'AI Content Governance | AI Risk Shield',
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
                name: 'AI Risk Shield',
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
                        <div className="max-w-4xl space-y-6">
                            <span className="rs-type-micro inline-flex items-center gap-3 text-[var(--rs-text-tertiary)] tracking-[0.3em] uppercase">
                                <span className="h-px w-12 bg-[var(--rs-border-primary)]" />
                                AI Content Governance
                            </span>
                            <h1 className="max-w-5xl text-4xl leading-[0.9] text-[var(--rs-text-primary)] md:text-6xl rs-header-bold-italic">
                                Practical guidance for teams reviewing, approving, and documenting
                                <span className="text-[var(--rs-signal)]"> AI-assisted content.</span>
                            </h1>
                            <p className="max-w-3xl text-base leading-7 text-[var(--rs-text-secondary)] md:text-lg">
                                Practical guidance for marketing teams, brand reviewers, procurement,
                                and in-house legal teams using AI-assisted assets. Start with the
                                question you need answered, then move into the guide built for that
                                decision.
                            </p>
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
                        <div className="mb-10 max-w-3xl space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--rs-text-tertiary)]">
                                Start with the right question
                            </p>
                            <h2 className="text-3xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                Six guides, six jobs to get done
                            </h2>
                            <p className="text-sm leading-7 text-[var(--rs-text-secondary)]">
                                Each guide is intentionally narrow so answer engines, buyers, and
                                internal teams can land on the exact control layer they are trying to
                                understand.
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {governanceGuides.map((guide) => (
                                <Link
                                    key={guide.slug}
                                    href={`/ai-content-governance/${guide.slug}`}
                                    className="group"
                                >
                                    <RSPanel className="flex h-full flex-col justify-between bg-[var(--rs-bg-secondary)] transition-colors duration-200 group-hover:border-[var(--rs-text-primary)]">
                                        <div>
                                            <div className="mb-4 flex items-start justify-between gap-4">
                                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                                    {guide.intent}
                                                </p>
                                                <ArrowUpRight className="h-4 w-4 text-[var(--rs-text-tertiary)] transition-colors group-hover:text-[var(--rs-signal)]" />
                                            </div>
                                            <h3 className="text-xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                                {guide.title}
                                            </h3>
                                            <p className="mt-4 text-sm leading-7 text-[var(--rs-text-secondary)]">
                                                {guide.description}
                                            </p>
                                        </div>

                                        <div className="mt-6 border-t border-[var(--rs-border-primary)] pt-4">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                                Audience
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-[var(--rs-text-secondary)]">
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
                        <div className="mb-10 max-w-4xl space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--rs-text-tertiary)]">
                                Litigation and standards watch
                            </p>
                            <h2 className="text-3xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                Public signals worth tracking
                            </h2>
                            <p className="text-sm leading-7 text-[var(--rs-text-secondary)]">
                                Updated {formatLongDate(riskIndexSnapshot.asOf)}. These links give
                                teams a useful public picture of case activity, disclosed settlement
                                exposure, and provenance-standard momentum without pretending the data
                                is a real-time feed.
                            </p>
                            <p className="text-sm leading-7 text-[var(--rs-text-secondary)]">
                                Current public settlement anchor: {`${formatUsdCompact(riskIndexSnapshot.knownSettlementTotalUsd)}+`}.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {riskWatchItems.map((item) => (
                                <RSPanel key={`${item.title}-${item.date}`} className="bg-[var(--rs-bg-secondary)]">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="max-w-xl">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                                {item.category} · {item.status}
                                            </p>
                                            <h3 className="mt-3 text-xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                                {item.title}
                                            </h3>
                                            <p className="mt-4 text-sm leading-7 text-[var(--rs-text-secondary)]">
                                                {item.summary}
                                            </p>
                                        </div>
                                        <div className="min-w-[150px] border border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] px-4 py-3 text-right">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                                Source
                                            </p>
                                            <a
                                                href={item.sourceUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[var(--rs-text-primary)] hover:text-[var(--rs-signal)]"
                                            >
                                                {item.sourceLabel}
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </a>
                                            <p className="mt-1 text-xs text-[var(--rs-text-secondary)]">
                                                {formatLongDate(item.date)}
                                            </p>
                                        </div>
                                    </div>
                                </RSPanel>
                            ))}
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
        <RSPanel className="bg-[var(--rs-bg-secondary)]">
            <div className="flex items-start justify-between gap-4">
                <p className="max-w-[14rem] text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                    {label}
                </p>
                <div className="text-[var(--rs-signal)]">{icon}</div>
            </div>

            <p className="mt-8 text-4xl font-bold tracking-tight text-[var(--rs-text-primary)] rs-type-mono">
                {value}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--rs-text-secondary)]">
                {detail}
            </p>
        </RSPanel>
    )
}
