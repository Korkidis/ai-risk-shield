'use client'

import { RSButton } from "../rs/RSButton"
import { RSPanel } from "../rs/RSPanel"
import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'

export function PricingSection() {
    return (
        <section id="pricing" className="scroll-mt-24 py-24 bg-[var(--rs-bg-surface)] rs-edge-top relative overflow-hidden">

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

                {/* SCALE OPERATIONS FOOTER IS NOW DEPRECATED AND MOVED TO SPEC SHEET */}

                {/* THE VALUE ANCHOR */}
                <div className="mt-16 max-w-3xl mx-auto text-center">
                    <div className="p-1.5 inline-block bg-gradient-to-br from-[var(--rs-signal)]/20 to-transparent rounded-2xl mb-6">
                        <div className="bg-[var(--rs-bg-surface)] border border-[var(--rs-signal)]/30 rounded-xl px-6 py-4 flex flex-col md:flex-row items-center gap-4 text-left">
                           <div className="w-10 h-10 shrink-0 bg-[var(--rs-signal)]/10 rounded-full flex items-center justify-center border border-[var(--rs-signal)]/20">
                               <Check className="w-5 h-5 text-[var(--rs-signal)]" />
                           </div>
                           <div>
                               <p className="rs-type-body text-sm text-[var(--rs-text-secondary)] mb-1">Average cost of a single forensic legal brand assessment:</p>
                               <div className="flex items-baseline gap-3 relative">
                                    <span className="rs-type-display font-black text-3xl text-[var(--rs-text-primary)] absolute line-through opacity-30 italic">$3,500</span>
                                    <span className="rs-type-display font-black text-3xl text-[var(--rs-signal)] ml-[120px]">$0.98</span>
                                    <span className="rs-type-mono text-[10px] uppercase font-bold text-[var(--rs-text-tertiary)] tracking-widest">(Cost of AI Risk Shield per asset)</span>
                               </div>
                           </div>
                        </div>
                    </div>
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
                className="overflow-hidden border border-[var(--rs-border-primary)] shadow-2xl bg-[var(--rs-bg-well)]/80 backdrop-blur-xl p-0 relative rounded-2xl"
            >
                {/* High-Tech Header */}
                <div className="grid grid-cols-6 border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-element)]/80">
                    <div className="p-4 flex flex-col justify-end">
                        <div className="flex items-center gap-1 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--rs-signal)] animate-pulse" />
                            <span className="rs-type-mono text-[8px] text-[var(--rs-text-tertiary)] uppercase tracking-widest">LIVE_FEED</span>
                        </div>
                        <span className="rs-type-display text-lg font-black tracking-tighter text-[var(--rs-text-primary)]">CLEARANCE</span>
                    </div>

                    <TierHeader title="FREE" code="L0" baseCommitment="$0" effectiveRate="Verification Only" overageRate="-" />
                    <TierHeader title="PRO" code="L1" baseCommitment="$49" effectiveRate="$0.98 / scan" overageRate="$2.50 / addt'l" recommended />
                    <TierHeader title="TEAM" code="L2" baseCommitment="$199" effectiveRate="$0.66 / scan" overageRate="$1.00 / addt'l" />
                    <TierHeader title="AGENCY" code="L3" baseCommitment="$499" effectiveRate="$0.49 / scan" overageRate="$0.60 / addt'l" />
                    <TierHeader title="ENTERPRISE" code="L4" baseCommitment="Custom" effectiveRate="Volume Scale" overageRate="Custom Terms" />
                </div>

                {/* Spec Rows High Fidelity */}
                <div className="divide-y divide-[var(--rs-border-primary)]/50 text-sm">
                    <SpecRow label="Monthly scan reports" free="3" pro="50" team="300" agency="1,000" enterprise="Custom" />
                    <SpecRow label="Included mitigation reports" free="0" pro="5" team="30" agency="100" enterprise="Custom" />
                    <SpecRow label="Brand policy profiles" free="0" pro="1" team="5" agency="20" enterprise="Custom" />
                    <SpecRow label="Workspace seats" free="1" pro="1" team="5" agency="15" enterprise="Custom" />
                    <SpecRow label="Video analysis" free="No" pro="Up to 2 min" team="Up to 5 min" agency="Up to 10 min" enterprise="Custom" />
                    <SpecRow label="History retention" free="7 days" pro="30 days" team="90 days" agency="365 days" enterprise="Custom" />
                    <SpecRow label="Bulk upload" free={false} pro={false} team={true} agency={true} enterprise={true} />
                    <RowWithBrands />
                    <SpecRow label="InfoSec Audit logs" free={false} pro={false} team={false} agency={true} enterprise={true} />
                    <SpecRow label="SSO / SAML" free={false} pro={false} team={false} agency={false} enterprise={true} />
                    <SpecRow label="Support" free="Community" pro="Agent" team="Agent" agency="Agent" enterprise="Dedicated" />
                </div>

                {/* Footer Action Bar */}
                <div className="grid grid-cols-6 bg-[var(--rs-bg-element)]/60 backdrop-blur-sm border-t border-[var(--rs-border-primary)]">
                    <div className="p-3" />
                    <div className="p-3 flex justify-center"><RSButton variant="ghost" size="sm" fullWidth className="text-[10px]" onClick={() => window.location.href='/dashboard'}>START FREE</RSButton></div>
                    <div className="p-3 flex justify-center relative">
                        <div className="absolute inset-0 bg-[var(--rs-signal)]/5 pointer-events-none" />
                        <RSButton variant="primary" size="sm" fullWidth className="text-[10px] shadow-lg shadow-[var(--rs-signal)]/20" onClick={() => window.location.href='/pricing?plan=pro'}>SUBSCRIBE</RSButton>
                    </div>
                    <div className="p-3 flex justify-center"><RSButton variant="secondary" size="sm" fullWidth className="text-[10px]" onClick={() => window.location.href='/pricing?plan=team'}>SUBSCRIBE</RSButton></div>
                    <div className="p-3 flex justify-center"><RSButton variant="ghost" size="sm" fullWidth className="text-[10px]" onClick={() => window.location.href='/pricing?plan=agency'}>SUBSCRIBE</RSButton></div>
                    <div className="p-3 flex justify-center"><RSButton variant="ghost" size="sm" fullWidth className="text-[10px]" onClick={() => window.location.href='/pricing?persona=enterprise'}>CONTACT</RSButton></div>
                </div>
            </RSPanel>
        </div>
    )
}

