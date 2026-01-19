"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { RSButton } from './RSButton';

interface RSC2PAWidgetProps {
    className?: string;
}

export function RSC2PAWidget({ className }: RSC2PAWidgetProps) {
    const [status, setStatus] = useState<'idle' | 'tracking' | 'verified'>('tracking');

    return (
        <div className={cn("bg-[#121212] border-[10px] border-[var(--rs-bg-surface)] rounded-[32px] shadow-[var(--rs-shadow-l2)] relative overflow-hidden", className)}>

            {/* Dark Mode Chassis Overlay */}
            <div className="absolute inset-0 rounded-[22px] pointer-events-none border border-white/5 z-20" />

            <div className="p-8 h-full flex flex-col justify-between relative z-10 font-mono text-xs">

                {/* Header */}
                <div className="flex justify-between items-start mb-8 opacity-70">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#FF4F00] animate-pulse" />
                            <h3 className="text-[#FF4F00] font-bold tracking-widest uppercase">Provenance_Chain_Log</h3>
                        </div>
                        <span className="text-[10px] text-[#FF4F00]/50 pl-4 uppercase">Module: C2PA-VERIFIER-09</span>
                    </div>
                    <div className="text-right text-[#333] uppercase space-y-1">
                        <div>Status: Standby</div>
                        <div>Pack: ---</div>
                    </div>
                </div>

                {/* Data Rows */}
                <div className="space-y-6 flex-1">
                    <DataRow label="MANIFEST_STORE" value="SEARCHING..." status="param" />

                    <DataRow label="CLAIM_SIGNATURE" value="VERIFYING" progress={75} color="#FF4F00" />

                    <DataRow label="ASSERTION_STORE" value="LOADING" progress={40} color="#FF4F00" />

                    <DataRow label="THUMBNAIL_HASH" value="PENDING" status="dim" />
                </div>

                {/* Footer Controls */}
                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                    <div className="flex gap-6 text-[10px] text-[#666] uppercase tracking-widest">
                        <span>Buffer: Empty</span>
                        <span>Rec: Idle</span>
                    </div>
                    <div>
                        <RSButton variant="danger" size="sm" className="text-[10px] px-6 h-8">Emergency Stop</RSButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DataRow({ label, value, progress, color, status }: { label: string, value: string, progress?: number, color?: string, status?: 'param' | 'dim' }) {
    return (
        <div className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-4 text-[#666] font-bold tracking-widest uppercase text-[10px]">{label}</div>

            <div className="col-span-8 flex items-center gap-4">
                {progress !== undefined ? (
                    <div className="flex-1 h-1 bg-[#222] rounded-full overflow-hidden relative">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${progress}%`, backgroundColor: color }}
                        />
                    </div>
                ) : (
                    <div className={cn(
                        "flex-1 text-right tracking-widest uppercase text-[10px]",
                        status === 'param' ? "text-[#FF4F00]" : "text-[#333]"
                    )}>
                        {value}
                    </div>
                )}

                {progress !== undefined && (
                    <div className="w-20 text-right text-[#FF4F00] text-[10px] tracking-widest uppercase font-bold">{value}</div>
                )}
            </div>
        </div>
    )
}
