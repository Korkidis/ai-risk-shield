SELECT tablename, count(policyname) as policy_count, array_agg(policyname) as policies
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename 
ORDER BY tablename;
