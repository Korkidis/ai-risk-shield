-- Fix storage RLS for anonymous uploads
-- Allow service role and backend to access all files for processing

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Service role can access all files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read own uploads" ON storage.objects;

-- Allow service role to access everything (for AI processing)
CREATE POLICY "Service role can access all files"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'uploads');

-- Allow service role to insert (should already exist, but being explicit)
CREATE POLICY "Service role can upload files"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'uploads');

-- Allow authenticated users to read their own uploads (via tenant_id in path)
CREATE POLICY "Authenticated users can read own uploads"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = (
    SELECT tenant_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
);

-- Allow anonymous users to read files in their session folder
CREATE POLICY "Anonymous users can read own session uploads"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = current_setting('request.headers', true)::json->>'x-session-id'
);

COMMENT ON POLICY "Service role can access all files" ON storage.objects IS 'Allows backend AI processing to access all uploaded files';
