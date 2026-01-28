# Security Overhaul Migration Execution Order

**Execution Strategy:** A/B/C Split (Safe Rollout)
**Status:** Ready for Staging Execution.

## Phase 0: Pre-Flight
1.  [x] **Backup Schema:** Run `pg_dump --schema-only` (Manual Step).
2.  [x] **Export State:** `20260128_00_existing_triggers_export.txt` (Saved).

## Phase 1: Step A - Concurrent Indexing (Run OUTSIDE Transactions)
*Run each file individually:*
1.  `step1_indexes/20260128_01_create_tenant_indexes__tenants.sql`
2.  `step1_indexes/20260128_01_create_tenant_indexes__profiles.sql`
3.  `step1_indexes/20260128_01_create_tenant_indexes__brand_profiles.sql`
4.  `step1_indexes/20260128_01_create_tenant_indexes__assets.sql`
5.  `step1_indexes/20260128_01_create_tenant_indexes__scans.sql`
6.  `step1_indexes/20260128_01_create_tenant_indexes__scan_findings.sql`
7.  `step1_indexes/20260128_01_create_tenant_indexes__video_frames.sql`
8.  `step1_indexes/20260128_01_create_tenant_indexes__usage_ledger.sql`
9.  `step1_indexes/20260128_01_create_tenant_indexes__subscriptions.sql`
10. `step1_indexes/20260128_01_create_tenant_indexes__audit_log.sql`
11. `step1_indexes/20260128_01_create_tenant_indexes__brand_guidelines.sql`
12. `step1_indexes/20260128_01_create_tenant_indexes__mitigation_reports.sql`
13. `step1_indexes/20260128_01_create_tenant_indexes__referral_events.sql`
14. `step1_indexes/20260128_01_create_tenant_indexes__tenant_invites.sql`
15. `step1_indexes/20260128_01_create_tenant_indexes__tenant_switch_audit.sql`
16. `step1_indexes/20260128_01_create_tenant_indexes__provenance_details.sql`

## Phase 1: Step B - Additive Policies (Run in Transaction if desired)
*Apply these to enable RLS and add v2 policies:*
1.  `step2_policies/20260128_02_enable_rls_and_add_policies__assets.sql`
2.  `step2_policies/20260128_02_enable_rls_and_add_policies__scans.sql`
3.  `step2_policies/20260128_02_enable_rls_and_add_policies__profiles.sql`
4.  `step2_policies/20260128_02_enable_rls_and_add_policies__tenants.sql`
5.  `step2_policies/20260128_02_enable_rls_and_add_policies__brand_profiles.sql`
6.  `step2_policies/20260128_02_enable_rls_and_add_policies__brand_guidelines.sql`
7.  `step2_policies/20260128_02_enable_rls_and_add_policies__scan_findings.sql`
8.  `step2_policies/20260128_02_enable_rls_and_add_policies__video_frames.sql`
9.  `step2_policies/20260128_02_enable_rls_and_add_policies__usage_ledger.sql`
10. `step2_policies/20260128_02_enable_rls_and_add_policies__subscriptions.sql`
11. `step2_policies/20260128_02_enable_rls_and_add_policies__audit_log.sql`
12. `step2_policies/20260128_02_enable_rls_and_add_policies__tenant_invites.sql`
13. `step2_policies/20260128_02_enable_rls_and_add_policies__provenance_details.sql`
14. `step2_policies/20260128_02_enable_rls_and_add_policies__mitigation_reports.sql`
15. `step2_policies/20260128_02_enable_rls_and_add_policies__referral_events.sql`

## Phase 2: Runtime Validation
*   Run Staging Integration Tests.
*   Verify Anonymous Upload/Scan flows complete successfully.

## Phase 3: Step C - Cleanup (DO NOT RUN UNTIL VALIDATED)
1.  `step3_cleanup/20260128_03_cleanup_old_policies__assets.sql`
2.  `step3_cleanup/20260128_03_cleanup_old_policies__scans.sql`
... (and all other Step 3 files)
