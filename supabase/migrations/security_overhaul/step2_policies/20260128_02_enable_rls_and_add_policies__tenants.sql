-- File: 20260128_02_enable_rls_and_add_policies__tenants.sql
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Admins (user_role = 'admin' or owner) can view all or create tenants
-- Note: Requires user_role() function to be present.
CREATE POLICY tenants_select_admins ON public.tenants FOR SELECT TO authenticated USING ((user_role() = 'admin') OR (user_role() = 'owner'));

CREATE POLICY tenants_insert_admins ON public.tenants FOR INSERT TO authenticated WITH CHECK ((user_role() = 'admin') OR (user_role() = 'owner'));

-- Users can select their active tenant
CREATE POLICY tenants_select_own ON public.tenants FOR SELECT TO authenticated USING (id = get_active_tenant());

-- Users can update their own tenant (owner/admin)
CREATE POLICY tenants_update_owner ON public.tenants FOR UPDATE TO authenticated USING (id = user_tenant_id()) WITH CHECK ((user_role() = 'owner') OR (user_role() = 'admin'));
