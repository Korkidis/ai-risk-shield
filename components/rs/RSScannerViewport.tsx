"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RSScanner } from './RSScanner';

interface RSScannerViewportProps extends React.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    status?: 'idle' | 'scanning' | 'complete' | 'error';
    imageUrl?: string;
    label?: string;
}

export function RSScannerViewport({
    className,
    active = true,
    status = 'scanning',
    imageUrl = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
    label = "Scanner_Beam_Active",
    ...props
}: RSScannerViewportProps) {
    return (
        <div
            className={cn(
                "bg-[#121212] border-[10px] border-[var(--rs-border-primary)] rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] relative overflow-hidden h-[450px] flex flex-col",
                className
            )}
            {...props}
        >
            <div className="absolute inset-0 rs-glass-analyzed z-20 pointer-events-none" />
            <div className="p-6 bg-rs-black border-b border-rs-gray-800 flex justify-between items-center z-10 relative">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-2 h-2 rounded-full",
                        active ? "bg-rs-signal animate-pulse" : "bg-gray-600"
                    )} />
                    <span className="text-[10px] font-mono text-rs-signal font-bold tracking-widest uppercase">{label}</span>
                </div>
                <span className="text-[9px] font-mono text-white/30 uppercase italic">Ref: 00-1-A</span>
            </div>
            <div className="p-10 flex-1 flex flex-col justify-center relative z-10">
                <RSScanner
                    active={active}
                    status={status}
                    imageUrl={imageUrl}
                />
            </div>
        </div>
    );
}
