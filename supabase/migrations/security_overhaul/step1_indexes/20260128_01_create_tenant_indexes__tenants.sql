CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_parent_tenant_id ON public.tenants(parent_tenant_id);
