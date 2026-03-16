# Execution Plan
*Single source of truth. Reality audit updated: 2026-03-06.*
*If it's not in this file, it's not planned. Launch status is based on current repo state, not prior checklist assumptions.*

## Guiding Principle
We are not adding features. We are completing the transaction.
The measure of "done" is: can someone scan an image, feel scared, pay $29, and get a PDF they can hand to legal, without dead ends, fake claims, or silent failures?

## Active Session: AI Content Governance MVP

- [x] Write mini-spec for the governance hub + live risk index widget
- [x] Create typed governance content/data model for homepage and crawlable guides
- [x] Replace landing `MarketExposure` with a data-backed AI risk index section
- [x] Add first crawlable `AI Content Governance` hub + guide pages with metadata/schema
- [x] Add sitemap/robots support for the new marketing routes
- [x] Validate touched surfaces with targeted lint + type-check

### Review
- Added a typed governance data layer powering the homepage index, hub page, guide pages, and sitemap.
- Reworked the landing governance section into three JTBD-focused rows plus a secondary CTA to the hub.
- Added `/ai-content-governance` plus six guide pages with page-specific metadata and schema.
- Added root metadata improvements plus `robots.ts` and `sitemap.ts` for crawlability.
- Simplified the hub layout by promoting mitigation/control-stack guidance into its own sixth tile and moving the public lawsuit / standards links into a cleaner watch section.
- Fixed the shared header so off-home navigation routes correctly back to homepage anchors and the scanner CTA never becomes a dead button.
- Added explicit source anchors and related-guide internal links so the governance pages read like authoritative content assets, not isolated landing pages.
- Targeted ESLint and project type-check passed.
- `next build` was blocked in sandbox because `next/font` could not fetch Google Fonts.

## Status Legend
- `DONE`: Implemented in repo and aligned with the requirement.
- `PARTIAL`: Implemented, but incomplete or not yet at launch quality.
- `VERIFY-IN-PROD`: Code exists, but final status depends on production DB/runtime validation.

---

## Launch Audit (Sprints 6-9)

### Sprint 6: Revenue Safety

- `DONE` Apply launch-critical migrations + regenerate Supabase types
  - Production object-level verification completed (functions, grants, columns, indexes, RLS).
  - Supabase types regenerated from linked production project and type-check passes.

- `DONE` Move webhook idempotency to DB
  - Webhook checks `audit_log` for existing `stripe_event_id` before processing.

- `DONE` Require email before anonymous checkout
  - Checkout returns `400` when anonymous email is missing.

- `DONE` Track `purchased_by` user_id on scans
  - Webhook writes `purchased_by`; entitlement logic uses purchaser-aware checks.
  - Production column/index presence verified.

- `DONE` Fix PDF timestamp to `scan.created_at`
  - Forensic report header/footer date uses scan creation timestamp.

- `DONE` Add `payment_intent_id` to purchase receipt email
  - Receipt template supports transaction ID and webhook passes Stripe payment intent.

- `DONE` Add email retry (3 attempts with backoff)
  - Resend calls wrapped in retry helper with exponential backoff.

### Sprint 7: Trust Claims

- `DONE` CAI membership claim cleaned (verify-or-remove)
  - CAI badge/claim removed from landing trust section.

- `DONE` Data retention copy made honest
  - Landing trust copy states 7-day retention.

- `DONE` GDPR claim downgraded
  - Landing badge/copy is now `GDPR PLANNED`.

- `DONE` Remove hardcoded C2PA serial placeholder
  - Provenance drawer uses dynamic serial (`details?.serial`) with safe fallback.

- `DONE` RSProvenanceDrawer color token cleanup
  - Component now uses CSS variables instead of old hardcoded hex palette.

- `DONE` Remove dead navbar search input
  - Navbar uses branding label; dead input removed.

- `DONE` Strip nav to reality
  - No hardcoded `JD`; user initials are dynamic.
  - No dead settings/bell controls in active navbar.
  - Design Lab is not in primary customer nav.

### Sprint 8: Video Pipeline + Guidelines CRUD

- `DONE` Fix video frame extraction race condition
  - Frame existence is verified before resolve, with retry fallback.

- `DONE` Persist video IP/Safety findings
  - Video findings now include IP/Safety evidence, not just provenance.

- `DONE` Map video C2PA `error` behavior to canonical type
  - Failure path maps to canonical `invalid` for downstream scoring compatibility.

- `DONE` Wire `MagicLinkEmail.tsx` template in mail sender
  - Magic link email uses React template via `react` payload.

- `PARTIAL` Brand guidelines edit/delete/view detail
  - Edit + delete + API endpoints are live.
  - Dedicated view-detail UX is still limited/non-distinct.

- `DONE` Fix `brand_guidelines` RLS
  - Production policies verified active for authenticated tenant-scoped access via `user_tenant_id()`.

### Sprint 9: Pre-Launch QA + Polish

- `DONE` Fix sample PDF finding-description leak
  - Sample mode masks/truncates finding descriptions and mitigation details.

