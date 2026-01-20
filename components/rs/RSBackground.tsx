"use client";

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * RSBackground - The unified substrate system for the application.
 * Consolidates all background patterns into a single, cohesive component.
 * 
 * Variants:
 * - 'standard': Clean Clay/Charcoal surface (Base chassis)
 * - 'microdot': Subtle precision grid (24px) for dashboards
 * - 'technical': Full engineering drafting board (Rulers + Calibration + Grid) for auth/history
 * - 'glass': Forensic glass overlay with noise and blur for scanner viewports
 */

type BackgroundVariant = 'standard' | 'microdot' | 'technical' | 'glass';

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
    ...props
}: RSBackgroundProps) => {

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
                {/* ... existing layers ... */}
                {/* Microdot Pattern (Dots) */}
                {variant === 'microdot' && (
                    <div
                        className="absolute inset-0 opacity-[0.15]"
                        style={{
                            backgroundImage: `radial-gradient(var(--rs-text-tertiary) 0.8px, transparent 0.8px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                )}

                {/* Technical Pattern (Drafting Grid) */}
                {variant === 'technical' && (
                    <>
                        {/* Minor Grid (24px) */}
                        <div
                            className="absolute inset-0 opacity-[0.3]"
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, var(--rs-border-primary) 1px, transparent 1px),
                                    linear-gradient(to bottom, var(--rs-border-primary) 1px, transparent 1px)
                                `,
                                backgroundSize: '24px 24px'
                            }}
                        />
                        {/* Major Grid (120px) */}
                        <div
                            className="absolute inset-0 opacity-[0.4]"
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, var(--rs-border-strong) 1px, transparent 1px),
                                    linear-gradient(to bottom, var(--rs-border-strong) 1px, transparent 1px)
                                `,
                                backgroundSize: '120px 120px'
                            }}
                        />
                    </>
                )}

                {variant === 'standard' && (
                    <div className="absolute inset-0 rs-texture-molded opacity-40 pointer-events-none" />
                )}

                {variant === 'technical' && (
                    <>
                        <div className="absolute top-0 left-0 w-full h-8 border-b border-[var(--rs-border-primary)] flex items-end px-8 gap-0 bg-[var(--rs-bg-surface)]/80 backdrop-blur-sm z-10">
                            {[...Array(60)].map((_, i) => (
                                <div key={`x-${i}`} className="flex-1 flex flex-col items-center">
                                    <div className={`w-[1px] bg-[var(--rs-text-tertiary)] ${i % 10 === 0 ? 'h-4' : i % 5 === 0 ? 'h-2.5' : 'h-1.5'}`} />
                                    {i % 10 === 0 && <span className="text-[7px] font-mono mt-0.5 text-[var(--rs-text-tertiary)] tabular-nums">{i * 10}</span>}
                                </div>
                            ))}
                        </div>

                        <div className="absolute top-0 left-0 h-full w-8 border-r border-[var(--rs-border-primary)] flex flex-col items-end py-8 gap-0 bg-[var(--rs-bg-surface)]/80 backdrop-blur-sm z-10">
                            {[...Array(60)].map((_, i) => (
                                <div key={`y-${i}`} className="flex-1 flex items-center justify-end pr-1">
                                    {i % 10 === 0 && <span className="text-[7px] font-mono mr-1 text-[var(--rs-text-tertiary)] vertical-text tabular-nums">{i * 10}</span>}
                                    <div className={`h-[1px] bg-[var(--rs-text-tertiary)] ${i % 10 === 0 ? 'w-4' : i % 5 === 0 ? 'w-2.5' : 'w-1.5'}`} />
                                </div>
                            ))}
                        </div>

                        <div className="absolute bottom-6 right-6 text-right z-10 hidden sm:block">
                            <div className="flex flex-col items-end gap-1 mb-4 opacity-30">
                                <div className="w-16 h-[1px] bg-[var(--rs-border-strong)]" />
                                <div className="w-8 h-[1px] bg-[var(--rs-border-strong)]" />
                            </div>
                            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--rs-text-tertiary)]">Ref. Doc // Forensic_Deck</div>
                            <div className="text-[7px] font-bold text-[var(--rs-text-tertiary)]/60 mt-1 italic tracking-widest">
                                GRID_RES: 24px // ISO_882_PRIME
                            </div>
                        </div>
                    </>
                )}

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
