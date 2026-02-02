"use client";

import { cn } from '@/lib/utils';
import { RSAnalogNeedle } from '@/components/rs/RSAnalogNeedle';
import { RiskLevel } from '@/components/rs/RSRiskScore';
import { motion } from 'framer-motion';

interface RSRiskPanelProps {
    id?: string;
    score: number;
    level: RiskLevel;
    ipScore: number;
    safetyScore: number;
    provenanceScore: number;
    status: 'empty' | 'scanning' | 'completed';
    className?: string;
}

// Theme Enforced by Design Lab
const RISK_THEME = {
    surface: "bg-[#EBE9E4]",      // Warm white (Braun)
    header: "bg-[#F5F4F1]",       // Header contrast
    border: "border-[#D6D3CD]",   // Subtle border
    text: "text-[#1A1A1A]",       // Primary Ink
    textMuted: "text-[#B4B0AB]",  // Secondary Ink
    textDim: "text-[#666]"        // Tertiary Ink
};

export function RSRiskPanel({
    id = "--",
    score,
    level,
    ipScore,
    safetyScore,
    provenanceScore,
    status,
    className
}: RSRiskPanelProps) {

    // Determine colors
    const colors = {
        critical: "var(--rs-signal)",
        high: "var(--rs-signal)",
        medium: "var(--rs-warning)",
        low: "var(--rs-safe)",
        safe: "var(--rs-safe)",
        warning: "var(--rs-warning)",
        info: "var(--rs-info)",
    };

    const activeColor = colors[level] || colors.info;
    const isScanning = status === 'scanning';
    const hasResult = status === 'completed';

    // Action Statement Logic
    let actionStatement = '';
    let headerStatus = '';

    if (status === 'empty') {
        actionStatement = 'Ready for Inspection.';
        headerStatus = 'SYSTEM IDLE';
    } else if (status === 'scanning') {
        actionStatement = 'Analysis in Progress.';
        headerStatus = 'PROCESSING';
    } else {
        actionStatement = level === 'critical' ? 'Immediate Remediation Required.' :
            level === 'safe' ? 'System Integrity Verified.' :
                'Review Flagged Content.';
        headerStatus = level === 'critical' ? 'CRITICAL THREAT' : 'SYSTEM SECURE';
    }

    // Helper Component for the Likelihood Bar (DRY)
    const LikelihoodBar = ({ className, hideLabel = false }: { className?: string, hideLabel?: boolean }) => (
        <div className={className}>
            {!hideLabel && (
                <div className="flex justify-between items-end mb-4">
                    <span className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", RISK_THEME.textMuted)}>Likelihood Probability</span>
                </div>
            )}
            <div className={cn("h-4 md:h-6 rounded-sm relative overflow-hidden shadow-inner border border-black/5", RISK_THEME.surface.replace('bg-[#EBE9E4]', 'bg-[#E5E1DA]'))}>
                <div className="absolute inset-0 flex justify-between px-0.5">
                    {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(tick => (
                        <div key={tick} className={cn("h-full w-[1px]", tick % 50 === 0 ? "bg-black/10 h-full" : "bg-black/5 h-2 mt-auto")} />
                    ))}
                </div>
                <motion.div
                    className="h-full relative"
                    style={{ backgroundColor: hasResult ? activeColor : 'transparent' }}
                    initial={{ width: 0 }}
                    animate={{ width: isScanning ? "100%" : `${score}%` }}
                    transition={{ duration: isScanning ? 2 : 1, ease: "easeOut", repeat: isScanning ? Infinity : 0 }}
                >
                    {isScanning && <div className="absolute inset-0 bg-white/30 animate-pulse" />}
                </motion.div>
            </div>
            <div className={cn("flex justify-between mt-2 text-[9px] font-mono", RISK_THEME.textMuted)}>
                <span>0%</span><span>50%</span><span>100%</span>
            </div>
        </div>
    );

    return (
        <div className={cn(
            "relative w-full rounded-[32px] shadow-2xl overflow-hidden flex flex-col transition-colors duration-500",
            RISK_THEME.surface,
            RISK_THEME.border,
            "border",
            "font-sans",
            RISK_THEME.text,
            className
        )}>
            {/* 1. Header Area - MINIMALIST RAMS */}
            <div className={cn("flex justify-between items-start px-8 py-6 md:px-12 md:py-8 shrink-0", RISK_THEME.header)}>
                {/* Just the ID and Status Dot. No noise. */}
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-3 h-3 rounded-full shadow-sm",
                        status === 'scanning' ? "bg-[var(--rs-text-primary)] animate-pulse" :
                            level === 'critical' ? 'bg-[var(--rs-signal)] animate-pulse' :
                                RISK_THEME.border.replace('border-', 'bg-') // Reuse border color for inactive dot
                    )} />
                    <div>
                        <h2 className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1", RISK_THEME.text)}>Risk Analysis Panel</h2>
                        <div className="font-mono text-[10px] text-[#888] uppercase tracking-widest leading-none">ID: {id}</div>
                    </div>
                </div>

                <div className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    level === 'critical' && status === 'completed' ? 'text-[var(--rs-signal)]' : 'text-[#888]'
                )}>
                    {headerStatus}
                </div>
            </div>

            <div className="p-8 md:p-12 pl-8 md:pl-16 flex-1 flex flex-col overflow-y-auto">
                {/* Main Content Grid */}
                <div className="flex flex-col xl:flex-row gap-8 xl:gap-12 shrink-0">

                    {/* LEFT COLUMN: Score & Action Statement (Flexible / Shrinkable) */}
                    <div className="flex-1 min-w-0 flex flex-col pt-2">
                        <div className="relative">

                            {/* Score Row: Flex on Mobile to accommodate Likelihood */}
                            <div className="flex items-start justify-between xl:block">
                                <div className={cn("text-[100px] xl:text-[100px] 2xl:text-[140px] leading-[0.8] font-black tracking-tighter", RISK_THEME.text)}>
                                    {isScanning ? (
                                        <motion.span
                                            animate={{ opacity: [0.3, 1, 0.3] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            --
                                        </motion.span>
                                    ) : (
                                        <div className="flex items-start">
                                            {score}
                                            <span className={cn("text-[30px] xl:text-[30px] 2xl:text-[40px] font-bold mt-6 xl:mt-4 2xl:mt-8", RISK_THEME.textMuted)}>%</span>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile-only Likelihood Bar (Right of numbers) */}
                                <LikelihoodBar className="block xl:hidden w-[160px] md:w-[240px] pt-4" hideLabel />
                            </div>

                            {/* Action Statement: Smaller, contained, no interference */}
                            <div className="mt-6 pr-4 max-w-[240px] xl:max-w-[280px]">
                                <h3 className={cn(
                                    "text-xl md:text-2xl leading-tight tracking-tight",
                                    RISK_THEME.text,
                                    level === 'critical' ? "font-normal" : "font-light"
                                )}>
                                    {actionStatement}
                                </h3>
                                <div className={cn(
                                    "h-1 w-12 mt-4",
                                    level === 'critical' ? "bg-[var(--rs-signal)]" : RISK_THEME.text.replace('text-', 'bg-')
                                )} />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Likelihood + Analog Dials (Prioritized Width) */}
                    <div className="flex-[1.5] flex flex-col min-w-0 pt-2 gap-8">

                        {/* 1. Likelihood Bar (Desktop Only) */}
                        <LikelihoodBar className="hidden xl:block w-full" />

                        {/* 2. AUXILIARY DIALS (Directly on panel, no card) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mt-4 md:mt-auto">
                            {[
                                { label: 'IP_RISK', val: ipScore, lvl: ipScore > 50 ? 'critical' : 'safe' },
                                { label: 'BRAND_SAFETY', val: safetyScore, lvl: safetyScore > 50 ? 'critical' : 'safe' },
                                { label: 'PROVENANCE', val: provenanceScore, lvl: provenanceScore < 50 ? 'safe' : 'critical' }
                            ].map((dial, i) => (
                                <RSAnalogNeedle
                                    key={i}
                                    value={dial.val}
                                    label={dial.label}
                                    fluid={true}
                                    isScanning={isScanning}
                                    powered={status !== 'empty'}
                                />
                            ))}
                        </div>
                    </div>
                </div>


            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply bg-[url('/noise.png')]" />
        </div>
    );
}
