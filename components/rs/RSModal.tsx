"use client";

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface RSModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'full';
    className?: string;
}

export function RSModal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    className,
}: RSModalProps) {

    // Escape key handler
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        full: 'max-w-full m-4'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-rs-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={cn(
                    "relative bg-rs-white rounded-[4px] shadow-2xl border border-rs-gray-300 w-full animate-in zoom-in-95 fade-in duration-200",
                    sizeClasses[size],
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-rs-gray-200">
                        <h2 className="text-lg font-bold tracking-tight text-rs-black">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full hover:bg-rs-gray-200 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5 text-rs-gray-600" />
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
