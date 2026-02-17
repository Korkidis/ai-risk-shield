"use client";

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RSRiskPanel } from '@/components/rs/RSRiskPanel';
import { RSScanner } from '@/components/rs/RSScanner';
import { RSFindingsDossier } from '@/components/rs/RSFindingsDossier';
import { RSBackground } from '@/components/rs/RSBackground';
import { Upload, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data for "Active" State matching the reference image (Mickey Mouse / 95% Risk)
const MOCK_RISK_PROFILE = {
    ip_report: { score: 98, teaser: 'Direct reproduction of protected Disney IP detected. Asset contains Mickey Mouse character likeness.' },
    safety_report: { score: 5, teaser: 'No brand safety concerns identified.' },
    provenance_report: { score: 80, teaser: 'Provenance verification indicates gaps in chain of custody.' },
};

export default function RamsRefreshPage() {
    const [viewState, setViewState] = useState<'idle' | 'active'>('idle');

    return (
        <RSBackground variant="technical" className="min-h-screen p-8 md:p-12 flex flex-col font-sans">

            {/* Control Bar (For Design Lab usage) */}
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-[#1A1A1A]">Design Protocol: v2.0</h1>
                    <p className="font-mono text-xs opacity-50 uppercase tracking-widest text-[#1A1A1A]">Dieter Rams "Ten Principles" Refresh</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setViewState('idle')}
                        className={cn(
                            "px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all",
                            viewState === 'idle' ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-transparent text-[#1A1A1A] border-[#1A1A1A]/20"
                        )}
                    >
                        State: Idle
                    </button>
                    <button
                        onClick={() => setViewState('active')}
                        className={cn(
                            "px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all",
                            viewState === 'active' ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-transparent text-[#1A1A1A] border-[#1A1A1A]/20"
                        )}
                    >
                        State: Active
                    </button>
                </div>
            </header>

            {/* MAIN GRID LAYOUT - STRICT ALIGNMENT & HOMEOSTASIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-[1600px] mx-auto h-[880px]">

                {/* --- LEFT COLUMN: MONOLITH (Connected Scanner & Telemetry) --- */}
                <div className="flex flex-col h-full rounded-2xl border border-[#333] shadow-xl overflow-hidden bg-[#111]">

                    {/* TOP: SCANNER */}
                    <div className="flex-[1.3] relative group border-b border-[#333]">
                        <div className="absolute top-6 left-8 z-50 pointer-events-none">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5F00] flex flex-col gap-1">
                                <span>Scanner_v2.0</span>
                                <span className="opacity-50 text-[9px] tracking-widest text-[#B4B0AB]">{viewState === 'idle' ? '● BUFFER_READY' : '● ANALYSIS_COMPLETE'}</span>
                            </div>
                        </div>
                        <div className="absolute top-6 right-8 z-50 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5F00] opacity-80 pointer-events-none">
                            CH_01_INPUT
                        </div>

                        <RSScanner
                            active={viewState === 'active'}
                            status={viewState === 'active' ? 'complete' : 'idle'}
                            imageUrl={viewState === 'active' ? "https://upload.wikimedia.org/wikipedia/en/d/d4/Mickey_Mouse.png" : undefined}
                            className={cn(
                                "w-full h-full bg-[#111] transition-all duration-500", // No border/radius/shadow here, handled by parent
                                viewState === 'active' ? "" : ""
                            )}
                        >
                            {viewState === 'idle' && (
                                <div className="border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center gap-6 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                                        <Upload className="w-6 h-6 text-white/60" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/60">Drop File Here</div>
                                        <div className="font-mono text-[9px] uppercase tracking-widest text-white/30">Supports All Forensic Formats</div>
                                    </div>
                                </div>
                            )}

                            {viewState === 'active' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-[#1A1A1A]/90 backdrop-blur border border-[#333] px-8 py-3 rounded-full mt-32 shadow-2xl">
                                        <span className="text-[#00FF94] font-mono text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Scan Complete</span>
                                    </div>
                                </div>
                            )}
                        </RSScanner>
                    </div>

                    {/* BOTTOM: TELEMETRY */}
                    <div className="flex-1 bg-[#111] relative flex flex-col">
                        {/* Header */}
                        <div className="flex justify-between items-start px-8 py-6 bg-[#161616] border-b border-[#222]">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-3 h-3 rounded-full shadow-sm bg-[#333] transition-colors", viewState === 'active' && "bg-[#FF5F00] animate-pulse")} />
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#888] leading-none mb-1">
                                        {viewState === 'idle' ? 'SYSTEM_READY' : 'TELEMETRY_ACTIVE'}
                                    </h2>
                                    <div className="font-mono text-[10px] text-[#444] uppercase tracking-widest leading-none">SYS.09 // LIVE_FEED</div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-5 content-start">
                            {[
                                { label: 'Manifest Store', val: 'MISSING', status: 'danger' },
                                { label: 'Claim Signature', val: 'MISSING', status: 'danger' },
                                { label: 'Signature Algorit_', val: 'SHA-256', status: 'neutral' },
                                { label: 'C2PA Version', val: 'v2.1', status: 'neutral' },
                                { label: 'AI Generated', val: viewState === 'active' ? 'ANALYZING' : '---', status: viewState === 'active' ? 'warning' : 'neutral' },
                                { label: 'Chain of Custody', val: viewState === 'active' ? 'SEGMENT_FAILURE' : '---', status: viewState === 'active' ? 'danger' : 'neutral' },
                                { label: 'Asset Hash', val: 'e2f0...9a12', status: 'neutral' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group h-5">
                                    <div className="flex items-center gap-3 w-[40%]">
                                        <div className={cn("w-1 h-1 rounded-full transition-colors", item.status === 'danger' ? "bg-[#FF5F00]" : item.status === 'warning' ? "bg-[#FFB800]" : "bg-[#333]")} />
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-[#666] group-hover:text-[#AAA] transition-colors truncate">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 mx-2">
                                        <div className="h-[1px] w-full bg-[#222] group-hover:bg-[#333] transition-colors" />
                                    </div>
                                    <span className={cn("font-mono text-[9px] font-bold uppercase tracking-widest text-right",
                                        item.status === 'danger' ? "text-[#FF5F00]" : item.status === 'warning' ? "text-[#FFB800]" : "text-[#444]"
                                    )}>
                                        {item.val}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="py-4 px-8 border-t border-[#222] bg-[#161616] flex justify-between items-center text-[#444]">
                            <div className="flex items-center gap-3">
                                <ShieldAlert size={12} className={viewState === 'active' ? "text-[#FF5F00]" : "text-[#333]"} />
                                <span className="font-mono text-[9px] uppercase tracking-widest text-[#666]">
                                    {viewState === 'active' ? "INTEGRITY_COMPROMISED" : "WAITING_FOR_INPUT"}
                                </span>
                            </div>
                            <div className="font-mono text-[9px] text-[#333]">SECURE_ENCLAVE_ACTIVE</div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: RISK & FINDINGS (Retaining Gap) --- */}
                <div className="flex flex-col gap-6 h-full">

                    {/* 1. RISK ANALYSIS PANEL */}
                    <div className="flex-[1.3] w-full min-h-0">
                        <RSRiskPanel
                            status={viewState === 'active' ? 'completed' : 'empty'}
                            id={viewState === 'active' ? "SVS-STD-01" : "--"}
                            score={viewState === 'active' ? 95 : 0}
                            level={viewState === 'active' ? 'critical' : 'safe'}
                            // "Reference Image" values: 98, 5, 80
                            ipScore={viewState === 'active' ? 98 : 0}
                            safetyScore={viewState === 'active' ? 5 : 0}
                            provenanceScore={viewState === 'active' ? 80 : 0}
                            className="w-full h-full rounded-2xl shadow-xl" // Explicit styling
                        />
                    </div>

                    {/* 2. FINDINGS DOSSIER */}
                    <div className="flex-1 w-full min-h-0 relative">
                        <AnimatePresence mode='wait'>
                            <RSFindingsDossier
                                key={viewState} // Force re-mount on state change for clean entry
                                isComplete={true}
                                riskProfile={viewState === 'active' ? MOCK_RISK_PROFILE : null}
                                scanId="DEMO-LAB"
                                ctaMode="paid"
                                className="w-full h-full rounded-2xl shadow-xl"
                            />
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </RSBackground>
    );
}
