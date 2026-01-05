-- Check what users exist in the database
-- Run this in Supabase SQL Editor

-- Check auth.users
SELECT
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Check profiles
SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.tenant_id,
    t.name as tenant_name,
    t.plan
FROM profiles p
LEFT JOIN tenants t ON p.tenant_id = t.id
ORDER BY p.created_at DESC;
