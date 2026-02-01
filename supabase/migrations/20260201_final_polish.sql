-- FINAL POLISH & SECURITY HARDENING
-- Date: 2026-02-01
-- Purpose: Add missing policies for `ips` and `tenant_switch_audit` (Linter Fix)

-- 1. IPS TABLE (IP Throttling)
-- Intended for backend service usage only.
CREATE POLICY "ips_service_full" ON public.ips
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- 2. TENANT_SWITCH_AUDIT TABLE
-- Service role needs to write logs.
CREATE POLICY "tenant_switch_audit_service_full" ON public.tenant_switch_audit
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Optional: Admins can view audit logs (if UI ever exposes it)
CREATE POLICY "tenant_switch_audit_select_admin" ON public.tenant_switch_audit
FOR SELECT TO authenticated
USING (
  (SELECT auth.jwt() ->> 'role') = 'admin' 
  OR 
  (auth.role() = 'service_role')
);
