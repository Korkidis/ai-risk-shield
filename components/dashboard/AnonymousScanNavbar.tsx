"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Minimal navbar for anonymous users viewing scan results on /dashboard?scan=<id>.
 * Shows brand mark + sign up / login CTAs. No search, notifications, or settings.
 */
export function AnonymousScanNavbar({ className }: { className?: string }) {
    return (
        <header
            className={cn(
                "h-16 border-b border-rs-gray-200 bg-rs-white/80 backdrop-blur-md sticky top-0 z-40 px-6",
                "flex items-center justify-between",
                className
            )}
        >
            {/* Left: Brand */}
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-rs-black flex items-center justify-center rounded-[4px] shadow-sm group-hover:bg-rs-gray-900 transition-colors">
                    <div className="w-4 h-4 border-2 border-rs-white skew-x-[-15deg]" />
                </div>
                <span className="text-sm font-bold text-rs-black tracking-wide uppercase hidden sm:block">
                    AI Risk Shield
                </span>
            </Link>

            {/* Center: Scan Viewer Indicator */}
            <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--rs-safe)] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-rs-gray-500">
                    Scan_Viewer_Active
                </span>
            </div>

            {/* Right: Auth CTAs */}
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="text-xs font-medium text-rs-gray-600 hover:text-rs-black transition-colors uppercase tracking-wider"
                >
                    Log In
                </Link>
                <Link
                    href="/signup"
                    className="text-xs font-bold text-white bg-rs-black hover:bg-rs-gray-900 px-4 py-2 rounded-[4px] uppercase tracking-wider transition-colors shadow-sm"
                >
                    Sign Up Free
                </Link>
            </div>
        </header>
    );
}
