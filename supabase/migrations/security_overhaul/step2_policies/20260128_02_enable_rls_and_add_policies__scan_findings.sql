-- File: 20260128_02_enable_rls_and_add_policies__scan_findings.sql
ALTER TABLE public.scan_findings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated tenant-scoped view/insert/update
CREATE POLICY scan_findings_select_tenant ON public.scan_findings FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY scan_findings_insert_tenant ON public.scan_findings FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY scan_findings_update_tenant ON public.scan_findings FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());

-- Note: Existing anonymous read policies for session-authorized scans are preserved.
