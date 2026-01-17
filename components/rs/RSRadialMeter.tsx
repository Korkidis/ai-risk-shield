"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from './RSRiskScore';

interface RSRadialMeterProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number; // 0-100
    level: RiskLevel;
    size?: number;
}

export function RSRadialMeter({
    className,
    value,
    level,
    size = 200,
    ...props
}: RSRadialMeterProps) {
    // Config
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const cx = size / 2;
    const cy = size / 2;

    // Arc math: -135deg to +135deg (270deg total)
    const startAngle = -135;
    const endAngle = 135;
    const angleRange = endAngle - startAngle;

    // Calculate value angle
    const clampedValue = Math.min(Math.max(value, 0), 100);
    const valueAngle = startAngle + (clampedValue / 100) * angleRange;

    // Type for arc path calculation
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    };

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
    };

    const trackPath = describeArc(cx, cy, radius, startAngle, endAngle);

    // Dynamic Color based on level
    const colors = {
        critical: "var(--rs-signal)",
        high: "#262624",
        medium: "#919189",
        low: "#b0b0a8",
        safe: "var(--rs-safe)",
    };

    // Needle Rotation
    const needleTransform = `rotate(${valueAngle} ${cx} ${cy})`;

    return (
        <div className={cn("relative inline-block", className)} style={{ width: size, height: size }} {...props}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>

                {/* Track Shadow (Bevel Inset) */}
                <filter id="innerShadow">
                    <feOffset dx="0" dy="1" />
                    <feGaussianBlur stdDeviation="1" result="offset-blur" />
                    <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
                    <feFlood floodColor="black" floodOpacity="0.2" result="color" />
                    <feComposite operator="in" in="color" in2="inverse" result="shadow" />
                    <feComposite operator="over" in="shadow" in2="SourceGraphic" />
                </filter>

                {/* 1. Track Background */}
                <path
                    d={trackPath}
                    fill="none"
                    stroke="var(--rs-gray-200)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    style={{ filter: "url(#innerShadow)" }}
                />

                {/* 2. Active Arc (Masked) */}
                {/* We cheat slightly by using checking stroke-dasharray if we wanted complex gradients, 
            but for now, let's just use colored stroke for the filled portion if we wanted a bar. 
            However, user asked for "Speedometer" style, which usually implies the needle does the work.
            Let's add a subtle gradient arc for range. */}

                {/* 3. Ticks / Scale */}
                {Array.from({ length: 11 }).map((_, i) => {
                    const tickValue = i * 10;
                    const angle = startAngle + (tickValue / 100) * angleRange;
                    const p1 = polarToCartesian(cx, cy, radius - 15, angle);
                    const p2 = polarToCartesian(cx, cy, radius - 25, angle);
                    return (
                        <line
                            key={i}
                            x1={p1.x} y1={p1.y}
                            x2={p2.x} y2={p2.y}
                            stroke="var(--rs-gray-400)"
                            strokeWidth={i % 5 === 0 ? 2 : 1}
                        />
                    )
                })}

                {/* 4. Needle */}
                <g transform={needleTransform}>
                    <line x1={cx} y1={cy} x2={cx} y2={cy - radius + 10} stroke={colors[level]} strokeWidth={3} strokeLinecap="round" />
                    <circle cx={cx} cy={cy} r={6} fill={colors[level]} />
                </g>

                {/* 5. Value Text */}
                <text
                    x={cx}
                    y={cy + 40}
                    textAnchor="middle"
                    className="font-mono text-3xl font-bold fill-rs-black"
                >
                    {value}
                </text>
                <text
                    x={cx}
                    y={cy + 55}
                    textAnchor="middle"
                    className="font-mono text-[10px] uppercase fill-rs-gray-500 tracking-widest"
                >
                    RISK IDX
                </text>

            </svg>
        </div>
    );
}
