-- File: 20260128_02_enable_rls_and_add_policies__usage_ledger.sql
ALTER TABLE public.usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_ledger_select_tenant ON public.usage_ledger FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY usage_ledger_insert_service ON public.usage_ledger FOR INSERT TO authenticated WITH CHECK (true); -- service_role/worker expected to use service_role which bypasses, or if using authenticated role, allow insert.

CREATE POLICY usage_ledger_update_service ON public.usage_ledger FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
