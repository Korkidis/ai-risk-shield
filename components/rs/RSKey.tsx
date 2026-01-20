"use client";

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface RSKeyProps {
    icon?: LucideIcon;
    label?: string;
    active?: boolean;
    onClick?: () => void;
    color?: string;
    className?: string;
}

/**
 * RSKey - Precision tactile membrane key.
 * Inspired by the Braun ET 66 calculator.
 */
export function RSKey({
    icon: Icon,
    label,
    active = false,
    onClick,
    color = "var(--rs-signal)",
    className
}: RSKeyProps) {
    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            <button
                onClick={onClick}
                className={cn(
                    "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-100 border border-white/40",
                    active
                        ? "bg-[var(--rs-gray-900)] text-[var(--rs-white)] translate-y-[2px] shadow-[inset_2px_2px_8px_rgba(0,0,0,0.8)]"
                        : "bg-[var(--rs-gray-50)] text-[var(--rs-text-secondary)] shadow-[var(--rs-shadow-l2)] active:translate-y-[1px] active:shadow-inner"
                )}
            >
                {/* The Convex Lens Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 rounded-2xl pointer-events-none" />

                {Icon && <Icon size={20} className={active ? 'text-white' : 'text-black/40'} />}

                {/* Active Indicator Light */}
                {active && (
                    <div
                        className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                        style={{ backgroundColor: color, color: color }}
                    />
                )}
            </button>
            {label && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)]">
                    {label}
                </span>
            )}
        </div>
    );
}
