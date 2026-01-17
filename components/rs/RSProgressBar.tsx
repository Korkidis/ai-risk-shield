"use client";

import { cn } from '@/lib/utils';

interface RSProgressBarProps {
    value?: number; // 0-100 for determinate, undefined for indeterminate
    label?: string;
    variant?: 'default' | 'signal' | 'safe';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function RSProgressBar({
    value,
    label,
    variant = 'default',
    size = 'md',
    className,
}: RSProgressBarProps) {
    const isIndeterminate = value === undefined;
    const clampedValue = value !== undefined ? Math.min(Math.max(value, 0), 100) : 0;

    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    };

    const variantColors = {
        default: 'bg-rs-black',
        signal: 'bg-rs-signal',
        safe: 'bg-rs-safe'
    };

    return (
        <div className={cn("w-full", className)}>
            {label && (
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-rs-gray-600 uppercase tracking-wider">
                        {label}
                    </span>
                    {!isIndeterminate && (
                        <span className="text-xs font-mono font-bold text-rs-black">
                            {clampedValue}%
                        </span>
                    )}
                </div>
            )}

            <div
                className={cn(
                    "w-full bg-rs-gray-200 rounded-full overflow-hidden shadow-[var(--rs-shadow-track)]",
                    sizeClasses[size]
                )}
            >
                {isIndeterminate ? (
                    <div
                        className={cn(
                            "h-full rounded-full animate-pulse",
                            variantColors[variant]
                        )}
                        style={{ width: '40%', animation: 'indeterminate 1.5s ease-in-out infinite' }}
                    />
                ) : (
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-300 ease-out",
                            variantColors[variant]
                        )}
                        style={{ width: `${clampedValue}%` }}
                    />
                )}
            </div>

            <style jsx>{`
        @keyframes indeterminate {
          0% { margin-left: 0%; width: 0%; }
          50% { margin-left: 25%; width: 50%; }
          100% { margin-left: 100%; width: 0%; }
        }
      `}</style>
        </div>
    );
}
