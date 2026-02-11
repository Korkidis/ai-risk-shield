# Project Plan — "Demo → Product"
*Updated: 2026-02-11 — derived from Strategy Sanity Check conversation*

## Guiding Principle
We are not adding features. We are making the **core loop complete and honest**.
The measure of "done" is: can someone scan 3 images over 2 weeks and pay $49/month without hitting a dead end?

---

## Phase A: One Honest Pipeline (Prerequisite for Everything)
*The two-pipeline split is the root cause of most issues. Fix this first.*

- [ ] **Unify analysis pipelines** — eliminate the authenticated vs. anonymous divergence
    - [ ] Route both flows through the same processor with full Gemini multi-persona analysis
    - [ ] Ensure C2PA verification runs for anonymous image scans (currently skipped — `scan-processor.ts:87`)
    - [ ] Store full `risk_profile` blob consistently in both paths
- [ ] **Fix data handoff** — `GET /api/scans/[id]` should read stored `risk_profile` blob, not reconstruct a thin version
- [ ] **Wire real scan quota** — replace hardcoded "3/3 REMAINING" (`FreeUploadContainer.tsx:208`) with actual remaining count

## Phase B: The PDF Is the Product
*This is what the user hands to legal. This is what they pay for.*

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

- [ ] **Scan History page** — show real past scans from DB (not "Offline / Under Construction")
- [ ] **Brand Guidelines UI** — upload/management interface (schema exists, UI doesn't)

## Cleanup (Non-blocking, do when touching related files)
- [ ] Add `caution` to `RSC2PAWidget.tsx` type + switch
- [ ] Apply schema drift migrations (tenant_switch_audit index, tenant_invites metadata)
- [ ] Complete magic links cleanup (code references still linger)
- [ ] Fill empty "Technical Constraints" section in `NORTH_STAR.md`
- [ ] Resolve retention vs. hard-delete policy conflict (PRD vs. Subscription Strategy)

---

## Completed
- [x] Documentation alignment (pricing, architecture, model version, skill index)
- [x] RLS hardening and performance tuning
- [x] C2PA 5-value fidelity in scoring module (`lib/risk/scoring.ts`)
- [x] Security cleanup migration for magic_links table
- [x] Dynamic email content (risk score + verdict in magic link email)
- [x] Scanner UI unification ("machined aluminum" aesthetic)
- [x] Stripe billing (5-tier + metered overage)
- [x] Multi-tenancy + hierarchical agencies
- [x] Real-time Gemini analysis display (Supabase Realtime)
