"use client";

import { Terminal, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import { RSRiskBadge } from './RSRiskBadge';
import { RSButton } from './RSButton';

interface RSFindingsDossierProps {
    isComplete: boolean;
    results: {
        ipRisk: number;
        brandSafety: number;
        provenance: number;
    };
}

export function RSFindingsDossier({ isComplete, results }: RSFindingsDossierProps) {
    if (!isComplete) return null;

    const findings = [
        results.ipRisk > 50 ? {
            id: 1,
            type: 'critical' as const,
            title: 'IP / Copyright',
            score: results.ipRisk,
            text: 'Asset displays direct reproduction of protected intellectual property. depiction is a standard, widely recognized iteration.'
        } : null,
        results.brandSafety > 0 ? {
            id: 2,
            type: 'safe' as const,
            title: 'Brand Safety',
            score: results.brandSafety,
            text: 'Image features recognized family-friendly characters. Considered low safety risk per standard brand guidelines.'
        } : null,
        results.provenance > 0 ? {
            id: 3,
            type: results.provenance > 50 ? ('critical' as const) : ('warning' as const),
            title: 'Provenance Gap',
            score: results.provenance,
            text: 'Absence of Content Credentials prevents verification of origin. Significant evidentiary gap in cryptographically verifiable chain.'
        } : {
            id: 3,
            type: 'safe' as const,
            title: 'Verified Armor',
            score: 0,
            text: 'C2PA digital signature verified. Asset is protected by a verifiable cryptographic chain, providing high legal defensibility.'
        }
    ].filter(Boolean);

    return (
        <div
            className="bg-[var(--rs-bg-surface)] rounded-[24px] border border-[var(--rs-border-primary)] flex-1 flex flex-col shadow-inner overflow-hidden text-[var(--rs-text-primary)] animate-in fade-in slide-in-from-bottom-4 duration-700 relative"
        >


            {/* Content Container */}
            <div className="relative z-10 flex flex-col h-full p-6 pt-8">

                {/* Header */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-[var(--rs-border-strong)] pb-3">
                    <div className="space-y-0.5">
                        <div className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--rs-text-primary)]">Key Findings</div>
                        <div className="font-mono text-[9px] opacity-40 uppercase tracking-widest">Doc_Ref_842-ALPHA</div>
                    </div>
                </div>

                {/* Scrollable Findings */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent">
                    {findings.length > 0 ? findings.map((f: any) => (
                        <div key={f.id} className="group relative pl-5 border-l border-[var(--rs-border-primary)] py-0.5">
                            {/* Marker */}
                            <div className="absolute left-[-5px] top-2.5 w-[10px] h-[10px] rounded-full bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] flex items-center justify-center">
                                <div className={cn(
                                    "w-1 h-1 rounded-full",
                                    f.type === 'critical' ? "bg-[var(--rs-risk-critical)]" : "bg-[var(--rs-risk-safe)]"
                                )} />
                            </div>

                            <div className="flex justify-between items-center mb-0.5">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-xs uppercase tracking-tight text-[var(--rs-text-primary)]">{f.title}</span>
                                    <RSRiskBadge
                                        level={f.type}
                                        size="sm"
                                        value={f.score}
                                        className="scale-[0.85] origin-left"
                                    />
                                </div>
                            </div>
                            <p className="font-mono text-[9px] leading-snug text-[var(--rs-text-secondary)] pr-2">
                                {f.text}
                            </p>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center py-6 gap-2 opacity-20">
                            <Terminal size={18} />
                            <div className="font-mono text-[9px] font-black uppercase tracking-widest text-center">
                                No_Significant_Deltas_Detected
                            </div>
                        </div>
                    )}
                </div>

                {/* Technical Footnote / Action Area */}
                <div className="mt-4 pt-4 border-t border-[var(--rs-border-primary)] flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-1">
                        <Info size={11} className="text-[var(--rs-text-tertiary)]" />
                        <div className="font-mono text-[7px] text-[var(--rs-text-tertiary)] uppercase tracking-widest leading-tight">
                            Calibration: ISO_882_PRIME // Verified Forensic Dataset
                        </div>
                    </div>

                    <RSButton
                        variant="danger"
                        fullWidth
                        size="lg"
                        className="font-bold tracking-[0.3em] shadow-lg"
                    >
                        Generate Mitigation Report
                    </RSButton>
                </div>
            </div>
        </div>
    );
}
