-- Database Cleanup SQL Script
-- Safely removes old test data to reduce Supabase egress and storage usage
-- 
-- WARNING: This will permanently delete data. Backup before running!
-- 
-- Usage: Run in Supabase SQL Editor or via psql
--        Adjust the interval (7 days) as needed

BEGIN;

-- Set the cutoff date (7 days old)
DO $$
DECLARE
  cutoff_date TIMESTAMP := NOW() - INTERVAL '7 days';
  scans_deleted INT;
  findings_deleted INT;
  assets_deleted INT;
BEGIN
  RAISE NOTICE 'Cleaning up data older than %', cutoff_date;

  -- 1. Delete scan findings for old scans
  WITH deleted_findings AS (
    DELETE FROM scan_findings
    WHERE scan_id IN (
      SELECT id FROM scans WHERE created_at < cutoff_date
    )
    RETURNING *
  )
  SELECT COUNT(*) INTO findings_deleted FROM deleted_findings;
  RAISE NOTICE 'Deleted % scan findings', findings_deleted;

  -- 2. Delete old scans
  WITH deleted_scans AS (
    DELETE FROM scans
    WHERE created_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO scans_deleted FROM deleted_scans;
  RAISE NOTICE 'Deleted % scans', scans_deleted;

  -- 3. Delete old assets (note: storage files must be deleted separately)
  WITH deleted_assets AS (
    DELETE FROM assets
    WHERE created_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO assets_deleted FROM deleted_assets;
  RAISE NOTICE 'Deleted % assets', assets_deleted;

  RAISE NOTICE '---';
  RAISE NOTICE 'Cleanup Summary:';
  RAISE NOTICE '  Scans deleted:    %', scans_deleted;
  RAISE NOTICE '  Findings deleted: %', findings_deleted;
  RAISE NOTICE '  Assets deleted:   %', assets_deleted;
  RAISE NOTICE '---';
  RAISE NOTICE 'NOTE: Storage files must be deleted manually via Supabase Dashboard or cleanup script';

END $$;

-- Review what would be deleted (comment out DELETE statements above first)
-- SELECT 'scans' as table_name, COUNT(*) as count 
-- FROM scans WHERE created_at < NOW() - INTERVAL '7 days'
-- UNION ALL
-- SELECT 'scan_findings', COUNT(*) 
-- FROM scan_findings WHERE scan_id IN (
--   SELECT id FROM scans WHERE created_at < NOW() - INTERVAL '7 days'
-- )
-- UNION ALL
-- SELECT 'assets', COUNT(*) 
-- FROM assets WHERE created_at < NOW() - INTERVAL '7 days';

COMMIT;
