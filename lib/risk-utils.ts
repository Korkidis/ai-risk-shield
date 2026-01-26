
export type RiskLevel = 'safe' | 'caution' | 'review' | 'high' | 'critical';

export interface BoxTier {
    level: RiskLevel;
    colorVar: string;
    label: string;
}

export function getRiskTier(score: number): BoxTier {
    if (score >= 91) return { level: 'critical', colorVar: 'var(--rs-risk-critical)', label: 'CRITICAL RISK' };
    if (score >= 76) return { level: 'high', colorVar: 'var(--rs-risk-high)', label: 'HIGH RISK' };
    if (score >= 51) return { level: 'review', colorVar: 'var(--rs-risk-review)', label: 'REVIEW REQ' };
    if (score >= 26) return { level: 'caution', colorVar: 'var(--rs-risk-caution)', label: 'CAUTION' };
    return { level: 'safe', colorVar: 'var(--rs-risk-safe)', label: 'SAFE' };
}

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
