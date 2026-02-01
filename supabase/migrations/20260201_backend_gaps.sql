-- Backend Gaps Implementation (Phase 1)
-- Date: 2026-02-01

-- 1. Mitigation Reports (Paid Feature)
CREATE TABLE IF NOT EXISTS public.mitigation_reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    scan_id uuid REFERENCES public.scans(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES public.tenants(id),
    advice_content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- RLS: Only viewable by own tenant
ALTER TABLE public.mitigation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mitigation_reports_select_tenant" ON public.mitigation_reports
FOR SELECT TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = (SELECT auth.uid())
    )
    OR 
    (SELECT is_agency_admin() = true AND (SELECT get_active_tenant()) = tenant_id)
);

-- Add limit column to tenants if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tenants' AND column_name='usage_limit_mitigation') THEN
        ALTER TABLE public.tenants ADD COLUMN usage_limit_mitigation INTEGER DEFAULT 0;
    END IF;
END $$;


-- 2. Insurance/Referral Tracking
CREATE TABLE IF NOT EXISTS public.referral_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    tenant_id uuid REFERENCES public.tenants(id),
    scan_id uuid REFERENCES public.scans(id),
    event_type text NOT NULL, -- 'insurance_click', 'expert_consult_click'
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referral_events_insert_own" ON public.referral_events
FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));


-- 3. Tenant Invites
CREATE TABLE IF NOT EXISTS public.tenant_invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    token text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    accepted_at timestamptz
);

ALTER TABLE public.tenant_invites ENABLE ROW LEVEL SECURITY;

-- Admins can create invites for their tenant
CREATE POLICY "tenant_invites_insert_admin" ON public.tenant_invites
FOR INSERT TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = (SELECT auth.uid()) 
        AND role IN ('owner', 'admin')
    )
);

-- Users can view invites for their tenant
CREATE POLICY "tenant_invites_select_tenant" ON public.tenant_invites
FOR SELECT TO authenticated
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles 
        WHERE id = (SELECT auth.uid())
    )
);
