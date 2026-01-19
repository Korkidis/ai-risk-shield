"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RSProcessingPanelProps {
    filename: string;
    progress: number; // 0 to 100
    statusMessage: string;
    imageSrc?: string | null; // The uploaded image preview URL
    className?: string;
}

interface LogEntry {
    id: string;
    message: string;
    timestamp: string;
}

export function RSProcessingPanel({
    filename,
    progress,
    statusMessage,
    imageSrc,
    className
}: RSProcessingPanelProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Simulate rolling logs based on status updates
    useEffect(() => {
        if (!statusMessage) return;

        const newLog: LogEntry = {
            id: crypto.randomUUID(),
            message: statusMessage,
            timestamp: new Date().toISOString().split('T')[1].slice(0, 8), // HH:MM:SS
        };

        setLogs(prev => {
            const updated = [...prev, newLog];
            if (updated.length > 8) return updated.slice(updated.length - 8);
            return updated;
        });
    }, [statusMessage]);

    return (
        <div className={cn(
            "w-full h-full flex flex-col bg-[#050505] text-rs-white relative overflow-hidden",
            className
        )}>
            {/* TOP SECTION: VISUAL SCANNER */}
            <div className="relative flex-grow overflow-hidden group">
                {/* Image Preview */}
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt="Scanning Target"
                        className="absolute inset-0 w-full h-full object-contain opacity-90 transition-opacity duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a),linear-gradient(45deg,#1a1a1a_25%,transparent_25%,transparent_75%,#1a1a1a_75%,#1a1a1a)] bg-[size:20px_20px] bg-[position:0_0,10px_10px]" />
                )}

                {/* Scan FX Layers */}
                <div className="absolute inset-0 bg-rs-signal/10 mix-blend-overlay" />
                <div className="absolute inset-x-0 h-[2px] bg-rs-signal shadow-[0_0_20px_2px_#FF4F00] z-20 animate-[scanSmooth_2s_ease-in-out_infinite]" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-30 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex flex-col">
                        <span className="rs-type-mono text-[9px] text-rs-signal font-bold uppercase tracking-widest animate-pulse">ANALYZING TARGET</span>
                        <span className="rs-type-mono text-[9px] text-rs-gray-400 uppercase">{filename}</span>
                    </div>

                    {/* Rotary Progess Dial */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" className="text-rs-gray-800" />
                                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="none" className="text-rs-signal transition-all duration-300 ease-out" strokeDasharray="88" strokeDashoffset={88 - (88 * progress) / 100} />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[8px] font-mono font-bold text-rs-white">{progress.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION: SYSTEM LOG */}
            <div className="h-1/3 min-h-[140px] bg-black/90 border-t border-rs-gray-800 p-3 font-mono text-[10px] flex flex-col relative">
                {/* Header */}
                <div className="flex justify-between items-center mb-2 border-b border-rs-gray-800/50 pb-1">
                    <span className="text-rs-gray-500 uppercase tracking-wider font-bold">SYSTEM LOG</span>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-rs-signal animate-pulse" />
                        <span className="text-[9px] text-rs-signal/80">PROCESSING</span>
                    </div>
                </div>

                {/* Log Stream */}
                <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-1">
                    {logs.map((log) => (
                        <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-left-1 duration-200">
                            <span className="text-rs-gray-600 shrink-0">[{log.timestamp}]</span>
                            <span className={cn(
                                "truncate",
                                log.message.includes("Error") ? "text-rs-signal font-bold" :
                                    log.message.includes("Complete") ? "text-rs-safe font-bold" : "text-rs-gray-300"
                            )}>
                                {log.message.includes("...") ? (
                                    <>
                                        {log.message.replace("...", "")}
                                        <span className="animate-pulse">...</span>
                                    </>
                                ) : log.message}
                            </span>
                        </div>
                    ))}
                    {/* Active Line Placeholder */}
                    <div className="flex gap-2 items-center opacity-50">
                        <span className="text-rs-gray-700">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                        <span className="w-1.5 h-3 bg-rs-signal animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
