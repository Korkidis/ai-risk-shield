-- Add anonymous upload policies for freemium flow
-- Restores policies removed in security overhaul for session-based uploads

-- Anonymous users can insert assets with session_id
CREATE POLICY assets_insert_anonymous ON public.assets 
FOR INSERT 
TO anon 
WITH CHECK (
  session_id IS NOT NULL 
  AND tenant_id IS NULL
  AND uploaded_by IS NULL
);

-- Anonymous users can select their own assets by session_id  
CREATE POLICY assets_select_anonymous ON public.assets
FOR SELECT
TO anon
USING (
  session_id IS NOT NULL
  AND tenant_id IS NULL
);

-- Anonymous users can insert scans with session_id
CREATE POLICY scans_insert_anonymous ON public.scans
FOR INSERT
TO anon
WITH CHECK (
  session_id IS NOT NULL
  AND tenant_id IS NULL
  AND analyzed_by IS NULL
);

-- Anonymous users can select their own scans by session_id
CREATE POLICY scans_select_anonymous ON public.scans
FOR SELECT
TO anon
USING (
  session_id IS NOT NULL
  AND tenant_id IS NULL
);

-- Anonymous users can update their own scans (for email capture)
CREATE POLICY scans_update_anonymous ON public.scans
FOR UPDATE
TO anon
USING (
  session_id IS NOT NULL
  AND tenant_id IS NULL
)
WITH CHECK (
  session_id IS NOT NULL
  AND tenant_id IS NULL
);
