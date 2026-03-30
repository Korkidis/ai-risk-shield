"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ShieldAlert, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export type ToastVariant = 'success' | 'error' | 'default';

interface ToastData {
    id: string;
    title: string;
    description?: string;
    variant: ToastVariant;
    action?: { label: string; onClick: () => void };
}

interface ToastContextType {
    toast: (props: Omit<ToastData, 'id'>) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within an RSToastProvider");
    }
    return context;
}

/**
 * The physical Rams/Bass Toast Item.
 * Designed to look like a hardware readout/ticker slip.
 */
interface RSToastItemProps {
    data?: ToastData;
    onDismiss?: () => void;
    className?: string;
    title?: string;
    description?: string;
    variant?: ToastVariant;
}

export function RSToastItem({ data, onDismiss, className, title, description, variant }: RSToastItemProps) {
    // Backwards compatibility for Design Lab
    const finalData = data || { id: 'legacy', title: title || '', description, variant: variant || 'default' };

    // Rams aesthetics: matte finishes, inset borders, mechanical tracking
    const variantStyles: Record<string, string> = {
        default: "bg-[var(--rs-bg-surface)] border-black/10 text-[var(--rs-text-primary)] shadow-[0_8px_20px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.7)]",
        success: "bg-[var(--rs-bg-surface)] border-l-[var(--rs-safe)] text-[var(--rs-text-primary)] shadow-[0_8px_20px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.7)]",
        error: "bg-[var(--rs-bg-inverse)] border-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
    };

    const icons = {
        default: <Info className="w-4 h-4 text-[var(--rs-gray-500)]" />,
        success: <CheckCircle2 className="w-4 h-4 text-[var(--rs-safe)] drop-shadow-[0_0_8px_var(--rs-safe)]" />,
        error: <ShieldAlert className="w-4 h-4 text-[var(--rs-signal)] drop-shadow-[0_0_8px_var(--rs-signal)]" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={cn(
                "relative flex gap-4 p-4 w-[340px] pointer-events-auto rounded-[12px] border",
                variantStyles[finalData.variant],
                className
            )}
        >
            <div className="flex-shrink-0 pt-1">
                {icons[finalData.variant as keyof typeof icons]}
            </div>

            <div className="flex-1 space-y-1">
                <h5 className={cn(
                    "font-bold text-[11px] uppercase tracking-widest leading-none",
                    finalData.variant === 'error' ? 'text-[var(--rs-signal)]' : 'text-[var(--rs-text-primary)]'
                )}>
                    {finalData.title}
                </h5>
                {finalData.description && (
                    <p className={cn(
                        "rs-type-body text-xs",
                        finalData.variant === 'error' ? 'text-white/80' : 'text-[var(--rs-text-secondary)]'
                    )}>
                        {finalData.description}
                    </p>
                )}
                
                {finalData.action && (
                    <button
                        onClick={() => { finalData.action?.onClick(); onDismiss?.(); }}
                        className={cn(
                            "mt-3 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors active:scale-95",
                            finalData.variant === 'error'
                                ? "bg-white/10 text-white hover:bg-white/20"
                                : "bg-black/5 text-black hover:bg-black/10"
                        )}
                    >
                        {finalData.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={() => onDismiss?.()}
                className="absolute top-3 right-3 p-1 rounded-sm opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
            >
                <X className="w-3 h-3" />
            </button>
        </motion.div>
    );
}

export function RSToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((props: Omit<ToastData, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { ...props, id }]);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            dismiss(id);
        }, 5000);
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            {/* The global container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <RSToastItem key={t.id} data={t} onDismiss={() => dismiss(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
