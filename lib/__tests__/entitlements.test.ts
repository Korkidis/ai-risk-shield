import { describe, it, expect } from 'vitest'
import { Entitlements } from '../entitlements'
import type { PlanId } from '../plans'

// ── Test Fixtures ────────────────────────────────────────────────────────────

const makeUser = (overrides?: Partial<{ id: string; tenant_id: string; email: string; plan: PlanId }>) => ({
    id: 'user-1',
    tenant_id: 'tenant-1',
    email: 'user@test.com',
    plan: 'pro' as PlanId,
    ...overrides,
})

const makeScan = (overrides?: Record<string, unknown>) => ({
    id: 'scan-1',
    tenant_id: 'tenant-1',
    session_id: 'session-abc',
    status: 'complete' as const,
    purchased: false,
    purchase_type: null,
    purchased_by: null,
    ...overrides,
})

const makeTenant = (overrides?: Partial<{
    id: string; plan: PlanId; monthly_scan_limit: number; monthly_report_limit: number;
    monthly_mitigation_limit: number; mitigations_used_this_month: number;
    seat_limit: number; brand_profile_limit: number;
    feature_team_dashboard: boolean; feature_audit_logs: boolean;
}>) => ({
    id: 'tenant-1',
    plan: 'pro' as PlanId,
    monthly_scan_limit: 50,
    monthly_report_limit: 5,
    monthly_mitigation_limit: 2,
    mitigations_used_this_month: 0,
    seat_limit: 1,
    brand_profile_limit: 1,
    ...overrides,
})

// ── canViewScanReport ────────────────────────────────────────────────────────

describe('Entitlements.canViewScanReport', () => {
    it('allows authenticated user in same tenant', () => {
        expect(Entitlements.canViewScanReport(makeUser(), makeScan())).toBe(true)
    })

    it('denies authenticated user from different tenant', () => {
        const user = makeUser({ tenant_id: 'other-tenant' })
        expect(Entitlements.canViewScanReport(user, makeScan())).toBe(false)
    })

    it('denies null user without session match', () => {
        expect(Entitlements.canViewScanReport(null, makeScan())).toBe(false)
    })

    it('allows anonymous user with matching session', () => {
        expect(Entitlements.canViewScanReport(null, makeScan(), 'session-abc')).toBe(true)
    })

    it('denies anonymous user with wrong session', () => {
        expect(Entitlements.canViewScanReport(null, makeScan(), 'wrong-session')).toBe(false)
    })

    it('allows legacy one-time purchase by same user', () => {
        const scan = makeScan({
            purchased: true,
            purchase_type: 'one_time',
            purchased_by: 'user-1',
            tenant_id: 'other-tenant', // Different tenant to test purchase path specifically
        })
        const user = makeUser({ tenant_id: 'other-tenant' })
        expect(Entitlements.canViewScanReport(user, scan)).toBe(true)
    })

    it('denies legacy one-time purchase by different user', () => {
        const scan = makeScan({
            purchased: true,
            purchase_type: 'one_time',
            purchased_by: 'other-user',
            tenant_id: 'other-tenant',
        })
        expect(Entitlements.canViewScanReport(makeUser(), scan)).toBe(false)
    })

    it('works for free plan users in same tenant', () => {
        const user = makeUser({ plan: 'free' })
        expect(Entitlements.canViewScanReport(user, makeScan())).toBe(true)
    })
})

// ── isQuotaExceeded ──────────────────────────────────────────────────────────

describe('Entitlements.isQuotaExceeded', () => {
    it('blocks free users at limit', () => {
        expect(Entitlements.isQuotaExceeded(3, 3, 'free')).toBe(true)
    })

    it('blocks free users above limit', () => {
        expect(Entitlements.isQuotaExceeded(5, 3, 'free')).toBe(true)
    })

    it('allows free users below limit', () => {
        expect(Entitlements.isQuotaExceeded(2, 3, 'free')).toBe(false)
    })

    it('never blocks paid plans (overage allowed)', () => {
        const paidPlans: PlanId[] = ['pro', 'team', 'agency', 'enterprise']
        for (const plan of paidPlans) {
            expect(Entitlements.isQuotaExceeded(999, 10, plan)).toBe(false)
        }
    })
})

// ── willChargeOverage ────────────────────────────────────────────────────────

