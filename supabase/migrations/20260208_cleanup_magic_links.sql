-- Migration: Cleanup Obsolete Magic Links Table
-- Description: We have migrated to Supabase Native Auth Magic Links ("Lazy Registration"). 
--              The custom `magic_links` table and its associated RLS policies are no longer needed 
--              and were flagging security warnings due to permissive RLS.

DROP TABLE IF EXISTS public.magic_links;
