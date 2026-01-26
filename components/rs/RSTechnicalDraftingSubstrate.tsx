
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSTechnicalDraftingSubstrateProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    contentPadding?: string;
    showRulers?: boolean;
    showWatermark?: boolean;
    showFocalPoint?: boolean;
    showGridLines?: boolean;
}

export const RSTechnicalDraftingSubstrate = ({
    children,
    className,
    contentClassName,
    contentPadding = "p-12", // Default to 120px offset (grid major)
    showRulers = true,
    showWatermark = true,
    showFocalPoint = true,
    showGridLines = true,
    ...props
}: RSTechnicalDraftingSubstrateProps) => {

    const focalPoint = showFocalPoint ? (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-20">
            <div className="w-4 h-4 border border-[var(--rs-text-primary)] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-8 bg-[var(--rs-text-primary)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] bg-[var(--rs-text-primary)]" />
        </div>
    ) : null;

    return (
        <div
            className={cn(
                "relative h-full w-full bg-[var(--rs-bg-surface)] overflow-auto group scrollbar-hide",
                className
            )}
            {...props}
        >
            {/* Layer 1: The Micro-Dot Grid (24px Precision) */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.06] z-0"
                style={{
                    backgroundImage: `radial-gradient(circle, var(--rs-text-primary) 1.2px, transparent 1.2px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Layer 2: The Major Ruler Lines (Every 120px) */}
            {showGridLines && (
                <div
                    className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, var(--rs-text-primary) 1.5px, transparent 1.5px),
                            linear-gradient(to bottom, var(--rs-text-primary) 1.5px, transparent 1.5px)
                        `,
                        backgroundSize: '120px 120px'
                    }}
                />
            )}

            {/* Layer 3: Focal Point Only */}
            {focalPoint}

            {/* Layer 4: Content Layer - Rigid Top-Left Alignment */}
            <div className={cn(
                "relative z-10 w-full h-full",
                contentPadding,
                contentClassName
            )}>
                {children}
            </div>

            <style jsx global>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                /* Optional: Crosshair cursor for the 'Drafting' feel */
                .cursor-crosshair {
                    cursor: crosshair;
                }
            `}</style>
        </div>
    );
};
