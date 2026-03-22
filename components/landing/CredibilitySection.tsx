'use client'



export function TrustCompliance() {
    return (
        <section className="py-24 bg-[var(--rs-bg-surface)] border-t border-[var(--rs-border-primary)] relative overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <h2 className="text-4xl md:text-5xl rs-header-bold-italic tracking-tighter text-[var(--rs-text-primary)] mb-16 uppercase">
                    A SECURE, VERIFIABLE <span className="text-[var(--rs-signal)]">INFRASTRUCTURE.</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--rs-border-primary)] border-2 border-[var(--rs-border-primary)] shadow-[12px_12px_0_theme(colors.black)] text-left">
                    <TrustBlock 
                        title="No Training. Ever." 
                        desc="Your assets are analyzed in a volatile environment and immediately purged. We do not use your data or uploads to train our analysis engine." 
                    />
                    <TrustBlock 
                        title="Open Provenance" 
                        desc="Cryptographic C2PA validation ensures all metadata is verified against open standard registries, not proprietary walled gardens." 
                    />
                    <TrustBlock 
                        title="Data Isolation" 
                        desc="Row-level security enforcement guarantees absolute multitenant separation of your forensic reports and strategic logic." 
                    />
                    <TrustBlock 
                        title="Compliance Grade" 
                        desc="Operating within SOC2 Type II and ISO 27001 target parameters, securely hosted on Vercel and Supabase cloud infrastructure." 
                    />
                </div>
            </div>
        </section>
    )
}

function TrustBlock({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="bg-[var(--rs-bg-surface)] p-10 h-full flex flex-col justify-start group hover:bg-[var(--rs-bg-secondary)] transition-colors duration-300">
            <h3 className="rs-type-section text-lg uppercase text-[var(--rs-text-primary)] font-bold mb-4 tracking-tight">{title}</h3>
            <p className="rs-type-body text-sm md:text-base text-[var(--rs-text-secondary)] leading-relaxed">{desc}</p>
        </div>
    )
}
