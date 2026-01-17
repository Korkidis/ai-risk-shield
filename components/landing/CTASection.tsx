'use client'

import { CheckCircle2 } from 'lucide-react'
import { RSButton } from '../rs/RSButton'

export function CTASection() {
    return (
        <section className="py-32 bg-rs-gray-50 border-t border-rs-gray-200 relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">

                {/* Visual Label */}
                <div className="mb-8 flex justify-center">
                    <div className="px-3 py-1 border border-rs-gray-200 bg-rs-white rounded-full text-[10px] uppercase tracking-widest text-rs-gray-500 font-bold">
                        Final Validation
                    </div>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-rs-black mb-8 tracking-tighter leading-tight">
                    Get a defensible risk read in <span className="text-rs-gray-400">15 seconds</span>.
                </h2>

                <p className="text-lg text-rs-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                    Upload once, receive a report you can share with legal, brand, or clients.
                </p>

                <div className="flex flex-col items-center space-y-12">
                    <RSButton
                        size="lg"
                        variant="primary"
                        fullWidth={false}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className='px-12 py-4 text-sm'
                    >
                        Start Free Scan
                    </RSButton>

                    <div className="text-center space-y-8">
                        <p className="text-[10px] uppercase tracking-widest text-rs-gray-400 font-bold">
                            Free includes 3 scans per month. Email unlocks the full report.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-lg mx-auto">
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
            <CheckCircle2 className="w-4 h-4 text-rs-safe" />
            <span className="text-xs text-rs-gray-500 font-bold uppercase tracking-wide">{text}</span>
        </div>
    )
}
