-- File: 20260128_03_cleanup_old_policies__tenant_invites.sql
DROP POLICY IF EXISTS "Admins can create invites" ON public.tenant_invites;
DROP POLICY IF EXISTS "Users can view invites for their tenant" ON public.tenant_invites;
