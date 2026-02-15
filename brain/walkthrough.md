# Session Walkthrough
*Last updated: 2026-02-15*

## What We're Selling
Peace of mind you can hand to a lawyer. A PDF that says "I checked this AI image before publishing it" with enough technical authority that a legal team accepts it as due diligence. One sentence. Everything else is implementation detail.

## The Buyer
A marketing manager or agency creative director who just used Midjourney and is thinking: "Is this going to get us sued?" They saw a headline. Legal is nervous. They need a number — any defensible number — to put in front of legal. The emotional trigger is career anxiety dressed as diligence.

Secondary: a freelance designer whose client asked "is this safe?" and they have no answer. They need a PDF to attach. They need to look professional.

---

## Current State
**Demo → Product transition.** The infrastructure is built. The gap is completing the transaction, not adding features. The $29 one-time purchase — the hottest moment in the funnel — is broken for anonymous users.

## Execution Plan
**The single source of truth is [`tasks/todo.md`](../tasks/todo.md).** That file contains sprint-level tasks with dependencies, file references, and "why" for every item. Do not plan work from this walkthrough — plan from `todo.md`.

This file exists to orient new sessions on *what's real, what's broken, and what the product feels like*. `todo.md` says what to do about it.

---

## What's Real and Working

| Component | Status | Where |
|:---|:---|:---|
| Anonymous upload (no signup) | Working | `FreeUploadContainer.tsx` → `/api/scans/anonymous-upload` |
| Gemini multi-persona analysis (3-prompt, aggressive scoring) | Working — **this is the moat** | `lib/gemini.ts` |
| C2PA provenance verification (real cryptographic) | Working (both paths) | `c2pa-node`, `lib/c2pa/verify.ts` |
| PDF report generation (branded, Rams tokens) | Working | `lib/pdf-generator.ts` |
| Stripe billing (subscriptions + one-time + metered overage) | Working (backend) | `lib/plans.ts`, webhook route |
| Design system (62 RS* components, "forensic instrument") | Distinctive | `components/rs/*` |
| Email gate + magic link | Working | `signInWithOtp` + Resend |
| Canonical scoring module (5-value C2PA fidelity) | Working, tested (40 unit tests) | `lib/risk/scoring.ts`, `lib/risk/tiers.ts` |
| RLS + multi-tenancy + hierarchical agencies | Working | Supabase, 85+ migrations |
| `risk_profile` JSONB blob storage | Working | `scans.risk_profile` column |
| Supabase Realtime (scan status updates) | Working | `hooks/useRealtimeScans.ts` |
| Scans & Reports dashboard page | Working (the canonical product page) | `app/(dashboard)/dashboard/scans-reports/` |

## What's Broken or Theater

| Issue | Impact | Sprint |
|:---|:---|:---|
| **$29 purchase blocked for anonymous users** | Revenue literally blocked. Auth required for checkout but button shown to anon users. | Build 1 |
| **AuditModal promises features that don't exist** | "Unlimited Scans", "API Access", "Priority Queue" — none are real. Churn risk. | Build 1 |
| **Sample PDF uses thin data** | Rich Gemini reasoning stripped out. Teaser doesn't justify $29. | Build 2 |
| **Magic link → dead end** | Email links to `/scan/[id]` instead of dashboard. No path to retention. | Build 3 |
| **History/Reports pages are stubs** | "Status: Offline" damages confidence. Real page exists at `/scans-reports`. | Build 3 |
| **All quota displays hardcoded** | "3/3", "15/50", "4/10 seats" — all fake strings. | Build 4 |
| **Telemetry stream is scripted** | 14 fake messages ("Detecting latent diffusion artifacts...") undermine precision brand. | Build 5 |
| **Download/Share/Export buttons are console.log** | Most natural post-scan actions don't work. | Build 5 |

## Security Issues (Fix Alongside Sprints)

| Issue | Severity | Fix |
|:---|:---|:---|
| `/api/scans/process` has no auth | CRITICAL | S1 in todo.md — do alongside builds |
| `listUsers()` fetches ALL users on email capture | HIGH | S2 in todo.md — do alongside builds |
| `/api/debug-provenance` completely open | HIGH | S3 in todo.md — do alongside builds |
| `brand_guidelines` RLS references nonexistent table | MEDIUM | S4 in todo.md — do alongside builds |

## Cleanup (Do When Touching Related Files)

- Delete `/api/auth/verify/route.ts` (queries dropped `magic_links` table)
- RSC2PAWidget missing `caution` case
- Regenerate `types.ts` (massively outdated)
- Fix video frame count (5 in code, 10 in docs)
- Fix hardcoded C2PA serial `"C2PA-CERT-884-29-X"`

---

## Document Map

| Doc | Purpose | Authority |
|:---|:---|:---|
| **`tasks/todo.md`** | What to build, in what order, with dependencies | **Execution source of truth** |
| **`brain/walkthrough.md`** (this file) | What's real, what's broken, how the product feels | Session orientation |
| **`NORTH_STAR.md`** | Vision, personas, jobs-to-be-done, design philosophy | Product strategy |
| **`tasks/lessons.md`** | Anti-patterns and mistakes to avoid | Self-correction log |
| **`tasks/rules.md`** | Workflow rules (spec before build, proof of work) | Operating contract |
| **`tasks/decisions.md`** | Architecture decisions with reasoning | Decision log |
| **`roadmap.md`** | **DEPRECATED** — redirects to `todo.md` | — |
