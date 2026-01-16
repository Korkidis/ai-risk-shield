'use client'

import { Scan, BrainCircuit, ShieldCheck } from 'lucide-react'

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-[#020617] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        How It <span className="text-indigo-500">Works</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Upload your image or video. Get a comprehensive risk assessment in seconds. It's that simple.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <Card
                        icon={<Scan className="w-8 h-8 text-indigo-400" />}
                        title="Upload Your Asset"
                        description="Drop an image or video. We scan it instantly—checking for copyright risks, AI-generated content, and brand safety issues."
                        step="01"
                    />

                    {/* Step 2 */}
                    <Card
                        icon={<BrainCircuit className="w-8 h-8 text-indigo-400" />}
                        title="AI Forensic Analysis"
                        description="Our engine analyzes visual patterns, metadata, and content credentials to detect manipulation, provenance issues, and potential legal exposure."
                        step="02"
                    />

                    {/* Step 3 */}
                    <Card
                        icon={<ShieldCheck className="w-8 h-8 text-indigo-400" />}
                        title="Get Your Risk Score"
                        description="Receive a clear risk rating with detailed insights on IP exposure, brand safety, and authenticity—so you can make confident decisions."
                        step="03"
                    />
                </div>
            </div>
        </section>
    )
}

function Card({ icon, title, description, step }: { icon: React.ReactNode, title: string, description: string, step: string }) {
    return (
        <div className="group relative bg-slate-900/30 border border-slate-800 p-8 rounded-3xl hover:bg-slate-900/50 hover:border-indigo-500/30 transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-6 right-8 text-4xl font-bold text-slate-800 group-hover:text-indigo-900/50 transition-colors duration-500 select-none">
                {step}
            </div>

            <div className="mb-6 p-4 bg-slate-950/50 rounded-2xl w-fit border border-slate-800 group-hover:border-indigo-500/30 group-hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)] transition-all duration-500">
                {icon}
            </div>

            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-indigo-200 transition-colors">
                {title}
            </h3>

            <p className="text-slate-400 leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
                {description}
            </p>
        </div>
    )
}
