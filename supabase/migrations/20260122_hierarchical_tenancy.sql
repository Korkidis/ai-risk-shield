-- migration: 20260122_hierarchical_tenancy.sql

-- 1. Add parent_tenant_id to tenants
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS parent_tenant_id uuid NULL;

-- Add FK if the constraint name doesn't exist (Postgres lacks IF NOT EXISTS for ADD CONSTRAINT in older versions).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
      AND table_schema = 'public'
      AND table_name = 'tenants'
      AND constraint_name = 'tenants_parent_fkey'
  ) THEN
    ALTER TABLE public.tenants
      ADD CONSTRAINT tenants_parent_fkey
      FOREIGN KEY (parent_tenant_id) REFERENCES public.tenants(id) ON DELETE SET NULL;
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_tenants_parent_tenant_id ON public.tenants(parent_tenant_id);

-- 2. get_active_tenant() helper
CREATE OR REPLACE FUNCTION public.get_active_tenant()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT
    CASE
      WHEN (auth.jwt() ->> 'active_tenant') IS NOT NULL
        THEN (auth.jwt() ->> 'active_tenant')::uuid
      ELSE (
        SELECT tenant_id
        FROM public.profiles
        WHERE id = (select auth.uid())
        LIMIT 1
      )
    END::uuid;
$$;

REVOKE EXECUTE ON FUNCTION public.get_active_tenant() FROM anon, authenticated;

-- 3. is_agency_admin() helper (Expanded for Enterprise)
CREATE OR REPLACE FUNCTION public.is_agency_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT
    EXISTS (
      SELECT 1
      FROM public.profiles p
      JOIN public.tenants t ON p.tenant_id = t.id
      WHERE p.id = (select auth.uid())
        -- Allow owners/admins of Agency OR Enterprise plans to switch
        AND (p.role IN ('owner', 'admin', 'agency_admin')) 
        AND t.plan IN ('agency', 'enterprise')
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_agency_admin() FROM anon, authenticated;

-- 4. tenant_switch_audit table
CREATE TABLE IF NOT EXISTS public.tenant_switch_audit (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_user_id uuid REFERENCES auth.users,
  actor_session_id uuid,
  from_tenant_id uuid REFERENCES public.tenants,
  to_tenant_id uuid REFERENCES public.tenants NOT NULL,
  ip inet,
  user_agent text,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_switch_audit_actor_user_id ON public.tenant_switch_audit(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_switch_audit_to_tenant_id ON public.tenant_switch_audit(to_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_switch_audit_created_at ON public.tenant_switch_audit(created_at);

-- 5. RLS Policies (Assets)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Assets: select only for active tenant" ON public.assets;
DROP POLICY IF EXISTS "Assets: insert only into active tenant" ON public.assets;
DROP POLICY IF EXISTS "Assets: update only within active tenant" ON public.assets;
DROP POLICY IF EXISTS "Assets: delete only within active tenant" ON public.assets;

-- Drop old conflicting policies if they exist (based on initial schema names)
DROP POLICY IF EXISTS "Users can view assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can insert assets in their tenant" ON public.assets;
DROP POLICY IF EXISTS "Users can delete assets in their tenant" ON public.assets;


CREATE POLICY "Assets: select only for active tenant"
ON public.assets
FOR SELECT
TO authenticated
USING (
  tenant_id = public.get_active_tenant()
);

CREATE POLICY "Assets: insert only into active tenant"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (
  tenant_id = public.get_active_tenant()
);

CREATE POLICY "Assets: update only within active tenant"
ON public.assets
FOR UPDATE
TO authenticated
USING (
  tenant_id = public.get_active_tenant()
)
WITH CHECK (
  tenant_id = public.get_active_tenant()
);

CREATE POLICY "Assets: delete only within active tenant"
ON public.assets
FOR DELETE
TO authenticated
USING (
  tenant_id = public.get_active_tenant()
);

-- 6. RLS Policies (Tenants)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenants: select own active tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenants: agency admin can select own children" ON public.tenants;

-- Drop old conflicting policies
DROP POLICY IF EXISTS "Users can view their own tenant" ON public.tenants;

CREATE POLICY "Tenants: select own active tenant"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  id = public.get_active_tenant()
);

CREATE POLICY "Tenants: agency admin can select own children"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  (
    public.is_agency_admin() = TRUE
    AND (
      id = (SELECT tenant_id FROM public.profiles WHERE id = (select auth.uid()) LIMIT 1)
      OR parent_tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = (select auth.uid()) LIMIT 1)
    )
  )
);
