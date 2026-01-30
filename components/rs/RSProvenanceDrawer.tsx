"use client";

import { cn } from '@/lib/utils';
import { RSButton } from './RSButton';
import {
    X,
    Calendar,
    Cpu,
    UserCheck,
    Lock,
    ExternalLink,
    Info
} from 'lucide-react';

interface RSProvenanceDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'valid' | 'missing' | 'invalid' | 'error';
    details?: {
        creator?: string;
        tool?: string;
        date?: string;
        issuer?: string;
        serial?: string;
        history?: { action: string; tool: string; date: string }[];
    };
}

export function RSProvenanceDrawer({ isOpen, onClose, status, details }: RSProvenanceDrawerProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-xl bg-rs-bg-surface-2 h-full shadow-[var(--rs-shadow-l3)] flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-rs-border-primary">
                {/* Header */}
                <div className="p-8 border-b border-rs-border-primary flex justify-between items-center bg-rs-bg-surface">
                    <div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-white">Forensic Provenance Review</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                status === 'valid' ? "bg-rs-safe" :
                                    status === 'invalid' ? "bg-rs-signal" :
                                        status === 'missing' ? "bg-rs-risk-review" : "bg-rs-gray-400"
                            )} />
                            <span className="font-mono text-[10px] uppercase font-bold text-rs-text-tertiary">
                                Status: {status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-rs-bg-menu-hover/10 transition-colors"
                    >
                        <X size={20} className="text-rs-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">

                    {/* Legal Context Note */}
                    <div className="bg-rs-bg-surface-3 rounded-2xl p-6 border border-rs-border-secondary">
                        <div className="flex gap-3">
                            <Info size={18} className="text-rs-signal shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-rs-text-primary">Defense Utility Note</h4>
                                <p className="text-xs text-rs-text-secondary leading-relaxed italic">
                                    {status === 'valid'
                                        ? "This asset is armored with C2PA Content Credentials. In the event of an IP dispute, this manifest serves as cryptographically verifiable evidence of your acquisition and generation chain."
                                        : status === 'missing'
                                            ? "No Content Credentials detected. While common in emerging standards, the lack of provenance increases your 'Evidentiary Gap' in legal disputes. Consider using tools like Firefly or DALL-E 3 that support C2PA signing."
                                            : "This asset contains BROKEN or TAMPERED credentials. The risk of legal challenge is significantly higher as original origin can no longer be verified."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Primary Facts Table */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary pl-1">Primary Assertions</h3>
                        <div className="bg-rs-bg-surface-3 border border-rs-border-secondary rounded-2xl overflow-hidden divide-y divide-rs-border-secondary">
                            <FactRow label="Creator Identity" value={details?.creator || 'Unknown / Unsigned'} icon={<UserCheck size={14} />} />
                            <FactRow label="Generation Tool" value={details?.tool || 'Generic AI Engine'} icon={<Cpu size={14} />} />
                            <FactRow label="Acquisition Date" value={details?.date || 'Undetermined'} icon={<Calendar size={14} />} />
                            <FactRow label="Signature Authority" value={details?.issuer || 'Self-Signed / No CA'} icon={<Lock size={14} />} />
                        </div>
                    </section>

                    {/* Visual Edit History Chain */}
                    <section className="space-y-6 pt-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rs-text-tertiary pl-1">Provenance Timeline</h3>
                            <span className="text-[9px] font-mono text-[#1A1A1A]/40">C2PA_VER_1.3</span>
                        </div>

                        <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-[#D6CEC1]">
                            {details?.history?.map((entry, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="absolute -left-[25px] top-1.5 w-[14px] h-[14px] rounded-full bg-[#EAE6D9] border-2 border-[#1A1A1A] z-10" />
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-rs-signal">{entry.action}</div>
                                        <div className="text-sm font-bold text-[#1A1A1A]">{entry.tool}</div>
                                        <div className="text-[10px] font-mono opacity-40">{entry.date}</div>
                                    </div>
                                </div>
                            )) || (
                                    <div className="text-sm text-[#1A1A1A]/40 italic py-4">No historical assertions available for this manifest.</div>
                                )}
                        </div>
                    </section>

                    {/* Cryptographic specifics */}
                    <section className="space-y-4 pt-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]/40 pl-1">Cryptographic Evidence</h3>
                        <div className="bg-[#1A1A1A] rounded-2xl p-6 font-mono text-[10px] text-[#A19D92] space-y-2 overflow-x-auto shadow-inner">
                            <div className="flex justify-between">
                                <span className="text-[#666]">Hash Algorithm:</span>
                                <span>SHA-256</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#666]">Signer Serial:</span>
                                <span>{details?.serial || '---'}</span>
                            </div>
                            <div className="mt-4 border-t border-white/5 pt-4 opacity-50 text-[9px] leading-relaxed">
                                RAW_MANIFEST_EXTRACT_ID: {status === 'valid' ? 'b4f2...9a11' : 'NULL'}
                                <br />
                                VERIFICATION_GATEWAY: CLOUD_C2PA_NODE_04
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-[#D6CEC1] bg-[#E2DDCF] flex gap-4">
                    <RSButton
                        variant="primary"
                        fullWidth
                        onClick={onClose}
                    >
                        Close Analysis
                    </RSButton>
                    <RSButton
                        variant="secondary"
                        icon={<ExternalLink size={14} />}
                        onClick={() => window.open('https://contentcredentials.org/verify', '_blank')}
                    >
                        Verify Externally
                    </RSButton>
                </div>
            </div>
        </div>
    );
}

function FactRow({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 p-4 group hover:bg-[#1A1A1A]/5 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#EAE6D9] border border-[#D6CEC1] flex items-center justify-center text-[#1A1A1A]/40 group-hover:bg-white transition-all">
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/40 mb-0.5">{label}</div>
                <div className="text-sm font-bold text-[#1A1A1A]">{value}</div>
            </div>
        </div>
    );
}
