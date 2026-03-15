# AI Risk Shield — Current State

*Branch: `feat/sprint-6-9-ship-ready` | Verified: 2026-03-15*

This product helps creative, legal, and compliance teams de-risk AI-generated content before it enters approval workflows. It flags risks, creates evidence (scan reports, findings, provenance data), and provides remediation guidance — so creatives can clear legal and get content approved or adjusted faster.

**Status definitions:**
- **Verified live** — Confirmed working in production DB or runtime on the date above.
- **Verified in code** — Code exists on this branch and passes type-check. Not yet confirmed in production runtime.
- **Partial** — Implemented but incomplete or has known gaps.
- **Prototype only** — Code or schema exists but is not functional end-to-end.
- **Not shipped** — No code exists for this capability.

---

## 1. Core Pipeline

| Capability | Status | Evidence |
|---|---|---|
| Unified scan processor (image + video) | Verified in code | `lib/ai/scan-processor.ts` — both auth and anon paths |
| C2PA provenance verification | Verified in code | `lib/c2pa.ts` — runs for all scans |
| Gemini multi-persona analysis (IP, Safety, Provenance) | Verified in code | `lib/gemini.ts` — 3 calls per scan |
| Risk scoring (5-tier canonical) | Verified in code | `lib/risk/tiers.ts`, `lib/risk/scoring.ts` — 40 unit tests |
| Risk profile JSONB blob storage + read | Verified in code | `risk_profile` column on scans table; `/api/scans/[id]` reads blob with legacy fallback |
| Video frame extraction (5 frames, paid only) | Verified in code | `lib/video/extract-frames.ts`; blocked for free/anon users in upload routes |
| Brand guidelines wired to image analysis | Verified in code | `guideline_id` stored on scan; processor fetches + passes to all 3 Gemini personas |
| Brand guidelines wired to video analysis | Not shipped | Video pipeline does not inject per-frame guideline context |
| Legacy `/api/analyze` endpoint | Verified deleted | Removed in Phase A |

## 2. Authentication & Authorization

| Capability | Status | Evidence |
|---|---|---|
| Password signup + login (Server Actions) | Verified in code | `app/(auth)/actions.ts` |
| Magic link (shadow user + Resend email) | Verified in code | `app/api/scans/capture-email/route.ts` — `createUser()` + `generateLink()` |
| Middleware route protection | Verified in code | `lib/supabase/middleware.ts` — redirects unauthenticated to login |
| Open redirect prevention | Verified in code | `next` param validated: must start with `/` and not `//` |
| Rate limiting (6 endpoints) | Verified live | `rate_limits` table + `check_rate_limit_atomic()` RPC confirmed in production DB 2026-03-15 |
| Legacy `magic_links` table | Verified dropped | Migration `20260208_cleanup_magic_links.sql` applied |

## 3. Entitlements & Gating

| Capability | Status | Evidence |
|---|---|---|
| Scan reports are FREE (email-gated for anon, open for auth) | Verified in code | `Entitlements.canViewScanReport()` in `lib/entitlements.ts` |
| $29 buys mitigation reports (not scan reports) | Verified in code | `Entitlements.canGenerateMitigation()` in `lib/entitlements.ts` |
| Soft gate masking (findings descriptions, provenance reasoning) | Verified in code | `/api/scans/[id]/route.ts` masks unauthenticated responses |
| Server-side unlock via email persistence | Verified in code | `capture-email` persists email to scan; API lifts masking when `scan.email` present |
| `canViewFullReport` deprecated alias | Verified in code | Alias exists, delegates to `canViewScanReport()` |

## 4. Stripe Billing

| Capability | Status | Evidence |
|---|---|---|
| 5-tier plan config (FREE/PRO/TEAM/AGENCY/ENTERPRISE) | Verified in code | `lib/plans.ts` |
| Subscription checkout | Verified in code | `app/api/stripe/create-checkout/route.ts` |
| One-time $29 mitigation purchase | Verified in code | `components/billing/MitigationPurchaseButton.tsx` |
| Webhook handler (checkout, sub updated/deleted, invoice.paid) | Verified in code | `app/api/stripe/webhook/route.ts` |
| Webhook idempotency (DB-backed via audit_log) | Verified in code | Checks `audit_log` for existing `metadata->>stripe_event_id` |
| Plan sync (`applyPlanToTenant`) | Verified in code | Webhook syncs all limits + feature flags from `lib/plans.ts` |
| Metered overage billing | Verified in code | `lib/stripe-usage.ts` — Stripe Usage Records |
| Usage reporting retry with backoff | Verified in code | `app/api/cron/retry-usage-reports/` + `failed_usage_reports` table |
| Stripe price ID validation | Verified in code | `lib/stripe-validate-prices.ts` — lazy validation on first checkout |
| Monthly quota reset (cron + invoice.paid) | Verified in code | `app/api/cron/reset-quotas/` resets free tenants; webhook resets paid tenants |
| Checkout input validation (planId, interval whitelist) | Verified in code | `create-checkout/route.ts` validates against `pro/team/agency` and `monthly/annual` |

