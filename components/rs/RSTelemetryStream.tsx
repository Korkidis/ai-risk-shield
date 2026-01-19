"use client";

import React from 'react';

export function RSTelemetryStream() {
    const [widths, setWidths] = React.useState<number[]>(Array(6).fill(50)); // Default stable value

    React.useEffect(() => {
        // Animate values after mount
        const updateWidths = () => {
            setWidths(Array(6).fill(0).map(() => 20 + Math.random() * 70));
        };

        updateWidths(); // Initial client-side set

        const interval = setInterval(updateWidths, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full max-w-3xl mx-auto">
            {/* Physical Housing Bezel */}
            <div className="absolute -inset-[12px] bg-[var(--rs-bg-surface)] rounded-[3.5rem] border-t border-l border-[var(--rs-border-primary)] border-b border-r border-black/20 shadow-xl" />

            {/* CRT Glass & Screen */}
            <div className="relative bg-[#0A0A0A] rounded-[2.5rem] border-[14px] border-[var(--rs-border-primary)] shadow-[inset_0_0_60px_rgba(0,0,0,1),20px_20px_40px_rgba(0,0,0,0.4)] overflow-hidden aspect-video flex flex-col font-mono">

                {/* Phosphor & Scan-line Overlay */}
                <div className="absolute inset-0 pointer-events-none z-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_3px,3px_100%]" />

                {/* Internal Content */}
                <div className="relative z-10 flex-1 p-10 flex flex-col justify-between">

                    {/* Top Metadata */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="text-[#FF4F00] text-xs font-black tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#FF4F00] rounded-full animate-ping shadow-[0_0_8px_#FF4F00]" />
                                LOG_TELEMETRY_STREAM
                            </div>
                            <div className="text-[9px] text-white/20 uppercase tracking-[0.3em]">Module: BRAVO-RACK-09</div>
                        </div>
                        <div className="text-right text-white/10 text-[10px] leading-tight">
                            LATENCY: 4.12 MS<br />PID: 7710-X
                        </div>
                    </div>

                    {/* Data Visualization / Waveforms */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-full space-y-2 opacity-50">
                            {widths.map((width, i) => (
                                <div key={i} className="h-4 bg-white/5 rounded flex items-center px-4 overflow-hidden border border-white/5">
                                    <div className="text-[9px] text-[#00FF94] w-24">0x44F1_{i}</div>
                                    <div className="h-1 bg-white/10 flex-1 mx-4 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#FF4F00]/40 transition-all duration-500 ease-in-out"
                                            style={{ width: `${width}%` }}
                                        />

                                    </div>
                                    <div className="text-[8px] text-white/20 uppercase">Parity_Check</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                        <div className="flex gap-6 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                            <span>Buffer: Ready</span>
                            <span>Rec: Tracking</span>
                        </div>
                        <div className="px-4 py-1.5 bg-white/10 rounded text-[9px] text-[#FF4F00] font-black tracking-[0.2em] uppercase border border-[#FF4F00]/20 hover:bg-[#FF4F00]/20 cursor-pointer transition-colors">
                            Emergency Stop
                        </div>
                    </div>
                </div>

                {/* Global Screen Glare & Vignette */}
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] rounded-[2.5rem] pointer-events-none z-10" />
            </div>
        </div>
    );
}
