-- Make tenant_id nullable for anonymous uploads
-- This allows assets and scans to be created without a tenant (using session_id instead)

-- Make tenant_id nullable in assets table
ALTER TABLE assets ALTER COLUMN tenant_id DROP NOT NULL;

-- Make tenant_id nullable in scans table
ALTER TABLE scans ALTER COLUMN tenant_id DROP NOT NULL;

-- Verify the changes
COMMENT ON COLUMN assets.tenant_id IS 'Organization ID (null for anonymous uploads, uses session_id instead)';
COMMENT ON COLUMN scans.tenant_id IS 'Organization ID (null for anonymous scans, uses session_id instead)';
