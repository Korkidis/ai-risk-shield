# Execution Plan
*Single source of truth. Updated: 2026-03-01 (Full codebase audit, Sprint 5 complete, ship-ready roadmap).*
*If it's not in this file, it's not planned. If it's checked here, it's done.*

## Guiding Principle
We are not adding features. We are completing the transaction.
The measure of "done" is: can someone scan an image, feel scared, pay $29, and get a PDF they can hand to legal — without hitting a single dead end, fake claim, or silent failure?

---

## What's Real (Completed Sprints)

### Phases A-R (Jan-Feb 2026) — Infrastructure
- [x] Pipeline unification (auth + anon → scan-processor.ts)
- [x] Data handoff (RSFindingsDossier, ProvenanceTelemetryStream → real Gemini data)
- [x] Entitlements enforcement, share button, AuditModal, dead code
- [x] C2PA serial fix, brand guidelines wired to Gemini, types drift fix
- [x] Share token validation, public shared scan page, error pages
- [x] Soft gate data leak fix, provenance masking
- [x] 16 phases of security hardening (J through O)
- [x] Revenue hardening — quota reset, usage retry, webhook alerting
- [x] Type safety — Supabase types rebuilt, `as any` 107→8, rate limiting on 6 endpoints

### Sprint 1: Trust + Conversion ✅
- [x] Remove hallucinated claims, wire $29 CTA, refresh hero copy

### Sprint 2: Legibility + Help Page ✅
- [x] WCAG AA contrast, honest help content, trust gate

### Sprint 3: Checkout Compliance ✅
- [x] FTC consent, receipt email, error states, email capture gate

### Sprint 4: Nav + Dark Mode ✅
- [x] ThemeProvider, gray scale inversion, RSLever toggle

### Sprint 5: Craft Polish ✅
- [x] Hex→CSS vars (RSRiskPanel, RSFindingsDossier, RSAnalogNeedle, DashboardEmailGate, dashboard/page, scans-reports/page)
- [x] Atomic rate limits (PostgreSQL FOR UPDATE, replaced JS read-then-write)
- [x] ESLint v9 flat config (eslint.config.mjs, deleted .eslintrc.json)
- [x] prefers-reduced-motion global CSS
- [x] RSBreadcrumb wired to 3 dashboard routes
- [x] JSON-LD structured data (SoftwareApplication schema)
- [x] Global dark mode documented as intentional (ThemeProvider.tsx)

### Earlier Builds (todo.md v1) ✅
- [x] Build 1: Fix anonymous purchase flow + AuditModal lies
- [x] Build 2: Enrich sample PDF with risk_profile blob
- [x] Build 3.1: Route everyone to dashboard (magic link, post-purchase, stubs)
- [x] Build 7.1-7.4: Performance (server/client split, lazy-load, drawer tween)
- [x] S1-S3: Auth-gate process route, listUsers fix, delete debug-provenance

---

## Ship-Ready Sprint Plan (4 Sprints Remaining)

### Sprint 6: Revenue Safety — the money must work
**Branch:** `feat/sprint-6-revenue-safety`
**Priority:** CRITICAL — fixes that prevent lost revenue or broken user access

- [ ] **Apply 3 pending migrations to prod DB**
  - `20260222_failed_usage_reports.sql` (dead-letter queue for Stripe usage retry)
  - `20260224_rate_limits.sql` (rate_limits table + cleanup RPC)
  - `20260228_harden_rate_limits.sql` (atomic check + SECURITY DEFINER hardening)
  - Regenerate `lib/supabase/types.ts` after applying

- [ ] **Move webhook idempotency to DB** (replace in-memory Set)
  - Current: `processedEvents = new Set()` resets on every Vercel redeploy
  - Fix: Check `audit_log` for duplicate `stripe_event_id` before processing
  - Impact: Prevents double charges and duplicate user creation

- [ ] **Require email before anonymous checkout**
  - `create-checkout/route.ts`: return 400 if `customerEmail` is undefined
  - Without email: user pays $29, no account created, no magic link, no access
  - Must reject checkout, not silently create session without email

- [ ] **Track purchased_by user_id on scans**
  - Add `purchased_by` column to scans (nullable UUID, FK to auth.users)
  - Webhook sets it when processing one-time purchase
  - `canViewFullReport()` validates user is purchaser (not just any tenant member)

