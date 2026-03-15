'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Shield, Menu, X } from 'lucide-react'


export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!mobileMenuOpen) return
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMobileMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [mobileMenuOpen])

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [mobileMenuOpen])

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
                                RiskScore
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

                {/* DESKTOP NAVIGATION */}
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

                {/* MOBILE HAMBURGER BUTTON */}
                <button
                    className="md:hidden flex items-center justify-center w-10 h-10 rounded-[4px] text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-secondary)] transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 top-16 z-50 md:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />

                    {/* Slide-down panel */}
                    <div
                        ref={menuRef}
                        className="relative bg-[var(--rs-bg-surface)] border-b border-[var(--rs-border-primary)] shadow-xl animate-in slide-in-from-top-2 duration-300"
                    >
                        <div className="flex flex-col p-6 gap-1">
                            <Link
                                href="#protocol"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-3 px-4 text-sm font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-secondary)] rounded-lg transition-colors uppercase tracking-widest"
                            >
                                Protocol
                            </Link>
                            <Link
                                href="#benchmarks"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-3 px-4 text-sm font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-secondary)] rounded-lg transition-colors uppercase tracking-widest"
                            >
                                Benchmarks
                            </Link>
                            <Link
                                href="#pricing"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-3 px-4 text-sm font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-secondary)] rounded-lg transition-colors uppercase tracking-widest"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-3 px-4 text-sm font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] hover:bg-[var(--rs-bg-secondary)] rounded-lg transition-colors uppercase tracking-widest"
                            >
                                Login
                            </Link>

                            <div className="mt-3 pt-3 border-t border-[var(--rs-border-primary)]">
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false)
                                        document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
                                    }}
                                    className="w-full bg-[var(--rs-signal)] hover:brightness-110 text-white shadow-[var(--rs-shadow-sm)] px-5 py-3 rounded-[4px] text-sm font-bold uppercase tracking-widest transition-all"
                                >
                                    Scan Your Image Free
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}
