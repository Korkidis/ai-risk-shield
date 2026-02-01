import { ExtendedScan } from '@/types/database'
import { getPlan, hasFeature, canUseOverage, type PlanId } from './plans'

/**
 * Entitlement Logic
 * Centralizes all rules about who can access what.
 * Source of Truth: lib/plans.ts (which mirrors SUBSCRIPTION_STRATEGY.md)
 */

// Define generic user/tenant types to avoid strict dependency on Supabase User type
type UserContext = {
    id: string
    tenant_id: string
    email?: string
    plan?: PlanId
}

type TenantContext = {
    id: string
    plan: PlanId
    monthly_scan_limit: number
    monthly_report_limit: number
    seat_limit: number
    brand_profile_limit: number
    feature_bulk_upload?: boolean
    feature_co_branding?: boolean
    feature_white_label?: boolean
    feature_team_dashboard?: boolean
    feature_audit_logs?: boolean
    feature_priority_queue?: boolean
}

type ScanContext = Partial<ExtendedScan> & {
    tenant_id?: string | null
    session_id?: string | null
    purchased?: boolean | null
    purchase_type?: string | null
}

export const Entitlements = {
    /**
     * Can the user view the FULL report (sensitive data, full findings)?
     */
    canViewFullReport: (user: UserContext | null, scan: ScanContext, _anonSessionId?: string) => {
        // 1. One-time purchased scan (Anonymous or Auth)
        if (scan.purchased && scan.purchase_type === 'one_time') {
            if (user && scan.purchased) return true;
        }

        // 2. Subscription access (Tenant match + paid plan)
        if (user && scan.tenant_id === user.tenant_id) {
            const plan = user.plan || 'free'
            // Free users only see teaser unless they purchased
            if (plan === 'free') return false
            return hasFeature(plan, 'fullReportAccess')
        }

        return false
    },

    /**
     * Can the user view the TEASER (score, top findings generic)?
     */
    canViewTeaser: (user: UserContext | null, scan: ScanContext, anonSessionId?: string) => {
        if (scan.session_id && scan.session_id === anonSessionId) return true
        if (user && scan.tenant_id === user.tenant_id) return true
        return false
    },

    /**
     * Check if upload is allowed based on plan/quota
     * @returns true if quota exceeded (block upload for free, allow overage for paid)
     */
    isQuotaExceeded: (used: number, limit: number, plan: PlanId): boolean => {
        if (plan === 'free') return used >= limit
        // Paid plans allow overages (billed at end of cycle)
        return false
    },

    /**
     * Check if overage will be charged
     */
    willChargeOverage: (used: number, limit: number, plan: PlanId): boolean => {
        if (!canUseOverage(plan)) return false
        return used >= limit
    },

    /**
     * Check if a specific feature is available for a tenant
     */
    hasFeature: (plan: PlanId, feature: keyof ReturnType<typeof getPlan>['features']): boolean => {
        return hasFeature(plan, feature)
    },

    /**
     * Check if tenant can add more seats
     */
    canAddSeat: (tenant: TenantContext, currentSeatCount: number): boolean => {
        return currentSeatCount < tenant.seat_limit
    },

    /**
     * Check if tenant can add more brand profiles
     */
    canAddBrandProfile: (tenant: TenantContext, currentCount: number): boolean => {
        return currentCount < tenant.brand_profile_limit
    },

    /**
     * Get the scan limit for a plan (from config)
     */
    getScanLimit: (plan: PlanId): number => {
        return getPlan(plan).monthlyScans
    },

    /**
     * Get the report limit for a plan (from config)
     */
    getReportLimit: (plan: PlanId): number => {
        return getPlan(plan).monthlyReports
    }
}
