"use client";

import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { Search, Bell, Settings } from 'lucide-react';
import { RSAvatar } from './RSAvatar';
import { RSLever } from './RSLever';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from '@/components/ThemeProvider';

interface RSNavbarProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode; // e.g. Breadcrumbs
}

export function RSNavbar({
    className,
    children,
    ...props
}: RSNavbarProps) {
    const [userInitials, setUserInitials] = useState<string | undefined>(undefined);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            const name = user.user_metadata?.full_name || user.email || '';
            if (user.user_metadata?.full_name) {
                const parts = (name as string).split(' ');
                setUserInitials(
                    parts.length >= 2
                        ? `${parts[0][0]}${parts[parts.length - 1][0]}`
                        : (name as string).slice(0, 2)
                );
            } else if (user.email) {
                setUserInitials(user.email.slice(0, 2));
            }
        });
    }, []);

    return (
        <header
            className={cn(
                "h-16 border-b border-rs-gray-200 bg-rs-white/80 backdrop-blur-md sticky top-0 z-40 px-6",
                "flex items-center justify-between transition-colors duration-300",
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

                {/* Dark Mode Toggle — Braun TG 1000 RSLever */}
                <RSLever
                    orientation="horizontal"
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                    className="!gap-0 scale-[0.55] -mx-2"
                />

                <button className="relative text-rs-gray-500 hover:text-rs-black transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-[-2px] w-2 h-2 bg-rs-signal rounded-full border border-rs-white" />
                </button>

                <button className="text-rs-gray-500 hover:text-rs-black transition-colors">
                    <Settings className="w-5 h-5" />
                </button>

                <div className="pl-2">
                    <RSAvatar initials={userInitials} className="cursor-pointer hover:ring-2 hover:ring-rs-black/10 transition-all" />
                </div>
            </div>
        </header>
    );
}
