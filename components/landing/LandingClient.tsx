'use client'

import { useRouter } from 'next/navigation'
import { FreeUploadContainer } from '@/components/landing/FreeUploadContainer'

export function LandingClient() {
    const router = useRouter()

    return (
        <div className="w-full flex justify-center pt-16 pb-24 md:pt-32 md:pb-32 px-4 relative">
            <div className="max-w-4xl w-full flex flex-col items-center gap-16 z-20">
                {/* Hero Text - Forensic Style */}
                <div className="text-center space-y-8 max-w-4xl mx-auto relative cursor-default">
                    <h1 className="rs-header-bold-italic text-5xl md:text-7xl leading-[0.9] text-[var(--rs-text-primary)]">
                        Know Before <br />
                        You <span className="text-[var(--rs-signal)]">Publish.</span>
                    </h1>

                    <p className="rs-type-body text-lg md:text-xl text-[var(--rs-text-secondary)] max-w-2xl mx-auto">
                        AI content risk, quantified in 15 seconds. <br className="hidden md:block" />
                        <span className="text-[var(--rs-text-primary)] font-medium">IP risk score. Provenance verification. Downloadable evidence for legal.</span>
                    </p>
                </div>

                {/* 2a. The Forensic Analysis Bay (Scanner Widget) */}
                <div className="w-full max-w-2xl">
                    <FreeUploadContainer
                        onUploadStart={() => {
                            // Optional: Scroll to top or prepare UI
                        }}
                        onUploadComplete={(_profile, scanId) => {
                            // Anonymous-safe scan workspace redirect.
                            // Middleware currently allows unauthenticated access for
                            // /dashboard?scan=<id> (session-owned scan viewer mode).
                            router.push(`/dashboard?scan=${scanId}`)
                        }}
                    />
                    {/* Trust Signals under scanner */}
                    <div className="flex justify-center gap-6 mt-8">
                        <span className="rs-type-micro text-[var(--rs-text-tertiary)] tracking-widest">AI-Powered Risk Analysis</span>
                        <span className="text-[var(--rs-text-tertiary)]">&middot;</span>
                        <span className="rs-type-micro text-[var(--rs-text-tertiary)] tracking-widest">C2PA Verified</span>
                    </div>
                </div>
            </div>

            {/* Hero Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-rs-gradient-radial-hero opacity-30 pointer-events-none z-0" />
        </div>
    )
}
