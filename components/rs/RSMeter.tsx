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
    };

    return (
        <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
            {/* The Tactile Track */}
            <div className="relative h-4 w-full bg-rs-gray-200 rounded-sm overflow-hidden shadow-[var(--rs-shadow-track)]">
                {/* The Fill */}
                <div
                    className={cn("h-full transition-all duration-500 ease-out", fillColors[level])}
                    style={{ width: `${value}%` }}
                />

                {/* Glass/Gloss Overlay for 'Meter' feel */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            </div>

            {/* Scale / Hash Marks */}
            {showTicks && (
                <div className="flex justify-between w-full px-[1px]">
                    {[0, 25, 50, 75, 100].map((tick) => (
                        <div key={tick} className="flex flex-col items-center gap-1">
                            <div className="w-px h-1.5 bg-rs-gray-400" /> {/* Tick Mark */}
                            <span className="font-mono text-[9px] text-rs-gray-500">{tick}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
