
-- Cleanup Shadow Users RPC
-- Allows bulk deletion of unverified users based on source and age
-- This is called by the `cleanup-old-data` Edge Function

CREATE OR REPLACE FUNCTION cleanup_stale_shadow_users(days_old int)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count int;
  cutoff_date timestamptz;
BEGIN
  -- calculate cutoff
  cutoff_date := now() - (days_old || ' days')::interval;

  -- Delete from auth.users
  -- Only target unverified users created via scan unlock
  WITH deleted AS (
    DELETE FROM auth.users
    WHERE (raw_user_meta_data->>'source' = 'scan_unlock')
      AND email_confirmed_at IS NULL
      AND created_at < cutoff_date
    RETURNING id
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  
  -- Log the cleanup action if needed (optional)
  -- RAISE NOTICE 'Deleted % shadow users older than % days', deleted_count, days_old;
  
  RETURN deleted_count;
END;
$$;
