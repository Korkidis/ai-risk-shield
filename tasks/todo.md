# Execution Plan
*Single source of truth. Updated: 2026-02-15.*
*If it's not in this file, it's not planned. If it's checked here, it's done.*

## Guiding Principle
We are not adding features. We are completing the transaction.
The measure of "done" is: can someone scan an image, feel scared, pay $29, and get a PDF they can hand to legal — without hitting a single dead end?

---

## Build Sequence

Each build is a focused session (30 min–2 hrs with agents). The sequence is a dependency chain — each build makes the next one possible or meaningful. Do them in order.

### Build 1: Unblock Revenue
*The $29 purchase is the hottest moment in the funnel. It's broken. Fix it.*

**1.1 — Fix anonymous $29 purchase flow ← START HERE**
**Why:** Anonymous users see "Buy Report ($29)" but `/api/stripe/create-checkout` requires auth. The highest-intent moment in the funnel returns "Please sign in." Revenue is literally blocked.
- [ ] Allow anonymous checkout: create Stripe session using email from `capture-email` cookie, skip auth requirement
- [ ] On Stripe webhook `checkout.session.completed` for one-time: create tenant + profile if shadow user has none, assign scan
- [ ] Post-purchase redirect → `/dashboard/scans-reports` with scan pre-selected (not `/scan/[id]`)
- [ ] Verify end-to-end: anon upload → score → click buy → Stripe → webhook → PDF download works

