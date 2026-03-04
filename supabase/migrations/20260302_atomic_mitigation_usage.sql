-- Atomic mitigation credit increment function
-- Mirrors increment_tenant_scan_usage pattern for mitigation reports
-- Prevents race conditions when two concurrent mitigation requests decrement credits

CREATE OR REPLACE FUNCTION public.increment_tenant_mitigation_usage(
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
        mitigations_used_this_month = COALESCE(mitigations_used_this_month, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_tenant_id
    RETURNING mitigations_used_this_month INTO v_new_total;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tenant not found: %', p_tenant_id;
    END IF;

    RETURN v_new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_tenant_mitigation_usage(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_tenant_mitigation_usage(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_tenant_mitigation_usage(uuid, integer) TO service_role;
