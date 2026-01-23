'use server';

import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type Tenant = {
    id: string;
    name: string;
    plan: string;
    parent_tenant_id: string | null;
};

/**
 * Validates strictly that the current user has access to the target tenant.
 * Access is granted if:
 * 1. Target is user's own home tenant.
 * 2. User is an admin of the parent tenant, and target is a child.
 * 3. User is already a member of the target tenant (multi-tenancy via mapping table - future proofing, currently simple FK).
 */
async function validateTenantAccess(targetTenantId: string, userId: string) {
    // Use Service Role to query broadly, but validate strictly
    const supabase = await createServiceRoleClient();

    // 1. Get user's home tenant and role
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', userId)
        .single();

    const profile = profileData as any;

    if (profileError || !profile) {
        throw new Error('User profile not found');
    }

    // Case A: Switching to home tenant
    if (targetTenantId === profile.tenant_id) {
        return true;
    }

    // Case B: Switching to a child tenant (Must be Admin/Owner of Parent)
    if (['owner', 'admin', 'agency_admin'].includes(profile.role)) {
        const { data: targetTenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('parent_tenant_id')
            .eq('id', targetTenantId)
            .single();

        const targetTenant = targetTenantData as any;

        if (tenantError || !targetTenant) {
            throw new Error('Target tenant not found');
        }

        // Check if target is a child of user's home tenant
        if (targetTenant.parent_tenant_id === profile.tenant_id) {
            return true;
        }
    }

    return false;
}

export async function getAccessibleTenants(): Promise<Tenant[]> {
    const supabase = await createClient();
    const { data: user, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.user) return [];

    // 1. Get current user's profile to know their home tenant
    const { data: profileData } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.user.id)
        .single();

    const profile = profileData as any;

    if (!profile) return [];

    // 2. Fetch Home Tenant
    const { data: homeTenantData } = await supabase
        .from('tenants')
        .select('id, name, plan, parent_tenant_id')
        .eq('id', profile.tenant_id)
        .single();

    const homeTenant = homeTenantData as any;

    if (!homeTenant) return [];

    let tenants: Tenant[] = [homeTenant];

    // 3. If Agency Admin, Fetch Children
    const isAgency = ['agency', 'enterprise'].includes(homeTenant.plan);
    const isAdmin = ['owner', 'admin', 'agency_admin'].includes(profile.role);

    if (isAgency && isAdmin) {
        const { data: childrenData } = await supabase
            .from('tenants')
            .select('id, name, plan, parent_tenant_id')
            .eq('parent_tenant_id', homeTenant.id);

        const children = childrenData as any;

        if (children) {
            tenants = [...tenants, ...children];
        }
    }

    return tenants;
}

export async function switchTenant(targetTenantId: string) {
    const supabase = await createClient(); // Anon client
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('Unauthorized');
    }

    // 1. Validate Access
    const hasAccess = await validateTenantAccess(targetTenantId, user.id);
    if (!hasAccess) {
        throw new Error('Access Denied to this tenant');
    }

    // 2. Update Session Metadata via Service Role
    // We store 'active_tenant' in app_metadata so it persists in JWT
    const adminClient = await createServiceRoleClient();

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
        user.id,
        { app_metadata: { active_tenant: targetTenantId } }
    );

    if (updateError) {
        console.error('Failed to switch tenant', updateError);
        throw new Error('Failed to switch tenant');
    }

    // 3. Log the switch for audit
    // (Optional: can be added here or via trigger)
    // Casting to any to avoid strict type checks until DB types are regenerated
    await adminClient.from('tenant_switch_audit' as any).insert({
        actor_user_id: user.id,
        to_tenant_id: targetTenantId,
        reason: 'User initialized switch',
        metadata: { method: 'server_action' }
    } as any);

    // 4. Force Revalidation
    revalidatePath('/', 'layout');

    return { success: true };
}

export async function getActiveTenantId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Check JWT claim first
    if (user.app_metadata?.active_tenant) {
        return user.app_metadata.active_tenant as string;
    }

    // Fallback to home tenant from profile
    const { data: profileData } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    const profile = profileData as any;

    return profile?.tenant_id || null;
}
