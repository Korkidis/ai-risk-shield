-- File: 20260128_03_cleanup_old_policies__audit_log.sql
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Users can view audit logs in their tenant" ON public.audit_log;
