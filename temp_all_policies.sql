-- File: 20260128_02_enable_rls_and_add_policies__assets.sql
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Authenticated users: only see rows in their active tenant
CREATE POLICY assets_select_tenant_isolation ON public.assets FOR SELECT TO authenticated USING ( tenant_id IS NOT NULL AND tenant_id = get_active_tenant() );

-- Authenticated users: can insert only into their active tenant
CREATE POLICY assets_insert_tenant_isolation ON public.assets FOR INSERT TO authenticated WITH CHECK ( tenant_id IS NOT NULL AND tenant_id = get_active_tenant() );

-- Authenticated users: update/delete only within their tenant
CREATE POLICY assets_update_tenant_isolation ON public.assets FOR UPDATE TO authenticated USING (tenant_id = get_active_tenant()) WITH CHECK (tenant_id = get_active_tenant());

CREATE POLICY assets_delete_tenant_isolation ON public.assets FOR DELETE TO authenticated USING (tenant_id = get_active_tenant());

-- Note: Existing anonymous/session-based policies are preserved and NOT dropped.
-- File: 20260128_02_enable_rls_and_add_policies__audit_log.sql
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Allow service role insertion (service_role bypasses RLS; policy strong-arming is optional)
CREATE POLICY audit_log_insert_service ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- Allow users to view audit_log only for their tenant (admins may require special claim)
CREATE POLICY audit_log_select_tenant ON public.audit_log FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());
-- File: 20260128_02_enable_rls_and_add_policies__brand_guidelines.sql
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY brand_guidelines_select_tenant ON public.brand_guidelines FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY brand_guidelines_insert_tenant ON public.brand_guidelines FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_guidelines_update_tenant ON public.brand_guidelines FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_guidelines_delete_tenant ON public.brand_guidelines FOR DELETE TO authenticated USING (tenant_id = user_tenant_id());
-- File: 20260128_02_enable_rls_and_add_policies__brand_profiles.sql
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY brand_profiles_select_tenant ON public.brand_profiles FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY brand_profiles_insert_tenant ON public.brand_profiles FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_profiles_update_tenant ON public.brand_profiles FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY brand_profiles_delete_tenant ON public.brand_profiles FOR DELETE TO authenticated USING (tenant_id = user_tenant_id());
-- File: 20260128_02_enable_rls_and_add_policies__mitigation_reports.sql
ALTER TABLE public.mitigation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY mitigation_reports_select_tenant ON public.mitigation_reports FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY mitigation_reports_insert_tenant ON public.mitigation_reports FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());
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
-- File: 20260128_02_enable_rls_and_add_policies__provenance_details.sql
ALTER TABLE public.provenance_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY provenance_details_select_tenant ON public.provenance_details FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY provenance_details_insert_tenant ON public.provenance_details FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY provenance_details_update_tenant ON public.provenance_details FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());
-- File: 20260128_02_enable_rls_and_add_policies__referral_events.sql
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY referral_events_select_tenant ON public.referral_events FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY referral_events_insert_service ON public.referral_events FOR INSERT TO authenticated WITH CHECK (true); -- service_role allowed
-- File: 20260128_02_enable_rls_and_add_policies__scan_findings.sql
ALTER TABLE public.scan_findings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated tenant-scoped view/insert/update
CREATE POLICY scan_findings_select_tenant ON public.scan_findings FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY scan_findings_insert_tenant ON public.scan_findings FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY scan_findings_update_tenant ON public.scan_findings FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

-- Note: Existing anonymous read policies for session-authorized scans are preserved.
-- File: 20260128_02_enable_rls_and_add_policies__scans.sql
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Authenticated users: only see rows for their tenant
CREATE POLICY scans_select_tenant_isolation ON public.scans FOR SELECT TO authenticated USING ( tenant_id IS NOT NULL AND tenant_id = user_tenant_id() );

-- Authenticated users: can insert only into their tenant (service_role/anonymous handled separately)
CREATE POLICY scans_insert_tenant_isolation ON public.scans FOR INSERT TO authenticated WITH CHECK ( tenant_id IS NOT NULL AND tenant_id = user_tenant_id() );

-- Authenticated users: update/delete only within their tenant
CREATE POLICY scans_update_tenant_isolation ON public.scans FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY scans_delete_tenant_isolation ON public.scans FOR DELETE TO authenticated USING (tenant_id = user_tenant_id());

-- Note: Existing anonymous/session-based policies are preserved and NOT dropped.
-- File: 20260128_02_enable_rls_and_add_policies__subscriptions.sql
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_tenant ON public.subscriptions FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY subscriptions_manage_service ON public.subscriptions FOR ALL TO authenticated USING (auth.role() = 'service_role' OR current_setting('jwt.claims.service', true) IS NOT NULL) WITH CHECK (true);
-- File: 20260128_02_enable_rls_and_add_policies__tenant_invites.sql
ALTER TABLE public.tenant_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_invites_select_tenant ON public.tenant_invites FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY tenant_invites_insert_admin ON public.tenant_invites FOR INSERT TO authenticated WITH CHECK ((tenant_id = user_tenant_id()) AND (user_role() = ANY (ARRAY['owner','admin'])));

CREATE POLICY tenant_invites_update_admin ON public.tenant_invites FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK ((tenant_id = user_tenant_id()) AND (user_role() = ANY (ARRAY['owner','admin'])));
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
-- File: 20260128_02_enable_rls_and_add_policies__usage_ledger.sql
ALTER TABLE public.usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_ledger_select_tenant ON public.usage_ledger FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY usage_ledger_insert_service ON public.usage_ledger FOR INSERT TO authenticated WITH CHECK (true); -- service_role/worker expected to use service_role which bypasses, or if using authenticated role, allow insert.

CREATE POLICY usage_ledger_update_service ON public.usage_ledger FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
-- File: 20260128_02_enable_rls_and_add_policies__video_frames.sql
ALTER TABLE public.video_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY video_frames_select_tenant ON public.video_frames FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY video_frames_insert_tenant ON public.video_frames FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY video_frames_update_tenant ON public.video_frames FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());
