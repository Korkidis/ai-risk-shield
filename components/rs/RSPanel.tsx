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
                "bg-rs-white border border-rs-gray-300 rounded-[4px] overflow-hidden",
                "shadow-[var(--rs-shadow-bevel)]", // Subtle physical lift
                className
            )}
            {...props}
        >
            {/* Dossier Header Strip */}
            {(title || metadata || action) && (
                <div className="flex items-center justify-between px-4 py-3 bg-rs-gray-100 border-b border-rs-gray-200">
                    <div className="flex items-center gap-4">
                        {title && (
                            <h3 className="font-sans text-sm font-semibold tracking-tight text-rs-gray-900 uppercase">
                                {title}
                            </h3>
                        )}

                        {/* Metadata Chain */}
                        {metadata && (
                            <div className="hidden sm:flex items-center gap-3 border-l border-rs-gray-300 pl-4 py-0.5">
                                {metadata.map((meta, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 font-mono text-[10px] text-rs-gray-600">
                                        <span className="opacity-50">{meta.label}:</span>
                                        <span className="font-medium text-rs-black">{meta.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {action && <div>{action}</div>}
                </div>
            )}

            {/* Main Evidence Pane */}
            <div className="p-4 relative">
                {/* Optional grid overlay for tech feel */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e5df_1px,transparent_1px),linear-gradient(to_bottom,#e5e5df_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
