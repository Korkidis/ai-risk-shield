"use client";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

import { RiskLevel } from './RSRiskScore';

interface RSAnalogNeedleProps {
    value?: number;
    label?: string;
    level?: RiskLevel;
    powered?: boolean;
}

export function RSAnalogNeedle({
    value = 0,
    label = "Risk Bias",

    size = 288,
    isScanning = false,
    powered = true
}: RSAnalogNeedleProps & { size?: number, isScanning?: boolean }) {
    const [jitter, setJitter] = useState(0);
    const [scanningValue, setScanningValue] = useState(0);
    const BASE_SIZE = 300;
    const scale = size / BASE_SIZE;



    // Scanning Jitter Effect
    useEffect(() => {
        if (!isScanning) {
            setJitter(0);
            return;
        }

        const interval = setInterval(() => {
            // Aggressive jitter during scan
            setJitter((Math.random() - 0.5) * 15);
            setScanningValue(Math.floor(Math.random() * 100));
        }, 50);
        return () => clearInterval(interval);
    }, [isScanning]);

    // Calculate rotation: 
    // If scanning: Base 50 + jitter
    // If idle/result: Use provided value
    // If unpowered: Fixed at -90 (0 position)
    const effectiveValue = powered ? (isScanning ? (50 + jitter) : value) : 0;
    const rotation = (effectiveValue / 100) * 180 - 90;

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Dial Container */}
            <div
                className="relative flex-shrink-0"
                style={{ width: size, height: size }}
            >
                <div
                    style={{
                        width: BASE_SIZE,
                        height: BASE_SIZE,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left'
                    }}
                    className="rounded-full bg-[var(--rs-bg-surface)] p-6 flex items-center justify-center relative border-t border-l border-white/10 border-b-2 border-r-2 border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)]"
                >
                    <div className="w-full h-full rounded-full bg-[var(--rs-bg-well)] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col items-center justify-center border-2 border-[var(--rs-border-primary)]/50">

                        {/* Uniform Tick Marks */}
                        <div className="absolute inset-5 rounded-full pointer-events-none">
                            {[...Array(21)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 origin-[center_108px]"
                                    style={{ transform: `translateX(-50%) rotate(${i * 9 - 90}deg)` }}
                                >
                                    <div className={cn("w-[2px]", i % 2 === 0 ? 'h-4 bg-[var(--rs-text-primary)]/40' : 'h-2 bg-[var(--rs-text-primary)]/20')} />
                                </div>
                            ))}
                        </div>

                        {/* Hazard Zone - Safety Orange */}
                        <div className="absolute inset-4 rounded-full border-[6px] border-transparent border-t-[var(--rs-signal)]/20 border-r-[var(--rs-signal)]/20 rotate-[45deg] pointer-events-none" />

                        {/* Physical Needle Shadow */}
                        <div
                            className="absolute bottom-1/2 left-1/2 w-[2px] h-[95px] bg-black/5 origin-bottom blur-[2px] transition-transform duration-100"
                            style={{ transform: `translateX(3px) rotate(${rotation + 1}deg)` }}
                        />

                        {/* Instrument Needle */}
                        <div
                            className="absolute bottom-1/2 left-1/2 origin-bottom transition-transform duration-100 z-20"
                            style={{
                                width: powered ? '2px' : '3px',
                                height: '100px',
                                transform: `translateX(-50%) rotate(${rotation}deg)`,
                                backgroundColor: powered ? 'var(--rs-black)' : 'var(--rs-gray-500)',
                                opacity: powered ? 1 : 0.4
                            }}
                        />

                        {/* Machined Pivot Hub */}
                        <div className="absolute bottom-1/2 left-1/2 w-10 h-10 -translate-x-1/2 translate-y-1/2 rounded-full bg-[var(--rs-gray-800)] shadow-[2px_2px_5px_rgba(0,0,0,0.4)] z-30 border-t border-white/10 flex items-center justify-center">
                            <div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: powered ? 'var(--rs-black)' : 'var(--rs-gray-600)' }}
                            />
                        </div>

                        {/* Internal Digital Readout (Numbers ONLY) */}
                        <div className="absolute bottom-8 text-center w-full z-10">
                            <div className={cn(
                                "text-5xl font-medium tracking-tighter transition-opacity duration-300",
                                powered ? "text-[var(--rs-text-primary)] opacity-90" : "text-[var(--rs-text-primary)] opacity-10"
                            )}>
                                {isScanning ? scanningValue : (powered ? Math.floor(value) : '')}
                            </div>
                        </div>

                        {/* Convex Lens Reflection */}
                        <div className="absolute inset-0 rounded-full z-40 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15)_0%,transparent_60%)] opacity-60" />
                    </div>
                </div>
            </div>

            {/* External Label (Underneath) */}
            {label && (
                <span className="text-[10px] font-bold text-[var(--rs-text-secondary)] uppercase tracking-widest">
                    {label}
                </span>
            )}
        </div>
    );
}
