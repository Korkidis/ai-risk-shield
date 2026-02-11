-- Migration: Add metadata to tenant_invites
-- Description: Align repo schema with live DB (tenant_invites.metadata jsonb)

ALTER TABLE public.tenant_invites
  ADD COLUMN IF NOT EXISTS metadata jsonb;

UPDATE public.tenant_invites
  SET metadata = '{}'::jsonb
  WHERE metadata IS NULL;

ALTER TABLE public.tenant_invites
  ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
