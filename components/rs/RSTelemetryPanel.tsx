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
            case 'success': return 'var(--rs-safe)'; // Brand Green
            case 'warning': return 'var(--rs-risk-caution)'; // Amber
            case 'error': return 'var(--rs-signal)';   // Brand Red (Signal)
            case 'info': return 'var(--rs-info)';    // Cyan
            default: return 'var(--rs-gray-500)';        // Gray
        }
    };

    const currentStatusLabel = statusLabel || (
        state === 'scanning' ? 'ACQUIRING_SIGNAL' :
            state === 'complete' ? 'TELEMETRY_ACTIVE' : 'STANDBY'
    );

    return (
        <div className={cn(
            "relative w-full overflow-hidden rounded-xl font-mono text-xs select-none",
            "bg-rs-bg-surface-2 p-[2px]", // Outer casing (Rams Grey)
            className
        )}>
            {/* Physical Casing Bezel */}
            <div className="relative w-full h-full bg-rs-black rounded-[10px] overflow-hidden shadow-inner">

                {/* 1. Glass/Diffuser Layer */}
                <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-30 bg-[url('/noise.png')] bg-[length:128px]" />
                <div className="absolute inset-0 z-40 pointer-events-none bg-gradient-to-br from-white/5 to-black/20" />
                <div className="absolute inset-0 z-40 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]" />

                {/* 2. Top Header (Status Line) */}
                <div className="relative z-30 h-10 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            state === 'scanning' ? "bg-rs-risk-caution animate-pulse" :
                                state === 'complete' ? "bg-rs-safe" : "bg-rs-signal"
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
                                className="flex-1 flex flex-col items-start justify-start space-y-4 w-full"
                            >
                                {logEntries && logEntries.length > 0 ? (
                                    <div className="w-full h-full flex items-start justify-start px-4">
                                        <RSSystemLog
                                            logs={logEntries}
                                            className="w-full border-none bg-transparent p-0"
                                            maxHeight="320px"
                                            hideHeader={true}
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
                                className="space-y-3"
                            >
                                {rows.map((row, i) => (
                                    <motion.div
                                        key={row.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03, duration: 0.2 }}
                                        className="group flex items-center h-6 hover:bg-white/[0.02] rounded transition-colors"
                                    >
                                        {/* Label */}
                                        <div className="w-4 shrink-0 flex justify-center">
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: getStatusColor(row.status), boxShadow: `0 0 6px ${getStatusColor(row.status)}` }}
                                            />
                                        </div>

                                        <div className="w-32 shrink-0 text-[10px] uppercase font-bold text-white/40 tracking-wider truncate pl-2">
                                            {row.label.replace(/_/g, ' ')}
                                        </div>

                                        {/* Braun-style Diffused Light Bar */}
                                        <div className="flex-1 mx-4 h-2 bg-[#050505] rounded-full overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,1)] border border-white/5">
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: `${row.barWidth}%`, opacity: 1 }}
                                                transition={{ delay: 0.3 + (i * 0.05), duration: 0.6, ease: "easeOut" }}
                                                className="h-full relative"
                                            >
                                                {/* The Light Source */}
                                                <div
                                                    className="absolute inset-0 opacity-80"
                                                    style={{
                                                        backgroundColor: getStatusColor(row.status),
                                                        filter: 'blur(0.5px)'
                                                    }}
                                                />
                                                {/* Diffusion Gradient */}
                                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent mix-blend-overlay" />
                                                {/* Glass Reflection */}
                                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30 opacity-50" />
                                            </motion.div>
                                        </div>

                                        {/* Value - Fixed width to prevent bleed */}
                                        <div className="w-32 shrink-0 text-right">
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-widest truncate block"
                                                style={{
                                                    color: getStatusColor(row.status),
                                                    textShadow: `0 0 10px ${getStatusColor(row.status)}40`
                                                }}
                                            >
                                                {row.value}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Footer Controls (Braun Interface Style) */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.2 }}
                                    className="pt-6 mt-2 flex justify-between items-center"
                                >
                                    {/* Left Status Text */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-[2px] w-8 bg-white/10" />
                                        <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-medium">
                                            Cryptographic Seal Verified
                                        </span>
                                    </div>

                                    {/* Right CTA Button */}
                                    {!hideButton && onAction && (
                                        <button
                                            onClick={onAction}
                                            className="group flex items-center gap-3 pl-6 pr-4 py-2 bg-rs-black border border-white/10 hover:border-rs-signal/50 rounded text-white/60 hover:text-rs-signal transition-all"
                                        >
                                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                                                {buttonText || 'View Manifest'}
                                            </span>
                                            <div className="w-4 h-4 flex items-center justify-center border border-white/10 rounded-full group-hover:border-rs-signal transition-colors">
                                                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    )}
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
                                <span className="text-[10px] uppercase tracking-widest text-white/40">Buffer_Ready</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
