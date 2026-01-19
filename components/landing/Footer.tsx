'use client'

export function Footer() {
    return (
        <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-[var(--rs-border-primary)] text-center space-y-6">
            <p className="text-[10px] text-[var(--rs-text-tertiary)] uppercase tracking-widest leading-loose max-w-3xl mx-auto font-medium">
                DISCLAIMER: Risk Shield is a diagnostic tool for forensic pattern recognition. This does NOT constitute legal advice.
                All final compliance decisions should be made by qualified legal counsel. Risk scores are indicators of algorithmic exposure, not definitive legal rulings.
            </p>
            <div className="flex justify-center items-center gap-2 text-[10px] text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                <span>© 2024 AI Risk Shield Forensic Systems</span>
                <span className="w-1 h-1 bg-[var(--rs-text-tertiary)] rounded-full" />
                <span>System v3.0</span>
            </div>
        </footer>
    )
}
