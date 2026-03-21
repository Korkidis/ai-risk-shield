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
                type="button"
                onClick={onClick}
                className={cn(
                    "relative w-[72px] h-[72px] rounded-[20px] flex items-center justify-center transition-all duration-300 ease-[var(--rs-ease-spring)]",
                    // The core button shape and depth
                    active
                        ? "bg-[var(--rs-gray-900)] text-[var(--rs-white)] shadow-[inset_0_4px_10px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.1)] border-t border-black"
                        : "bg-[var(--rs-bg-surface)] text-[var(--rs-text-secondary)] shadow-[0_4px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)] border border-black/5 active:scale-95 active:shadow-inner"
                )}
            >
                {/* Embedded LED for active state */}
                {active && (
                    <div
                        className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
                        style={{ 
                            backgroundColor: color, 
                            boxShadow: `0 0 10px ${color}, inset 0 1px 2px rgba(255,255,255,0.5)` 
                        }}
                    />
                )}

                {/* The Icon */}
                {Icon && (
                    <Icon 
                        size={24} 
                        strokeWidth={active ? 2.5 : 2} 
                        className={cn(
                            "transition-colors duration-200",
                            active ? "text-white drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]" : "text-[var(--rs-gray-400)]"
                        )} 
                    />
                )}
                
                {/* Surface Reflection (Convex Bevel) */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-50 mix-blend-overlay" />
            </button>
            
            {/* Detached Label */}
            {label && (
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--rs-text-tertiary)] select-none">
                    {label}
                </span>
            )}
        </div>
    );
}
