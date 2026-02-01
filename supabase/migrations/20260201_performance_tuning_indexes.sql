-- PERFORMANCE TUNING - INDEXES (PROD / CONCURRENT)
-- Date: 2026-02-01
-- Purpose: Add missing indexes (Must run outside transaction for CONCURRENTLY)

-- Brand Profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brand_profiles_tenant_id ON public.brand_profiles(tenant_id);

-- Mitigation Reports
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mitigation_reports_created_by ON public.mitigation_reports(created_by);

-- Profiles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_tenant_id ON public.profiles(tenant_id);

-- Provenance Details
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_provenance_details_tenant_id ON public.provenance_details(tenant_id);

-- Referral Events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_events_scan_id ON public.referral_events(scan_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_referral_events_tenant_id ON public.referral_events(tenant_id);

-- Scan Findings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scan_findings_tenant_id ON public.scan_findings(tenant_id);

-- Scans
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scans_analyzed_by ON public.scans(analyzed_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scans_asset_id ON public.scans(asset_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scans_brand_profile_id ON public.scans(brand_profile_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scans_guideline_id ON public.scans(guideline_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scans_tenant_id ON public.scans(tenant_id);

-- Subscriptions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_tenant_id ON public.subscriptions(tenant_id);

-- Tenant Invites
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_invites_invited_by ON public.tenant_invites(invited_by);

-- Tenant Switch Audit
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_switch_audit_actor_user_id ON public.tenant_switch_audit(actor_user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_switch_audit_from_tenant_id ON public.tenant_switch_audit(from_tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tenant_switch_audit_to_tenant_id ON public.tenant_switch_audit(to_tenant_id);
