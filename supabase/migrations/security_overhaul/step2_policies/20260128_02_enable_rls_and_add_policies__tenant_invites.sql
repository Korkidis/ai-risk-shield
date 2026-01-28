-- File: 20260128_02_enable_rls_and_add_policies__tenant_invites.sql
ALTER TABLE public.tenant_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_invites_select_tenant ON public.tenant_invites FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY tenant_invites_insert_admin ON public.tenant_invites FOR INSERT TO authenticated WITH CHECK ((tenant_id = user_tenant_id()) AND (user_role() = ANY (ARRAY['owner','admin'])));

CREATE POLICY tenant_invites_update_admin ON public.tenant_invites FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK ((tenant_id = user_tenant_id()) AND (user_role() = ANY (ARRAY['owner','admin'])));
