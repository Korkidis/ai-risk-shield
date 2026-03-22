'use client'

import { RSPanel } from '../rs/RSPanel'

export function HowItWorks() {
    return (
        <section id="protocol" className="scroll-mt-24 py-24 bg-[var(--rs-bg-well)] rs-bg-grid rs-edge-top relative overflow-hidden">
            {/* Ruler Gutter - Left */}
            <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-[var(--rs-border-primary)]/50 hidden md:flex flex-col items-center py-4 overflow-hidden bg-[var(--rs-bg-well)] z-20">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="rs-ruler-tick" />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">

                <div className="text-center mb-24 relative pl-12 md:pl-0">
                    <div className="inline-block relative">
                        <h2 className="text-4xl md:text-5xl rs-header-bold-italic tracking-tighter text-[var(--rs-text-primary)] block">
                            HOW IT <span className="text-[var(--rs-signal)]">WORKS</span>
                        </h2>
                    </div>
                </div>

                {/* Grid of Cards (Extruded from Recessed Background) */}
                <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative pl-12 md:pl-0">

                    {/* Schematic Connector Line (Desktop) */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--rs-border-primary)] -translate-y-1/2 hidden md:block z-0" />
                    <div className="absolute top-1/2 left-[16%] w-2 h-2 rounded-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] -translate-y-1/2 hidden md:block z-0" />
                    <div className="absolute top-1/2 left-[50%] w-2 h-2 rounded-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] -translate-y-1/2 hidden md:block z-0" />
                    <div className="absolute top-1/2 left-[83%] w-2 h-2 rounded-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] -translate-y-1/2 hidden md:block z-0" />

                    {/* Step 1 */}
                    <StepCard
                        icon={<span className="font-mono text-xl font-black">01</span>}
                        title="UPLOAD & SCAN"
                        description="Drop any AI-generated image. Our policy-aware engine independently scores it for IP risk, brand safety, and provenance gaps."
                        step="01"
                        delay={0}
                    />

                    {/* Step 2 */}
                    <StepCard
                        icon={<span className="font-mono text-xl font-black">02</span>}
                        title="VERIFY PROVENANCE"
                        description="Cryptographic C2PA verification confirms origin and edit history. No guesswork — mathematically verifiable proof."
                        step="02"
                        delay={100}
                    />

                    {/* Step 3 */}
                    <StepCard
                        icon={<span className="font-mono text-xl font-black">03</span>}
                        title="GET YOUR INTELLIGENCE"
                        description="One composite risk score with actionable mitigation recommendations. Route to legal for review, attach to the brief, or pivot tactically."
                        step="03"
                        delay={200}
                    />
                </div>
            </div>
        </section>
    )
}

function StepCard({ icon, title, description, step, delay }: { icon: React.ReactNode, title: string, description: string, step: string, delay: number }) {
    return (
        <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards h-full"
            style={{ animationDelay: `${delay}ms` }}
        >
            <RSPanel
                className="h-full bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[8px_8px_0_theme(colors.black)] relative group transition-shadow duration-300 hover:shadow-[12px_12px_0_var(--rs-signal)]"
                style={{ borderRadius: 'var(--rs-radius-container)' }}
            >
                {/* Input Well Visuals */}
                <div className="absolute top-4 right-4 opacity-30">
                    <span className="rs-type-mono text-[9px] font-bold uppercase text-[var(--rs-text-tertiary)]">INPUT_{step}</span>
                </div>

                <div className="flex flex-col h-full items-center text-center p-6 md:p-8">
                    <div className="mb-6 relative">
                        {/* Circle Badge */}
                        <div className="w-16 h-16 rounded-full bg-[var(--rs-bg-secondary)] border border-[var(--rs-border-primary)] flex items-center justify-center relative z-10 text-[var(--rs-signal)]">
                            {icon}
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--rs-text-primary)] mb-4 tracking-tight uppercase rs-etched">
                        {title}
                    </h3>

                    <p className="text-[var(--rs-text-secondary)] leading-relaxed text-sm">
                        {description}
                    </p>
                </div>
            </RSPanel>
        </div>
    )
}
