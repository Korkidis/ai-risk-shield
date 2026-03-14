/**
 * Subscription Plans Configuration
 * Source of Truth: SUBSCRIPTION_STRATEGY.md
 * 
 * This file defines all tier limits, pricing, and feature flags.
 * All entitlement checks MUST reference this config.
 */

export type PlanId = 'free' | 'pro' | 'team' | 'agency' | 'enterprise';

export interface PlanConfig {
    id: PlanId;
    name: string;
    tagline: string;

    // Pricing (cents to avoid floating point)
    monthlyPriceCents: number;
    annualPriceCents: number; // 20% discount

    // Core Limits
    seats: number;
    monthlyScans: number;
    scanOverageCents: number; // 0 = blocked
    monthlyReports: number;
    reportOverageCents: number;
    monthlyMitigations: number;
    mitigationOverageCents: number; // $29 per mitigation report beyond plan credits
    brandProfiles: number;
    retentionDays: number;

    // Feature Flags
    features: {
        fullReportAccess: boolean;
        bulkUpload: boolean;
        coBranding: boolean;
        whiteLabel: boolean;
        teamDashboard: boolean;
        auditLogs: boolean;
        priorityQueue: boolean;
        sso: boolean;
    };

    // Video Limits
    videoMaxDurationSeconds: number; // 0 = no video allowed
    videoFrameLimit: number;         // frames to extract per video scan

    // Support
    supportTier: 'community' | 'email' | 'slack' | 'dedicated';
}

export const PLANS: Record<PlanId, PlanConfig> = {
    free: {
        id: 'free',
        name: 'Free',
        tagline: '3 Scans to Test',
        monthlyPriceCents: 0,
        annualPriceCents: 0,
        seats: 1,
        monthlyScans: 3,
        scanOverageCents: 0, // Blocked
        monthlyReports: 0,
        reportOverageCents: 2900, // $29 one-time purchase
        monthlyMitigations: 0,
        mitigationOverageCents: 2900, // $29 per mitigation report
        brandProfiles: 0,
        retentionDays: 7,
        features: {
            fullReportAccess: false,
            bulkUpload: false,
            coBranding: false,
            whiteLabel: false,
            teamDashboard: false,
            auditLogs: false,
            priorityQueue: false,
            sso: false,
        },
        videoMaxDurationSeconds: 0,  // No video for free tier
        videoFrameLimit: 0,
        supportTier: 'community',
    },

    pro: {
        id: 'pro',
        name: 'Pro',
        tagline: 'Brand Profile + Pro Reports',
        monthlyPriceCents: 4900,
        annualPriceCents: 47000, // $470/yr (20% off)
        seats: 1,
        monthlyScans: 50,
        scanOverageCents: 250, // $2.50 - deliberately punishing
        monthlyReports: 5,
        reportOverageCents: 2900, // $29 — universal overage (PDR §6)
        monthlyMitigations: 2,
        mitigationOverageCents: 2900, // $29 per mitigation report
        brandProfiles: 1,
        retentionDays: 30,
        features: {
            fullReportAccess: true,
            bulkUpload: false,
            coBranding: false,
            whiteLabel: false,
            teamDashboard: false,
            auditLogs: false,
            priorityQueue: false,
            sso: false,
        },
        videoMaxDurationSeconds: 120,  // 2 minutes
        videoFrameLimit: 5,
        supportTier: 'email',
    },

    team: {
        id: 'team',
        name: 'Team',
        tagline: 'Multi-Seat + Bulk Upload',
        monthlyPriceCents: 19900,
        annualPriceCents: 191000, // $1,910/yr (20% off)
        seats: 5,
        monthlyScans: 300,
        scanOverageCents: 100, // $1.00
        monthlyReports: 30,
        reportOverageCents: 2900, // $29 — universal overage (PDR §6)
        monthlyMitigations: 10,
        mitigationOverageCents: 2900, // $29 per mitigation report
        brandProfiles: 5,
        retentionDays: 90,
        features: {
            fullReportAccess: true,
            bulkUpload: true,
            coBranding: true,
            whiteLabel: false,
            teamDashboard: true,
            auditLogs: false,
            priorityQueue: false,
            sso: false,
        },
        videoMaxDurationSeconds: 300,  // 5 minutes
        videoFrameLimit: 10,
        supportTier: 'email',
    },

    agency: {
        id: 'agency',
        name: 'Agency',
        tagline: 'White-Label + Priority Queue',
        monthlyPriceCents: 49900,
        annualPriceCents: 479000, // $4,790/yr (20% off)
        seats: 15,
        monthlyScans: 1000,
        scanOverageCents: 60, // $0.60 - volume discount
        monthlyReports: 100,
        reportOverageCents: 2900, // $29 — universal overage (PDR §6)
        monthlyMitigations: 50,
        mitigationOverageCents: 2900, // $29 per mitigation report
        brandProfiles: 20,
        retentionDays: 365,
        features: {
            fullReportAccess: true,
            bulkUpload: true,
            coBranding: true,
            whiteLabel: true,
            teamDashboard: true,
            auditLogs: true,
            priorityQueue: true,
            sso: false,
        },
        videoMaxDurationSeconds: 600,  // 10 minutes (capped — no worker/queue)
        videoFrameLimit: 15,
        supportTier: 'slack',
    },

    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        tagline: 'SSO + Dedicated CSM',
        monthlyPriceCents: 0, // Custom
        annualPriceCents: 0, // Custom
        seats: 999, // Effectively unlimited
        monthlyScans: 9999,
        scanOverageCents: 0, // Negotiated
        monthlyReports: 9999,
        reportOverageCents: 0, // Negotiated
        monthlyMitigations: 9999,
        mitigationOverageCents: 0, // Negotiated
        brandProfiles: 999,
        retentionDays: 730, // 2 years
        features: {
            fullReportAccess: true,
            bulkUpload: true,
            coBranding: true,
            whiteLabel: true,
            teamDashboard: true,
            auditLogs: true,
            priorityQueue: true,
            sso: true,
        },
        videoMaxDurationSeconds: 600,  // 10 minutes (capped same as Agency — no worker/queue)
        videoFrameLimit: 15,
        supportTier: 'dedicated',
    },
};

/**
 * Get plan configuration by ID
 */
export function getPlan(planId: PlanId): PlanConfig {
    return PLANS[planId] || PLANS.free;
}

/**
 * Check if a feature is available for a plan
 */
export function hasFeature(planId: PlanId, feature: keyof PlanConfig['features']): boolean {
    return PLANS[planId]?.features[feature] ?? false;
}

/**
 * Get the monthly scan limit for a plan
 */
export function getScanLimit(planId: PlanId): number {
    return PLANS[planId]?.monthlyScans ?? 3;
}

/**
 * Check if overage is allowed (paid plans only)
 */
export function canUseOverage(planId: PlanId): boolean {
    return PLANS[planId]?.scanOverageCents > 0;
}

/**
 * Format price for display (cents to dollars)
 */
export function formatPrice(cents: number): string {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get effective monthly price for annual billing
 */
export function getEffectiveMonthlyPrice(planId: PlanId): number {
    const plan = PLANS[planId];
    if (!plan || plan.annualPriceCents === 0) return plan?.monthlyPriceCents ?? 0;
    return Math.round(plan.annualPriceCents / 12);
}
