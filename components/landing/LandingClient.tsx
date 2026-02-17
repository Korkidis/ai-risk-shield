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
                        onUploadComplete={(_profile, scanId) => {
                            // Redirect to dashboard scan viewer — the real product experience
                            router.push(`/dashboard?scan=${scanId}`)
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
    )
}
