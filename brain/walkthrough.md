# Session Walkthrough
*Last updated: 2026-02-15*

## What We're Selling
Peace of mind you can hand to a lawyer. A PDF that says "I checked this AI image before publishing it" with enough technical authority that a legal team accepts it as due diligence. One sentence. Everything else is implementation detail.

## The Buyer
A marketing manager or agency creative director who just used Midjourney and is thinking: "Is this going to get us sued?" They saw a headline. Legal is nervous. They need a number — any defensible number — to put in front of legal. The emotional trigger is career anxiety dressed as diligence.

Secondary: a freelance designer whose client asked "is this safe?" and they have no answer. They need a PDF to attach. They need to look professional.

---

## Current State
**Revenue loop unblocked.** Anonymous purchase, magic links, and dashboard routing now work end‑to‑end. Performance work has started (landing is server‑rendered; scan card layout thrash removed). Remaining gaps are trust/quality improvements (quota truth, honest telemetry, and real post‑scan actions), plus the security fixes listed below.

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
| Email gate + magic link | Working | `auth.admin.generateLink` → `/auth/callback` + Resend |
| Canonical scoring module (5-value C2PA fidelity) | Working, tested (40 unit tests) | `lib/risk/scoring.ts`, `lib/risk/tiers.ts` |
| RLS + multi-tenancy + hierarchical agencies | Working | Supabase, 85+ migrations |
| `risk_profile` JSONB blob storage | Working | `scans.risk_profile` column |
| Supabase Realtime (scan status updates) | Working (broadcast events + db updates) | `hooks/useRealtimeScans.ts` |
| Scans & Reports dashboard page | Working (the canonical product page) | `app/(dashboard)/dashboard/scans-reports/` |
| PDF Download / Export | Working (client-side generation) | `scans-reports/page.tsx` → `lib/pdf-generator.ts` |
| Quota Displays (Anonymous & Tenant) | Working (real limits from DB/API) | `FreeUploadContainer.tsx`, `RSSidebar.tsx` |

## What's Broken or Theater

| Issue | Impact | Sprint |
|:---|:---|:---|
| **Sample PDF not attached to email** | CTA is good, but attachment would increase conversion. | Build 3 |

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
