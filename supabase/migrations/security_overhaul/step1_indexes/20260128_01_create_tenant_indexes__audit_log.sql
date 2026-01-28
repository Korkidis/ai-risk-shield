CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_tenant_id ON public.audit_log(tenant_id);
