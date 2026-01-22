-- AI Risk Shield - Security Hardening
-- Created: 2026-01-22
-- Description: Fixes critical RLS policies and moves extensions to proper schema

-- ============================================================================
-- 1. FIX EXTENSION SCHEMA
-- ============================================================================
-- Move extensions out of public schema to prevent pollution and security issues

CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move moddatetime if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'moddatetime' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        ALTER EXTENSION "moddatetime" SET SCHEMA extensions;
    END IF;
END $$;

-- Move uuid-ossp if it exists in public
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp' AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
    END IF;
END $$;

-- Update search path so functions can still be found without schema qualification
ALTER DATABASE postgres SET search_path TO public, extensions;

-- ============================================================================
-- 2. FIX PERMISSIVE RLS POLICIES
-- ============================================================================
-- The original policies used "USING (true)" without restricting to "TO service_role".
-- This effectively allowed public access to these sensitive tables.

-- A. USAGE LEDGER
DROP POLICY IF EXISTS "Service role can manage usage" ON usage_ledger;

CREATE POLICY "Service role can manage usage"
    ON usage_ledger
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- B. SUBSCRIPTIONS
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON subscriptions;

CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- C. AUDIT LOG
DROP POLICY IF EXISTS "Service role can insert audit logs" ON audit_log;

CREATE POLICY "Service role can insert audit logs"
    ON audit_log
    FOR INSERT
    TO service_role
    WITH CHECK (true);
