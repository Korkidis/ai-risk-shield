-- File: 20260128_02_enable_rls_and_add_policies__brand_guidelines.sql
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY brand_guidelines_select_tenant ON public.brand_guidelines FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY brand_guidelines_insert_tenant ON public.brand_guidelines FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_guidelines_update_tenant ON public.brand_guidelines FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_guidelines_delete_tenant ON public.brand_guidelines FOR DELETE TO authenticated USING (tenant_id = user_tenant_id());
