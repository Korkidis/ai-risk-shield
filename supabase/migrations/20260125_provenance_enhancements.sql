-- migration: 20260125_provenance_enhancements.sql

-- Stores raw C2PA manifest and forensic details for VALID provenance chains
CREATE TABLE IF NOT EXISTS provenance_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Extracted Metadata
    creator_name TEXT,
    creator_link TEXT,
    creation_tool TEXT,
    creation_tool_version TEXT,
    creation_timestamp TIMESTAMPTZ,
    
    -- Cryptographic Details
    signature_status TEXT NOT NULL CHECK (signature_status IN ('valid', 'invalid', 'caution')),
    certificate_issuer TEXT,
    certificate_serial TEXT,
    hashing_algorithm TEXT DEFAULT 'sha256',
    
    -- Complete Chain (Visual/Interactive Data)
    edit_history JSONB NOT NULL DEFAULT '[]', -- List of edit nodes
    raw_manifest JSONB, -- The full C2PA manifest store
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(scan_id)
);

-- RLS for provenance_details
ALTER TABLE provenance_details ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'provenance_details' AND policyname = 'Users can view provenance details for their tenant'
    ) THEN
        CREATE POLICY "Users can view provenance details for their tenant"
        ON provenance_details FOR SELECT
        USING (tenant_id = user_tenant_id());
    END IF;
END $$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_provenance_details_scan ON provenance_details(scan_id);
