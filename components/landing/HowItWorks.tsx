'use client'

import { Scan, BrainCircuit, ShieldCheck } from 'lucide-react'
import { RSCard } from '../rs/RSCard'

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-rs-gray-50 border-t border-rs-gray-200 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none text-rs-black"
                style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-rs-black mb-6 tracking-tighter">
                        Forensic <span className="text-rs-gray-500">Protocol</span>
                    </h2>
                    <p className="text-rs-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                        Standardized auditing process for visual asset verification.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <StepCard
                        icon={<Scan className="w-6 h-6 text-rs-black" />}
                        title="Upload Asset"
                        description="Input image or video file. System scans instantly for copyright risks, AI signatures, and brand safety violations."
                        step="01"
                    />

                    {/* Step 2 */}
                    <StepCard
                        icon={<BrainCircuit className="w-6 h-6 text-rs-black" />}
                        title="Forensic Analysis"
                        description="Engine analyzes visual patterns, metadata, and C2PA credentials to detect manipulation and provenance gaps."
                        step="02"
                    />

                    {/* Step 3 */}
                    <StepCard
                        icon={<ShieldCheck className="w-6 h-6 text-rs-black" />}
                        title="Risk Verdict"
                        description="Receive a definitive risk score with detailed insights on exposure, allowing for confident compliance decisions."
                        step="03"
                    />
                </div>
            </div>
        </section>
    )
}

function StepCard({ icon, title, description, step }: { icon: React.ReactNode, title: string, description: string, step: string }) {
    return (
        <RSCard variant="default" className="h-full hover:-translate-y-1 transition-transform duration-300">
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-rs-gray-100 rounded-[4px] border border-rs-gray-200">
                        {icon}
                    </div>
                    <span className="font-mono text-2xl font-bold text-rs-gray-200 select-none">{step}</span>
                </div>

                <h3 className="text-xl font-bold text-rs-black mb-3 tracking-tight">
                    {title}
                </h3>

                <p className="text-rs-gray-600 leading-relaxed text-sm">
                    {description}
                </p>
            </div>
        </RSCard>
    )
}
