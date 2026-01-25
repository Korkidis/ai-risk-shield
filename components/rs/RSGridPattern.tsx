"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface RSGridPatternProps extends React.HTMLAttributes<HTMLDivElement> {
    dotSize?: number;
    gridSize?: number;
    majorGridSize?: number;
    dotOpacity?: number;
    gridOpacity?: number;
    className?: string;
}

export const RSGridPattern = ({
    dotSize = 1.2,
    gridSize = 24,
    majorGridSize = 120,
    dotOpacity = 0.06,
    gridOpacity = 0.04,
    className,
    ...props
}: RSGridPatternProps) => {
    return (
        <div
            className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
            {...props}
        >
            {/* Layer 1: Micro-Dot Grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle, var(--rs-text-primary) ${dotSize}px, transparent ${dotSize}px)`,
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    opacity: dotOpacity
                }}
            />

            {/* Layer 2: Major Ruler Lines */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--rs-text-primary) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--rs-text-primary) 1px, transparent 1px)
                    `,
                    backgroundSize: `${majorGridSize}px ${majorGridSize}px`,
                    opacity: gridOpacity
                }}
            />
        </div>
    );
};
