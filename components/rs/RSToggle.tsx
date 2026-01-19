"use client";

import React from 'react';

import { cn } from '@/lib/utils';

interface RSToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    size?: 'sm' | 'md';
}

export function RSToggle({
    className,
    checked = false,
    onCheckedChange,
    size = 'md',
    ...props
}: RSToggleProps) {
    const [internalChecked, setInternalChecked] = React.useState(checked);
    const isChecked = onCheckedChange ? checked : internalChecked;

    const toggle = () => {
        const newState = !isChecked;
        setInternalChecked(newState);
        onCheckedChange?.(newState);
    };

    const sizes = {
        sm: { track: "w-8 h-4.5", thumb: "w-3.5 h-3.5", translate: "translate-x-3.5" },
        md: { track: "w-11 h-6", thumb: "w-5 h-5", translate: "translate-x-5" },
    };

    const currentSize = sizes[size];

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            onClick={toggle}
            className={cn(
                "relative inline-flex shrink-0 cursor-pointer items-center transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rs-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                "bg-[var(--rs-gray-200)] border border-black/10 rounded-full",
                "shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]",
                currentSize.track,
                className
            )}
            {...props}
        >
            <span
                className={cn(
                    "pointer-events-none block rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_rgba(255,255,255,1)] transition-transform duration-300 ease-[var(--rs-ease-spring)]",
                    "flex items-center justify-center relative",
                    isChecked ? currentSize.translate : "translate-x-0.5",
                    currentSize.thumb
                )}
            >
                {/* Internal Signal Dot (Braun Style) */}
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    isChecked ? "bg-[var(--rs-safe)] opacity-100" : "bg-[var(--rs-gray-300)] opacity-40 shrink-0"
                )} />
            </span>
        </button>
    );
}
