import { describe, it, expect } from 'vitest'
import {
    computeCompositeScore,
    computeVerdict,
    computeRiskLevel,
    computeProvenanceScore,
    computeProvenanceStatus,
    type C2PAStatus,
} from '../scoring'
import { getRiskTier } from '../tiers'

// ═══════════════════════════════════════════════════════════════════════════
// Provenance Score Mapping
// ═══════════════════════════════════════════════════════════════════════════

describe('computeProvenanceScore', () => {
    it.each([
        ['valid', 0],
        ['caution', 20],
        ['error', 50],
        ['missing', 80],
        ['invalid', 100],
    ] as [C2PAStatus, number][])('maps %s → %d', (status, expected) => {
        expect(computeProvenanceScore(status)).toBe(expected)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// Provenance Status (5-value passthrough)
// ═══════════════════════════════════════════════════════════════════════════

describe('computeProvenanceStatus', () => {
    it.each([
        ['valid', 'valid'],
        ['caution', 'caution'],
        ['invalid', 'invalid'],
        ['error', 'error'],
        ['missing', 'missing'],
    ] as [C2PAStatus, C2PAStatus][])('preserves %s fidelity', (input, expected) => {
        expect(computeProvenanceStatus(input)).toBe(expected)
    })

    it('defaults unknown values to missing', () => {
        expect(computeProvenanceStatus('garbage' as C2PAStatus)).toBe('missing')
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// Tier Threshold Boundaries (91/76/51/26)
// ═══════════════════════════════════════════════════════════════════════════

describe('getRiskTier — boundary tests', () => {
    it.each([
        // [score, expectedLevel, expectedVerdict]
        [0, 'safe', 'Low Risk'],
        [25, 'safe', 'Low Risk'],
        [26, 'caution', 'Low Risk'],
        [50, 'caution', 'Low Risk'],
        [51, 'review', 'Medium Risk'],
        [75, 'review', 'Medium Risk'],
        [76, 'high', 'High Risk'],
        [90, 'high', 'High Risk'],
        [91, 'critical', 'Critical Risk'],
        [100, 'critical', 'Critical Risk'],
    ] as [number, string, string][])('score %d → level=%s, verdict=%s', (score, level, verdict) => {
        const tier = getRiskTier(score)
        expect(tier.level).toBe(level)
        expect(tier.verdict).toBe(verdict)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// Composite Score — Core Algorithm
// ═══════════════════════════════════════════════════════════════════════════

describe('computeCompositeScore', () => {
    it('pure weighted average when no overrides apply', () => {
        // IP=40, Safety=30, C2PA=missing(80)
        // 40*0.4 + 30*0.4 + 80*0.2 = 16 + 12 + 16 = 44
        const result = computeCompositeScore({ ipScore: 40, safetyScore: 30, c2paStatus: 'missing' })
        expect(result).toBe(44)
    })

    it('Firefly Rule: C2PA valid caps IP at 10', () => {
        // Original IP=95, but valid C2PA → capped to 10
        // 10*0.4 + 20*0.4 + 0*0.2 = 4 + 8 + 0 = 12
        const result = computeCompositeScore({ ipScore: 95, safetyScore: 20, c2paStatus: 'valid' })
        expect(result).toBe(12)
    })

    it('compound risk multiplier triggers when IP >= 80 AND provenance >= 60', () => {
        // IP=85, Safety=30, C2PA=missing(80)
        // Base: 85*0.4 + 30*0.4 + 80*0.2 = 34 + 12 + 16 = 62
        // Compound: boost = round((85+80)/10) = round(16.5) = 17 → 62+17=79
        const result = computeCompositeScore({ ipScore: 85, safetyScore: 30, c2paStatus: 'missing' })
        expect(result).toBe(79)
    })

    it('critical override: IP >= 90 floors composite at 95', () => {
        // IP=92, Safety=10, C2PA=missing(80)
        // Base: 92*0.4 + 10*0.4 + 80*0.2 = 36.8+4+16 = round(56.8) = 57
        // Compound: boost = round((92+80)/10) = round(17.2) = 17 → 57+17=74
        // Critical override: max(74, 95) = 95
        const result = computeCompositeScore({ ipScore: 92, safetyScore: 10, c2paStatus: 'missing' })
        expect(result).toBe(95)
    })

    it('critical override does NOT trigger with Firefly Rule (valid C2PA)', () => {
        // IP=95 → capped to 10 by Firefly Rule, so critical override doesn't apply
        const result = computeCompositeScore({ ipScore: 95, safetyScore: 10, c2paStatus: 'valid' })
        expect(result).toBeLessThan(95)
    })

    it('compound multiplier does NOT trigger with valid C2PA (IP capped)', () => {
        // High IP with valid C2PA → IP capped to 10, provenance=0
        // Neither condition (IP>=80 AND prov>=60) can be true
        const result = computeCompositeScore({ ipScore: 90, safetyScore: 90, c2paStatus: 'valid' })
        // 10*0.4 + 90*0.4 + 0*0.2 = 4 + 36 + 0 = 40
        expect(result).toBe(40)
    })

    it('result clamped to 100 when compound multiplier would exceed', () => {
        // IP=100, Safety=100, C2PA=invalid(100)
        // Base: 100*0.4 + 100*0.4 + 100*0.2 = 40+40+20 = 100
        // Compound applies but min(100, 100+20) = 100
        // Critical override: max(100, 95) = 100
        const result = computeCompositeScore({ ipScore: 100, safetyScore: 100, c2paStatus: 'invalid' })
        expect(result).toBe(100)
    })

    it('all zeros with valid C2PA produces 0', () => {
        const result = computeCompositeScore({ ipScore: 0, safetyScore: 0, c2paStatus: 'valid' })
        expect(result).toBe(0)
    })
})

// ═══════════════════════════════════════════════════════════════════════════
// Verdict & Risk Level (derived from tiers)
// ═══════════════════════════════════════════════════════════════════════════

describe('computeVerdict and computeRiskLevel consistency', () => {
    it.each([0, 25, 26, 50, 51, 75, 76, 90, 91, 100])(
        'score %d: verdict and level both come from same getRiskTier call',
        (score) => {
            const tier = getRiskTier(score)
            expect(computeVerdict(score)).toBe(tier.verdict)
            expect(computeRiskLevel(score)).toBe(tier.level)
        }
    )
})

// ═══════════════════════════════════════════════════════════════════════════
// Score Stability — Determinism
// ═══════════════════════════════════════════════════════════════════════════

describe('score stability', () => {
    it('same inputs always produce same output (no stochastic behavior)', () => {
        const input = { ipScore: 72, safetyScore: 45, c2paStatus: 'missing' as C2PAStatus }
        const first = computeCompositeScore(input)
        for (let i = 0; i < 100; i++) {
            expect(computeCompositeScore(input)).toBe(first)
        }
    })
})
