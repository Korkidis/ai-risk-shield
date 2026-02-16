"use client";


import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RSAuxiliaryDialProps {
    value: number; // 0-100
    label?: string;
    size?: number;
    className?: string;
    isScanning?: boolean;
}

export function RSAuxiliaryDial({
    value,
    label,
    size = 200,
    className,
    isScanning = false
}: RSAuxiliaryDialProps) {

    // Config
    // Config

    // Angle mapping: -140 to +140 degrees
    const startAngle = -140;
    const endAngle = 140;
    const angleRange = endAngle - startAngle;

    // Calculate rotation
    const clampedVal = Math.min(Math.max(value, 0), 100);
    const rotation = startAngle + (clampedVal / 100) * angleRange;

    // Physics-based "Hard Plastic" shading
    // Deep, sharp inset for the well - less blur, more definition
    const wellShadow = "inset 2px 2px 5px rgba(163, 177, 198, 0.6), inset -2px -2px 5px rgba(255, 255, 255, 1)";

    // Convex, tactile ring
    // Linear gradient for the surface to simulate light hitting a curved surface
    const ringGradient = "linear-gradient(135deg, #F0F0F0 0%, #D9D9D9 100%)";

    // Drop shadow - Tighter, grounded, less "floaty glow"
    const dropShadow = "4px 4px 10px rgba(0, 0, 0, 0.15), -2px -2px 8px rgba(255, 255, 255, 0.8)";

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>

            {/* The Dial Assembly */}
            <div
                className="rounded-full relative flex items-center justify-center"
                style={{
                    width: size,
                    height: size,
                    background: ringGradient,
                    boxShadow: dropShadow,
                }}
            >
                {/* The Inner Well */}
                <div
                    className="rounded-full relative"
                    style={{
                        width: size * 0.82, // Slightly thicker bezel
                        height: size * 0.82,
                        boxShadow: wellShadow,
                        backgroundColor: '#EFEEE9'
                    }}
                >
                    {/* SVG Layer for Ticks & Arcs */}
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0 p-1">
                        {/* Scale Ticks */}
                        {Array.from({ length: 41 }).map((_, i) => {
                            const tickAngle = startAngle + (i / 40) * angleRange;
                            const isMajor = i % 10 === 0;
                            const tickLen = isMajor ? 10 : 5;
                            // Inset ticks slightly
                            return (
                                <line
                                    key={i}
                                    x1={50} y1={8}
                                    x2={50} y2={8 + tickLen}
                                    stroke={isMajor ? "#888" : "#BBB"}
                                    strokeWidth={isMajor ? 1.5 : 1}
                                    strokeLinecap="round"
                                    transform={`rotate(${tickAngle} 50 50)`}
                                />
                            );
                        })}

                        {/* Critical Zone Arc (Red) */}
                        <path d="M 85 50 A 35 35 0 0 1 76 75" fill="none" stroke="#FF4400" strokeWidth="2" strokeOpacity="0.4" />
                    </svg>

                    {/* Value Display (Centered) */}
                    <div className="absolute inset-0 flex items-center justify-center pt-8">
                        <span className="text-2xl font-sans font-bold text-[#333] tracking-tight">
                            {isScanning ? (
                                <motion.span
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                >
                                    --
                                </motion.span>
                            ) : Math.round(value)}
                        </span>
                    </div>

                    {/* Needle Assembly */}
                    <motion.div
                        className="absolute inset-0 z-10"
                        initial={{ rotate: startAngle }}
                        animate={{ rotate: isScanning ? [startAngle, endAngle, startAngle] : rotation }}
                        transition={{
                            type: "spring", stiffness: 50, damping: 15,
                            ...(isScanning && { repeat: Infinity, duration: 2, ease: "linear" })
                        }}
                    >
                        {/* The Needle Line - Thin, Tapered, Dark */}
                        <div className="absolute top-[12%] left-1/2 w-[1.5px] h-[38%] bg-[#222] origin-bottom -translate-x-1/2 rounded-full opacity-90" />
                    </motion.div>

                    {/* Central Pivot Dot (The "Eye") */}
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="w-5 h-5 rounded-full bg-[#1A1A1A] shadow-[2px_2px_4px_rgba(0,0,0,0.3)] gradient-to-br from-[#333] to-[#000]" />
                    </div>

                </div>
            </div>

            {/* Label */}
            {label && (
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#555]">
                    {label.replace(/_/g, ' ')}
                </span>
            )}
        </div>
    );
}

