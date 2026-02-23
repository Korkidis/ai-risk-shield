-- Track failed Stripe usage reports for retry.
-- Acts as a dead-letter queue with exponential backoff.
-- Service-role only (not accessible via RLS).

CREATE TABLE IF NOT EXISTS failed_usage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ  -- NULL until successfully reported
);

-- Partial index for efficient pending retry queries
CREATE INDEX idx_failed_usage_pending
    ON failed_usage_reports(next_retry_at)
    WHERE resolved_at IS NULL AND attempts < max_attempts;

ALTER TABLE failed_usage_reports ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role only" ON failed_usage_reports
    FOR ALL USING (false);
