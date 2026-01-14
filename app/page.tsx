'use client'

import { useState } from 'react'
import { FreeUploadContainer } from '@/components/landing/FreeUploadContainer'
import { ScanResultsWithGate } from '@/components/landing/ScanResultsWithGate'
import { Header } from '@/components/layout/Header'
import { SubscriptionComparison } from '@/components/landing/SubscriptionComparison'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CredibilitySection } from '@/components/landing/CredibilitySection'
import { CTASection } from '@/components/landing/CTASection'
import { RiskProfile } from '@/lib/gemini'

type ViewState = 'upload' | 'processing' | 'results'

export default function LandingPage() {
    const [view, setView] = useState<ViewState>('upload')
    const [scanId, setScanId] = useState<string>('')
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)
    const [processingProgress, setProcessingProgress] = useState(0)
    const [processingStep, setProcessingStep] = useState('Initializing...')



    return (
        <div className="min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-indigo-500/30">

            {/* NAVIGATION */}
            <Header />

            <main className="flex-grow w-full">

                <div className="max-w-7xl mx-auto px-6 py-12">
                    {/* VIEW 1: UPLOAD */}
                    {view === 'upload' && (
                        <div className="animate-in fade-in duration-500">
                            <FreeUploadContainer
                                onUploadStart={() => {
                                    setView('processing')
                                    let p = 0
                                    const steps = [
                                        "Scanning visual signature patterns...",
                                        "Cross-referencing IP databases...",
                                        "Analyzing content provenance...",
                                        "Checking brand safety vectors...",
                                        "Calculating risk indicators...",
                                        "Compiling forensic assessment..."
                                    ]
                                    const interval = setInterval(() => {
                                        p += 1.2
                                        if (p > 95) p = 95
                                        setProcessingProgress(p)
                                        setProcessingStep(steps[Math.floor((p / 100) * steps.length)] || "Finalizing...")
                                    }, 100)

                                        // Store interval ID for cleanup
                                        ; (window as unknown as { processingInterval: NodeJS.Timeout }).processingInterval = interval
                                }}
                                onUploadComplete={(profile) => {
                                    // Clear simulation
                                    clearInterval((window as unknown as { processingInterval: NodeJS.Timeout }).processingInterval)

                                    setRiskProfile(profile)
                                    setScanId('sc-' + Date.now())
                                    setProcessingProgress(100)
                                    setTimeout(() => setView('results'), 500)
                                }}
                            />
                        </div>
                    )}

                    {/* VIEW 2: PROCESSING */}
                    {view === 'processing' && (
                        <div className="max-w-2xl mx-auto py-24 text-center animate-in fade-in duration-500">
                            <div className="relative w-28 h-28 mx-auto mb-10">
                                <div className="absolute inset-0 rounded-full border-b-4 border-indigo-500 animate-spin"></div>
                            </div>
                            <h2 className="text-3xl font-bold mb-4 text-white">Forensic Analysis</h2>
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-6">
                                <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${processingProgress}%` }}></div>
                            </div>
                            <p className="text-sm text-slate-400 animate-pulse">{processingStep}</p>
                        </div>
                    )}

                    {/* VIEW 3: RESULTS */}
                    {view === 'results' && riskProfile && (
                        <div className="animate-in slide-in-from-bottom-4 duration-700">
                            <ScanResultsWithGate scanId={scanId} riskProfile={riskProfile} />
                        </div>
                    )}
                </div>

                {/* HOW IT WORKS SECTION */}
                <HowItWorks />

                {/* COMPARISON SECTION */}
                <SubscriptionComparison />

                {/* CREDIBILITY SECTION */}
                <CredibilitySection />

                {/* FINAL CTA SECTION */}
                <CTASection />

            </main>

            {/* FOOTER */}
            <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-slate-900 text-center space-y-6">
                <p className="text-[9px] text-slate-600 uppercase tracking-[0.2em] leading-loose max-w-3xl mx-auto font-medium">
                    DISCLAIMER: Risk Shield is a diagnostic tool for forensic pattern recognition. This does NOT constitute legal advice.
                    All final compliance decisions should be made by qualified legal counsel. Risk scores are indicators of algorithmic exposure, not definitive legal rulings.
                </p>
                <div className="text-[8px] text-slate-800 uppercase tracking-widest">© 2024 AI Risk Shield Forensic Systems</div>
            </footer>

        </div>
    )
}
