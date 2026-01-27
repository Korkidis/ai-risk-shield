"use client";

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface LogEntry {
    id: string | number;
    message: string;
    status: 'pending' | 'active' | 'done' | 'error';
    timestamp?: string; // Optional simulated timestamp
}

interface RSSystemLogProps extends React.HTMLAttributes<HTMLDivElement> {
    logs: LogEntry[];
    maxHeight?: string;
    autoScroll?: boolean;
    hideHeader?: boolean;
}

export function RSSystemLog({
    className,
    logs,
    maxHeight = "200px",
    autoScroll = true,
    hideHeader = false,
    ...props
}: RSSystemLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    return (
        <div
            className={cn(
                "bg-rs-black border border-rs-gray-800 rounded-[4px] p-3 font-mono text-xs overflow-hidden flex flex-col",
                className
            )}
            style={{ height: maxHeight }}
            {...props}
        >
            {!hideHeader && (
                <div className="flex items-center justify-between pb-2 border-b border-rs-gray-800 mb-2 select-none">
                    <span className="text-rs-gray-500 uppercase tracking-wider text-[10px]">System Log</span>
                    <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rs-gray-700 animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-rs-gray-700" />
                        <span className="w-1.5 h-1.5 rounded-full bg-rs-gray-700" />
                    </div>
                </div>
            )}

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-rs-gray-700 scrollbar-track-transparent pr-2"
            >
                {logs.length === 0 && (
                    <span className="text-rs-gray-700 italic">Reading stream...</span>
                )}

                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className={cn(
                            "mt-0.5",
                            log.status === 'done' ? "text-rs-safe" :
                                log.status === 'error' ? "text-rs-signal" :
                                    log.status === 'active' ? "text-rs-white animate-spin" : "text-rs-gray-600"
                        )}>
                            {log.status === 'done' ? '✓' :
                                log.status === 'error' ? 'x' :
                                    log.status === 'active' ? '▸' : '•'}
                        </span>
                        <span className={cn(
                            "break-all",
                            log.status === 'active' ? "text-rs-white" :
                                log.status === 'done' ? "text-rs-gray-400" :
                                    log.status === 'error' ? "text-rs-signal" : "text-rs-gray-600"
                        )}>
                            {log.timestamp && <span className="text-rs-gray-700 mr-2 opacity-50">[{log.timestamp}]</span>}
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
