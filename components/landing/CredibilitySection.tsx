'use client'

import { Shield, Lock, Database, FileSearch, Fingerprint, AlertTriangle } from 'lucide-react'

export function CredibilitySection() {
    return (
        <section className="py-24 bg-[#020617] border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Security & Privacy Panel */}
                    <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden group hover:bg-slate-900/50 hover:border-indigo-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] transition-opacity opacity-50 group-hover:opacity-100"></div>

                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-indigo-900/20 rounded-xl border border-indigo-500/20 group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] transition-all">
                                <Shield className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Security & Privacy</h3>
                        </div>

                        <ul className="space-y-6">
                            <ListItem
                                icon={<Database className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />}
                                title="Zero-Retention Policy"
                                description="Files are processed in ephemeral memory and permanently deleted immediately after analysis. We do not store your assets."
                            />
                            <ListItem
                                icon={<Lock className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />}
                                title="Enterprise Encryption"
                                description="All data is secured with AES-256 encryption in transit and at rest. SOC 2 Type II compliant infrastructure."
                            />
                            <ListItem
                                icon={<Shield className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />}
                                title="No Model Training"
                                description="Your data is strictly isolated. We explicitly NEVER use customer uploads to train, fine-tune, or improve our detection models."
                            />
                        </ul>
                    </div>

                    {/* Evidence Quality Panel */}
                    <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm relative overflow-hidden group hover:bg-slate-900/50 hover:border-emerald-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] transition-opacity opacity-50 group-hover:opacity-100"></div>

                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 bg-emerald-900/20 rounded-xl border border-emerald-500/20 group-hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] transition-all">
                                <FileSearch className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Evidence Quality</h3>
                        </div>

                        <ul className="space-y-6">
                            <ListItem
                                icon={<Fingerprint className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />}
                                title="IP & Copyright Signals"
                                description="Multi-vector analysis checks for visual similarity, style transfer matches, and known protected entity signatures in our proprietary registry."
                            />
                            <ListItem
                                icon={<FileSearch className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />}
                                title="Provenance Verification"
                                description="Cryptographic C2PA/CAI validation combined with metadata forensic auditing to detect tampering or synthetic generation."
                            />
                            <ListItem
                                icon={<AlertTriangle className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />}
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
        <li className="flex items-start space-x-4">
            <div className="mt-1 flex-shrink-0">{icon}</div>
            <div>
                <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
        </li>
    )
}
