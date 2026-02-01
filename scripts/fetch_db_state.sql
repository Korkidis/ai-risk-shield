SELECT 
    'POLICY' as type,
    schemaname, 
    tablename, 
    policyname, 
    cmd, 
    qual::text, 
    with_check::text
FROM pg_policies 
WHERE tablename IN ('profiles', 'subscriptions', 'assets', 'audit_log', 'brand_guidelines', 'brand_profiles', 'scan_findings', 'scans', 'video_frames', 'tenant_invites', 'usage_ledger')

UNION ALL

SELECT 
    'INDEX' as type,
    schemaname,
    tablename,
    indexname,
    indexdef,
    NULL,
    NULL
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY 1, 3, 4;
