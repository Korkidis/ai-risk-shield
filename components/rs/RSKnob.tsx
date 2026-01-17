"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Omit the standard onChange to avoid conflicts
interface RSKnobProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    min?: number;
    max?: number;
    value?: number;
    onChange?: (value: number) => void;
    label?: string;
    size?: number;
}

export function RSKnob({
    className,
    min = 0,
    max = 100,
    value = 50,
    onChange,
    label,
    size = 80,
    ...props
}: RSKnobProps) {
    const knobRef = useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);

    // Controlled vs Uncontrolled
    const displayValue = onChange ? value : internalValue;

    // Convert value to degrees (-135 to 135)
    const angleRange = 270;
    const startAngle = -135;
    const valueToAngle = (val: number) => {
        const percent = (val - min) / (max - min);
        return startAngle + percent * angleRange;
    };

    const angle = valueToAngle(displayValue);

    // Handling Drag
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        e.preventDefault();
    };

    useEffect(() => {
        // SWITCHING TO DELTA DRAG for better UX
        const handleMouseDrag = (e: MouseEvent) => {
            if (!isDragging) return;

            // Sensitivity
            const delta = -e.movementY * 1; // Up increases value

            setInternalValue(prev => {
                let next = prev + delta;
                next = Math.min(Math.max(next, min), max);
                onChange?.(next);
                return next;
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseDrag);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseDrag);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, min, max, onChange]);

    return (
        <div className={cn("flex flex-col items-center gap-2 select-none", className)} {...props}>
            <div
                ref={knobRef}
                className="relative rounded-full cursor-ns-resize touch-none"
                style={{ width: size, height: size }}
                onMouseDown={handleMouseDown}
            >
                {/* Ticks ring */}
                <div className="absolute inset-0 rounded-full" style={{ transform: 'rotate(0deg)' }}>
                    {Array.from({ length: 27 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-[2px] h-[6px] bg-rs-gray-300 left-1/2 -translate-x-1/2 origin-bottom"
                            style={{
                                top: 0,
                                height: '50%', // Origin is center 
                                transformOrigin: 'bottom center',
                                transform: `rotate(${-135 + (i * 10.38)}deg) translateY(-${size / 2 + 4}px)`
                            }}
                        >
                            <div className="w-full h-[4px] bg-rs-gray-200" />
                        </div>
                    ))}
                </div>

                {/* Knob Body */}
                <div
                    className={cn(
                        "absolute inset-1 rounded-full bg-rs-gray-100 border border-rs-gray-300",
                        "shadow-[var(--rs-shadow-knob)]",
                        "flex items-center justify-center transition-transform duration-75"
                    )}
                    style={{ transform: `rotate(${angle}deg)` }}
                >
                    {/* Grip texture */}
                    <div className="absolute inset-2 rounded-full border border-rs-gray-200 opacity-50" />

                    {/* Indicator Line */}
                    <div className="absolute top-2 w-[3px] h-[12px] bg-rs-signal rounded-full shadow-sm" />
                </div>
            </div>

            {/* Label */}
            <div className="text-center">
                {label && <div className="text-[10px] uppercase font-mono text-rs-gray-500 tracking-widest mb-0.5">{label}</div>}
                <div className="font-mono text-sm font-bold text-rs-black">{Math.round(displayValue)}</div>
            </div>
        </div>
    );
}
