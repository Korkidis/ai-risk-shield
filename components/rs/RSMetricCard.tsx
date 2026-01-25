"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RSMeter } from './RSMeter';

interface RSMetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    value: number | string;
    unit?: string;
    level?: 'safe' | 'warning' | 'critical' | 'info';
    showMeter?: boolean;
}

export function RSMetricCard({
    className,
    label,
    value,
    unit,
    level = 'safe',
    showMeter = true,
    ...props
}: RSMetricCardProps) {

    // Map level to text color class
    const levelColorMap = {
        safe: 'text-rs-safe',
        warning: 'text-rs-warning',
        critical: 'text-rs-signal',
        info: 'text-rs-info',
    };

    return (
        <div
            className={cn(
                "bg-[var(--rs-bg-surface)] p-6 rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l1)]",
                className
            )}
            {...props}
        >
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">{label}</span>
                <span className={cn(
                    "text-[10px] font-mono",
                    levelColorMap[level] || 'text-[var(--rs-text-primary)]'
                )}>
                    {value}{unit}
                </span>
            </div>
            {showMeter && typeof value === 'number' && (
                <RSMeter value={value} level={level} />
            )}
        </div>
    );
}
