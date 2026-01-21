'use client'

import { RSPanel } from '../rs/RSPanel'
import { TrendingUp, AlertTriangle, FileWarning } from 'lucide-react'

export function MarketExposure() {
    return (
        <section id="benchmarks" className="py-24 bg-[var(--rs-bg-surface)] border-b border-[var(--rs-border-primary)] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">

                {/* Section Header */}
                <div className="flex items-center gap-4 mb-16">
                    <div className="h-px bg-[var(--rs-border-primary)] flex-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] bg-[var(--rs-bg-surface)] px-4">
                        Market Exposure Data
                    </span>
                    <div className="h-px bg-[var(--rs-border-primary)] flex-1" />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Stat 1 */}
                    <div className="group">
                        <RSPanel className="h-full bg-[var(--rs-bg-secondary)] border-[var(--rs-border-primary)] hover:border-[var(--rs-text-primary)] transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-text-primary)] transition-colors">Liability Index</span>
                                <TrendingUp className="w-4 h-4 text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-signal)] transition-colors" />
                            </div>

                            <div className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--rs-text-primary)] mb-4">
                                $680K
                            </div>

                            <p className="text-sm font-medium text-[var(--rs-text-secondary)] leading-relaxed">
                                Average statutory damages per willful copyright infringement incident in US Federal Court.
                            </p>
                        </RSPanel>
                    </div>

                    {/* Stat 2 */}
                    <div className="group">
                        <RSPanel className="h-full bg-[var(--rs-bg-secondary)] border-[var(--rs-border-primary)] hover:border-[var(--rs-text-primary)] transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-text-primary)] transition-colors">System Blockers</span>
                                <AlertTriangle className="w-4 h-4 text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-signal)] transition-colors" />
                            </div>

                            <div className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--rs-text-primary)] mb-4">
                                82%
                            </div>

                            <p className="text-sm font-medium text-[var(--rs-text-secondary)] leading-relaxed">
                                Of enterprise legal teams block AI adoption due to "Unquantifiable IP Risk" (2025 Gartner).
                            </p>
                        </RSPanel>
                    </div>

                    {/* Stat 3 */}
                    <div className="group">
                        <RSPanel className="h-full bg-[var(--rs-bg-secondary)] border-[var(--rs-border-primary)] hover:border-[var(--rs-text-primary)] transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-text-primary)] transition-colors">Platform Takedowns</span>
                                <FileWarning className="w-4 h-4 text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-signal)] transition-colors" />
                            </div>

                            <div className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--rs-text-primary)] mb-4">
                                2.4M
                            </div>

                            <p className="text-sm font-medium text-[var(--rs-text-secondary)] leading-relaxed">
                                AI-generated assets flagged for removal by social platforms in Q4 2025 alone.
                            </p>
                        </RSPanel>
                    </div>
                </div>
            </div>
        </section>
    )
}
