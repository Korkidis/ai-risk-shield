-- Ensure 'uploads' bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Set up policies for the bucket (re-applying RLS fixes just in case)
-- (The logic in 20260104_fix_storage_rls.sql handles policies, but relies on the bucket existing)
