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
        default: 'bg-rs-white border border-rs-gray-200',
        bordered: 'bg-rs-white border-2 border-rs-black',
        elevated: 'bg-rs-white border border-rs-gray-200 shadow-[var(--rs-shadow-bevel)]'
    };

    return (
        <div
            className={cn(
                "rounded-[4px] overflow-hidden",
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {header && (
                <div className="px-5 py-3 border-b border-rs-gray-200 bg-rs-gray-50/50">
                    {typeof header === 'string' ? (
                        <h3 className="font-mono text-xs font-medium uppercase tracking-wider text-rs-gray-500">
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
                <div className="px-6 py-4 border-t border-rs-gray-200 bg-rs-gray-50">
                    {footer}
                </div>
            )}
        </div>
    );
}