- [ ] **Fix PDF timestamp** — use `scan.created_at` not `new Date()`
  - `lib/pdf-generator.ts` line ~102, ~549
  - Forensic evidence with wrong dates is worse than no evidence

- [ ] **Add Stripe payment_intent_id to purchase receipt email**
  - `PurchaseReceiptEmail.tsx`: add transaction ID row to receipt table
  - Users need reference numbers for support queries

- [ ] **Add email retry** — 3 attempts with exponential backoff
  - `lib/email.ts`: wrap Resend calls with retry logic
  - Silent email failure means user pays $29 and never gets receipt or magic link

**Done when:** Pay $29 → get receipt with order ID → access report → no duplicates across deploys.

---

### Sprint 7: Trust Claims — the words must be true
**Branch:** `feat/sprint-7-trust-claims`
**Priority:** CRITICAL — a skeptical lawyer (our buyer) will verify every claim

- [ ] **CAI membership: verify or remove**
  - CLAUDE.md says "confirmed real by founder" but CredibilitySection shows badge with no verification link
  - If real: add link to c2pa.org member directory or equivalent
  - If not yet: remove badge entirely (apply when membership is confirmed)

- [ ] **Data retention copy: honest language**
  - Current: "No image data retained after analysis" (CredibilitySection)
  - Reality: 7-day retention (`delete_after` field, upload/route.ts)
  - Fix: "Data retained for 7 days, then permanently deleted" or "Configurable retention (default: 7 days)"

- [ ] **GDPR READY: downgrade or remove**
  - No data export API, no deletion request handler, no DPA
  - Options: remove badge, or change to "GDPR Planned" in small text
  - Add to post-launch roadmap as real work item

- [ ] **Remove C2PA serial placeholder `b4f2...9a11`**
  - RSProvenanceDrawer shows hardcoded fake serial as "Cryptographic Evidence"
  - A lawyer will copy this into their file and it won't match any certificate
  - Fix: use `details?.serial` (already there for valid status), show "Not available" for others

- [ ] **RSProvenanceDrawer: migrate hardcoded hex to CSS variables**
  - `#1A1A1A`, `#EAE6D9`, `#D6CEC1`, `#A19D92` → `var(--rs-*)` tokens
  - Currently breaks in dark mode

- [ ] **Remove navbar search input** (or disable with "Coming soon" tooltip)
  - Accepts text, has no onChange/onSearch handler — pure dead weight
  - A user typing a case ID and getting nothing back loses confidence

- [ ] **Strip nav to reality**
  - Design Lab link: hide from customer-facing nav (internal only)
  - Settings/Bell icons: remove if not functional, or add tooltip "Coming soon"
  - Hardcoded "JD" initials in RSNavbar: show real user initial (already partially fixed per audit)

**Done when:** Every claim on every customer-facing page withstands due diligence.

---

### Sprint 8: Video Pipeline + Guidelines CRUD
**Branch:** `feat/sprint-8-video-guidelines`
**Priority:** HIGH — paid users expect video analysis and working guidelines

- [ ] **Fix video frame extraction race condition**
  - `lib/video/extract-frames.ts`: `filenames` callback populates array, but `end` event may fire before resolution
  - Fix: await frame files actually written, verify frame count matches expected
  - Currently returns empty `FrameResult[]` — video analysis is fully broken

- [ ] **Save video IP/Safety findings from frame analysis**
  - `lib/ai/scan-processor.ts`: video pipeline currently saves only 1 C2PA finding
  - Frame-by-frame Gemini analysis results are scored but findings are discarded
  - Users see high risk score with zero evidence explaining why

- [ ] **Map video C2PA 'error' to 'invalid' in canonical type**
  - scan-processor sets `c2paStatus = 'error'` which isn't in C2PAStatus type
  - Crashes downstream scoring in `lib/risk/tiers.ts`

- [ ] **Wire MagicLinkEmail.tsx React template**
  - Professional React Email template exists but `sendMagicLinkEmail()` sends raw HTML
  - Replace raw HTML in `lib/email.ts` with the React component render

- [ ] **Brand guidelines: wire edit + delete + view detail**
  - `brand-guidelines/page.tsx`: GuidelineCard `onClick={() => {}}` — does nothing
  - Add: click to view/edit, delete with confirmation, API endpoint for DELETE
  - Without this: feature looks polished but is a dead end for paying users

