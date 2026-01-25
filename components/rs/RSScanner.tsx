"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RSGridPattern } from './RSGridPattern';

interface RSScannerProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    status?: string;
    imageUrl?: string; // Preview image
    isDragActive?: boolean;
}

export function RSScanner({
    className,
    active = false,
    status = 'idle',
    imageUrl,
    isDragActive = false,
    children,
    ...props
}: RSScannerProps) {
    const isScanning = active || status === 'scanning';
    const isComplete = status === 'complete';
    const isError = status === 'error';

    return (
        <div
            data-theme="dark"
            className={cn(
                "relative overflow-hidden bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-element)] border border-white/5 transition-colors duration-300",
                isDragActive && "border-[var(--rs-signal)] shadow-[0_0_20px_var(--rs-signal)]",
                "w-full h-full flex items-center justify-center",
                "shadow-[var(--rs-shadow-hull)]",
                className
            )}
            {...props}
        >
            {/* Background / Image Layer */}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Scan Target"
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                        isScanning ? "opacity-60 grayscale-[50%]" : "opacity-90"
                    )}
                />
            )}

            {/* Official Grid Pattern Integration */}
            <div className="absolute inset-0 z-0">
                <RSGridPattern dotOpacity={0.06} gridOpacity={0.04} />
            </div>

            {/* Drag Overlay - Target Lock */}
            {isDragActive && (
                <div className="absolute inset-0 z-40 bg-[var(--rs-signal)]/10 flex items-center justify-center animate-in fade-in duration-200">
                    <div className="w-[80%] h-[80%] border-2 border-[var(--rs-signal)] border-dashed rounded-[12px] animate-pulse" />
                    <div className="absolute text-[var(--rs-signal)] font-mono text-lg font-bold tracking-widest uppercase animate-bounce">
                        DROP ASSET TARGET
                    </div>
                </div>
            )}

            {/* CRT Physical Layers */}
            <div className="absolute inset-0 rs-crt-overlay opacity-30 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[var(--rs-glass-convex)] opacity-50 z-20 pointer-events-none mix-blend-soft-light" />

            {/* Target Corners (Camera Viewfinder feel) */}
            <div className={cn("absolute inset-4 border border-[var(--rs-text-primary)]/10 pointer-events-none transition-colors", isDragActive && "border-[var(--rs-signal)]/50")} />
            <div className={cn("absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--rs-text-primary)]/40 transition-colors", isDragActive && "border-[var(--rs-signal)] opacity-100")} />
            <div className={cn("absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[var(--rs-text-primary)]/40 transition-colors", isDragActive && "border-[var(--rs-signal)] opacity-100")} />
            <div className={cn("absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[var(--rs-text-primary)]/40 transition-colors", isDragActive && "border-[var(--rs-signal)] opacity-100")} />
            <div className={cn("absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--rs-text-primary)]/40 transition-colors", isDragActive && "border-[var(--rs-signal)] opacity-100")} />

            {/* SCANNING LASER EFFECT */}
            {isScanning && (
                <div className="absolute inset-x-0 h-[2px] bg-[var(--rs-signal)] shadow-[0_0_15px_2px_var(--rs-signal)] z-20 animate-scan">
                    {/* Trailing gradient */}
                    <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-[var(--rs-signal)]/20 to-transparent" />
                </div>
            )}

            {/* Status Overlay */}
            {isComplete && (
                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-[var(--rs-bg-surface)]/80 text-emerald-500 px-4 py-2 border border-emerald-500 rounded-[2px] font-mono text-sm tracking-widest font-bold uppercase shadow-lg">
                        Scan Complete
                    </div>
                </div>
            )}

            {isError && (
                <div className="absolute inset-0 bg-[var(--rs-signal)]/10 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-[var(--rs-bg-surface)]/80 text-[var(--rs-signal)] px-4 py-2 border border-[var(--rs-signal)] rounded-[2px] font-mono text-sm tracking-widest font-bold uppercase shadow-lg">
                        Detection Error
                    </div>
                </div>
            )}

            {/* Content Injection (Centered Upload Area) */}
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto w-full h-full flex items-center justify-center">
                    {children}
                </div>
            </div>

        </div>
    );
}
