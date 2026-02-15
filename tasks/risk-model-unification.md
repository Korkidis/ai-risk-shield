# Risk Model + Report Refactor Implementation Map

This document is the implementation guide for an agent who has no prior context. It maps the current system, identifies correctness failures, and specifies a phased plan that fixes risk integrity, restores the sample PDF value exchange, and then cleans up monoliths and token drift without breaking features.

## Audience
Senior engineer or agent implementing a multi-phase refactor with production correctness and conversion impact.

## Purpose
1. Establish a single, canonical risk model used by all pipelines and UIs.
2. Restore the structured PDF sample report (value exchange, not redaction).
3. Unify visual risk tokens and eliminate drift.
4. De-monolith hotspots after contracts are stable.
5. Avoid regressions in high-stakes flows.

## Status Update (2026-02-11)
**Shipped**
- Hotfixes: model version metadata, provenance status derivation, status vocabulary normalization
- Phase 0: Vitest + unit tests, audit script
- Phase 1: Canonical `lib/risk/tiers.ts` + `lib/risk/scoring.ts`, replaced all local thresholds
- Phase 2: Sample PDF rehab (structured findings, mitigation hints, C2PA visible)

**Remaining**
- Phase 3: Token unification
- Phase 4: De‑monolith UI hotspots
- Phase 5: Cleanup + dead code removal

## Business Constraints (Non-Negotiable)
1. Risk output must be consistent across all entry points (trust, legal defensibility).
2. Provenance status must reflect cryptographic truth, not derived heuristics.
3. Sample report must provide real value to convert users.
4. UI must convey forensic authority (Dieter Rams/Braun aesthetic).
5. Do not break anonymous flow, email unlock, or dashboard scans.

## Current System Map

### Analysis Pipelines (Three)
1. Sync deep scan (dashboard):
   - Entry: `POST /api/analyze` in `app/api/analyze/route.ts`
   - Engine: `lib/gemini.ts` (multi-persona, C2PA integration)
   - Output: `RiskProfile` (composite + verdict)
2. Async scan processor (upload → background):
   - Entry: `POST /api/scans/upload` → `POST /api/scans/process`
   - Engine: `lib/ai/scan-processor.ts`
   - For images: calls `lib/gemini.ts` but recomputes composite and level
   - For videos: uses `lib/ai/ip-detection.ts` + `lib/ai/brand-safety.ts`
3. Anonymous flow:
   - Entry: `POST /api/scans/anonymous-upload`
   - Processing: `POST /api/scans/process`
   - Status polling: `GET /api/scans/[id]/status`

### Data Model (Key Fields)
Defined in `types/database.ts`:
1. `scans`:
   - `ip_risk_score`, `safety_risk_score`, `provenance_risk_score`
   - `composite_score`, `risk_level`
   - `provenance_status`, `provenance_data`
2. `scan_findings`:
   - `finding_type`, `severity`, `description`, `confidence_score`
3. `risk_profile`:
   - Serialized JSON returned to UI in some routes

### Risk Output Shapes
1. `RiskProfile` (from `lib/gemini-types.ts`):
   - `ip_report`, `safety_report`, `provenance_report`
   - `c2pa_report`, `composite_score`, `verdict`
2. Flat DB fields in `scans`:
   - risk scores + `risk_level`

### Report Surfaces
1. PDF generator: `lib/pdf-generator.ts` (current template; redacted sample logic)
2. Full web report: `components/report/FullForensicReport.tsx`
3. Teaser web report: `components/landing/FreeForensicReport.tsx`
4. Gated results: `components/landing/ScanResultsWithGate.tsx`
5. Scan results page: `app/scan/[id]/page.tsx`

### Email Templates
1. `components/email/SampleReportEmail.tsx` (used by `lib/email.ts`)
2. `components/email/MagicLinkEmail.tsx` (exists but unused)

## Critical Contradictions and Redundancies

### Risk Tier Drift
Multiple threshold sets exist:
1. `lib/risk-utils.ts`: 91/76/51/26
2. `lib/gemini.ts`: 80/60/35
3. `lib/ai/scan-processor.ts`: 90/70/50/25
4. UI components and emails use 85/60/40 or 75/50/25

### C2PA / Provenance Logic Conflict
1. `lib/gemini.ts` maps C2PA status → provenance score directly.
2. `lib/ai/scan-processor.ts` derives `provenance_status` from score (wrong).
3. `caution` exists in types but is never emitted in `lib/c2pa.ts`.

### Status Vocabulary Mismatch
1. DB uses `complete`
2. UI types expect `completed`
3. `hooks/useRealtimeScans.ts` patches at runtime

### Model Version Metadata Mismatch
1. `lib/ai/scan-processor.ts` stores `gemini-1.5-flash`
2. Actual model used is `gemini-2.5-flash`

### Duplicate PDF Templates
1. Current PDF generator: `lib/pdf-generator.ts`
2. Older structured PDF template exists in branch `main` and `frontend-redesign`:
   - `main:components/landing/ScanResultsWithGate.tsx`
   - `frontend-redesign:components/landing/ScanResultsWithGate.tsx`

