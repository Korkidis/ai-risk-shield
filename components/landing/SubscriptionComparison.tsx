'use client'

import { RSButton } from "../rs/RSButton"
import { RSPanel } from "../rs/RSPanel"
import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'

export function PricingSection() {
    return (
        <section id="pricing" className="py-24 bg-[var(--rs-bg-surface)] rs-edge-top relative overflow-hidden">

            <div className="max-w-7xl mx-auto px-6 relative">

                {/* Section Header */}
                <div className="text-center mb-16 space-y-4 pt-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--rs-bg-secondary)] border border-[var(--rs-border-primary)] rounded-full mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--rs-signal)] animate-pulse" />
                        <span className="rs-type-mono text-[10px] tracking-widest text-[var(--rs-text-secondary)]">CLEARANCE_MATRIX_P100</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl rs-header-bold-italic tracking-tighter text-[var(--rs-text-primary)]">
                        CLEARANCE <span className="text-[var(--rs-signal)]">ACCESS</span>
                    </h2>
                    <p className="rs-type-body text-[var(--rs-text-secondary)] text-lg max-w-2xl mx-auto">
                        Determine the forensic depth required for your operational theater.
                    </p>
                </div>

                {/* DESKTOP: SPEC SHEET TABLE */}
                <div className="hidden lg:block">
                    <DesktopSpecSheet />
                </div>

                {/* MOBILE: CARD CAROUSEL */}
                <div className="lg:hidden">
                    <MobilePricingView />
                </div>

                {/* ENTERPRISE FOOTER */}
                <div className="mt-12 max-w-4xl mx-auto">
                    <RSPanel className="bg-[var(--rs-bg-secondary)] border-[var(--rs-border-primary)] flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6">
                        <div className="flex items-center gap-4 text-center md:text-left">
                            <div className="hidden md:flex w-10 h-10 rounded bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] items-center justify-center text-[var(--rs-text-primary)]">
                                <span className="rs-type-mono text-xs font-bold">L4</span>
                            </div>
                            <div>
                                <h3 className="rs-type-section text-sm uppercase text-[var(--rs-text-primary)] mb-1">Enterprise / Governance</h3>
                                <p className="rs-type-body text-xs text-[var(--rs-text-secondary)] max-w-md">Unlimited scans, custom SLAs, SOC2 audit support, and private instance.</p>
                            </div>
                        </div>
                        <RSButton variant="ghost" size="sm" className="border border-[var(--rs-border-primary)] text-xs tracking-widest whitespace-nowrap">CONTACT LEGAL SALES</RSButton>
                    </RSPanel>
                </div>
            </div>
        </section>
    )
}

// --- DESKTOP VIEW ---

function DesktopSpecSheet() {
    return (
        <div className="max-w-6xl mx-auto relative group">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--rs-signal)]/5 to-transparent blur-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <RSPanel
                className="overflow-hidden border border-[var(--rs-border-primary)] shadow-2xl bg-white/40 backdrop-blur-xl p-0 relative rounded-2xl"
            >
                {/* High-Tech Header */}
                <div className="grid grid-cols-4 border-b border-[var(--rs-border-primary)] bg-white/50">
                    <div className="p-8 flex flex-col justify-end">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-[var(--rs-signal)] animate-pulse" />
                            <span className="rs-type-mono text-[9px] text-[var(--rs-text-tertiary)] uppercase tracking-widest">LIVE_FEED</span>
                        </div>
                        <span className="rs-type-display text-2xl font-black tracking-tighter text-[var(--rs-text-primary)]">CLEARANCE</span>
                    </div>

                    <TierHeader title="BASIC" code="L0" price="$0" description="Single Check" />
                    <TierHeader title="ASSESSMENT" code="L1" price="$29" description="Deep Report" recommended />
                    <TierHeader title="PROFESSIONAL" code="L2" price="$49" description="Volume Access" />
                </div>

                {/* Spec Rows High Fidelity */}
                <div className="divide-y divide-[var(--rs-border-primary)]/50 text-sm">
                    <SpecRow label="Daily Capacity" basic="3 Scans / Month" assessment="Single Deep Scan" pro="Unlimited" />
                    <SpecRow label="Forensic Depth" basic="Verification Only" assessment="Full Legal Reasoning" pro="Custom Brand Rules" highlight />
                    <SpecRow label="Mitigation Strategy" basic={false} assessment={true} pro={true} />
                    <SpecRow label="Regeneration Prompts" basic={false} assessment={true} pro={true} />
                    <SpecRow label="History Retention" basic="None" assessment="30 Days" pro="Unlimited" />
                </div>

                {/* Footer Action Bar */}
                <div className="grid grid-cols-4 bg-white/30 backdrop-blur-sm border-t border-[var(--rs-border-primary)]">
                    <div className="p-4" />
                    <div className="p-4 flex justify-center"><RSButton variant="ghost" size="sm" fullWidth>INITIALIZE</RSButton></div>
                    <div className="p-4 flex justify-center relative">
                        <div className="absolute inset-0 bg-[var(--rs-signal)]/5 pointer-events-none" />
                        <RSButton variant="primary" size="sm" fullWidth className="shadow-lg shadow-[var(--rs-signal)]/20">ACCESS REPORT</RSButton>
                    </div>
                    <div className="p-4 flex justify-center"><RSButton variant="secondary" size="sm" fullWidth>SUBSCRIBE</RSButton></div>
                </div>
            </RSPanel>
        </div>
    )
}

