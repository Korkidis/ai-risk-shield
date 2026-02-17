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

// Severity → RSRiskBadge level mapping
const severityToLevel = (severity: string): 'critical' | 'high' | 'warning' | 'safe' | 'info' => {
    switch (severity) {
        case 'critical': return 'critical';
        case 'high': return 'high';
        case 'medium': return 'warning';
        case 'low': return 'safe';
        default: return 'info';
    }
};

// Severity → dot color mapping
const severityToDotColor = (severity: string): string => {
    switch (severity) {
        case 'critical':
        case 'high': return "bg-[var(--rs-signal)]";
        case 'medium': return "bg-[var(--rs-risk-caution)]";
        default: return "bg-[var(--rs-safe)]";
    }
};

interface Finding {
    id: string | number;
    title: string;
    description: string;
    severity: string;
    score?: number;
    confidence_score?: number;
}

interface RSFindingsDossierProps {
    isComplete: boolean;
    // Rich data: actual findings from scan_findings table
    findings?: Finding[];
    // Fallback: risk profile teasers from Gemini analysis
    riskProfile?: {
        ip_report?: { score: number; teaser?: string; };
        safety_report?: { score: number; teaser?: string; };
        provenance_report?: { score: number; teaser?: string; };
    } | null;
    scanId?: string;
    ctaMode?: 'free' | 'paid';
    className?: string;
}

export function RSFindingsDossier({ isComplete, findings, riskProfile, scanId, ctaMode = 'paid', className }: RSFindingsDossierProps) {
    if (!isComplete) return null;

    // Build display findings from best available source
    let displayFindings: Finding[] = [];

    if (findings && findings.length > 0) {
        // Best path: real scan_findings from DB
        displayFindings = findings.map((f, i) => ({
            id: f.id || i,
            title: f.title,
            description: f.description,
            severity: f.severity,
            score: f.confidence_score ?? f.score,
        }));
    } else if (riskProfile) {
        // Fallback: derive from risk profile teasers (still real Gemini text)
        const { ip_report, safety_report, provenance_report } = riskProfile;

        if (ip_report && ip_report.score > 0) {
            displayFindings.push({
                id: 'ip',
                title: 'IP / Copyright',
                description: ip_report.teaser || 'IP analysis complete.',
                severity: ip_report.score > 70 ? 'critical' : ip_report.score > 40 ? 'high' : 'low',
                score: ip_report.score,
            });
        }

        if (safety_report && safety_report.score > 0) {
            displayFindings.push({
                id: 'safety',
                title: 'Brand Safety',
                description: safety_report.teaser || 'Safety analysis complete.',
                severity: safety_report.score > 70 ? 'critical' : safety_report.score > 40 ? 'high' : 'low',
                score: safety_report.score,
            });
        }

        if (provenance_report) {
            displayFindings.push({
                id: 'provenance',
                title: provenance_report.score > 30 ? 'Provenance Gap' : 'Verified Armor',
                description: provenance_report.teaser || (provenance_report.score > 30
                    ? 'Provenance verification indicates gaps in chain of custody.'
                    : 'C2PA digital signature verified. Asset is protected by a verifiable cryptographic chain.'),
                severity: provenance_report.score > 50 ? 'critical' : provenance_report.score > 30 ? 'medium' : 'low',
                score: provenance_report.score,
            });
        }
    }

    const docRef = scanId ? scanId.slice(0, 8).toUpperCase() : '---';

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
                    <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest leading-none">Ref_{docRef}</div>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col p-8 pt-0 overflow-y-auto">

                {/* Scrollable Findings */}
                <div className="flex-1 overflow-y-auto space-y-3 pt-6 pr-2 scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent">
                    {displayFindings.length > 0 ? displayFindings.map((f) => (
                        <div key={f.id} className="group relative pl-6 border-l border-[#D6D3CD] py-0.5">
                            {/* Marker */}
                            <div className={cn(
                                "absolute left-[-5px] top-2.5 w-[9px] h-[9px] rounded-full border border-[#D6D3CD] flex items-center justify-center",
                                RISK_THEME.surface
                            )}>
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    severityToDotColor(f.severity)
                                )} />
                            </div>

                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">{f.title}</span>
                                    <RSRiskBadge
                                        level={severityToLevel(f.severity)}
                                        size="sm"
                                        value={f.score}
                                        className="scale-[0.85] origin-left"
                                    />
                                </div>
                            </div>
                            <p className={cn("font-mono text-[10px] leading-snug pr-2 opacity-80", RISK_THEME.text)}>
                                {f.description}
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

                {/* Action Area */}
                <div className="mt-4 pt-4 border-t border-[#D6D3CD] flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-1">
                        <Info size={11} className={RISK_THEME.textMuted} />
                        <div className={cn("font-mono text-[8px] uppercase tracking-widest leading-tight", RISK_THEME.textMuted)}>
                            Analysis: Gemini 2.5 Flash // Multi-Persona Forensic Pipeline
                        </div>
                    </div>

                    {ctaMode === 'free' ? (
                        <RSButton
                            variant="danger"
                            fullWidth
                            size="lg"
                            className="font-bold tracking-[0.3em] shadow-lg rounded-[2px]"
                        >
                            Unlock Full Report
                        </RSButton>
                    ) : (
                        <RSButton
                            variant="danger"
                            fullWidth
                            size="lg"
                            className="font-bold tracking-[0.3em] shadow-lg rounded-[2px] opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Mitigation Report — Coming Soon
                        </RSButton>
                    )}
                </div>
            </div>
        </div>
    );
}
