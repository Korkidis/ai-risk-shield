"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    metadata?: { label: string; value: string }[];
    action?: React.ReactNode;
}

export function RSPanel({
    className,
    title,
    metadata,
    action,
    children,
    ...props
}: RSPanelProps) {
    return (
        <div
            className={cn(
                "relative bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)]", // MOMA L2 Extrusion
                "p-8 border border-[var(--rs-border-primary)]/50", // Parting Line Highlight
                className
            )}
            {...props}
        >
            {/* Texture/Noise overlay if desired, but keeping it clean for now */}
            {(title || metadata || action) && (
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {title && (
                            <h3 className="text-sm font-bold text-[var(--rs-text-primary)] uppercase tracking-tighter mb-1">
                                {title}
                            </h3>
                        )}
                        {metadata && (
                            <div className="flex gap-4">
                                {metadata?.map((meta, idx) => (
                                    <span key={idx} className="text-[9px] font-mono text-[var(--rs-text-secondary)] uppercase tracking-widest">
                                        {meta.label}: <span className="text-[var(--rs-text-primary)] font-bold">{meta.value}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    );
}
