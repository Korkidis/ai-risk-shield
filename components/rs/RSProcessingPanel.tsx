"use client";

import React, { useEffect, useState } from 'react';
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
            if (updated.length > 6) return updated.slice(updated.length - 6);
            return updated;
        });
    }, [statusMessage]);

    // Calculate ring offset (circumference = 2 * PI * 60 ≈ 377)
    const circumference = 377;
    const offset = circumference - (progress / 100) * circumference;

    // Color based on progress
    const ringColor = progress < 100 ? 'var(--rs-signal)' : 'var(--rs-safe)';

    return (
        <div className={cn(
            "w-full max-w-5xl mx-auto",
            className
        )}>
            {/* Two-Column Grid */}
            <div className="grid lg:grid-cols-2 gap-6 items-start">

                {/* LEFT COLUMN: Visual Scanner */}
                <div className="bg-rs-gray-900 rounded-[8px] border border-rs-gray-800 overflow-hidden">
                    {/* Header */}
                    <div className="bg-rs-gray-900 border-b border-rs-gray-800 px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-rs-signal animate-pulse" />
                            <h3 className="font-mono text-xs font-bold text-rs-gray-200 uppercase tracking-wider">
                                Visual Analysis
                            </h3>
                        </div>
                        <p className="font-mono text-[10px] text-rs-gray-500 uppercase">
                            {filename.slice(0, 16)}...
                        </p>
                    </div>

                    {/* Image Preview with Scanner */}
                    <div className="relative aspect-video bg-rs-black overflow-hidden">
                        {imageSrc ? (
                            <img
                                src={imageSrc}
                                alt="Scanning Target"
                                className="w-full h-full object-cover opacity-70 grayscale-[0.3] contrast-110"
                            />
                        ) : (
                            <div
                                className="w-full h-full opacity-20"
                                style={{
                                    backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                                    backgroundSize: '40px 40px'
                                }}
                            />
                        )}

                        {/* Scan Line */}
                        <div
                            className="absolute top-0 left-0 w-full h-[2px] bg-rs-signal shadow-[0_0_15px_2px_rgba(255,65,58,0.8)] z-20 animate-[scanSmooth_3s_ease-in-out_infinite]"
                        />

                        {/* CRT Overlay */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-20 z-10"
                            style={{
                                backgroundImage: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)`,
                                backgroundSize: '100% 4px'
                            }}
                        />

                        {/* Data Overlays */}
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-0.5 z-30 font-mono text-[9px] text-rs-signal font-bold">
                            <span>ANALYZING... {progress.toFixed(0)}%</span>
                            <span className="text-rs-gray-500">RES: 4K_NATIVE</span>
                        </div>

                        <div className="absolute bottom-3 left-3 z-30">
                            <div className="px-2 py-1 bg-rs-black/80 text-rs-white border border-rs-gray-700 text-[9px] uppercase tracking-widest font-mono">
                                Target Acquired
                            </div>
                        </div>
                    </div>

                    {/* Progress Ring - Centered Below Image */}
                    <div className="py-8 flex flex-col items-center justify-center bg-rs-gray-900">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full -rotate-90">
                                <circle
                                    className="text-rs-gray-800"
                                    strokeWidth="6"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="60"
                                    cx="64"
                                    cy="64"
                                />
                                <circle
                                    className="transition-all duration-500 ease-out"
                                    strokeWidth="6"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    stroke={ringColor}
                                    fill="transparent"
                                    r="60"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-rs-white tracking-tighter">{progress.toFixed(0)}</span>
                                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-rs-gray-500">Progress</span>
                            </div>
                        </div>
                        <p className="mt-4 text-xs font-bold text-rs-gray-400 uppercase tracking-wide">
                            {progress < 100 ? 'Scanning' : 'Complete'}
                        </p>
                    </div>
                </div>

                {/* RIGHT COLUMN: Console Log */}
                <div className="bg-rs-gray-900 rounded-[8px] border border-rs-gray-800 overflow-hidden h-full flex flex-col">
                    {/* Header */}
                    <div className="bg-rs-gray-900 border-b border-rs-gray-800 px-5 py-3 flex items-center justify-between">
                        <h3 className="font-mono text-xs font-bold text-rs-gray-200 uppercase tracking-wider">
                            Forensic Log
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rs-signal animate-pulse" />
                            <span className="text-[9px] text-rs-signal font-bold uppercase tracking-widest">Live</span>
                        </div>
                    </div>

                    {/* Console Body */}
                    <div className="flex-1 bg-[#0a0a0a] p-4 font-mono text-xs overflow-y-auto min-h-[400px]">
                        <div className="space-y-2">
                            {/* Header Line */}
                            <div className="flex gap-2 text-rs-gray-600 border-b border-rs-gray-800 pb-2 mb-3">
                                <span className="text-rs-gray-500">root@risk-shield:~#</span>
                                <span className="text-rs-safe">./init_forensic_scan.sh</span>
                            </div>

                            {/* Status Message */}
                            <div className="mb-4 py-2 px-3 bg-rs-gray-900/50 border border-rs-gray-800 rounded">
                                <p className="text-rs-gray-300 text-[11px]">{statusMessage}</p>
                            </div>

                            {/* Log Stream */}
                            <div className="flex flex-col gap-2">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                        <span className="text-rs-gray-700 shrink-0 text-[10px]">[{log.timestamp}]</span>
                                        <span className="text-rs-safe mr-1">✓</span>
                                        <span className={cn(
                                            "text-[11px] break-words",
                                            log.message.includes('Error') ? "text-rs-signal" :
                                                log.message.includes('Complete') ? "text-rs-safe" : "text-rs-gray-400"
                                        )}>
                                            {log.message}
                                        </span>
                                    </div>
                                ))}
                                {/* Blinking Cursor */}
                                <div className="flex gap-2 items-center mt-2">
                                    <span className="text-rs-signal">▶</span>
                                    <span className="w-2 h-4 bg-rs-signal animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-rs-gray-900 border-t border-rs-gray-800 px-5 py-3">
                        <p className="text-[9px] text-rs-gray-600 uppercase tracking-widest text-center">
                            Forensic Engine V2 • Multi-Vector Analysis
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
