CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_switch_audit_to_tenant_id ON public.tenant_switch_audit(to_tenant_id);