## 5. Mitigation Reports

| Capability | Status | Evidence |
|---|---|---|
| Mitigation report generation (Gemini JSON) | Verified in code | `lib/ai/mitigation-generator.ts` — `generateMitigationReport()` |
| Mitigation report API route | Verified in code | `app/api/scans/[id]/mitigation/route.ts` |
| Atomic mitigation quota RPC | Verified live | `consume_mitigation_quota()` confirmed in production DB 2026-03-15 |
| CAS enforcement on status transitions | Verified in code | `pending→processing` and `failed→processing` use `.select('id')` + zero-row check |
| Mitigation report display in drawer | Verified in code | `components/dashboard/UnifiedScanDrawer.tsx` |
| AuditModal sells mitigation reports | Verified in code | `components/marketing/AuditModal.tsx` — $29 one-time or Pro credits |
| Mitigation PDF export | Not shipped | `generateMitigationPdf()` does not exist anywhere in the codebase |

## 6. Dashboard & UI

| Capability | Status | Evidence |
|---|---|---|
| Scans & Reports page (canonical product) | Verified in code | `app/(dashboard)/dashboard/scans-reports/page.tsx` |
| Unified scan drawer (detail view) | Verified in code | `components/dashboard/UnifiedScanDrawer.tsx` |
| Search, sort, risk filter, pagination | Verified in code | `/api/scans/list` (whitelisted sort fields) + scans-reports page |
| Share button (token generation + clipboard) | Verified in code | PATCH generates `share_token`, copies URL, animated toast |
| Bulk download/share | Verified in code | `RSBulkActionBar` with `Promise.allSettled` |
| Public shared scan page | Verified in code | `/scan/[id]?token=` renders `SharedScanView`; referrer policy set to `no-referrer` |
| Brand guidelines CRUD (create, edit, delete) | Verified in code | `app/(dashboard)/dashboard/brand-guidelines/` + `/api/guidelines/` |
| Guideline selector in scanner | Verified in code | `dashboard/page.tsx` — dropdown auto-selects default guideline |
| History + Reports pages | Verified in code | Both `redirect('/dashboard/scans-reports')` |
| Error + not-found pages | Verified in code | Root `error.tsx`, `not-found.tsx`, dashboard `error.tsx` |
| Mobile hamburger nav | Verified in code | `components/layout/Header.tsx` — slide-down panel |
| SEO metadata | Verified in code | `app/layout.tsx` — title, description, JSON-LD |
| Freemium upload (landing page) | Verified in code | `FreeUploadContainer.tsx` → anonymous-upload → realtime progress |
| Email gate before dashboard redirect | Verified in code | `DashboardEmailGate.tsx` → `capture-email` route |
| Quota display (sidebar) | Partial | Uses live tenant counters; `usage_ledger` parity not confirmed |
| Failed scan display | Partial | Shows "FAILED" badge + error message; no retry UI or error categorization |
| Design Lab | Verified in code | `app/(dashboard)/dashboard/design-lab/` — internal component showcase only |
| Help page | Verified in code | `app/(dashboard)/dashboard/help/` — FAQ scaffolding |

## 7. Security Hardening

| Capability | Status | Evidence |
|---|---|---|
| Security headers (8 total) | Verified in code | `next.config.js` — HSTS, X-Frame-Options, COOP, Permissions-Policy, X-Content-Type-Options, Referrer-Policy, X-Permitted-Cross-Domain-Policies, CSP |
| PII scrubbed from logs | Verified in code | Phases K-N removed emails/user IDs from `console.log` across 10+ files |
| Error detail leaks sealed | Verified in code | 10+ endpoints no longer expose raw `error.message` to clients |
| Sort/order injection prevention | Verified in code | `/api/scans/list` whitelists sort fields + validates sort order |
| File size validation (100MB image / 500MB video) | Verified in code | Both upload endpoints enforce limits with 413 response |
| Session hijacking prevention | Verified in code | `capture-email` validates `scanId` belongs to current `session_id` |
| UUID validation on inputs | Verified in code | `capture-email`, upload, checkout validate UUID format |
| Timing-safe auth comparison | Verified in code | Process route uses `crypto.timingSafeEqual()` |
| Referrer policy on share pages | Verified in code | `/scan/[id]` exports `metadata.referrer = 'no-referrer'` |
| Anonymous quota fail-closed | Verified in code | Returns `{ allowed: false }` with 503 on service error |
| Webhook metadata validation | Verified in code | Validates `scanId` UUID format + `purchaseType` whitelist before processing |

