-- File: 20260128_02_enable_rls_and_add_policies_all.sql
-- STEP 2: ADDITIVE RLS POLICIES
-- Purpose: Enable RLS and add new v2 policies. DO NOT DROP OLD POLICIES YET.
-- Claim: auth.jwt() ->> 'active_tenant'

BEGIN;

-- ==============================================================================
-- 1. PROFILES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v2_profiles_select_tenant" ON public.profiles FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

CREATE POLICY "v2_profiles_insert_tenant" ON public.profiles FOR INSERT TO authenticated
WITH CHECK ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

CREATE POLICY "v2_profiles_update_tenant" ON public.profiles FOR UPDATE TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid )
WITH CHECK ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

CREATE POLICY "v2_profiles_delete_tenant" ON public.profiles FOR DELETE TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );


-- ==============================================================================
-- 2. ASSETS (Hybrid: Auth + Anon)
-- ==============================================================================
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Auth Select (Strict)
CREATE POLICY "v2_assets_select_auth" ON public.assets FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

-- Anon/Hybrid Insert
CREATE POLICY "v2_assets_insert_hybrid" ON public.assets FOR INSERT TO authenticated, public
WITH CHECK (
  ( -- Authenticated: STRICT active_tenant match
    (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid
  )
  OR
  ( -- Anonymous: No tenant_id, session_id present
    tenant_id IS NULL AND session_id IS NOT NULL
  )
);


-- ==============================================================================
-- 3. SCANS (Hybrid: Auth + Anon)
-- ==============================================================================
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Auth Select (Strict)
CREATE POLICY "v2_scans_select_auth" ON public.scans FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

-- Anon/Hybrid Insert
CREATE POLICY "v2_scans_insert_hybrid" ON public.scans FOR INSERT TO authenticated, public
WITH CHECK (
  ( -- Authenticated: STRICT active_tenant match
    (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid
  )
  OR
  ( -- Anonymous: No tenant_id
    tenant_id IS NULL
  )
);


-- ==============================================================================
-- 4. SYSTEM LOGS (Audit Log)
-- ==============================================================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admin Read Only
CREATE POLICY "v2_audit_log_select_admin" ON public.audit_log FOR SELECT TO authenticated
USING ( (auth.jwt() ->> 'user_role') = 'admin' );

-- Service Insert (Allow all authenticated/service role to log, essentially)
CREATE POLICY "v2_audit_log_insert_service" ON public.audit_log FOR INSERT TO authenticated
WITH CHECK ( TRUE );


-- ==============================================================================
-- 5. STANDARD TENANT TABLES (Strict Isolation)
-- (usage_ledger, subscriptions, brand_guidelines, mitigation_reports, etc.)
-- ==============================================================================

-- Usage Ledger
ALTER TABLE public.usage_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v2_usage_ledger_select_tenant" ON public.usage_ledger FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

-- Subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v2_subscriptions_select_tenant" ON public.subscriptions FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

-- Brand Guidelines
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v2_brand_guidelines_select_tenant" ON public.brand_guidelines FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

-- Mitigation Reports
ALTER TABLE public.mitigation_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v2_mitigation_reports_select_tenant" ON public.mitigation_reports FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );

-- Scan Findings
ALTER TABLE public.scan_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "v2_scan_findings_select_tenant" ON public.scan_findings FOR SELECT TO authenticated
USING ( tenant_id IS NOT NULL AND (auth.jwt() ->> 'active_tenant') IS NOT NULL AND tenant_id = (auth.jwt() ->> 'active_tenant')::uuid );


-- ==============================================================================
-- 6. TENANTS TABLE (Admin Only)
-- ==============================================================================
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "v2_tenants_select_admin" ON public.tenants FOR SELECT TO authenticated
USING ( (auth.jwt() ->> 'user_role') = 'admin' );

COMMIT;
