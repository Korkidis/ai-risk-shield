-- File: 20260128_03_cleanup_old_policies__brand_guidelines.sql
DROP POLICY IF EXISTS "Users can view brand guidelines of their tenant" ON public.brand_guidelines;
DROP POLICY IF EXISTS "Users can insert brand guidelines for their tenant" ON public.brand_guidelines;
DROP POLICY IF EXISTS "Users can update brand guidelines of their tenant" ON public.brand_guidelines;
DROP POLICY IF EXISTS "Users can delete brand guidelines of their tenant" ON public.brand_guidelines;