- `DONE` Scan ownership check in checkout
  - Checkout validates requester owns the scan (no cross-user purchase in same tenant).

- `DONE` Stripe price cache TTL (24h)
  - Price validation cache expires every 24 hours.

- `DONE` Guideline validation warning when missing
  - Upload route warns and proceeds without guideline when UUID not found.

- `PARTIAL` Wire real quota display
  - Sidebar/header use live tenant counters.
  - Audit requested `usage_ledger` parity for all displays; confirm and unify source of truth.

- `DONE` Attach sample PDF to magic link email (<5MB)
  - Email capture path generates and conditionally attaches sample PDF.

- `PARTIAL` ESLint cleanup
  - Lint still fails with significant app-code violations.

- `PARTIAL` End-to-end smoke tests
  - Basic smoke script exists.
  - Full launch-journey E2E coverage (free/purchase/pro/video/guidelines) still not complete.

---

## Sprint 10 Reconciliation (Documented)

This section captures post-audit Sprint 10 work that landed after the original Sprint 6-9 planning cycle.

### Sprint 10.0 Core Execution Order (Backend-First)

- `DONE` Step 1: Server unlock contract
  - `capture-email` persists `email` to `scans.email`.
  - Email persistence failure is now fatal (`500`), not silent.
  - `/api/scans/[id]` masking contract is aligned with the new model (`scan.email` unlocks full payload).

- `DONE` Step 2: Entitlements refactor
  - `canViewScanReport` is the primary entitlement path.
  - Same-tenant authenticated users are no longer blocked by free-plan logic.
  - `canViewFullReport` remains as backward-compat alias.

- `DONE` Step 3: PDF/report gating
  - In-app downloads use full report mode (`isSample=false`).
  - `isSample=true` remains limited to sample email flow.
  - Report page uses `canViewScanReport`.

- `DONE` Step 4: Mitigation purchase semantics
  - Mitigation checkout path exists (`purchaseType='mitigation'`).
  - Webhook validates mitigation type and inserts `mitigation_reports` with required `advice_content`.
  - Audit modal is repurposed for mitigation purchase with scan context props.
  - `mitigation_purchased=true` return path is now handled in dashboard with generation trigger + URL cleanup.
  - Return path includes bounded retry/backoff on transient `402` (webhook lag) to avoid lost post-checkout execution.

- `DONE` Step 5: Atomic mitigation usage RPC hardening
  - `increment_tenant_mitigation_usage` added with hardened `SECURITY DEFINER` pattern.

- `PARTIAL` Step 6: Drawer entitlement cleanup
  - Drawer uses `canViewScanReport`, provenance baseline is tied to scan-report access, and `onUnlock` opens mitigation modal.
  - Download label is `Export_Dossier`.
  - Deprecated props (`canViewFull`, `canViewTeaser`) remain for backward compatibility; cleanup is still pending.

- `DONE` Step 7: Insurance referral deferred
  - `referral_events` remains deferred and is not a launch dependency.

### Sprint 10.5b Post-Review Fixes

- `DONE` Fix A: Webhook mitigation whitelist (`mitigation` accepted).
- `DONE` Fix B: Webhook mitigation insert includes required `advice_content`.
- `DONE` Fix C: Pending-row generation path
  - Route supports `pending -> processing` with CAS.
  - Purchased-return URL path now triggers generation automatically.
  - UI refreshes canonical server row on `202` and does not consume the URL param until success/exhaustion.
- `DONE` Fix D: Anonymous post-email unlock ternary in dashboard path.
- `DONE` Fix E: Mitigation usage migration hardened (`search_path`, guards, grants).
- `DONE` Fix E2: Types updated (`increment_tenant_mitigation_usage` returns number).
- `DONE` Fix F: Email persistence failure is blocking/fatal.

### Sprint 10.5c-10.5d Atomic Concurrency

- `DONE` Atomic mitigation quota RPC (`consume_mitigation_quota`) added and typed.
- `DONE` Mitigation route uses single atomic quota RPC (no read-then-write TOCTOU).
- `DONE` CAS enforcement for pending/failed status transitions in mitigation route.
- `DONE` Quota boundary fixed for `p_amount > 1` (`used + amount > limit`).

### Sprint 10 Commit References

- `dcc603b` Sprint 10 flow gap closures and mitigation exports
- `8f3a118` Sprint 10.1 canonical workspace routing
- `eabcdb8` Sprint 10.1 dashboard restoration + unified drawer/entitlements
- `72d205e` Mitigation purchase flow + entitlements + drawer refinements
- `7578246` Atomic mitigation credits, CAS enforcement, post-review fixes

---

## Current Launch Blockers

- `PARTIAL` Complete brand-guideline detail UX (beyond edit/delete).
- `PARTIAL` Finish lint cleanup to an agreed release gate.
- `PARTIAL` Run and document full launch E2E test matrix in staging/prod-like environment.
- `PARTIAL` Run production mitigation purchase return-path test and capture evidence (logs + row transitions).

---

## Ordered Next Tasks (Technical Dependency + Priority)

