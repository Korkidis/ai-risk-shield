/**
 * Canonical Risk Tier Definitions
 * ================================
 * SINGLE SOURCE OF TRUTH for score → risk level mapping.
 * All pipelines, UI, and reports MUST use this module.
 * 
 * Thresholds: 91/76/51/26 (approved 2026-02-10)
 */

export type RiskLevel = 'safe' | 'caution' | 'review' | 'high' | 'critical'

export type Verdict = 'Low Risk' | 'Medium Risk' | 'High Risk' | 'Critical Risk'

export interface RiskTier {
    level: RiskLevel
    label: string
    verdict: Verdict
    colorVar: string
}

/**
 * Map a 0–100 composite score to its canonical risk tier.
 * 
 * Thresholds (inclusive lower bound):
 *  - 91+  → Critical
 *  - 76–90 → High  
 *  - 51–75 → Review
 *  - 26–50 → Caution
 *  - 0–25  → Safe
 */
export function getRiskTier(score: number): RiskTier {
    if (score >= 91) return { level: 'critical', colorVar: 'var(--rs-risk-critical)', label: 'CRITICAL RISK', verdict: 'Critical Risk' }
    if (score >= 76) return { level: 'high', colorVar: 'var(--rs-risk-high)', label: 'HIGH RISK', verdict: 'High Risk' }
    if (score >= 51) return { level: 'review', colorVar: 'var(--rs-risk-review)', label: 'REVIEW REQ', verdict: 'Medium Risk' }
    if (score >= 26) return { level: 'caution', colorVar: 'var(--rs-risk-caution)', label: 'CAUTION', verdict: 'Low Risk' }
    return { level: 'safe', colorVar: 'var(--rs-risk-safe)', label: 'SAFE', verdict: 'Low Risk' }
}

/**
 * Map a legacy/external risk level string to the canonical RiskLevel.
 * Handles common variations from different pipeline outputs.
 */
export function mapLegacyLevel(level: string): RiskLevel {
    const normalized = level.toLowerCase().trim()
    if (normalized === 'critical') return 'critical'
    if (normalized === 'high') return 'high'
    if (normalized === 'review' || normalized === 'medium') return 'review'
    if (normalized === 'caution') return 'caution'
    if (normalized === 'low') return 'safe'
    return 'safe'
}

// Re-export BoxTier alias for backwards compatibility with risk-utils.ts consumers
export type BoxTier = RiskTier
