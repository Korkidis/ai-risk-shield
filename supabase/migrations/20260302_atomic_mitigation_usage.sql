-- Atomic mitigation credit increment function
-- Mirrors increment_tenant_scan_usage pattern for mitigation reports
-- Prevents race conditions when two concurrent mitigation requests decrement credits

CREATE OR REPLACE FUNCTION increment_tenant_mitigation_usage(
    p_tenant_id uuid,
    p_amount int DEFAULT 1
)
RETURNS void AS $$
    UPDATE tenants
    SET mitigations_used_this_month = COALESCE(mitigations_used_this_month, 0) + p_amount
    WHERE id = p_tenant_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Grant execute to authenticated users (RLS on tenants table still applies)
GRANT EXECUTE ON FUNCTION increment_tenant_mitigation_usage TO authenticated;
