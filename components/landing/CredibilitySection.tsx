'use client'

import { Shield, Lock, CheckCircle, Component, Globe } from 'lucide-react'

export function TrustCompliance() {
    return (
        <section className="py-24 bg-[var(--rs-bg-well)] rs-bg-grid rs-edge-top relative overflow-hidden">
            {/* Ruler Gutter - Left */}
            <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-[var(--rs-border-primary)]/50 hidden md:flex flex-col items-center py-4 overflow-hidden bg-[var(--rs-bg-well)] z-20">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="rs-ruler-tick" />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full pl-16 md:pl-6">

                {/* Section Header */}
                <div className="flex items-center gap-4 mb-16">
                    <div className="h-px bg-[var(--rs-border-primary)] flex-1" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] bg-[var(--rs-bg-well)] px-4">
                        System Integrity
                    </span>
                    <div className="h-px bg-[var(--rs-border-primary)] flex-1" />
                </div>

                <div className="grid md:grid-cols-2 gap-12 md:gap-24">

                    {/* Trust & Compliance Panel */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-[var(--rs-border-primary)]">
                            <div className="p-2 border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-small)]">
                                <Shield className="w-5 h-5 text-[var(--rs-text-primary)]" />
                            </div>
                            <h3 className="text-2xl rs-type-section tracking-tight text-[var(--rs-text-primary)] uppercase">TRUST & COMPLIANCE</h3>
                        </div>

                        <ul className="space-y-8">
                            <ListItem
                                icon={<Lock className="w-4 h-4" />}
                                title="PRIVACY FIRST"
                                description="Assets are encrypted in transit and at rest. No training on user data."
                            />
                            <ListItem
                                icon={<CheckCircle className="w-4 h-4" />}
                                title="C2PA NATIVE"
                                description="Founding member of CAI. We verify provenance, we don't guess."
                            />
                            <ListItem
                                icon={<Shield className="w-4 h-4" />}
                                title="COMPLIANCE"
                                description="SOC 2 Type II certified. ISO 27001 mapping for global legal teams."
                            />
                            <ListItem
                                icon={<Globe className="w-4 h-4" />}
                                title="INFRASTRUCTURE"
                                description="99.99% uptime SLA. Globally distributed forensic nodes."
                            />
                        </ul>
                    </div>

                    {/* Badges / Logos Visual */}
                    <div className="flex flex-col justify-center gap-6">
                        <div className="border border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] p-8 rounded-lg flex flex-wrap gap-8 items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
                            <Badge text="SOC2 COMPLIANT" />
                            <Badge text="GDPR READY" />
                            <Badge text="ISO 27001" />
                            <Badge text="C2PA MEMBER" />
                        </div>
                        <div className="p-8 border border-[var(--rs-border-primary)] border-dashed rounded-lg bg-[var(--rs-bg-secondary)]/50 text-center">
                            <Component className="w-12 h-12 text-[var(--rs-text-tertiary)] mx-auto mb-4" />
                            <p className="text-xs uppercase tracking-widest text-[var(--rs-text-tertiary)] font-bold">
                                Secure Enclave Architecture
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ListItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <li className="flex items-start space-x-4 group">
            <div className="mt-1 flex-shrink-0 text-[var(--rs-text-tertiary)] group-hover:text-[var(--rs-text-primary)] transition-colors duration-300">
                {icon}
            </div>
            <div>
                <h4 className="text-[var(--rs-text-primary)] font-bold text-sm mb-1 uppercase tracking-wide">{title}</h4>
                <p className="text-[var(--rs-text-secondary)] text-sm leading-relaxed max-w-sm">{description}</p>
            </div>
        </li>
    )
}

function Badge({ text }: { text: string }) {
    return (
        <div className="px-3 py-1.5 border border-[var(--rs-border-primary)] rounded bg-[var(--rs-bg-secondary)] text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">
            {text}
        </div>
    )
}
