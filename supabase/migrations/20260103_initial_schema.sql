-- AI Risk Shield - Initial Database Schema
-- Created: 2026-01-03
-- Description: Multi-tenant SaaS schema with RLS, quota management, and audit logging

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
-- Stores organization/company information (one per signup)
-- Central point for plan management, quotas, and billing

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'individual', 'team', 'agency', 'enterprise')),

    -- Quota management
    monthly_scan_limit INTEGER NOT NULL DEFAULT 3,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),

    -- Stripe integration
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete')),

    -- Data retention (days)
    retention_days INTEGER NOT NULL DEFAULT 7,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_stripe_customer ON tenants(stripe_customer_id);
CREATE INDEX idx_tenants_plan ON tenants(plan);

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Links Supabase auth.users to tenants (multi-user support)
-- Stores user roles and permissions

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ============================================================================
-- BRAND PROFILES TABLE
-- ============================================================================
-- Stores encrypted brand guidelines for custom validation
-- Guidelines are encrypted at application layer before storage

CREATE TABLE brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    industry TEXT,

    -- Encrypted guidelines (encrypted at app layer with AES-256)
    encrypted_guidelines JSONB NOT NULL,
    encryption_iv TEXT NOT NULL,
    encryption_auth_tag TEXT NOT NULL,

    -- Metadata
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brand_profiles_tenant ON brand_profiles(tenant_id);
CREATE INDEX idx_brand_profiles_active ON brand_profiles(tenant_id, is_active) WHERE is_active = true;

-- ============================================================================
-- ASSETS TABLE
-- ============================================================================
-- Stores metadata about uploaded images/videos
-- Actual files stored in Supabase Storage

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- File information
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,

    -- Storage
    storage_path TEXT NOT NULL UNIQUE,
    storage_bucket TEXT NOT NULL DEFAULT 'uploads',

    -- Security
    sha256_checksum TEXT NOT NULL,

    -- Lifecycle
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    delete_after TIMESTAMPTZ NOT NULL, -- Auto-delete based on retention policy

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assets_tenant ON assets(tenant_id);
CREATE INDEX idx_assets_checksum ON assets(sha256_checksum);
CREATE INDEX idx_assets_delete_after ON assets(delete_after) WHERE delete_after IS NOT NULL;

-- ============================================================================
-- SCANS TABLE
-- ============================================================================
-- Stores analysis results for each uploaded asset
-- Core business entity

CREATE TABLE scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,

    -- Scores (0-100, higher = more risk)
    ip_risk_score INTEGER CHECK (ip_risk_score >= 0 AND ip_risk_score <= 100),
    safety_risk_score INTEGER CHECK (safety_risk_score >= 0 AND safety_risk_score <= 100),
    provenance_risk_score INTEGER CHECK (provenance_risk_score >= 0 AND provenance_risk_score <= 100),
    composite_score INTEGER CHECK (composite_score >= 0 AND composite_score <= 100),

    -- Risk level (derived from composite_score)
    risk_level TEXT CHECK (risk_level IN ('safe', 'caution', 'review', 'high', 'critical')),

    -- Video-specific
    is_video BOOLEAN NOT NULL DEFAULT false,
    frames_analyzed INTEGER,
    highest_risk_frame INTEGER,

    -- C2PA provenance
    provenance_status TEXT CHECK (provenance_status IN ('valid', 'missing', 'invalid', 'error')),
    provenance_data JSONB,

    -- Processing status
    status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'complete', 'failed')),
    error_message TEXT,

    -- Analysis metadata
    analyzed_by UUID NOT NULL REFERENCES auth.users(id),
    analysis_duration_ms INTEGER,
    gemini_model_version TEXT,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scans_tenant ON scans(tenant_id);
CREATE INDEX idx_scans_asset ON scans(asset_id);
CREATE INDEX idx_scans_status ON scans(status);
CREATE INDEX idx_scans_risk_level ON scans(risk_level);
CREATE INDEX idx_scans_created ON scans(created_at DESC);

-- ============================================================================
-- SCAN FINDINGS TABLE
-- ============================================================================
-- Stores individual findings from analysis
-- Separate table for scalability (one scan can have many findings)

CREATE TABLE scan_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,

    -- Finding details
    finding_type TEXT NOT NULL CHECK (finding_type IN ('ip_violation', 'trademark', 'safety_violation', 'brand_violation', 'provenance_issue')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),

    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,

    -- Evidence
    evidence JSONB,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),

    -- Location (for images/videos)
    location_data JSONB,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_findings_scan ON scan_findings(scan_id);
