-- Remediation Migration: Hardening RLS & Removing Duplicate Indexes
-- Date: 2026-02-01
-- Author: AI Risk Shield Agent

-- 1. DROP DUPLICATE INDEXES
-- These indexes are redundant (covered by idx_*_tenant_id or similar).
-- Dropping them improves write performance and reduces storage.

DROP INDEX IF EXISTS public.idx_assets_tenant;
DROP INDEX IF EXISTS public.idx_audit_log_tenant;
DROP INDEX IF EXISTS public.idx_brand_guidelines_tenant;
DROP INDEX IF EXISTS public.idx_brand_profiles_tenant;
DROP INDEX IF EXISTS public.idx_profiles_tenant;
DROP INDEX IF EXISTS public.idx_findings_tenant; -- Note: diff name than standard
DROP INDEX IF EXISTS public.idx_scans_tenant;
DROP INDEX IF EXISTS public.idx_subscriptions_tenant;
DROP INDEX IF EXISTS public.idx_video_frames_tenant;

-- 1b. ADD MISSING INDEXES (Performance Fixes)
-- Linter identified unindexed foreign key in tenant_switch_audit
CREATE INDEX IF NOT EXISTS idx_tenant_switch_audit_from_tenant 
ON public.tenant_switch_audit(from_tenant_id);

-- 2. HARDEN RLS POLICIES (PROFILES)
-- Wraps auth.uid() in (SELECT auth.uid()) to preventing re-evaluation per row.
-- Assumes logic is "user can act on their own profile".

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
FOR INSERT TO authenticated 
WITH CHECK (
  id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles 
FOR UPDATE TO authenticated 
USING (
  id = (SELECT auth.uid())
)
WITH CHECK (
  id = (SELECT auth.uid())
);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles 
FOR DELETE TO authenticated 
USING (
  id = (SELECT auth.uid())
);

-- 3. HARDEN RLS POLICIES (SUBSCRIPTIONS)
-- Verified via Supabase Agent. Wraps auth.role() and current_setting() to prevent re-evaluation.

DROP POLICY IF EXISTS "subscriptions_manage_service" ON public.subscriptions;
CREATE POLICY "subscriptions_manage_service" ON public.subscriptions
FOR ALL TO authenticated
USING (
  (SELECT auth.role()) = 'service_role'::text 
  OR 
  (SELECT current_setting('jwt.claims.service'::text, true)) IS NOT NULL
)
WITH CHECK (true);


-- 4. PERMISSIVE POLICIES (TODO)
-- "Start RLS" architecture often leaves multiple permissive policies.
-- Review `scripts/check-assets-table.sql` or similar to consolidate them later.

