'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield } from 'lucide-react'


export function Header() {
    const pathname = usePathname()
    const router = useRouter()
    const isHome = pathname === '/'
    const protocolHref = isHome ? '#protocol' : '/#protocol'
    const riskIndexHref = isHome ? '#benchmarks' : '/#benchmarks'
    const pricingHref = isHome ? '#pricing' : '/#pricing'

    const handleFreeScan = () => {
        if (!isHome) {
            router.push('/#scanner')
            return
        }

        const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]')

        if (fileInput) {
            fileInput.click()
            return
        }

        document.getElementById('scanner')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

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
                                AI Content Risk Score
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
                    <Link href={protocolHref} className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Protocol
                    </Link>
                    <Link href={riskIndexHref} className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Guidance
                    </Link>
                    <Link href="/ai-content-governance" className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Governance
                    </Link>
                    <Link href={pricingHref} className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Pricing
                    </Link>
                    <Link href="/login" className="text-[11px] font-bold text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-widest">
                        Login
                    </Link>

                    <button
                        onClick={handleFreeScan}
                        className="bg-[var(--rs-signal)] hover:brightness-110 text-white shadow-[var(--rs-shadow-sm)] px-5 py-2 rounded-[2px] text-[10px] font-bold uppercase tracking-widest transition-all"
                    >
                        Free Scan
                    </button>
                </div>
            </div>
        </nav>
    )
}
