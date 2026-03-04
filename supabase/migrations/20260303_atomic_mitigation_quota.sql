-- Atomic mitigation quota consumption function
-- Mirrors consume_quota() pattern for scan quotas (initial_schema.sql line 335)
-- Eliminates TOCTOU race: check + increment happen in one locked transaction
--
-- Without this, two concurrent requests can both pass the limit check
-- before either increments, allowing overage past the plan limit.

CREATE OR REPLACE FUNCTION public.consume_mitigation_quota(
    p_tenant_id uuid,
    p_amount integer DEFAULT 1
)
RETURNS TABLE (
    allowed boolean,
    current_usage integer,
    monthly_limit integer,
    remaining integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant RECORD;
    v_new_used integer;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'p_amount must be > 0';
    END IF;

    -- Lock tenant row to prevent concurrent modifications
    SELECT t.id, t.mitigations_used_this_month, t.monthly_mitigation_limit
    INTO v_tenant
    FROM public.tenants t
    WHERE t.id = p_tenant_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Tenant not found: %', p_tenant_id;
    END IF;

    v_new_used := COALESCE(v_tenant.mitigations_used_this_month, 0);

    -- Check limit BEFORE incrementing (atomic: row is locked)
    -- Uses v_new_used + p_amount to correctly handle p_amount > 1
    IF v_new_used + p_amount > COALESCE(v_tenant.monthly_mitigation_limit, 0) THEN
        RETURN QUERY SELECT
            false::boolean AS allowed,
            v_new_used AS current_usage,
            COALESCE(v_tenant.monthly_mitigation_limit, 0) AS monthly_limit,
            0 AS remaining;
        RETURN;
    END IF;

    -- Atomic increment (row still locked)
    v_new_used := v_new_used + p_amount;
    UPDATE public.tenants
    SET mitigations_used_this_month = v_new_used, updated_at = NOW()
    WHERE id = p_tenant_id;

    RETURN QUERY SELECT
        true::boolean AS allowed,
        v_new_used AS current_usage,
        COALESCE(v_tenant.monthly_mitigation_limit, 0) AS monthly_limit,
        GREATEST(0, COALESCE(v_tenant.monthly_mitigation_limit, 0) - v_new_used) AS remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_mitigation_quota(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_mitigation_quota(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_mitigation_quota(uuid, integer) TO service_role;
