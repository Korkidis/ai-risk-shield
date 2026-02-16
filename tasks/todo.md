# Execution Plan
*Single source of truth. Updated: 2026-02-15 (Build 7 performance added, docs aligned).*
*If it's not in this file, it's not planned. If it's checked here, it's done.*

## Guiding Principle
We are not adding features. We are completing the transaction.
The measure of "done" is: can someone scan an image, feel scared, pay $29, and get a PDF they can hand to legal — without hitting a single dead end?

---

## Build Sequence

Each build is a focused session (30 min–2 hrs with agents). The sequence is a dependency chain — each build makes the next one possible or meaningful. Do them in order.

- [x] Build 1.1: Fix anonymous purchase flow <!-- id: build-1-1 -->
    - [x] 1.1.1 Update `create-checkout` API (Anon support, Validation) <!-- id: 1.1.1 -->
    - [x] 1.1.2 Update `webhook` API (User creation, RPC assignment) <!-- id: 1.1.2 -->
    - [x] 1.1.3 Update UI Components (Purchase Button) <!-- id: 1.1.3 -->
    - [x] 1.1.4 Verification (Test script) <!-- id: 1.1.4 -->

**1.2 — Fix AuditModal lies + styling** *(can parallelize with 1.1)*
**Why:** The upgrade modal promises "Unlimited Scans", "API Access", "Priority Queue" — none exist. Users who pay based on these will churn. The "Upgrade Clearance" button is purple/indigo gradient (`from-indigo-600 via-purple-600`) — legacy styling, not RS design system.
- [x] Replace Pro feature list with actual benefits from `lib/plans.ts`: "50 Scans/Month", "5 Full Reports/Month", "Video Analysis", "30-Day History"
- [x] Remove lies: "Unlimited Forensic Scans", "Priority Analysis Queue", "Team Workspace Access", "API Access for Automations"
- [x] Remove "14-day money back guarantee" claim (zero refund logic exists) — or add disclaimer "contact support"
- [x] Fix `UpgradeButton.tsx` styling: replace `from-indigo-600 via-purple-600 to-indigo-600` + `shadow-indigo-500/40` with RS design tokens (`var(--rs-signal)` or `var(--rs-text-primary)`)
- [x] Fix price: `UpgradeModal.tsx` says $49.99, `AuditModal.tsx` says $49, `plans.ts` says $49.00 — align all to $49/mo (plans.ts is source of truth)
- [x] Left column: change "C2PA Provenance Certificate" → "C2PA Provenance Verification" (we verify, we don't issue certificates)

**Files:** `components/marketing/AuditModal.tsx`, `components/billing/UpgradeButton.tsx`, `components/landing/UpgradeModal.tsx`
**Depends on:** Nothing.

---

### Build 2: Make the PDF Worth $29
*The sample PDF is the teaser that justifies payment. It's using watered-down data.*

**2.1 — Enrich sample PDF with stored risk_profile blob (Option A)**
**Why:** The sample PDF pulled from thin reconstructed data. We now combine real DB findings with profile teasers to make it feel specific without schema changes.
- [x] Verify `GET /api/scans/[id]` returns `risk_profile` blob for anonymous scans (Phase A claim)
- [x] `lib/pdf-generator.ts` sample mode: show 1 "Hero" finding from `scan_findings`, then use `risk_profile` teasers for other categories
- [x] Locked section: show count of additional hidden findings + full‑report CTA
- [x] Verify sample PDF shows meaningful contrast vs full report (user must see what they're missing)

**Files:** `app/api/scans/[id]/route.ts`, `lib/pdf-generator.ts`
**Depends on:** Build 1 (purchase must work to verify full flow end-to-end)

---

### Build 3: Route to the Product
*Everyone lands on dead ends. The real product page exists — send people there.*

**3.1 — Route everyone to the dashboard**
**Why:** Magic links go to `/scan/[id]` (dead end). Post-purchase goes to a bare page. History/Reports stubs say "Offline." The real page (`/dashboard/scans-reports`) works but nobody gets sent there.
- [x] Magic link email: change redirect from `/scan/[id]` → `/dashboard/scans-reports?highlight=[scanId]`
- [x] Post-purchase redirect: `/dashboard/scans-reports?highlight=[scanId]&purchased=true`
- [x] `/dashboard/history` → 301 redirect to `/dashboard/scans-reports`
- [x] `/dashboard/reports` → 301 redirect to `/dashboard/scans-reports`
- [x] `scans-reports/page.tsx`: Handle `highlight` param (auto-select scan)
- [x] `scans-reports/page.tsx`: Handle `verified=true` param (trigger `/api/scans/assign-to-user`)

**Files:** `app/api/scans/capture-email/route.ts`, `app/api/stripe/create-checkout/route.ts`, `app/(dashboard)/dashboard/history/page.tsx`, `app/(dashboard)/dashboard/reports/page.tsx`
**Depends on:** Build 1 (purchase redirect is set there, email redirect is updated here)

**3.2 — Make email useful** *(can parallelize with 3.1)*
**Why:** The magic link email currently links to the same dead-end page. It adds zero value.
- [x] Email CTA links to `/dashboard/scans-reports` (not `/scan/[id]`)
- [x] Include inline key findings in email body (score, top finding, verdict)
- [ ] Attach sample PDF to email if < 5MB (Resend supports attachments)

**Files:** `components/email/SampleReportEmail.tsx`, `lib/email.ts`, `app/api/scans/capture-email/route.ts`
**Depends on:** 3.1 (link target must be correct first)

---

### Build 7: Performance Optimization
*Reduce hydration cost and avoid layout thrash on core flows.*

**7.1 — Split landing page into server + client**
- [x] `app/page.tsx`: server component
- [x] `components/landing/LandingClient.tsx`: contains upload/results state only

**7.2 — Remove scan card layout thrashing**
- [x] Remove `layout` from scan card `motion.div` in `scans-reports` grid
- [x] Keep `AnimatePresence` only for actual enter/exit transitions

**7.3 — Lazy-load below-the-fold landing sections**
- [x] `MarketExposure`, `HowItWorks`, `SubscriptionComparison`, `CredibilitySection`, `Footer` via `next/dynamic`

**7.4 — Drawer transition cost**
- [x] Replace spring drawer with tween/ease-out transition

**7.5 — Reduce motion for accessibility**
- [ ] Honor `prefers-reduced-motion` in RS animated components

**Files:** `app/page.tsx`, `components/landing/LandingClient.tsx`, `app/(dashboard)/dashboard/scans-reports/page.tsx`, `components/landing/*`, `components/rs/*`
**Depends on:** Nothing.

---

### Build 4: Show Real Numbers
*Hardcoded quotas and plan info everywhere. A paying customer who sees fake numbers loses trust.*

**4.1 — Wire real quota display**
- [ ] Sidebar: fetch tenant plan + seat count from server, replace hardcoded "PRO PLAN 4/10"
- [ ] Scans-reports header: fetch `usage_ledger` for current month, replace hardcoded "15/50_SCANS"
- [x] Landing `FreeUploadContainer`: use anonymous quota remaining from `/api/scans/anonymous-quota` response, replace hardcoded "3/3"

**Files:** `components/dashboard/RSSidebar.tsx` (or equivalent), `app/(dashboard)/dashboard/scans-reports/page.tsx`, `components/landing/FreeUploadContainer.tsx`
**Depends on:** Nothing. Can run anytime, but higher value after Builds 1-3 make the product reachable.

---

### Build 5: Stop Lying
*A product that sells trust cannot have fake telemetry.*

**5.1 — Replace scripted telemetry with honest progress**
**Why:** 14 hardcoded messages like "Detecting latent diffusion artifacts (CNN)..." cycle while the real analysis happens server-side. If a legal team notices, credibility is gone.
- [x] Dashboard scanner (`page.tsx:79-114`): replace scripted messages with real-time status from Supabase Realtime channel (scan-processor already broadcasts progress)
- [x] Landing `FreeUploadContainer` (`lines 46-59`): same — use Realtime progress, not scripted timer
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

### Build 6: Refactor — Clean the House
*Not a standalone refactor. This is everything that doesn't fit naturally into Builds 1-5 but still needs doing. Dead code, nav lies, hardcoded strings, legacy styles. Do it as one focused sweep after the product works.*

**6.1 — Delete dead code**
- [ ] Delete `components/upload/UploadContainer.tsx` (legacy styles, zero imports)
- [ ] Delete `components/upload/UploadZone.tsx` (same legacy family, zero imports)
- [ ] Delete `app/(dashboard)/dashboard/design-lab/page.v1.tsx` if it exists (old variant)

**6.2 — Strip nav to reality**
**Why:** Users click "History" and get "Under Construction." That's a trust-killer after paying $29.
- [ ] `RSSidebar.tsx`: Remove or hide nav links for History, Reports, Design Lab, Brand Guidelines
- [ ] Keep only: Scanner, Scans & Reports, Help (if populated)
- [ ] `RSNavbar.tsx`: Remove hardcoded "JD" initials — show real user initial or nothing
- [ ] `RSNavbar.tsx`: Remove hardcoded "online" status indicator

**6.3 — Fix hardcoded plan/quota strings in nav**
*(Build 4 wires the real data. This task swaps the hardcoded strings for the wired values.)*
- [ ] `RSSidebar.tsx`: Replace hardcoded "PRO PLAN" and "4/10 seats" with tenant data (or remove if not wired yet)

**6.4 — RS token migration (low priority, cosmetic)**
- [ ] `RSAuxiliaryDial.tsx`: Replace inline hex (#1A1A1A, #EAE6D9, #D6CEC1, #333, #555, #666, #888, etc.) with `var(--rs-*)` tokens
- [ ] `RSProvenanceDrawer.tsx`: Replace mixed inline hex (#1A1A1A, #D6CEC1, #EAE6D9, #A19D92) with RS tokens
- [ ] `RSStatusIndicator.tsx`: Replace inline hex status colors with RS tokens

**Files:** `components/upload/UploadContainer.tsx`, `components/upload/UploadZone.tsx`, `components/rs/RSSidebar.tsx`, `components/rs/RSNavbar.tsx`, `components/rs/RSAuxiliaryDial.tsx`, `components/rs/RSProvenanceDrawer.tsx`, `components/rs/RSStatusIndicator.tsx`
**Depends on:** Builds 1-5 complete (clean up after the product works, not before). 6.3 depends on Build 4 (quota wiring).

---

## Security Fixes (Do alongside builds — don't defer)

### S1 — Auth-gate `/api/scans/process`
**Why:** Anyone who guesses a scan UUID can trigger Gemini reprocessing. DOS vector + burns API credits.
- [x] Add authentication check OR validate request origin (internal-only header, signed token, etc.)
- [x] Add idempotency: reject if scan status is already `processing` or `complete`

**Files:** `app/api/scans/process/route.ts`

### S2 — Fix `listUsers()` scalability bomb
**Why:** `capture-email/route.ts` calls `supabase.auth.admin.listUsers()` to check if email exists. Fetches ALL users. Breaks at 10K.
- [x] Replace with: try `createUser()`, catch "user already exists" error, fall through to `generateLink()`

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
- Error monitoring (Sentry)
- Customer support system (Intercom)

---

## Build 7: Performance <!-- id: build-7 -->
*High-impact, low-risk optimizations to fix sluggishness.*

**7.1 — Split Landing Page (Server + Client)**
**Why:** `page.tsx` is fully client-side, causing massive hydration cost.
- [x] Convert `app/page.tsx` to Server Component
- [x] Move upload/results state to `components/landing/LandingClient.tsx`
- [x] Keep static sections (Hero text, MarketExposure, Footer, etc.) server-side

**7.2 — Optimize Scans/Reports Page**
**Why:** Unnecessary Layout Thrashing on every interaction.
- [x] Remove `layout` prop from `ScanCard` motion divs
- [x] Review `AnimatePresence` usage to minimize reflows

**7.3 — Further Optimizations**
- [x] Lazy-load below-the-fold landing sections (`MarketExposure`, `HowItWorks`, etc.)
- [x] Replace spring physics with tween/ease-out in drawer
- [x] Add `@next/bundle-analyzer` to `next.config.js`
- [ ] Add `prefers-reduced-motion` support to key animations