CREATE INDEX idx_findings_tenant ON scan_findings(tenant_id);
CREATE INDEX idx_findings_severity ON scan_findings(severity);
CREATE INDEX idx_findings_type ON scan_findings(finding_type);

-- ============================================================================
-- VIDEO FRAMES TABLE
-- ============================================================================
-- Stores frame-by-frame analysis for videos
-- Allows showing which specific frames are risky

CREATE TABLE video_frames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,

    -- Frame information
    frame_number INTEGER NOT NULL,
    timestamp_ms INTEGER NOT NULL,

    -- Storage
    storage_path TEXT NOT NULL,

    -- Individual frame scores
    ip_risk_score INTEGER CHECK (ip_risk_score >= 0 AND ip_risk_score <= 100),
    safety_risk_score INTEGER CHECK (safety_risk_score >= 0 AND safety_risk_score <= 100),
    composite_score INTEGER CHECK (composite_score >= 0 AND composite_score <= 100),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_video_frames_scan ON video_frames(scan_id);
CREATE INDEX idx_video_frames_tenant ON video_frames(tenant_id);
CREATE INDEX idx_video_frames_composite_score ON video_frames(scan_id, composite_score DESC);

-- ============================================================================
-- USAGE LEDGER TABLE
-- ============================================================================
-- Tracks quota usage per tenant per month
-- Enables atomic quota enforcement and overage billing

CREATE TABLE usage_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Period
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

    -- Usage
    scans_used INTEGER NOT NULL DEFAULT 0,
    overage_scans INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(tenant_id, year, month)
);

CREATE INDEX idx_usage_ledger_tenant_period ON usage_ledger(tenant_id, year, month);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
-- Caches Stripe subscription data locally
-- Avoids hitting Stripe API on every request

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Stripe data
    stripe_subscription_id TEXT UNIQUE NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL,

    -- Subscription details
    status TEXT NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    canceled_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
-- Security audit trail (SOC 2 requirement)
-- Tracks all sensitive actions for compliance

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Action details
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,

    -- Request context
    ip_address INET,
    user_agent TEXT,

    -- Additional data
    metadata JSONB,

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_tenant ON audit_log(tenant_id);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function: Consume quota atomically
-- Prevents race conditions when multiple requests check quota simultaneously
CREATE OR REPLACE FUNCTION consume_quota(
    p_tenant_id UUID,
    p_amount INTEGER DEFAULT 1
)
RETURNS TABLE (
    allowed BOOLEAN,
    current_usage INTEGER,
    monthly_limit INTEGER,
    remaining INTEGER,
    overage INTEGER
) AS $$
DECLARE
    v_tenant RECORD;
    v_usage RECORD;
    v_current_year INTEGER;
    v_current_month INTEGER;
