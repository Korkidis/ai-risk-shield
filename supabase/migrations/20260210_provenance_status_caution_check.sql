-- Migration: Expand provenance_status check constraint to include 'caution'
-- Rationale: computeProvenanceStatus() now preserves full 5-value C2PA fidelity.
-- Without this, writes with status 'caution' will fail at DB constraint.

ALTER TABLE scans
  DROP CONSTRAINT IF EXISTS scans_provenance_status_check;

ALTER TABLE scans
  ADD CONSTRAINT scans_provenance_status_check
  CHECK (provenance_status IN ('valid', 'missing', 'invalid', 'error', 'caution'));
