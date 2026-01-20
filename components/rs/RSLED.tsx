"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from './RSRiskScore';

interface RSLEDProps extends React.HTMLAttributes<HTMLDivElement> {
    level?: RiskLevel | 'off' | 'active';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isBlinking?: boolean;
    label?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * RSLED - A Dieter Rams-inspired indicator lamp.
 * Designed to feel like a recessed physical diode in a machined aluminum faceplate.
 * Features clinical light diffusion and a surgical aesthetic.
 */
export function RSLED({
    level = 'off',
    size = 'md',
    isBlinking = false,
    label,
    labelPosition = 'right',
    className,
    ...props
}: RSLEDProps) {

    // Size mapping (Precision diameters)
    const sizes = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    // Color definitions (Clinical Signal Palette mapped to RS Tokens)
    const colors = {
        safe: {
            base: 'bg-[var(--rs-safe)]',
            glow: 'shadow-[0_0_12px_rgba(0,103,66,0.6),inset_0_1px_2px_rgba(255,255,255,0.5)]',
            lens: 'from-emerald-400 to-emerald-600'
        },
        warning: {
            base: 'bg-[var(--rs-indicator)]', // Using indicator for warning/amber
            glow: 'shadow-[0_0_12px_rgba(58,99,81,0.6),inset_0_1px_2px_rgba(255,255,255,0.5)]',
            lens: 'from-[var(--rs-indicator)] to-[var(--rs-gray-500)]'
        },
        critical: {
            base: 'bg-[var(--rs-signal)]',
            glow: 'shadow-[0_0_15px_rgba(255,79,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.6)]',
            lens: 'from-orange-400 to-orange-600'
        },
        active: {
            base: 'bg-[var(--rs-signal)]',
            glow: 'shadow-[0_0_12px_rgba(255,79,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.5)]',
            lens: 'from-orange-400 to-orange-600'
        },
        info: {
            base: 'bg-[var(--rs-info)]',
            glow: 'shadow-[0_0_12px_rgba(0,95,135,0.6),inset_0_1px_2px_rgba(255,255,255,0.5)]',
            lens: 'from-sky-400 to-sky-600'
        },
        // Risk levels normalization
        high: { base: 'bg-[var(--rs-signal)]', glow: 'shadow-[0_0_12px_rgba(255,79,0,0.6)]', lens: 'from-orange-400 to-orange-600' },
        medium: { base: 'bg-[var(--rs-indicator)]', glow: 'shadow-[0_0_12px_rgba(58,99,81,0.6)]', lens: 'from-[var(--rs-indicator)] to-[var(--rs-gray-500)]' },
        low: { base: 'bg-[var(--rs-info)]', glow: 'shadow-[0_0_12px_rgba(0,95,135,0.6)]', lens: 'from-sky-400 to-sky-600' },
        off: {
            base: 'bg-[var(--rs-gray-800)]',
            glow: 'shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]',
            lens: 'from-[var(--rs-gray-700)] to-[var(--rs-gray-900)]'
        }
    };

    const currentTheme = colors[level as keyof typeof colors] || colors.off;
    const isOff = level === 'off';

    // The LED Component
    const ledElement = (
        <div className={cn("relative flex items-center justify-center shrink-0", sizes[size], className)} {...props}>
            {/* Machined Housing (The "Hole") */}
            <div className="absolute inset-[-2px] rounded-full bg-gradient-to-b from-black/20 to-white/10 shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)] border border-black/5" />

            {/* The Lens (Physical Body) */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full transition-all duration-200 overflow-hidden",
                    !isOff ? currentTheme.base : "bg-neutral-800",
                    !isOff && currentTheme.glow,
                    isBlinking && !isOff && "animate-[pulse_0.4s_infinite_alternate]"
                )}
            >
                {/* Fresnel / Glass Effect */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-40",
                    currentTheme.lens
                )} />

                {/* Surface Specular Highlight */}
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-white/40 blur-[0.5px]" />

                {/* Internal Diffuser (Center Glow) */}
                {!isOff && (
                    <div className="absolute inset-[20%] rounded-full bg-white/30 blur-[2px]" />
                )}
            </div>
        </div>
    );

    if (!label) return ledElement;

    // Label handling (Modernist Utility)
    const containerClasses = {
        top: 'flex-col-reverse items-center',
        bottom: 'flex-col items-center',
        left: 'flex-row-reverse items-center',
        right: 'flex-row items-center'
    };

    return (
        <div className={cn("flex gap-2.5", containerClasses[labelPosition])}>
            {ledElement}
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--rs-text-tertiary)] select-none leading-none pt-0.5">
                {label}
            </span>
        </div>
    );
}
