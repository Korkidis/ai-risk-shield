# Database & Backend Audit Report
**Date:** Jan 20, 2026 | **Status:** PASSED (with minor gaps)

## 1. Executive Summary
The existing Supabase schema provides a **solid, enterprise-grade foundation**. It correctly implements multi-tenancy, RLS isolation, and SOC 2-ready audit logging. The recent "Freemium" migration successfully adapts this strict schema for anonymous access without breaking security.

**Verdict:** ✅ **Ready for Phase 1 Implementation**
(No major refactoring required. Only additives needed.)

---

## 2. Schema Audit

### Core Architecture (Multi-Tenant)
*   **`tenants`**: Central entity. Correctly includes `plan`, `stripe_customer_id`, and `monthly_scan_limit`.
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

While the Core is solid, Feature 7 (Mitigation) and some "Instrument" features need schema updates.

### A. Mitigation Reports (Missing)
The "Deep Mitigation" feature requires tracking generated reports and usage limits.
*   **Action**: Create `mitigation_reports` table.
*   **Columns**: `scan_id`, `advice_content` (Markdown), `created_at`.
*   **Limits**: Add `usage_limit_mitigation` to `tenants` table.

### B. Insurance Referrals (Missing)
Need to track upsell clicks for revenue attribution.
*   **Action**: Create `referral_events` table (or add to `audit_log`).

### C. Team Invites (Logic Gap)
Table structure exists (`profiles`), but invite flow (token generation, email) needs an API route or table for pending invites.

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
```

---

*End of Audit*
