"use client";

import { BookOpen, MessageCircle, Activity, ExternalLink, ChevronDown, Terminal } from 'lucide-react'
import Link from 'next/link'

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
        <>
            {/* Rigid Schematic Header - Locked to [120, 120] */}
            <div className="absolute top-[120px] left-[120px] w-[840px] z-20">
                <div className="border-b border-[var(--rs-border-primary)] pb-6 relative bg-[var(--rs-bg-surface)]">
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-rs-signal" />
                    <h1 className="text-[var(--rs-text-primary)] text-xl font-black tracking-tighter uppercase rs-type-section">TECHNICAL_MANUAL_DB</h1>
                    <p className="text-[9px] font-mono text-rs-text-tertiary mt-2 uppercase tracking-[0.3em] pl-6 rs-type-micro">
                        // ARCHIVAL_REF: 0x99_DOC // BUILD: 02.25.01-A // ISO_SECURE
                    </p>
                </div>

                {/* Top Grid - Archival Cards Locked to grid */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-1">
                    {helpSections.map((section, i) => (
                        <div key={i} className="group relative bg-rs-white border border-[var(--rs-border-primary)] p-8 transition-all duration-300 hover:bg-[var(--rs-gray-50)] cursor-pointer overflow-hidden min-h-[240px]">
                            {/* Module Anchor Datums */}
                            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--rs-border-primary)] opacity-40" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--rs-border-primary)] opacity-40" />

                            <div className="flex items-center gap-4 mb-6 border-b border-[var(--rs-border-primary)] border-dashed pb-4 relative z-10">
                                <div className="p-2 bg-rs-black text-rs-white rounded-[2px] shadow-[var(--rs-shadow-socket)]">
                                    {section.icon}
                                </div>
                                <h3 className="font-black text-[11px] uppercase tracking-tighter text-rs-text-primary group-hover:text-rs-signal transition-colors">{section.title}</h3>
                            </div>

                            <ul className="space-y-4 relative z-10">
                                {section.items.map((item, j) => (
                                    <li key={j}>
                                        <Link href={item.href} className="text-[10px] font-mono font-bold text-rs-text-secondary hover:text-rs-signal flex items-center gap-3 group/link transition-colors">
                                            <span className="w-1.5 h-1.5 border border-rs-text-tertiary group-hover/link:bg-rs-signal group-hover/link:rotate-45 transition-all" />
                                            {item.title.toUpperCase()}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-20 space-y-8">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-rs-text-primary pl-4 border-l-4 border-rs-signal rs-type-label flex items-center gap-4">
                        Frequent_Interrogatories <span className="h-[1px] flex-1 bg-[var(--rs-border-primary)] opacity-30" />
                    </h2>
                    <div className="grid gap-1">
                        {faqs.map((faq, k) => (
                            <details key={k} className="group bg-rs-white border border-[var(--rs-border-primary)] open:bg-[var(--rs-gray-50)] transition-all overflow-hidden">
                                <summary className="flex items-center justify-between p-6 cursor-pointer select-none border-b border-transparent group-open:border-[var(--rs-border-primary)] group-open:border-dashed">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-rs-text-secondary group-open:text-rs-black flex items-center gap-4">
                                        <span className="w-2 h-2 bg-[var(--rs-gray-200)] group-open:bg-rs-signal transition-colors" />
                                        {faq.q}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-rs-text-tertiary transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="p-8">
                                    <div className="relative pl-8 py-6 text-[12px] text-rs-text-secondary leading-relaxed w-full font-mono bg-[var(--rs-bg-surface)] rounded-[2px] border-l-4 border-rs-signal">
                                        <span className="absolute left-3 top-6 text-rs-signal font-black">A:</span>
                                        {faq.a.toUpperCase()}
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>

                {/* Support Contact */}
                <div className="mt-20 mb-40 p-10 bg-rs-black text-rs-white border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-[var(--rs-shadow-socket)]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rs-signal opacity-[0.05] blur-[100px]" />

                    <div className="flex items-center gap-8 relative z-10">
                        <div className="w-16 h-16 rounded-full bg-rs-signal p-0.5 shadow-[0_0_30px_rgba(255,102,0,0.3)]">
                            <div className="w-full h-full rounded-full bg-rs-black flex items-center justify-center">
                                <MessageCircle size={28} className="text-rs-signal animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-sm uppercase tracking-[0.2em]">Establish_Secure_Uplink</h4>
                            <p className="text-[10px] font-mono text-rs-text-tertiary mt-2 uppercase tracking-widest flex items-center gap-3">
                                <span className="w-2 h-2 bg-rs-safe rounded-full animate-pulse shadow-[0_0_8px_var(--rs-safe)]" />
                                Support_Channel_Active // Ref: 0x99_ALPHA
                            </p>
                        </div>
                    </div>
                    <button className="px-10 py-5 bg-rs-signal text-rs-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-rs-white hover:text-rs-black transition-all flex items-center gap-4 shadow-[0_8px_20px_rgba(255,102,0,0.2)]">
                        Open Secure Channel <ExternalLink size={16} />
                    </button>

                    {/* Corner ID stamp */}
                    <div className="absolute bottom-1 right-2 px-1 text-[6px] font-mono text-white/20 uppercase pointer-events-none italic">
                        PROTOCOL_HANDSHAKE_v2.0
                    </div>
                </div>
            </div>
        </>
    )
}
