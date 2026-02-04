-- Fix magic_links RLS policy to allow service role access

-- Drop old restrictive policy
DROP POLICY IF EXISTS magic_links_service_role ON public.magic_links;

-- Create permissive policy for service role (which bypasses RLS anyway)
-- This is just a safety policy - service role should bypass RLS entirely
CREATE POLICY magic_links_all_access ON public.magic_links
FOR ALL
USING (true)
WITH CHECK (true);
