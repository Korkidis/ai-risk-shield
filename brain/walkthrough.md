# Sprint 7-9 Walkthrough

## Sprint 7 — UI Coherence (`4950eb1`)
UnifiedScanDrawer, ScanCard extraction, trust claims, detail fetch, lint clean.

## Sprint 8 — Scans Page Fixes (`79e1d44` + `665526c`)
| Item | Implementation |
|------|---------------|
| Real delete | `handleDrawerDelete` → `DELETE /api/scans/${id}` + optimistic UI |
| Server search | List route: UUID → `eq`, filename → post-query filter |
| Server sort/filter | `sort_by`/`sort_order`/`risk_level` params, sort dropdown |
| Realtime refetch | `handleScanUpdate` fetches detail on `status === 'complete'` |
| Video risk_profile | Structured blob matching image schema, saved to DB |
| Empty states | Upload CTA (zero scans) + Clear Filters (no results) |
| Stabilization | Lightweight list query (removed heavy joins), better error visibility |

## Sprint 9 — Mitigation Report Pipeline

### 9.1 API Route
[mitigation/route.ts](file:///Users/lastknowngood/Documents/Projects/ai-risk-sheild/app/api/scans/[id]/mitigation/route.ts)

`POST /api/scans/[id]/mitigation` with 5 guardrails:
1. **Idempotency** — returns existing `complete` (200) or `processing` (202) report
2. **Failure handling** — always sets `status='failed'` on Gemini errors
3. **Atomic credits** — `consume_quota` RPC with direct-update fallback
4. **Schema alignment** — Gemini prompt produces `MitigationReportContent` schema
5. **API contract** — `{ code, message, report?, cached?, creditsRemaining? }`

### 9.2 Drawer CTA Wiring
[page.tsx](file:///Users/lastknowngood/Documents/Projects/ai-risk-sheild/app/(dashboard)/dashboard/scans-reports/page.tsx#L715-L753) — Optimistic UI: immediately shows `processing` state, merges completed report, handles 202/402/errors with toast feedback.

### 9.3 Report Display
[UnifiedScanDrawer.tsx](file:///Users/lastknowngood/Documents/Projects/ai-risk-sheild/components/dashboard/UnifiedScanDrawer.tsx#L449-L548) — Renders when `latestMitigation.status === 'complete'`:
- Executive summary with decision badge (clear/watch/hold/block)
- Domain analyses (IP, Safety, Provenance) with severity + exposures
- Mitigation action plan (priority, domain, owner, effort, verification)
- Residual risk with publish decision + conditions

## Verification

| Check | S7 | S8 | S9 |
|-------|----|----|-----|
| `tsc --noEmit` | ✅ | ✅ | ✅ |
| ESLint errors | 0 | 0 | 0 (Excluding legacy `any` types) |

---

## Sprint 9 — Pre-Launch QA + Polish
*(Follow-on to Mitigation Report Pipeline)*

### 9.4 Bug Fixes & Enforcements
- **PDF Finding Leak Fix:** Masked non-hero sample finding descriptions in `lib/pdf-generator.ts` to prevent data leaks for anonymous users.
- **Scan Ownership Check:** Added strict `session_id` ownership checks in `api/stripe/create-checkout/route.ts` to prevent cross-tenant/cross-user purchase exploitation.
- **Stripe Cache TTL:** Verified and tuned standard price caching logic.
- **Guideline Validation:** Ensured `api/scans/upload/route.ts` warns or handles unresolvable UUID guidelines appropriately.

### 9.5 Quota & Notification Wiring
- **UI Quota Sync:** Exposed real-time `scansUsed / monthlyScanLimit` inside the `TenantPlanBadge` (sidebar) and Scans & Reports header utilizing existing `billing.ts` action and updated DB schema columns.
- **Sample PDF Magic Link Attachment:** Upgraded `api/scans/capture-email/route.ts` to generate the PDF buffer `< 5MB` and pass it to Resend in `sendSampleReportEmail` along with the authentication link.

### 9.6 ESLint & Stability
- Refactored `useRealtimeScans.ts` to solve critical React strict mode side-effects (cannot access ref values over ongoing renders, exhaustive dependency arrays).
- Refactored `RSTelemetryPanel.tsx` preventing cascading re-renders caused by synchronous `setState` in tight initial `<boot|scanning|grid>` loops.
- `tsc --noEmit` clears fully. Smoke test scripts confirm mitigation + tenant changes are active in Postgres schema.

## Sprint 10 — Quota Coherence + Flow Hardening

### 10.x Follow-up Fixes (Applied)
- **Atomic scan usage:** moved completion-time increment to `increment_tenant_scan_usage` RPC in `lib/ai/scan-processor.ts` and anonymous merge path in `app/api/scans/assign-to-user/route.ts`.
- **Anonymous quota correctness:** `checkAnonymousQuota` now derives both session/IP counts from `scans` rows (`session_id` + `ip_hash`) and excludes `status='failed'` for both checks.
- **Bulk share robustness:** bulk share now uses `Promise.allSettled`, copies real tokenized share URLs, and reports success/failure counts accurately.
- **Mitigation PDF integrity label:** checksum label now matches implementation (`FNV1A64`) instead of `SHA-256`.

### Migration
- Added migration: `supabase/migrations/20260302_atomic_quota_and_anon_ip_hash.sql`
  - Adds `scans.ip_hash`
  - Adds `increment_tenant_scan_usage(uuid, integer)` SECURITY DEFINER function

# Refactoring Pricing & Upgrade Flow Walkthrough

## Accomplishments
* **Persona-Aware Plans Page:** Rebuilt `/pricing` into a dynamic Plans page with a persona switcher (Individuals & Teams vs. Scale Operations) and a billing interval toggle.
* **Component Redesign:** Upgraded `PricingCard` to dynamically render rich benefits, FAQs, and appropriate Calls To Action using decoupled marketing logic.
* **Marketing Data Layer:** Abstracted marketing content away from the `lib/plans.ts` source of truth by introducing `lib/marketing/plans-content.ts` and an intent parser in `lib/marketing/plans-intent.ts`.
* **Normalized Auth Intent:** Upgraded `/login` and `/register` flows to carry URL parameters (`plan`, `interval`, `persona`, `source`) through the authentication process. Users correctly land on their intended target upon successful login/registration. Deleted redundant `/signup` route.
* **Modal Refactoring:** Replaced modal-based subscription upgrade triggers in `AuditModal` and Dashboard elements (e.g. `UnifiedScanDrawer`) with route-based intent links directly to the new Plans page. Verified the distinct one-time mitigation purchase modal functions properly.
## Bug Fixes (Post-Refactor)
* **Unauthenticated Checkout**: Updated `create-checkout/route.ts` to return `401 Unauthorized` instead of `400 Bad Request` when anonymous users lack an email, allowing `pricing/page.tsx` to correctly catch the error and redirect to `/register` with preserved intents.
* **Modal Re-Routing**: Replaced deprecated `setShowAuditModal` triggers in the dashboard (video upload paywall, findings upsell, quota exhaustion banner) with route-based deep links to `/pricing?source=...&plan=...`.
* **Signup Normalization**: Replaced legacy `/signup` links in `AnonymousScanNavbar.tsx`, `robots.ts`, and `middleware.ts` with `/register`. Added a `next.config.js` compatibility redirect for `/signup` to avoid breaking existing external or missed internal links.
* **Homepage Pricing Alignment**: Updated Desktop and Mobile specs in `SubscriptionComparison.tsx` to reflect actual current plans (Free, Pro, Team) and wired CTAs to `/pricing?plan=...` intent routes instead of dead-ends.
* **Linting**: Fixed the `prefer-const` lint error in `plans-intent.ts`.

## Testing & Validation
1. **Code Consistency:** Ran `npm run type-check` and resolved TypeScript errors stemming from the removal of deprecated modal functionality. The build passes all type checks perfectly.
2. **Auth Routing:** Verified that navigating to `/register` or `/login` with target parameters correctly configures the internal `nextUrl` for the post-authentication webhook redirect.
3. **Analytics Events:** Ensured `trackEvent` fires at strategic points across client components (page view, plan selection, enterprise inquiry).
4. **Checkout Edge Cases:** Confirmed that the `/api/stripe/create-checkout` Stripe endpoint preserves state parameters and attaches them to `cancelUrl`, returning users to the exact persona/plan state if they cancel a transaction.

## QA Matrix (Pricing & Upgrade Flow)
| Scenario | Expected Route | Expected State | Validation |
| :--- | :--- | :--- | :--- |
| **Logged-out Subscribe** | `/pricing` -> `/register` | Preserved intent (`?plan=pro&interval=monthly`) | **PASS** (401 triggers redirect correctly) |
| **Logged-in Subscribe** | `/pricing` -> Checkout | Initiates Stripe session for selected plan | **PASS** |
| **Quota Banner Upgrade** | `/dashboard/scans-reports` -> `/pricing` | `?source=dashboard_banner&plan=pro` | **PASS** (AuditModal trigger removed) |
| **Video Upload Upgrade** | `/dashboard` -> `/pricing` | `?source=dashboard_video_upload&plan=pro` | **PASS** (AuditModal trigger removed) |
| **Findings Page Upgrade** | `/dashboard?scan=...` -> `/pricing` | `?source=dashboard_findings&plan=pro&scanId=...` | **PASS** (AuditModal trigger removed) |
| **Scan-Specific Remediation** | `/dashboard?scan=...` -> Modal | Opens Mitigation Purchase modal (One-time $29) | **PASS** (Mitigation intent preserved) |
| **Legacy /signup Redirect** | `/signup?plan=pro` -> `/register` | `?plan=pro` (307 redirect preserves query) | **PASS** (Handled in `next.config.js`) |

## Consumption-Based Pricing Shift
Following the persona-aware refactor, the pricing and marketing presentation was shifted from a traditional feature-gating model to a **"Consumption-Based Base Commitment"** model. This is purely a marketing and UX framing change, avoiding any disruption to the underlying Stripe or `lib/plans.ts` enforcement logic.
* **`lib/marketing/plans-content.ts`**: Updated the central marketing dictionary to include `baseCommitment`, `effectiveRate` (e.g. `$0.98 / scan`), and `overageRate` strings mapped to existing pricing realities.
* **`SubscriptionComparison.tsx`**: Updated the homepage pricing comparisons to clearly visualize base commitments vs overages, and added a striking "Value Anchor" callout comparing a $3,500 legal dispute to the $0.98 scan cost.
* **`PricingCard.tsx`**: Removed the traditional `/mo` price tag from paid plans and replaced it with prominent Base Commitment typography, further spelling out the effective per-scan rate.
* **`TenantPlanBadge.tsx`**: Upgraded the dashboard sidebar usage badge to proactively detect `status.scansUsed >= monthlyScanLimit`. If overage is triggered, it renders a flashing warning with contextual upsell copy (e.g., "Upgrading your base commitment to Team cuts per-scan cost by 50%").
