"use client";

import { Terminal, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

import { RSRiskBadge } from './RSRiskBadge';
import { RSButton } from './RSButton';

// Theme — CSS variable tokens (dark mode compatible, matches RSRiskPanel)
const RISK_THEME = {
    surface: "bg-[var(--rs-bg-surface)]",
    header: "bg-[var(--rs-bg-element)]",
    border: "border-[var(--rs-border-primary)]",
    text: "text-[var(--rs-text-primary)]",
    textMuted: "text-[var(--rs-gray-300)]",
    textDim: "text-[var(--rs-text-secondary)]"
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
    onUpgradeClick?: () => void;
    onOpenReport?: () => void;
    reportButtonLabel?: string;
    className?: string;
    /** When true, show loading skeleton instead of findings (detail fetch in progress) */
    isLoading?: boolean;
    /** When true, suppress the header and action area (for embedding in drawer) */
    compact?: boolean;
}

export function RSFindingsDossier({
    isComplete,
    findings,
    riskProfile,
    scanId,
    ctaMode = 'paid',
    onUpgradeClick,
    onOpenReport,
    reportButtonLabel,
    className,
    isLoading,
    compact,
}: RSFindingsDossierProps) {
    if (!isComplete) return null;

    // Loading skeleton while detail fetch is in progress
    if (isLoading) {
        return (
            <div className={cn("space-y-3", compact ? "py-2" : "p-8", className)}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="pl-6 border-l border-[var(--rs-border-primary)] py-1 animate-pulse">
                        <div className="h-3 w-32 bg-[var(--rs-bg-element)] rounded mb-2" />
                        <div className="h-2 w-full bg-[var(--rs-bg-element)] rounded mb-1" />
                        <div className="h-2 w-3/4 bg-[var(--rs-bg-element)] rounded" />
                    </div>
                ))}
            </div>
        );
    }

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
        // Always show all 3 persona cards — score=0 means "clear", not "skip"
        const { ip_report, safety_report, provenance_report } = riskProfile;

        if (ip_report) {
            displayFindings.push({
                id: 'ip',
                title: ip_report.score > 0 ? 'IP / Copyright' : 'No IP concerns detected',
                description: ip_report.teaser || (ip_report.score > 0 ? 'IP analysis complete.' : 'No significant similarity to known protected works detected.'),
                severity: ip_report.score > 70 ? 'critical' : ip_report.score > 40 ? 'high' : 'low',
                score: ip_report.score,
            });
        }

        if (safety_report) {
            displayFindings.push({
                id: 'safety',
                title: safety_report.score > 0 ? 'Brand Safety' : 'Content passes brand safety review',
                description: safety_report.teaser || (safety_report.score > 0 ? 'Safety analysis complete.' : 'No brand safety concerns detected.'),
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

    // Compact mode: just the findings list, no outer chrome
    if (compact) {
        return (
            <div className={cn("space-y-3", className)}>
                {displayFindings.length > 0 ? displayFindings.map((f) => (
                    <div key={f.id} className="group relative pl-6 border-l border-[var(--rs-border-primary)] py-0.5">
                        <div className={cn(
                            "absolute left-[-5px] top-2.5 w-[9px] h-[9px] rounded-full border border-[var(--rs-border-primary)] flex items-center justify-center",
                            RISK_THEME.surface
                        )}>
                            <div className={cn("w-1.5 h-1.5 rounded-full", severityToDotColor(f.severity))} />
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-primary)]">{f.title}</span>
                                <RSRiskBadge level={severityToLevel(f.severity)} size="sm" value={f.score} className="scale-[0.85] origin-left" />
                            </div>
                        </div>
                        <p className={cn("font-mono text-[10px] leading-snug pr-2 opacity-80", RISK_THEME.text)}>{f.description}</p>
                    </div>
                )) : (
                    <div className="text-center py-6">
                        <div className="w-10 h-10 mx-auto rounded-full bg-[var(--rs-safe)]/10 flex items-center justify-center mb-2">
                            <Terminal size={18} className="text-[var(--rs-safe)]" />
                        </div>
                        <span className="text-[12px] font-medium text-rs-text-secondary">All checks passed — no issues detected</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] overflow-hidden flex flex-col transition-colors duration-500",
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
                    <div className="font-mono text-[10px] text-[var(--rs-gray-500)] uppercase tracking-widest leading-none">Ref_{docRef}</div>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col p-8 pt-0 shrink-0">

                {/* Findings — expand to natural height, no inner scroll */}
                <div className="space-y-3 pt-6 pr-2">
                    {displayFindings.length > 0 ? displayFindings.map((f) => (
                        <div key={f.id} className="group relative pl-6 border-l border-[var(--rs-border-primary)] py-0.5">
                            {/* Marker */}
                            <div className={cn(
                                "absolute left-[-5px] top-2.5 w-[9px] h-[9px] rounded-full border border-[var(--rs-border-primary)] flex items-center justify-center",
                                RISK_THEME.surface
                            )}>
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    severityToDotColor(f.severity)
                                )} />
                            </div>

                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--rs-text-primary)]">{f.title}</span>
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
                            <div className="font-mono text-[10px] font-black uppercase tracking-widest text-center">
                                No_Significant_Deltas_Detected
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="mt-4 pt-4 border-t border-[var(--rs-border-primary)] flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-1">
                        <Info size={11} className={RISK_THEME.textMuted} />
                        <div className={cn("font-mono text-[10px] uppercase tracking-widest leading-tight", RISK_THEME.textMuted)}>
                            AI-Powered Analysis &middot; C2PA Verified
                        </div>
                    </div>

                    {ctaMode === 'free' ? (
                        <div className="flex flex-col gap-2">
                            <RSButton
                                variant="danger"
                                fullWidth
                                size="lg"
                                className="font-bold tracking-[0.15em] shadow-lg rounded-[2px]"
                                onClick={onUpgradeClick}
                            >
                                Get Mitigation Report — $29
                            </RSButton>
                            <p className={cn("font-mono text-[10px] uppercase tracking-widest text-center", RISK_THEME.textMuted)}>
                                One-time purchase &middot; Actionable remediation plan &middot; PDF export
                            </p>
                        </div>
                    ) : (
                        <RSButton
                            variant="primary"
                            fullWidth
                            size="lg"
                            className="font-bold tracking-[0.15em] shadow-lg rounded-[2px]"
                            onClick={() => {
                                if (onOpenReport) {
                                    onOpenReport();
                                    return;
                                }
                                if (scanId) window.location.href = `/dashboard?scan=${scanId}`;
                            }}
                        >
                            {reportButtonLabel || 'View Full Report'}
                        </RSButton>
                    )}
                </div>
            </div>
        </div>
    );
}
