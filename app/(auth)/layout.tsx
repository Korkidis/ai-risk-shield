import React from 'react';
import { RSTechnicalDraftingSubstrate } from '@/components/rs/RSTechnicalDraftingSubstrate';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RSTechnicalDraftingSubstrate className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-[420px] relative z-10 group">

                {/* Header Block - "Engraved" Plate */}
                <div className="mb-6 text-center relative">
                    <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)] rounded-[4px]">
                        <div className="w-6 h-6 bg-[var(--rs-black)] rounded-[2px] flex items-center justify-center shadow-md">
                            <Shield className="w-3.5 h-3.5 text-white" />
                        </div>
                        <div className="flex flex-col items-start -space-y-0.5">
                            <span className="text-lg font-black tracking-tighter text-[var(--rs-black)] uppercase leading-none">
                                RISK SHIELD
                            </span>
                            <span className="text-[9px] font-mono font-bold text-[var(--rs-text-tertiary)] uppercase tracking-widest leading-none ml-0.5">
                                ID_VERIFICATION
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Machine Faceplate */}
                <div className={cn(
                    "relative overflow-hidden",
                    "bg-[var(--rs-bg-surface)]", // Matte Clay Base
                    "rounded-[32px]", // Heavy rounding
                    "border border-[var(--rs-white)]/40", // High-light edge
                    "shadow-2xl" // Deep drop shadow
                )}>
                    {/* Parting Line (Inset Border) */}
                    <div className="absolute inset-0 rounded-[32px] border border-[var(--rs-black)]/5 pointer-events-none" />

                    {/* Top "Vent/Grip" Texture */}
                    <div className="h-1.5 w-full bg-[var(--rs-bg-well)]/30 border-b border-[var(--rs-black)]/5" />

                    <div className="p-8 pt-6">
                        {children}
                    </div>

                    {/* Footer - Integrated Machine Label */}
                    <div className="bg-[var(--rs-bg-well)]/30 px-8 py-4 border-t border-[var(--rs-border-primary)] flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--rs-signal)] animate-pulse shadow-[0_0_4px_var(--rs-signal)]" />
                        <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-[0.2em] font-bold opacity-60">
                            SECURE ENCRYPTED CONNECTION // TLS 1.3
                        </span>
                    </div>
                </div>

                {/* Bottom Navigation - Subtler */}
                <div className="mt-8 flex items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300">
                    <Link href="/" className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] transition-colors">
                        ← BACK_TO_SAFETY
                    </Link>
                    <div className="w-[1px] h-3 bg-[var(--rs-border-strong)] opacity-30" />
                    <Link href="/help" className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] transition-colors">
                        HELP_CENTER
                    </Link>
                </div>
            </div>
        </RSTechnicalDraftingSubstrate>
    );
}
