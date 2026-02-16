"use client";

import React from 'react';

import { cn } from '@/lib/utils';
import { Search, Bell, Settings } from 'lucide-react';
import { RSAvatar } from './RSAvatar';

interface RSNavbarProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode; // e.g. Breadcrumbs
}

export function RSNavbar({
    className,
    children,
    ...props
}: RSNavbarProps) {
    return (
        <header
            className={cn(
                "h-16 border-b border-rs-gray-200 bg-rs-white/80 backdrop-blur-md sticky top-0 z-40 px-6",
                "flex items-center justify-between",
                className
            )}
            {...props}
        >
            {/* Left: Brand / Context */}
            <div className="flex items-center gap-6">
                <div className="w-8 h-8 bg-rs-black flex items-center justify-center rounded-[4px] shadow-sm">
                    <div className="w-4 h-4 border-2 border-rs-white skew-x-[-15deg]" />
                </div>

                {/* Context Injection (Breadcrumbs usually) */}
                {children && (
                    <div className="hidden md:block pl-6 border-l border-rs-gray-200 h-6 flex items-center">
                        {children}
                    </div>
                )}
            </div>

            {/* Right: Controls & User */}
            <div className="flex items-center gap-4">
                {/* Search Trigger */}
                <div className="relative hidden md:block group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rs-gray-500 group-hover:text-rs-black transition-colors" />
                    <input
                        type="text"
                        placeholder="Search case ID..."
                        className="pl-9 pr-4 py-1.5 bg-rs-gray-100 border border-rs-gray-200 rounded-[4px] text-sm focus:outline-none focus:ring-1 focus:ring-rs-black focus:bg-rs-white transition-all w-64 text-rs-black placeholder:text-rs-gray-400"
                    />
                </div>

                <div className="h-6 w-px bg-rs-gray-200 mx-2" />

                <button className="relative text-rs-gray-500 hover:text-rs-black transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-[-2px] w-2 h-2 bg-rs-signal rounded-full border border-rs-white" />
                </button>

                <button className="text-rs-gray-500 hover:text-rs-black transition-colors">
                    <Settings className="w-5 h-5" />
                </button>

                <div className="pl-2">
                    <RSAvatar className="cursor-pointer hover:ring-2 hover:ring-rs-black/10 transition-all" />
                </div>
            </div>
        </header>
    );
}
