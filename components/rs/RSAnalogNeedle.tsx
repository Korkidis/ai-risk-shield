"use client";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RSAnalogNeedleProps {
    value?: number;
    label?: string;
}

export function RSAnalogNeedle({ value = 0, label = "Risk Bias" }: RSAnalogNeedleProps) {
    const [jitter, setJitter] = useState(0);

    // High-frequency mechanical jitter for realism
    useEffect(() => {
        const interval = setInterval(() => {
            setJitter((Math.random() - 0.5) * (value > 90 ? 1.5 : 0.3));
        }, 50);
        return () => clearInterval(interval);
    }, [value]);

    const rotation = ((value + jitter) / 100) * 180 - 90;

    return (
        <div className="w-72 h-72 rounded-full bg-[var(--rs-bg-surface)] p-6 flex items-center justify-center relative border-t border-l border-white/10 border-b-2 border-r-2 border-[var(--rs-border-primary)] shadow-[var(--rs-shadow-l2)]">
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
                <div className="absolute inset-4 rounded-full border-[6px] border-transparent border-t-[#FF4F00]/20 border-r-[#FF4F00]/20 rotate-[45deg] pointer-events-none" />

                {/* Physical Needle Shadow */}
                <div
                    className="absolute bottom-1/2 left-1/2 w-[2px] h-[95px] bg-black/5 origin-bottom blur-[2px] transition-transform duration-100"
                    style={{ transform: `translateX(3px) rotate(${rotation + 1}deg)` }}
                />

                {/* Instrument Needle */}
                <div
                    className="absolute bottom-1/2 left-1/2 w-[2px] h-[100px] bg-[#FF4F00] origin-bottom transition-transform duration-100 z-20"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                />

                {/* Machined Pivot Hub */}
                <div className="absolute bottom-1/2 left-1/2 w-10 h-10 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#333] shadow-[2px_2px_5px_rgba(0,0,0,0.4)] z-30 border-t border-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                </div>

                {/* Readout Typography */}
                <div className="absolute bottom-12 text-center">
                    <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--rs-text-secondary)] mb-1">{label}</div>
                    <div className="text-2xl font-medium tracking-tighter text-[var(--rs-text-primary)]">{Math.floor(value)}</div>
                </div>

                {/* Convex Lens Reflection */}
                <div className="absolute inset-0 rounded-full z-40 pointer-events-none bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15)_0%,transparent_60%)] opacity-60" />
            </div>
        </div>
    );
}
