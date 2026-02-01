# Database & Backend Audit Report
**Date:** Jan 20, 2026 | **Status:** PASSED (with minor gaps)

## 1. Executive Summary
The existing Supabase schema provides a **solid, enterprise-grade foundation**. It correctly implements multi-tenancy, RLS isolation, and SOC 2-ready audit logging. The recent "Freemium" migration successfully adapts this strict schema for anonymous access without breaking security.

**Verdict:** ✅ **Ready for Phase 1 Implementation**
(No major refactoring required. Only additives needed.)

---

## 2. Schema Audit

### Core Architecture (Multi-Tenant)
*   **`tenants`**: Central entity. Includes `parent_tenant_id` (for Agency/Client hierarchy), `plan`, `stripe_customer_id`, `stripe_metered_item_id` (for overage), and `monthly_scan_limit`.
*   **`profiles`**: Links users to tenants. Role-based (`owner`, `admin`, `member`).
*   **`rls_policies`**: START RLS enabled on all tables. Isolation enforced via `user_tenant_id()` helper function. **Result:** Bulletproof isolation.

### The "Instrument" Data Models
*   **`assets`**:
    *   ✅ Storage path tracking.
    *   ✅ SHA256 checksums (integrity).
    *   ✅ `delete_after` retention policy column.
    *   ✅ `session_id` added for anonymous tracking.
*   **`scans`**:
    *   ✅ Stores all risk scores (IP, Safety, Provenance).
    *   ✅ `risk_level` enum matches standards.
    *   ✅ `session_id` + `analyzed_by` (nullable) supports hybrid flow.
*   **`scan_findings`**:
    *   ✅ Flexible JSONB for evidence.
    *   ✅ Severity levels match standards (`critical`, `high`, etc.).

### Security & Compliance (SOC 2)
*   **`audit_log`**: exists and tracks `action`, `resource`, `user`, `ip`.
*   **`brand_profiles`**: Columns for `encrypted_guidelines` (AES-256) exist. Excellent.
*   **Quota Management**: `consume_quota()` Postgres function exists for atomic enforcement.

---

## 3. Storage & Edge Logic Audit

### Storage (`uploads` bucket)
*   **Policies**:
    *   `Authenticated`: Read own tenant's files.
    *   `Anonymous`: Read own session's files (verified in `20260104_fix_storage_rls.sql`).
    *   `Service Role`: Full access for AI processing.
*   **Result**: Secure and functional.

### Ephemeral Storage (Privacy Context)
Code analysis reveals two "invisible" storage layers:
1.  **Local Temp (`/tmp`)**: `lib/video/processor.ts` and `lib/gemini.ts` write buffers to disk for C2PA/FFmpeg processing. (Cleaned up via `fs.unlink`).
2.  **Google Cloud**: Large video assets are uploaded to `GoogleAIFileManager` for Gemini analysis. (Explicitly deleted after analysis).

### Async Architecture
The system uses a **Self-Referential HTTP Pattern** for background processing:
*   `anonymous-upload` endpoint triggers `fetch('${APP_URL}/api/scans/process')`.
*   **Risk**: If the serverless function times out, the `fetch` might fail silently or the process might be killed.
*   **Recommendation**: Monitor this closely. If reliability drops, move to Supabase Edge Functions with Queues.

### External Services
*   **Email**: Resend (`RESEND_API_KEY`).
*   **Payments**: Stripe (`STRIPE_SECRET_KEY`).
*   **AI**: Gemini 1.5 Pro/Flash (`GEMINI_API_KEY`).
*   **Security**: Rate limiting verified in `lib/ratelimit.ts` (uses `IP_HASH_SECRET`).

### Compute Architecture
*   **Edge Functions**: None found in `supabase/functions`.
*   **Current State**: Logic resides in Next.js API Routes (`app/api/*`).
*   **Recommendation**: Keep as-is for MVP. Move heavy jobs to Edge Functions later if timeouts occur (Gemini 1.5 Flash is fast enough for now).

