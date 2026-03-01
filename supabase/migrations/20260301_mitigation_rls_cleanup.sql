-- Linter cleanup: mitigation_reports RLS consolidation + function search_path hardening
-- Date: 2026-03-01
-- Purpose:
-- 1) Remove overlapping permissive policies on mitigation_reports.
-- 2) Replace role-check policy expressions with role-scoped policies.
-- 3) Ensure flagged functions have immutable search_path.

-- -----------------------------------------------------------------------------
-- 1) mitigation_reports policy consolidation
-- -----------------------------------------------------------------------------

ALTER TABLE public.mitigation_reports ENABLE ROW LEVEL SECURITY;

-- Drop known legacy/duplicate policy names from prior migrations.
DROP POLICY IF EXISTS mitigation_reports_select_tenant ON public.mitigation_reports;
DROP POLICY IF EXISTS mitigation_reports_insert_tenant ON public.mitigation_reports;
DROP POLICY IF EXISTS mitigation_reports_tenant_select ON public.mitigation_reports;
DROP POLICY IF EXISTS mitigation_reports_tenant_insert ON public.mitigation_reports;
DROP POLICY IF EXISTS mitigation_reports_service_all ON public.mitigation_reports;
DROP POLICY IF EXISTS mitigation_reports_select_consolidated ON public.mitigation_reports;
DROP POLICY IF EXISTS v2_mitigation_reports_select_tenant ON public.mitigation_reports;
DROP POLICY IF EXISTS "Users can view mitigation reports for their tenant" ON public.mitigation_reports;

-- Tenant read access
CREATE POLICY mitigation_reports_tenant_select
ON public.mitigation_reports
FOR SELECT
TO authenticated
USING (tenant_id = (SELECT public.user_tenant_id()));

-- Tenant insert access
CREATE POLICY mitigation_reports_tenant_insert
ON public.mitigation_reports
FOR INSERT
TO authenticated
WITH CHECK (tenant_id = (SELECT public.user_tenant_id()));

-- Worker/service-role full access
CREATE POLICY mitigation_reports_service_all
ON public.mitigation_reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- -----------------------------------------------------------------------------
-- 2) Function search_path hardening
-- -----------------------------------------------------------------------------

-- Keep cleanup function secure and search_path-stable.
CREATE OR REPLACE FUNCTION public.cleanup_stale_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limits
  WHERE updated_at < now() - interval '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_stale_rate_limits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_stale_rate_limits() TO service_role;

-- Claim function uses fixed search_path and schema-qualified references.
CREATE OR REPLACE FUNCTION public.claim_failed_usage_reports(batch_limit int DEFAULT 50)
RETURNS SETOF public.failed_usage_reports
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.failed_usage_reports
  SET next_retry_at = now() + interval '10 minutes'
  WHERE id IN (
    SELECT id
    FROM public.failed_usage_reports
    WHERE resolved_at IS NULL
      AND attempts < max_attempts
      AND next_retry_at <= now()
    ORDER BY created_at ASC
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

