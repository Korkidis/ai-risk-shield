"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export function RSTextarea({
    className,
    label,
    error,
    fullWidth = false,
    ...props
}: RSTextareaProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto")}>
            {label && (
                <label className="text-sm font-medium text-rs-gray-700 font-sans tracking-tight">
                    {label}
                </label>
            )}

            <textarea
                className={cn(
                    "bg-rs-white border border-rs-gray-300 rounded-[4px] px-3 py-2 text-sm text-rs-black font-sans placeholder:text-rs-gray-400 shadow-sm transition-all duration-150 resize-y min-h-[80px]",
                    "hover:border-rs-gray-400 hover:bg-rs-gray-50/50",
                    "focus:outline-none focus:ring-2 focus:ring-rs-black focus:border-rs-black focus:bg-rs-white",
                    error && "border-rs-signal focus:ring-rs-signal",
                    className
                )}
                {...props}
            />

            {error && (
                <p className="text-xs text-rs-signal font-mono animate-in slide-in-from-top-1 duration-200">
                    ⚠ {error}
                </p>
            )}
        </div>
    );
}
