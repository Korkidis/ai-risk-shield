'use client'

import { useState } from 'react'
import { RSBackground } from '@/components/rs/RSBackground'
import { FreeUploadContainer } from '@/components/landing/FreeUploadContainer'
import { ScanResultsWithGate } from '@/components/landing/ScanResultsWithGate'
import { Header } from '@/components/layout/Header'
import { SubscriptionComparison } from '@/components/landing/SubscriptionComparison'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CredibilitySection } from '@/components/landing/CredibilitySection'
import { CTASection } from '@/components/landing/CTASection'
import { RiskProfile } from '@/lib/gemini'
import { Footer } from '@/components/landing/Footer'

type ViewState = 'upload' | 'results'

export default function LandingPage() {
    const [view, setView] = useState<ViewState>('upload')
    const [scanId, setScanId] = useState<string>('')
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)

    return (
        <RSBackground variant="standard" fullScreen className="flex flex-col font-sans overflow-x-hidden selection:bg-[var(--rs-border-primary)] selection:text-[var(--rs-text-primary)]">
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* NAVIGATION */}
                <Header />

                <main className="flex-grow w-full">

                    {/* VIEW 1: UPLOAD & PROCESSING */}
                    {view === 'upload' && (
                        <div className="animate-in fade-in duration-500 w-full">
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
                        <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 animate-in slide-in-from-bottom-4 duration-700">
                            <ScanResultsWithGate scanId={scanId} riskProfile={riskProfile} />
                        </div>
                    )}

                    {/* HOW IT WORKS SECTION */}
                    <HowItWorks />

                    {/* COMPARISON SECTION */}
                    <SubscriptionComparison />

                    {/* CREDIBILITY SECTION */}
                    <CredibilitySection />

                    {/* FINAL CTA SECTION */}
                    <CTASection />

                </main>

                {/* SYSTEM FOOTER */}
                <Footer />
            </div>
        </RSBackground>
    )
}