**Files:** `app/api/stripe/create-checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `components/marketing/AuditModal.tsx`, `components/billing/OneTimePurchaseButton.tsx`
**Depends on:** Nothing.

**1.2 — Fix AuditModal lies** *(can parallelize with 1.1)*
**Why:** The upgrade modal promises "Unlimited Scans", "API Access", "Priority Queue" — none exist. Users who pay based on these will churn.
- [ ] Replace feature list with actual Pro benefits from `lib/plans.ts`: "50 Scans/Month", "5 Full Reports", "30-Day History", "Email Support"
- [ ] Match price exactly to `plans.ts` ($49/mo)
- [ ] Remove any feature that doesn't exist in code

**Files:** `components/marketing/AuditModal.tsx`
**Depends on:** Nothing.

---

### Build 2: Make the PDF Worth $29
*The sample PDF is the teaser that justifies payment. It's using watered-down data.*

**2.1 — Enrich sample PDF with stored risk_profile blob**
**Why:** The sample PDF pulls from thin reconstructed data. The rich Gemini reasoning — teasers, analysis, Chief Officer strategy — never reaches the user.
- [ ] Verify `GET /api/scans/[id]` returns `risk_profile` blob for anonymous scans (Phase A claim)
- [ ] `lib/pdf-generator.ts` sample mode: pull teasers + reasoning from `risk_profile` blob, not synthesized fallbacks
- [ ] Verify sample PDF shows meaningful contrast vs full report (user must see what they're missing)

**Files:** `app/api/scans/[id]/route.ts`, `lib/pdf-generator.ts`
**Depends on:** Build 1 (purchase must work to verify full flow end-to-end)

---

### Build 3: Route to the Product
*Everyone lands on dead ends. The real product page exists — send people there.*

**3.1 — Route everyone to the dashboard**
**Why:** Magic links go to `/scan/[id]` (dead end). Post-purchase goes to a bare page. History/Reports stubs say "Offline." The real page (`/dashboard/scans-reports`) works but nobody gets sent there.
- [ ] Magic link email: change redirect from `/scan/[id]` → `/dashboard/scans-reports?highlight=[scanId]`
- [ ] Post-purchase redirect: `/dashboard/scans-reports?highlight=[scanId]&purchased=true`
- [ ] `/dashboard/history` → 301 redirect to `/dashboard/scans-reports`
- [ ] `/dashboard/reports` → 301 redirect to `/dashboard/scans-reports`

**Files:** `app/api/scans/capture-email/route.ts`, `app/api/stripe/create-checkout/route.ts`, `app/(dashboard)/dashboard/history/page.tsx`, `app/(dashboard)/dashboard/reports/page.tsx`
**Depends on:** Build 1 (purchase redirect is set there, email redirect is updated here)

**3.2 — Make email useful** *(can parallelize with 3.1)*
**Why:** The magic link email currently links to the same dead-end page. It adds zero value.
- [ ] Email CTA links to `/dashboard/scans-reports` (not `/scan/[id]`)
- [ ] Include inline key findings in email body (score, top finding, verdict)
- [ ] Attach sample PDF to email if < 5MB (Resend supports attachments)

**Files:** `components/email/SampleReportEmail.tsx`, `lib/email.ts`, `app/api/scans/capture-email/route.ts`
**Depends on:** 3.1 (link target must be correct first)

---

### Build 4: Show Real Numbers
*Hardcoded quotas and plan info everywhere. A paying customer who sees fake numbers loses trust.*

**4.1 — Wire real quota display**
- [ ] Sidebar: fetch tenant plan + seat count from server, replace hardcoded "PRO PLAN 4/10"
- [ ] Scans-reports header: fetch `usage_ledger` for current month, replace hardcoded "15/50_SCANS"
- [ ] Landing `FreeUploadContainer`: use anonymous quota remaining from `/api/scans/anonymous-upload` response, replace hardcoded "3/3"

**Files:** `components/dashboard/RSSidebar.tsx` (or equivalent), `app/(dashboard)/dashboard/scans-reports/page.tsx`, `components/landing/FreeUploadContainer.tsx`
**Depends on:** Nothing. Can run anytime, but higher value after Builds 1-3 make the product reachable.

---

### Build 5: Stop Lying
*A product that sells trust cannot have fake telemetry.*

**5.1 — Replace scripted telemetry with honest progress**
**Why:** 14 hardcoded messages like "Detecting latent diffusion artifacts (CNN)..." cycle while the real analysis happens server-side. If a legal team notices, credibility is gone.
- [ ] Dashboard scanner (`page.tsx:79-114`): replace scripted messages with real-time status from Supabase Realtime channel (scan-processor already broadcasts progress)
- [ ] Landing `FreeUploadContainer` (`lines 46-59`): same — use Realtime progress, not scripted timer
- [ ] Simpler is fine: "Analyzing image... Checking IP risk... Verifying provenance... Complete." (4 real steps > 14 fake ones)

**Files:** `app/(dashboard)/dashboard/page.tsx`, `components/landing/FreeUploadContainer.tsx`, `lib/realtime.ts`
**Depends on:** Nothing technically. Lower priority than revenue-blocking work.

**5.2 — Wire Download/Share/Export buttons**
**Why:** The most natural post-analysis actions are `console.log` stubs on the scan cards.
- [ ] Download: trigger PDF generation + browser download for selected scan
- [ ] Share: generate `share_token` via PATCH `/api/scans/[id]`, copy shareable URL
- [ ] Export: CSV export of scan metadata for selected scans

**Files:** `app/(dashboard)/dashboard/scans-reports/page.tsx`
**Depends on:** Build 2 (PDF must be rich before download is useful)

---

## Security Fixes (Do alongside builds — don't defer)

### S1 — Auth-gate `/api/scans/process`
**Why:** Anyone who guesses a scan UUID can trigger Gemini reprocessing. DOS vector + burns API credits.
- [ ] Add authentication check OR validate request origin (internal-only header, signed token, etc.)
- [ ] Add idempotency: reject if scan status is already `processing` or `complete`

**Files:** `app/api/scans/process/route.ts`

### S2 — Fix `listUsers()` scalability bomb
**Why:** `capture-email/route.ts` calls `supabase.auth.admin.listUsers()` to check if email exists. Fetches ALL users. Breaks at 10K.
- [ ] Replace with: try `createUser()`, catch "user already exists" error, fall through to `generateLink()`

**Files:** `app/api/scans/capture-email/route.ts`

### S3 — Remove `/api/debug-provenance`
**Why:** Completely open endpoint, no auth, reveals database structure.
- [ ] Delete the route file

**Files:** `app/api/debug-provenance/route.ts`

### S4 — Fix `brand_guidelines` RLS
**Why:** Policies reference `public.users` which doesn't exist (should be `public.profiles`). All brand_guidelines operations silently fail.
- [ ] Create migration: update RLS policies to use `public.profiles`

**Files:** New migration in `supabase/migrations/`

---

## Cleanup (Do when touching related files — not standalone tasks)

- [ ] **Delete `app/api/auth/verify/route.ts`** (67 lines, queries dropped `magic_links` table) — then apply `20260208_cleanup_magic_links.sql`
- [ ] **RSC2PAWidget `caution` state** — add `case 'caution'` to switch in `components/rs/RSC2PAWidget.tsx`
- [ ] **Regenerate `types.ts`** from live schema — current version is missing ~15 columns, references non-existent ones
- [ ] **Fix video frame count** — code says 5 (`scan-processor.ts:112`), docs say 10. Pick one, update both.
- [ ] **Fix C2PA serial** — hardcoded `"C2PA-CERT-884-29-X"` in `lib/c2pa/verify.ts`. Extract from actual cert data.
- [ ] **Resolve retention policy conflict** — PRD says one thing, Subscription Strategy says another

---

## Completed (Reference Only)

- [x] **Pre-Step 0: Schema Drift** — migrations applied (Feb 11)
- [x] **Phase A: Pipeline Unification** — both paths through same processor, risk_profile blob stored, C2PA for anon (Feb 11-14)
- [x] RLS hardening and performance tuning
- [x] C2PA 5-value fidelity in scoring module
- [x] Dynamic email content (risk score + verdict)
- [x] Scanner UI unification ("machined aluminum" aesthetic)
- [x] Stripe billing (5-tier + metered overage)
- [x] Multi-tenancy + hierarchical agencies
- [x] Supabase Realtime (replaced polling, fixed 139GB egress)
- [x] Documentation alignment (Feb 14)
- [x] NORTH_STAR Technical Constraints filled

---

## Not Now (Backlog — revisit after first paying customer)

These are real features that matter, but building them before the core transaction works is infrastructure theater.

- Brand Guidelines wiring to analysis (UI works, analysis ignores them)
- Deep Mitigation Reports (AI remediation guidance)
- Insurance referral integration (partner API, quote generation)
- API access for CMS/DAM integrations
- Bulk upload / batch scan
- White-label reports for agencies
- Enterprise SSO (SAML/OIDC)
- Email sequences (welcome, nurture, upgrade)
- Help & Docs section
- Analytics (Posthog or similar)
- Error monitoring (Sentry)
- Customer support system (Intercom)
