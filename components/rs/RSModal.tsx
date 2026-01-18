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
                    "relative bg-[var(--rs-bg-surface)] rounded-[var(--rs-radius-chassis)] shadow-[var(--rs-shadow-l3)] border border-[var(--rs-border-strong)]/20 w-full animate-in zoom-in-95 fade-in duration-300",
                    sizeClasses[size],
                    className
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--rs-border-strong)]/5">
                        <h2 className="rs-type-section text-xl text-[var(--rs-text-primary)]">
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
