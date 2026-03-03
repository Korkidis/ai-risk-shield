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
    monthly_mitigation_limit?: number
    mitigations_used_this_month?: number
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
    purchased_by?: string | null
}

export const Entitlements = {
    /**
     * Can the user view the full scan report (findings, provenance, risk scores)?
     *
     * Scan reports are FREE for all authenticated users and post-email anonymous users.
     * The $29 product is the mitigation report, not the scan report.
     *
     * Returns true if:
     * - Authenticated user in same tenant (any plan, including free)
     * - Anonymous user with matching session (post-email capture)
     * - Legacy: one-time purchased scan by this user (backward compat)
     */
    canViewScanReport: (user: UserContext | null, scan: ScanContext, _anonSessionId?: string) => {
        // 1. Any authenticated user in the same tenant can view scan reports (free or paid)
        if (user && scan.tenant_id === user.tenant_id) return true

        // 2. Legacy: one-time purchased scan (pre-model-change backward compat)
        if (scan.purchased && scan.purchase_type === 'one_time') {
            if (user) {
                if (scan.purchased_by && user.id === scan.purchased_by) return true
                if (!scan.purchased_by && scan.tenant_id === user.tenant_id) return true
            }
        }

        // 3. Anonymous user with matching session (post-email capture, pre-auth)
        if (_anonSessionId && scan.session_id === _anonSessionId) return true

        return false
    },

    /**
     * @deprecated Use canViewScanReport instead. Kept as alias for backward compat during migration.
     */
    canViewFullReport: (user: UserContext | null, scan: ScanContext, _anonSessionId?: string) => {
        return Entitlements.canViewScanReport(user, scan, _anonSessionId)
    },

    /**
     * Can the user view the TEASER (score, top findings generic)?
     * Note: With the new model, teaser = pre-email anonymous state.
     * Post-email users get full scan report via canViewScanReport.
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
    },

    /**
     * Check if user can generate a mitigation report for a scan.
     * Requires: authenticated, scan belongs to tenant, scan is complete.
     * Returns whether credits are available or $29 purchase is needed.
     */
    canGenerateMitigation: (user: UserContext | null, scan: ScanContext, tenant: TenantContext | null): {
        allowed: boolean
        reason: 'no_auth' | 'no_tenant' | 'scan_incomplete' | 'scan_mismatch' | 'credits_available' | 'purchase_required'
        creditsRemaining?: number
        overageCents?: number
    } => {
        if (!user) return { allowed: false, reason: 'no_auth' }
        if (!tenant) return { allowed: false, reason: 'no_tenant' }
        if (scan.status !== 'complete') return { allowed: false, reason: 'scan_incomplete' }
        if (scan.tenant_id !== user.tenant_id) return { allowed: false, reason: 'scan_mismatch' }

        const plan = getPlan(tenant.plan)
        const limit = tenant.monthly_mitigation_limit ?? plan.monthlyMitigations
        const used = tenant.mitigations_used_this_month ?? 0

        if (used < limit) {
            return { allowed: true, reason: 'credits_available', creditsRemaining: limit - used }
        }

        // No credits — user can still generate via $29 purchase
        return {
            allowed: true,
            reason: 'purchase_required',
            creditsRemaining: 0,
            overageCents: plan.mitigationOverageCents,
        }
    },

    /**
     * Get mitigation entitlement summary for display in drawer UI.
     */
    getMitigationEntitlement: (tenant: TenantContext | null): {
        included: number
        used: number
        canGenerate: boolean
        overageCents: number
    } => {
        if (!tenant) return { included: 0, used: 0, canGenerate: false, overageCents: 2900 }

        const plan = getPlan(tenant.plan)
        const included = tenant.monthly_mitigation_limit ?? plan.monthlyMitigations
        const used = tenant.mitigations_used_this_month ?? 0

        return {
            included,
            used,
            canGenerate: true, // Authenticated users can always generate (via credits or purchase)
            overageCents: plan.mitigationOverageCents,
        }
    },

    /**
     * Get the mitigation limit for a plan (from config)
     */
    getMitigationLimit: (plan: PlanId): number => {
        return getPlan(plan).monthlyMitigations
    }
}
