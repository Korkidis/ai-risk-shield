/**
 * Canonical Scoring Module
 * ========================
 * SINGLE SOURCE OF TRUTH for composite score calculation and risk derivation.
 * All pipelines (sync /api/analyze, async scan-processor) MUST use these functions.
 *
 * Scoring algorithm: consolidates gemini.ts L406-418 logic (40/40/20 weights 
 * + compound risk multiplier + critical override).
 */

import { getRiskTier, type RiskLevel, type Verdict } from './tiers'

// ─── C2PA Status → Provenance Score ────────────────────────────────────────

export type C2PAStatus = 'valid' | 'caution' | 'missing' | 'invalid' | 'error'

const C2PA_SCORE_MAP: Record<C2PAStatus, number> = {
    valid: 0,
    caution: 20,
    error: 50,
    missing: 80,
    invalid: 100,
}

/**
 * Derive a numeric provenance risk score from C2PA validation status.
 * Legal defensibility weighting: valid=0, caution=20, error=50, missing=80, invalid=100.
 */
export function computeProvenanceScore(c2paStatus: C2PAStatus): number {
    return C2PA_SCORE_MAP[c2paStatus] ?? 80
}

// ─── Provenance Status ─────────────────────────────────────────────────────

/**
 * Derive the human-readable provenance status from C2PA validation.
 * Preserves full fidelity of C2PA status — never derived from a score.
 * 
 * Returns:
 *  - 'valid'   — C2PA credentials verified
 *  - 'caution' — Verified but non-standard (e.g. self-signed)
 *  - 'invalid' — C2PA manifest present but tampered/expired
 *  - 'error'   — Verification process failed
 *  - 'missing' — No C2PA manifest found
 */
export function computeProvenanceStatus(c2paStatus: C2PAStatus): C2PAStatus {
    // Pass through cryptographic fact directly (full 5-value fidelity)
    if (c2paStatus === 'valid') return 'valid'
    if (c2paStatus === 'caution') return 'caution'
    if (c2paStatus === 'invalid') return 'invalid'
    if (c2paStatus === 'error') return 'error'
    return 'missing'
}

// ─── Composite Score ────────────────────────────────────────────────────────

export interface CompositeScoreInput {
    ipScore: number
    safetyScore: number
    c2paStatus: C2PAStatus
}

/**
 * Compute the unified composite risk score. 
 * 
 * Algorithm:
 * 1. C2PA Trust Override ("Firefly Rule"): If C2PA is valid, cap IP risk at 10
 * 2. Weighted average: IP 40%, Safety 40%, Provenance 20%
 * 3. Compound risk multiplier: If IP ≥ 80 AND provenance ≥ 60, boost score
 * 4. Critical override: If IP ≥ 90, floor composite at 95
 * 
 * Returns a value 0–100.
 */
export function computeCompositeScore(input: CompositeScoreInput): number {
    const { safetyScore, c2paStatus } = input
    let ipScore = input.ipScore
    const provenanceScore = computeProvenanceScore(c2paStatus)

    // 1. C2PA TRUST OVERRIDE ("The Firefly Rule")
    if (c2paStatus === 'valid') {
        ipScore = Math.min(ipScore, 10)
    }

    // 2. Weighted average (IP 40%, Safety 40%, Provenance 20%)
    let composite = Math.round((ipScore * 0.4) + (safetyScore * 0.4) + (provenanceScore * 0.2))

    // 3. Compound risk multiplier (only if C2PA is missing/invalid)
    if (ipScore >= 80 && provenanceScore >= 60) {
        const boost = Math.round((ipScore + provenanceScore) / 10)
        composite = Math.min(100, composite + boost)
    }

    // 4. Critical override
    if (ipScore >= 90) {
        composite = Math.max(composite, 95)
    }

    return composite
}

// ─── Verdict & Risk Level ──────────────────────────────────────────────────

/**
 * Derive the verdict string from a composite score.
 * Uses canonical tier thresholds from tiers.ts.
 */
export function computeVerdict(compositeScore: number): Verdict {
    return getRiskTier(compositeScore).verdict
}

/**
 * Derive the risk level enum from a composite score.
 * Uses canonical tier thresholds from tiers.ts.
 */
export function computeRiskLevel(compositeScore: number): RiskLevel {
    return getRiskTier(compositeScore).level
}
