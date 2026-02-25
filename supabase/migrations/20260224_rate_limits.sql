-- Phase R: Rate Limiting table for auth and API endpoint protection
-- Stores sliding-window timestamps per (key, action) pair.
-- Service role only (no RLS policies = no anon/authenticated access).

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,              -- e.g. "iphash_abc123" or "user_uuid"
  action TEXT NOT NULL,           -- e.g. "login", "signup", "password_reset", "magic_link", "upload", "checkout"
  timestamps TIMESTAMPTZ[] NOT NULL DEFAULT '{}',
  blocked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint for upsert by (key, action)
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_key_action
  ON public.rate_limits (key, action);

-- Cleanup index for pruning stale entries
CREATE INDEX IF NOT EXISTS idx_rate_limits_updated
  ON public.rate_limits (updated_at);

-- RLS enabled but NO policies = service role only
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Periodic cleanup: delete entries not updated in 24 hours
-- (Can be triggered by a cron job or called manually)
CREATE OR REPLACE FUNCTION public.cleanup_stale_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limits
  WHERE updated_at < now() - interval '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
