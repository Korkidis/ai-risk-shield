-- AI Risk Shield - Fix Function Search Paths
-- Created: 2026-01-22
-- Description: Fixes 'function_search_path_mutable' warnings by explicitly setting search_path

-- 1. Fix public.current_session_id()
CREATE OR REPLACE FUNCTION public.current_session_id()
RETURNS TEXT
SET search_path = public
AS $$
    SELECT current_setting('request.headers', true)::json->>'x-session-id';
$$ LANGUAGE sql STABLE;

-- 2. Fix public.user_tenant_id()
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS UUID
SET search_path = public
AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
