"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSSystemLog } from '@/components/rs/RSSystemLog';
import { RSAnalogNeedle } from '@/components/rs/RSAnalogNeedle';
import { RSC2PAWidget } from '@/components/rs/RSC2PAWidget';
import { RSMeter } from '@/components/rs/RSMeter';
import { RSRiskBadge } from '@/components/rs/RSRiskBadge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const [scanStatus, setScanStatus] = React.useState<'idle' | 'scanning' | 'complete'>('idle');

    // Simulate Scan Sequence on Mount (or on click)
    React.useEffect(() => {
        const sequence = async () => {
            await new Promise(r => setTimeout(r, 1000)); // Initial Idle
            setScanStatus('scanning');
            await new Promise(r => setTimeout(r, 3000)); // Scan Duration
            setScanStatus('complete');
        };
        sequence();
    }, []);

    // Derived values based on state
    const isScanning = scanStatus === 'scanning';
    const isComplete = scanStatus === 'complete';

    // Final Results (only shown when complete, else 0 or jitter handled by component)
    const results = {
        ipRisk: isComplete ? 98 : 0,
        brandSafety: isComplete ? 5 : 0,
        provenance: isComplete ? 95 : 0
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full p-4 w-full min-h-[900px]">

            {/* LEFT PANE: PRIMARY SCANNER (65%) */}
            <div className="flex-[2] bg-[#121212] rounded-[32px] p-8 relative flex flex-col shadow-[var(--rs-shadow-l2)] border-[10px] border-[var(--rs-bg-surface)] overflow-hidden">

                {/* Dark Mode Chassis Overlay */}
                <div className="absolute inset-0 rounded-[22px] pointer-events-none border border-white/5 z-20" />

                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <div className="text-[#FF4F00] font-mono text-xs font-bold tracking-widest uppercase mb-1">Scanner_v2.0</div>
                        <div className="text-[#FF4F00]/40 font-mono text-[10px] tracking-widest uppercase">Buffer_Rdy</div>
                    </div>
                    <div className="text-[#FF4F00] font-mono text-[10px] tracking-widest uppercase">CH_01_INPUT</div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 flex items-center justify-center relative z-10 min-h-[400px]">
                    <div className="w-full max-w-2xl">
                        <RSScanner active={isScanning} status={scanStatus} className="border-0 bg-transparent shadow-none" />
                        {!isScanning && !isComplete && (
                            <div className="text-center mt-8">
                                <div className="inline-flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white/40">
                                        <div className="w-8 h-8 border-t-2 border-white/40" />
                                    </div>
                                    <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Drop file here or click to browse</p>
                                    <p className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Max 50MB • .JPG/.PNG/.MP4</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Log */}
                <div className="mt-8 relative z-10 opacity-80">
                    <RSSystemLog
                        logs={[
                            { id: '1', timestamp: '10:42:01', message: 'Initialize secure handshake...', status: 'done' },
                            { id: '2', timestamp: '10:42:05', message: 'Syncing with control node...', status: 'done' },
                            { id: '3', timestamp: '10:42:09', message: 'Analyzing stream...', status: isScanning ? 'active' : 'done' },
                        ]}
                        className="bg-black/50 border-white/10 text-white/60 h-40"
                    />
                </div>
            </div>

            {/* RIGHT PANE: ANALYSIS & TELEMETRY (35%) */}
            <div className="flex-1 flex flex-col gap-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 bg-[var(--rs-bg-surface)] p-4 rounded-xl border border-[var(--rs-border-primary)]/50 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[var(--rs-bg-element)] rounded-lg flex items-center justify-center border border-[var(--rs-border-primary)]">
                            <Shield size={14} className="text-[var(--rs-text-secondary)]" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-tertiary)]">Analysis Guidelines</div>
                            <div className="text-sm font-bold text-[var(--rs-text-primary)]">Acme Wine Co. Guidelines</div>
                        </div>
                    </div>
                </div>

                {/* RISK SCORE CARD */}
                <div className="bg-[var(--rs-bg-surface)] rounded-[32px] p-6 shadow-[var(--rs-shadow-l2)] flex flex-col justify-between min-h-[250px] relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-[var(--rs-text-secondary)] font-mono text-xs font-bold tracking-widest uppercase">Risk Analysis</div>
                            <div className="text-[var(--rs-text-tertiary)] font-mono text-[10px] tracking-widest uppercase mt-1">ID: -- VER: 2.4</div>
                        </div>
                        <RSRiskBadge level={isComplete ? "safe" : "unknown"} className={cn("text-white", isComplete ? "bg-[#006742]" : "bg-gray-500")} />
                    </div>

                    <div className="flex items-end justify-between mt-8">
                        <div className="text-8xl font-black tracking-tighter text-[var(--rs-text-primary)] rs-etched">
                            {isComplete ? '0%' : '--'}
                        </div>
                        <div className="flex-1 ml-12 pb-4">
                            <div className="flex justify-between items-center gap-4 text-[10px] font-bold uppercase text-[var(--rs-text-tertiary)] mb-2">
                                <span>Likelihood</span>
                                <span>Standby</span>
                            </div>
                            <RSMeter value={isComplete ? 0 : 0} level="safe" />
                            <div className="flex justify-between text-[9px] font-mono text-[var(--rs-text-tertiary)] mt-2 opacity-50">
                                <span>0</span>
                                <span>25</span>
                                <span>50</span>
                                <span>75</span>
                                <span>100</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DIALS CLUSTER (CONTAINED) */}
                <div className="bg-[var(--rs-bg-surface)] rounded-[32px] p-6 shadow-[var(--rs-shadow-l2)]">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center gap-4">
                            <RSAnalogNeedle isScanning={isScanning} value={results.ipRisk} label="IP Risk" size={120} />
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <RSAnalogNeedle isScanning={isScanning} value={results.brandSafety} label="Brand Safety" size={120} />
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <RSAnalogNeedle isScanning={isScanning} value={results.provenance} label="Provenance" size={120} />
                        </div>
                    </div>
                </div>

                {/* C2PA WIDGET (FRAMED) */}
                <div className="bg-[var(--rs-bg-surface)] rounded-[32px] p-3 shadow-[var(--rs-shadow-l2)] flex-1 min-h-[250px] flex flex-col">
                    <RSC2PAWidget className="flex-1 w-full h-full rounded-[24px]" />
                </div>

            </div>
        </div>
    );
}
