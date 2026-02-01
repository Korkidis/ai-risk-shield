-- PERFORMANCE TUNING - PART 1: POLICIES
-- Date: 2026-02-01
-- Purpose: Consolidate permissive policies (Transactional Safe)

-- 1. CONSOLIDATE TENANTS POLICIES
DROP POLICY IF EXISTS "tenants_select_admins" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;

CREATE POLICY "tenants_select_unified" ON public.tenants
FOR SELECT TO authenticated
USING (
    (user_role() IN ('admin', 'owner')) 
    OR 
    (id = get_active_tenant())
);

-- 2. CONSOLIDATE SUBSCRIPTIONS POLICIES (SELECT)
DROP POLICY IF EXISTS "subscriptions_select_tenant" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_manage_service" ON public.subscriptions;

CREATE POLICY "subscriptions_select_unified" ON public.subscriptions
FOR SELECT TO authenticated
USING (
    tenant_id = user_tenant_id()
    OR 
    (auth.role() = 'service_role' OR current_setting('jwt.claims.service', true) IS NOT NULL)
);

CREATE POLICY "subscriptions_mutate_service" ON public.subscriptions
FOR ALL TO authenticated
USING (
    (auth.role() = 'service_role' OR current_setting('jwt.claims.service', true) IS NOT NULL)
)
WITH CHECK (true);


-- 3. CONSOLIDATE REFERRAL_EVENTS POLICIES
DROP POLICY IF EXISTS "referral_events_insert_own" ON public.referral_events;
DROP POLICY IF EXISTS "referral_events_insert_service" ON public.referral_events;

CREATE POLICY "referral_events_insert_unified" ON public.referral_events
FOR INSERT TO authenticated
WITH CHECK (
   (user_id = (SELECT auth.uid()))
   OR
   (auth.role() = 'service_role' OR current_setting('jwt.claims.service', true) IS NOT NULL)
);
