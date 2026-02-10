/**
 * Risk Utilities
 * ==============
 * DEPRECATED: This file now proxies to the canonical lib/risk/tiers.ts.
 * For new code, import directly from '@/lib/risk/tiers' or '@/lib/risk/scoring'.
 *
 * Kept for backwards compatibility — existing UI imports will continue to work.
 */

// Re-export canonical types and functions
export { getRiskTier, type RiskLevel, type BoxTier } from './risk/tiers'

// ─── UI Utility Helpers (thin wrappers over canonical tiers) ────────────────

import { getRiskTier } from './risk/tiers'

export function getRiskColorClass(score: number): string {
    const tier = getRiskTier(score);
    switch (tier.level) {
        case 'critical': return 'text-[var(--rs-risk-critical)]';
        case 'high': return 'text-[var(--rs-risk-high)]';
        case 'review': return 'text-[var(--rs-risk-review)]';
        case 'caution': return 'text-[var(--rs-risk-caution)]';
        case 'safe': return 'text-[var(--rs-risk-safe)]';
    }
}

export function getRiskBgClass(score: number): string {
    const tier = getRiskTier(score);
    switch (tier.level) {
        case 'critical': return 'bg-[var(--rs-risk-critical)]';
        case 'high': return 'bg-[var(--rs-risk-high)]';
        case 'review': return 'bg-[var(--rs-risk-review)]';
        case 'caution': return 'bg-[var(--rs-risk-caution)]';
        case 'safe': return 'bg-[var(--rs-risk-safe)]';
    }
}
