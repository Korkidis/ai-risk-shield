import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Fingerprint, Scale, Workflow } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSPanel } from '@/components/rs/RSPanel'
import { RSButton } from '@/components/rs/RSButton'
import {
    formatLongDate,
    formatUsdCompact,
    governanceGuides,
} from '@/lib/marketing/ai-content-governance'
import {
    getLiveRiskIndexSnapshot,
    getLiveRiskWatchItems,
    getLivePolicySignals,
} from '@/lib/marketing/ai-content-governance.server'
import { getAbsoluteUrl } from '@/lib/site'

const hubUrl = '/ai-content-governance'
const hubDescription =
    'AI Content Governance is a structured guide hub for enterprise teams managing AI IP risk, provenance, human review workflows, and operational controls before publishing.'

type GovernanceGuideCluster = {
    id: string
    eyebrow: string
    title: string
    description: string
    slugs: (typeof governanceGuides)[number]['slug'][]
}

const governanceGuideClusters: GovernanceGuideCluster[] = [
    {
        id: 'foundations',
        eyebrow: 'Start here',
        title: 'Core governance systems',
        description:
            'The baseline operating model for policy, review thresholds, and mitigation layers.',
        slugs: [
            'assessing-ai-content-risk',
            'brand-policy-controls',
            'human-review-workflows',
            'mitigation-layers',
        ],
    },
    {
        id: 'contracts',
        eyebrow: 'Commercial risk',
        title: 'Contracts, rights, and approvals',
        description:
            'The pages most useful for procurement, legal review, indemnity analysis, and adaptation workflows.',
        slugs: [
            'indemnity-controls',
            'ai-contracts-cover-2026',
            'how-legal-teams-read-ai-contracts',
            'ai-transcreation-rights-review',
        ],
    },
    {
        id: 'advanced',
        eyebrow: 'Advanced workflows',
        title: 'Provenance, disclosure, and mixed-tool edge cases',
        description:
            'Deeper reads for edited outputs, design-tool chains, content credentials, and synthetic-media disclosure.',
        slugs: [
            'content-credentials',
            'edited-ai-outputs-risk',
            'ai-design-tool-composition-risk',
            'ai-disclosure-provenance-rules',
        ],
    },
] as const

/** Revalidate governance hub data every hour */
export const revalidate = 3600

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

