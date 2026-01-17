"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'default';

interface RSToastProps {
    title: string;
    description?: string;
    variant?: ToastVariant;
    onClose?: () => void;
    className?: string;
}

export function RSToastItem({
    title,
    description,
    variant = 'default',
    onClose,
    className,
}: RSToastProps) {

    const variantStyles = {
        default: "bg-rs-black text-rs-white border-rs-gray-800",
        success: "bg-rs-white text-rs-black border-rs-safe border-l-4",
        error: "bg-rs-white text-rs-black border-rs-signal border-l-4",
    };

    const icons = {
        default: null,
        success: <CheckCircle2 className="w-5 h-5 text-rs-safe" />,
        error: <AlertCircle className="w-5 h-5 text-rs-signal" />,
    };

    return (
        <div
            className={cn(
                "relative rounded-[4px] shadow-lg p-4 w-80 pointer-events-auto flex gap-3 animate-in slide-in-from-right-full duration-300",
                variantStyles[variant],
                className
            )}
        >
            {/* Icon */}
            {icons[variant] && (
                <div className="flex-shrink-0 pt-0.5">
                    {icons[variant]}
                </div>
            )}

            {/* Content */}
            <div className="flex-1">
                <h5 className="font-semibold text-sm leading-none mb-1">{title}</h5>
                {description && (
                    <p className={cn(
                        "text-sm leading-tight",
                        variant === 'default' ? "text-rs-gray-400" : "text-rs-gray-600"
                    )}>
                        {description}
                    </p>
                )}
            </div>

            {/* Close */}
            <button
                onClick={onClose}
                className={cn(
                    "absolute top-2 right-2 p-1 rounded-sm transition-colors",
                    variant === 'default' ? "hover:bg-rs-gray-800 text-rs-gray-500" : "hover:bg-rs-gray-100 text-rs-gray-400 hover:text-rs-black"
                )}
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

// Simple Container for demo purposes
export function RSToastContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
            {children}
        </div>
    );
}
