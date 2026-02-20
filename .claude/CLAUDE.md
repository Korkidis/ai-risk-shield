# AI Risk Shield - Claude Code Guide

## Project Overview
SaaS platform for AI content risk validation. Stack: Next.js 16 (App Router, Turbopack) + Supabase + Google Gemini 2.5 Flash + Stripe.

**Business Model:** Freemium SaaS (3 free scans/month → $29 one-time reports or $49-599/mo subscriptions)

**Core Value Prop:** Validate AI-generated images/videos for copyright risk, brand safety, and C2PA provenance in 15 seconds.

**Hybrid Billing:** Seat-based + consumption-based. Users get a set number of scans and full reports per month. Can subscribe to higher tiers or buy individual reports ($29 one-time).

## Product Strategy (Feb 2026)

### One Product Reality
- **The dashboard (`/dashboard/scans-reports`) is the product.** All roads lead here.
- **The freemium landing page is the on-ramp.** Shows immediate value (score + sample PDF), creates account, gets out of the way.
- **`/scan/[id]` is transitional.** Do NOT break it — it's still used for auto-download + verification. Deprecate only after dashboard path fully covers its functions.

### Conversion Flow (Current → Target)
**Current:** Upload → results inline → redirect to `/dashboard?scan=[id]` → magic link for persistence → `/dashboard/scans-reports` (scan auto-selected) → purchase CTAs in drawer
**Remaining:** Email gate before redirect (consent collection), instant PDF download before account creation

### Known Theater (Status)
- ~~Telemetry stream is scripted~~ — **FIXED**: Dashboard + Landing use Supabase Realtime progress (Step 7)
- ~~"3/3 REMAINING" counter is hardcoded~~ — **FIXED**: `FreeUploadContainer` fetches from `/api/scans/anonymous-quota`
- ~~Sidebar "PRO PLAN 4/10 seats" is hardcoded~~ — **FIXED**: `TenantPlanBadge` reads real billing data
- ~~Quota display "15/50_SCANS" is hardcoded~~ — **FIXED**: scans-reports reads `billingStatus.scansUsed/monthlyScanLimit`
- ~~AuditModal lies~~ — **FIXED**: Features match `plans.ts` PRO tier (Phase D)
- ~~Price inconsistency~~ — **FIXED**: `UpgradeModal.tsx` deleted, AuditModal shows $49 (Phase D)
- `FreeForensicReport.tsx` (design-lab only, not customer-facing) — cosmetic fix applied Phase E

## Critical Security Rules