// --- MOBILE VIEW ---

function MobilePricingView() {
    const tiers = [
        {
            title: "BASIC",
            code: "L0-PUBLIC",
            price: "$0",
            desc: "Safety Assessment",
            features: [
                { label: "CAPACITY", val: "3 / Month" },
                { label: "DEPTH", val: "Verification" },
                { label: "REPORT", val: "Sample Only" },
            ],
            btn: <RSButton variant="ghost" fullWidth>INITIALIZE</RSButton>
        },
        {
            title: "FULL REPORT",
            code: "L1-DEEP",
            price: "$29",
            sub: "/scan",
            desc: "Critical Need",
            isRecommended: true,
            features: [
                { label: "CAPACITY", val: "Single Scan" },
                { label: "DEPTH", val: "Deep Forensic" },
                { label: "OUTPUT", val: "6-Page PDF" },
                { label: "GUIDANCE", val: "Mitigation Steps" }
            ],
            btn: <RSButton variant="primary" fullWidth>ACCESS REPORT</RSButton>
        },
        {
            title: "PROFESSIONAL",
            code: "L2-SCALE",
            price: "$49",
            sub: "/mo",
            desc: "Persistent Validation",
            features: [
                { label: "CAPACITY", val: "Unlimited" },
                { label: "HISTORY", val: "Persistent" },
                { label: "RULES", val: "Custom Brand" }
            ],
            btn: <RSButton variant="secondary" fullWidth>SUBSCRIBE</RSButton>
        }
    ];

    return (
        <div className="space-y-8">
            {tiers.map((current, idx) => (
                <RSPanel
                    key={idx}
                    className={cn(
                        "transition-all duration-300",
                        current.isRecommended
                            ? "border-[var(--rs-text-primary)] bg-[var(--rs-bg-surface)] shadow-[var(--rs-shadow-l2)] scale-[1.02] my-4"
                            : "border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] opacity-90"
                    )}
                >
                    {/* Header */}
                    <div className="text-center mb-6 pb-6 border-b border-[var(--rs-border-primary)]">
                        {current.isRecommended && (
                            <div className="inline-block px-2 py-0.5 mb-3 bg-[var(--rs-signal)] text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                                Recommended
                            </div>
                        )}
                        <span className="rs-type-mono text-[10px] text-[var(--rs-text-tertiary)] mb-2 block">{current.code}</span>
                        <h3 className="rs-type-display text-3xl font-black text-[var(--rs-text-primary)] uppercase mb-2">{current.title}</h3>
                        <div className="flex justify-center items-baseline gap-1 mb-2">
                            <span className="text-4xl font-bold tracking-tighter text-[var(--rs-text-primary)]">{current.price}</span>
                            {current.sub && <span className="text-sm font-mono text-[var(--rs-text-secondary)]">{current.sub}</span>}
                        </div>
                        <p className="rs-type-body text-xs text-[var(--rs-text-secondary)] uppercase tracking-widest">{current.desc}</p>
                    </div>

                    {/* Specs */}
                    <div className="space-y-3 mb-8">
                        {current.features.map((f, i) => (
                            <div key={i} className="flex justify-between items-center py-1 border-b border-[var(--rs-border-primary)]/10 last:border-0">
                                <span className="rs-type-mono text-[10px] font-bold text-[var(--rs-text-tertiary)] uppercase tracking-wider">{f.label}</span>
                                <span className="rs-type-mono text-xs font-bold text-[var(--rs-text-primary)]">{f.val}</span>
                            </div>
                        ))}
                    </div>

                    <div>{current.btn}</div>
                </RSPanel>
            ))}
        </div>
    )
}

