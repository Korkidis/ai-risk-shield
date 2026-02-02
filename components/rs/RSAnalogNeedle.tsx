"use client";
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

import { RiskLevel } from './RSRiskScore';

interface RSAnalogNeedleProps {
    value?: number;
    label?: string;
    level?: RiskLevel;
    powered?: boolean;
    size?: number;
    isScanning?: boolean;
    className?: string;
    transparentBg?: boolean;
    fluid?: boolean;
}

// Theme Enforced by Design Lab
const NEEDLE_THEME = {
    surface: "bg-[#EFEEE9]",           // Warm white (Braun)
    surfaceWell: "bg-[var(--rs-bg-well)]", // Dark well
    border: "border-[#D1CDC7]",        // Subtle border
    needle: "bg-[#222222]",            // Needle
    pivot: "bg-[#1A1A1A]",             // Pivot
    text: "text-[#1A1A1A]",            // Text
    shadow: "shadow-[6px_6px_12px_rgba(163,177,198,0.2),-6px_-6px_12px_rgba(255,255,255,0.9),inset_2px_2px_4px_rgba(0,0,0,0.05)]",
    shadowWell: "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)]"
};

export function RSAnalogNeedle({
    value = 0,
    label = "Risk Bias",
    size = 288,
    isScanning = false,
    powered = true,
    transparentBg = false,
    fluid = false,
    className
}: RSAnalogNeedleProps) {
    const [jitter, setJitter] = useState(0);
    const [scanningValue, setScanningValue] = useState(0);
    const [containerWidth, setContainerWidth] = useState(size);
    const containerRef = useRef<HTMLDivElement>(null);

    const BASE_SIZE = 300;

    // Auto-scale logic if fluid
    useEffect(() => {
        if (!fluid || !containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    setContainerWidth(entry.contentRect.width);
                }
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [fluid]);

    const currentSize = fluid ? containerWidth : size;
    const scale = currentSize / BASE_SIZE;

    // Scanning Jitter Effect
    useEffect(() => {
        if (!isScanning) {
            setJitter(0);
            return;
        }

        const interval = setInterval(() => {
            // Aggressive jitter during scan
            setJitter((Math.random() - 0.5) * 15);
            setScanningValue(Math.floor(Math.random() * 100));
        }, 50);
        return () => clearInterval(interval);
    }, [isScanning]);

    // Calculate rotation: 
    // If scanning: Base 50 + jitter
    // If idle/result: Use provided value
    // If unpowered: Fixed at -90 (0 position)
    const effectiveValue = powered ? (isScanning ? (50 + jitter) : value) : 0;
    const rotation = (effectiveValue / 100) * 180 - 90;

    const formattedValue = !powered ? "--" : (isScanning ? Math.floor(scanningValue) : value);

    return (
        <div ref={containerRef} className={cn("flex flex-col items-center gap-3", fluid ? "w-full" : "", className)}>
            {/* Dial Container */}
            <div
                className="relative flex-shrink-0"
                style={{
                    width: fluid ? '100%' : size,
                    height: fluid ? containerWidth : size
                }}
            >
                {/* 
                   We use a wrapper to center the scaled content perfectly.
                   The content thinks it is BASE_SIZE px wide.
                   We assume transform-origin top-left and calculate shifts if needed, 
                   but usually just placing it at 0,0 and scaling is enough if container matches size.
                */}
                <div
                    style={{
                        width: BASE_SIZE,
                        height: BASE_SIZE,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left'
                    }}
                    className={cn(
                        "rounded-full p-2 flex items-center justify-center relative",
                        // transparentBg moves the visual weight to the inner element
                        transparentBg ? "bg-transparent" : "bg-[var(--rs-bg-surface)] border-t border-l border-white/10 border-b-2 border-r-2 border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)]"
                    )}
                >
                    <div className={cn(
                        "w-full h-full rounded-full relative overflow-hidden flex flex-col items-center justify-center border-4",
                        // If transparent, we keep the border/bezel to give it that "inserted instrument" feel (physic vibe)
                        // Enhanced contrast to prevent blending: darker border, stronger bevel light/dark
                        transparentBg
                            ? cn(NEEDLE_THEME.surface, "border-[3px]", NEEDLE_THEME.border, NEEDLE_THEME.shadow)
                            : cn(NEEDLE_THEME.surfaceWell, NEEDLE_THEME.shadowWell, "border-[var(--rs-border-primary)]/50")
                    )}>

                        {/* Uniform Tick Marks */}
                        <div className="absolute inset-5 rounded-full pointer-events-none">
                            {[...Array(21)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 origin-[center_108px]"
                                    style={{ transform: `translateX(-50%) rotate(${i * 9 - 90}deg)` }}
                                >
                                    <div className={cn("w-[2px]", i % 2 === 0 ? 'h-4 bg-[var(--rs-text-primary)]/40' : 'h-2 bg-[var(--rs-text-primary)]/20')} />
                                </div>
                            ))}
                        </div>

                        {/* Hazard Zone - Safety Orange (Arc of 90deg aka 25%) - 12 to 3 o'clock */}
                        <div className="absolute inset-4 rounded-full border-[6px] border-transparent border-r-[var(--rs-signal)] -rotate-45 opacity-80 pointer-events-none" />

                        {/* Physical Needle Shadow - Sharper, closer */}
                        <div
                            className="absolute bottom-1/2 left-1/2 w-[2px] h-[95px] bg-black/10 origin-bottom blur-[1px] transition-transform duration-100"
                            style={{ transform: `translateX(2px) rotate(${rotation + 2}deg)` }}
                        />

                        {/* Instrument Needle - Darker, thinner */}
                        <div
                            className={cn("absolute bottom-1/2 left-1/2 origin-bottom transition-transform duration-100 z-20", NEEDLE_THEME.needle)}
                            style={{
                                width: '2px',
                                height: '100px',
                                transform: `translateX(-50%) rotate(${rotation}deg)`,
                                opacity: 1
                            }}
                        />

                        {/* Machined Pivot Hub - Larger, matte */}
                        <div className={cn("absolute bottom-1/2 left-1/2 w-8 h-8 -translate-x-1/2 translate-y-1/2 rounded-full shadow-[1px_1px_3px_rgba(0,0,0,0.3)] z-30 flex items-center justify-center", NEEDLE_THEME.pivot)}>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#111]" />
                        </div>

                        {/* Digital Readout */}
                        <div className={cn("absolute top-[70%] left-1/2 -translate-x-1/2 font-mono text-3xl font-bold tracking-tighter z-10 w-full text-center opacity-90", NEEDLE_THEME.text)}>
                            {formattedValue}
                        </div>

                        {/* Convex Lens Reflection */}
                        <div className="absolute inset-0 rounded-full z-40 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.05)_0%,transparent_50%)]" />
                    </div>
                </div>
            </div>

            {/* External Label (Underneath) */}
            {
                label && (
                    <span className="text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest text-center">
                        {label}
                    </span>
                )
            }
        </div >
    );
}
