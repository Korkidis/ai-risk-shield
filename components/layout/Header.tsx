'use client'

import Link from 'next/link'
import { Shield, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
    return (
        <nav className="border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)] backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* BRAND & POWER STATES */}
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-8 h-8 bg-black rounded-[4px] flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                            <Shield className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="font-bold tracking-tighter text-lg uppercase text-[var(--rs-text-primary)]">
                                RiskShield
                            </span>
                        </div>
                    </Link>

                    {/* Power States Indicator */}
                    <div className="hidden md:flex items-center gap-4 pl-8 border-l border-[var(--rs-border-primary)] h-8">
                        <div className="flex items-center gap-2 opacity-100">
                            <div className="w-2 h-2 rounded-full bg-[var(--rs-safe)] shadow-[0_0_8px_var(--rs-safe)] animate-pulse" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-primary)]">Online</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-30">
                            <div className="w-2 h-2 rounded-full bg-[var(--rs-gray-500)]" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-secondary)]">Standby</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-30">
                            <div className="w-2 h-2 rounded-full bg-[var(--rs-signal)]" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-secondary)]">Alert</span>
                        </div>
                    </div>
                </div>

                {/* NAVIGATION */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#protocol" className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Protocol
                    </Link>
                    <Link href="#benchmarks" className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Benchmarks
                    </Link>
                    <Link href="#pricing" className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Pricing
                    </Link>
                    <Link href="/login" className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Login
                    </Link>

                    <button
                        onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                        className="bg-[var(--rs-signal)] hover:brightness-110 text-white shadow-[var(--rs-shadow-sm)] px-5 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        Free Scan
                    </button>
                </div>
            </div>
        </nav>
    )
}