---

## 4. Identified Gaps (To Build)
**STATUS UPDATE (Feb 1, 2026): ALL GAPS IMPLEMENTED & DEPLOYED.**

### A. Mitigation Reports (Completed)
*   **Implemented**: `mitigation_reports` table created.
*   **Limits**: `usage_limit_mitigation` column added to `tenants`.

### B. Insurance Referrals (Completed)
*   **Implemented**: `referral_events` table created with `user_id` tracking.

### C. Team Invites (Completed)
*   **Implemented**: `tenant_invites` table created with secure token logic.

---

## 5. Migration Plan (Phase 1 Additives)

We do *not* need to wipe the database. We will apply an additive migration:

```sql
-- migration: 20260120_phase1_additives.sql

-- 1. Mitigation Reporting
CREATE TABLE mitigation_reports (...);
ALTER TABLE tenants ADD COLUMN usage_limit_mitigation INTEGER DEFAULT 0;

-- 2. Insurance Tracking
CREATE TABLE referral_events (...);

-- 3. Invite System
CREATE TABLE tenant_invites (...);

-- 4. Hierarchical Tenancy (Agency/Enterprise)
-- Implemented via 20260122_hierarchical_tenancy.sql
ALTER TABLE tenants ADD COLUMN parent_tenant_id UUID REFERENCES tenants(id);
CREATE TABLE tenant_switch_audit (...);
-- RLS updated to support 'active_tenant' switching for Agency Admins.
```

---

---

## 6. Phase 1 Implementation Log (Jan 26, 2026)

The following core backend features have been implemented and verified as of `2026-01-26`:

### A. Quota Enforcement
**Status:** ✅ Live & Enforced
*   **Mechanism**: A strict check is performed in `app/api/scans/upload/route.ts` before processing begins.
*   **Logic**:
    1.  Fetches `tenants.monthly_scan_limit` and `tenants.scans_used_this_month`.
    2.  If `used >= limit`, returns `403 Forbidden` ("Monthly scan limit reached").
    3.  On success, calls `rpc('increment_scans_used')` to atomiaclly update the counter.
*   **Admin Override**: Limits can be adjusted manually in the `tenants` table.

### B. Data Retention Policy
**Status:** ✅ Automation Scripted
*   **Mechanism**: A `pg_cron` job runs daily to clean up stale assets.
*   **Script**: `scripts/setup-cron.sql` (Job ID: 2 verified).
*   **Functions**:
    *   `purge_old_assets()`: Deletes rows effectively where `now() > created_at + retention_days`.
    *   `reset_monthly_usage()`: Scheduled for the 1st of every month to reset counters.

### C. Schema Consolidations
During implementation, the schema was refined to match the actual database state more closely (replacing hypothetical columns with JSONB).
*   **`provenance_details`**:
    *   Removed flat columns (`chain_custody`, `manifest_store`, `edit_count`).
    *   **Adopted**: `raw_manifest` (JSONB) and `edit_history` (JSONB Array) for deep flexibility.
    *   **Field**: `signature_status` remains as the primary high-level signal (`valid`, `invalid`, `caution`).

### D. Hierarchical Tenancy
**Status:** ✅ Implemented
*   **Structure**: `tenants.parent_tenant_id` allows Agency/Enterprise accounts to own sub-tenants.
*   **Switching**: Users with `agency` plan + `owner` role can switch context to child tenants via `/api/switch-tenant`.

---

## 7. Phase 2 Implementation Log (Feb 1, 2026)

**Focus**: Feature Completion & Enterprise Hardening.

### A. Backend Gap Closure
*   **`mitigation_reports`**: Added to support paid "Deep Mitigation" feature. RLS verified for tenant isolation.
*   **`referral_events`**: Added for tracking insurance upsell interactions. RLS allows authenticated storage.
*   **`tenant_invites`**: added for team growth. Includes expiration logic and admin-only creation policies.

