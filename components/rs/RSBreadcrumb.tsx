"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface RSBreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
    items: BreadcrumbItem[];
}

export function RSBreadcrumb({
    className,
    items,
    ...props
}: RSBreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center space-x-2 text-sm font-mono", className)}
            {...props}
        >
            <Link
                href="/dashboard"
                className="text-rs-gray-500 hover:text-rs-black transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <React.Fragment key={index}>
                        <ChevronRight className="w-4 h-4 text-rs-gray-400" />
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="text-rs-gray-500 hover:text-rs-black transition-colors underline decoration-dotted underline-offset-4"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={cn(
                                "font-medium",
                                isLast ? "text-rs-black" : "text-rs-gray-500"
                            )}>
                                {item.label}
                            </span>
                        )}
                    </React.Fragment>
                );
            })}
        </nav>
    );
}
