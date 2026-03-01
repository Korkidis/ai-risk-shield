ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS purchased_by UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_scans_purchased_by ON public.scans(purchased_by) WHERE purchased_by IS NOT NULL;
