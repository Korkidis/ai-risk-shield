"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

interface RSTooltipProps {
    content: string | React.ReactNode;
    children?: React.ReactNode;
    delay?: number; // ms
    maxWidth?: string;
    side?: 'top' | 'bottom' | 'responsive';
}

export function RSTooltip({
    content,
    children,
    delay = 200, // Short delay for intent
    maxWidth = "240px",
    side = 'top'
}: RSTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    return (
        <div
            className="relative inline-flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger: If no children, render default Info Icon */}
            {children || (
                <Info className="w-4 h-4 text-rs-gray-500 hover:text-rs-black transition-colors cursor-help" />
            )}

            {/* Tooltip Popup */}
            {isVisible && (
                <div
                    className={cn(
                        "absolute z-50 px-3 py-2 bg-rs-black text-rs-white text-[11px] leading-snug tracking-wide rounded-[2px] shadow-xl pointer-events-none whitespace-normal border border-rs-gray-800",
                        "animate-in fade-in zoom-in-95 duration-150",
                        side === 'top' ? "bottom-full mb-2 left-1/2 -translate-x-1/2" : "top-full mt-2 left-1/2 -translate-x-1/2"
                    )}
                    style={{ width: 'max-content', maxWidth }}
                >
                    {content}

                    {/* Arrow */}
                    <div
                        className={cn(
                            "absolute w-2 h-2 bg-rs-black rotate-45 border-r border-b border-rs-gray-800",
                            side === 'top' ? "bottom-[-5px] left-1/2 -translate-x-1/2 border-l-0 border-t-0" : "top-[-5px] left-1/2 -translate-x-1/2 border-r-0 border-b-0 border-l border-t"
                        )}
                    />
                </div>
            )}
        </div>
    );
}
