"use client";

import { Terminal, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import { RSRiskBadge } from './RSRiskBadge';
import { RSButton } from './RSButton';

// Theme Enforced by Design Lab (Matching RSRiskPanel)
const RISK_THEME = {
    surface: "bg-[#EBE9E4]",      // Warm white (Braun)
    header: "bg-[#F5F4F1]",       // Header contrast
    border: "border-[#D6D3CD]",   // Subtle border
    text: "text-[#1A1A1A]",       // Primary Ink
    textMuted: "text-[#B4B0AB]",  // Secondary Ink
    textDim: "text-[#666]"        // Tertiary Ink
};

interface RSFindingsDossierProps {
    isComplete: boolean;
    results: {
        ipRisk: number;
        brandSafety: number;
        provenance: number;
    };
    className?: string;
}

export function RSFindingsDossier({ isComplete, results, className }: RSFindingsDossierProps) {
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
            className={cn(
                "rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors duration-500",
                RISK_THEME.surface,
                RISK_THEME.border,
                "border",
                "font-sans",
                RISK_THEME.text,
                className
            )}
        >
            {/* Header - MATCHING RISK PANEL STRUCTURE */}
            <div className={cn("flex justify-between items-start px-8 py-6 shrink-0", RISK_THEME.header)}>
                <div className="space-y-1">
                    <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none", RISK_THEME.text)}>Key Findings</div>
                    <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest leading-none">Doc_Ref_842-ALPHA</div>
                </div>
            </div>

            {/* Content Container - PADDING MATCHING RISK PANEL (p-8) - TIGHTENED */}
            <div className="flex-1 flex flex-col p-8 pt-0 overflow-y-auto">

                {/* Scrollable Findings - TIGHTER SPACING (space-y-3) */}
                <div className="flex-1 overflow-y-auto space-y-3 pt-6 pr-2 scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent">
                    {findings.length > 0 ? findings.map((f: any) => (
                        <div key={f.id} className="group relative pl-6 border-l border-[#D6D3CD] py-0.5">
                            {/* Marker */}
                            <div className={cn(
                                "absolute left-[-5px] top-2.5 w-[9px] h-[9px] rounded-full border border-[#D6D3CD] flex items-center justify-center",
                                RISK_THEME.surface
                            )}>
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    f.type === 'critical' ? "bg-[var(--rs-signal)]" : "bg-[var(--rs-safe)]"
                                )} />
                            </div>

                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">{f.title}</span>
                                    <RSRiskBadge
                                        level={f.type}
                                        size="sm"
                                        value={f.score}
                                        className="scale-[0.85] origin-left"
                                    />
                                </div>
                            </div>
                            <p className={cn("font-mono text-[10px] leading-snug pr-2 opacity-80", RISK_THEME.text)}>
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

                {/* Technical Footnote / Action Area - TIGHTER SPACING */}
                <div className="mt-4 pt-4 border-t border-[#D6D3CD] flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-1">
                        <Info size={11} className={RISK_THEME.textMuted} />
                        <div className={cn("font-mono text-[8px] uppercase tracking-widest leading-tight", RISK_THEME.textMuted)}>
                            Calibration: ISO_882_PRIME // Verified Forensic Dataset
                        </div>
                    </div>

                    <RSButton
                        variant="danger"
                        fullWidth
                        size="lg"
                        className="font-bold tracking-[0.3em] shadow-lg rounded-[2px]"
                    >
                        Generate Mitigation Report
                    </RSButton>
                </div>
            </div>
        </div>
    );
}
