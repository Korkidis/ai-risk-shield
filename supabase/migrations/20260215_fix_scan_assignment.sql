-- Migration: Fix Anonymous Scan Assignment
-- Description: Updates assign_scans_to_user to propagate tenant_id to all related tables.
--              This ensures claimed scans appear in the dashboard (which filters by tenant_id).

CREATE OR REPLACE FUNCTION assign_scans_to_user(p_session_id UUID, p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
    v_count INTEGER;
    v_scan_ids UUID[];
BEGIN
    -- 1. Get the user's tenant_id
    SELECT tenant_id INTO v_tenant_id
    FROM profiles
    WHERE id = p_user_id;

    IF v_tenant_id IS NULL THEN
        -- Fallback: If profile doesn't exist yet (race condition), check if we can create it? 
        -- Or just error. Usually profile is created on signup trigger.
        RAISE EXCEPTION 'User % has no tenant_id', p_user_id;
    END IF;

    -- 2. Identify scans to update and lock them
    -- We use a CTE to update scans and capture their IDs for cascading updates
    WITH updated_scans AS (
        UPDATE scans
        SET 
            user_id = p_user_id,
            tenant_id = v_tenant_id,
            session_id = NULL, -- Clear session for security (prevent reuse/zombie tokens)
            updated_at = NOW() 
        WHERE 
            session_id = p_session_id 
            AND (user_id IS NULL OR user_id = p_user_id) -- Idempotency
        RETURNING id, asset_id
    )
    SELECT ARRAY_agg(id), count(*) INTO v_scan_ids, v_count FROM updated_scans;

    -- If no scans found, return 0
    IF v_count IS NULL OR v_count = 0 THEN
        RETURN 0;
    END IF;

    -- 3. Update Assets
    -- Assets might be shared? Unlikely for anonymous.
    -- We update assets linked to these scans.
    UPDATE assets
    SET tenant_id = v_tenant_id
    WHERE id IN (
        SELECT asset_id FROM scans 
        WHERE id = ANY(v_scan_ids)
    );

    -- 4. Update Scan Findings
    UPDATE scan_findings
    SET tenant_id = v_tenant_id
    WHERE scan_id = ANY(v_scan_ids);

    -- 5. Update Provenance Details (if exists)
    UPDATE provenance_details
    SET tenant_id = v_tenant_id
    WHERE scan_id = ANY(v_scan_ids);

    RETURN v_count;
END;
$$;
