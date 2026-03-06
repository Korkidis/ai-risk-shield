"use client";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface RSVUMeterProps {
    value?: number;
    label?: string;
    powered?: boolean;
    isScanning?: boolean;
    className?: string;
    description?: string; // For the tooltip
}

export function RSVUMeter({
    value = 0,
    label = "Risk Bias",
    isScanning = false,
    powered = true,
    className,
    description = "Risk assessment methodology based on AI confidence scoring."
}: RSVUMeterProps) {
    const [jitterValue, setJitterValue] = useState(0);

    // Number of LED segments
    const SEGMENTS = 20;

    // Scanning Jitter Effect
    useEffect(() => {
        if (!isScanning) return;
        const interval = setInterval(() => {
            setJitterValue(Math.floor(Math.random() * 100));
        }, 80);
        return () => clearInterval(interval);
    }, [isScanning]);

    const displayValue = powered ? (isScanning ? jitterValue : value) : 0;

    // Determine how many segments are lit (0 to 20)
    const litSegments = Math.round((displayValue / 100) * SEGMENTS);

    // Braun-style colors map based on segment index (0 is bottom, 19 is top)
    const getSegmentColor = (index: number, isLit: boolean) => {
        if (!isLit) return "bg-[var(--rs-bg-well)] border-[var(--rs-border-primary)]/20 shadow-inner";

        // Color gradient: Bottom 50% Safe (Green), Next 25% Warning (Orange/Yellow), Top 25% Critical (Red)
        if (index < SEGMENTS * 0.5) return "bg-[var(--rs-safe)] shadow-[0_0_8px_var(--rs-safe)] border-[var(--rs-safe)] text-transparent";
        if (index < SEGMENTS * 0.8) return "bg-[var(--rs-warning)] shadow-[0_0_8px_var(--rs-warning)] border-[var(--rs-warning)] text-transparent";
        return "bg-[var(--rs-signal)] shadow-[0_0_8px_var(--rs-signal)] border-[var(--rs-signal)] text-transparent";
    };

    return (
        <div className={cn("flex flex-col items-center gap-3", className)}>
            {/* Tooltip & Label Header */}
            {label && (
                <div className="flex items-center gap-1.5 justify-center mb-1 group relative">
                    <span className="text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest text-center">
                        {label}
                    </span>

                    {/* Tooltip trigger - styled like a mechanical rivet */}
                    <div className="w-3.5 h-3.5 rounded-full border border-[var(--rs-border-primary)] bg-[var(--rs-bg-well)] flex items-center justify-center cursor-help shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
                        <Info className="w-2 h-2 text-[var(--rs-gray-500)]" />
                    </div>

                    {/* Tooltip Popover (CSS-based hover for simplicity) */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-[10px] font-mono leading-tight bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] shadow-lg rounded-[var(--rs-radius-container)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left">
                        {description}
                    </div>
                </div>
            )}

            {/* VU Meter Container - Mechanical Housing */}
            <div className="p-2 pb-3 pt-3 rounded bg-[var(--rs-bg-surface)] border-2 border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)] flex flex-col items-center">

                {/* Segments Stack (rendered top to bottom) */}
                <div className="flex flex-col-reverse gap-[3px] w-6 h-[140px] md:h-[160px] p-1 bg-[var(--rs-gray-900)] rounded-sm shadow-inner border border-black/50">
                    {[...Array(SEGMENTS)].map((_, i) => {
                        const isLit = powered && i < litSegments;
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 w-full rounded-[1px] border transition-colors duration-100",
                                    getSegmentColor(i, isLit)
                                )}
                            />
                        );
                    })}
                </div>

                {/* Digital Readout at bottom of meter */}
                <div className={cn(
                    "mt-3 font-mono text-xl font-bold tracking-tighter w-full text-center px-1 rounded bg-[var(--rs-bg-well)] border border-black/20 shadow-inner",
                    !powered ? "text-[var(--rs-gray-600)]" : "text-[var(--rs-text-primary)]"
                )}>
                    {!powered ? "--" : displayValue}
                </div>
            </div>
        </div>
    );
}
