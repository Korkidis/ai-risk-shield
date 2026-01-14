'use client'

import { RiskProfile } from '@/lib/gemini'
import { AlertTriangle, CheckCircle2, Shield, Fingerprint, FileSearch, ArrowRight, Download, Share2 } from 'lucide-react'

type Props = {
    status: 'idle' | 'scanning' | 'complete'
    profile: RiskProfile | null
    onScan: () => void
}

export function IntelligenceRail({ status, profile, onScan }: Props) {
    if (status === 'idle') {
        return (
            <div className="h-full flex flex-col justify-center items-center text-center p-12 border border-slate-800 rounded-3xl bg-slate-900/10">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
                    <FileSearch className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ready to Analyze</h3>
                <p className="text-slate-500 text-sm mb-8">Upload an asset to begin forensic risk assessment.</p>
            </div>
        )
    }

    if (status === 'scanning') {
        return (
            <div className="h-full flex flex-col justify-center items-center p-12 border border-slate-800 rounded-3xl bg-slate-900/10">
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                    <ScanIcon className="absolute inset-0 m-auto w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 animate-pulse">Analyzing Vectors...</h3>
                <div className="space-y-2 text-center">
                    <p className="text-xs text-slate-500">Checking IP Database...</p>
                    <p className="text-xs text-slate-500">Verifying Provenance...</p>
                    <p className="text-xs text-slate-500">Assessing Safety Protocols...</p>
                </div>
            </div>
        )
    }

    if (status === 'complete' && profile) {
        // Decide Color
        let color = "text-emerald-400"
        let bgColor = "bg-emerald-500/10"
        let borderColor = "border-emerald-500/20"
        if (profile.composite_score > 65) {
            color = "text-red-400"
            bgColor = "bg-red-500/10"
            borderColor = "border-red-500/20"
        } else if (profile.composite_score > 35) {
            color = "text-amber-400"
            bgColor = "bg-amber-500/10"
            borderColor = "border-amber-500/20"
        }

        return (
            <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* Score Header */}
                <div className={`p-6 rounded-3xl border ${borderColor} ${bgColor} relative overflow-hidden`}>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Composite Risk Score</div>
                            <div className={`text-4xl font-black ${color}`}>{profile.composite_score}<span className="text-lg text-slate-500 font-medium">/100</span></div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border ${borderColor} bg-slate-900/50 ${color} text-xs font-bold uppercase tracking-widest`}>
                            {profile.verdict}
                        </div>
                    </div>
                </div>

                {/* Findings List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center">
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
                        title="Provenance"
                        score={profile.provenance_report.score}
                        description={profile.provenance_report.teaser}
                        icon={<CheckCircle2 className="w-4 h-4" />}
                    />
                </div>

                {/* Action Plan */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-2" />
                        Recommended Actions
                    </h4>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-sm text-slate-300 leading-relaxed">
                        <ul className="space-y-3 list-disc list-outside pl-4">
                            <li>Manual review required for detected brand identifiers.</li>
                            <li>Consider blurring background logos to reduce IP risk.</li>
                            <li>Embed C2PA credentials before publication.</li>
                        </ul>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex gap-3">
                    <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Full Report
                    </button>
                    <button className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-colors">
                        <Share2 className="w-4 h-4" />
                    </button>
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

function FindingCard({ title, score, description, icon }: any) {
    const getColor = (s: number) => {
        if (s > 65) return 'text-red-400'
        if (s > 35) return 'text-amber-400'
        return 'text-emerald-400'
    }

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl hover:bg-slate-800/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-white font-medium text-sm">
                    <span className="text-slate-500 group-hover:text-white transition-colors">{icon}</span>
                    <span>{title}</span>
                </div>
                <span className={`text-xs font-bold ${getColor(score)}`}>{score}/100</span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
        </div>
    )
}
