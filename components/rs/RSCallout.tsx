"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface RSCalloutProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'info' | 'warning' | 'success' | 'danger';
    title?: string;
}

export function RSCallout({
    className,
    variant = 'info',
    title,
    children,
    ...props
}: RSCalloutProps) {

    const styles = {
        info: {
            container: "bg-rs-gray-100 border-rs-gray-300 text-rs-black",
            icon: <Info className="w-5 h-5 text-rs-gray-600" />
        },
        warning: {
            container: "bg-orange-50 border-orange-200 text-orange-900", // Soft warning
            icon: <AlertCircle className="w-5 h-5 text-orange-600" />
        },
        success: {
            container: "bg-emerald-50 border-emerald-200 text-emerald-900",
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        },
        danger: {
            container: "bg-red-50 border-red-200 text-red-900",
            icon: <AlertCircle className="w-5 h-5 text-red-600" />
        }
    };

    const currentStyle = styles[variant];

    return (
        <div
            className={cn(
                "flex gap-4 p-4 rounded-[4px] border border-l-4",
                currentStyle.container,
                className
            )}
            {...props}
        >
            <div className="flex-shrink-0 pt-0.5">
                {currentStyle.icon}
            </div>

            <div className="space-y-1">
                {title && (
                    <h4 className="font-sans font-semibold text-sm tracking-tight">
                        {title}
                    </h4>
                )}
                <div className="text-sm opacity-90 leading-relaxed">
                    {children}
                </div>
            </div>
        </div>
    );
}
