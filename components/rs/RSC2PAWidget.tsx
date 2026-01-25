"use client";

import { cn } from '@/lib/utils';
import { RSButton } from './RSButton';
import { ShieldCheck, Calendar, Cpu, UserCheck } from 'lucide-react';

interface RSC2PAWidgetProps {
    className?: string;
    isComplete?: boolean;
    data?: any;
}

export function RSC2PAWidget({ className, isComplete = false }: RSC2PAWidgetProps) {
    return (
        <div className={cn("bg-[#121212] border-[10px] border-[var(--rs-bg-surface)] rounded-[32px] shadow-[var(--rs-shadow-l2)] relative overflow-hidden", className)}>

            {/* Dark Mode Chassis Overlay */}
            <div className="absolute inset-0 rounded-[22px] pointer-events-none border border-white/5 z-20" />

            <div className="p-8 h-full flex flex-col justify-between relative z-10 font-mono text-xs">

                {/* Header */}
                <div className="flex justify-between items-start mb-8 opacity-70">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", isComplete ? "bg-emerald-500" : "bg-[#FF4F00] animate-pulse")} />
                            <h3 className={cn("font-bold tracking-widest uppercase", isComplete ? "text-emerald-500" : "text-[#FF4F00]")}>
                                {isComplete ? 'PROVENANCE_STORE_VERIFIED' : 'Provenance_Chain_Log'}
                            </h3>
                        </div>
                        <span className="text-[10px] text-white/30 pl-4 uppercase">Protocol: C2PA v1.3 / ISO 21812</span>
                    </div>
                </div>

                {/* Data Section */}
                {!isComplete ? (
                    <div className="space-y-6 flex-1">
                        <DataRow label="MANIFEST_STORE" value="SEARCHING..." status="param" />
                        <DataRow label="CLAIM_SIGNATURE" value="VERIFYING" progress={75} color="#FF4F00" />
                        <DataRow label="ASSERTION_STORE" value="LOADING" progress={40} color="#FF4F00" />
                        <DataRow label="THUMBNAIL_HASH" value="PENDING" status="dim" />
                    </div>
                ) : (
                    <div className="space-y-4 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* THE CHAIN (Visual Nodes) */}
                        <div className="flex flex-col gap-4">
                            <ChainLink
                                icon={<Cpu size={14} />}
                                label="Hardware Acquisition"
                                value="Canon EOS R5"
                                timestamp="2025-01-24 14:02 UTC"
                            />
                            <div className="w-px h-4 bg-emerald-500/20 ml-5" />
                            <ChainLink
                                icon={<UserCheck size={14} />}
                                label="Signed Identity"
                                value="Adobe Content Authenticity"
                                subValue="Verified Institution"
                            />
                            <div className="w-px h-4 bg-emerald-500/20 ml-5" />
                            <ChainLink
                                icon={<ShieldCheck size={14} />}
                                label="Manifest Validity"
                                value="SHA-256 Checksum Match"
                                status="verified"
                            />
                        </div>
                    </div>
                )}

                {/* Footer Controls */}
                <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 text-[10px] uppercase tracking-widest">
                    <div className="flex gap-6 text-[#666]">
                        <span className="flex items-center gap-2">
                            <Calendar size={10} />
                            UTC: {new Date().toISOString().split('T')[0]}
                        </span>
                        <span className="text-emerald-500/60">{isComplete ? "ECC_256_VALID" : "SCANNING..."}</span>
                    </div>
                    <div>
                        {isComplete ? (
                            <span className="text-[#666] italic">Encrypted Payload Secure</span>
                        ) : (
                            <RSButton variant="danger" size="sm" className="text-[10px] px-6 h-8">Emergency Stop</RSButton>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChainLink({ icon, label, value, subValue, timestamp, status }: {
    icon: React.ReactNode,
    label: string,
    value: string,
    subValue?: string,
    timestamp?: string,
    status?: 'verified'
}) {
    return (
        <div className="flex gap-4 group">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500",
                status === 'verified' ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500" : "bg-white/5 border-white/10 text-white/40"
            )}>
                {icon}
            </div>
            <div className="flex flex-col justify-center gap-0.5">
                <div className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{label}</div>
                <div className="text-xs text-white/90 font-bold">{value}</div>
                {(subValue || timestamp) && (
                    <div className="text-[9px] text-white/20 uppercase">{subValue || timestamp}</div>
                )}
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

