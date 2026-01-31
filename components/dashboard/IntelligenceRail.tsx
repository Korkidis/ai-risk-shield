'use client'

import { RiskProfile } from '@/lib/gemini-types'
import { AlertTriangle, CheckCircle2, Shield, Fingerprint, FileSearch, Download, Share2 } from 'lucide-react'

type Props = {
    status: 'idle' | 'scanning' | 'complete'
    profile: RiskProfile | null
}

export function IntelligenceRail({ status, profile }: Props) {
    if (status === 'idle') {
        return (
            <div className="h-full flex flex-col justify-center items-center text-center p-12 border border-[var(--rs-border-primary)] rounded-3xl bg-[var(--rs-bg-element)]/50">
                <div className="w-16 h-16 bg-[var(--rs-bg-element)] rounded-2xl flex items-center justify-center mb-6 animate-pulse border border-[var(--rs-border-secondary)]">
                    <FileSearch className="w-8 h-8 text-[var(--rs-text-secondary)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--rs-text-primary)] mb-2">Ready to Analyze</h3>
                <p className="text-[var(--rs-text-secondary)] text-sm mb-8">Upload an asset to begin forensic risk assessment.</p>
            </div>
        )
    }

    if (status === 'scanning') {
        return (
            <div className="h-full flex flex-col justify-center items-center p-12 border border-[var(--rs-border-primary)] rounded-3xl bg-[var(--rs-bg-element)]/50">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-[var(--rs-border-secondary)] rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[var(--rs-action-primary)] rounded-full border-t-transparent animate-spin"></div>
                    <ScanIcon className="absolute inset-0 m-auto w-8 h-8 text-[var(--rs-action-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--rs-text-primary)] mb-2 animate-pulse">Analyzing Vectors...</h3>
                <div className="space-y-2 text-center">
                    <p className="text-xs text-[var(--rs-text-secondary)]">Checking IP Database...</p>
                    <p className="text-xs text-[var(--rs-text-secondary)]">Verifying Provenance & Credentials...</p>
                    <p className="text-xs text-[var(--rs-text-secondary)]">Assessing Safety Protocols...</p>
                </div>
            </div>
        )
    }

    if (status === 'complete' && profile) {
        // Decide Color
        let color = "text-[var(--rs-safe)]"
        let bgColor = "bg-[var(--rs-safe)]/10"
        let borderColor = "border-[var(--rs-safe)]/20"
        if (profile.composite_score > 65) {
            color = "text-[var(--rs-signal)]"
            bgColor = "bg-[var(--rs-signal)]/10"
            borderColor = "border-[var(--rs-signal)]/20"
        } else if (profile.composite_score > 35) {
            color = "text-[var(--rs-risk-caution)]"
            bgColor = "bg-[var(--rs-risk-caution)]/10"
            borderColor = "border-[var(--rs-risk-caution)]/20"
        }

        return (
            <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* Score Header */}
                <div className={`p-6 rounded-3xl border ${borderColor} ${bgColor} relative overflow-hidden`}>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-secondary)] mb-1">Composite Risk Score</div>
                            <div className={`text-4xl font-black ${color}`}>
                                {profile.composite_score ?? 0}
                                <span className="text-lg text-[var(--rs-text-tertiary)] font-medium">/100</span>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${borderColor} bg-[var(--rs-bg-surface)] ${color} text-xs font-bold uppercase tracking-widest`}>
                            {profile.verdict}
                        </div>
                    </div>
                </div>

                {/* Findings List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--rs-text-secondary)] flex items-center">
                        <FileSearch className="w-3 h-3 mr-2" />
                        Key Findings
                    </h4>

                    <FindingCard
                        title="IP / Copyright"
                        score={profile.ip_report.score}
                        description={profile.ip_report.teaser}
                        icon={<Fingerprint className="w-4 h-4" />}
                    />
                    <FindingCard
                        title="Brand Safety"
                        score={profile.safety_report.score}
                        description={profile.safety_report.teaser}
                        icon={<Shield className="w-4 h-4" />}
                    />
                    <FindingCard
                        title="Provenance & Credentials"
                        score={profile.provenance_report.score}
                        description={profile.provenance_report.teaser}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        c2pa={profile.c2pa_report}
                    />
                </div>

                {/* Action Plan */}
                <div className="space-y-4 pt-4 border-t border-[var(--rs-border-secondary)]">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--rs-text-secondary)] flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-2" />
                        Recommended Actions
                    </h4>

                    <div className="bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] p-4 rounded-xl text-sm text-[var(--rs-text-secondary)] leading-relaxed">
                        <ul className="space-y-3 list-disc list-outside pl-4">
                            <li>Manual review required for detected brand identifiers.</li>
                            <li>Consider blurring background logos to reduce IP risk.</li>
                            <li>Embed C2PA credentials before publication.</li>
                        </ul>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex gap-3">
                    <button className="flex-1 bg-[var(--rs-action-primary)] hover:bg-[var(--rs-action-primary)]/90 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-[var(--rs-action-primary)]/20 transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Full Report
                    </button>
                    <button className="px-4 bg-[var(--rs-bg-element)] hover:bg-[var(--rs-bg-element)]/80 text-[var(--rs-text-primary)] rounded-xl border border-[var(--rs-border-primary)] transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Legal Disclaimer inside Rail */}
                <div className="pt-4 pb-2 text-center">
                    <p className="text-[7px] text-[var(--rs-text-tertiary)] uppercase tracking-widest leading-relaxed font-bold opacity-60">
                        DISCLAIMER: RISK SHIELD IS A DIAGNOSTIC TOOL FOR FORENSIC PATTERN RECOGNITION. THIS DOES NOT CONSTITUTE LEGAL ADVICE. ALL FINAL COMPLIANCE DECISIONS SHOULD BE MADE BY QUALIFIED LEGAL COUNSEL. RISK SCORES ARE INDICATORS OF ALGORITHMIC EXPOSURE, NOT DEFINITIVE LEGAL RULINGS.
                    </p>
                </div>
            </div>
        )
    }

    return null
}

function ScanIcon(props: any) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        </svg>
    )
}

function FindingCard({ title, score, description, icon, c2pa }: any) {
    const getColor = (s: number) => {
        if (s > 65) return 'text-[var(--rs-signal)]'
        if (s > 35) return 'text-[var(--rs-risk-caution)]'
        return 'text-[var(--rs-safe)]'
    }

    return (
        <div className="bg-[var(--rs-bg-element)]/50 border border-[var(--rs-border-primary)] p-4 rounded-xl hover:bg-[var(--rs-bg-element)] transition-colors group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-[var(--rs-text-primary)] font-medium text-sm">
                    <span className="text-[var(--rs-text-secondary)] group-hover:text-[var(--rs-text-primary)] transition-colors">{icon}</span>
                    <span>{title}</span>
                </div>
                <div className="flex items-center space-x-2">
                    {c2pa && (
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${c2pa.status === 'verified' ? 'bg-[var(--rs-info)]/20 text-[var(--rs-info)] border-[var(--rs-info)]/30' :
                            c2pa.status === 'missing' ? 'bg-[var(--rs-bg-surface)] text-[var(--rs-text-tertiary)] border-[var(--rs-border-secondary)]' :
                                'bg-[var(--rs-signal)]/10 text-[var(--rs-signal)] border-[var(--rs-signal)]/20'
                            }`}>
                            {c2pa.status}
                        </span>
                    )}
                    <span className={`text-xs font-bold ${getColor(score)}`}>{score}/100</span>
                </div>
            </div>
            <p className="text-xs text-[var(--rs-text-secondary)] line-clamp-2">{description}</p>
            {c2pa?.issuer && (
                <p className="text-[10px] text-[var(--rs-text-tertiary)] mt-2 italic">
                    Signed by: <span className="text-[var(--rs-text-secondary)]">{c2pa.issuer}</span>
                </p>
            )}
        </div>
    )
}