// --- MOBILE VIEW ---

function MobilePricingView() {
    const tiers = [
        {
            title: "FREE",
            code: "L0",
            price: "$0",
            desc: "Verification Only",
            features: [
                { label: "CAPACITY", val: "3 / Month" },
                { label: "DEPTH", val: "Verification" },
                { label: "OVERAGE", val: "Blocked" },
            ],
            btn: <RSButton variant="ghost" fullWidth onClick={() => window.location.href='/dashboard'}>GET STARTED</RSButton>
        },
        {
            title: "PRO",
            code: "L1",
            price: "$49",
            sub: "Base Commitment",
            desc: "Individual creators & small teams",
            isRecommended: true,
            features: [
                { label: "INCLUDED", val: "50 Scans" },
                { label: "EFFECTIVE", val: "$0.98 / scan" },
                { label: "MITIGATIONS", val: "2 Included" },
                { label: "BRANDS", val: "1 Profile" },
            ],
            btn: <RSButton variant="primary" fullWidth onClick={() => window.location.href='/pricing?plan=pro'}>SUBSCRIBE PRO</RSButton>
        },
        {
            title: "TEAM",
            code: "L2",
            price: "$199",
            sub: "Base Commitment",
            desc: "Dedicated marketing arms",
            features: [
                { label: "INCLUDED", val: "300 Scans" },
                { label: "EFFECTIVE", val: "$0.66 / scan" },
                { label: "MITIGATIONS", val: "30 Included" },
                { label: "BRANDS", val: "5 Profiles" }
            ],
            btn: <RSButton variant="secondary" fullWidth onClick={() => window.location.href='/pricing?plan=team'}>SUBSCRIBE TEAM</RSButton>
        },
        {
            title: "AGENCY",
            code: "L3",
            price: "$499",
            sub: "Base Commitment",
            desc: "Multi-brand programmatic clearance",
            features: [
                { label: "INCLUDED", val: "1,000 Scans" },
                { label: "EFFECTIVE", val: "$0.49 / scan" },
                { label: "MITIGATIONS", val: "100 Included" },
                { label: "BRANDS", val: "20 Profiles" }
            ],
            btn: <RSButton variant="ghost" fullWidth onClick={() => window.location.href='/pricing?plan=agency'}>EXPLORE AGENCY</RSButton>
        },
        {
            title: "ENTERPRISE",
            code: "L4",
            price: "Custom",
            sub: "Commitment",
            desc: "Large enterprise operations",
            features: [
                { label: "INCLUDED", val: "Custom Scans" },
                { label: "MITIGATIONS", val: "Custom Volume" },
                { label: "BRANDS", val: "Custom Profiles" },
                { label: "SECURITY", val: "SSO / SAML" }
            ],
            btn: <RSButton variant="ghost" fullWidth onClick={() => window.location.href='/pricing?persona=enterprise'}>CONTACT SALES</RSButton>
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


function TierHeader({ title, code, baseCommitment, effectiveRate, overageRate, recommended }: { title: string, code: string, baseCommitment: string, effectiveRate: string, overageRate: string, recommended?: boolean }) {
    return (
        <div className={cn(
            "p-3 flex flex-col items-center justify-between gap-2 relative transition-all duration-300",
            recommended ? "bg-[var(--rs-bg-surface)] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-10 scale-[1.02] border-x border-[var(--rs-border-primary)] -mx-[1px]" : "hover:bg-[var(--rs-bg-element)]/40",
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
            </div>

            <div className="flex flex-col items-center gap-0.5 mt-1 w-full text-center">
                <span className={cn("font-bold tracking-tighter text-[var(--rs-text-primary)]", baseCommitment.includes('Custom') ? "text-sm pb-1" : "text-xl pb-1")}>{baseCommitment}</span>
                
                <div className="flex items-center gap-1.5 group/tooltip cursor-help relative mt-1">
                    <span className={cn("text-xs font-bold", recommended ? "text-[var(--rs-text-primary)]" : "text-[var(--rs-text-secondary)]")}>{effectiveRate}</span>
                    {overageRate !== '-' && overageRate !== 'Custom terms' && (
                        <>
                            <div className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors", recommended ? "border-[var(--rs-signal)] text-[var(--rs-signal)]" : "border-[var(--rs-border-primary)] text-[var(--rs-text-tertiary)] group-hover/tooltip:border-[var(--rs-text-primary)]")}>
                                <span className="text-[9px] font-bold italic">i</span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-[var(--rs-bg-root)] border border-[var(--rs-border-primary)] shadow-xl rounded text-[10px] text-left text-[var(--rs-text-secondary)] opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                <span className="block font-bold mb-1 text-[var(--rs-text-primary)]">Overage Usage</span>
                                <span className="italic block mb-1">Additional scans are {overageRate}.</span>
                                Mitigation Reports available for $29/ea.
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

type SpecValue = string | boolean

function SpecRow({
    label,
    free,
    pro,
    team,
    agency,
    enterprise,
    highlight,
}: {
    label: string
    free: SpecValue
    pro: SpecValue
    team: SpecValue
    agency: SpecValue
    enterprise: SpecValue
    highlight?: boolean
}) {
    const renderCell = (value: SpecValue, isRecommended: boolean) => {
        if (typeof value === 'boolean') {
            return value ? <Check className="w-4 h-4 text-[var(--rs-safe)] mx-auto" /> : <Minus className="w-3 h-3 text-[var(--rs-text-tertiary)] mx-auto opacity-30" />
        }
        return (
            <span className={cn(
                "rs-type-mono text-[9px] uppercase tracking-wide",
                isRecommended ? "text-[var(--rs-text-primary)] font-bold" : "text-[var(--rs-text-secondary)]",
                highlight && isRecommended ? "text-[var(--rs-signal)]" : ""
            )}>
                {value}
            </span>
        )
    }

    return (
        <div className="grid grid-cols-6 divide-x divide-[var(--rs-border-primary)] hover:bg-[var(--rs-bg-secondary)]/30 transition-colors group">
            {/* Label */}
            <div className="p-3 flex items-center bg-[var(--rs-bg-secondary)]/10">
                <span className="rs-type-mono text-[9px] font-bold text-[var(--rs-text-tertiary)] uppercase tracking-wider">{label}</span>
            </div>

            {/* Tiers */}
            <div className="p-3 flex items-center justify-center group-hover:bg-[var(--rs-bg-surface)] transition-colors text-center">{renderCell(free, false)}</div>
            <div className="p-3 flex items-center justify-center bg-[var(--rs-bg-surface)] relative shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] border-x border-[var(--rs-border-primary)] -mx-[1px] z-10 text-center">
                {renderCell(pro, true)}
            </div>
            <div className="p-3 flex items-center justify-center group-hover:bg-[var(--rs-bg-surface)] transition-colors text-center">{renderCell(team, false)}</div>
            <div className="p-3 flex items-center justify-center group-hover:bg-[var(--rs-bg-surface)] transition-colors text-center">{renderCell(agency, false)}</div>
            <div className="p-3 flex items-center justify-center group-hover:bg-[var(--rs-bg-surface)] transition-colors text-center">{renderCell(enterprise, false)}</div>
        </div>
    )
}

function RowWithBrands() {
    return (
        <div className="grid grid-cols-6 divide-x divide-[var(--rs-border-primary)] hover:bg-[var(--rs-bg-secondary)]/30 transition-colors group">
            <div className="p-3 flex items-center bg-[var(--rs-bg-secondary)]/10">
                <span className="rs-type-mono text-[9px] font-bold text-[var(--rs-text-tertiary)] uppercase tracking-wider">Report Branding</span>
            </div>
            <div className="p-3 flex items-center justify-center text-center"><span className="rs-type-mono text-[9px] uppercase tracking-wide text-[var(--rs-text-secondary)]">Platform</span></div>
            <div className="p-3 flex items-center justify-center bg-[var(--rs-bg-surface)] text-center shadow-[inset_0_0_20px_rgba(0,0,0,0.02)] border-x border-[var(--rs-border-primary)] -mx-[1px] z-10">
                <span className="rs-type-mono text-[9px] uppercase tracking-wide text-[var(--rs-text-primary)] font-bold">Platform</span>
            </div>
            <div className="p-3 flex items-center justify-center text-center"><span className="rs-type-mono text-[9px] uppercase tracking-wide text-[var(--rs-text-secondary)]">Co-branded</span></div>
            <div className="p-3 flex items-center justify-center text-center"><span className="rs-type-mono text-[9px] uppercase tracking-wide text-[var(--rs-text-secondary)]">White-labeled</span></div>
            <div className="p-3 flex items-center justify-center text-center"><span className="rs-type-mono text-[9px] uppercase tracking-wide text-[var(--rs-text-secondary)]">Custom</span></div>
        </div>
    )
}
