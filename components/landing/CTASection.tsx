'use client'

import { CheckCircle2 } from 'lucide-react'

export function CTASection() {
    return (
        <section className="py-32 bg-[#020617] border-t border-slate-900 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#020617] to-[#020617] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-10 tracking-tight leading-tight">
                    Get a defensible risk read in <span className="text-indigo-500">15 seconds</span>.
                </h2>

                <p className="text-lg text-slate-400 mb-16 max-w-2xl mx-auto leading-relaxed">
                    Upload once, receive a report you can share with legal, brand, or clients.
                </p>

                <div className="flex flex-col items-center space-y-12">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-xl text-sm font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1"
                    >
                        Start Free Scan
                    </button>

                    <div className="text-center space-y-8">
                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                            Free includes 3 scans per month. Email unlocks the full report.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-lg mx-auto opacity-75">
                            <TrustBullet text="Secure processing" />
                            <TrustBullet text="Evidence-first reporting" />
                            <TrustBullet text="C2PA verification" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function TrustBullet({ text }: { text: string }) {
    return (
        <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-slate-400 font-medium">{text}</span>
        </div>
    )
}