### Data Protection
- **ALWAYS use Row Level Security (RLS)** on every database query
- **NEVER expose PII** in logs, URLs, or error messages
- **ALWAYS encrypt brand guidelines** before storing (AES-256) — NOT YET IMPLEMENTED, schema ready
- **NEVER use localStorage for auth** - httpOnly cookies only (Supabase handles this)
- **ALWAYS verify tenant_id** server-side (don't trust client)

### API Security
- **API routes pattern:** Check auth → verify tenant_id → check quota → process request
- **Service role key:** Server-side only, NEVER expose to client
- **Anon key:** Client-side only, limited permissions
- **Input validation:** Sanitize all user inputs (file names, emails, etc.)
- **`/api/scans/process` auth + idempotency added** — validates origin and rejects duplicate processing (S1 fixed)

### Multi-Tenant Isolation
- **Every table must have tenant_id** column with RLS policy
- **Test cross-tenant access** after every feature (should always fail)
- **Quota enforcement:** Use atomic database function (prevent race conditions)

## Architecture Principles

### Next.js 16 App Router
- **Server Components by default** - Use "use client" only when needed (useState, useEffect, browser APIs)
- **Server Actions** for mutations (no need for API routes for simple forms)
- **API routes** for complex workflows (file upload, Gemini analysis)

### Supabase Best Practices
- **Three client types:**
  - `createBrowserClient` - Client Components
  - `createServerClient` - Server Components, API Routes
  - Middleware client - Session refresh
- **RLS is defense-in-depth** - Always filter by tenant_id in code too
- **Storage paths:** Always use tenant_id in folder structure (`uploads/{tenant_id}/{file}`)
- **Realtime** - Switched from polling to Supabase Realtime (Feb 2026) for scan status updates. Polling caused 139GB egress.

### Gemini API Usage
- **Model:** `gemini-2.5-flash` — verify metadata stores this, not `gemini-1.5-flash`
- **Safety blocks = feature, not bug** - Convert to critical finding (score: 100)
- **Three separate calls:** Legal Analyst (IP) + Compliance Auditor (Safety) + Report Generator
- **Temperature:** 0.2 for analysis (consistent), 0.4 for reports (creative)
- **Never send PII** - Only image data, no user emails/names

### Risk Scoring (Canonical)
- **Single source of truth:** `lib/risk/tiers.ts` and `lib/risk/scoring.ts` (40 unit tests, commit 7ff1e83)
- **5 tiers:** critical / high / review / caution / safe
- **C2PA fidelity:** 5-value system (verified / caution / untrusted / invalid / missing)
- **Composite formula:** Weighted (IP 70%, Provenance 20%, Safety 10%) with Red Flag override at ≥85
- **Do NOT add local thresholds anywhere** — always use `getRiskTier()` from `lib/risk/tiers.ts`

### Authentication
- **Password-based:** signup + login via Server Actions
- **Magic link (freemium):** Shadow user creation via `supabase.auth.admin.createUser()` + `generateLink()`, delivered via Resend
- **Legacy:** Custom `magic_links` table is deprecated. Migration to drop exists (`20260208_cleanup_magic_links.sql`). `/api/auth/verify/route.ts` has been deleted — migration can now be applied. Empty `app/auth/verify/` directory cleaned up (Phase E).

### Stripe Integration
- **5-tier pricing:** FREE / PRO ($49) / TEAM ($199) / AGENCY ($499) / ENTERPRISE (custom) — see `lib/plans.ts`
- **Two purchase paths:** One-time $29 report per scan OR monthly/annual subscription
- **Metered overage billing:** Stripe Usage Records for paid plans exceeding monthly limits
- **Webhook handler:** `app/api/stripe/webhook/route.ts` processes `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- **Plan sync:** `applyPlanToTenant()` syncs all limits and feature flags from `lib/plans.ts` to tenant record
- **Entitlements:** `lib/entitlements.ts` centralizes access control (`canViewFullReport`, `canViewTeaser`, `isQuotaExceeded`)

## Common Mistakes to Avoid

❌ **Don't trust client-side validation** - Always re-validate server-side
❌ **Don't forget audit logging** - Log all sensitive actions (scans, purchases, data access)
❌ **Don't expose stack traces** - Generic errors to users, detailed logs server-side
❌ **Don't use sequential IDs** - Use UUIDs (prevent enumeration attacks)
❌ **Don't store Stripe card data** - Stripe handles it, we only store customer IDs
❌ **Don't block paid users at quota** - Allow overages, bill automatically
❌ **Don't add hardcoded risk thresholds** - Use `lib/risk/tiers.ts` exclusively
❌ **Don't create duplicate analysis pipelines** - Route all flows through the same processor (FIXED: unified in Phase A)
❌ **Don't reconstruct data you already stored** - Read the `risk_profile` blob from scans table

## File Structure Patterns

```
app/
├── (auth)/              # Auth routes (login, signup)
├── (dashboard)/         # Protected routes
│   └── dashboard/
│       ├── page.tsx             # Scanner (main upload + analysis)
│       ├── scans-reports/       # THE CANONICAL PRODUCT PAGE
│       ├── brand-guidelines/    # Guidelines CRUD (UI works, not wired to analysis)
│       ├── help/                # FAQ + docs (scaffolding)
│       ├── history/             # STUB → should redirect to scans-reports
│       ├── reports/             # STUB → should redirect to scans-reports
│       └── design-lab/          # Internal component showcase (hide from customers)
├── (marketing)/         # Pricing page
├── api/                 # API routes
│   ├── scans/           # Upload, process, capture-email, assign-to-user, list, [id], anonymous-quota, anonymous-upload
│   ├── stripe/          # Checkout + webhook
│   ├── switch-tenant/   # Multi-tenant switching
│   └── guidelines/      # Brand guidelines CRUD
├── scan/[id]/           # Anonymous scan result (transitional — deprecate after dashboard covers it)
├── auth/callback/       # Supabase auth callback
├── layout.tsx           # Root layout
└── page.tsx             # Landing page (freemium on-ramp)

lib/
├── supabase/           # Supabase clients (client.ts, server.ts, middleware.ts)
├── gemini.ts           # Gemini multi-persona analysis (IP, Safety, Provenance)
├── ai/                 # scan-processor.ts (async processing orchestrator)
├── risk/               # CANONICAL: tiers.ts + scoring.ts (single source of truth)
├── plans.ts            # 5-tier plan configuration (pricing source of truth)
├── entitlements.ts     # Access control (report gating, quota checks)
├── pdf-generator.ts    # Sample/full PDF report generation
├── email.ts            # Resend email sending
├── c2pa.ts             # C2PA verification (c2pa-node integration)
├── video/              # FFmpeg processing (extract-frames.ts)
└── stripe/             # Stripe integration

components/
├── rs/                 # Design system (62+ "forensic instrument" components)
├── landing/            # Landing page components (FreeUploadContainer, LandingClient, etc.)
├── marketing/          # AuditModal, pricing components
├── billing/            # UpgradeButton, OneTimePurchaseButton
├── email/              # React Email templates (SampleReportEmail, MagicLinkEmail)
└── dashboard/          # Dashboard-specific components
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # Project URL (safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Anon key (safe to expose)
SUPABASE_SERVICE_ROLE_KEY=         # Service role (SERVER-SIDE ONLY)

# Google Gemini
GOOGLE_GEMINI_API_KEY=             # Gemini API key (SERVER-SIDE ONLY)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # Publishable key (safe to expose)
STRIPE_SECRET_KEY=                 # Secret key (SERVER-SIDE ONLY)
STRIPE_WEBHOOK_SECRET=             # Webhook signing secret
STRIPE_PRICE_ONE_TIME=             # $29 one-time report Stripe price ID

# Resend
RESEND_API_KEY=                    # Email API key (SERVER-SIDE ONLY)

# Encryption
ENCRYPTION_MASTER_KEY=             # For brand guidelines (SERVER-SIDE ONLY) — not yet used
```

## Testing Checklist (Run After Each Feature)

- [ ] Upload image → verify scores appear
- [ ] Upload video as free user → verify blocked
- [ ] Upload video as paid user → verify 5 frames analyzed (MVP)
- [ ] Hit quota limit (free) → verify upgrade modal
- [ ] Hit quota limit (paid) → verify overage allowed
- [ ] Cross-tenant test → verify can't access other tenant's data
- [ ] Invalid file upload → verify helpful error message
- [ ] Anonymous upload → verify session tracking and scan assignment
- [ ] Email gate → verify shadow user creation and magic link delivery
- [ ] $29 one-time purchase → verify Stripe checkout → webhook → scan.purchased = true
- [ ] Subscription purchase → verify plan applied to tenant

## Database Schema Overview

### Core Tables
- `tenants` - Organizations (stores plan/quota/Stripe IDs, `stripe_metered_item_id` for overage)
- `profiles` - Links auth.users to tenants (role: owner/admin/member)
- `assets` - Uploaded file metadata (path, checksum, size, `session_id` for anonymous)
- `scans` - Analysis records (scores, risk level, status, `risk_profile` JSON blob, `session_id`, `purchased`, `purchase_type`, `share_token`, `share_expires_at`)
- `scan_findings` - Detailed findings (type, severity, description, confidence_score)
- `video_frames` - Frame-by-frame analysis for videos
- `brand_profiles` - Custom brand guidelines (encryption NOT yet implemented)
- `usage_ledger` - Quota tracking (atomic increment)
- `subscriptions` - Stripe subscription cache
- `audit_log` - Security audit trail (append-only)
- `mitigation_reports` - AI-generated remediation guidance (schema exists)
- `referral_events` - Insurance referral tracking (schema exists)
- `tenant_invites` - Team invite tokens (schema exists, `metadata` column confirmed in live DB)

### Pending Schema Drift
Two migrations created but NOT applied to live DB:
- `20260211_add_tenant_invites_metadata.sql`
- `20260211_add_tenant_switch_audit_created_at_index.sql` (CONCURRENTLY — must run outside transaction)

Note: User reported applying these + the Feb 15 migrations (`risk_profile_blob`, `fix_scan_assignment`, `cleanup_shadow_users_rpc`, `enable_realtime_scans`) on Feb 16. Verify in Supabase dashboard if uncertain.

### Every Table Must Have
- `id` (UUID primary key)
- `created_at` (timestamp)
- `tenant_id` (UUID, foreign key, indexed) - *except auth tables*
- RLS policies enabled

## Video Processing Rules

- **Paid tiers only** - Check plan before allowing upload
- **Extract 5 frames (MVP)** - Evenly distributed across video duration. Will increase to 10 post-MVP once cost model validated.
- **Aggregate scores** - Use MAX(all frame scores), not average
- **Storage** - Delete frames after retention period (same as video)
- **Frame limit** - 5 frames for MVP cost efficiency; `extractFrames()` default parameter is 10 for future use

## Quota Enforcement

```typescript
// CORRECT - Atomic server-side check
const { allowed, usage, remaining } = await consumeQuota(tenantId, 1);
if (!allowed && plan === 'free') {
  return res.status(403).json({ error: 'quota_exceeded' });
}
// For paid plans, allow overage (will bill automatically)
```

## Deployment Notes

- **Platform:** Vercel (automatic Next.js optimization)
- **Database:** Supabase (hosted PostgreSQL)
- **CDN:** Vercel Edge Network (automatic)
- **Region:** US East (iad1) - or closest to target users
- **Environment:** Separate env vars for preview vs production

## Known Issues (Current as of Feb 17, 2026)

### Pipeline Unified (Phase A Complete)
Both authenticated and anonymous paths now route through `lib/ai/scan-processor.ts`. C2PA runs for all scans. `/api/analyze` (legacy sync endpoint) has been deleted.

### Data Handoff — Fixed
`GET /api/scans/[id]` now reads the stored `risk_profile` JSONB blob directly. Legacy fallback still exists for pre-blob scans (reconstructs from individual columns). RSFindingsDossier and ProvenanceTelemetryStream now consume real Gemini data.

### Brand Guidelines — Wired (Phase F)
Upload API extracts `guidelineId` from formData, validates tenant ownership, stores `guideline_id` on scan record. Scan processor fetches the guideline and passes it to `analyzeImageMultiPersona()`. Dashboard has guideline selector dropdown (only shows if user has created guidelines). Video pipeline guidelines deferred (needs per-frame prompt injection).

### Phase D Complete (Feb 17, 2026)
- Entitlements enforced in scans-reports drawer (gated findings, sample vs full PDF via `Entitlements.canViewFullReport()`)
- Share button wired: API call → clipboard copy → animated toast
- AuditModal rendering with real Stripe checkout buttons (`OneTimePurchaseButton` + `UpgradeButton`)
- Bulk download/share wired in `RSBulkActionBar`
- Dead code deleted: `ScanResultsWithGate.tsx`, `UpgradeModal.tsx`; design-lab updated to use `AuditModal`

### Phase E Complete (Feb 17, 2026)
- C2PA serial placeholder replaced with runtime extraction + deterministic hash fallback (`lib/c2pa.ts`)
- CLAUDE.md Known Theater section updated — all 6 items resolved
- Video frame count docs aligned with code (5 for MVP)
- FreeForensicReport.tsx cosmetic fix ($49, "50 scans/mo")

### Phase F Complete (Feb 18, 2026)
- Brand guidelines wired end-to-end: upload API validates + stores `guideline_id`, scan processor fetches + passes to Gemini
- Dashboard scanner has guideline selector dropdown (hidden when no guidelines exist)
- Conversion flow docs updated to reflect actual `LandingClient.tsx` redirect behavior
- All three Gemini personas (IP, Safety, Provenance) now receive custom brand rules via `formatGuidelineRules()`

### Phase G Complete (Feb 18, 2026)
- `types/database.ts` drift fixed: added `stripe_payment_intent_id`, `user_id` to ExtendedScan; fixed plan type `'individual'`→`'pro'`; `guideline_id` nullable
- Status API (`/api/scans/[id]/status`) now returns real `risk_profile` blob when scan is complete
- `FreeUploadContainer.tsx` uses real Gemini risk_profile (falls back to constructed one for legacy scans)
- Webhook `listUsers()` hardened: retry profile query after 1s delay, paginated fallback (`perPage: 50`)
- Webhook profile polling increased from 1.5s (3×500ms) to 5s (5×1000ms) for trigger resilience

### Phase H Complete (Feb 18, 2026)
- **Share token validation wired end-to-end**: GET `/api/scans/[id]` validates `?token=` against `share_token` + `share_expires_at`; tokens stripped from response
- **Public shared scan page**: `/scan/[id]?token=` renders `SharedScanView` with `RSRiskPanel`, `RSFindingsDossier`, asset preview, CTA footer; no-token redirects to dashboard
- **ExtendedTenant type sync**: Added 20 missing fields (limits, overage costs, feature flags, Stripe IDs) matching webhook `applyPlanToTenant()`
- **ProvenanceDetails fix**: `hashing_algorithm` now optional (DB default, never explicitly written)
- **Error/not-found pages**: Root `error.tsx`, `not-found.tsx`, dashboard `error.tsx` — all using RS design system components

### Phase I Complete (Feb 19, 2026)
- **Share link bug fixed**: `handleShare` was reading `data.share_token` but PATCH returns `{ scan: updatedScan }` — fixed to `data.scan.share_token`
- **billing.ts `as any` removed**: Cast replaced with `Pick<ExtendedTenant, ...>` for real type safety
- **Soft gate data leak fixed**: `scan_findings` descriptions were returned in full for unauthenticated viewers — now masked with "Unlock full report to view details." (titles/severity preserved as teasers)
- **Provenance masking gap fixed**: `provenance_report.reasoning` was not masked in the soft gate while IP and safety reports were — now masked consistently
- **Supabase types note**: `lib/supabase/types.ts` is stale (still has old column names) — causes `as any` casts across the codebase. Run `supabase gen types typescript` against live DB to regenerate.

### Phase J Complete (Feb 19, 2026)
- **sort_by injection fixed**: `/api/scans/list` now whitelists allowed sort fields (`created_at`, `composite_score`, `risk_level`, `status`) — prevents injection via `.order()`
- **Anonymous quota fail-closed**: `/api/scans/anonymous-quota` now returns `{ allowed: false }` with 503 when quota service errors (was fail-open with `allowed: true`)
- **Process route timing-safe auth**: Service role key comparison uses `crypto.timingSafeEqual()` instead of `===`
- **File size validation**: Both upload endpoints enforce 100MB image / 500MB video limits with 413 response
- **Email validation**: `capture-email` now uses proper regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) instead of simple `@` check
- **SHA-256 checksums**: Upload routes compute real checksums from file buffer instead of storing `'pending'`
- **Error message leak fixed**: Upload and process routes no longer expose raw `error.message` to clients

### Phase K Complete (Feb 19, 2026)
- **Cross-tenant fix**: Guidelines DELETE dependency check now filters by `tenant_id` — was querying all tenants' scans
- **Error detail leaks sealed**: `create-checkout`, `switch-tenant` (×2), `upload` (storage + asset), `anonymous-upload` (storage + asset) no longer expose raw `error.message`/`details`/`code` to clients
- **PII scrubbed from logs**: Removed email addresses from `console.log` in capture-email, webhook (×4), auth actions, auth callback — replaced with user IDs
- **sortOrder validated**: `/api/scans/list` now validates `sort_order` to only accept `'asc'`/`'desc'` (was missed in Phase J sort_by whitelist)
- **Referrer policy**: `/scan/[id]` exports `metadata.referrer = 'no-referrer'` to prevent share token leakage via Referer header

### Phase L Complete (Feb 19, 2026)
- **Scan session hijacking fixed**: `capture-email` now validates `scanId` belongs to current `session_id` before attaching email — was allowing cross-session scan theft
- **UUID validation**: `capture-email` validates `scanId` format (UUID v4 regex) before database queries
- **Anonymous video blocked**: `anonymous-upload` now returns 403 for video uploads — per business model, video analysis requires paid plan
- **Pagination wired**: `/api/scans/list` accepts `page` and `limit` query params, uses `.range()` instead of `.limit(50)`, returns `{ page, limit, hasMore }` metadata

### Phase M Complete (Feb 19, 2026)
- **Free-tier video blocked (authenticated)**: `/api/scans/upload` now checks `plan === 'free'` and returns 403 for video uploads — was only blocked for anonymous users
- **increment_scans_used RPC replaced**: Non-existent RPC call replaced with direct `.update({ scans_used_this_month: used + 1 })` — was silently failing
- **Cookie maxAge reduced**: `magic_auth_email` cookie reduced from 7 days to 24 hours to minimize exposure window
- **Scan processor race guard**: `processScan()` now checks scan status before processing — skips if already in terminal state (`complete`/`failed`) to prevent duplicate analysis
- **Error detail leak sealed**: Upload route `scanError.message` no longer exposed to clients in scan creation failure response

### Phase N Complete (Feb 20, 2026)
- **Stripe webhook idempotency**: Event IDs tracked in-memory Set — duplicate events from Stripe retries are now skipped (prevents double charges, duplicate user creation)
- **NaN-safe pagination**: `parseInt` calls in `/api/scans/list` now have `|| fallback` after radix 10 — prevents `NaN` offset from empty string params
- **JSON.parse safety**: `guidelines/extract` now catches malformed Gemini JSON responses with 422 instead of unhandled exception
- **Security headers**: Added `Permissions-Policy` (camera/mic/geo disabled) and `X-Permitted-Cross-Domain-Policies: none` to `next.config.js`
- **Stripe checkout input validation**: `planId` validated against whitelist (`pro/team/agency`), `interval` validated against `monthly/annual`, price config `details` leak removed
- **guidelineId UUID validation**: Upload route now validates UUID format before querying DB — prevents wasted queries on malformed input
- **PII scrubbed from scan access logs**: `scans/[id]` debug logs no longer expose user IDs, tenant IDs, or scan IDs

### Phase O Complete (Feb 20, 2026)
- **Open redirect fixed (CRITICAL)**: Middleware `next` param and auth callback `next` param now validated — must start with `/` and not `//` to prevent `//evil.com` redirect attacks
- **Webhook metadata validated**: `handleCheckoutCompleted` now validates `scanId` (UUID format) and `purchaseType` (`one_time`/`subscription`) before processing — prevents malformed metadata from corrupting data
- **Cross-Origin-Opener-Policy header**: Added `same-origin` to prevent cross-origin window reference attacks (Spectre-class)
- **Switch-tenant fail-fast**: Missing `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` env vars now throw at module load instead of silently failing at request time
- **Session cookie expiry reduced**: Anonymous session cookie reduced from 30 days to 7 days to minimize exposure window

### Known Tech Debt: `lib/supabase/types.ts`
The `Database` type in `lib/supabase/types.ts` is manually maintained and significantly out of date. The `scans` table still uses old column names (`file_url`, `file_path`, `overall_risk_level`) and is missing all new columns. Multiple tables (`assets`, `scan_findings`, `provenance_details`, `usage_ledger`) are absent entirely. This forces `as any` casts in ~30 locations. **Fix:** Run `npx supabase gen types typescript --project-id <PROJECT_ID> > lib/supabase/types.ts` against the live database to auto-generate correct types.

## Lessons Learned (Updated as we build)

### Step 1: Next.js Initialization (2026-01-03)
- **Tailwind CSS v4 requires `@tailwindcss/postcss`** instead of the old `tailwindcss` PostCSS plugin
- PostCSS config must use `'@tailwindcss/postcss': {}` not `tailwindcss: {}`
- Next.js 16 uses Turbopack by default (much faster builds)
- TypeScript strict mode catches errors early - keep it enabled
- Always use `npm run type-check` before committing

### Step 2: Supabase Setup (2026-01-03)
- **Initial migrations must be run manually in SQL Editor** - Supabase doesn't expose `exec_sql` RPC by default
- **Storage policies require tenant_id from profiles** - Use `auth.uid()` to get user, then lookup `tenant_id`
- **Three separate Supabase clients needed:** browser (anon), server (anon or service role), middleware (session refresh)
- **Service role key bypasses RLS** - Only use for admin operations (Stripe webhooks, background jobs)
- **RLS helper function** - Created `public.user_tenant_id()` (not `auth.` - permission issue) for easy tenant filtering in policies
- **Atomic quota function** - Uses `FOR UPDATE` row locking to prevent race conditions

### Step 3: Authentication Flow (2026-01-03)
- **Server Actions for auth** - signup, login, logout all server-side (secure, no API routes needed)
- **Atomic tenant creation** - Signup creates user + tenant + profile in transaction
- **First user = owner** - Role automatically set to 'owner' for first user in tenant
- **Middleware protects routes** - Auto-redirect to login if accessing /dashboard without auth

### Step 4: Stripe Billing (2026-01-22 - 2026-02-01)
- **5-tier plan config is source of truth** (`lib/plans.ts`) — webhooks sync to tenant record
- **Metered billing uses Stripe Usage Records** — not manual invoice items
- **One-time purchases mark `scan.purchased = true`** — entitlements check this field
- **Overage pricing is deliberately punishing on PRO** ($2.50/scan) to drive TEAM upgrades

### Step 5: Freemium + Magic Links (2026-02-01)
- **Shadow user creation** via `supabase.auth.admin.createUser()` with `email_confirm: false`
- **Magic link** via `supabase.auth.admin.generateLink()` — not the legacy custom `magic_links` table
- **Cookie-based instant access** — `magic_auth_email` httpOnly cookie for UX before email click
- **Scalability issue fixed** — `capture-email/route.ts` now uses `createUser()` + catch instead of `listUsers()`

### Step 6: Risk Model Unification (2026-02-11)
- **Canonical tiers and scoring** in `lib/risk/tiers.ts` and `lib/risk/scoring.ts`
- **40 unit tests** confirm zero level shifts after unification
- **C2PA 5-value fidelity** — verified / caution / untrusted / invalid / missing
- **Do NOT use local threshold constants** — always import from `lib/risk/tiers.ts`

### Step 7: Realtime (2026-02-05)
- **Switched from polling to Supabase Realtime** — polling caused 139GB egress and image flickering
- **Channel subscriptions** in `hooks/useRealtimeScans.ts` for live scan status updates

---

**Last Updated:** 2026-02-20 (Phase O — Open redirect fix, webhook metadata validation, COOP header, env var fail-fast, session expiry reduction)
