-- File: 20260128_03_cleanup_old_policies__referral_events.sql
DROP POLICY IF EXISTS "Service role can manage referral_events" ON public.referral_events;
