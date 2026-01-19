"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from './RSRiskScore'; // Reuse type

interface RSMeterProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number; // 0-100
    level: RiskLevel;
    showTicks?: boolean;
}

export function RSMeter({
    className,
    value,
    level,
    showTicks = true,
    ...props
}: RSMeterProps) {

    const fillColors = {
        critical: "bg-rs-signal",
        high: "bg-rs-gray-800",
        medium: "bg-rs-gray-500",
        low: "bg-rs-gray-400",
        safe: "bg-rs-safe",
        warning: "bg-rs-signal", // Re-using signal for consistency, could use hex if needed
        info: "bg-rs-info",
    };

    return (
        <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
            {/* The Tactile Track */}
            <div className="relative h-2 w-full bg-[var(--rs-bg-element)] rounded-full overflow-hidden shadow-inner border border-[var(--rs-border-primary)]/50">
                {/* The Fill */}
                <div
                    className={cn("h-full transition-all duration-1000 ease-out", fillColors[level])}
                    style={{ width: `${value}%` }}
                />
            </div>

            {/* Scale / Hash Marks */}
            {showTicks && (
                <div className="flex justify-between w-full px-[1px]">
                    {[0, 25, 50, 75, 100].map((tick) => (
                        <div key={tick} className="flex flex-col items-center gap-1">
                            <div className="w-px h-1.5 bg-[var(--rs-border-primary)]" /> {/* Tick Mark */}
                            <span className="font-mono text-[9px] text-[var(--rs-text-tertiary)]">{tick}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