export default async function AIContentGovernancePage() {
    const [riskIndexSnapshot, riskWatchItems, policySignals] = await Promise.all([
        getLiveRiskIndexSnapshot(),
        getLiveRiskWatchItems(),
        getLivePolicySignals(),
    ])

    const guideLookup = new Map(governanceGuides.map((guide) => [guide.slug, guide]))
    const clusteredGuides = governanceGuideClusters.map((cluster) => ({
        ...cluster,
        guides: cluster.slugs
            .map((slug) => guideLookup.get(slug))
            .filter((guide): guide is (typeof governanceGuides)[number] => Boolean(guide)),
    }))

    const trackedSignals = [...policySignals, ...riskWatchItems].sort((a, b) => b.date.localeCompare(a.date))
    const signalPreviewCount = Math.min(4, trackedSignals.length)
    const primarySignals = trackedSignals.slice(0, signalPreviewCount)
    const overflowSignals = trackedSignals.slice(signalPreviewCount)

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
                                and in-house legal groups. Protect your brand&apos;s integrity before publishing by establishing ironclad human-in-the-loop workflows.
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
                            <a href="#signals" className="group block h-full">
                                <SignalPanel
                                    label="Known public settlements tracked"
                                    value={`${formatUsdCompact(riskIndexSnapshot.knownSettlementTotalUsd)}+`}
                                    detail="Based on disclosed settlements alone, in an industry still getting started."
                                    icon={<Scale className="h-5 w-5" />}
                                />
                            </a>
                            <a href="#signals" className="group block h-full">
                                <SignalPanel
                                    label="AI copyright case velocity"
                                    value={riskIndexSnapshot.trackedCaseCountLabel}
                                    detail={riskIndexSnapshot.trackedCaseCountContext}
                                    icon={<Workflow className="h-5 w-5" />}
                                />
                            </a>
                            <a href="#signals" className="group block h-full">
                                <SignalPanel
                                    label="Provenance ecosystem adoption"
                                    value={riskIndexSnapshot.standardsAdoptionLabel}
                                    detail={riskIndexSnapshot.standardsAdoptionContext}
                                    icon={<Fingerprint className="h-5 w-5" />}
                                />
                            </a>
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

                        <div className="mb-10 grid gap-4 lg:grid-cols-3">
                            {clusteredGuides.map((cluster, index) => (
                                <a
                                    key={cluster.id}
                                    href={`#playbook-${cluster.id}`}
                                    className="group block h-full"
                                >
                                    <RSPanel className="flex h-full flex-col justify-between border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] shadow-[8px_8px_0_var(--rs-border-primary)] transition-all duration-300 group-hover:border-[var(--rs-signal)] group-hover:shadow-[12px_12px_0_var(--rs-signal)]">
                                        <div className="space-y-4">
                                            <p className="rs-type-micro text-[var(--rs-text-tertiary)]">
                                                0{index + 1} / {cluster.eyebrow}
                                            </p>
                                            <h3 className="text-xl font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                                                {cluster.title}
                                            </h3>
                                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                                {cluster.description}
                                            </p>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between border-t border-[var(--rs-border-primary)] pt-4">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--rs-text-secondary)]">
                                                {cluster.guides.length} guides
                                            </span>
                                            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--rs-signal)]">
                                                Jump to section
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>
                                    </RSPanel>
                                </a>
                            ))}
                        </div>

                        <div className="space-y-8">
                            {clusteredGuides.map((cluster, index) => (
                                <PlaybookSection
                                    key={cluster.id}
                                    cluster={cluster}
                                    sectionNumber={index + 1}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section id="signals" className="bg-[var(--rs-bg-surface)]">
                    <div className="mx-auto max-w-7xl px-6 py-16">
                        <div className="mb-14 max-w-3xl space-y-4">
                            <p className="rs-type-micro text-[var(--rs-text-tertiary)] font-bold">
                                Litigation, policy, and standards watch
                            </p>
                            <h2 className="text-3xl md:text-5xl uppercase italic font-black tracking-tighter text-[var(--rs-text-primary)] text-balance">
                                PUBLIC SIGNALS WORTH TRACKING.
                            </h2>
                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                Updated {formatLongDate(riskIndexSnapshot.asOf)}. The rules are being written, governments are establishing AI frameworks, and the threat landscape is not theoretical. It is actively compounding in federal courts, enterprise review workflows, and client-facing publishing decisions. The signals below combine regulatory movement, litigation momentum, and verified settlement anchors, including a current disclosed public settlement anchor of <span className="font-bold text-[var(--rs-signal)]">{`${formatUsdCompact(riskIndexSnapshot.knownSettlementTotalUsd)}+`}</span>.
                            </p>
                        </div>

                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-y border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] px-4 py-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--rs-text-primary)]">
                                    Latest signals
                                </p>
                                <p className="text-xs leading-relaxed text-[var(--rs-text-secondary)]">
                                    The newest four items stay visible by default. Older signals drop into a small archive below.
                                </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--rs-text-primary)]">
                                {primarySignals.length} live / {overflowSignals.length} archived
                            </span>
                        </div>

                        <div className="grid gap-6 xl:grid-cols-2">
                            {primarySignals.map((item, index) => (
                                <TrackedSignalCard key={getSignalKey(item, index)} item={item} />
                            ))}
                        </div>

                        {overflowSignals.length > 0 ? (
                            <details className="mt-8 border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] shadow-[8px_8px_0_var(--rs-border-primary)]">
                                <summary className="cursor-pointer list-none px-6 py-5 [&::-webkit-details-marker]:hidden">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div className="space-y-2">
                                            <p className="rs-type-micro text-[var(--rs-text-tertiary)] font-bold">
                                                Signal archive
                                            </p>
                                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                                Open the older standards, litigation, and market signals without crowding the current watchlist.
                                            </p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 border border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--rs-text-primary)]">
                                            Show archive ({overflowSignals.length})
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                </summary>
                                <div className="border-t border-[var(--rs-border-primary)] px-6 py-6">
                                    <div className="grid gap-6 xl:grid-cols-2">
                                        {overflowSignals.map((item, index) => (
                                            <TrackedSignalCard key={getSignalKey(item, signalPreviewCount + index)} item={item} />
                                        ))}
                                    </div>
                                </div>
                            </details>
                        ) : null}
                    </div>
                </section>

                {/* Product Methodology Section */}
                <section id="methodology" className="border-t border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)]">
                    <div className="mx-auto max-w-7xl px-6 py-16">
                        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
                            <div className="space-y-6">
                                <p className="rs-type-micro text-[var(--rs-text-signal)] font-bold">
                                    Our scoring methodology
                                </p>
                                <h2 className="text-3xl md:text-5xl uppercase italic font-black tracking-tighter text-[var(--rs-text-primary)] text-balance">
                                    HOW THE ENGINE WORKS.
                                </h2>
                                <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                    The scoring engine is deterministic, policy-aware, and grounded in established IP and governance frameworks. It does not rely on generative AI to produce assessments. It applies a fixed set of rules to every asset you submit. Same asset in, same score out.
                                </p>
                                <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                    On Pro and higher tiers, you upload your own brand guidelines, restricted vocabulary, and policy documents. The methodology adapts to your standards and applies them consistently across every asset your team submits. Your rules shape the score.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <RSPanel className="bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_var(--rs-border-primary)]">
                                    <h3 className="text-lg font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                                        Deterministic
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-[var(--rs-text-secondary)]">
                                        No generative guesswork. The engine applies a fixed rule set grounded in established governance frameworks. Submit the same asset twice, get the same score.
                                    </p>
                                </RSPanel>
                                <RSPanel className="bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_var(--rs-border-primary)]">
                                    <h3 className="text-lg font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                                        Policy-Aware
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-[var(--rs-text-secondary)]">
                                        Upload your brand guidelines, restricted vocabulary, and policy documents. The engine absorbs your standards and applies them to every scan.
                                    </p>
                                </RSPanel>
                                <RSPanel className="bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_var(--rs-border-primary)]">
                                    <h3 className="text-lg font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                                        Transparent
                                    </h3>
                                    <p className="mt-3 text-sm leading-relaxed text-[var(--rs-text-secondary)]">
                                        Every report itemizes the specific findings that contributed to the score. Your team can trace every flag back to the rule that triggered it.
                                    </p>
                                </RSPanel>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final Closing CTA Section */}
                <section className="bg-[var(--rs-bg-base)] border-t border-[var(--rs-border-primary)] py-24">
                    <div className="mx-auto max-w-4xl px-6 text-center space-y-8">
                        <h2 className="text-4xl md:text-6xl uppercase italic font-black leading-[0.9] tracking-tight text-[var(--rs-text-primary)] text-balance">
                            MAKE GOVERNANCE <span className="text-[var(--rs-signal)]">OPERATIONAL.</span>
                        </h2>
                        <p className="max-w-2xl mx-auto text-base leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                            Give legal, brand, and marketing one shared decision layer before anything ships. Scan the asset, preserve the evidence, and turn policy from a static document into a repeatable publishing workflow.
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
                        <div className="border-t border-[var(--rs-border-primary)] pt-8">
                            <p className="mx-auto max-w-3xl text-[10px] leading-loose uppercase tracking-widest text-[var(--rs-text-secondary)]">
                                Disclaimer: AI Content Risk Score provides technical risk assessment data. We do not provide legal advice. Final publishing decisions should be made with qualified legal and compliance review.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </RSBackground>
    )
}

