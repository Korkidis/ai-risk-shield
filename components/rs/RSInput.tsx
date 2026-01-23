"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export function RSInput({
    className,
    label,
    error,
    fullWidth = false,
    ...props
}: RSInputProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto", className)}>
            {label && (
                <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--rs-text-secondary)] pl-1">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "h-12 w-full rs-well rounded-[var(--rs-radius-element)]", // MOMA Recessed Well
                    "px-4 text-[var(--rs-text-primary)] text-sm placeholder:text-[var(--rs-text-tertiary)] font-mono",
                    "focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300",
                    "disabled:opacity-50 disabled:shadow-none",
                    error ? "shadow-[inset_0_0_0_2px_var(--rs-signal)] bg-rs-signal/5" : ""
                )}
                {...props}
            />
            {error && (
                <span className="text-[10px] font-medium text-rs-signal tracking-wide ml-1">
                    {error}
                </span>
            )}
        </div>
    );
}
