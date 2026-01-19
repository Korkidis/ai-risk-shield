"use client";

import { Video, BookOpen, FileQuestion, MessageCircle, Activity, ExternalLink, ChevronDown, Terminal } from 'lucide-react'
import Link from 'next/link'
import { RSDraftingBoard } from '@/components/rs/RSDraftingBoard'

export default function HelpPage() {
    const helpSections = [
        {
            title: "Quick Start Protocols",
            icon: <Activity className="w-5 h-5 text-rs-signal" />,
            items: [
                { title: "Initializing First Scan", href: "#" },
                { title: "Interpreting Risk Scores", href: "#" },
                { title: "Exporting Forensic Reports", href: "#" },
                { title: "API Integration Guide", href: "#" }
            ]
        },
        {
            title: "Operational Guides",
            icon: <BookOpen className="w-5 h-5 text-rs-text-secondary" />,
            items: [
                { title: "Brand Identity Configuration", href: "#" },
                { title: "Team Permissions & Access", href: "#" },
                { title: "Custom Rule Definition", href: "#" },
                { title: "C2PA Verification Workflow", href: "#" }
            ]
        },
        {
            title: "Methodology & Science",
            icon: <Terminal className="w-5 h-5 text-rs-text-secondary" />,
            items: [
                { title: "AI Analysis Architecture", href: "#" },
                { title: "Scoring Algorithms Explained", href: "#" },
                { title: "Data Privacy & Retention", href: "#" },
                { title: "Compliance Standards (ISO/NIST)", href: "#" }
            ]
        }
    ]

    const faqs = [
        { q: "How accurate is the copyright detection?", a: "The system utilizes a multi-modal analysis engine trained on 50M+ verified IP assets. It provides a probabilistic risk score with a confidence interval of ±2.4%." },
        { q: "Does the system store my uploaded images?", a: "No. Images are processed in ephemeral memory containers and discarded immediately after analysis, unless 'Evidence Archival' is explicitly enabled in settings." },
        { q: "What happens if a scan fails C2PA verification?", a: "The asset is flagged as 'Unverified'. A forensic trace log is generated, and the risk score is automatically penalized based on your configured strictness level." },
    ]

    return (
        <RSDraftingBoard className="flex h-full gap-6 p-6">
            <div className="flex-1 flex flex-col space-y-6 overflow-hidden max-w-6xl mx-auto w-full custom-scrollbar overflow-y-auto z-10 relative">
                {/* Header */}
                <div className="border-b border-black/10 pb-4">
                    <h1 className="text-[var(--rs-text-primary)] text-lg font-medium tracking-tight">TECHNICAL_MANUAL_DB</h1>
                    <p className="text-xs font-mono text-rs-text-tertiary mt-1 uppercase tracking-widest pl-1">// V.4.2.0 // BUILD: 2901-A</p>
                </div>

                {/* Top Grid - Physical Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {helpSections.map((section, i) => (
                        <div key={i} className="bg-rs-white border-2 border-rs-gray-200 rounded-[6px] p-6 shadow-[var(--rs-shadow-bevel)] hover:border-rs-black hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-all group cursor-pointer">
                            <div className="flex items-center gap-3 mb-4 border-b border-rs-border-primary pb-3">
                                <div className="p-2 bg-rs-gray-50 rounded-[4px] border border-rs-border-primary shadow-inner">
                                    {section.icon}
                                </div>
                                <h3 className="font-bold text-sm uppercase tracking-wide text-rs-text-primary">{section.title}</h3>
                            </div>
                            <ul className="space-y-2">
                                {section.items.map((item, j) => (
                                    <li key={j}>
                                        <Link href={item.href} className="text-xs font-mono text-rs-text-secondary hover:text-rs-signal flex items-center gap-2 group/link transition-colors">
                                            <span className="opacity-0 group-hover/link:opacity-100 transition-opacity text-rs-signal">→</span>
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-8 space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-widest text-rs-text-primary pl-4 border-l-4 border-rs-signal">Frequent_Interrogatories</h2>
                    <div className="grid gap-3">
                        {faqs.map((faq, k) => (
                            <details key={k} className="group bg-rs-white border border-rs-gray-200 rounded-[4px] open:shadow-[var(--rs-shadow-socket)] open:border-rs-black transition-all">
                                <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                                    <span className="text-xs font-bold uppercase tracking-wide text-rs-text-secondary group-open:text-rs-black">{faq.q}</span>
                                    <ChevronDown className="w-4 h-4 text-rs-text-tertiary transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="px-4 pb-4 pt-0">
                                    <div className="pl-4 border-l-2 border-rs-gray-200 text-xs text-rs-text-secondary leading-relaxed w-full max-w-3xl font-mono bg-rs-gray-50 p-3 rounded-r-[4px]">
                                        <span className="text-rs-signal font-bold mr-2">A:</span>
                                        {faq.a}
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Support Contact */}
                <div className="mt-8 p-6 bg-[#E6E2DB] border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4 rounded-[6px]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-rs-destruct flex items-center justify-center text-white shadow-lg animate-pulse">
                            <MessageCircle size={20} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-wider text-rs-text-primary">Live_Support_Link</h4>
                            <p className="text-[10px] font-mono text-rs-text-tertiary">ERR_CODE_REFERRAL: 0x99_ALPHA</p>
                        </div>
                    </div>
                    <button className="px-6 py-3 bg-rs-black text-white text-xs font-bold uppercase tracking-widest rounded-[2px] shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-rs-text-primary transition-colors flex items-center gap-2">
                        Open Secure Channel <ExternalLink size={12} />
                    </button>
                </div>
            </div>
        </RSDraftingBoard>
    )
}
