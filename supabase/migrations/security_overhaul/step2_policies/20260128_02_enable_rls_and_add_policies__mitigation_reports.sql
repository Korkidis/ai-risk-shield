-- File: 20260128_02_enable_rls_and_add_policies__mitigation_reports.sql
ALTER TABLE public.mitigation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY mitigation_reports_select_tenant ON public.mitigation_reports FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY mitigation_reports_insert_tenant ON public.mitigation_reports FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());
