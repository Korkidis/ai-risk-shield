-- Security Fixes

-- 1. Enable RLS on referral_events (ERROR: rls_disabled_in_public)
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

-- 2. Secure Function Search Paths (WARN: function_search_path_mutable)
-- Setting search_path to 'public' ensures functions don't inherit the caller's search path, preventing potential hijacking.
ALTER FUNCTION public.user_role() SET search_path = 'public';
ALTER FUNCTION public.consume_quota(uuid, integer) SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.user_tenant_id() SET search_path = 'public';

-- 3. Add explicit RLS policy for referral_events if missing (Best Practice)
-- Assuming we want service role access at minimum
CREATE POLICY "Service role can manage referral_events" ON public.referral_events
    AS PERMISSIVE FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
