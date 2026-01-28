-- File: 20260128_03_cleanup_old_policies__video_frames.sql
DROP POLICY IF EXISTS "Users can view video frames in their tenant" ON public.video_frames;
