-- File: 20260128_03_cleanup_old_policies__mitigation_reports.sql
DROP POLICY IF EXISTS "Users can view mitigation reports for their tenant" ON public.mitigation_reports;
