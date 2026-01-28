-- File: 20260128_02_enable_rls_and_add_policies__brand_profiles.sql
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY brand_profiles_select_tenant ON public.brand_profiles FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY brand_profiles_insert_tenant ON public.brand_profiles FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_profiles_update_tenant ON public.brand_profiles FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_profiles_delete_tenant ON public.brand_profiles FOR DELETE TO authenticated USING (tenant_id = user_tenant_id());
