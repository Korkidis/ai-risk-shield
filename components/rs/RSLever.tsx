"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RSLeverProps {
    label?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    className?: string;
    orientation?: 'vertical' | 'horizontal';
}

/**
 * RSLever - High-fidelity heavy-throw vertical/horizontal switch.
 * Inspired by the Braun TG 1000 tape recorder.
 */
export function RSLever({
    label,
    checked = false,
    onCheckedChange,
    className,
    orientation = 'vertical'
}: RSLeverProps) {
    const [internalChecked, setInternalChecked] = useState(checked);
    const isChecked = onCheckedChange ? checked : internalChecked;

    const toggle = () => {
        const next = !isChecked;
        setInternalChecked(next);
        onCheckedChange?.(next);
    };

    const isVertical = orientation === 'vertical';

    return (
        <div className={cn(
            "flex gap-4 group select-none",
            isVertical ? "flex-col items-center" : "items-center",
            className
        )}>
            {/* The Track/Well */}
            <div
                onClick={toggle}
                className={cn(
                    "relative bg-[var(--rs-gray-200)] rounded-2xl cursor-pointer flex p-1.5 overflow-hidden border border-[var(--rs-gray-300)]",
                    "shadow-[var(--rs-shadow-l1)]",
                    isVertical ? "w-14 h-24 flex-col justify-between" : "w-24 h-14 justify-between"
                )}
            >
                {/* The Lever Arm */}
                <div
                    className={cn(
                        "rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] relative flex items-center justify-center",
                        isVertical ? "w-full h-1/2 flex-col" : "h-full w-1/2",
                        isChecked
                            ? isVertical
                                ? "translate-y-full bg-[var(--rs-gray-900)] shadow-[0_-2px_4px_rgba(0,0,0,0.5)]"
                                : "translate-x-full bg-[var(--rs-gray-900)] shadow-[-2px_0_4px_rgba(0,0,0,0.5)]"
                            : isVertical
                                ? "translate-y-0 bg-[var(--rs-gray-50)] shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_white]"
                                : "translate-x-0 bg-[var(--rs-gray-50)] shadow-[4px_0_8px_rgba(0,0,0,0.2),inset_1px_0_1px_white]"
                    )}
                >
                    {/* Machined Dimple (Only visible in 'off' state as a recess, or as a detail) */}
                    {!isChecked && (
                        <div className="w-4 h-4 rounded-full bg-black/5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] border border-black/5 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                        </div>
                    )}

                    {/* State Indicator Signal Strip (Braun Aesthetic) */}
                    <div className={cn(
                        "absolute transition-all duration-500",
                        isVertical
                            ? "bottom-0 h-1 left-1/4 right-1/4"
                            : "right-0 w-1.5 top-1/4 bottom-1/4", // Signal strip on the edge
                        isChecked
                            ? "bg-[var(--rs-signal)] opacity-100 shadow-[0_0_12px_var(--rs-signal)]"
                            : "opacity-0"
                    )} />

                    {/* Dark State Label Tension (Manual Override) */}
                    {isChecked && (
                        <div className="w-1 h-4 bg-white/10 rounded-full blur-[0.5px]" />
                    )}
                </div>
            </div>
            {label && (
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em] text-black/30 italic whitespace-nowrap",
                    !isVertical && "mt-1"
                )}>
                    {label}
                </span>
            )}
        </div>
    );
}
