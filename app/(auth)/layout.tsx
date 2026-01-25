import React from 'react';
import Link from 'next/link';
import { RSChassisCard } from '@/components/rs/RSChassisCard';
import { RSTechnicalDraftingSubstrate } from '@/components/rs/RSTechnicalDraftingSubstrate';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RSTechnicalDraftingSubstrate contentPadding="p-0">
            {/* Calibration Centered Module */}
            <div className="flex flex-col items-center justify-center min-h-screen relative z-10 p-4">
                <div className="w-full max-w-[520px] relative">
                    {/* Focal Crosshairs for Auth Module */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-rs-signal/20" />
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[1px] h-8 bg-rs-signal/20" />

                    <RSChassisCard className="p-8 sm:p-10 shadow-[var(--rs-shadow-socket)]">
                        <div className="pt-2">
                            {children}
                        </div>
                    </RSChassisCard>

                    {/* Bottom Navigation - Detached Schematic Navigation */}
                    <div className="mt-12 flex items-center justify-center gap-8">
                        <Link href="/" className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--rs-text-tertiary)] hover:text-rs-signal transition-all">
                            ← SYSTEM_EXIT
                        </Link>
                        <div className="w-1 h-1 bg-rs-signal/20 rounded-full" />
                        <Link href="/help" className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--rs-text-tertiary)] hover:text-rs-signal transition-all">
                            HELP_MANUAL
                        </Link>
                    </div>
                </div>
            </div>
        </RSTechnicalDraftingSubstrate>
    );
}
