# Project Plan — "Demo → Product"
*Updated: 2026-02-11 — derived from Strategy Sanity Check conversation*

## Guiding Principle
We are not adding features. We are making the **core loop complete and honest**.
The measure of "done" is: can someone scan 3 images over 2 weeks and pay $49/month without hitting a dead end?

---

## Pre‑Step 0: Schema Drift (Do First)
*Keep repo and live DB in lockstep before more feature work.*

- [x] Apply `20260211_add_tenant_invites_metadata.sql`
- [x] Apply `20260211_add_tenant_switch_audit_created_at_index.sql` (**CONCURRENTLY — run outside a transaction**)

---

## Phase A: One Honest Pipeline (Prerequisite for Everything) ✅
*The two-pipeline split is the root cause of most issues. Fix this first.*

- [x] **Unify analysis pipelines** — eliminate the authenticated vs. anonymous divergence
    - [x] Route both flows through the same processor with full Gemini multi-persona analysis
    - [x] Ensure C2PA verification runs for anonymous image scans (currently skipped — `scan-processor.ts:87`)
    - [x] Store full `risk_profile` blob consistently in both paths
- [x] **Fix data handoff** — `GET /api/scans/[id]` should read stored `risk_profile` blob, not reconstruct a thin version
- [x] **Wire real scan quota** — replace hardcoded "3/3 REMAINING" (`FreeUploadContainer.tsx:208`) with actual remaining count

## Phase B: The PDF Is the Product
*This is what the user hands to legal. This is what they pay for.*
*⚠ Depends on Phase A — sample PDF pulls from `GET /api/scans/[id]`, which must return the stored blob first.*

- [ ] **Enrich sample PDF** — feed it the full stored Gemini analysis, not reconstructed teasers
- [ ] **Make email useful** — attach sample PDF or inline key findings (currently links back to same page)
- [ ] **Verify one-time $29 purchase flow** — end-to-end: scan → gate → pay → download full 6-page report

## Phase C: Honest Telemetry
*The product's credibility rests on being a precision instrument. Fake telemetry undermines that.*

- [ ] **Replace scripted log animation** with real analysis progress (even if simpler)
    - Dashboard: `page.tsx:79-114`
    - Landing: `FreeUploadContainer.tsx:46-59`

## Phase D: The Second Visit
*The first scan impresses. The second visit must not be empty.*

- [ ] **Scans & Reports is canonical** — redirect history/reports stubs to `/dashboard/scans-reports`
- [ ] **Brand Guidelines wiring** — UI exists, but analysis ignores guidelines; enforce AES‑256 + gating

## Cleanup (Non-blocking, do when touching related files)
- [ ] **Magic links cleanup** — delete `app/api/auth/verify/route.ts` (67 lines), then confirm `magic_links` table is dropped via migration `20260208_cleanup_magic_links.sql`
- [ ] **RSC2PAWidget `caution` handling** — type union missing `caution`, switch has no case for it. Falls through to generic default.
- [ ] Resolve retention vs. hard-delete policy conflict (PRD vs. Subscription Strategy)

---

## Completed
- [x] RLS hardening and performance tuning
- [x] C2PA 5-value fidelity in scoring module (`lib/risk/scoring.ts`)
- [x] Dynamic email content (risk score + verdict in magic link email)
- [x] Scanner UI unification ("machined aluminum" aesthetic)
- [x] Stripe billing (5-tier + metered overage)
- [x] Multi-tenancy + hierarchical agencies
- [x] Real-time Gemini analysis display (Supabase Realtime)
- [x] Documentation alignment — strategy, pricing, architecture, model, and walkthrough updated
- [x] Magic links migration file created (`20260208_cleanup_magic_links.sql`) — **but route.ts still live, cleanup not applied**
- [x] NORTH_STAR Technical Constraints filled
