-- AI Risk Shield - Migration
-- Add notes, tags, and sharing functionality to scans table

ALTER TABLE scans ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE scans ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT NULL;
ALTER TABLE scans ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ DEFAULT NULL;

-- Index for share tokens
CREATE INDEX IF NOT EXISTS idx_scans_share_token ON scans(share_token) WHERE share_token IS NOT NULL;
