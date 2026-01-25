import React from 'react';
import Link from 'next/link';
import { RSChassisCard } from '@/components/rs/RSChassisCard';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#E5E1DA] rs-texture-molded relative overflow-hidden">
            {/* Ambient Lighting/Shadows for 'Room' Feel */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4)_0%,rgba(0,0,0,0.1)_100%)]" />

            <div className="w-full max-w-[520px] relative z-10 group">

                <RSChassisCard className="p-8 sm:p-10">
                    <div className="pt-2">
                        {children}
                    </div>
                </RSChassisCard>

                {/* Bottom Navigation - Clean & detached */}
                <div className="mt-8 flex items-center justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity duration-300">
                    <Link href="/" className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] transition-colors">
                        ← RETURN_TO_SYSTEM
                    </Link>
                    <div className="w-[1px] h-3 bg-[var(--rs-border-strong)] opacity-30" />
                    <Link href="/help" className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] transition-colors">
                        HELP_CENTER
                    </Link>
                </div>
            </div>
        </div>
    );
}
