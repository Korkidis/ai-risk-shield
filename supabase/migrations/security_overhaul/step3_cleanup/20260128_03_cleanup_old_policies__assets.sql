-- File: 20260128_03_cleanup_old_policies__assets.sql
-- DO NOT RUN until staging validated.
-- Drop legacy tenant policies only after validation.

DROP POLICY IF EXISTS "Assets: select only for active tenant" ON public.assets;
DROP POLICY IF EXISTS "Assets: insert only into active tenant" ON public.assets;
DROP POLICY IF EXISTS "Assets: update only within active tenant" ON public.assets;
DROP POLICY IF EXISTS "Assets: delete only within active tenant" ON public.assets;
DROP POLICY IF EXISTS "Anonymous users can read own assets" ON public.assets;
DROP POLICY IF EXISTS "Anonymous users can upload assets" ON public.assets;
