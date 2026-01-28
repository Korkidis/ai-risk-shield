-- File: 20260128_02_enable_rls_and_add_policies__video_frames.sql
ALTER TABLE public.video_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY video_frames_select_tenant ON public.video_frames FOR SELECT TO authenticated USING (tenant_id = user_tenant_id());

CREATE POLICY video_frames_insert_tenant ON public.video_frames FOR INSERT TO authenticated WITH CHECK (tenant_id = user_tenant_id());

CREATE POLICY video_frames_update_tenant ON public.video_frames FOR UPDATE TO authenticated USING (tenant_id = user_tenant_id()) WITH CHECK (tenant_id = user_tenant_id());
