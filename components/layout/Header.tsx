'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export function Header() {
    return (
        <nav className="border-b border-rs-gray-200 bg-rs-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-3 cursor-pointer group">
                    <div className="w-8 h-8 bg-rs-black rounded-[4px] flex items-center justify-center shadow-[var(--rs-shadow-sm)] transition-transform group-hover:scale-105">
                        <ShieldAlert className="w-5 h-5 text-rs-white" strokeWidth={2.5} />
                    </div>
                    <span className="font-bold tracking-tighter text-xl uppercase text-rs-black group-hover:text-rs-gray-700 transition-colors">
                        Risk Shield <span className="text-[10px] text-rs-gray-500 align-top ml-1 font-mono">v2.0</span>
                    </span>
                </Link>

                {/* Center Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href="/#how-it-works" className="text-sm font-medium text-rs-gray-500 hover:text-rs-black transition-colors uppercase tracking-wide text-[11px]">
                        Protocol
                    </Link>
                    <Link href="/#pricing" className="text-sm font-medium text-rs-gray-500 hover:text-rs-black transition-colors uppercase tracking-wide text-[11px]">
                        Pricing
                    </Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-4">
                    <Link href="/login" className="hidden md:block text-[11px] font-bold text-rs-gray-500 hover:text-rs-black uppercase tracking-widest transition-colors">
                        Log In
                    </Link>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-rs-black hover:bg-rs-gray-800 text-rs-white shadow-[var(--rs-shadow-sm)] px-5 py-2 rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all transform hover:-translate-y-0.5"
                    >
                        Start Scan
                    </button>
                </div>
            </div>
        </nav>
    )
}
