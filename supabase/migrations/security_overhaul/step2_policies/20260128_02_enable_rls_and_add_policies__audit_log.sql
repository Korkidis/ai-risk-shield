-- File: 20260128_02_enable_rls_and_add_policies__audit_log.sql
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Allow service role insertion (service_role bypasses RLS; policy strong-arming is optional)
CREATE POLICY audit_log_insert_service ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Allow users to view audit_log only for their tenant (admins may require special claim)
CREATE POLICY audit_log_select_tenant ON public.audit_log FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());