BEGIN
    -- Get current year/month
    v_current_year := EXTRACT(YEAR FROM NOW());
    v_current_month := EXTRACT(MONTH FROM NOW());

    -- Get tenant info with row lock (prevents concurrent modifications)
    SELECT * INTO v_tenant
    FROM tenants
    WHERE id = p_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tenant not found: %', p_tenant_id;
    END IF;

    -- Get or create usage record with row lock
    INSERT INTO usage_ledger (tenant_id, year, month, scans_used, overage_scans)
    VALUES (p_tenant_id, v_current_year, v_current_month, 0, 0)
    ON CONFLICT (tenant_id, year, month) DO NOTHING;

    SELECT * INTO v_usage
    FROM usage_ledger
    WHERE tenant_id = p_tenant_id
        AND year = v_current_year
        AND month = v_current_month
    FOR UPDATE;

    -- Calculate new usage
    v_usage.scans_used := v_usage.scans_used + p_amount;

    -- Calculate overage
    IF v_usage.scans_used > v_tenant.monthly_scan_limit THEN
        v_usage.overage_scans := v_usage.scans_used - v_tenant.monthly_scan_limit;
    ELSE
        v_usage.overage_scans := 0;
    END IF;

    -- Update usage
    UPDATE usage_ledger
    SET
        scans_used = v_usage.scans_used,
        overage_scans = v_usage.overage_scans,
        updated_at = NOW()
    WHERE tenant_id = p_tenant_id
        AND year = v_current_year
        AND month = v_current_month;

    -- Determine if allowed
    -- Free plans: Block if over limit
    -- Paid plans: Allow overage (will bill)
    RETURN QUERY SELECT
        CASE
            WHEN v_tenant.plan = 'free' AND v_usage.scans_used > v_tenant.monthly_scan_limit THEN false
            ELSE true
        END AS allowed,
        v_usage.scans_used AS current_usage,
        v_tenant.monthly_scan_limit AS monthly_limit,
        GREATEST(0, v_tenant.monthly_scan_limit - v_usage.scans_used) AS remaining,
        v_usage.overage_scans AS overage;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON brand_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_ledger_updated_at BEFORE UPDATE ON usage_ledger
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's tenant_id
-- Note: Must be in public schema (we don't have permission to modify auth schema)
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS UUID AS $$
    SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- TENANTS policies
CREATE POLICY "Users can view their own tenant"
    ON tenants FOR SELECT
    USING (id = public.user_tenant_id());

CREATE POLICY "Users can update their own tenant"
    ON tenants FOR UPDATE
    USING (id = public.user_tenant_id());

-- PROFILES policies
CREATE POLICY "Users can view profiles in their tenant"
    ON profiles FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- BRAND PROFILES policies
CREATE POLICY "Users can view brand profiles in their tenant"
    ON brand_profiles FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can insert brand profiles in their tenant"
    ON brand_profiles FOR INSERT
    WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can update brand profiles in their tenant"
    ON brand_profiles FOR UPDATE
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can delete brand profiles in their tenant"
    ON brand_profiles FOR DELETE
    USING (tenant_id = public.user_tenant_id());

-- ASSETS policies
CREATE POLICY "Users can view assets in their tenant"
    ON assets FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can insert assets in their tenant"
    ON assets FOR INSERT
    WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can delete assets in their tenant"
    ON assets FOR DELETE
    USING (tenant_id = public.user_tenant_id());

-- SCANS policies
CREATE POLICY "Users can view scans in their tenant"
    ON scans FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can insert scans in their tenant"
    ON scans FOR INSERT
    WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can update scans in their tenant"
    ON scans FOR UPDATE
    USING (tenant_id = public.user_tenant_id());

-- SCAN FINDINGS policies
CREATE POLICY "Users can view findings in their tenant"
    ON scan_findings FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can insert findings in their tenant"
    ON scan_findings FOR INSERT
    WITH CHECK (tenant_id = public.user_tenant_id());

-- VIDEO FRAMES policies
CREATE POLICY "Users can view video frames in their tenant"
    ON video_frames FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Users can insert video frames in their tenant"
    ON video_frames FOR INSERT
    WITH CHECK (tenant_id = public.user_tenant_id());

-- USAGE LEDGER policies
CREATE POLICY "Users can view usage in their tenant"
    ON usage_ledger FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Service role can manage usage"
    ON usage_ledger FOR ALL
    USING (true)
    WITH CHECK (true);

-- SUBSCRIPTIONS policies
CREATE POLICY "Users can view subscriptions in their tenant"
    ON subscriptions FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (true)
    WITH CHECK (true);

-- AUDIT LOG policies (append-only for users)
CREATE POLICY "Users can view audit logs in their tenant"
    ON audit_log FOR SELECT
    USING (tenant_id = public.user_tenant_id());

CREATE POLICY "Service role can insert audit logs"
    ON audit_log FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE tenants IS 'Organizations/companies - central point for billing and quota management';
COMMENT ON TABLE profiles IS 'User profiles linked to tenants - enables multi-user teams';
COMMENT ON TABLE brand_profiles IS 'Encrypted brand guidelines for custom validation rules';
COMMENT ON TABLE assets IS 'Metadata for uploaded images/videos (actual files in Supabase Storage)';
COMMENT ON TABLE scans IS 'Analysis results with scores and risk levels';
COMMENT ON TABLE scan_findings IS 'Individual findings from analysis (IP violations, safety issues, etc.)';
COMMENT ON TABLE video_frames IS 'Frame-by-frame analysis results for videos';
COMMENT ON TABLE usage_ledger IS 'Quota tracking per tenant per month - enables atomic enforcement';
COMMENT ON TABLE subscriptions IS 'Local cache of Stripe subscription data';
COMMENT ON TABLE audit_log IS 'Security audit trail for compliance (SOC 2)';

COMMENT ON FUNCTION consume_quota IS 'Atomically check and consume quota - prevents race conditions';
COMMENT ON FUNCTION public.user_tenant_id IS 'Helper function to get current users tenant_id for RLS policies';
