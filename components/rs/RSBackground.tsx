"use client";

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * RSBackground - The unified substrate system for the application.
 * Consolidates all background patterns into a single, cohesive component.
 * 
 * Variants:
 * - 'standard': Clean Clay/Charcoal surface (Base chassis)


 * - 'glass': Forensic glass overlay with noise and blur for scanner viewports
 */

type BackgroundVariant = 'standard' | 'glass' | 'technical';

interface RSBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BackgroundVariant;
    className?: string;
    children?: React.ReactNode;
    fullScreen?: boolean; // If true, acts as a fixed full-screen background
}

export const RSBackground = ({
    variant = 'standard',
    className,
    children,
    fullScreen = false,
    showGrid = true,
    ...props
}: RSBackgroundProps & { showGrid?: boolean }) => {

    const baseStyles = "bg-[var(--rs-bg-surface)] text-[var(--rs-text-primary)] transition-colors duration-300";

    return (
        <div
            className={cn(
                baseStyles,
                fullScreen ? "fixed inset-0 min-h-screen w-full -z-50" : "relative overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Background Layers Wrapper */}
            <div className={cn("absolute inset-0 pointer-events-none z-0", fullScreen ? "" : "rounded-[inherit]")}>

                {/* Variant: Standard (Molded Chassis Texture) */}
                {variant === 'standard' && (
                    <div className="absolute inset-0 rs-texture-molded opacity-40 pointer-events-none" />
                )}

                {/* Variant: Technical (Drafting Grid) */}
                {variant === 'technical' && (
                    <>
                        <div className="absolute inset-0 rs-texture-molded opacity-20 pointer-events-none" />
                        {/* Micro-Dot Grid */}
                        <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage: `radial-gradient(circle, var(--rs-text-primary) 1.2px, transparent 1.2px)`,
                                backgroundSize: '24px 24px'
                            }}
                        />
                        {/* Major Grid Lines */}
                        {showGrid && (
                            <div
                                className="absolute inset-0 opacity-[0.04]"
                                style={{
                                    backgroundImage: `
                                        linear-gradient(to right, var(--rs-text-primary) 1.5px, transparent 1.5px),
                                        linear-gradient(to bottom, var(--rs-text-primary) 1.5px, transparent 1.5px)
                                    `,
                                    backgroundSize: '120px 120px'
                                }}
                            />
                        )}
                    </>
                )}

                {/* Variant: Glass (Forensic Overlay) */}
                {variant === 'glass' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md border border-white/10 group">
                        <div className="absolute inset-0 bg-[var(--rs-glass-convex)] opacity-50 transition-opacity duration-700 group-hover:opacity-70" />
                        <div
                            className="absolute inset-0 opacity-[0.06] mix-blend-overlay pointer-events-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Content Layer */}
            <div className="relative z-10 h-full">
                {children}
            </div>

            <style jsx global>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                }
            `}</style>
        </div>
    );
};