### P0 (Launch-Critical)
1. End-to-end launch validation
   - Re-run free, purchase, pro, video, and mitigation purchased paths.
   - Add explicit regression for "pending mitigation after Stripe webhook" scenario.
2. Production evidence capture
   - Capture one real mitigation purchase flow trace (checkout -> webhook -> return URL -> report state transition).
   - Capture API logs for retry/backoff path (`402` transient -> success/202) and attach to launch notes.

### P1 (Pre-Launch Quality)
1. Lint cleanup to release threshold.
2. Brand guideline detail UX completion (view-detail parity with edit/delete).

### P2 (Next Build Wave: Bulk/Batch Upload Assets)
1. Create `scan_batches` + `scan_jobs` schema (`batch_id` on scans).
2. Add queue worker claim/process loop with `FOR UPDATE SKIP LOCKED`.
3. Implement batch upload API contract (multipart list + async job creation).
4. Build batch upload UI (multi-file drag/drop + campaign-level progress/state).
5. Add plan gates for batch features (Team/Agency).

---

## Post-Launch Roadmap (After First Paying Customer)

### Wave 1: Observability (Month 1)
- [ ] PostHog analytics dashboard
- [ ] Conversion funnel (scan -> email -> checkout -> PDF download)
- [ ] Error alerting (Gemini, Stripe, upload failures)
- [ ] Customer support tooling (receipt resend, scan status lookup)

### Wave 2: Batch + Queue (Month 2-3)
- [ ] `scan_batches` + `scan_jobs` tables with `batch_id` on scans
- [ ] Queue workers with `FOR UPDATE SKIP LOCKED` for batch scan processing
- [ ] Batch upload UI (multi-file + campaign-level reporting)
- [ ] Plan gates for batch features (Team/Agency)

### Wave 3: Collaboration + Reporting (Month 3-4)
- [ ] Annotations/comments on assets
- [ ] Review states (pending -> approved -> flagged -> remediated)
- [ ] Campaign preflight reports
- [ ] Legal evidence bundle exports (PDF/CSV/JSON)
- [ ] Structured artifact/hallucination findings

### Wave 4: SSO + Enterprise Auth (Month 3-4)
- [ ] Okta SAML/OIDC SSO
- [ ] Group-to-role mapping (owner/admin/member)
- [ ] JIT provisioning
- [ ] API keys for programmatic access

### Wave 5: SOC 2 Alignment (Month 4-6)
- [ ] Access-control evidence for role/permission/login events
- [ ] Incident response procedure documentation
- [ ] Uptime monitoring + health checks
- [ ] Disaster recovery verification (PITR)
- [ ] Capacity planning metrics
- [ ] `/api/admin/soc2-evidence` export endpoint
- [ ] Weekly evidence snapshots + tamper-evident hashes

### Wave 6: Integrations + Scale (Month 6+)
- [ ] Slack/Teams notifications
- [ ] DAM/MRM connectors
- [ ] GDPR data subject request API (export/delete/portability)
- [ ] Data residency options (EU)
- [ ] Brand profile encryption wiring
- [ ] Partitioning for `audit_log` and `video_frames`

---

## Do Not Build (Scope Guard)

- More security "phases" before launch
- Tax/VAT collection before meaningful revenue
- UI redesign (forensic aesthetic already established)
- Audio pipeline (no validated demand)
- Full DAM/MRM rollout pre-launch
- Analytics-first work before funnel reliability
- Heavy monitoring stack beyond pragmatic needs

---

## Migration Verification Tracker (Object-Level Verified 2026-03-06)

| Migration | Purpose | Depends On | Status |
|-----------|---------|------------|--------|
| `20260211_add_tenant_invites_metadata.sql` | Invite extensibility | Nothing | DONE |
| `20260211_add_tenant_switch_audit_created_at_index.sql` | Audit query perf (CONCURRENTLY) | Nothing | DONE |
| `20260222_failed_usage_reports.sql` | Dead-letter queue for Stripe usage retry | Nothing | DONE |
| `20260224_rate_limits.sql` | `rate_limits` table + cleanup RPC | Nothing | DONE |
| `20260228_harden_rate_limits.sql` | Atomic rate limit + SECURITY DEFINER | `20260224_rate_limits.sql` | DONE |
| `20260301_purchased_by.sql` | Scan purchaser tracking for entitlements | Nothing | DONE |
| `20260301_mitigation_reports_v2.sql` | Mitigation report v2 columns/indexes/RLS | Nothing | DONE |
| `20260301_mitigation_rls_cleanup.sql` | Mitigation policy consolidation + hardening | `20260301_mitigation_reports_v2.sql` | DONE |
| `20260302_atomic_mitigation_usage.sql` | Atomic mitigation usage RPC | Nothing | DONE |
| `20260303_atomic_mitigation_quota.sql` | Atomic mitigation quota consume RPC | `20260302_atomic_mitigation_usage.sql` | DONE |

Note: This Supabase project does not expose a migration history table; verification was completed at object level (columns, indexes, RLS policies, functions, grants).
