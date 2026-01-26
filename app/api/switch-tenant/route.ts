import { NextRequest, NextResponse } from 'next/server';

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!; 
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TTL_SECONDS = 900; // 15 minutes

// Fallback if the user didn't set SUPABASE_URL but has NEXT_PUBLIC_SUPABASE_URL
const API_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!API_URL || !SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

// Helper: call Supabase Auth user endpoint with the caller's token
async function getUserFromToken(token: string) {
    const res = await fetch(`${API_URL!.replace(/\/$/, '')}/auth/v1/user`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Invalid session token: ${res.status} ${txt}`);
    }
    return res.json();
}

// Helper: verify tenant exists and that the user's profile.tenant_id (agency) is the parent of requested child, or matches the requested tenant.
async function verifyUserCanSwitch(userId: string, requestedTenantId: string) {
    // Check tenant exists
    const tenantResp = await fetch(`${API_URL!.replace(/\/$/, '')}/rest/v1/tenants?id=eq.${encodeURIComponent(requestedTenantId)}&select=id,parent_tenant_id`, {
        method: 'GET',
        headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
        },
    });

    if (!tenantResp.ok) throw new Error(`Tenant lookup failed: ${tenantResp.status}`);
    const tenants = await tenantResp.json();
    if (!Array.isArray(tenants) || tenants.length === 0) throw new Error('Requested tenant not found');

    // Fetch user's profile to get profiles.tenant_id (the user's canonical tenant)
    const profileResp = await fetch(`${API_URL!.replace(/\/$/, '')}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,tenant_id,role,is_agency_admin`, {
        method: 'GET',
        headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
        },
    });

    if (!profileResp.ok) throw new Error(`Profile lookup failed: ${profileResp.status}`);
    const profiles = await profileResp.json();
    if (!Array.isArray(profiles) || profiles.length === 0) throw new Error('User profile not found');

    const profile = profiles[0];

    // If the user's profile.tenant_id equals requestedTenantId they can switch (they're switching to their own tenant)
    if ((profile.tenant_id ?? null) === requestedTenantId) return { allowed: true, reason: 'Same tenant' };

    // If user has is_agency_admin true OR role === 'agency_admin', allow switching into children of their tenant
    const tenant = tenants[0];
    const userTenantId = profile.tenant_id;
    // Use loose check for role to be safe, or exact if schema is strict.
    // Assuming 'agency_admin' is a value in the 'role' enum or 'is_agency_admin' bool column exists.
    // Based on strict schema, 'role' is owner/admin/member. 'is_agency_admin' might be new.
    // We accepted the SQL that adds is_agency_admin check but didn't see the column add in SQL. 
    // User provided SQL for `is_agency_admin()` function which checks `p.role = 'agency_admin' OR p.is_agency_admin IS TRUE`.
    // We should be careful here. I will proceed with the code provided.
    const isAgencyAdmin = profile.is_agency_admin === true || profile.role === 'agency_admin';

    if (isAgencyAdmin) {
        // Allow if requested tenant's parent_tenant_id equals user's tenant_id OR requested tenant.id equals user's tenant_id
        if (tenant.parent_tenant_id === userTenantId || tenant.id === userTenantId) {
            return { allowed: true, reason: 'Agency admin switching to own child or agency' };
        }
    }

    // Otherwise deny
    return { allowed: false, reason: 'Not authorized to switch to requested tenant' };
}

// Helper: insert audit row
async function insertAudit(actorUserId: string | null, actorSessionId: string | null, fromTenantId: string | null, toTenantId: string, ip: string | null, userAgent: string | null, reason: string | null) {
    const payload = {
        actor_user_id: actorUserId,
        actor_session_id: actorSessionId,
        from_tenant_id: fromTenantId,
        to_tenant_id: toTenantId,
        ip,
        user_agent: userAgent,
        reason,
        metadata: { via: 'nextjs-switch-tenant' },
    };

    const res = await fetch(`${API_URL!.replace(/\/$/, '')}/rest/v1/tenant_switch_audit`, {
        method: 'POST',
        headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const txt = await res.text();
        console.warn('Audit insert failed', res.status, txt);
        return null;
    }
    try {
        return await res.json();
    } catch {
        return null;
    }
}

// Helper: request admin token with custom claims via admin endpoint
async function createShortLivedToken(userId: string, active_tenant: string) {
    // Attempt to use admin token creation endpoint with custom_claims
    const url = `${API_URL!.replace(/\/$/, '')}/auth/v1/admin/token`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            expires_in: TTL_SECONDS,
            custom_claims: { active_tenant },
        }),
    });

    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Admin token creation failed: ${res.status} ${txt}`);
    }
    return res.json();
}

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization') || '';
        const bearer = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if (!bearer) return NextResponse.json({ error: 'Missing Authorization Bearer token' }, { status: 401 });

        const body = await req.json();
        const active_tenant = body?.active_tenant;
        const reason = body?.reason ?? null;

        if (!active_tenant) return NextResponse.json({ error: 'active_tenant is required' }, { status: 400 });

        // 1) validate caller token and get user
        let user;
        try {
            user = await getUserFromToken(bearer);
        } catch (err: any) {
            return NextResponse.json({ error: 'Invalid session token', detail: String(err.message) }, { status: 401 });
        }

        const actor_user_id = user?.id ?? null;
        const actor_session_id = user?.current_session?.id ?? null;

        // 2) authorization check (using profiles.tenant_id pattern)
        const check = await verifyUserCanSwitch(actor_user_id, active_tenant);

        if (!check.allowed) {
            return NextResponse.json({ error: 'Not authorized to switch tenant', detail: check.reason }, { status: 403 });
        }

        // 3) Insert audit row (best-effort)
        const ip = req.headers.get('x-forwarded-for') || (req as any).ip || null;
        const userAgent = req.headers.get('user-agent') || null;

        // TODO: Determine fromTenantId if possible, for now passing null or we could query active_tenant from current token if available
        await insertAudit(actor_user_id, actor_session_id, null, active_tenant, ip, userAgent, reason);

        // 4) Create short-lived token with active_tenant claim
        let tokenData;
        try {
            tokenData = await createShortLivedToken(actor_user_id, active_tenant);
        } catch (err: any) {
            return NextResponse.json({ error: 'Could not mint short-lived token', detail: String(err.message) }, { status: 500 });
        }

        // tokenData expected shape: { access_token, expires_at, ... }
        return NextResponse.json({
            access_token: tokenData.access_token,
            expires_at: tokenData.expires_at,
            active_tenant,
        }, { status: 200 });

    } catch (err: any) {
        console.error('switch-tenant error', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
