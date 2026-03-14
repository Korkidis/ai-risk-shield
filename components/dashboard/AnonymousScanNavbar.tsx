"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { RSLever } from '@/components/rs/RSLever';

/**
 * Minimal navbar for anonymous users viewing scan results on /dashboard?scan=<id>.
 * Shows brand mark + sign up / login CTAs. No search, notifications, or settings.
 */
export function AnonymousScanNavbar({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header
            className={cn(
                "h-16 border-b border-[var(--rs-border-primary)] bg-[var(--rs-bg-surface)]/90 backdrop-blur-md sticky top-0 z-40 px-6",
                "flex items-center justify-between",
                className
            )}
        >
            {/* Left: Brand */}
            <Link href="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] flex items-center justify-center rounded-[4px] shadow-sm group-hover:border-[var(--rs-text-primary)] transition-colors">
                    <div className="w-4 h-4 border-2 border-[var(--rs-text-primary)] skew-x-[-15deg]" />
                </div>
                <span className="text-sm font-bold text-[var(--rs-text-primary)] tracking-wide uppercase hidden sm:block">
                    AI Content Risk Score
                </span>
            </Link>

            {/* Center: Scan Viewer Indicator */}
            <div className="hidden md:flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--rs-safe)] animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--rs-text-tertiary)]">
                    Scan_Viewer_Active
                </span>
            </div>

            {/* Right: Auth CTAs */}
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center">
                    <RSLever
                        orientation="horizontal"
                        checked={theme === 'dark'}
                        onCheckedChange={toggleTheme}
                        className="!gap-0 scale-[0.5] -mx-3"
                    />
                </div>
                <Link
                    href="/login"
                    className="text-xs font-medium text-[var(--rs-text-secondary)] hover:text-[var(--rs-text-primary)] transition-colors uppercase tracking-wider"
                >
                    Log In
                </Link>
                <Link
                    href="/signup"
                    className="text-xs font-bold text-[var(--rs-text-primary)] bg-[var(--rs-bg-element)] border border-[var(--rs-border-primary)] hover:border-[var(--rs-text-primary)] px-4 py-2 rounded-[4px] uppercase tracking-wider transition-all shadow-sm"
                >
                    Sign Up Free
                </Link>
            </div>
        </header>
    );
}
