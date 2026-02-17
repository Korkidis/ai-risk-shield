"use client";

import { cn } from '@/lib/utils';
import { RSButton } from './RSButton';
import { ShieldCheck, Calendar, Cpu, UserCheck, AlertTriangle, FileSearch, Fingerprint } from 'lucide-react';
import React from 'react';

interface RSC2PAWidgetProps {
    className?: string;
    isComplete?: boolean;
    status?: 'valid' | 'missing' | 'invalid' | 'error' | 'caution';
    onViewDetails?: () => void;
    showOverlay?: boolean;
}

export function RSC2PAWidget({ className, isComplete = false, status = 'valid', onViewDetails, showOverlay = true }: RSC2PAWidgetProps) {

    const getStatusConfig = () => {
        switch (status) {
            case 'valid':
                return {
                    label: 'PROVENANCE_STORE_VERIFIED',
                    color: 'text-rs-safe',
                    dot: 'bg-rs-safe',
                    desc: 'C2PA Manifest Validated • Legally Defensible',
                };
            case 'missing':
                return {
                    label: 'NO_PROVENANCE_DETECTED',
                    color: 'text-rs-risk-review',
                    dot: 'bg-rs-risk-review',
                    desc: 'Missing Metadata • Elevated Content Risk',
                };
            case 'caution':
                return {
                    label: 'PROVENANCE_PARTIAL_MATCH',
                    color: 'text-rs-risk-caution',
                    dot: 'bg-rs-risk-caution',
                    desc: 'Non-Standard Structure • Verified via Fallback Manifest',
                };
            case 'invalid':
                return {
                    label: 'C2PA_TAMPER_DETECTED',
                    color: 'text-rs-signal',
                    dot: 'bg-rs-signal',
                    desc: 'Broken Signature • Unauthorized Edits Detected',
                };
            case 'error':
                return {
                    label: 'C2PA_EXTRACTION_FAILURE',
                    color: 'text-gray-400',
                    dot: 'bg-gray-400',
                    desc: 'Corrupt Payload • Forensic Analysis Blocked',
                };
            default:
                return {
                    label: 'Provenance_Chain_Log',
                    color: 'text-rs-signal',
                    dot: 'bg-rs-signal',
                    desc: 'Protocol: C2PA v1.3 / ISO 21812',
                };
        }
    };


    const config = getStatusConfig();
    const isErrorState = status !== 'valid';

    return (
        <div className={cn("bg-rs-black rounded-[var(--rs-radius-chassis)] border border-[var(--rs-border-primary)] relative overflow-hidden", className)}>
            <div className="p-8 h-full flex flex-col justify-between relative z-10 font-mono text-xs">

                {/* Header */}
                <div className="flex flex-col gap-1 mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-2 rounded-full", isComplete ? config.dot : "bg-rs-signal animate-pulse shadow-[0_0_8px_var(--rs-signal)]")} />
                        <h3 className={cn("text-[11px] font-black tracking-[0.15em] uppercase", isComplete ? config.color : "text-rs-signal")}>
                            {isComplete ? config.label : 'PROVENANCE_CHAIN_LOG'}
                        </h3>
                    </div>
                </div>

                {/* Main Audit History - Always Visible */}
                <div className="flex-1 relative min-h-0">
                    <div className={cn("space-y-6 animate-in fade-in duration-700", isErrorState && showOverlay && "opacity-20 blur-[1px]")}>
                        <div className="grid grid-cols-4 gap-6 p-5 bg-[var(--rs-bg-element)]/50 rounded-2xl border border-[var(--rs-border-secondary)] shadow-inner leading-none">
                            <MiniFact icon={<UserCheck size={12} />} label="Creator" value={status === 'valid' ? "Verified" : "--"} />
                            <MiniFact icon={<Cpu size={12} />} label="Tool" value={status === 'valid' ? "Trusted" : "--"} />
                            <MiniFact icon={<Calendar size={12} />} label="Signed" value={status === 'valid' ? "Valid" : "--"} />
                            <MiniFact icon={<ShieldCheck size={12} />} label="Status" value={status === 'valid' ? "Secure" : "UNSTABLE"} />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="text-[8px] font-black text-[var(--rs-text-tertiary)] tracking-[0.2em] uppercase pl-2">Provenance_Audit_History</div>
                            <div className="space-y-3">
                                <FinalStep label="Signature Check" result={status === 'valid' ? "Verified" : "Missing"} status={status === 'valid' ? "success" : "danger"} />
                                <FinalStep label="Manifest Integrity" result={status === 'valid' ? "Authenticated" : "Unverified"} status={status === 'valid' ? "success" : "danger"} />
                                <FinalStep label="Chain of Custody" result={status === 'valid' ? "Full/Valid" : "Incomplete"} status={status === 'valid' ? "success" : "danger"} />
                            </div>
                        </div>
                    </div>

                    {/* Warning Overlay */}
                    {isErrorState && showOverlay && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-500 z-20">
                            <div className="bg-rs-black/80 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl max-w-sm">
                                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center bg-white/5 border border-white/5 mx-auto mb-6", config.color)}>
                                    <AlertTriangle size={28} />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-black text-white text-[11px] uppercase tracking-[0.2em]">{status === 'missing' ? 'Provenance Deficiency' : 'Integrity Failure'}</h4>
                                    <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                                        {status === 'missing'
                                            ? "This content lacks C2PA credentials. Source asset originates from non-compliant engine. Legal defensibility: CRITICAL_GAP."
                                            : "WARNING: Cryptographic mismatch. Manifest tampered post-verification. Forensic weight: ZERO."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="mt-8 flex items-center justify-between border-t border-[var(--rs-border-secondary)] pt-6 relative z-30">
                    <div className="flex gap-8 text-[9px] font-bold tracking-widest text-white/20 uppercase">
                        <span className="flex items-center gap-2">
                            <Fingerprint size={12} />
                            Protocol: C2PA_1.3
                        </span>
                        <span className={cn(config.color)}>
                            Status: {status.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <RSButton
                            variant="ghost"
                            size="sm"
                            className="text-white/60 hover:text-rs-signal flex gap-2 text-[9px] font-black tracking-widest uppercase transition-colors"
                            onClick={onViewDetails}
                        >
                            <FileSearch size={14} />
                            View Forensic Metadata
                        </RSButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniFact({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1.5 overflow-hidden">
            <div className="flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-widest truncate">
                {icon} {label}
            </div>
            <div className="text-white/90 font-bold text-[10px] tracking-tight truncate">{value}</div>
        </div>
    );
}

function FinalStep({ label, result, status }: { label: string, result: string, status: 'success' | 'warning' | 'danger' }) {
    return (
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--rs-bg-element)]/30 border border-[var(--rs-border-secondary)] rounded-lg">
            <span className="text-[9px] font-bold text-[var(--rs-text-tertiary)] uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-3">
                <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest",
                    status === 'success' ? "text-rs-safe" : status === 'warning' ? "text-rs-risk-review" : "text-rs-signal"
                )}>
                    {result}
                </span>
                <div className={cn("w-1 h-1 rounded-full",
                    status === 'success' ? "bg-rs-safe" : status === 'warning' ? "bg-rs-risk-review" : "bg-rs-signal"
                )} />
            </div>
        </div>
    );
}
