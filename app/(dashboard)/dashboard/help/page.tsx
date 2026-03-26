"use client";

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    ChevronDown,
    Fingerprint,
    Scale,
    Shield,
    ShieldCheck,
    Workflow,
    Zap,
    type LucideIcon,
} from 'lucide-react'
import { RSBreadcrumb } from '@/components/rs/RSBreadcrumb'
import { RSCallout } from '@/components/rs/RSCallout'
import { RSPanel } from '@/components/rs/RSPanel'
import { RSButton } from '@/components/rs/RSButton'
import { governanceGuides } from '@/lib/marketing/ai-content-governance'

const quickActions = [
    {
        label: 'Run a scan',
        description: 'Upload a new asset and get a score, findings, and provenance readout.',
        href: '/dashboard',
        icon: ShieldCheck,
    },
    {
        label: 'Open scans & reports',
        description: 'Review completed scans, share results, and reopen report details.',
        href: '/dashboard/scans-reports',
        icon: Activity,
    },
    {
        label: 'Open governance hub',
        description: 'Go deeper on policy, approvals, review thresholds, and operating controls.',
        href: '/ai-content-governance',
        icon: Scale,
    },
] as const

const workflowSteps = [
    {
        title: 'Scan the asset',
        detail: 'Upload an image in the dashboard. The scanner evaluates IP risk, brand safety, and provenance separately before assigning the composite score.',
        icon: Zap,
    },
    {
        title: 'Read the result',
        detail: 'Use the score, findings, and provenance state together. The report is there to support review, not replace it.',
        icon: Activity,
    },
    {
        title: 'Share or escalate',
        detail: 'Share results with reviewers, or route higher-risk assets into legal, brand, or compliance review when needed.',
        icon: Workflow,
    },
] as const

const scoreBands = [
    { tier: 'Safe', range: '0-25', accent: 'var(--rs-safe)', note: 'Low observed risk. Normal review can usually continue.' },
    { tier: 'Caution', range: '26-50', accent: 'var(--rs-risk-caution)', note: 'Some concerns or weak signals worth checking before publish.' },
    { tier: 'Review', range: '51-75', accent: 'var(--rs-risk-review)', note: 'Material ambiguity. A human reviewer should decide whether the asset moves forward.' },
    { tier: 'High', range: '76-90', accent: 'var(--rs-risk-high)', note: 'Serious exposure signals. Route to legal, brand, or compliance review.' },
    { tier: 'Critical', range: '91-100', accent: 'var(--rs-risk-critical)', note: 'Severe risk or compounding evidence. Treat as a stop signal until reviewed.' },
] as const

const keyFacts = [
    {
        label: 'Score model',
        value: '40 / 40 / 20',
        detail: 'IP, brand safety, and provenance are weighted separately before the final composite is assigned.',
        icon: Activity,
    },
    {
        label: 'Report access',
        value: 'Scan report first',
        detail: 'For logged-in users, the scan report is the baseline product. The paid layer is the mitigation report.',
        icon: ShieldCheck,
    },
    {
        label: 'Sharing',
        value: '7-day links',
        detail: 'Shared scan links are token-authenticated and expire after 7 days.',
        icon: ArrowUpRight,
    },
    {
        label: 'Provenance',
        value: '5 C2PA states',
        detail: 'Valid, Caution, Missing, Invalid, and Error are preserved as separate evidence states.',
        icon: Shield,
    },
] as const

const faqs = [
    {
        q: 'Is my uploaded image stored?',
        a: 'Images are stored temporarily in encrypted cloud storage for analysis and report generation. They are associated with your tenant account and subject to your plan retention settings. Uploaded images are not used for AI model training.',
    },
    {
        q: 'What is the difference between a scan report and a mitigation report?',
        a: 'The scan report contains the score, findings, provenance details, and report output for the asset you analyzed. The mitigation report is the paid layer. It turns those findings into remediation steps, approval guidance, and residual-risk framing.',
    },
    {
        q: 'How is the risk score calculated?',
        a: 'The canonical model combines IP, brand safety, and provenance using a 40/40/20 weighting. The final tier comes from the canonical threshold bands: Safe 0-25, Caution 26-50, Review 51-75, High 76-90, and Critical 91-100.',
    },
    {
        q: 'Can I share results with my legal team?',
        a: 'Yes. Each scan has a Share button that generates a time-limited link. Recipients can review the risk panel, findings, and provenance details without needing an account. Links expire after 7 days.',
    },
    {
        q: 'What file formats are supported?',
        a: 'The dashboard supports common image uploads up to 100MB. Free plans are image-only. Paid plans also support video uploads with plan-specific limits, and the current video pipeline evaluates a limited set of extracted frames rather than every frame in the file.',
    },
    {
        q: 'What model powers the analysis?',
        a: 'The live analysis layer uses Gemini 2.5 Flash, together with C2PA verification for provenance and canonical in-app scoring logic for the final composite score and tier.',
    },
] as const

