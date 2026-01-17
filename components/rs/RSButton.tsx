import React from 'react';
import { cn } from '@/lib/utils';

interface RSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function RSButton({
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    ...props
}: RSButtonProps) {
    const baseStyles = cn(
        "inline-flex items-center justify-center font-medium font-sans relative overflow-hidden",
        "transition-all duration-150 ease-out active:scale-[0.98]", // Tactile press scale
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rs-black",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    );

    const variants = {
        // Primary: Tactile Plastic (Off-Black)
        primary: "bg-rs-black text-rs-white shadow-[var(--rs-shadow-bevel)] hover:bg-rs-gray-900 active:shadow-[var(--rs-shadow-pressed)] active:translate-y-[1px]",

        // Secondary: Tactile Paper (White with border)
        secondary: "bg-rs-white text-rs-black border border-rs-gray-200 shadow-[var(--rs-shadow-bevel)] hover:bg-rs-gray-100 hover:border-rs-gray-300 active:shadow-[var(--rs-shadow-pressed)] active:bg-rs-gray-200 active:translate-y-[1px]",

        // Danger: Tactile Signal (Red)
        danger: "bg-rs-signal text-rs-white shadow-[var(--rs-shadow-bevel)] hover:bg-red-700 active:shadow-[var(--rs-shadow-pressed)] active:translate-y-[1px]",

        // Ghost: Flat text for low priority (Settings, etc)
        ghost: "bg-transparent text-rs-gray-600 hover:text-rs-black hover:bg-rs-gray-100 active:bg-rs-gray-200",
    };

    const sizes = {
        sm: "h-8 px-3 text-[10px] uppercase tracking-wider rounded-[2px]",
        md: "h-10 px-6 text-xs uppercase tracking-wide rounded-[4px]", // Stricter radius
        lg: "h-12 px-8 text-sm uppercase tracking-wide rounded-[4px]",
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth ? "w-full" : "",
                className
            )}
            {...props}
        >
            {/* Subtle top gloss for plastic feel */}
            <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10 pointer-events-none" />

            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
        </button>
    );
}
