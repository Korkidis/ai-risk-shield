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
        <div className={cn("flex flex-col gap-1.5", fullWidth ? "w-full" : "w-auto")}>
            {label && (
                <label className="text-xs font-medium text-rs-gray-700 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "h-10 px-3 bg-rs-white border border-rs-gray-300 rounded-[2px]",
                    "text-rs-black text-sm placeholder:text-rs-gray-400",
                    "focus:outline-none focus:border-rs-black focus:ring-1 focus:ring-rs-black",
                    "font-sans focus:font-mono transition-all duration-200", // Monospace focus for data entry feel
                    "disabled:opacity-50 disabled:bg-rs-gray-100",
                    error ? "border-rs-signal focus:border-rs-signal focus:ring-rs-signal" : "",
                    className
                )}
                {...props}
            />
            {error && (
                <span className="text-[10px] font-medium text-rs-signal tracking-wide">
                    {error}
                </span>
            )}
        </div>
    );
}
