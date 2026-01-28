-- File: 20260128_03_cleanup_old_policies__subscriptions.sql
DROP POLICY IF EXISTS "Users can view subscriptions in their tenant" ON public.subscriptions;
