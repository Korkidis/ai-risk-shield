'use client'

export function Footer() {
    return (
        <footer className="bg-[var(--rs-bg-surface)] py-24 border-t border-[var(--rs-border-primary)] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 text-center space-y-12 relative z-10">

                {/* Closing Headline */}
                <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl rs-header-bold-italic tracking-tighter text-[var(--rs-text-primary)]">
                        Stop Publishing In the <span className="text-[var(--rs-signal)]">Dark.</span>
                    </h2>
                    <p className="rs-type-body text-[var(--rs-text-secondary)]">
                        Join 200+ agencies validating their AI workflow with RiskShield.
                    </p>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-[var(--rs-text-tertiary)] uppercase tracking-widest leading-loose max-w-3xl mx-auto font-medium opacity-60">
                    DISCLAIMER: RiskShield provides technical risk assessment data. We do not provide legal advice. All final publishing decisions should be made in consultation with qualified legal counsel. Forensic accuracy is subject to the capabilities of current ML models.
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
