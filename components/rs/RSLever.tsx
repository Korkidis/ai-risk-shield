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
                    "relative bg-[#D9D5CD] rounded-2xl cursor-pointer flex p-1.5 overflow-hidden border border-[#C7C3BB]",
                    "shadow-[inset_2px_2px_8px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]",
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
                                ? "translate-y-full bg-[#1A1A1A] shadow-[0_-2px_4px_rgba(0,0,0,0.5)]"
                                : "translate-x-full bg-[#1A1A1A] shadow-[-2px_0_4px_rgba(0,0,0,0.5)]"
                            : isVertical
                                ? "translate-y-0 bg-[#E5E1DD] shadow-[0_4px_8px_rgba(0,0,0,0.2),inset_0_1px_1px_white]"
                                : "translate-x-0 bg-[#E5E1DD] shadow-[4px_0_8px_rgba(0,0,0,0.2),inset_1px_0_1px_white]"
                    )}
                >
                    {/* Machined Dimple */}
                    <div className={cn(
                        "w-3 h-3 rounded-full shadow-inner",
                        isChecked ? "bg-black" : "bg-[#D1CDC7]"
                    )} />

                    {/* State Indicator LED (Internal) */}
                    <div className={cn(
                        "absolute rounded-full blur-[1px] transition-opacity duration-500",
                        isVertical ? "-bottom-1 w-6 h-1" : "-right-1 w-1 h-6",
                        isChecked ? "bg-[#FF4F00] opacity-100 shadow-[0_0_8px_#FF4F00]" : "opacity-0"
                    )} />
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
