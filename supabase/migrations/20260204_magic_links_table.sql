-- Create magic_links table for passwordless authentication
CREATE TABLE IF NOT EXISTS public.magic_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_magic_links_token ON public.magic_links(token) WHERE used_at IS NULL;

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_magic_links_expires ON public.magic_links(expires_at) WHERE used_at IS NULL;

-- Enable RLS
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- Service role can manage all magic links
CREATE POLICY magic_links_service_role ON public.magic_links
FOR ALL
TO authenticated
USING (auth.role() = 'service_role' OR current_setting('jwt.claims.service', true) IS NOT NULL)
WITH CHECK (true);
