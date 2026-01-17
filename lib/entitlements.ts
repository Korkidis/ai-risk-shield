import { ExtendedScan } from '@/types/database'

/**
 * Entitlement Logic
 * Centralizes all rules about who can access what.
 */

// Define generic user/tenant types to avoid strict dependency on Supabase User type
type UserContext = {
    id: string
    tenant_id: string
    email?: string
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
            // If user purchased it, or if it's the same anonymous session that bought it (cookie persistence)
            // Note: Currently we mandate login for purchase, so user check is primary.
            if (user && scan.purchased) return true;
        }

        // 2. Subscription access (Tenant match)
        // If scanning tenant matches user tenant (and presumably sub is active, checked elsewhere)
        if (user && scan.tenant_id === user.tenant_id) {
            return true
        }

        // 3. Anonymous Session Owner (Only for TEASER, not full report usually? 
        // The brief says: "One-time: $29 buys the full report... requires account creation")
        // So Anonymous users NEVER see full report unless they log in (even if they just uploaded it).
        // They only see teaser.

        return false
    },

    /**
     * Can the user view the TEASER (score, top findings generic)?
     */
    canViewTeaser: (user: UserContext | null, scan: ScanContext, anonSessionId?: string) => {
        // 1. Owner of the anonymous scan
        if (scan.session_id && scan.session_id === anonSessionId) return true

        // 2. Tenant owner
        if (user && scan.tenant_id === user.tenant_id) return true

        return false
    },

    /**
     * Check if upload is allowed based on plan/quota
     * This is usually a DB check, but helper here for logic reuse
     */
    isQuotaExceeded: (used: number, limit: number, plan: string) => {
        if (plan === 'free') return used >= limit
        // Paid plans allow overages
        return false
    }
}
