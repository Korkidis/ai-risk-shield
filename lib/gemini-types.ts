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
}

export type RiskProfile = {
    ip_report: SpecialistReport;
    safety_report: SpecialistReport;
    provenance_report: SpecialistReport;
    c2pa_report: C2PAReport;
    composite_score: number;
    verdict: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk";
    chief_officer_strategy: string;
}
