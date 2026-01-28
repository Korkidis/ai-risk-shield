-- File: 20260128_02_enable_rls_and_add_policies__scans.sql
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Authenticated users: only see rows for their tenant
CREATE POLICY scans_select_tenant_isolation ON public.scans FOR SELECT TO authenticated USING ( tenant_id IS NOT NULL AND tenant_id = user_tenant_id() );

-- Authenticated users: can insert only into their tenant (service_role/anonymous handled separately)
CREATE POLICY scans_insert_tenant_isolation ON public.scans FOR INSERT TO authenticated WITH CHECK ( tenant_id IS NOT NULL AND tenant_id = user_tenant_id() );

-- Authenticated users: update/delete only within their tenant
CREATE POLICY scans_update_tenant_isolation ON public.scans FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY scans_delete_tenant_isolation ON public.scans FOR DELETE TO authenticated USING (tenant_id = user_tenant_id());

-- Note: Existing anonymous/session-based policies are preserved and NOT dropped.
