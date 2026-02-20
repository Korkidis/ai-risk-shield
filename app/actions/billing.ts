'use server';

import { createClient } from '@/lib/supabase/server';
import { getActiveTenantId } from './tenant';
import { startOfMonth, endOfMonth } from 'date-fns';

export type BillingStatus = {
    planId: string;
    seatLimit: number;
    seatsUsed: number;
    monthlyScanLimit: number;
    scansUsed: number;
    subscriptionStatus: string | null;
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
        .select('plan, monthly_scan_limit, seat_limit, subscription_status')
        .eq('id', targetTenantId)
        .single();

    if (tenantError || !tenantData) return null;
    const tenant = tenantData as unknown as Pick<import('@/types/database').ExtendedTenant, 'plan' | 'monthly_scan_limit' | 'seat_limit' | 'subscription_status'>;

    // 2. Count Seats (Profiles in this tenant)
    const { count: seatsUsed } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', targetTenantId);

    // 3. Count Scans (This Month)
    const now = new Date();
    const start = startOfMonth(now).toISOString();
    const end = endOfMonth(now).toISOString();

    const { count: scansUsed } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', targetTenantId)
        .gte('created_at', start)
        .lte('created_at', end);

    return {
        planId: tenant.plan || 'free',
        seatLimit: tenant.seat_limit || 1,
        seatsUsed: seatsUsed || 0,
        monthlyScanLimit: tenant.monthly_scan_limit || 3,
        scansUsed: scansUsed || 0,
        subscriptionStatus: tenant.subscription_status ?? null
    };
}
