'use client'

import { useState } from 'react'
import { RSBackground } from '@/components/rs/RSBackground'
import { FreeUploadContainer } from '@/components/landing/FreeUploadContainer'
import { ScanResultsWithGate } from '@/components/landing/ScanResultsWithGate'
import { Header } from '@/components/layout/Header'
import { PricingSection } from '@/components/landing/SubscriptionComparison'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TrustCompliance } from '@/components/landing/CredibilitySection'
import { MarketExposure } from '@/components/landing/MarketExposure'
import { Footer } from '@/components/landing/Footer'
import { RiskProfile } from '@/lib/gemini-types'

type ViewState = 'upload' | 'results'

export default function LandingPage() {
    const [view, setView] = useState<ViewState>('upload')
    const [scanId, setScanId] = useState<string>('')
    const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null)

    return (
        <RSBackground variant="standard" className="flex flex-col font-sans min-h-screen overflow-x-hidden selection:bg-[var(--rs-border-primary)] selection:text-[var(--rs-text-primary)]">
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* 1. Global Navigation & Brand */}
                <Header />

                <main className="flex-grow w-full">

                    {/* VIEW 1: HERO (CLEARANCE PROTOCOL) & UPLOAD */}
                    {view === 'upload' && (
                        <div className="w-full flex justify-center pt-16 pb-24 md:pt-32 md:pb-32 px-4 relative">
                            <div className="max-w-4xl w-full flex flex-col items-center gap-16 z-20">
                                {/* Hero Text - Forensic Style */}
                                <div className="text-center space-y-8 max-w-4xl mx-auto relative cursor-default">
                                    {/* Top Label - Part Number/Protocol */}
                                    <div className="flex justify-center items-center gap-3 opacity-60">
                                        <div className="h-px w-12 bg-[var(--rs-text-tertiary)]" />
                                        <span className="rs-type-micro text-[var(--rs-text-tertiary)] tracking-[0.2em]">
                                            PROTOCOL: CLEARANCE_V2
                                        </span>
                                        <div className="h-px w-12 bg-[var(--rs-text-tertiary)]" />
                                    </div>

                                    <h1 className="rs-header-bold-italic text-5xl md:text-7xl leading-[0.9] text-[var(--rs-text-primary)]">
                                        Validation for <br />
                                        <span className="text-[var(--rs-signal)]">Responsible AI.</span>
                                    </h1>

                                    <p className="rs-type-body text-lg md:text-xl text-[var(--rs-text-secondary)] max-w-2xl mx-auto">
                                        Forensic-grade IP assessment for AI-generated assets. <br className="hidden md:block" />
                                        <span className="text-[var(--rs-text-primary)] font-medium">Quantify liability. Verify provenance. Unblock workflow.</span>
                                    </p>
                                </div>

                                {/* 2a. The Forensic Analysis Bay (Scanner Widget) */}
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
                                    <div className="flex justify-center gap-8 mt-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                                        <div className="h-4 w-24 bg-[var(--rs-text-tertiary)] rounded animate-pulse opacity-20" />
                                        <div className="h-4 w-24 bg-[var(--rs-text-tertiary)] rounded animate-pulse opacity-20" />
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

                    {/* 3. Market Exposure (Data Section) */}
                    <MarketExposure />

                    {/* 4. Technical Protocol (How It Works) */}
                    <HowItWorks />

                    {/* 5. Clearance Access (Pricing) */}
                    <PricingSection />

                    {/* 6. Trust & Compliance */}
                    <TrustCompliance />

                </main>

                {/* 7. Footer & Legal */}
                <Footer />
            </div>
        </RSBackground>
    )
}
