-- File: 20260128_03_cleanup_old_policies__usage_ledger.sql
DROP POLICY IF EXISTS "Users can view usage in their tenant" ON public.usage_ledger;
