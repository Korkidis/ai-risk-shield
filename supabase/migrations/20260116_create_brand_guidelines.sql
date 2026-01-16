-- Create brand_guidelines table
CREATE TABLE IF NOT EXISTS public.brand_guidelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    is_default BOOLEAN DEFAULT false,
    prohibitions TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    context_modifiers TEXT[] DEFAULT '{}',
    target_markets TEXT[] DEFAULT '{}',
    target_platforms TEXT[] DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Manage updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.brand_guidelines
    FOR EACH ROW EXECUTE FUNCTION moddatetime (updated_at);

-- Add guideline_id to scans table
ALTER TABLE public.scans ADD COLUMN IF NOT EXISTS guideline_id UUID REFERENCES public.brand_guidelines(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.brand_guidelines ENABLE ROW LEVEL SECURITY;

-- Select policy
CREATE POLICY "Users can view brand guidelines of their tenant" ON public.brand_guidelines
    FOR EACH ROW USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Insert policy
CREATE POLICY "Users can insert brand guidelines for their tenant" ON public.brand_guidelines
    FOR EACH ROW WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Update policy
CREATE POLICY "Users can update brand guidelines of their tenant" ON public.brand_guidelines
    FOR EACH ROW USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Delete policy
CREATE POLICY "Users can delete brand guidelines of their tenant" ON public.brand_guidelines
    FOR EACH ROW USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Ensure only one default per tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_brand_guidelines_one_default ON public.brand_guidelines (tenant_id) WHERE (is_default = true);

-- Add index for tenant search
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_tenant ON public.brand_guidelines (tenant_id);
