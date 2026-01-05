-- Freemium Model Migration (Safe Version)
-- Enable anonymous scans and email-based conversion

-- 1. Make analyzed_by nullable for anonymous scans (if not already)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'analyzed_by' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE scans ALTER COLUMN analyzed_by DROP NOT NULL;
  END IF;
END $$;

-- 2. Make uploaded_by nullable for anonymous assets (if not already)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'uploaded_by' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE assets ALTER COLUMN uploaded_by DROP NOT NULL;
  END IF;
END $$;

-- 3. Add session_id for anonymous tracking (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE scans ADD COLUMN session_id TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assets' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE assets ADD COLUMN session_id TEXT;
  END IF;
END $$;

-- 4. Add email capture tracking (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'email'
  ) THEN
    ALTER TABLE scans ADD COLUMN email TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'email_captured_at'
  ) THEN
    ALTER TABLE scans ADD COLUMN email_captured_at TIMESTAMPTZ;
  END IF;
END $$;

-- 5. Add purchase tracking (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'purchased'
  ) THEN
    ALTER TABLE scans ADD COLUMN purchased BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'purchase_type'
  ) THEN
    ALTER TABLE scans ADD COLUMN purchase_type TEXT CHECK (purchase_type IN ('one_time', 'subscription'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'scans' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE scans ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;
END $$;

-- 6. Create indexes for session-based queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_scans_session ON scans(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assets_session ON assets(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scans_email ON scans(email) WHERE email IS NOT NULL;

-- 7. Update RLS policies to allow anonymous scans (drop if exists, then create)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anonymous users can upload assets" ON assets;
DROP POLICY IF EXISTS "Anonymous users can read own assets" ON assets;
DROP POLICY IF EXISTS "Anonymous users can create scans" ON scans;
DROP POLICY IF EXISTS "Anonymous users can read own scans" ON scans;
DROP POLICY IF EXISTS "Anonymous users can read own findings" ON scan_findings;

-- Allow anonymous inserts to assets (with session_id)
CREATE POLICY "Anonymous users can upload assets"
ON assets FOR INSERT
TO anon
WITH CHECK (
  session_id IS NOT NULL AND
  uploaded_by IS NULL AND
  tenant_id IS NULL
);

-- Allow anonymous reads of their own assets (by session)
CREATE POLICY "Anonymous users can read own assets"
ON assets FOR SELECT
TO anon
USING (
  session_id IS NOT NULL AND
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
);

-- Allow anonymous inserts to scans (with session_id)
CREATE POLICY "Anonymous users can create scans"
ON scans FOR INSERT
TO anon
WITH CHECK (
  session_id IS NOT NULL AND
  analyzed_by IS NULL AND
  tenant_id IS NULL
);

-- Allow anonymous reads of their own scans (by session)
CREATE POLICY "Anonymous users can read own scans"
ON scans FOR SELECT
TO anon
USING (
  session_id IS NOT NULL AND
  session_id = current_setting('request.headers', true)::json->>'x-session-id'
);

-- Allow anonymous reads of findings for their scans
CREATE POLICY "Anonymous users can read own findings"
ON scan_findings FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM scans
    WHERE scans.id = scan_findings.scan_id
    AND scans.session_id IS NOT NULL
    AND scans.session_id = current_setting('request.headers', true)::json->>'x-session-id'
  )
);

-- 8. Add comments
COMMENT ON COLUMN scans.session_id IS 'Browser session ID for anonymous scans (before email capture)';
COMMENT ON COLUMN scans.email IS 'Email provided at gate (converts anonymous to lead)';
COMMENT ON COLUMN scans.purchased IS 'Whether user paid for full report ($29 one-time or subscription)';
