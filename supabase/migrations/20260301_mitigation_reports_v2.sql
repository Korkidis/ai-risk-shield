-- Sprint 6: Expand mitigation_reports for structured report generation
-- Adds status tracking, structured JSONB content, versioning, idempotency, and audit fields.

-- Expand mitigation_reports columns
ALTER TABLE mitigation_reports
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','complete','failed')),
  ADD COLUMN IF NOT EXISTS report_content jsonb,
  ADD COLUMN IF NOT EXISTS report_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS generator_version text NOT NULL DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS generation_inputs jsonb,
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS error_message text;

-- Unique partial index for idempotency (prevents duplicate generation for same request)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mitigation_idempotency
  ON mitigation_reports(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Index for fast lookup by scan_id (drawer fetches most recent per scan)
CREATE INDEX IF NOT EXISTS idx_mitigation_reports_scan_id
  ON mitigation_reports(scan_id, created_at DESC);

-- Add mitigation tracking to tenants (synced from lib/plans.ts via applyPlanToTenant)
ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS monthly_mitigation_limit integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mitigations_used_this_month integer NOT NULL DEFAULT 0;

-- RLS: tenants can only access their own mitigation reports
ALTER TABLE mitigation_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running (idempotent)
DROP POLICY IF EXISTS mitigation_reports_tenant_select ON mitigation_reports;
DROP POLICY IF EXISTS mitigation_reports_tenant_insert ON mitigation_reports;
DROP POLICY IF EXISTS mitigation_reports_service_all ON mitigation_reports;

-- Tenant members can read their own reports
CREATE POLICY mitigation_reports_tenant_select ON mitigation_reports
  FOR SELECT USING (tenant_id = public.user_tenant_id());

-- Tenant members can create reports for their tenant
CREATE POLICY mitigation_reports_tenant_insert ON mitigation_reports
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

-- Service role can do everything (for async generation worker)
CREATE POLICY mitigation_reports_service_all ON mitigation_reports
  FOR ALL USING (auth.role() = 'service_role');