export default function HelpPage() {
    const router = useRouter()

    const governanceBridge = governanceGuides.filter((guide) =>
        ['assessing-ai-content-risk', 'content-credentials', 'human-review-workflows'].includes(guide.slug)
    )

    const governanceIcons: Record<string, LucideIcon> = {
        'assessing-ai-content-risk': Scale,
        'content-credentials': Fingerprint,
        'human-review-workflows': Workflow,
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-10">
            <RSBreadcrumb items={[{ label: 'Help & Documentation' }]} className="mb-6" />

            <section className="mb-12 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
                <div className="border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-8 shadow-[8px_8px_0_var(--rs-border-primary)] md:p-10">
                    <div className="mb-4 inline-flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--rs-text-tertiary)]">
                        <span className="h-px w-10 bg-[var(--rs-signal)]" />
                        Dashboard help
                    </div>

                    <h1 className="max-w-3xl text-4xl font-black uppercase italic leading-[0.95] tracking-tight text-[var(--rs-text-primary)] md:text-6xl">
                        Help & <span className="text-[var(--rs-signal)]">Methodology</span>
                    </h1>

                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--rs-text-secondary)] md:text-lg text-pretty">
                        Find the scanner workflow, score bands, report access, sharing details, and links to deeper governance guidance.
                    </p>

                    <div className="mt-6">
                        <RSCallout variant="info" title="For logged-in users">
                            Your main workflow lives in the dashboard and in Scans & Reports. This page is the
                            reference layer for scores, reports, sharing, and escalation.
                        </RSCallout>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <RSButton
                            variant="primary"
                            icon={<ShieldCheck className="h-4 w-4" />}
                            onClick={() => router.push('/dashboard')}
                        >
                            Run A Scan
                        </RSButton>
                        <RSButton
                            variant="secondary"
                            icon={<ArrowRight className="h-4 w-4" />}
                            onClick={() => router.push('/dashboard/scans-reports')}
                        >
                            Open Scans & Reports
                        </RSButton>
                    </div>
                </div>

                <RSPanel
                    title="Quick Links"
                    metadata={[{ label: 'Audience', value: 'Signed-in workspace users' }]}
                    className="border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] shadow-[8px_8px_0_var(--rs-border-primary)]"
                >
                    <div className="grid gap-3">
                        {quickActions.map((item) => {
                            const ItemIcon = item.icon

                            return (
                                <Link key={item.label} href={item.href} className="group block">
                                    <div className="border border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-4 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_var(--rs-signal)]">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-2">
                                                <p className="text-sm font-black uppercase tracking-[0.12em] text-[var(--rs-text-primary)]">
                                                    {item.label}
                                                </p>
                                                <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <ItemIcon className="mt-1 h-4 w-4 shrink-0 text-[var(--rs-signal)]" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </RSPanel>
            </section>

            <section className="mb-12">
                <SectionLead
                    title="Using The Product"
                    description="Run a scan, review the result, then share or escalate if needed."
                />

                <div className="grid gap-6 lg:grid-cols-3">
                    {workflowSteps.map((step) => {
                        const StepIcon = step.icon

                        return (
                            <div
                                key={step.title}
                                className="border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-6 shadow-[6px_6px_0_var(--rs-border-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[10px_10px_0_var(--rs-signal)]"
                            >
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] text-[var(--rs-signal)]">
                                        <StepIcon className="h-4 w-4" />
                                    </div>
                                </div>

                                <h2 className="text-xl font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                                    {step.title}
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                    {step.detail}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </section>

            <section className="mb-12 border-y border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] py-12">
                <SectionLead
                    title="Scores, Reports, And Sharing"
                    description="Reference for score bands, report access, and sharing."
                    className="px-0"
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                    <div className="border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-6 shadow-[8px_8px_0_var(--rs-border-primary)]">
                        <div className="mb-5 border-b border-[var(--rs-border-primary)] pb-4">
                            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--rs-text-tertiary)]">
                                Canonical tier bands
                            </p>
                            <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-[var(--rs-text-primary)]">
                                How to read the score
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {scoreBands.map((band) => (
                                <div
                                    key={band.tier}
                                    className="grid gap-3 border border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] p-4 md:grid-cols-[110px_90px_minmax(0,1fr)]"
                                    style={{ boxShadow: `inset 4px 0 0 ${band.accent}` }}
                                >
                                    <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--rs-text-primary)]">
                                        {band.tier}
                                    </p>
                                    <p className="text-sm font-mono uppercase tracking-[0.18em] text-[var(--rs-text-secondary)]">
                                        {band.range}
                                    </p>
                                    <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                        {band.note}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {keyFacts.map((fact) => {
                            const FactIcon = fact.icon

                            return (
                                <div
                                    key={fact.label}
                                    className="border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-5 shadow-[6px_6px_0_var(--rs-border-primary)]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] text-[var(--rs-signal)]">
                                            <FactIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--rs-text-tertiary)]">
                                                {fact.label}
                                            </p>
                                            <p className="mt-2 text-lg font-black uppercase tracking-tight text-[var(--rs-text-primary)]">
                                                {fact.value}
                                            </p>
                                            <p className="mt-2 text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                                {fact.detail}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <SectionLead
                    title="Governance Resources"
                    description="Open these guides when you need policy, review-threshold, or approval guidance."
                />

                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <RSPanel
                        title="When To Go Deeper"
                        metadata={[{ label: 'Best for', value: 'Policy, legal, brand, procurement' }]}
                        className="border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] shadow-[8px_8px_0_var(--rs-border-primary)]"
                    >
                        <div className="space-y-4">
                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                Help explains how to use the product. Governance explains how your organization
                                should decide what can ship, who reviews it, and what evidence is required.
                            </p>
                            <RSButton
                                variant="secondary"
                                icon={<ArrowRight className="h-4 w-4" />}
                                onClick={() => router.push('/ai-content-governance')}
                            >
                                Open Governance Hub
                            </RSButton>
                        </div>
                    </RSPanel>

                    <div className="grid gap-6 md:grid-cols-3">
                        {governanceBridge.map((guide) => {
                            const GuideIcon = governanceIcons[guide.slug] || Scale

                            return (
                                <Link key={guide.slug} href={`/ai-content-governance/${guide.slug}`} className="group block h-full">
                                    <article className="flex h-full flex-col justify-between border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-6 shadow-[6px_6px_0_var(--rs-border-primary)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[10px_10px_0_var(--rs-signal)]">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] text-[var(--rs-signal)]">
                                                    <GuideIcon className="h-4 w-4" />
                                                </div>
                                                <ArrowUpRight className="h-4 w-4 text-[var(--rs-text-tertiary)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--rs-signal)]" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[var(--rs-text-tertiary)]">
                                                    {guide.intent}
                                                </p>
                                                <h2 className="text-lg font-black uppercase tracking-tight text-[var(--rs-text-primary)] text-balance">
                                                    {guide.title}
                                                </h2>
                                                <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                                    {guide.shortAnswer}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section>
                <SectionLead
                    title="Common Questions"
                    description="Practical answers for reports, storage, sharing, and supported formats."
                />

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid gap-3">
                        {faqs.map((faq) => (
                            <details
                                key={faq.q}
                                className="group overflow-hidden border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] shadow-[4px_4px_0_var(--rs-border-primary)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--rs-signal)]"
                            >
                                <summary className="flex min-h-[56px] cursor-pointer items-center justify-between gap-4 px-5 py-4 select-none">
                                    <span className="text-sm font-bold uppercase tracking-[0.08em] text-[var(--rs-text-primary)]">
                                        {faq.q}
                                    </span>
                                    <ChevronDown className="h-4 w-4 shrink-0 text-[var(--rs-text-secondary)] transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="border-t border-[var(--rs-border-primary)] px-5 py-4">
                                    <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                        {faq.a}
                                    </p>
                                </div>
                            </details>
                        ))}
                    </div>

                    <RSPanel
                        title="Need Help?"
                        metadata={[
                            { label: 'Support', value: 'support@aicontentriskscore.com' },
                            { label: 'Response Time', value: 'Under 24 hours' },
                        ]}
                        className="h-fit border-2 border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] shadow-[8px_8px_0_var(--rs-border-primary)]"
                    >
                        <div className="space-y-5">
                            <p className="text-sm leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                                If you are trying to analyze a new asset, go back to the dashboard. If you need
                                to review an existing result, open Scans & Reports.
                            </p>
                            <div className="flex flex-col gap-3">
                                <RSButton
                                    variant="primary"
                                    icon={<ArrowRight className="h-4 w-4" />}
                                    onClick={() => router.push('/dashboard')}
                                >
                                    Run A Scan
                                </RSButton>
                                <RSButton
                                    variant="secondary"
                                    icon={<ArrowRight className="h-4 w-4" />}
                                    onClick={() => router.push('/dashboard/scans-reports')}
                                >
                                    Open Scans & Reports
                                </RSButton>
                            </div>
                        </div>
                    </RSPanel>
                </div>
            </section>
        </div>
    )
}

function SectionLead({
    title,
    description,
    className = '',
}: {
    title: string
    description: string
    className?: string
}) {
    return (
        <div className={`mb-8 space-y-2 ${className}`.trim()}>
            <h2 className="text-3xl font-black uppercase italic tracking-tight text-[var(--rs-text-primary)] md:text-4xl">
                {title}
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--rs-text-secondary)] md:text-base text-pretty">
                {description}
            </p>
        </div>
    )
}
