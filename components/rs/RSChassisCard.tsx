"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSChassisCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function RSChassisCard({
    className,
    children,
    ...props
}: RSChassisCardProps) {
    return (
        <div
            className={cn(
                "bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l2)] border border-[var(--rs-border-primary)]/20 relative",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
