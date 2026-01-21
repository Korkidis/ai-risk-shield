-- migration: 20260120_phase1_additives.sql

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Mitigation Reporting
CREATE TABLE IF NOT EXISTS mitigation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  advice_content TEXT NOT NULL, -- Markdown
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE mitigation_reports ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'mitigation_reports' AND policyname = 'Users can view mitigation reports for their tenant'
    ) THEN
        CREATE POLICY "Users can view mitigation reports for their tenant"
        ON mitigation_reports FOR SELECT
        USING (tenant_id = user_tenant_id());
    END IF;
END $$;

-- 2. Insurance Tracking
CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans(id),
  tenant_id UUID REFERENCES tenants(id),
  event_type TEXT NOT NULL CHECK (event_type IN ('insurance_view', 'insurance_click', 'insurance_quote')),
  partner TEXT, -- e.g., 'coalition', 'embroker'
  risk_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_events_tenant ON referral_events(tenant_id, created_at);

-- 3. Invite System
CREATE TABLE IF NOT EXISTS tenant_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ
);

ALTER TABLE tenant_invites ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'tenant_invites' AND policyname = 'Users can view invites for their tenant'
    ) THEN
        CREATE POLICY "Users can view invites for their tenant"
        ON tenant_invites FOR SELECT
        USING (tenant_id = user_tenant_id());
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'tenant_invites' AND policyname = 'Admins can create invites'
    ) THEN
        CREATE POLICY "Admins can create invites"
        ON tenant_invites FOR INSERT
        WITH CHECK (
            tenant_id = user_tenant_id() 
            AND user_role() IN ('owner', 'admin')
        );
    END IF;
END $$;

-- 4. Phase 1 Additions
CREATE INDEX IF NOT EXISTS idx_scans_email ON scans(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON tenants(stripe_customer_id);

ALTER TABLE scans ADD COLUMN IF NOT EXISTS purchased BOOLEAN DEFAULT FALSE;

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS scans_used_this_month INTEGER DEFAULT 0;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_period_start TIMESTAMP DEFAULT NOW();
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS usage_limit_mitigation INTEGER DEFAULT 0;
