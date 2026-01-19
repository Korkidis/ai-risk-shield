"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSRockerSwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label?: string;
}

/**
 * RSRockerSwitch - A heavy-duty, large-scale mechanical rocker.
 * Prioritizes physical presence and shading over digital indicators.
 * Inspired by clinical Braun T1000/T3 equipment.
 */
export function RSRockerSwitch({
    className,
    checked = false,
    onCheckedChange,
    label,
    ...props
}: RSRockerSwitchProps) {
    const [internalChecked, setInternalChecked] = React.useState(checked);
    const isChecked = onCheckedChange ? checked : internalChecked;

    const toggle = () => {
        const newState = !isChecked;
        setInternalChecked(newState);
        onCheckedChange?.(newState);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <button
                type="button"
                role="switch"
                aria-checked={isChecked}
                onClick={toggle}
                className={cn(
                    "group relative w-32 h-20 transition-all duration-300",
                    "bg-[var(--rs-gray-400)] p-1.5 rounded-xl block cursor-pointer",
                    "shadow-[inset_0_6px_10px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.3)] border border-black/20",
                    className
                )}
                {...props}
            >
                {/* The Heavy-Duty Rocker Body (Braun ABS Plastic) */}
                <div
                    className={cn(
                        "relative w-full h-full rounded-lg transition-all duration-500 ease-[var(--rs-ease-spring)]",
                        "bg-[var(--rs-white)] overflow-hidden rs-texture-molded",
                        isChecked
                            ? "shadow-[inset_-2px_-2px_4px_rgba(255,255,255,1),inset_2px_2px_4px_rgba(0,0,0,0.1),8px_8px_16px_rgba(0,0,0,0.25)]"
                            : "shadow-[inset_2px_2px_4px_rgba(255,255,255,1),inset_-1px_-1px_2px_rgba(0,0,0,0.1),-8px_8px_16px_rgba(0,0,0,0.25)]"
                    )}
                    style={{
                        transform: isChecked ? 'perspective(300px) rotateY(25deg)' : 'perspective(300px) rotateY(-25deg)',
                    }}
                >
                    {/* Directional Shading (Occlusion) */}
                    <div className={cn(
                        "absolute inset-0 transition-opacity duration-500",
                        isChecked
                            ? "bg-gradient-to-r from-black/20 via-black/5 to-transparent"
                            : "bg-gradient-to-l from-black/20 via-black/5 to-transparent"
                    )} />

                    {/* Mechanical Parting Lines (Left/Right) */}
                    <div className="absolute left-0 inset-y-0 w-px bg-white/50" />
                    <div className="absolute right-0 inset-y-0 w-px bg-black/10" />

                    {/* Surface Specular Highlight */}
                    <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 h-[80%] w-px bg-white/20 transition-all duration-500",
                        isChecked ? "left-4 opacity-100" : "right-4 opacity-100"
                    )} />
                </div>

                {/* Precision Bezel / Molder Housing */}
                <div className="absolute inset-0 border border-black/20 rounded-[inherit] pointer-events-none" />
            </button>

            {label && (
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[var(--rs-text-primary)] select-none rs-etched leading-tight">
                    {label}
                </span>
            )}
        </div>
    );
}
