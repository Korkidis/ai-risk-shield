'use client'

import { Shield, Lock, Database, Search, Fingerprint, AlertTriangle } from 'lucide-react'

export function CredibilitySection() {
    return (
        <section className="py-24 bg-[var(--rs-bg-well)] rs-bg-grid rs-edge-top relative overflow-hidden">
            {/* Ruler Gutter - Left */}
            <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-[var(--rs-border-primary)]/50 hidden md:flex flex-col items-center py-4 overflow-hidden bg-[var(--rs-bg-well)] z-20">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="rs-ruler-tick" />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Technical ID Removed */}
                <div className="grid md:grid-cols-2 gap-12 md:gap-24">

                    {/* Security & Privacy Panel */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-[var(--rs-border-primary)]">
                            <div className="p-2 border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-small)]">
                                <Shield className="w-5 h-5 text-[var(--rs-text-primary)]" />
                            </div>
                            <h3 className="text-2xl rs-type-section tracking-tight text-[var(--rs-text-primary)] uppercase">SECURITY & PRIVACY</h3>
                        </div>

                        <ul className="space-y-8">
                            <ListItem
                                icon={<Database className="w-4 h-4" />}
                                title="ZERO-RETENTION POLICY"
                                description="Files are processed in ephemeral memory and permanently deleted immediately after analysis. We do not store your assets."
                            />
                            <ListItem
                                icon={<Lock className="w-4 h-4" />}
                                title="ENTERPRISE ENCRYPTION"
                                description="All data is secured with AES-256 encryption in transit and at rest. SOC 2 Type II compliant infrastructure."
                            />
                            <ListItem
                                icon={<Shield className="w-4 h-4" />}
                                title="NO MODEL TRAINING"
                                description="Your data is strictly isolated. We explicitly NEVER use customer uploads to train, fine-tune, or improve our detection models."
                            />
                        </ul>
                    </div>

                    {/* Evidence Quality Panel */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-[var(--rs-border-primary)]">
                            <div className="p-2 border border-[var(--rs-border-primary)] rounded-[var(--rs-radius-small)]">
                                <Search className="w-5 h-5 text-[var(--rs-text-primary)]" />
                            </div>
                            <h3 className="text-2xl rs-type-section tracking-tight text-[var(--rs-text-primary)] uppercase">EVIDENCE QUALITY</h3>
                        </div>

                        <ul className="space-y-8">
                            <ListItem
                                icon={<Fingerprint className="w-4 h-4" />}
                                title="IP & COPYRIGHT SIGNALS"
                                description="Multi-vector analysis checks for visual similarity, style transfer matches, and known protected entity signatures in our proprietary registry."
                            />
                            <ListItem
                                icon={<Search className="w-4 h-4" />}
                                title="PROVENANCE VERIFICATION"
                                description="Cryptographic C2PA/CAI validation combined with metadata forensic auditing to detect tampering or synthetic generation."
                            />
                            <ListItem
                                icon={<AlertTriangle className="w-4 h-4 text-[var(--rs-signal)]" />}
                                title="CRITICAL RISK DEFINITION"
                                description="A 'Critical' score signals >85% confidence of copyright infringement or high-probability generative artifacts requiring immediate legal review."
                            />
                        </ul>
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
