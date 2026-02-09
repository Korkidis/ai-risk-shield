-- Migration: Assign Anonymous Scans to Authenticated User
-- Description: Creates a SECURITY DEFINER function to safely migrate scans from a session_id to a user_id.
--              Adds indexes to performance optimize this lookup.

-- 1. Ensure columns exist (idempotent check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scans' AND column_name = 'user_id') THEN
        ALTER TABLE scans ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 2. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_scans_session_id ON scans(session_id);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);

-- 3. Create Security Definer Function
-- This function runs with the privileges of the owner (postgres), bypassing RLS for the update.
-- It strictly controls WHAT can be updated (only rows matching the session and where user_id is null).
CREATE OR REPLACE FUNCTION assign_scans_to_user(p_session_id UUID, p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Update scans that belong to the session AND haven't been assigned yet.
    -- This idempotency prevents overwriting if the user clicks the link multiple times.
    UPDATE scans
    SET 
        user_id = p_user_id,
        -- Optional: Track migration time if you have a column for it, otherwise skip
        updated_at = NOW() 
    WHERE 
        session_id = p_session_id 
        AND (user_id IS NULL OR user_id = p_user_id); -- Allow re-assigning to same user (idempotent)

    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$;

-- 4. Secure the Function
-- Revoke from public, grant only to authenticated (so our API can call it)
REVOKE EXECUTE ON FUNCTION assign_scans_to_user(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION assign_scans_to_user(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION assign_scans_to_user(UUID, UUID) TO service_role;
