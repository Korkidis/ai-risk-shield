# Changelog

## [Unreleased]
### Added
- **Workflow Orchestration**: New rules engine (`tasks/rules.md`) and startup protocols.
- **Structural Documentation**: Roadmap, Architecture, and Decision logs.

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