describe('Entitlements.willChargeOverage', () => {
    it('does not charge overage for free (overages blocked)', () => {
        expect(Entitlements.willChargeOverage(5, 3, 'free')).toBe(false)
    })

    it('charges overage for pro at limit', () => {
        expect(Entitlements.willChargeOverage(50, 50, 'pro')).toBe(true)
    })

    it('does not charge overage for pro below limit', () => {
        expect(Entitlements.willChargeOverage(10, 50, 'pro')).toBe(false)
    })

    it('charges overage for team at limit', () => {
        expect(Entitlements.willChargeOverage(300, 300, 'team')).toBe(true)
    })

    it('does not charge overage for enterprise (scanOverageCents=0)', () => {
        expect(Entitlements.willChargeOverage(10000, 9999, 'enterprise')).toBe(false)
    })
})

// ── canAddSeat ───────────────────────────────────────────────────────────────

describe('Entitlements.canAddSeat', () => {
    it('allows adding seat below limit', () => {
        const tenant = makeTenant({ seat_limit: 5 })
        expect(Entitlements.canAddSeat(tenant, 3)).toBe(true)
    })

    it('blocks adding seat at limit', () => {
        const tenant = makeTenant({ seat_limit: 5 })
        expect(Entitlements.canAddSeat(tenant, 5)).toBe(false)
    })

    it('blocks adding seat above limit', () => {
        const tenant = makeTenant({ seat_limit: 5 })
        expect(Entitlements.canAddSeat(tenant, 7)).toBe(false)
    })

    it('free plan has 1 seat limit', () => {
        const tenant = makeTenant({ plan: 'free', seat_limit: 1 })
        expect(Entitlements.canAddSeat(tenant, 1)).toBe(false)
    })
})

// ── canAddBrandProfile ───────────────────────────────────────────────────────

describe('Entitlements.canAddBrandProfile', () => {
    it('allows adding brand profile below limit', () => {
        const tenant = makeTenant({ brand_profile_limit: 5 })
        expect(Entitlements.canAddBrandProfile(tenant, 3)).toBe(true)
    })

    it('blocks adding brand profile at limit', () => {
        const tenant = makeTenant({ brand_profile_limit: 1 })
        expect(Entitlements.canAddBrandProfile(tenant, 1)).toBe(false)
    })
})

// ── canGenerateMitigation ────────────────────────────────────────────────────

describe('Entitlements.canGenerateMitigation', () => {
    it('denies when no user (unauthenticated)', () => {
        const result = Entitlements.canGenerateMitigation(null, makeScan(), makeTenant())
        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('no_auth')
    })

    it('denies when no tenant', () => {
        const result = Entitlements.canGenerateMitigation(makeUser(), makeScan(), null)
        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('no_tenant')
    })

    it('denies when scan not complete', () => {
        const scan = makeScan({ status: 'processing' })
        const result = Entitlements.canGenerateMitigation(makeUser(), scan, makeTenant())
        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('scan_incomplete')
    })

    it('denies when scan belongs to different tenant', () => {
        const scan = makeScan({ tenant_id: 'other-tenant' })
        const result = Entitlements.canGenerateMitigation(makeUser(), scan, makeTenant())
        expect(result.allowed).toBe(false)
        expect(result.reason).toBe('scan_mismatch')
    })

    it('allows with credits available', () => {
        const tenant = makeTenant({ monthly_mitigation_limit: 2, mitigations_used_this_month: 0 })
        const result = Entitlements.canGenerateMitigation(makeUser(), makeScan(), tenant)
        expect(result.allowed).toBe(true)
        expect(result.reason).toBe('credits_available')
        expect(result.creditsRemaining).toBe(2)
    })

    it('returns purchase_required when credits exhausted', () => {
        const tenant = makeTenant({ monthly_mitigation_limit: 2, mitigations_used_this_month: 2 })
        const result = Entitlements.canGenerateMitigation(makeUser(), makeScan(), tenant)
        expect(result.allowed).toBe(true)
        expect(result.reason).toBe('purchase_required')
        expect(result.creditsRemaining).toBe(0)
        expect(result.overageCents).toBe(2900)
    })

    it('returns purchase_required for free plan (0 mitigation credits)', () => {
        const user = makeUser({ plan: 'free' })
        const tenant = makeTenant({ plan: 'free', monthly_mitigation_limit: 0, mitigations_used_this_month: 0 })
        const result = Entitlements.canGenerateMitigation(user, makeScan(), tenant)
        expect(result.allowed).toBe(true)
        expect(result.reason).toBe('purchase_required')
        expect(result.overageCents).toBe(2900)
    })
})

