-- COMPREHENSIVE LINTER REMEDIATIONS & SECURITY HARDEING
-- Date: 2026-02-01
-- Purpose: Address all outstanding linter warnings (Performance + Security).
-- Replaces/Supersedes previous partial performance tuning attempts.

-- =================================================================
-- 1. FIX AUTH_RLS_INITPLAN (Wrap auth.* in SELECT)
-- =================================================================

-- 1A. tenant_switch_audit
DROP POLICY IF EXISTS "tenant_switch_audit_select_admin" ON public.tenant_switch_audit;
CREATE POLICY "tenant_switch_audit_select_admin" ON public.tenant_switch_audit
FOR SELECT TO authenticated
USING (
  ((SELECT auth.jwt() ->> 'role') = 'admin') 
  OR 
  ((SELECT auth.role()) = 'service_role')
);

-- 1B. subscriptions (part of consolidation below)
-- 1C. referral_events (part of consolidation below)


-- =================================================================
-- 2. CONSOLIDATE PERMISSIVE POLICIES & TIGHTEN SECURITY
-- =================================================================

-- 2A. AUDIT_LOG
-- Problem: Multiple permissive policies + Permissive INSERT check
-- Fix: Consolidate SELECT, Restrict INSERT to service_role

DROP POLICY IF EXISTS "audit_log_insert_service" ON public.audit_log;
DROP POLICY IF EXISTS "audit_log_select_tenant" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view audit logs in their tenant" ON public.audit_log; -- remove old if exists

-- Strict Service Role Insert
CREATE POLICY "audit_log_insert_service_strict" ON public.audit_log
FOR INSERT TO authenticated
WITH CHECK (
    (SELECT auth.role()) = 'service_role' OR (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL
);

-- Consolidated Select (Tenant + potentially Admin if needed in future, keeping generic for now)
CREATE POLICY "audit_log_select_consolidated" ON public.audit_log
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
);


-- 2B. MITIGATION_REPORTS
-- Problem: Multiple permissive policies (select_tenant + "Users can view...")
DROP POLICY IF EXISTS "mitigation_reports_select_tenant" ON public.mitigation_reports;
DROP POLICY IF EXISTS "Users can view mitigation reports for their tenant" ON public.mitigation_reports;

CREATE POLICY "mitigation_reports_select_consolidated" ON public.mitigation_reports
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
);


-- 2C. PROVENANCE_DETAILS
DROP POLICY IF EXISTS "provenance_details_select_tenant" ON public.provenance_details;
DROP POLICY IF EXISTS "Users can view provenance details for their tenant" ON public.provenance_details;

CREATE POLICY "provenance_details_select_consolidated" ON public.provenance_details
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
);


-- 2D. SUBSCRIPTIONS
-- Problem: Multiple permissive + Permissive ALL + InitPlan warnings
DROP POLICY IF EXISTS "subscriptions_select_tenant" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_manage_service" ON public.subscriptions; -- Was FOR ALL
DROP POLICY IF EXISTS "Users can view subscriptions in their tenant" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_unified" ON public.subscriptions; -- From previous attempt
DROP POLICY IF EXISTS "subscriptions_mutate_service" ON public.subscriptions; -- From previous attempt

-- Consolidated SELECT: Tenant Owner OR Service Role
CREATE POLICY "subscriptions_select_consolidated" ON public.subscriptions
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
    OR 
    ((SELECT auth.role()) = 'service_role' OR (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL)
);

