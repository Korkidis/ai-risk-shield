"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { RSSystemLog, LogEntry } from './RSSystemLog';

export interface TelemetryRow {
    id: string;
    label: string;
    value: string;
    barWidth: number; // 0-100
    status: 'success' | 'warning' | 'error' | 'info' | 'pending';
    delay?: number; // Animation stagger index
}

interface RSTelemetryPanelProps {
    rows: TelemetryRow[];
    state: 'idle' | 'scanning' | 'complete' | 'error';
    logEntries?: LogEntry[];
    hideButton?: boolean;
    statusLabel?: string;
    buttonText?: string;
    footerText?: string;
    onAction?: () => void;
    className?: string;
}

export function RSTelemetryPanel({
    rows,
    state,
    logEntries,
    hideButton,
    statusLabel,
    buttonText,
    footerText,
    className,
    onAction
}: RSTelemetryPanelProps) {
    const [displayState, setDisplayState] = useState<'boot' | 'scanning' | 'grid'>('boot');

    // Manage internal state transitions
    useEffect(() => {
        if (state === 'scanning') {
            setDisplayState('scanning');
        } else if (state === 'complete') {
            // Artificial delay for "processing" feel before showing grid
            const timer = setTimeout(() => setDisplayState('grid'), 800);
            return () => clearTimeout(timer);
        } else if (state === 'idle') {
            setDisplayState('boot');
        } else if (state === 'error') {
            setDisplayState('grid');
        }
    }, [state]);

    const getStatusColor = (status: TelemetryRow['status']) => {
        switch (status) {
            case 'success': return '#10B981'; // Emerald 500
            case 'warning': return '#F59E0B'; // Amber 500
            case 'error': return '#EF4444';   // Red 500
            case 'info': return '#06B6D4';    // Cyan 500
            default: return '#6B7280';        // Gray 500
        }
    };

    const currentStatusLabel = statusLabel || (
        state === 'scanning' ? 'ACQUIRING_SIGNAL' :
            state === 'complete' ? 'TELEMETRY_ACTIVE' : 'STANDBY'
    );

    return (
        <div className={cn(
            "relative w-full overflow-hidden rounded-xl font-mono text-xs select-none",
            "bg-[#e5e5e5] p-[2px]", // Outer casing (Rams Grey)
            className
        )}>
            {/* Physical Casing Bezel */}
            <div className="relative w-full h-full bg-[#1a1a1a] rounded-[10px] overflow-hidden shadow-inner">

                {/* 1. Glass/Diffuser Layer */}
                <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-30 bg-[url('/noise.png')] bg-[length:128px]" />
                <div className="absolute inset-0 z-40 pointer-events-none bg-gradient-to-br from-white/5 to-black/20" />
                <div className="absolute inset-0 z-40 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]" />

                {/* 2. Top Header (Status Line) */}
                <div className="relative z-30 h-10 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            state === 'scanning' ? "bg-amber-500 animate-pulse" :
                                state === 'complete' ? "bg-emerald-500" : "bg-red-500"
                        )} />
                        <span className="text-[10px] font-bold tracking-widest text-white/60 uppercase">
                            {currentStatusLabel}
                        </span>
                    </div>
                    <span className="text-[9px] text-white/30 tracking-widest">
                        SYS.09
                    </span>
                </div>

                {/* 3. Content Area */}
                <div className="relative z-20 p-6 min-h-[400px] flex flex-col bg-[#0f0f0f]">

                    <AnimatePresence mode="wait">
                        {displayState === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center space-y-4 w-full"
                            >
                                {logEntries && logEntries.length > 0 ? (
                                    <div className="w-full h-full flex items-center justify-center px-4">
                                        <RSSystemLog
                                            logs={logEntries}
                                            className="w-full border-none bg-transparent"
                                            maxHeight="320px"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative w-16 h-16">
                                            <div className="absolute inset-0 border-t-2 border-l-2 border-cyan-500 rounded-tl-xl animate-spin" />
                                            <div className="absolute inset-2 border-b-2 border-r-2 border-amber-500 rounded-br-xl animate-spin [animation-direction:reverse]" />
                                        </div>
                                        <p className="text-[10px] text-cyan-500 uppercase tracking-[0.2em] animate-pulse">
                                            Deciphering_Manifest...
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {displayState === 'grid' && (
                            <motion.div
                                key="grid"
                                className="space-y-1"
                            >
                                {rows.map((row, i) => (
                                    <motion.div
                                        key={row.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03, duration: 0.2 }}
                                        className="group flex items-center h-7 px-2 -mx-2 hover:bg-white/5 rounded transition-colors"
                                    >
                                        {/* Label Column */}
                                        <div className="w-8 shrink-0 text-[10px] font-bold text-white/30 flex items-center">
                                            {/* Status Dot */}
                                            <div
                                                className="w-1 h-1 rounded-full mr-2"
                                                style={{ backgroundColor: getStatusColor(row.status) }}
                                            />
                                        </div>

                                        <div className="w-40 shrink-0 text-[10px] uppercase font-bold text-white/60 truncate">
                                            {row.label.replace(/_/g, ' ')}
                                        </div>

                                        {/* Bar Chart Visualization */}
                                        <div className="flex-1 mx-4 h-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${row.barWidth}%` }}
                                                transition={{ delay: 0.3 + (i * 0.05), duration: 0.5, type: "spring" }}
                                                className="h-full rounded-full relative"
                                                style={{ backgroundColor: getStatusColor(row.status) }}
                                            >
                                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20" />
                                            </motion.div>
                                        </div>

                                        {/* Value Column */}
                                        <div className="w-24 shrink-0 text-right">
                                            <span
                                                className="text-[9px] font-bold uppercase tracking-wider"
                                                style={{ color: getStatusColor(row.status) }}
                                            >
                                                {row.value}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Footer Summary */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end"
                                >
                                    <div className="text-[9px] text-white/60 max-w-[150px] leading-relaxed font-medium">
                                        {footerText || "System telemetry active."}
                                    </div>
                                    {/* 'Secure' text removed to make room for CTA */}
                                </motion.div>
                            </motion.div>
                        )}

                        {displayState === 'boot' && (
                            <motion.div
                                key="boot"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex flex-col items-center justify-center opacity-30"
                            >
                                <span className="text-[10px] uppercase tracking-widest text-white/40">Awating Input Stream</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Precision Hardware Action Button - Full Desktop CTA */}
                    {!hideButton && (
                        <div className="absolute bottom-6 right-6 z-50">
                            <button
                                onClick={onAction}
                                className="group relative flex items-center gap-3 px-6 py-3 rounded-[4px] bg-[#0A0A0A] border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-all hover:bg-[#151515] active:translate-y-[1px] active:shadow-none overflow-hidden"
                            >
                                {/* Machined Texture Overlay */}
                                <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] bg-[length:64px] pointer-events-none" />

                                {/* Inner Bezel Highlight */}
                                <div className="absolute inset-0 border border-white/5 rounded-[4px] pointer-events-none" />

                                <span className="relative z-10 font-mono text-xs font-bold text-[#FF4F00] uppercase tracking-widest group-hover:text-[#FF6A2B] transition-colors">
                                    {buttonText || 'View Full Manifest'}
                                </span>

                                <div className="relative z-10 text-[#FF4F00] group-hover:translate-x-1 transition-transform">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
