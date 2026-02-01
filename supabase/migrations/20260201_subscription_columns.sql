-- Subscription Strategy Implementation
-- Adds missing columns to support the full pricing model
-- Created: 2026-02-01

-- ============================================================================
-- 1. UPDATE PLAN ENUM VALUES
-- ============================================================================
-- Change 'individual' to 'pro' to match strategy document
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_plan_check;
ALTER TABLE tenants ADD CONSTRAINT tenants_plan_check 
  CHECK (plan IN ('free', 'pro', 'team', 'agency', 'enterprise'));

-- Update any existing 'individual' plans to 'pro'
UPDATE tenants SET plan = 'pro' WHERE plan = 'individual';

-- ============================================================================
-- 2. ADD LIMIT COLUMNS TO TENANTS
-- ============================================================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS monthly_report_limit INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS seat_limit INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS brand_profile_limit INTEGER NOT NULL DEFAULT 0;

-- Overage pricing (stored in cents to avoid floating point issues)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS scan_overage_cost_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS report_overage_cost_cents INTEGER NOT NULL DEFAULT 2900;

-- ============================================================================
-- 3. ADD FEATURE FLAGS TO TENANTS
-- ============================================================================
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_bulk_upload BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_co_branding BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_white_label BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_audit_logs BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_priority_queue BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_sso BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS feature_team_dashboard BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- 4. ADD REPORT TRACKING TO USAGE_LEDGER
-- ============================================================================
ALTER TABLE usage_ledger ADD COLUMN IF NOT EXISTS reports_used INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usage_ledger ADD COLUMN IF NOT EXISTS overage_reports INTEGER NOT NULL DEFAULT 0;

-- ============================================================================
-- 5. SET DEFAULTS FOR EXISTING FREE TENANTS
-- ============================================================================
UPDATE tenants 
SET 
  monthly_scan_limit = 3,
  monthly_report_limit = 0,
  seat_limit = 1,
  brand_profile_limit = 0,
  retention_days = 7,
  scan_overage_cost_cents = 0,
  report_overage_cost_cents = 2900
WHERE plan = 'free';

-- ============================================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON COLUMN tenants.monthly_report_limit IS 'Max mitigation reports per month (from SUBSCRIPTION_STRATEGY.md)';
COMMENT ON COLUMN tenants.seat_limit IS 'Max team members allowed (from SUBSCRIPTION_STRATEGY.md)';
COMMENT ON COLUMN tenants.brand_profile_limit IS 'Max brand profiles allowed (from SUBSCRIPTION_STRATEGY.md)';
COMMENT ON COLUMN tenants.scan_overage_cost_cents IS 'Cost per overage scan in cents (0 = blocked)';
COMMENT ON COLUMN tenants.report_overage_cost_cents IS 'Cost per overage report in cents';
COMMENT ON COLUMN tenants.feature_bulk_upload IS 'Can upload multiple files at once (TEAM+)';
COMMENT ON COLUMN tenants.feature_co_branding IS 'Can add own logo to reports (TEAM+)';
COMMENT ON COLUMN tenants.feature_white_label IS 'Can remove AI Risk Shield branding (AGENCY+)';
COMMENT ON COLUMN tenants.feature_audit_logs IS 'Access to compliance audit trail (AGENCY+)';
COMMENT ON COLUMN tenants.feature_priority_queue IS 'Scans processed with priority (AGENCY+)';
COMMENT ON COLUMN tenants.feature_sso IS 'SSO integration available (ENTERPRISE)';
COMMENT ON COLUMN tenants.feature_team_dashboard IS 'Team activity dashboard access (TEAM+)';
