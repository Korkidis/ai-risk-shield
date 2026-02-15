# Session Walkthrough
*Last updated: 2026-02-11*

## What We're Selling
Peace of mind for people afraid of getting sued for using AI-generated images. The ability to say "I checked" before someone asks "did you check?" One sentence. Everything else is implementation detail.

## The Buyer
A marketing manager or agency creative director who just used Midjourney and is thinking: "Is this going to get us sued?" They saw a headline. Legal is nervous. They need a number — any defensible number — to put in front of legal. The emotional trigger is career anxiety dressed as diligence.

Secondary: a freelance designer whose client asked "is this safe?" and they have no answer. They need a PDF to attach. They need to look professional.

---

## Current Phase
**Phase 2: Production Core** — "0 to 1,000 users."
The infrastructure is built. The gap is **completeness**, not features. The first scan impresses for 60 seconds; the second, third, and tenth interactions fall apart.

## What's Real and Working

| Component | Status | Where |
|:---|:---|:---|
| Anonymous upload (no signup) | ✅ Working | `FreeUploadContainer.tsx` → `/api/scans/anonymous-upload` |
| Gemini multi-persona analysis (3-prompt, aggressive scoring) | ✅ Working — **this is the moat** | `lib/gemini.ts` |
| C2PA provenance verification (real cryptographic) | ✅ Working (authenticated path) | `c2pa-node`, `RSProvenanceDrawer` |
| PDF report generation (branded, Rams tokens) | ✅ Working | `lib/pdf-generator.ts` |
| Stripe billing (subscriptions + one-time + metered overage) | ✅ Working | `lib/plans.ts`, webhook route |
| Design system (62 RS* components, "forensic instrument") | ✅ Distinctive | `components/rs/*` |
| Email gate + magic link | ✅ Working | `signInWithOtp` + Resend |
| Scoring module (5-value C2PA fidelity) | ✅ Working | `lib/risk/scoring.ts` |
| RLS + multi-tenancy + hierarchical agencies | ✅ Working | Supabase, 42 migrations |

## What's Theater or Broken

| Issue | Impact | Where |
|:---|:---|:---|
| **Telemetry stream is scripted** — timed log messages unrelated to actual analysis | Undermines "precision instrument" credibility | `dashboard/page.tsx:79-114`, `FreeUploadContainer.tsx:46-59` |
| **Anonymous flow data loss** — rich Gemini analysis → thin reconstructed profile | Sample PDF gets watered-down data. The best content never reaches the user | `GET /api/scans/[id]` reconstructs instead of reading stored `risk_profile` blob |
| **Two inconsistent analysis pipelines** — authenticated (`/api/analyze`) vs anonymous (`scan-processor.ts`) | Different behavior, different data richness, bug source | Auth path stores differently, includes brand context, richer returns |
| **C2PA skipped for anonymous images** — `scan-processor.ts:87` has TODO, defaults to `{ hasManifest: false }` | Headline feature not working in primary flow | `lib/ai/scan-processor.ts` |
| **Email is a dead end** — magic link goes to same page user was already redirected to | Email adds zero value if they already got the auto-download | `SampleReportEmail.tsx` |
| **Empty dashboard stubs** — History: "Offline", Brand Guidelines: no UI, Reports: no real data | Second visit has nothing | `dashboard/history/`, `dashboard/brand-guidelines/` |
| **"3/3 REMAINING" is hardcoded** | Doesn't reflect actual quota | `FreeUploadContainer.tsx:208` |
| **`RSC2PAWidget.tsx` missing `caution` state** | Falls through to generic default | Line 11, no `case 'caution'` in switch |
| **Magic links route still live** | `app/api/auth/verify/route.ts` (67 lines) queries `magic_links` table. Migration to drop table exists but applying it would break this route. Delete route first. | `app/api/auth/verify/route.ts` |

## Schema Drift
Two migrations created, need to be applied:
- `20260211_add_tenant_switch_audit_created_at_index.sql` (CONCURRENTLY)
- `20260211_add_tenant_invites_metadata.sql`

## The Core Problem
This is a **demo, not a product**. The core value loop works for one scan. The moment someone tries to do a second scan, come back a week later, or show their boss — it falls apart. Empty pages, lost data, hardcoded counters, scripted animations.

The gap isn't features. The gap is **completeness**. The distance between "impresses for 60 seconds" and "worth $49/month" is whether the 2nd through 10th interaction is as good as the 1st.

## What Needs to Happen (In Order)
1. **Unify the analysis pipeline** — one path, full data, both flows
2. **Fix the anonymous → authenticated data handoff** — stop reconstructing, read the stored blob
3. **Enable C2PA in the anonymous image path** — it's the headline feature
4. **Make the sample PDF rich** — it should contain the real Gemini analysis, not thin reconstructions
5. **Replace scripted telemetry with real progress** — even if simpler, it must be honest
6. **Wire the scan counter to real quota** — not hardcoded
7. **Make the email useful** — attach the sample PDF or inline the key findings
8. **Build scan history** — the second visit needs content
