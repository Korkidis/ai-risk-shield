-- Sprint 10 follow-up hardening
-- 1) Add scans.ip_hash so anonymous IP quota can be derived from scan outcomes
-- 2) Add atomic tenant scan usage increment function (no read-modify-write races)

ALTER TABLE public.scans
  ADD COLUMN IF NOT EXISTS ip_hash text;

COMMENT ON COLUMN public.scans.ip_hash IS 'Hashed client IP for anonymous quota enforcement and abuse prevention';

CREATE INDEX IF NOT EXISTS idx_scans_ip_hash_created_at
  ON public.scans (ip_hash, created_at DESC)
  WHERE ip_hash IS NOT NULL;

CREATE OR REPLACE FUNCTION public.increment_tenant_scan_usage(
  p_tenant_id uuid,
  p_amount integer DEFAULT 1
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total integer;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'p_amount must be > 0';
  END IF;

  UPDATE public.tenants
  SET
    scans_used_this_month = COALESCE(scans_used_this_month, 0) + p_amount,
    updated_at = NOW()
  WHERE id = p_tenant_id
  RETURNING scans_used_this_month INTO v_new_total;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tenant not found: %', p_tenant_id;
  END IF;

  RETURN v_new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_tenant_scan_usage(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_tenant_scan_usage(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tenant_scan_usage(uuid, integer) TO service_role;
