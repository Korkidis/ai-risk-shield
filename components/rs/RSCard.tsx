import React from 'react';
import { cn } from '@/lib/utils';

interface RSCardProps extends React.HTMLAttributes<HTMLDivElement> {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    variant?: 'default' | 'bordered' | 'elevated';
}

export function RSCard({
    className,
    header,
    footer,
    variant = 'default',
    children,
    ...props
}: RSCardProps) {

    const variantClasses = {
        default: 'bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-strong)]/20', // L2 Extruded Panel
        bordered: 'bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[inset_0_0_0_2px_var(--rs-border-primary)]', // Flat with Border
        elevated: 'bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l3)]' // L3 High Extrusion
    };

    return (
        <div
            className={cn(
                "overflow-visible relative", // Allow shadows to spill (removed overflow-hidden unless needed)
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {header && (
                <div className="px-6 py-4 border-b border-[var(--rs-border-strong)]/10">
                    {typeof header === 'string' ? (
                        <h3 className="rs-type-label text-[var(--rs-text-primary)]">
                            {header}
                        </h3>
                    ) : (
                        header
                    )}
                </div>
            )}

            <div className="px-6 py-6">
                {children}
            </div>

            {footer && (
                <div className="px-6 py-4 border-t border-[var(--rs-border-strong)]/10 rounded-b-[var(--rs-radius-container)]">
                    {footer}
                </div>
            )}
        </div>
    );
}
