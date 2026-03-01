-- Sprint 5: Rate Limit Hardening
-- 1. Harden cleanup_stale_rate_limits() with SET search_path + REVOKE/GRANT
-- 2. New atomic check_rate_limit_atomic() function with FOR UPDATE row locking

-- =============================================================================
-- 1. Harden existing cleanup function
-- =============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_stale_rate_limits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rate_limits
  WHERE updated_at < now() - interval '24 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_stale_rate_limits() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_stale_rate_limits() TO service_role;

-- =============================================================================
-- 2. Atomic rate limit check (replaces JS read-then-write pattern)
--    Uses FOR UPDATE row locking to prevent concurrent bypass.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.check_rate_limit_atomic(
  p_key TEXT,
  p_action TEXT,
  p_max_attempts INT,
  p_window_seconds INT,
  p_block_seconds INT DEFAULT NULL
)
RETURNS TABLE (allowed BOOLEAN, remaining INT, retry_after INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ := v_now - (p_window_seconds || ' seconds')::interval;
  v_blocked_until TIMESTAMPTZ;
  v_timestamps TIMESTAMPTZ[];
  v_valid_timestamps TIMESTAMPTZ[];
  v_count INT;
  v_oldest TIMESTAMPTZ;
  v_retry INT;
  v_exists BOOLEAN;
BEGIN
  -- Try to lock the existing row (or discover it doesn't exist)
  SELECT rl.blocked_until, rl.timestamps, TRUE
  INTO v_blocked_until, v_timestamps, v_exists
  FROM public.rate_limits rl
  WHERE rl.key = p_key AND rl.action = p_action
  FOR UPDATE;

  -- If no row exists, this is a first request — insert and allow
  IF NOT FOUND THEN
    INSERT INTO public.rate_limits (key, action, timestamps, blocked_until, updated_at)
    VALUES (p_key, p_action, ARRAY[v_now], NULL, v_now)
    ON CONFLICT (key, action) DO UPDATE
      SET timestamps = ARRAY[v_now], blocked_until = NULL, updated_at = v_now;

    RETURN QUERY SELECT TRUE, p_max_attempts - 1, 0;
    RETURN;
  END IF;

  -- Check if currently blocked
  IF v_blocked_until IS NOT NULL AND v_blocked_until > v_now THEN
    v_retry := CEIL(EXTRACT(EPOCH FROM (v_blocked_until - v_now)))::INT;
    RETURN QUERY SELECT FALSE, 0, v_retry;
    RETURN;
  END IF;

  -- Filter timestamps within the sliding window
  SELECT array_agg(ts ORDER BY ts)
  INTO v_valid_timestamps
  FROM unnest(v_timestamps) AS ts
  WHERE ts > v_window_start;

  IF v_valid_timestamps IS NULL THEN
    v_valid_timestamps := ARRAY[]::TIMESTAMPTZ[];
  END IF;

  v_count := array_length(v_valid_timestamps, 1);
  IF v_count IS NULL THEN v_count := 0; END IF;

  -- At or over limit
  IF v_count >= p_max_attempts THEN
    -- Optionally set a progressive block
    IF p_block_seconds IS NOT NULL THEN
      v_blocked_until := v_now + (p_block_seconds || ' seconds')::interval;
    ELSE
      v_blocked_until := NULL;
    END IF;

    -- Calculate retry_after from oldest timestamp in window or block duration
    IF p_block_seconds IS NOT NULL THEN
      v_retry := p_block_seconds;
    ELSE
      v_oldest := v_valid_timestamps[1];
      v_retry := GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_oldest + (p_window_seconds || ' seconds')::interval - v_now)))::INT);
    END IF;

    -- Update with cleaned timestamps and optional block
    UPDATE public.rate_limits
    SET timestamps = v_valid_timestamps,
        blocked_until = v_blocked_until,
        updated_at = v_now
    WHERE key = p_key AND action = p_action;

    RETURN QUERY SELECT FALSE, 0, v_retry;
    RETURN;
  END IF;

  -- Allowed — append current timestamp
  v_valid_timestamps := array_append(v_valid_timestamps, v_now);

  UPDATE public.rate_limits
  SET timestamps = v_valid_timestamps,
      blocked_until = NULL,
      updated_at = v_now
  WHERE key = p_key AND action = p_action;

  RETURN QUERY SELECT TRUE, p_max_attempts - (v_count + 1), 0;
  RETURN;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit_atomic(TEXT, TEXT, INT, INT, INT) TO service_role;
