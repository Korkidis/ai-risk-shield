-- Migration: Atomic retry row claiming + index
-- Prevents concurrent cron runs from double-processing the same row.

-- Add index on tenant_id FK for query performance
CREATE INDEX IF NOT EXISTS idx_failed_usage_reports_tenant_id
  ON failed_usage_reports(tenant_id);

-- Add index for the retry query pattern
CREATE INDEX IF NOT EXISTS idx_failed_usage_reports_pending
  ON failed_usage_reports(next_retry_at)
  WHERE resolved_at IS NULL;

-- RPC: Atomically claim a batch of pending retry rows.
-- Uses UPDATE ... RETURNING to advance next_retry_at as a claim marker
-- within the same transaction. Combined with FOR UPDATE SKIP LOCKED,
-- this ensures concurrent workers never process the same row.
--
-- If the worker crashes mid-processing, rows become eligible again
-- after the claim window (10 minutes) expires.
CREATE OR REPLACE FUNCTION claim_failed_usage_reports(batch_limit int DEFAULT 50)
RETURNS SETOF failed_usage_reports
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  UPDATE failed_usage_reports
  SET next_retry_at = now() + interval '10 minutes'
  WHERE id IN (
    SELECT id
    FROM failed_usage_reports
    WHERE resolved_at IS NULL
      AND attempts < max_attempts
      AND next_retry_at <= now()
    ORDER BY created_at ASC
    LIMIT batch_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;