## 8. Database (Production-Verified 2026-03-15)

| Object | Status | Grants |
|---|---|---|
| `rate_limits` table | Verified live | RLS enabled |
| `check_rate_limit_atomic()` | Verified live | SECURITY DEFINER, search_path=public, EXECUTE to service_role + owner |
| `cleanup_stale_rate_limits()` | Verified live | SECURITY DEFINER, search_path=public, EXECUTE to service_role + owner |
| `increment_tenant_mitigation_usage()` | Verified live | SECURITY DEFINER, search_path=public, EXECUTE to authenticated + service_role + owner |
| `consume_mitigation_quota()` | Verified live | SECURITY DEFINER, search_path=public, EXECUTE to authenticated + service_role + owner |
| All tracked migrations | Verified live | Object-level verification (columns, indexes, RLS policies, functions, grants) |
| Brand guideline encryption (AES-256) | Not shipped | Schema column exists; `ENCRYPTION_MASTER_KEY` env var documented but encryption logic not implemented |

## 9. Infrastructure

| Capability | Status | Evidence |
|---|---|---|
| Vercel Cron (quota reset + usage retry) | Verified in code | `vercel.json` — monthly quota reset, 15-min usage retry |
| Supabase Realtime (scan status updates) | Verified in code | `hooks/useRealtimeScans.ts` — replaced polling (saved 139GB egress) |
| Webhook health alerting | Verified in code | `lib/webhook-monitor.ts` — writes to `audit_log` + optional email via Resend |
| Supabase types (rebuilt Phase R) | Verified in code | `lib/supabase/types.ts` — 18 tables, 6 RPCs |
| Type-check zero errors | Verified in code | `npx tsc --noEmit` passes |

## 10. What Is NOT Shipped (on this branch)

| Capability | Notes |
|---|---|
| Audit log viewer (API + UI) | Reverted. Only Stripe webhook events write to `audit_log`. No query API. No dashboard page. |
| Team management (API routes + UI) | Reverted. Schema exists (`tenant_invites` table) but zero routes or UI. |
| VideoFrameGrid component | Reverted. |
| Video per-tier config (duration limits, frame limits per plan) | Reverted. Video uses flat 5-frame MVP extraction. |
| Frames API (`/api/scans/[id]/frames`) | Reverted. |
| CI pipeline (`.github/workflows/ci.yml`) | Reverted. |
| Account settings page | Never built. No `/dashboard/settings` or equivalent. |
| Failed scan retry UI | Not shipped. Shows FAILED status + error message but no retry button or error categorization. |
| Mitigation PDF export | Not shipped. `generateMitigationPdf()` does not exist. |
| Login plan wiring | Partial. Pricing page passes `plan` param to signup URL, but signup page ignores it. Login `next` param exists in server action but not in form UI. Dashboard does not auto-trigger checkout from URL params. |
| Comprehensive audit log coverage | Partial. Only Stripe webhook events logged to `audit_log`. No scan/access/login/admin event logging. |
| Insurance referral tracking | Prototype only. `referral_events` table schema exists; no UI or API routes. |
| E2E test suite | Not shipped. No automated end-to-end tests. |

## 11. Known Stale Documentation (Outside This File)

| File | Issue |
|---|---|
| `ARCHITECTURE.md` line 56-57 | Says pipeline is "Synchronous" and references `/api/analyze` — both stale. Pipeline is async via `scan-processor.ts`; `/api/analyze` deleted. |
| `brain/implementation_plan.md` | Last updated 2026-02-15. References `ScanResultsWithGate.tsx` (deleted Phase D). |

---

*This document is the canonical source of truth for what is shipped as of 2026-03-15. For architecture rules and coding conventions, see `.claude/CLAUDE.md`. For execution tracking, see `tasks/todo.md`.*