### B. Database Hardening & Optimization
**Status**: ✅ 100% Linter Compliance
*   **RLS Performance**: All `auth.uid()` and `current_setting()` calls in policies are now wrapped in `(SELECT ...)` to prevent per-row re-evaluation (fixing `auth_rls_initplan` warnings).
*   **Policy Consolidation**: Merged multiple permissive policies into single, optimized predicates for `tenants`, `subscriptions`, and `audit_log`.
*   **Index Optimization**: Added missing blocking indexes for all foreign keys (`referral_events`, `mitigation_reports`, etc.) to improve join performance.
*   **Security Polish**:
    *   Restricted `WITH CHECK (true)` policies explicitly to `service_role`.
    *   Secured function `search_path` for `remediation` helpers.

---

## 8. Phase 3 Implementation Log (Feb 1, 2026)

**Focus**: Subscription Model & Pricing Infrastructure.

### A. Subscription Strategy Document
**File**: `SUBSCRIPTION_STRATEGY.md`
*   **Purpose**: Single source of truth for all pricing, limits, and entitlements.
*   **Coverage**: 5 tiers (FREE, PRO, TEAM, AGENCY, ENTERPRISE), annual discounts, overage pricing, feature flags.
*   **Unit Economics**: Documented COGS ($0.015/scan), LTV calculations, and margin analysis.

### B. Central Plans Configuration
**File**: `lib/plans.ts`
*   **Purpose**: Code-level config mapping tier → limits, prices, and feature flags.
*   **Exports**: `getPlan()`, `hasFeature()`, `canUseOverage()`, `formatPrice()`.
*   **Type Safety**: Full TypeScript types for `PlanId` and `PlanConfig`.

### C. Entitlements Refactor
**File**: `lib/entitlements.ts`
*   **Change**: Now imports from `lib/plans.ts` instead of hardcoded values.
*   **New Methods**: `willChargeOverage()`, `canAddSeat()`, `canAddBrandProfile()`, `getScanLimit()`, `getReportLimit()`.

### D. Stripe Webhook Enhancement
**File**: `app/api/stripe/webhook/route.ts`
*   **New Handlers**: `customer.subscription.updated`, `customer.subscription.deleted`.
*   **Core Logic**: `applyPlanToTenant()` function applies all limits and feature flags from `lib/plans.ts` on plan change.
*   **Price Mapping**: `STRIPE_PRICE_TO_PLAN` maps Stripe Price IDs to internal plan IDs.

### E. Database Schema Additions
**Migration**: `20260201_subscription_columns.sql`
*   **Limit Columns**: `monthly_report_limit`, `seat_limit`, `brand_profile_limit`.
*   **Overage Columns**: `scan_overage_cost_cents`, `report_overage_cost_cents`.
*   **Feature Flags**: `feature_bulk_upload`, `feature_co_branding`, `feature_white_label`, `feature_audit_logs`, `feature_priority_queue`, `feature_sso`, `feature_team_dashboard`.
*   **Usage Tracking**: `reports_used`, `overage_reports` added to `usage_ledger`.
*   **Plan Enum Fix**: Changed `'individual'` to `'pro'` to match strategy.

### F. RLS Final Cleanup
**Migration**: `20260201_rls_final_cleanup.sql`
*   Fixed remaining 4 WARN-level linter issues.
*   Consolidated duplicate policies on `tenants`, `subscriptions`, `referral_events`, `tenant_switch_audit`.

### G. Metered Billing (Usage-Based)
**Migration**: `20260201_metered_billing.sql`
*   **New Column**: `tenants.stripe_metered_item_id`.
*   **Purpose**: Stores the unique Stripe Subscription Item ID for the metered usage price component.
*   **Workflow**: Populated via webhook on checkout. Used by `reportScanUsage()` helper to report usage to Stripe API.

---

*End of Audit*
