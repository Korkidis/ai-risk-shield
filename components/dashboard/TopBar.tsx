'use client'

import { Plus, Bell } from 'lucide-react'

export function DashboardTopBar() {
    return (
        <header className="h-16 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left: Workspace & Search */}
            <div className="flex items-center space-x-6 flex-1">
                {/* Workspace Switcher (Mock) */}
                <div className="flex items-center space-x-2 text-sm text-slate-300 font-medium cursor-pointer hover:text-white transition-colors">
                    <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs">K</div>
                    <span>Korkidis Corp</span>
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>

                <div className="h-6 w-px bg-slate-800"></div>
            </div>

            {/* Right: Actions & status */}
            <div className="flex items-center space-x-4">
                {/* Quota Badge */}
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div className="flex -space-x-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse"></div>
                    </div>
                    <span className="text-xs font-medium text-slate-400">124/500 Scans</span>
                </div>

                <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#020617]"></span>
                </button>

                <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5">
                    <Plus className="w-4 h-4" />
                    <span>New Scan</span>
                </button>
            </div>
        </header>
    )
}
