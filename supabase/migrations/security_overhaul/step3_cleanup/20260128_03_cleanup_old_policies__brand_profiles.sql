-- File: 20260128_03_cleanup_old_policies__brand_profiles.sql
DROP POLICY IF EXISTS "Users can view brand profiles in their tenant" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can insert brand profiles in their tenant" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can update brand profiles in their tenant" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can delete brand profiles in their tenant" ON public.brand_profiles;
