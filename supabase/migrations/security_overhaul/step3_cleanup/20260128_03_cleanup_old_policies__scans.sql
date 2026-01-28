-- File: 20260128_03_cleanup_old_policies__scans.sql
-- DO NOT RUN until staging validated.

DROP POLICY IF EXISTS "Anonymous users can create scans" ON public.scans;
DROP POLICY IF EXISTS "Anonymous users can read own scans" ON public.scans;
DROP POLICY IF EXISTS "Users can view scans in their tenant" ON public.scans;
