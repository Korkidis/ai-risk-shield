-- Migration: Secure helper function privileges
-- Description: Restricts get_user_tenant_id function to authenticated users only
-- Date: 2026-01-25

-- Revoke public access (prevents unauthenticated calls)
REVOKE EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) FROM PUBLIC;

-- Grant only to authorized roles
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) TO postgres;