function GuideGrid({
    guides,
}: {
    guides: (typeof governanceGuides)[number][]
}) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {guides.map((guide) => (
                <Link
                    key={guide.slug}
                    href={`/ai-content-governance/${guide.slug}`}
                    className="group block h-full"
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
                            <div className="flex flex-wrap gap-2">
                                {guide.audience.split(',').map((tag) => (
                                    <span
                                        key={`${guide.slug}-${tag.trim()}`}
                                        className="inline-flex items-center border border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--rs-text-secondary)]"
                                    >
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </RSPanel>
                </Link>
            ))}
        </div>
    )
}

function PlaybookSection({
    cluster,
    sectionNumber,
}: {
    cluster: GovernanceGuideCluster & { guides: (typeof governanceGuides)[number][] }
    sectionNumber: number
}) {
    return (
        <section
            id={`playbook-${cluster.id}`}
            className="border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] shadow-[8px_8px_0_var(--rs-border-primary)]"
        >
            <div className="grid gap-8 px-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 lg:py-8">
                <div className="space-y-4">
                    <p className="rs-type-micro text-[var(--rs-text-tertiary)]">
                        0{sectionNumber} / {cluster.eyebrow}
                    </p>
                    <h3 className="text-2xl md:text-3xl uppercase italic font-black tracking-tight text-[var(--rs-text-primary)] text-balance">
                        {cluster.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                        {cluster.description}
                    </p>
                    <div className="inline-flex items-center border border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--rs-text-primary)]">
                        {cluster.guides.length} guides
                    </div>
                </div>
                <GuideGrid guides={cluster.guides} />
            </div>
        </section>
    )
}

function TrackedSignalCard({
    item,
}: {
    item: {
        title: string
        date: string
        category: string
        status: string
        summary: string
        sourceLabel: string
        sourceUrl: string
    }
}) {
    return (
        <a
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="group block h-full"
        >
            <RSPanel className="h-full overflow-hidden border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-0 shadow-[8px_8px_0_var(--rs-border-primary)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[12px_12px_0_theme(colors.black)]">
                <div className="flex h-full flex-col md:flex-row md:items-stretch">
                    <div className="flex-1 p-6 md:p-8">
                        <p className="rs-type-micro text-[var(--rs-text-tertiary)]">
                            {item.category} <span className="mx-2 text-[var(--rs-signal)]">|</span> {item.status}
                        </p>
                        <h3 className="mt-4 text-2xl font-black uppercase tracking-tighter text-[var(--rs-text-primary)] text-balance italic">
                            {item.title}
                        </h3>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty font-medium">
                            {item.summary}
                        </p>
                    </div>
                    <div className="flex flex-col justify-center border-t border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)] p-6 transition-colors group-hover:bg-[var(--rs-bg-well)] md:min-w-[300px] md:border-t-0 md:border-l-[3px] md:p-8">
                        <p className="rs-type-label mb-2 text-[var(--rs-text-tertiary)]">
                            Source
                        </p>
                        <p className="inline-flex items-start gap-2 text-sm font-bold text-[var(--rs-text-primary)] transition-colors group-hover:text-[var(--rs-signal)]">
                            {item.sourceLabel}
                            <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                        </p>
                        <p className="mt-4 text-xs font-mono text-[var(--rs-text-secondary)]">
                            {formatLongDate(item.date)}
                        </p>
                    </div>
                </div>
            </RSPanel>
        </a>
    )
}

function getSignalKey(
    item: {
        title: string
        date: string
        category: string
        status: string
        summary: string
        sourceLabel: string
        sourceUrl: string
    },
    index: number
) {
    return [
        item.title,
        item.date,
        item.category,
        item.status,
        item.sourceLabel,
        item.sourceUrl || item.summary.slice(0, 48),
        index,
    ].join('::')
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