// ── hasFeature ───────────────────────────────────────────────────────────────

describe('Entitlements.hasFeature', () => {
    it('free plan has no premium features', () => {
        expect(Entitlements.hasFeature('free', 'bulkUpload')).toBe(false)
        expect(Entitlements.hasFeature('free', 'teamDashboard')).toBe(false)
        expect(Entitlements.hasFeature('free', 'auditLogs')).toBe(false)
        expect(Entitlements.hasFeature('free', 'whiteLabel')).toBe(false)
        expect(Entitlements.hasFeature('free', 'sso')).toBe(false)
    })

    it('pro plan has fullReportAccess but not bulk/team', () => {
        expect(Entitlements.hasFeature('pro', 'fullReportAccess')).toBe(true)
        expect(Entitlements.hasFeature('pro', 'bulkUpload')).toBe(false)
        expect(Entitlements.hasFeature('pro', 'teamDashboard')).toBe(false)
    })

    it('team plan has teamDashboard and bulkUpload', () => {
        expect(Entitlements.hasFeature('team', 'teamDashboard')).toBe(true)
        expect(Entitlements.hasFeature('team', 'bulkUpload')).toBe(true)
        expect(Entitlements.hasFeature('team', 'auditLogs')).toBe(false)
    })

    it('agency plan has auditLogs and whiteLabel', () => {
        expect(Entitlements.hasFeature('agency', 'auditLogs')).toBe(true)
        expect(Entitlements.hasFeature('agency', 'whiteLabel')).toBe(true)
        expect(Entitlements.hasFeature('agency', 'sso')).toBe(false)
    })

    it('enterprise plan has all features including sso', () => {
        expect(Entitlements.hasFeature('enterprise', 'sso')).toBe(true)
        expect(Entitlements.hasFeature('enterprise', 'auditLogs')).toBe(true)
        expect(Entitlements.hasFeature('enterprise', 'whiteLabel')).toBe(true)
        expect(Entitlements.hasFeature('enterprise', 'priorityQueue')).toBe(true)
    })
})

// ── getScanLimit / getReportLimit / getMitigationLimit ────────────────────────

describe('Entitlements limit getters', () => {
    it('getScanLimit returns correct values per tier', () => {
        expect(Entitlements.getScanLimit('free')).toBe(3)
        expect(Entitlements.getScanLimit('pro')).toBe(50)
        expect(Entitlements.getScanLimit('team')).toBe(300)
        expect(Entitlements.getScanLimit('agency')).toBe(1000)
        expect(Entitlements.getScanLimit('enterprise')).toBe(9999)
    })

    it('getReportLimit returns correct values per tier', () => {
        expect(Entitlements.getReportLimit('free')).toBe(0)
        expect(Entitlements.getReportLimit('pro')).toBe(5)
        expect(Entitlements.getReportLimit('team')).toBe(30)
        expect(Entitlements.getReportLimit('agency')).toBe(100)
    })

    it('getMitigationLimit returns correct values per tier', () => {
        expect(Entitlements.getMitigationLimit('free')).toBe(0)
        expect(Entitlements.getMitigationLimit('pro')).toBe(2)
        expect(Entitlements.getMitigationLimit('team')).toBe(10)
        expect(Entitlements.getMitigationLimit('agency')).toBe(50)
        expect(Entitlements.getMitigationLimit('enterprise')).toBe(9999)
    })
})

// ── getMitigationEntitlement ─────────────────────────────────────────────────

describe('Entitlements.getMitigationEntitlement', () => {
    it('returns zero state for null tenant', () => {
        const result = Entitlements.getMitigationEntitlement(null)
        expect(result.included).toBe(0)
        expect(result.used).toBe(0)
        expect(result.canGenerate).toBe(false)
        expect(result.overageCents).toBe(2900)
    })

    it('returns correct state for pro tenant with usage', () => {
        const tenant = makeTenant({ plan: 'pro', monthly_mitigation_limit: 2, mitigations_used_this_month: 1 })
        const result = Entitlements.getMitigationEntitlement(tenant)
        expect(result.included).toBe(2)
        expect(result.used).toBe(1)
        expect(result.canGenerate).toBe(true)
        expect(result.overageCents).toBe(2900)
    })

    it('uses plan default when tenant limit not set', () => {
        const tenant = makeTenant({ plan: 'team', monthly_mitigation_limit: undefined as unknown as number })
        const result = Entitlements.getMitigationEntitlement(tenant)
        expect(result.included).toBe(10) // team plan default
    })
})
