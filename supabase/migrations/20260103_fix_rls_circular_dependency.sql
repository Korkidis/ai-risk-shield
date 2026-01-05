-- Fix RLS Circular Dependency
-- Issue: user_tenant_id() function tries to SELECT from profiles,
-- but profiles RLS policy uses user_tenant_id(), creating circular dependency

-- Solution: Add a policy that lets users view their OWN profile by id
-- This breaks the circular dependency

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON profiles;

-- Create two new policies:
-- 1. Users can always view their own profile (by user id, no tenant_id check)
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

-- 2. Users can view OTHER profiles in their tenant (uses tenant_id check)
CREATE POLICY "Users can view profiles in their tenant"
    ON profiles FOR SELECT
    USING (tenant_id = public.user_tenant_id() AND id != auth.uid());