-- Strict Mutation: Service Role Only
CREATE POLICY "subscriptions_mutate_service_strict" ON public.subscriptions
FOR ALL TO authenticated
USING (
    ((SELECT auth.role()) = 'service_role' OR (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL)
)
WITH CHECK (
    ((SELECT auth.role()) = 'service_role' OR (SELECT current_setting('jwt.claims.service', true)) IS NOT NULL)
);


-- 2E. TENANT_INVITES
-- Problem: Multiple permissive (Insert Admin vs Select Tenant)
DROP POLICY IF EXISTS "tenant_invites_insert_admin" ON public.tenant_invites;
DROP POLICY IF EXISTS "Admins can create invites" ON public.tenant_invites;
DROP POLICY IF EXISTS "tenant_invites_select_tenant" ON public.tenant_invites;
DROP POLICY IF EXISTS "Users can view invites for their tenant" ON public.tenant_invites;

CREATE POLICY "tenant_invites_select_consolidated" ON public.tenant_invites
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
);

CREATE POLICY "tenant_invites_insert_consolidated" ON public.tenant_invites
FOR INSERT TO authenticated
WITH CHECK (
    (tenant_id = (SELECT user_tenant_id()))
    AND 
    ((SELECT user_role()) = ANY (ARRAY['owner','admin']))
);


-- 2F. TENANTS
-- Problem: Multiple permissive (Select Admins vs Select Own)
DROP POLICY IF EXISTS "tenants_select_admins" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_own" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_unified" ON public.tenants; -- From previous attempt
DROP POLICY IF EXISTS "Tenants: select own active tenant" ON public.tenants; 

CREATE POLICY "tenants_select_consolidated" ON public.tenants
FOR SELECT TO authenticated
USING (
    ((SELECT user_role()) IN ('admin', 'owner')) 
    OR 
    (id = (SELECT get_active_tenant()))
);


-- 2G. USAGE_LEDGER
-- Problem: Multiple permissive + Permissive Writes
DROP POLICY IF EXISTS "usage_ledger_select_tenant" ON public.usage_ledger;
DROP POLICY IF EXISTS "Users can view usage in their tenant" ON public.usage_ledger;
DROP POLICY IF EXISTS "usage_ledger_insert_service" ON public.usage_ledger;
DROP POLICY IF EXISTS "usage_ledger_update_service" ON public.usage_ledger;

CREATE POLICY "usage_ledger_select_consolidated" ON public.usage_ledger
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
);

CREATE POLICY "usage_ledger_insert_strict" ON public.usage_ledger
FOR INSERT TO authenticated
WITH CHECK (
    ((SELECT auth.role()) = 'service_role') OR (tenant_id = (SELECT current_setting('jwt.claims.tenant_id', true))::uuid)
);

CREATE POLICY "usage_ledger_update_strict" ON public.usage_ledger
FOR UPDATE TO authenticated
USING (
    tenant_id = (SELECT current_setting('jwt.claims.tenant_id', true))::uuid OR ((SELECT auth.role()) = 'service_role')
)
WITH CHECK (
    tenant_id = (SELECT current_setting('jwt.claims.tenant_id', true))::uuid OR ((SELECT auth.role()) = 'service_role')
);


-- 2H. VIDEO_FRAMES
-- Problem: Multiple permissive (Insert Tenant vs Select Tenant? The linter flagged Insert and Select)
DROP POLICY IF EXISTS "video_frames_insert_tenant" ON public.video_frames;
DROP POLICY IF EXISTS "Users can insert video frames in their tenant" ON public.video_frames;
DROP POLICY IF EXISTS "video_frames_select_tenant" ON public.video_frames;
DROP POLICY IF EXISTS "Users can view video frames in their tenant" ON public.video_frames;

CREATE POLICY "video_frames_select_consolidated" ON public.video_frames
FOR SELECT TO authenticated
USING (
    tenant_id = (SELECT user_tenant_id())
);

CREATE POLICY "video_frames_insert_consolidated" ON public.video_frames
FOR INSERT TO authenticated
WITH CHECK (
    tenant_id = (SELECT user_tenant_id())
);


-- =================================================================
-- 3. FIX FUNCTION SEARCH PATH (MUTABLE)
-- =================================================================
-- update_updated_at in remediation schema

CREATE OR REPLACE FUNCTION remediation.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = remediation, public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;
