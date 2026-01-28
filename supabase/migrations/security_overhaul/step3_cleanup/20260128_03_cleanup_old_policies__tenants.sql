-- File: 20260128_03_cleanup_old_policies__tenants.sql
-- DO NOT RUN until staging validated.

DROP POLICY IF EXISTS "Tenants: select own active tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: agency admin can select own children" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;
