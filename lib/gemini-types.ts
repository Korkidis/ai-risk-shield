/**
 * Gemini Analysis Types
 *
 * Separated from implementation to allow client components to import types
 * without pulling in server-only dependencies (c2pa-node, fs, etc.)
 */

import { C2PAReport } from './c2pa-types'

export type SpecialistReport = {
    score: number;
    teaser: string;
    reasoning: string;
    confidence?: 'high' | 'medium' | 'low';
}

/** Structured chief strategy (new scans) */
export type ChiefStrategy = {
    points: string[];
    overall_confidence: 'high' | 'medium' | 'low';
}

/** Serialize chief_officer_strategy to display string (handles both legacy string and structured format) */
export function formatChiefStrategy(strategy: ChiefStrategy | string | undefined | null): string {
    if (!strategy) return '';
    if (typeof strategy === 'string') return strategy;
    if (strategy.points && Array.isArray(strategy.points)) {
        return strategy.points.map((p, i) => `${i + 1}. ${p}`).join('\n');
    }
    return '';
}

export type RiskProfile = {
    ip_report: SpecialistReport;
    safety_report: SpecialistReport;
    provenance_report: SpecialistReport;
    c2pa_report: C2PAReport;
    composite_score: number;
    verdict: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
    /** Structured object for new scans, plain string for legacy stored blobs */
    chief_officer_strategy: ChiefStrategy | string;
}
