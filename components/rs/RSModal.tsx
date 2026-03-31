"use client";

import React, { useEffect, useRef, useCallback } from 'react';
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
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);
    const titleId = title ? 'rs-modal-title' : undefined;

    // Focus trap: keep Tab/Shift+Tab within the modal
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') { onClose(); return; }
        if (e.key !== 'Tab' || !modalRef.current) return;

        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
            // Move focus into the modal
            requestAnimationFrame(() => {
                const first = modalRef.current?.querySelector<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                first?.focus();
            });
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            // Return focus to the element that opened the modal
            previousFocusRef.current?.focus();
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        full: 'max-w-full m-4'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-rs-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
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
                        <h2 id={titleId} className="rs-type-section text-xl text-[var(--rs-text-primary)]">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close dialog"
                            className="w-8 h-8 rounded-full hover:bg-rs-gray-200 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rs-black"
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