### Unused or Redundant Modules
1. `components/upload/UploadContainer.tsx` and `components/upload/UploadZone.tsx` unused
2. `lib/c2pa/index.ts` unused
3. `lib/mock-data.ts` unused
4. `lib/schemas/scan.ts` unused

## Immediate Hotfixes (Before Refactor)
1. Fix model metadata in `lib/ai/scan-processor.ts`
   - Set `gemini_model_version` to `gemini-2.5-flash`
2. Fix provenance status derivation:
   - `provenance_status` must reflect C2PA cryptographic state, not score
3. Normalize status vocabulary:
   - Choose canonical string (`complete` or `completed`)
   - Update DB constraint, Zod schema, and UI types

## Canonical Risk Contract (Must Be Implemented)
Create `lib/risk/tiers.ts`:
1. Single threshold table
2. `getRiskTier(score)` returns `{ level, label, colorVar }`
3. `mapLegacyLevel(level)` to bridge UI components

Create `lib/risk/scoring.ts`:
1. `computeCompositeScore({ ip, safety, provenance, c2paStatus })`
2. `computeVerdict(compositeScore)`
3. `computeRiskLevel(compositeScore)`
4. `computeProvenanceScoreFromC2PA(status)`
5. `computeProvenanceStatus(c2paReport)`

Decision Required:
1. Pick the canonical thresholds (e.g., 91/76/51/26 or 80/60/35).
2. Apply once and delete all local thresholds.

## Phase Plan (Correctness-First)

### Phase 0: Guardrails and Baselines
1. Add regression checklist in `tasks/todo.md`.
2. Add score stability test:
   - Upload same asset via sync and async pipelines.
   - Confirm identical composite score and verdict.
3. Capture baseline screenshots for risk badge colors and gated view.

### Phase 1: Risk Unification (P0 Correctness)
1. Implement `lib/risk/tiers.ts` and `lib/risk/scoring.ts`.
2. Replace all local scoring logic in:
   - `lib/gemini.ts`
   - `lib/ai/scan-processor.ts`
   - `app/api/analyze/route.ts`
   - `app/api/scans/[id]/route.ts`
3. Normalize status vocabulary (DB + UI).

### Phase 2: Sample Report Rehabilitation (Business Critical)
1. Restore structured PDF template from `main` branch.
   - Pull from `main:components/landing/ScanResultsWithGate.tsx`.
2. Replace redacted overlay logic in `lib/pdf-generator.ts`.
3. Sample report rules:
   - Always show composite score, verdict, and sub-scores.
   - Show highest-severity finding and one additional category.
   - Provide 1 mitigation hint per finding (sanitized).
   - Lock raw evidence, raw C2PA manifest, and full reasoning.

### Phase 3: Token Unification (Before De-monolith)
1. Add missing semantic tokens in `app/globals.css`.
2. Replace hardcoded risk colors across UIs with `getRiskTier(score)`.
3. Fix `var(--rs-warning)` usage to a defined token.

### Phase 4: De-monolith Hotspots
1. Split `app/(dashboard)/dashboard/scans-reports/page.tsx` into:
   - `hooks/useScansQuery.ts`
   - `hooks/useScansRealtime.ts`
   - `components/scans/*`
2. Split `components/landing/FreeUploadContainer.tsx` into:
   - `hooks/useAnonymousScan.ts`
   - `FreeUploadView.tsx`
3. Split `app/(dashboard)/dashboard/design-lab/page.tsx` by tab.

### Phase 5: Cleanup
1. Remove unused modules (see list above).
2. Remove legacy risk mappings once all references migrated.

## Audit and Integrity Script
Create `scripts/audit-score-discrepancies.ts`:
1. Read scans with IP/Safety/Provenance scores.
2. Recompute composite score via canonical formula.
3. Log discrepancies and percentages.
4. Output a report for blast radius assessment.

## Rollout Strategy
1. Shadow mode logging:
   - Compute old vs new composite scores and log deltas.
2. If discrepancy rate < 1%, ship.
3. If discrepancy rate > 1%, halt and investigate.

## Acceptance Criteria
1. Same asset yields identical score across sync/async pipelines.
2. All risk colors originate from a single tier mapping.
3. Sample PDF gives meaningful value exchange.
4. No UI path uses hardcoded risk thresholds.
5. Status is consistent across DB, UI, and types.

## Quick Commands (for agent reference)
1. Find old PDF template:
   - `git show "main:components/landing/ScanResultsWithGate.tsx"`
2. Find hardcoded risk colors:
   - `rg "(critical|high|review|caution|safe)" --type tsx -A 2 | rg "bg-|text-|border-"`
3. Find local thresholds:
   - `rg ">= 8[0-9]|>= 7[0-9]|>= 6[0-9]|>= 5[0-9]" lib app components`

## Non-Goals (Do Not Change Yet)
1. RLS policies or Supabase schema changes beyond status normalization.
2. Any changes to anonymous session handling or magic link auth flow.
3. Pricing logic or entitlement rules.
