'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ChevronDown, CreditCard, User, LogOut, Zap } from 'lucide-react'
import { logout } from '@/app/(auth)/actions'

export function DashboardTopBar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])

    const handleSignOut = async () => {
        await logout()
    }

    return (
        <header className="h-16 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left: Workspace & Search */}
            <div className="flex items-center space-x-6 flex-1">
                {/* Workspace Switcher Dropdown */}
                <div ref={dropdownRef} className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 text-sm text-slate-300 font-medium hover:text-white transition-colors group"
                    >
                        <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs group-hover:bg-slate-700 transition-colors">K</div>
                        <div className="flex flex-col items-start">
                            <span className="font-semibold">Korkidis Corp</span>
                            <span className="text-[10px] text-slate-500">john@korkidis.com</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            {/* Workspace Switcher Section */}
                            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                    Switch Workspace
                                </div>
                                <button className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors text-sm font-medium">
                                    <Plus className="w-4 h-4" />
                                    <span>Add New Company</span>
                                </button>
                                <Link
                                    href="/dashboard/billing"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-1 mt-2 px-3 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    <Zap className="w-3 h-3" />
                                    Upgrade
                                </Link>
                            </div>

                            {/* Menu Items */}
                            <div className="py-2">
                                <Link
                                    href="/dashboard/billing"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <CreditCard className="w-4 h-4 text-slate-500" />
                                    <span>Usage & Billing</span>
                                </Link>
                                <Link
                                    href="/dashboard/account"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4 text-slate-500" />
                                    <span>Account Settings</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-6 w-px bg-slate-800"></div>
            </div>

            {/* Right: Actions & status */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Scan</span>
                </button>
            </div>
        </header>
    )
}
