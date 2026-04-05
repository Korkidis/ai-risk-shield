-- Fix scan_findings constraints that prevent the findings synthesizer from persisting results.
--
-- The original schema (20260103_initial_schema.sql) constrains finding_type to 5 legacy values
-- and requires recommendation NOT NULL. The synthesizer writes 9 additional finding types
-- (ip_clear, ip_match, ip_similarity, safety_clear, safety_content, safety_context,
-- provenance_verified, provenance_suspicious, provenance_missing) and always sets
-- recommendation = null (advice belongs in the mitigation layer, not findings).
--
-- Every scan_findings INSERT has been silently failing due to this mismatch.

-- 1. Drop the old CHECK constraint on finding_type
ALTER TABLE scan_findings DROP CONSTRAINT IF EXISTS scan_findings_finding_type_check;

-- 2. Add expanded CHECK covering all valid synthesizer types
ALTER TABLE scan_findings ADD CONSTRAINT scan_findings_finding_type_check
  CHECK (finding_type IN (
    -- Original types
    'ip_violation', 'trademark', 'safety_violation', 'brand_violation', 'provenance_issue',
    -- Synthesizer types (added in findings-synthesizer.ts)
    'ip_clear', 'ip_match', 'ip_similarity',
    'safety_clear', 'safety_content', 'safety_context',
    'provenance_verified', 'provenance_suspicious', 'provenance_missing'
  ));

-- 3. Allow null recommendations (advice belongs in mitigation layer, not findings)
ALTER TABLE scan_findings ALTER COLUMN recommendation DROP NOT NULL;
