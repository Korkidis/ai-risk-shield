"use client";

import React from 'react';

import { cn } from '@/lib/utils';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe' | 'unknown';

interface RSRiskBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    level: RiskLevel;
    value?: string | number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function RSRiskBadge({
    className,
    level,
    value,
    label,
    size = 'md',
    ...props
}: RSRiskBadgeProps) {

    // Saul Bass Logic: Shape and Color tension
    // Critical = Red, Safe = Green, Others = Grayscale/Neutral to avoid "Christmas Tree" effect
    const styles = {
        critical: "bg-rs-signal text-rs-white border-rs-signal",
        high: "bg-rs-gray-900 text-rs-white border-rs-gray-900", // Stark Black/White for High
        medium: "bg-rs-gray-200 text-rs-black border-rs-gray-400", // Grey Zone
        low: "bg-rs-white text-rs-gray-600 border-rs-gray-200",
        safe: "bg-rs-safe text-rs-white border-rs-safe",
        unknown: "bg-transparent text-[var(--rs-text-tertiary)] border-dashed border-[var(--rs-border-primary)]",
    };

    const sizeClasses = {
        sm: "h-5 text-[9px] px-1.5",
        md: "h-6 text-[10px] px-2",
        lg: "h-8 text-xs px-3"
    };

    const currentLabel = label || level.toUpperCase();

    return (
        <div
            className={cn(
                "inline-flex items-center justify-center font-sans border",
                "rounded-full transition-colors", // Pill shape for badges
                styles[level],
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {/* Optional Dot for extra tension */}
            {(level === 'critical' || level === 'safe') && (
                <span className={cn(
                    "rounded-full mr-1.5 opacity-80",
                    size === 'sm' ? "w-1 h-1" : "w-1.5 h-1.5 bg-current"
                )} />
            )}

            <span className="font-bold tracking-wider leading-none">
                {currentLabel}
            </span>

            {value && (
                <>
                    <span className="w-px h-2.5 bg-current mx-1.5 opacity-30" />
                    <span className="font-mono leading-none opacity-90">{value}</span>
                </>
            )}
        </div>
    );
}