// --- SUB COMPONENTS ---


function TierHeader({ title, code, price, description, recommended }: { title: string, code: string, price: string, description: string, recommended?: boolean }) {
    return (
        <div className={cn(
            "p-6 flex flex-col items-center justify-between gap-4 relative transition-all duration-300",
            recommended ? "bg-[var(--rs-bg-surface)] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-10 scale-[1.02] border-x border-[var(--rs-border-primary)] -mx-[1px]" : "hover:bg-white/5",
        )}>
            {recommended && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--rs-signal)]" />
            )}
            <div className="space-y-1 text-center w-full">
                <div className={cn("rs-type-mono text-[9px] uppercase tracking-widest mb-2", recommended ? "text-[var(--rs-signal)] font-bold" : "text-[var(--rs-text-tertiary)]")}>
                    {code}
                </div>
                <div className={cn("rs-type-display text-lg font-black tracking-tighter text-[var(--rs-text-primary)]")}>
                    {title}
                </div>
                <div className={cn("text-[10px] font-medium uppercase tracking-wide mt-1 text-[var(--rs-text-secondary)]")}>
                    {description}
                </div>
            </div>

            <div className="flex items-baseline gap-0.5">
                <span className={cn("text-3xl font-bold tracking-tighter text-[var(--rs-text-primary)]")}>{price}</span>
                {price !== "$0" && <span className={cn("text-[10px] font-mono text-[var(--rs-text-secondary)]")}>/mo</span>}
            </div>
        </div>
    )
}

function SpecRow({ label, basic, assessment, pro, highlight }: { label: string, basic: any, assessment: any, pro: any, highlight?: boolean }) {
    const renderCell = (value: any, isRecommended: boolean) => {
        if (typeof value === 'boolean') {
            return value ? <Check className="w-4 h-4 text-[var(--rs-safe)] mx-auto" /> : <Minus className="w-3 h-3 text-[var(--rs-text-tertiary)] mx-auto opacity-30" />
        }
        return (
            <span className={cn(
                "rs-type-mono text-[10px] uppercase",
                isRecommended ? "text-[var(--rs-text-primary)] font-bold" : "text-[var(--rs-text-secondary)]",
                highlight && isRecommended ? "text-[var(--rs-signal)]" : ""
            )}>
                {value}
            </span>
        )
    }

    return (
        <div className="grid grid-cols-4 divide-x divide-[var(--rs-border-primary)] hover:bg-[var(--rs-bg-secondary)]/30 transition-colors group">
            {/* Label */}
            <div className="p-4 flex items-center bg-[var(--rs-bg-secondary)]/10">
                <span className="rs-type-mono text-[9px] font-bold text-[var(--rs-text-tertiary)] uppercase tracking-wider">{label}</span>
            </div>

            {/* Tiers */}
            <div className="p-4 flex items-center justify-center group-hover:bg-[var(--rs-bg-surface)] transition-colors">{renderCell(basic, false)}</div>

            {/* Recommended Column (ASSESSMENT) */}
            <div className="p-4 flex items-center justify-center bg-[var(--rs-bg-surface)] relative shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] border-x border-[var(--rs-border-primary)] -mx-[1px] z-10">
                {renderCell(assessment, true)}
            </div>

            <div className="p-4 flex items-center justify-center group-hover:bg-[var(--rs-bg-surface)] transition-colors">{renderCell(pro, false)}</div>
        </div>
    )
}
