"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSSectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    sectionNumber: string;
    title: string;
}

export function RSSectionHeader({
    className,
    sectionNumber,
    title,
    ...props
}: RSSectionHeaderProps) {
    return (
        <div
            className={cn(
                "flex items-center gap-6 mb-12",
                className
            )}
            {...props}
        >
            <span className="font-mono text-xs text-[#9A9691]">{sectionNumber}</span>
            <h2 className="text-2xl font-black tracking-tight uppercase">{title}</h2>
            {/* Divider line intentionally removed per user request */}
        </div>
    );
}
