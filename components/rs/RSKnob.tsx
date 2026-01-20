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
        <div className={cn("flex flex-col items-center gap-3 select-none", className)} {...props}>
            <div
                ref={knobRef}
                className="rounded-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)] flex items-center justify-center relative group cursor-ns-resize touch-none"
                style={{ width: size, height: size }}
                onMouseDown={handleMouseDown}
            >
                {/* Precision Needle (The Indicator) */}
                <div
                    className="absolute w-[4px] bg-[var(--rs-signal)] rounded-full transition-transform duration-75 ease-out z-20"
                    style={{
                        height: '40%',
                        top: '10%',
                        left: '50%',
                        marginLeft: '-2px',
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'bottom center'
                    }}
                />

                {/* Inner Bezel (Recessed) */}
                <div className="w-[70%] h-[70%] rounded-full bg-[var(--rs-bg-element)] shadow-inner border border-[var(--rs-border-primary)]/30 relative z-10" />
            </div>
            {label && (
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">{label}</span>
                </div>
            )}
        </div>
    );
}

