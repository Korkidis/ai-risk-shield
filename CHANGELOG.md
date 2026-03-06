# Changelog

## [Unreleased]
### Added

- **Workflow Orchestration**: New rules engine (`tasks/rules.md`) and startup protocols.
- **Structural Documentation**: Roadmap, Architecture, and Decision logs.
- **Sprint 10 Documentation Reconciliation**: `tasks/todo.md` now includes an explicit Sprint 10 status section (`DONE`/`PARTIAL`/`VERIFY-IN-PROD`) and roadmap summary alignment.
- **Sprint 10.5 Verification Matrix**: Documentation now tracks completed vs remaining 10.5 items (including mitigation purchase return-flow gap) and includes dependency-ordered next tasks.
- **Mitigation Return-Path Automation**: `mitigation_purchased=true` is now handled in `scans-reports` with auto-generation trigger and URL cleanup.
- **Mitigation Return Retry Logic**: Added bounded exponential backoff on transient `402` responses to handle webhook lag without losing the return-path trigger.
- **Production ACL Verification**: Explicit function privilege posture verified and hardened for mitigation quota/usage RPCs (`authenticated` + `service_role` execute, `anon` denied).
- **Production Typegen Sync**: Supabase types regenerated from linked production schema.
- **Anonymous Purchase Flow**: Checkout supports anon users with session ownership validation.
- **Dashboard Routing**: Magic links route to `/dashboard/scans-reports` with highlight + auto-assign.
- **Email Upgrade**: Sample report emails now include a top detected risk.
- **Sample PDF Enrichment**: Hero finding from DB + profile teasers for sample mode.
- **Mitigation Purchase Flow**: Drawer-integrated mitigation purchase path with entitlement updates.
- **Canonical Workspace Consolidation**: Dashboard workspace/routing unification and legacy flow cleanup.

### Fixed
- **Upgrade UX Truth**: Audit and Upgrade modals now match plan limits and pricing ($49).
- **Dead-end Navigation**: History/Reports pages redirect to Scans & Reports.
- **Performance Hotspots**: Landing page split into server/client; scan card layout thrash removed.
- **Quota Race Condition**: Tenant scan counters now increment atomically at scan completion.
- **Anonymous Quota Drift**: IP/session limits now derive from `scans` rows and exclude failed scans in both paths.
- **Bulk Share Reliability**: Batch sharing now returns/copies tokenized links and reports partial failures correctly.
- **Mitigation PDF Integrity Labeling**: Integrity footer now matches implemented checksum algorithm (`FNV1A64`).
- **Mitigation Concurrency Hardening**: Atomic mitigation credit usage path and post-review edge-case fixes.
- **Webhook Pending-Row Handling**: Mitigation CAS transitions now stamp generation tracking fields when claiming `pending`/`failed` rows.
- **Paid Retry Quota Guard**: Failed retries for Stripe purchase-origin mitigation rows no longer consume additional quota.

## [2026-02-11] - Risk Model Unification & Report Rehab
### Added
- **Canonical Risk Modules**: `lib/risk/tiers.ts` and `lib/risk/scoring.ts` as single source of truth.
- **Guardrails**: Vitest + risk scoring unit tests + audit script.
- **Sample PDF Rehab**: Structured findings + mitigation hints + C2PA visibility.
- **Schema Drift Fixes (Repo)**:  
  - `20260211_add_tenant_invites_metadata.sql`  
  - `20260211_add_tenant_switch_audit_created_at_index.sql` (CONCURRENTLY)

### Fixed
- **C2PA Fidelity**: 5‑value status wired into scoring + UI/PDF corrections.
- **Model Metadata**: `gemini-2.5-flash` recorded consistently.

## [2026-02-05] - Production Core & Experience
### Added
- **Stripe Billing**: Full integration of 5-tier pricing model (Free/Pro/Team/Agency/Enterprise) with metered overage billing.
- **Frictionless Scans**: Drag-and-drop upload with anonymous session tracking (cookie-based).
- **Realtime Engine**: Switched from polling to Supabase Realtime for instant analysis feedback.
- **Scanner UI Overhaul**: Unified "Machined Aluminum" interface with "true-to-life" physics and merged telemetry panels.

## [2026-02-01] - Remediation & Optimization
### Fixed
- **RLS Circular Dependencies**: Resolved infinite recursion in policy checks.
- **Performance Tuning**: Added missing indexes to foreign keys (`asset_id`, `tenant_id`) to fix slow queries.
- **Security Hardening**: Patched permissive storage policies.

## [2026-01-22] - Multi-Tenancy
### Added
- **Hierarchical Tenancy**: Database support for Parent/Child tenant relationships.
- **Tenant Switch API**: Secure endpoint for agencies to switch contexts.
- **Audit Logging**: `tenant_switch_audit` table.

## [2026-01-20] - Phase 1 Foundation
### Added
- **Brand Guidelines**: Schema support for custom negative/positive prompt constraints.
- **Freemium Logic**: Implementation of scan limits and overage tracking.

## [2026-01-03] - Inception
### Added
- **Initial Schema**: Core tables (`users`, `assets`, `scans`) setup.
- **Auth Setup**: Supabase GoTrue integration.
