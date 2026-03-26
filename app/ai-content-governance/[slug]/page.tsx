import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, ScrollText } from 'lucide-react'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/layout/Header'
import { RSBackground } from '@/components/rs/RSBackground'
import { RSButton } from '@/components/rs/RSButton'
import { RSPanel } from '@/components/rs/RSPanel'
import {
    formatLongDate,
    getGovernanceGuide,
    getRelatedGovernanceGuides,
    governanceGuides,
    governanceOperatingModel,
} from '@/lib/marketing/ai-content-governance'
import { getAbsoluteUrl } from '@/lib/site'

interface GuidePageProps {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return governanceGuides.map((guide) => ({ slug: guide.slug }))
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
    const { slug } = await params
    const guide = getGovernanceGuide(slug)

    if (!guide) {
        return {}
    }

    const path = `/ai-content-governance/${guide.slug}`

    return {
        title: guide.titleTag ?? guide.title,
        description: guide.description,
        alternates: {
            canonical: path,
        },
        openGraph: {
            title: guide.titleTag ?? `${guide.title} | AI Content Risk Score`,
            description: guide.description,
            url: path,
            type: 'article',
        },
    }
}

export default async function GovernanceGuidePage({ params }: GuidePageProps) {
    const { slug } = await params
    const guide = getGovernanceGuide(slug)

    if (!guide) {
        notFound()
    }

    const pageUrl = `/ai-content-governance/${guide.slug}`
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: getAbsoluteUrl('/'),
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'AI Content Governance',
                item: getAbsoluteUrl('/ai-content-governance'),
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: guide.title,
                item: getAbsoluteUrl(pageUrl),
            },
        ],
    }

    const pageSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guide.title,
        description: guide.description,
        mainEntityOfPage: getAbsoluteUrl(pageUrl),
        author: {
            '@type': 'Organization',
            name: 'AI Content Risk Score',
        },
        publisher: {
            '@type': 'Organization',
            name: 'AI Content Risk Score',
        },
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        keywords: guide.keywords.join(', '),
        citation: guide.sourceLinks.map((source) => source.url),
    }

    const faqSchema = guide.faq.length
        ? {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: guide.faq.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                      '@type': 'Answer',
                      text: item.answer,
                  },
              })),
          }
        : null

    const relatedGuides = getRelatedGovernanceGuides(guide.slug)

    return (
        <RSBackground
            variant="technical"
            className="flex min-h-screen flex-col overflow-x-hidden selection:bg-[var(--rs-border-primary)] selection:text-[var(--rs-text-primary)]"
        >
            <Header />

            <main className="flex-1">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(
                            [pageSchema, breadcrumbSchema, faqSchema].filter(Boolean)
                        ),
                    }}
                />

                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                            <Link
                                href="/ai-content-governance"
                                className="inline-flex items-center gap-2 hover:text-[var(--rs-text-primary)]"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                AI Content Governance
                            </Link>
                            <span className="h-1 w-1 rounded-full bg-[var(--rs-text-tertiary)]" />
                            <span>{guide.intent}</span>
                        </div>

                        <div className="mt-8 max-w-4xl space-y-6">
                            <h1 className="text-4xl leading-[0.92] text-[var(--rs-text-primary)] md:text-6xl rs-header-bold-italic uppercase">
                                {guide.title}
                            </h1>
                            <p className="max-w-3xl text-base leading-7 text-[var(--rs-text-secondary)] md:text-lg">
                                {guide.description}
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            <MetadataChip label="Audience" value={guide.audience} />
                            <MetadataChip label="Updated" value={formatLongDate(guide.updatedAt)} />
                            <MetadataChip label="Intent" value={guide.intent} />
                        </div>
                    </div>
                </section>

                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)]">
                    <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr]">
                        <RSPanel className="bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_var(--rs-border-primary)]">
                            <div className="mb-6 border-b border-[var(--rs-border-primary)] pb-6">
                                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                    Direct answer
                                </p>
                                <h2 className="mt-3 text-2xl uppercase tracking-tight text-[var(--rs-text-primary)] font-black">
                                    {guide.primaryQuestion}
                                </h2>
                            </div>
                            <p className="text-base leading-8 text-[var(--rs-text-secondary)]">
                                {guide.shortAnswer}
                            </p>
                        </RSPanel>

                        <RSPanel className="bg-[var(--rs-bg-secondary)]">
                            <div className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--rs-border-primary)] pb-6">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                        Core operating model
                                    </p>
                                    <h2 className="mt-3 text-2xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                        Controls that stack
                                    </h2>
                                </div>
                                <ScrollText className="h-5 w-5 text-[var(--rs-signal)]" />
                            </div>

                            <ul className="space-y-4">
                                {governanceOperatingModel.map((item) => (
                                    <li
                                        key={item.label}
                                        className="border border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-4"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-primary)]">
                                            {item.label}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-[var(--rs-text-secondary)]">
                                            {item.detail}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </RSPanel>
                    </div>
                </section>

                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-16">
                        <div className="mb-10 max-w-5xl space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)] hover:text-[var(--rs-signal)] transition-colors">
                                Guide sections
                            </p>
                            <h2 className="text-3xl md:text-5xl uppercase tracking-tighter text-[var(--rs-text-primary)] font-black italic">
                                One page, one decision path
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {guide.sections.map((section) => (
                                <RSPanel key={section.heading} className="bg-[var(--rs-bg-secondary)] h-full">
                                    <h3 className="text-xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                        {section.heading}
                                    </h3>
                                    <p className="mt-4 text-sm leading-7 text-[var(--rs-text-secondary)]">
                                        {section.body}
                                    </p>
                                    {section.bullets ? (
                                        <ul className="mt-6 space-y-3 border-t border-[var(--rs-border-primary)] pt-5">
                                            {section.bullets.map((bullet) => (
                                                <li
                                                    key={bullet}
                                                    className="text-sm leading-6 text-[var(--rs-text-secondary)]"
                                                >
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : null}
                                </RSPanel>
                            ))}
                        </div>
                    </div>
                </section>


                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-16">
                        <div className="mb-10 max-w-3xl space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                Common questions
                            </p>
                            <h2 className="text-3xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                FAQs for busy reviewers
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {guide.faq.map((item) => (
                                <RSPanel key={item.question} className="bg-[var(--rs-bg-secondary)] h-full">
                                    <h3 className="text-lg uppercase tracking-tight text-[var(--rs-text-primary)]">
                                        {item.question}
                                    </h3>
                                    <p className="mt-4 text-sm leading-7 text-[var(--rs-text-secondary)]">
                                        {item.answer}
                                    </p>
                                </RSPanel>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)]">
                    <div className="mx-auto max-w-6xl px-6 py-16">
                        <div className="mb-10 max-w-3xl space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                Source anchors
                            </p>
                            <h2 className="text-3xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                Public references behind this page
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {guide.sourceLinks.map((source) => (
                                <RSPanel key={source.url} className="bg-[var(--rs-bg-surface)] h-full">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                        Reference
                                    </p>
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-start gap-2 text-sm leading-7 text-[var(--rs-text-primary)] hover:text-[var(--rs-signal)]"
                                    >
                                        <span>{source.label}</span>
                                        <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0" />
                                    </a>
                                </RSPanel>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]">
                    <div className="mx-auto max-w-6xl px-6 py-16">
                        <div className="mb-10 max-w-5xl space-y-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                Recommended internal links
                            </p>
                            <h2 className="text-3xl md:text-5xl uppercase tracking-tighter text-[var(--rs-text-primary)] rs-header-bold-italic">
                                Keep moving through the control stack
                            </h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3">
                            {relatedGuides.map((relatedGuide) => (
                                <Link
                                    key={relatedGuide.slug}
                                    href={`/ai-content-governance/${relatedGuide.slug}`}
                                    className="group"
                                >
                                    <RSPanel className="bg-[var(--rs-bg-secondary)] h-full transition-colors duration-200 group-hover:border-[var(--rs-text-primary)]">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                            {relatedGuide.intent}
                                        </p>
                                        <h3 className="mt-4 text-xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                            {relatedGuide.title}
                                        </h3>
                                        <p className="mt-4 text-sm leading-7 text-[var(--rs-text-secondary)]">
                                            {relatedGuide.description}
                                        </p>
                                    </RSPanel>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-[var(--rs-bg-well)]">
                    <div className="mx-auto max-w-6xl px-6 py-16">
                        <RSPanel className="bg-[var(--rs-bg-surface)]">
                            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)]">
                                        Next step
                                    </p>
                                    <h2 className="mt-3 text-3xl uppercase tracking-tight text-[var(--rs-text-primary)]">
                                        Turn governance theory into an asset-level decision.
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--rs-text-secondary)]">
                                        Use the scanner to quantify one asset, preserve a report for
                                        legal, and route the result through the control stack this page
                                        describes.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-4 sm:flex-row lg:flex-col pt-4">
                                    <Link href="/" className="inline-block">
                                        <RSButton variant="primary" size="lg" icon={<ArrowUpRight />}>
                                            RUN A FREE SCAN
                                        </RSButton>
                                    </Link>
                                    <Link href="/ai-content-governance" className="inline-block mt-2">
                                        <RSButton variant="secondary" size="md">
                                            BACK TO GOVERNANCE HUB
                                        </RSButton>
                                    </Link>
                                </div>
                            </div>
                        </RSPanel>
                    </div>
                </section>
            </main>

            <Footer />
        </RSBackground>
    )
}

function MetadataChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-t-[3px] border-[var(--rs-border-primary)] border-x border-b bg-[var(--rs-bg-secondary)] px-4 py-4 hover:border-t-black hover:shadow-lg transition-all duration-300 group">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-text-secondary)] transition-colors">
                {label}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--rs-text-primary)] font-mono">{value}</p>
        </div>
    )
}

