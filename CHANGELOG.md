# Changelog

## [Unreleased]
### Added

- **Workflow Orchestration**: New rules engine (`tasks/rules.md`) and startup protocols.
- **Structural Documentation**: Roadmap, Architecture, and Decision logs.
- **Anonymous Purchase Flow**: Checkout supports anon users with session ownership validation.
- **Dashboard Routing**: Magic links route to `/dashboard/scans-reports` with highlight + auto-assign.
- **Email Upgrade**: Sample report emails now include a top detected risk.
- **Sample PDF Enrichment**: Hero finding from DB + profile teasers for sample mode.

### Fixed
- **Upgrade UX Truth**: Audit and Upgrade modals now match plan limits and pricing ($49).
- **Dead-end Navigation**: History/Reports pages redirect to Scans & Reports.
- **Performance Hotspots**: Landing page split into server/client; scan card layout thrash removed.

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
