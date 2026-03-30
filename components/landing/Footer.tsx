'use client'

import Link from 'next/link'
import { Fingerprint } from 'lucide-react'
import { RSButton } from '@/components/rs/RSButton'

export function Footer() {
    return (
        <footer className="bg-[var(--rs-bg-surface)] pt-24 pb-12 border-t border-[var(--rs-border-primary)] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">

                {/* Closing Headline & CTAs */}
                <div className="space-y-8 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-6xl uppercase italic font-black leading-[0.9] tracking-tight text-[var(--rs-text-primary)] text-balance">
                        STOP PUBLISHING IN THE <span className="text-[var(--rs-signal)]">DARK.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-base leading-relaxed text-[var(--rs-text-secondary)] text-pretty">
                        Don&apos;t let unverified AI assets expose your brand to IP litigation. Upload your first image and secure your content pipeline in 15 seconds.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                        <Link href="/register">
                            <RSButton variant="primary" size="lg" icon={<Fingerprint className="w-4 h-4" />}>
                                Run a Forensic Scan
                            </RSButton>
                        </Link>
                        <Link href="/pricing">
                            <RSButton variant="secondary" size="lg">
                                View Enterprise Plans
                            </RSButton>
                        </Link>
                    </div>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-[var(--rs-text-secondary)] uppercase tracking-widest leading-loose max-w-3xl mx-auto font-medium">
                    DISCLAIMER: AI Content Risk Score provides technical risk assessment data. We do not provide legal advice. All final publishing decisions should be made in consultation with qualified legal counsel. Forensic accuracy is subject to the capabilities of current ML models.
                </p>

                {/* Copyright */}
                <div className="flex justify-center items-center gap-2 text-[10px] text-[var(--rs-text-tertiary)] uppercase tracking-widest font-bold">
                    <span>© 2026 UZUMAKI CORE INSTRUMENTS</span>
                    <span className="w-1 h-1 bg-[var(--rs-text-tertiary)] rounded-full" />
                    <span>ALL RIGHTS RESERVED</span>
                </div>
            </div>
        </footer>
    )
}
