-- File: 20260128_02_enable_rls_and_add_policies__profiles.sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view profiles in their tenant
CREATE POLICY profiles_select_tenant_isolation ON public.profiles FOR SELECT TO authenticated USING ( tenant_id IS NOT NULL AND tenant_id = user_tenant_id() );

-- Users can insert profiles only for themselves and tenant matched
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK ( id = auth.uid() AND tenant_id = user_tenant_id() );

-- Users can update their own profile
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND tenant_id = user_tenant_id());

-- Users can delete only if same id (optional - often disallowed)
CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());
