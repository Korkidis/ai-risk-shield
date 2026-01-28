-- File: 20260128_03_cleanup_old_policies__scan_findings.sql
DROP POLICY IF EXISTS "Anonymous users can read own findings" ON public.scan_findings;
