import { RSBackground } from '@/components/rs/RSBackground'
import { Header } from '@/components/layout/Header'
import { LandingClient } from '@/components/landing/LandingClient'
import { MarketExposure } from '@/components/landing/MarketExposure'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PricingSection } from '@/components/landing/SubscriptionComparison'
import { TrustCompliance } from '@/components/landing/CredibilitySection'
import { Footer } from '@/components/landing/Footer'

export default function LandingPage() {
    return (
        <RSBackground variant="standard" className="flex flex-col font-sans min-h-screen overflow-x-hidden selection:bg-[var(--rs-border-primary)] selection:text-[var(--rs-text-primary)]">
            <div className="relative z-10 min-h-screen flex flex-col">
                {/* 1. Global Navigation & Brand */}
                <Header />

                <main className="flex-grow w-full">

                    {/* Interactive Scanner / Hero / Results */}
                    <LandingClient />

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
