'use client'

import { Shield, Lock, Database, Search, Fingerprint, AlertTriangle } from 'lucide-react'

export function CredibilitySection() {
    return (
        <section className="py-24 bg-rs-black text-rs-white border-t border-rs-gray-800 relative overflow-hidden">
            {/* Subtle Texture - Noise */}
            <div className="absolute inset-0 opacity-10 pointer-events-none rs-texture-noise"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 gap-12 md:gap-24">

                    {/* Security & Privacy Panel */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-rs-gray-800">
                            <div className="p-2 bg-rs-gray-900 rounded-[4px] border border-rs-gray-800">
                                <Shield className="w-5 h-5 text-rs-gray-200" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-rs-gray-50">Security & Privacy</h3>
                        </div>

                        <ul className="space-y-8">
                            <ListItem
                                icon={<Database className="w-4 h-4" />}
                                title="Zero-Retention Policy"
                                description="Files are processed in ephemeral memory and permanently deleted immediately after analysis. We do not store your assets."
                            />
                            <ListItem
                                icon={<Lock className="w-4 h-4" />}
                                title="Enterprise Encryption"
                                description="All data is secured with AES-256 encryption in transit and at rest. SOC 2 Type II compliant infrastructure."
                            />
                            <ListItem
                                icon={<Shield className="w-4 h-4" />}
                                title="No Model Training"
                                description="Your data is strictly isolated. We explicitly NEVER use customer uploads to train, fine-tune, or improve our detection models."
                            />
                        </ul>
                    </div>

                    {/* Evidence Quality Panel */}
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-rs-gray-800">
                            <div className="p-2 bg-rs-gray-900 rounded-[4px] border border-rs-gray-800">
                                <Search className="w-5 h-5 text-rs-gray-200" />
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight text-rs-gray-50">Evidence Quality</h3>
                        </div>

                        <ul className="space-y-8">
                            <ListItem
                                icon={<Fingerprint className="w-4 h-4" />}
                                title="IP & Copyright Signals"
                                description="Multi-vector analysis checks for visual similarity, style transfer matches, and known protected entity signatures in our proprietary registry."
                            />
                            <ListItem
                                icon={<Search className="w-4 h-4" />}
                                title="Provenance Verification"
                                description="Cryptographic C2PA/CAI validation combined with metadata forensic auditing to detect tampering or synthetic generation."
                            />
                            <ListItem
                                icon={<AlertTriangle className="w-4 h-4 text-rs-signal" />}
                                title="Critical Risk Definition"
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
            <div className="mt-1 flex-shrink-0 text-rs-gray-600 group-hover:text-rs-gray-200 transition-colors duration-300">
                {icon}
            </div>
            <div>
                <h4 className="text-rs-gray-200 font-bold text-sm mb-1 uppercase tracking-wide">{title}</h4>
                <p className="text-rs-gray-500 text-sm leading-relaxed max-w-sm">{description}</p>
            </div>
        </li>
    )
}
