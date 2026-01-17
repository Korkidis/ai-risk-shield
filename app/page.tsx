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

type ViewState = 'upload' | 'results'

export default function LandingPage() {
    const [view, setView] = useState<ViewState>('upload')
    const [scanId, setScanId] = useState<string>('')
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)

    return (
        <div className="min-h-screen flex flex-col font-sans overflow-x-hidden bg-rs-white text-rs-black selection:bg-rs-gray-200">

            {/* NAVIGATION */}
            <Header />

            <main className="flex-grow w-full">

                <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
                    {/* VIEW 1: UPLOAD & PROCESSING (Encapsulated) */}
                    {view === 'upload' && (
                        <div className="animate-in fade-in duration-500">
                            <FreeUploadContainer
                                onUploadStart={() => {
                                    // Optional: Scroll to top or prepare UI
                                }}
                                onUploadComplete={(profile) => {
                                    setRiskProfile(profile)
                                    setScanId('sc-' + Date.now())
                                    // Clean transition to results
                                    setTimeout(() => setView('results'), 300)
                                }}
                            />
                        </div>
                    )}

                    {/* VIEW 2: RESULTS */}
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
            <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-rs-gray-200 text-center space-y-6">
                <p className="text-[10px] text-rs-gray-500 uppercase tracking-widest leading-loose max-w-3xl mx-auto font-medium">
                    DISCLAIMER: Risk Shield is a diagnostic tool for forensic pattern recognition. This does NOT constitute legal advice.
                    All final compliance decisions should be made by qualified legal counsel. Risk scores are indicators of algorithmic exposure, not definitive legal rulings.
                </p>
                <div className="text-[10px] text-rs-gray-400 uppercase tracking-widest">© 2024 AI Risk Shield Forensic Systems</div>
            </footer>

        </div>
    )
}
