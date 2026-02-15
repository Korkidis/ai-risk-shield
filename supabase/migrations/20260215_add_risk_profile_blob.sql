-- migration: 20260215_add_risk_profile_blob.sql
-- Purpose: Store full Gemini multi-persona analysis for rich scan detail retrieval.

ALTER TABLE scans
  ADD COLUMN IF NOT EXISTS risk_profile JSONB;

COMMENT ON COLUMN scans.risk_profile IS 'Full Gemini multi-persona analysis blob for rich scan detail retrieval.';

-- Relax tenant_id constraints to support anonymous (public) scans
-- Anonymous users don't have a tenant_id, so we must allow NULL.

ALTER TABLE assets ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE scans ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE scan_findings ALTER COLUMN tenant_id DROP NOT NULL;

-- provenance_details might not exist in all envs yet (conditionally apply or just try)
-- wrapping in DO block to avoid error if table doesn't exist? 
-- No, standard ALTER is fine, if table missing it fails. 
-- But user said "provenance_details.tenant_id are NOT NULL", implying table exists.
-- Let's check if provenance_details exists in code.
-- Yes, scan-processor inserts into it.
ALTER TABLE provenance_details ALTER COLUMN tenant_id DROP NOT NULL;
