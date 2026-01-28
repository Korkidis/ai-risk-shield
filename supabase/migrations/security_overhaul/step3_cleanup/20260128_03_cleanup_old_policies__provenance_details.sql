-- File: 20260128_03_cleanup_old_policies__provenance_details.sql
DROP POLICY IF EXISTS "Users can view provenance details for their tenant" ON public.provenance_details;
