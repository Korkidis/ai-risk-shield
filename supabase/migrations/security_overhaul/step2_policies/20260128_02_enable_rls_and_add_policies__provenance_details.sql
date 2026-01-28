-- File: 20260128_02_enable_rls_and_add_policies__provenance_details.sql
ALTER TABLE public.provenance_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY provenance_details_select_tenant ON public.provenance_details FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY provenance_details_insert_tenant ON public.provenance_details FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY provenance_details_update_tenant ON public.provenance_details FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());
