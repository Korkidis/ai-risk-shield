
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSTechnicalDraftingSubstrateProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export const RSTechnicalDraftingSubstrate = ({
    children,
    className,
    ...props
}: RSTechnicalDraftingSubstrateProps) => {

    const rulers = (
        <>
            {/* Top Ruler: X-Axis Calibration */}
            <div className="absolute top-0 left-0 w-full h-8 border-b border-[var(--rs-border-primary)] flex items-end px-8 gap-0 bg-[var(--rs-bg-surface)]/50 backdrop-blur-sm z-20 select-none pointer-events-none">
                {[...Array(60)].map((_, i) => (
                    <div key={`x-${i}`} className="flex-1 flex flex-col items-center">
                        <div className={cn(
                            "w-[1px] bg-[var(--rs-text-primary)] opacity-30",
                            i % 10 === 0 ? 'h-4' : i % 5 === 0 ? 'h-2.5' : 'h-1.5'
                        )} />
                        {i % 10 === 0 && (
                            <span className="text-[7px] font-black mt-0.5 text-[var(--rs-text-primary)] opacity-40 tabular-nums">
                                {i * 10}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Left Ruler: Y-Axis Calibration */}
            <div className="absolute top-0 left-0 h-full w-8 border-r border-[var(--rs-border-primary)] flex flex-col items-end py-8 gap-0 bg-[var(--rs-bg-surface)]/50 backdrop-blur-sm z-20 select-none pointer-events-none">
                {[...Array(60)].map((_, i) => (
                    <div key={`y-${i}`} className="flex-1 flex items-center justify-end pr-1 w-full">
                        {i % 10 === 0 && (
                            <span className="text-[7px] font-black mr-1 text-[var(--rs-text-primary)] opacity-40 uppercase vertical-text tabular-nums">
                                {i * 10}
                            </span>
                        )}
                        <div className={cn(
                            "h-[1px] bg-[var(--rs-text-primary)] opacity-30",
                            i % 10 === 0 ? 'w-4' : i % 5 === 0 ? 'w-2.5' : 'w-1.5'
                        )} />
                    </div>
                ))}
            </div>
        </>
    );

    const cornerStamp = (
        <div className="absolute bottom-6 right-6 text-right z-20 pointer-events-none select-none hidden sm:block">
            <div className="flex flex-col items-end gap-1 mb-4 opacity-20">
                <div className="w-16 h-[1px] bg-[var(--rs-text-primary)]" />
                <div className="w-8 h-[1px] bg-[var(--rs-text-primary)]" />
            </div>
            <div className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--rs-text-primary)] opacity-40">Ref. Doc // Forensic_Deck</div>
            <div className="text-[7px] font-bold text-[var(--rs-text-primary)] opacity-20 mt-1 italic tracking-widest">
                UNIT_SCALE: 1px = 0.025mm // GRID_RES: 24px // TOLERANCE: ±0.001
            </div>
            <div className="mt-2 text-[8px] font-black text-[var(--rs-signal)] tracking-tighter uppercase px-2 py-0.5 border border-[var(--rs-signal)]/20 inline-block rounded-sm bg-[var(--rs-signal)]/5">
                Calibration Locked: ISO_882_PRIME
            </div>
        </div>
    );

    const focalPoint = (
        <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-[var(--rs-text-primary)]/5 rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-8 bg-[var(--rs-text-primary)]/5 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-[1px] bg-[var(--rs-text-primary)]/5 pointer-events-none" />
        </>
    );

    return (
        <div
            className={cn(
                "relative min-h-screen w-full bg-[var(--rs-bg-surface)] overflow-hidden flex items-center justify-center group",
                className
            )}
            {...props}
        >
            {/* Layer 1: The Micro-Dot Grid (24px Precision) - 6% Opacity */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.06] z-0"
                style={{
                    backgroundImage: `radial-gradient(circle, var(--rs-text-primary) 1.2px, transparent 1.2px)`,
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Layer 2: The Major Ruler Lines (Every 120px) - 4% Opacity */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--rs-text-primary) 1.5px, transparent 1.5px),
                        linear-gradient(to bottom, var(--rs-text-primary) 1.5px, transparent 1.5px)
                    `,
                    backgroundSize: '120px 120px'
                }}
            />

            {/* Layer 3: Rulers, Stamp, Focal Point */}
            {rulers}
            {cornerStamp}
            {focalPoint}

            {/* Layer 4: Content Layer */}
            <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
                {children}
            </div>

            <style jsx global>{`
                .vertical-text {
                    writing-mode: vertical-rl;
                    transform: rotate(180deg);
                }
                /* Optional: Crosshair cursor for the 'Drafting' feel */
                .cursor-crosshair {
                    cursor: crosshair;
                }
            `}</style>
        </div>
    );
};
