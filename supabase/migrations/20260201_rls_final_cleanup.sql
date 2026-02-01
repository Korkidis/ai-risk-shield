-- Final RLS Policy Cleanup
-- Fixes remaining 4 WARN-level linter issues
-- Created: 2026-02-01

-- ============================================================================
-- 1. FIX: referral_events_insert_unified (auth_rls_initplan)
-- Wrap auth functions in (SELECT ...) for performance
-- ============================================================================
DROP POLICY IF EXISTS "referral_events_insert_unified" ON public.referral_events;
DROP POLICY IF EXISTS "referral_events_insert_service" ON public.referral_events;

CREATE POLICY "referral_events_insert_optimized" ON public.referral_events
FOR INSERT TO authenticated
WITH CHECK (
    -- Allow service role
    (SELECT auth.role()) = 'service_role'
    OR
    (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL
    OR
    -- Allow users to insert for their own tenant
    tenant_id = (SELECT user_tenant_id())
);

-- ============================================================================
-- 2. FIX: tenant_switch_audit_select_admin (auth_rls_initplan)
-- Already wrapping in SELECT, but ensure it's the only policy
-- ============================================================================
DROP POLICY IF EXISTS "tenant_switch_audit_select_admin" ON public.tenant_switch_audit;

CREATE POLICY "tenant_switch_audit_select_optimized" ON public.tenant_switch_audit
FOR SELECT TO authenticated
USING (
    -- Only admins and service role can view audit logs
    ((SELECT auth.jwt()) ->> 'role') = 'admin'
    OR
    (SELECT auth.role()) = 'service_role'
);

-- ============================================================================
-- 3. FIX: subscriptions multiple_permissive_policies
-- Consolidate into single SELECT policy
-- ============================================================================
DROP POLICY IF EXISTS "subscriptions_mutate_service_strict" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_consolidated" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_tenant" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_manage_service" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_unified" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_mutate_service" ON public.subscriptions;

-- Single consolidated SELECT policy
CREATE POLICY "subscriptions_select" ON public.subscriptions
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
    OR
    (SELECT auth.role()) = 'service_role'
    OR
    (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL
);

-- Separate policies for INSERT, UPDATE, DELETE (not ALL - which includes SELECT)
CREATE POLICY "subscriptions_insert" ON public.subscriptions
FOR INSERT TO authenticated
WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR
    (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL
);

CREATE POLICY "subscriptions_update" ON public.subscriptions
FOR UPDATE TO authenticated
USING (
    (SELECT auth.role()) = 'service_role'
    OR
    (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL
)
WITH CHECK (
    (SELECT auth.role()) = 'service_role'
    OR
    (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL
);

CREATE POLICY "subscriptions_delete" ON public.subscriptions
FOR DELETE TO authenticated
USING (
    (SELECT auth.role()) = 'service_role'
    OR
    (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL
);

-- ============================================================================
-- 4. FIX: tenants multiple_permissive_policies for UPDATE
-- Consolidate duplicate UPDATE policies
-- ============================================================================
DROP POLICY IF EXISTS "Users can update their own tenant" ON public.tenants;
DROP POLICY IF EXISTS "tenants_update_owner" ON public.tenants;

-- Single consolidated UPDATE policy
CREATE POLICY "tenants_update" ON public.tenants
FOR UPDATE TO authenticated
USING (
    id = (SELECT user_tenant_id())
    OR
    (SELECT auth.role()) = 'service_role'
)
WITH CHECK (
    id = (SELECT user_tenant_id())
    OR
    (SELECT auth.role()) = 'service_role'
);
