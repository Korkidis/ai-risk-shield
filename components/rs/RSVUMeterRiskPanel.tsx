"use client";

import { cn } from '@/lib/utils';
import { RiskLevel } from '@/components/rs/RSRiskScore';
import { motion } from 'framer-motion';
import { RSVUMeter } from '@/components/rs/RSVUMeter';

interface RSVUMeterRiskPanelProps {
    id?: string;
    score: number;
    level: RiskLevel;
    ipScore: number;
    safetyScore: number;
    provenanceScore: number;
    status: 'empty' | 'scanning' | 'completed';
    className?: string;
}

// Theme — CSS variable tokens (dark mode compatible)
const RISK_THEME = {
    surface: "bg-[var(--rs-bg-surface)]",
    header: "bg-[var(--rs-bg-element)]",
    border: "border-[var(--rs-border-primary)]",
    text: "text-[var(--rs-text-primary)]",
    textMuted: "text-[var(--rs-gray-300)]",
    textDim: "text-[var(--rs-text-secondary)]"
};

export function RSVUMeterRiskPanel({
    id = "--",
    score,
    level,
    ipScore,
    safetyScore,
    provenanceScore,
    status,
    className
}: RSVUMeterRiskPanelProps) {

    const isScanning = status === 'scanning';

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

    return (
        <div className={cn(
            "relative w-full rounded-[var(--rs-radius-container)] shadow-[var(--rs-shadow-l2)] overflow-hidden flex flex-col transition-colors duration-500",
            RISK_THEME.surface,
            RISK_THEME.border,
            "border",
            "font-sans",
            RISK_THEME.text,
            className
        )}>
            {/* 1. Header Area - MINIMALIST RAMS */}
            <div className={cn("flex justify-between items-start px-8 py-6 shrink-0", RISK_THEME.header)}>
                {/* Just the ID and Status Dot. No noise. */}
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-3 h-3",
                        status === 'scanning' ? "bg-[var(--rs-text-primary)] animate-pulse" :
                            level === 'critical' ? 'bg-[var(--rs-signal)] animate-pulse' :
                                "bg-[var(--rs-border-primary)]"
                    )} />
                    <div>
                        <h2 className={cn("text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-1", RISK_THEME.text)}>Risk Analysis Panel</h2>
                        <div className="font-mono text-[10px] text-[var(--rs-gray-500)] uppercase tracking-widest leading-none">ID: {id}</div>
                    </div>
                </div>

                <div className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    level === 'critical' && status === 'completed' ? 'text-[var(--rs-signal)]' : 'text-[var(--rs-gray-500)]'
                )}>
                    {headerStatus}
                </div>
            </div>

            <div className="p-8 flex-1 flex flex-col overflow-y-auto w-full">
                {/* Main Content Grid - TIGHTER GAP */}
                <div className="flex flex-col md:flex-row gap-8 shrink-0 justify-between items-center w-full">

                    {/* LEFT COLUMN: Score & Action Statement */}
                    <div className="flex flex-col min-w-[280px]">
                        <div className={cn("text-[85px] xl:text-[100px] 2xl:text-[120px] leading-[0.85] font-black tracking-tighter", RISK_THEME.text)}>
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
                                    <span className={cn("text-[24px] xl:text-[24px] 2xl:text-[32px] font-bold mt-4 xl:mt-3 2xl:mt-6", RISK_THEME.textMuted)}>%</span>
                                </div>
                            )}
                        </div>

                        {/* Action Statement: Smaller, contained, no interference */}
                        <div className="mt-6">
                            <h3 className={cn(
                                "text-lg md:text-xl leading-tight tracking-tight",
                                RISK_THEME.text,
                                level === 'critical' ? "font-normal" : "font-light"
                            )}>
                                {actionStatement}
                            </h3>
                            <div className={cn(
                                "h-1 w-8 mt-3", // Smaller bar
                                level === 'critical' ? "bg-[var(--rs-signal)]" : "bg-[var(--rs-text-primary)]"
                            )} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: LED VU Meters */}
                    <div className="flex items-end justify-center gap-6 xl:gap-12 pl-4 md:border-l md:border-[var(--rs-border-primary)]/30 min-h-[220px]">
                        <RSVUMeter
                            value={ipScore}
                            label="IP_RISK"
                            isScanning={isScanning}
                            powered={status !== 'empty'}
                            description="Measures the likelihood of copyright infringement based on recognized entities."
                        />
                        <RSVUMeter
                            value={safetyScore}
                            label="BRAND_SAFETY"
                            isScanning={isScanning}
                            powered={status !== 'empty'}
                            description="Evaluates content alignment with the active brand's values (e.g., alcohol, violence)."
                        />
                        <RSVUMeter
                            value={provenanceScore}
                            label="PROVENANCE"
                            isScanning={isScanning}
                            powered={status !== 'empty'}
                            description="Cryptographic verification of origin, generator tools, and tampering."
                        />
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply bg-[url('/noise.png')]" />
        </div>
    );
}
