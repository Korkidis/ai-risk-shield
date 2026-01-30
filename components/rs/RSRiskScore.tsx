"use client";

import React from 'react';

import { cn } from '@/lib/utils';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe' | 'warning' | 'info';

interface RSRiskScoreProps extends React.HTMLAttributes<HTMLDivElement> {
    score: number; // 0-100
    level: RiskLevel;
    label?: string;
    trend?: 'up' | 'down' | 'stable';
    size?: 'sm' | 'md' | 'lg';
    minimal?: boolean;
}

export function RSRiskScore({
    className,
    score,
    level,
    label = "Risk Score",
    trend,
    size = 'md',
    minimal = false,
    ...props
}: RSRiskScoreProps) {

    const colors = {
        critical: "text-rs-signal",
        high: "text-rs-gray-900",
        medium: "text-rs-gray-600",
        low: "text-rs-gray-500",
        safe: "text-rs-safe",
        warning: "text-rs-signal",
        info: "text-[#005F87]",
    };

    const sizeClasses = {
        sm: "text-4xl",
        md: "text-8xl",
        lg: "text-9xl"
    };

    return (
        <div className={cn("flex flex-col items-start gap-1", className)} {...props}>
            {!minimal && (
                <span className="font-mono text-xs text-rs-gray-500 uppercase tracking-widest pl-1">
                    {label}
                </span>
            )}

            <div className="flex items-baseline gap-2 relative">
                <span
                    className={cn(
                        "font-sans font-bold tracking-tighter leading-none -ml-1",
                        sizeClasses[size],
                        colors[level]
                    )}
                >
                    {score}
                </span>

                {!minimal && (
                    <div className="flex flex-col items-start gap-0.5">
                        <span className="text-2xl font-light text-rs-gray-400">/100</span>
                        {trend && (
                            <span className={cn(
                                "text-xs font-mono font-bold px-1.5 py-0.5 rounded-sm",
                                trend === 'up' ? "bg-rs-gray-200 text-rs-black" : "bg-transparent text-rs-gray-400"
                            )}>
                                {trend === 'up' ? '▲ RISING' : trend === 'down' ? '▼ FALLING' : 'STABLE'}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
