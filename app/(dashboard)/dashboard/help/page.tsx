"use client";

import { BookOpen, Activity, Terminal, Shield, ChevronDown, FileText, Zap } from 'lucide-react'
import { RSBreadcrumb } from '@/components/rs/RSBreadcrumb'

export default function HelpPage() {
    const quickStart = [
        {
            title: "Run Your First Scan",
            content: "Upload any AI-generated image (JPG, PNG, or WebP, up to 50MB). Our AI analysis engine scores it across three dimensions — IP risk, brand safety, and provenance integrity. Results appear in about 15 seconds."
        },
        {
            title: "Understand Your Risk Score",
            content: "The composite score (0–100) is a weighted blend of IP risk, provenance integrity, and content safety. Scores above 85 trigger a critical flag regardless of individual components. The five tiers are: Safe (0–20), Caution (21–40), Review (41–60), High (61–80), and Critical (81–100)."
        },
        {
            title: "Download a Forensic Report",
            content: "Free scans include a sample report with your score and top findings. Full forensic reports ($29 one-time) include detailed IP analysis, provenance chain, remediation guidance, and a downloadable PDF you can hand to legal."
        }
    ]

    const methodology = [
        {
            title: "How the Analysis Works",
            icon: <Zap className="w-4 h-4" />,
            content: "Each upload is analyzed across three independent dimensions: IP risk (copyright and trademark pattern detection), content safety (brand safety and content policy compliance), and provenance integrity (origin and authenticity verification). Each dimension scores independently before results are composited into a single risk score."
        },
        {
            title: "C2PA Provenance Verification",
            icon: <Shield className="w-4 h-4" />,
            content: "We verify Content Credentials using the open C2PA standard. This checks for cryptographic signatures that prove where an image came from and how it was edited. Five outcomes: Verified (valid signature chain), Caution (partial chain), Untrusted (invalid signature), Invalid (corrupted data), or Missing (no C2PA metadata found)."
        },
        {
            title: "Composite Scoring",
            icon: <Activity className="w-4 h-4" />,
            content: "The composite risk score blends all three dimensions using a proprietary weighted formula that prioritizes IP risk. A Red Flag override activates when any individual score reaches 85 or above, escalating the composite to Critical tier regardless of the weighted calculation. This ensures high-severity findings in any single area are never masked by low scores elsewhere."
        }
    ]

    const faqs = [
        {
            q: "Is my uploaded image stored?",
            a: "Images are stored temporarily in encrypted cloud storage for analysis and report generation. They are associated with your tenant account and subject to your plan's retention settings. We do not use uploaded images for AI model training."
        },
        {
            q: "What's the difference between a sample and full report?",
            a: "The sample report (free) includes your composite score, risk tier, and top-level findings. The full forensic report ($29 one-time or included with Pro plans) adds detailed IP analysis, provenance chain documentation, remediation guidance, and a PDF suitable for legal review."
        },
        {
            q: "How is the risk score calculated?",
            a: "Three independent AI analysis dimensions each produce a score from 0–100. These are blended using a proprietary weighted formula into a composite. Scores above 85 on any axis trigger an automatic Critical flag. The scoring engine is continuously validated to prevent tier drift."
        },
        {
            q: "Can I share results with my legal team?",
            a: "Yes. Each scan has a Share button that generates a time-limited, token-authenticated link. Recipients can view the risk panel, findings, and provenance data without needing an account. Links expire after 7 days."
        },
        {
            q: "What file formats are supported?",
            a: "Free tier: JPG, PNG, and WebP images up to 50MB. Paid plans: All image formats plus video (MP4, MOV, MKV) — video analysis extracts 5 representative frames and scores each independently, using the maximum score as the composite."
        },
        {
            q: "What AI model powers the analysis?",
            a: "We use a multi-dimensional AI analysis pipeline purpose-built for content risk assessment. Each dimension (IP risk, content safety, provenance integrity) is analyzed independently for consistent, reproducible scoring. Our analysis engine is continuously tuned and validated."
        }
    ]

    return (
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8">
            {/* Breadcrumb Navigation */}
            <RSBreadcrumb items={[{ label: "Help & Documentation" }]} className="mb-6" />
            {/* Header */}
            <div className="border-b border-[var(--rs-border-primary)] pb-6 mb-12">
                <h1 className="text-2xl font-black tracking-tight text-[var(--rs-text-primary)] uppercase">
                    Help & Methodology
                </h1>
                <p className="text-sm text-[var(--rs-text-secondary)] mt-2">
                    How the analysis works, what the scores mean, and answers to common questions.
                </p>
            </div>

            {/* Quick Start */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-element)]">
                        <FileText className="w-4 h-4 text-[var(--rs-text-primary)]" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-[var(--rs-text-primary)]">Quick Start</h2>
                </div>
                <div className="grid gap-4">
                    {quickStart.map((item, i) => (
                        <div key={i} className="bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-[10px] font-black text-[var(--rs-signal)] font-mono">{String(i + 1).padStart(2, '0')}</span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--rs-text-primary)]">{item.title}</h3>
                            </div>
                            <p className="text-sm text-[var(--rs-text-secondary)] leading-relaxed pl-8">
                                {item.content}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Methodology */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-element)]">
                        <Terminal className="w-4 h-4 text-[var(--rs-text-primary)]" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-[var(--rs-text-primary)]">Methodology</h2>
                </div>
                <div className="grid gap-4">
                    {methodology.map((item, i) => (
                        <div key={i} className="bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-1.5 bg-[var(--rs-bg-secondary)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-element)]">
                                    {item.icon}
                                </div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--rs-text-primary)]">{item.title}</h3>
                            </div>
                            <p className="text-sm text-[var(--rs-text-secondary)] leading-relaxed pl-10">
                                {item.content}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-element)]">
                        <BookOpen className="w-4 h-4 text-[var(--rs-text-primary)]" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-[var(--rs-text-primary)]">Frequently Asked Questions</h2>
                </div>
                <div className="grid gap-2">
                    {faqs.map((faq, k) => (
                        <details key={k} className="group bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] overflow-hidden">
                            <summary className="flex items-center justify-between p-5 cursor-pointer select-none min-h-[44px]">
                                <span className="text-xs font-bold text-[var(--rs-text-primary)] pr-4">
                                    {faq.q}
                                </span>
                                <ChevronDown className="w-4 h-4 text-[var(--rs-text-secondary)] transition-transform group-open:rotate-180 shrink-0" />
                            </summary>
                            <div className="px-5 pb-5">
                                <p className="text-sm text-[var(--rs-text-secondary)] leading-relaxed border-t border-[var(--rs-border-primary)] pt-4">
                                    {faq.a}
                                </p>
                            </div>
                        </details>
                    ))}
                </div>
            </section>

            {/* Contact */}
            <section className="bg-[var(--rs-bg-secondary)] border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] p-8 text-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--rs-text-primary)] mb-2">
                    Need Help?
                </h3>
                <p className="text-sm text-[var(--rs-text-secondary)] mb-4">
                    Reach out at <span className="font-mono font-bold text-[var(--rs-text-primary)]">support@aicontentriskscore.com</span>
                </p>
                <p className="text-[10px] text-[var(--rs-text-secondary)] uppercase tracking-widest">
                    Typical response time: under 24 hours
                </p>
            </section>
        </div>
    )
}
