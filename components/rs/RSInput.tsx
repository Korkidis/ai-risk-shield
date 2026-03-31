"use client";

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface RSInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export function RSInput({
    className,
    label,
    error,
    fullWidth = false,
    id: externalId,
    ...props
}: RSInputProps) {
    const internalId = useId();
    const id = externalId || internalId;

    return (
        <div className={cn("flex flex-col gap-1.5 relative", fullWidth ? "w-full" : "w-auto", className)}>
            {label && (
                <label 
                    htmlFor={id} 
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--rs-text-secondary)] pl-1 select-none"
                >
                    {label}
                </label>
            )}
            <input
                id={id}
                className={cn(
                    "h-12 w-full bg-[var(--rs-bg-well)] rounded-[8px]", // MOMA Recessed Well
                    "px-4 text-[var(--rs-text-primary)] text-sm placeholder:text-[var(--rs-text-tertiary)] font-mono",
                    "shadow-[inset_0_2px_6px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)] border border-black/5",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rs-gray-900)] focus-visible:border-transparent transition-all duration-300",
                    "disabled:opacity-50 disabled:shadow-none hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.15)]",
                    error ? "shadow-[inset_0_0_0_2px_var(--rs-signal)] bg-[var(--rs-signal)]/5 border-transparent focus-visible:ring-[var(--rs-signal)]" : ""
                )}
                aria-invalid={!!error}
                aria-errormessage={error ? `${id}-error` : undefined}
                {...props}
            />
            
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, rotateX: -20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -bottom-7 left-0 z-10"
                    >
                        <div 
                            id={`${id}-error`}
                            className="bg-[var(--rs-signal)] text-white px-3 py-1.5 rounded-[4px] shadow-lg flex items-center gap-2 border-t-2 border-[#ff8c66]"
                        >
                            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-widest italic leading-none pt-0.5">
                                {error}
                            </span>
                            {/* Physical connecting tab */}
                            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[var(--rs-signal)] rotate-45 rounded-sm -z-10" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
