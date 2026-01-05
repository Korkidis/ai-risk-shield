-- Check storage bucket policies
-- Run this in Supabase SQL Editor

SELECT * FROM storage.buckets WHERE name = 'uploads';

SELECT * FROM storage.objects WHERE bucket_id = 'uploads' LIMIT 5;
