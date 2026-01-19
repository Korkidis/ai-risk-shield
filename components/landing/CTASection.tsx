'use client'

import { CheckCircle2 } from 'lucide-react'
import { RSButton } from '../rs/RSButton'

export function CTASection() {
    return (
        <section className="py-32 bg-[var(--rs-bg-surface)] rs-edge-top relative overflow-hidden">

            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center w-full">
                {/* Technical ID Removed */}

                {/* Visual Label */}
                <div className="mb-8 flex justify-center">
                    <div className="px-3 py-1 border border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)] rounded-full text-[10px] uppercase tracking-widest text-[var(--rs-text-secondary)] font-bold shadow-[var(--rs-shadow-l1)]">
                        SYSTEM STATUS: ACTIVE
                    </div>
                </div>

                <h2 className="text-4xl md:text-6xl rs-header-bold-italic tracking-tighter text-[var(--rs-text-primary)] mb-8 leading-none">
                    GET A DEFENSIBLE RISK READ IN <span className="text-[var(--rs-signal)]">15 SECONDS</span>.
                </h2>

                <p className="text-lg text-[var(--rs-text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                    Upload once, receive a report you can share with legal, brand, or clients.
                </p>

                <div className="flex flex-col items-center space-y-12">
                    <div className="p-1 rounded-lg border border-[var(--rs-border-primary)] bg-[var(--rs-bg-secondary)] shadow-[var(--rs-shadow-l2)]">
                        <RSButton
                            size="lg"
                            variant="primary"
                            fullWidth={false}
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className='px-12 py-4 text-sm tracking-widest'
                        >
                            START FORENSIC SCAN
                        </RSButton>
                    </div>

                    <div className="text-center space-y-8">
                        <p className="text-[10px] uppercase tracking-widest text-[var(--rs-text-tertiary)] font-bold">
                            FREE INCLUDES 3 SCANS PER MONTH. EMAIL UNLOCKS THE FULL REPORT.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-lg mx-auto">
                            <TrustBullet text="SECURE PROCESSING" />
                            <TrustBullet text="EVIDENCE-FIRST REPORTING" />
                            <TrustBullet text="C2PA VERIFICATION" />
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
            <CheckCircle2 className="w-4 h-4 text-[var(--rs-safe)]" />
            <span className="text-xs text-[var(--rs-text-secondary)] font-bold uppercase tracking-wide">{text}</span>
        </div>
    )
}
