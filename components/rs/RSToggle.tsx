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
    // Internal state if uncontrolled (simplified for sandbox)
    const [internalChecked, setInternalChecked] = React.useState(checked);
    const isChecked = onCheckedChange ? checked : internalChecked;

    const toggle = () => {
        const newState = !isChecked;
        setInternalChecked(newState);
        onCheckedChange?.(newState);
    };

    const sizes = {
        sm: { track: "w-8 h-4", thumb: "w-3 h-3 translate-x-0.5", thumbChecked: "translate-x-4.5" },
        md: { track: "w-11 h-6", thumb: "w-5 h-5 translate-x-0.5", thumbChecked: "translate-x-5.5" },
    };

    const currentSize = sizes[size];

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isChecked}
            onClick={toggle}
            className={cn(
                "relative inline-flex items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-rs-black focus:ring-offset-2",
                // Track Styles: Deep Socket
                "shadow-[var(--rs-shadow-socket)] border border-black/5",
                isChecked ? "bg-rs-safe" : "bg-rs-gray-300",
                currentSize.track,
                className
            )}
            {...props}
        >
            <span className="sr-only">Toggle setting</span>
            <span
                className={cn(
                    "pointer-events-none rounded-full bg-rs-white shadow-[var(--rs-shadow-hull)] ring-0 transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)",
                    // Thumb Detail
                    "flex items-center justify-center",
                    isChecked ? currentSize.thumbChecked : currentSize.thumb,
                    size === 'md' ? "w-5 h-5" : "w-3 h-3"
                )}
            />
        </button>
    );
}
