-- File: 20260128_02_enable_rls_and_add_policies__assets.sql
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Authenticated users: only see rows in their active tenant
CREATE POLICY assets_select_tenant_isolation ON public.assets FOR SELECT TO authenticated USING ( tenant_id IS NOT NULL AND tenant_id = get_active_tenant() );

-- Authenticated users: can insert only into their active tenant
CREATE POLICY assets_insert_tenant_isolation ON public.assets FOR INSERT TO authenticated WITH CHECK ( tenant_id IS NOT NULL AND tenant_id = get_active_tenant() );

-- Authenticated users: update/delete only within their tenant
CREATE POLICY assets_update_tenant_isolation ON public.assets FOR UPDATE TO authenticated USING (tenant_id = get_active_tenant()) WITH CHECK (tenant_id = get_active_tenant());

CREATE POLICY assets_delete_tenant_isolation ON public.assets FOR DELETE TO authenticated USING (tenant_id = get_active_tenant());

-- Note: Existing anonymous/session-based policies are preserved and NOT dropped.
