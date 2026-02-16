-- Enable Realtime for scans table
-- This allows the dashboard and landing page to listen for progress updates
begin;

  -- Add scans to the publication if not already present
  -- (Supabase Realtime uses the 'supabase_realtime' publication)
  alter publication supabase_realtime add table scans;

commit;
