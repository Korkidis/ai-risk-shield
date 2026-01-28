-- File: 20260128_02_enable_rls_and_add_policies__subscriptions.sql
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_tenant ON public.subscriptions FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY subscriptions_manage_service ON public.subscriptions FOR ALL TO authenticated USING (auth.role() = 'service_role' OR current_setting('jwt.claims.service', true) IS NOT NULL) WITH CHECK (true);
