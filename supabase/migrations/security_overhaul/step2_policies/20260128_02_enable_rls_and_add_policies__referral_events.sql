-- File: 20260128_02_enable_rls_and_add_policies__referral_events.sql
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_events_select_tenant ON public.referral_events FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY referral_events_insert_service ON public.referral_events FOR INSERT TO authenticated WITH CHECK (true); -- service_role allowed
