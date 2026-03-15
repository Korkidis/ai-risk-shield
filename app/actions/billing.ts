'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveTenantId } from './tenant';
import { getSessionId } from '@/lib/session';

/**
 * Sprint 10.5: Get anonymous session ID for entitlement checks.
 * Returns the httpOnly session cookie value (not accessible from client JS).
 * Used to pass anonSessionId to Entitlements.canViewTeaser() for race-condition
 * handling when scan assignment hasn't completed yet.
 */
export async function getAnonSessionId(): Promise<string | null> {
    return getSessionId();
}

export type BillingStatus = {
    tenantId: string;
    planId: string;
    seatLimit: number;
    seatsUsed: number;
    monthlyScanLimit: number;
    scansUsed: number;
    subscriptionStatus: string | null;
    monthlyReportLimit: number;
    brandProfileLimit: number;
    monthlyMitigationLimit: number;
    mitigationsUsedThisMonth: number;
}

export async function getTenantBillingStatus(tenantId?: string): Promise<BillingStatus | null> {
    const supabase = await createClient();

    // Resolve Tenant ID
    let targetTenantId: string | null | undefined = tenantId;
    if (!targetTenantId) {
        targetTenantId = await getActiveTenantId();
    }

    if (!targetTenantId) return null;

    // 1. Fetch Tenant Details
    const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('plan, monthly_scan_limit, seat_limit, subscription_status, monthly_report_limit, brand_profile_limit, monthly_mitigation_limit, mitigations_used_this_month, scans_used_this_month')
        .eq('id', targetTenantId)
        .single();

    if (tenantError || !tenantData) return null;
    const tenant = tenantData;

    // 2. Count Seats (Profiles in this tenant)
    const { count: seatsUsed } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', targetTenantId);

    // 3. Get Scans Used (This Month) directly from the tenant ledger
    // This is much faster and more accurate than counting rows, and respects atomic increments
    const scansUsed = tenant.scans_used_this_month || 0;

    return {
        tenantId: targetTenantId,
        planId: tenant.plan || 'free',
        seatLimit: tenant.seat_limit || 1,
        seatsUsed: seatsUsed || 0,
        monthlyScanLimit: tenant.monthly_scan_limit || 0,
        scansUsed: scansUsed,
        subscriptionStatus: tenant.subscription_status ?? null,
        monthlyReportLimit: tenant.monthly_report_limit ?? 0,
        brandProfileLimit: tenant.brand_profile_limit ?? 1,
        monthlyMitigationLimit: tenant.monthly_mitigation_limit ?? 0,
        mitigationsUsedThisMonth: tenant.mitigations_used_this_month ?? 0,
    };
}
