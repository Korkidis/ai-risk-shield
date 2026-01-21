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
        <RSBackground variant="standard" className="flex flex-col font-sans min-h-screen overflow-x-hidden selection:bg-[var(--rs-border-primary)] selection:text-[var(--rs-text-primary)]">
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* NAVIGATION */}
                <Header />

                <main className="flex-grow w-full">

                    {/* VIEW 1: HERO & UPLOAD */}
                    {view === 'upload' && (
                        <div className="w-full flex justify-center pt-16 pb-24 md:pt-32 md:pb-32 px-4 relative">
                            <div className="max-w-4xl w-full flex flex-col items-center gap-12 z-20">
                                {/* Hero Text */}
                                <div className="text-center space-y-6 max-w-2xl mx-auto">
                                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1] text-[var(--rs-text-primary)]">
                                        The Standard for <br />
                                        <span className="text-[var(--rs-signal)]">AI Verification.</span>
                                    </h1>
                                    <p className="text-lg md:text-xl text-[var(--rs-text-secondary)] font-medium leading-relaxed max-w-xl mx-auto">
                                        Detect IP risks, verify C2PA provenance, and ensure brand safety with forensic precision.
                                    </p>
                                </div>

                                {/* Upload Container (Scanner) */}
                                <div className="w-full max-w-2xl">
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
                                    {/* Trust Signals under scanner */}
                                    <div className="flex justify-center gap-8 mt-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                        <div className="h-6 w-20 bg-rs-gray-800 rounded animate-pulse" />
                                        <div className="h-6 w-20 bg-rs-gray-800 rounded animate-pulse" />
                                        <div className="h-6 w-20 bg-rs-gray-800 rounded animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Hero Background Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-rs-gradient-radial-hero opacity-30 pointer-events-none z-0" />
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
