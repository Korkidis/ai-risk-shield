"use client";

import React from 'react';
import { cn } from '@/lib/utils';

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
            className={cn(
                "relative overflow-hidden bg-[#121212] rounded-[8px] border-4 border-rs-gray-300 transition-colors duration-300", // Heavy Bezel
                isDragActive && "border-rs-signal shadow-[0_0_20px_var(--rs-signal)]",
                "aspect-video w-full flex items-center justify-center",
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

            {/* Drag Overlay - Target Lock */}
            {isDragActive && (
                <div className="absolute inset-0 z-40 bg-rs-signal/10 flex items-center justify-center animate-in fade-in duration-200">
                    <div className="w-[80%] h-[80%] border-2 border-rs-signal border-dashed rounded-[12px] animate-pulse" />
                    <div className="absolute text-rs-signal font-mono text-lg font-bold tracking-widest uppercase animate-bounce">
                        DROP ASSET TARGET
                    </div>
                </div>
            )}

            {/* CRT Physical Layers */}
            <div className="absolute inset-0 rs-crt-overlay opacity-30 pointer-events-none z-10" />
            <div className="absolute inset-0 bg-[var(--rs-glass-convex)] opacity-50 z-20 pointer-events-none mix-blend-soft-light" />

            {/* Grid Overlay (Recessed) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50" />

            {/* Target Corners (Camera Viewfinder feel) */}
            <div className={cn("absolute inset-4 border border-rs-white/20 pointer-events-none transition-colors", isDragActive && "border-rs-signal/50")} />
            <div className={cn("absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-rs-white opacity-50 transition-colors", isDragActive && "border-rs-signal opacity-100")} />
            <div className={cn("absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-rs-white opacity-50 transition-colors", isDragActive && "border-rs-signal opacity-100")} />
            <div className={cn("absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-rs-white opacity-50 transition-colors", isDragActive && "border-rs-signal opacity-100")} />
            <div className={cn("absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-rs-white opacity-50 transition-colors", isDragActive && "border-rs-signal opacity-100")} />

            {/* SCANNING LASER EFFECT */}
            {isScanning && (
                <div className="absolute inset-x-0 h-[2px] bg-rs-signal shadow-[0_0_15px_2px_rgba(214,40,40,0.8)] z-20 animate-scan">
                    {/* Trailing gradient */}
                    <div className="absolute bottom-full left-0 right-0 h-12 bg-gradient-to-t from-rs-signal/20 to-transparent" />
                </div>
            )}

            {/* Status Overlay */}
            {isComplete && (
                <div className="absolute inset-0 bg-rs-safe/10 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-rs-black/80 text-rs-safe px-4 py-2 border border-rs-safe rounded-[2px] font-mono text-sm tracking-widest font-bold uppercase shadow-lg">
                        Scan Complete
                    </div>
                </div>
            )}

            {isError && (
                <div className="absolute inset-0 bg-rs-signal/10 flex items-center justify-center backdrop-blur-[2px] animate-in fade-in duration-300">
                    <div className="bg-rs-black/80 text-rs-signal px-4 py-2 border border-rs-signal rounded-[2px] font-mono text-sm tracking-widest font-bold uppercase shadow-lg">
                        Detection Error
                    </div>
                </div>
            )}

            {/* Content Injection (like upload buttons) */}
            <div className="relative z-30">
                {children}
            </div>

        </div>
    );
}
