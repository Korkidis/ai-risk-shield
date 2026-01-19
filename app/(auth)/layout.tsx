import React from 'react';
import { RSDraftingBoard } from '@/components/rs/RSDraftingBoard';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RSDraftingBoard className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md relative z-10">
                {/* Header / Logo Area */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 bg-[var(--rs-bg-surface)] px-4 py-2 rounded-[var(--rs-radius-small)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l1)]">
                        <div className="w-8 h-8 bg-rs-black rounded-[4px] flex items-center justify-center shadow-lg">
                            <Shield className="w-5 h-5 text-rs-white" />
                        </div>
                        <span className="font-bold tracking-tighter text-xl uppercase text-rs-black">
                            Risk Shield <span className="text-[10px] text-rs-text-tertiary align-top ml-1 font-mono">ID_VERIFICATION</span>
                        </span>
                    </Link>
                </div>

                {/* Main Auth Container */}
                <div className="bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] overflow-hidden relative">
                    {/* Decorative Top Bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-rs-black via-rs-signal to-rs-black" />

                    <div className="p-8">
                        {children}
                    </div>

                    {/* Footer Warning */}
                    <div className="bg-[var(--rs-bg-well)] px-8 py-3 border-t border-[var(--rs-border-primary)] flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rs-signal animate-pulse" />
                        <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                            Secure Encrypted Connection // TLS 1.3
                        </span>
                    </div>
                </div>

                {/* Bottom Links */}
                <div className="mt-8 text-center space-x-6">
                    <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-rs-black transition-colors">
                        ← Back_To_Safety
                    </Link>
                    <Link href="/help" className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)] hover:text-rs-black transition-colors">
                        Help_Center
                    </Link>
                </div>
            </div>
        </RSDraftingBoard>
    );
}
