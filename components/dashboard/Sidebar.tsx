'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutGrid,
    ShieldAlert,
    HelpCircle
} from 'lucide-react'

const navItems = [
    { name: 'Scans & Reports', href: '/dashboard/scans-reports', icon: LayoutGrid },
    { name: 'Guidelines/Policies', href: '/dashboard/brand-guidelines', icon: ShieldAlert },
    { name: 'Help & Docs', href: '/dashboard/help', icon: HelpCircle },
]

export function DashboardSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-[#020617] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Logo Area */}
            <Link href="/dashboard" className="h-16 flex items-center px-6 border-b border-slate-800 hover:bg-slate-900/50 transition-colors">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">R</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight">Risk Shield</span>
                </div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-indigo-600/10 text-indigo-400'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
