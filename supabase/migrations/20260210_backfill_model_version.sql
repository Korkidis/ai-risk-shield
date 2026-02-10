-- Backfill: Correct gemini_model_version metadata for historical scans
-- Context: scan-processor.ts was hardcoding 'gemini-1.5-flash' but actual model used is 'gemini-2.5-flash'
-- This is compliance-sensitive metadata — must be accurate for audit trail
--
-- SAFETY RATIONALE:
-- Gemini 2.5 Flash was introduced in code on 2026-01-04 (see git history for gemini-2.5-flash).
-- The async scan-processor incorrectly hardcoded 'gemini-1.5-flash' even though the
-- actual analysis calls used 2.5-flash. This migration corrects rows in the window
-- where the bug existed.
--
-- DATE GUARD: Only affects rows created AFTER 2.5-flash was introduced (2026-01-04)
-- and BEFORE the fix was deployed (2026-02-10). Rows created outside this window
-- are left untouched to avoid overwriting legitimate historical metadata.
-- See: tasks/risk-model-unification.md, "Model Version Metadata Mismatch"

UPDATE scans
SET gemini_model_version = 'gemini-2.5-flash'
WHERE gemini_model_version = 'gemini-1.5-flash'
  AND created_at >= '2026-01-04T00:00:00Z'
  AND created_at < '2026-02-10T00:00:00Z';
