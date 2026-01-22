-- AI Risk Shield - Performance & RLS Fixes (REFINED)
-- Created: 2026-01-22
-- Description: Addresses linter warnings (auth_rls_initplan, multiple_permissive_policies, unindexed_foreign_keys)

-- ============================================================================
-- 0. HELPER FUNCTIONS (Performance)
-- ============================================================================
-- Create a STABLE function for session_id to allow Postgres to cache the result per statement
-- This fixes 'auth_rls_initplan' warnings for anonymous policies
CREATE OR REPLACE FUNCTION public.current_session_id()
RETURNS TEXT AS $$
    SELECT current_setting('request.headers', true)::json->>'x-session-id';
$$ LANGUAGE sql STABLE;

-- Ensure user_tenant_id is optimized
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- 1. ADD MISSING INDEXES (Performance)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON public.assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_mitigation_reports_created_by ON public.mitigation_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_mitigation_reports_scan_id ON public.mitigation_reports(scan_id);
CREATE INDEX IF NOT EXISTS idx_mitigation_reports_tenant_id ON public.mitigation_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_scan_id ON public.referral_events(scan_id);
CREATE INDEX IF NOT EXISTS idx_scans_analyzed_by ON public.scans(analyzed_by);
CREATE INDEX IF NOT EXISTS idx_scans_brand_profile_id ON public.scans(brand_profile_id);

-- Check if guideline_id exists before indexing (safeguard)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scans' AND column_name = 'guideline_id') THEN
        CREATE INDEX IF NOT EXISTS idx_scans_guideline_id ON public.scans(guideline_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tenant_invites_invited_by ON public.tenant_invites(invited_by);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_tenant_id ON public.tenant_invites(tenant_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES (auth_rls_initplan & Multiple Permissive Policies)
-- ============================================================================
-- Strategy:
-- 1. Restrict tenant policies to 'authenticated' role.
-- 2. Wrap auth function calls in (SELECT ...) to prevent per-row re-evaluation.
-- 3. Use public.current_session_id() for anon policies.

-- A. PROFILES
-- Fixes 'multiple_permissive_policies': Removed redundant "Users can view own profile" (covered by tenant policy)
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view profiles in their tenant"
ON public.profiles FOR SELECT
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()));

-- B. ASSETS
DROP POLICY IF EXISTS "Users can view assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can insert assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can delete assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Anonymous users can read own assets" ON public.assets; 

CREATE POLICY "Users can view assets in their tenant"
ON public.assets FOR SELECT
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can insert assets in their tenant"
ON public.assets FOR INSERT
TO authenticated
WITH CHECK (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can delete assets in their tenant"
ON public.assets FOR DELETE
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Anonymous users can read own assets"
ON public.assets FOR SELECT
TO anon
USING (
  session_id IS NOT NULL AND
  session_id = (SELECT public.current_session_id())
);

-- C. SCANS
DROP POLICY IF EXISTS "Users can view scans in their tenant" ON public.scans;
DROP POLICY IF EXISTS "Users can insert scans in their tenant" ON public.scans;
DROP POLICY IF EXISTS "Users can update scans in their tenant" ON public.scans;
DROP POLICY IF EXISTS "Anonymous users can read own scans" ON public.scans;

CREATE POLICY "Users can view scans in their tenant"
ON public.scans FOR SELECT
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can insert scans in their tenant"
ON public.scans FOR INSERT
TO authenticated
WITH CHECK (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can update scans in their tenant"
ON public.scans FOR UPDATE
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Anonymous users can read own scans"
ON public.scans FOR SELECT
TO anon
USING (
  session_id IS NOT NULL AND
  session_id = (SELECT public.current_session_id())
);

-- D. SCAN FINDINGS
DROP POLICY IF EXISTS "Users can view findings in their tenant" ON public.scan_findings;
DROP POLICY IF EXISTS "Users can insert findings in their tenant" ON public.scan_findings;
DROP POLICY IF EXISTS "Anonymous users can read own findings" ON public.scan_findings;

CREATE POLICY "Users can view findings in their tenant"
ON public.scan_findings FOR SELECT
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can insert findings in their tenant"
ON public.scan_findings FOR INSERT
TO authenticated
WITH CHECK (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Anonymous users can read own findings"
ON public.scan_findings FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.scans
    WHERE scans.id = scan_findings.scan_id
    AND scans.session_id IS NOT NULL
    AND scans.session_id = (SELECT public.current_session_id())
  )
);

-- E. BRAND PROFILES
DROP POLICY IF EXISTS "Users can view brand profiles in their tenant" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can insert brand profiles in their tenant" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can update brand profiles in their tenant" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can delete brand profiles in their tenant" ON public.brand_profiles;

CREATE POLICY "Users can view brand profiles in their tenant"
ON public.brand_profiles FOR SELECT
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can insert brand profiles in their tenant"
ON public.brand_profiles FOR INSERT
TO authenticated
WITH CHECK (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can update brand profiles in their tenant"
ON public.brand_profiles FOR UPDATE
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

CREATE POLICY "Users can delete brand profiles in their tenant"
ON public.brand_profiles FOR DELETE
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

-- F. BRAND GUIDELINES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_guidelines') THEN
        DROP POLICY IF EXISTS "Users can view brand guidelines of their tenant" ON public.brand_guidelines;
        DROP POLICY IF EXISTS "Users can insert brand guidelines for their tenant" ON public.brand_guidelines;
        DROP POLICY IF EXISTS "Users can update brand guidelines of their tenant" ON public.brand_guidelines;
        DROP POLICY IF EXISTS "Users can delete brand guidelines of their tenant" ON public.brand_guidelines;

        CREATE POLICY "Users can view brand guidelines of their tenant"
        ON public.brand_guidelines FOR SELECT
        TO authenticated
        USING (tenant_id = (SELECT public.user_tenant_id()));

        CREATE POLICY "Users can insert brand guidelines for their tenant"
        ON public.brand_guidelines FOR INSERT
        TO authenticated
        WITH CHECK (tenant_id = (SELECT public.user_tenant_id()));

        CREATE POLICY "Users can update brand guidelines of their tenant"
        ON public.brand_guidelines FOR UPDATE
        TO authenticated
        USING (tenant_id = (SELECT public.user_tenant_id()));

        CREATE POLICY "Users can delete brand guidelines of their tenant"
        ON public.brand_guidelines FOR DELETE
        TO authenticated
        USING (tenant_id = (SELECT public.user_tenant_id()));
    END IF;
END $$;
