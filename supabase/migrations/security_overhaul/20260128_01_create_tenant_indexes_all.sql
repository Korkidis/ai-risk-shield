-- File: 20260128_01_create_tenant_indexes_all.sql
-- STEP 1: INDEX CREATION
-- Purpose: Create CONCURRENT indexes using 3-step safe migration strategy.
-- Note: Must be run OUTSIDE of a transaction block.

-- 1. tenants
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenants_parent_tenant_id ON public.tenants(parent_tenant_id);

-- 2. profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- 3. brand_profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brand_profiles_tenant_id ON public.brand_profiles(tenant_id);

-- 4. assets
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assets_tenant_id ON public.assets(tenant_id);

-- 5. scans
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scans_tenant_id ON public.scans(tenant_id);

-- 6. scan_findings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scan_findings_tenant_id ON public.scan_findings(tenant_id);

-- 7. video_frames
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_video_frames_tenant_id ON public.video_frames(tenant_id);

-- 8. usage_ledger
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_usage_ledger_tenant_id ON public.usage_ledger(tenant_id);

-- 9. subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);

-- 10. audit_log
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_tenant_id ON public.audit_log(tenant_id);

-- 11. brand_guidelines
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brand_guidelines_tenant_id ON public.brand_guidelines(tenant_id);

-- 12. mitigation_reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mitigation_reports_tenant_id ON public.mitigation_reports(tenant_id);

-- 13. referral_events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_events_tenant_id ON public.referral_events(tenant_id);

-- 14. tenant_invites
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_invites_tenant_id ON public.tenant_invites(tenant_id);

-- 15. tenant_switch_audit
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_switch_audit_to_tenant_id ON public.tenant_switch_audit(to_tenant_id);

-- 16. provenance_details
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provenance_details_tenant_id ON public.provenance_details(tenant_id);