- [ ] **Fix brand_guidelines RLS**
  - S4 from original todo: policies reference `public.users` (doesn't exist), should be `public.profiles`
  - Create migration to fix

**Done when:** Video upload → frame analysis → meaningful findings. Guidelines CRUD works end-to-end.

---

### Sprint 9: Pre-Launch QA + Polish
**Branch:** `feat/sprint-9-prelaunch`
**Priority:** HIGH — final pass before real users

- [ ] **Fix sample PDF finding description leak**
  - Sample mode shows full text of non-hero findings (only hero is truly gated)
  - Mask: show title + severity but blur/truncate descriptions for non-purchased scans

- [ ] **Scan ownership check in create-checkout**
  - Same-tenant users can buy each other's scans
  - Fix: validate `user.id === scan.user_id` for private scans

- [ ] **Stripe price cache TTL** — expire after 24h
  - `lib/stripe/stripe-validate-prices.ts`: cache never expires
  - If Stripe price is deleted, stale cache causes checkout success → webhook failure

- [ ] **Guideline validation: warn if not found**
  - Upload route silently proceeds without guideline if UUID doesn't match
  - User thinks brand rules are being applied when they aren't

- [ ] **Wire real quota display**
  - Sidebar: fetch tenant plan + seat count, replace any remaining hardcoded values
  - Scans-reports header: fetch usage_ledger for current month

- [ ] **Attach sample PDF to magic link email** (if < 5MB)
  - Build 3.2 unchecked item: Resend supports attachments
  - Higher conversion: user sees value before clicking through

- [ ] **ESLint cleanup**
  - Add eslint ignore for `scripts/` and `supabase/functions/`
  - Fix ~10 remaining app-code lint violations

- [ ] **End-to-end smoke tests** (manual or scripted)
  - Free flow: scan → email gate → magic link → dashboard → view results
  - Purchase flow: scan → $29 checkout → webhook → receipt email → PDF download
  - Pro flow: signup → subscribe $49 → upload → findings → share link → recipient views
  - Video flow: paid user → video upload → frame analysis → findings → report
  - Brand flow: create guideline → scan with guideline → verify guideline mentioned in findings

**Done when:** Every user journey works without dead ends, fake data, or silent failures.

---

## Post-Launch Roadmap (After First Paying Customer)

### Wave 1: Observability (Month 1)
- [ ] PostHog analytics dashboard (events already wired)
- [ ] Conversion funnel: scan → email → checkout → PDF download
- [ ] Error alerting: Gemini API outages, Stripe failures, upload errors
- [ ] Customer support: manual receipt resend, scan status lookup

### Wave 2: Batch + Queue (Month 2-3)
- [ ] `scan_batches` + `scan_jobs` tables with `batch_id` on scans
- [ ] Queue workers with `FOR UPDATE SKIP LOCKED` (idempotent claim/process/update)
- [ ] Batch upload UI (drag multiple files, campaign-level reporting)
- [ ] Plan gates: batch features for Team/Agency only

### Wave 3: Collaboration + Reporting (Month 3-4)
- [ ] Annotations/comments on assets
- [ ] Review states (pending → approved → flagged → remediated)
- [ ] Campaign preflight reports (batch risk summary)
- [ ] Legal evidence bundle exports (PDF/CSV/JSON)
- [ ] Artifact/hallucination findings as structured finding types

### Wave 4: SSO + Enterprise Auth (Month 3-4)
- [ ] Okta SAML/OIDC SSO integration (Enterprise tier requirement)
  - Supabase supports SAML via `supabase.auth.signInWithSSO()` (configured per org)
  - Map Okta groups → tenant roles (owner/admin/member)
  - JIT provisioning: first SSO login auto-creates profile + assigns tenant
- [ ] API keys for programmatic access (CI/CD pipeline integration)

### Wave 5: SOC 2 Alignment (Month 4-6)
**Strategy:** Build SOC 2 Type II readiness into every sprint, not as a one-time project.
The audit trail (`audit_log` table) already exists. What's needed:

**Security (Trust Services Criteria — CC6/CC7/CC8):**
- [ ] Access control evidence: log all role changes, permission grants, login events (partially done)
- [ ] Change management: git commit history + PR reviews as evidence (already happening)
- [ ] Logical access: RLS policies + middleware auth as documented controls (already built)
- [ ] Encryption: TLS 1.3 in transit (Supabase/Vercel default), brand profile encryption at rest (schema ready, wire it)
- [ ] Incident response: webhook alerting (Phase P) + defined escalation procedure (document)

**Availability (Trust Services Criteria — A1):**
- [ ] Uptime monitoring: external health check endpoint + Vercel status integration
- [ ] Disaster recovery: Supabase Point-in-Time Recovery enabled (verify plan supports it)
- [ ] Capacity planning: Stripe usage metrics → projected infrastructure needs

**Automated Evidence Generation (for Type II audit window):**
- [ ] `/api/admin/soc2-evidence` endpoint that exports:
  - Active RLS policies per table (query `pg_policies`)
  - Rate limit configuration + enforcement stats
  - Audit log summary (events by type, time range)
  - Active user sessions + role distribution
  - Encryption status per table/column
- [ ] Scheduled evidence snapshots (weekly Vercel Cron → archive to Supabase Storage)
- [ ] Evidence attestation: hash each snapshot for tamper detection

**What we already have that counts as SOC 2 evidence:**
- Append-only `audit_log` table (no update/delete policies) ✅
- RLS on all 18 tables (60+ policies) ✅
- Rate limiting on 6 sensitive endpoints ✅
- Timing-safe auth comparison ✅
- Input validation + error message sanitization ✅
- Webhook failure alerting ✅
- Session cookie expiry (7 days) ✅
- Open redirect prevention ✅

### Wave 6: Integrations + Scale (Month 6+)
- [ ] Slack/Teams notifications on scan completion
- [ ] DAM/MRM connectors (Bynder, Brandfolder)
- [ ] GDPR data subject request API (export, delete, portability)
- [ ] Data residency options (EU region)
- [ ] Brand profile encryption wired (schema ready)
- [ ] Partition audit_log and video_frames at scale

---

## Do Not Build (Scope Guard)

- More security phases (16 is thorough, marginal returns)
- Tax/VAT collection (not until meaningful revenue)
- UI redesign (forensic aesthetic is validated + differentiated)
- Audio pipeline (no customer demand yet)
- Full DAM/MRM rollout (post-launch, customer-driven)
- Analytics before fixing the funnel (fix first, measure second)
- Monitoring/alerting infrastructure beyond email (Sentry etc. — solo founder, keep simple)

---

## Unapplied Migrations Tracker

| Migration | Purpose | Depends On | Applied? |
|-----------|---------|------------|----------|
| `20260211_add_tenant_invites_metadata.sql` | Invite extensibility | Nothing | ❌ |
| `20260211_add_tenant_switch_audit_created_at_index.sql` | Audit query perf (CONCURRENTLY) | Nothing | ❌ |
| `20260222_failed_usage_reports.sql` | Dead-letter queue for Stripe usage retry | Nothing | ❌ |
| `20260224_rate_limits.sql` | Rate limiting table + cleanup RPC | Nothing | ❌ |
| `20260228_harden_rate_limits.sql` | Atomic rate limit + SECURITY DEFINER | `20260224_rate_limits.sql` | ❌ |

**Apply in Sprint 6.** Run in order. `20260211_*_index.sql` uses CONCURRENTLY — must run outside transaction.

---

## Reference: Completed Builds (v1 todo.md)

- [x] Build 1.1: Fix anonymous purchase flow
- [x] Build 1.2: Fix AuditModal lies + styling
- [x] Build 2.1: Enrich sample PDF with risk_profile blob
- [x] Build 3.1: Route everyone to dashboard
- [x] Build 7.1-7.4: Performance optimization
- [x] S1: Auth-gate /api/scans/process
- [x] S2: Fix listUsers() scalability bomb
- [x] S3: Delete /api/debug-provenance

### Still Unchecked from v1 (Absorbed into Sprints 6-9)

| Original Item | Now In |
|---------------|--------|
| Build 3.2: Attach sample PDF to email | Sprint 9 |
| Build 4.1: Wire real quota display (sidebar + scans header) | Sprint 9 |
| Build 5.2: Wire Download/Share/Export buttons | Already done (Phase D) |
| Build 6.1: Delete dead code (UploadContainer, UploadZone) | Sprint 7 (nav cleanup) |
| Build 6.2: Strip nav to reality | Sprint 7 |
| Build 6.4: RS token migration (RSProvenanceDrawer, etc.) | Sprint 7 |
| S4: Fix brand_guidelines RLS | Sprint 8 |
| Build 7.5: prefers-reduced-motion | Done (Sprint 5) |
| Regenerate types.ts from live schema | Sprint 6 (after migration apply) |
