-- Create 'thumbnails' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Anyone can view thumbnails (public)
CREATE POLICY "Public Thumbnails"
ON storage.objects FOR SELECT
USING ( bucket_id = 'thumbnails' );

-- Policy: Users can upload their own thumbnails
CREATE POLICY "Users can upload own thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'thumbnails' AND
    (auth.uid() = (storage.foldername(name))[1]::uuid)
);
