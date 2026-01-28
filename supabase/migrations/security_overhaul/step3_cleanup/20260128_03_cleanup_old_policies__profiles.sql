-- File: 20260128_03_cleanup_old_policies__profiles.sql
-- DO NOT RUN until staging validated.

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
