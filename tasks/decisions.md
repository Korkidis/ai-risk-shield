# Founder Decision Log

## Architecture & Tech Stack

| Date | Decision | Context/Reasoning | Status |
| :--- | :--- | :--- | :--- |
| **Jan 2026** | **Supabase over Firebase** | Needed strict SQL relational data and Row Level Security (RLS) for SOC 2 compliance. Firebase rules were too brittle. | ✅ Proven |
| **Feb 2026** | **Gemini 2.5 Flash** | Upgraded from 1.5 for faster inference and improved reliability while keeping forensic output quality. | ✅ Active |
| **Jan 2026** | **Tailwind "Forensic" System** | Decided against component libraries (MUI/Chakra) to achieve the custom "Braun/Dieter Rams" physical aesthetic. | ✅ Core Brand |
| **Jan 2026** | **Hierarchical Tenancy** | Implemented `parent_tenant_id` to support Agency use cases (Managing multiple client workspaces). Essential for B2B. | ✅ Live |
| **Feb 2026** | **Metered Billing** | Chose Stripe Usage Records over simple subscriptions to capture upside from heavy users (Agencies). | ✅ Live |
| **Feb 2026** | **Provenance Status Constraint Expanded** | Updated `scans.provenance_status` CHECK constraint to include `caution` to preserve full C2PA fidelity (valid/missing/invalid/error/caution). Prevents DB write failures after risk-model unification. | ✅ Pending Apply (verify in DB) |
| **Feb 2026** | **One Product Reality** | Dashboard **Scans & Reports** is the canonical home. Landing is the thin bridge for onboarding and immediate sample PDF. | ✅ Active |
| **Feb 2026** | **DB Drift Alignment (Tenant Invites Metadata)** | Live DB includes `tenant_invites.metadata` (jsonb). Added a repo migration to align schema and keep docs consistent. | ✅ Pending Apply |
| **Feb 2026** | **Audit Index Restoration** | Live DB missing `idx_tenant_switch_audit_created_at`. Added a non-transactional migration using `CREATE INDEX CONCURRENTLY` to restore expected time-range performance. | ✅ Pending Apply |

## Product & Business

| Date | Decision | Context/Reasoning | Status |
| :--- | :--- | :--- | :--- |
| **Jan 2026** | **No "Create" Features** | We VALIDATE content, we do not CREATE it. Avoids competing with Midjourney/Adobe and keeps legal liability clear. | 🔒 Permanent |
| **Jan 2026** | **Anonymous Scan (The Hook)** | Allow scanning without signup (cookie-based). Frictionless value demonstration > forced signup drop-off. | ⚠️ Monitoring |
| **Feb 2026** | **Strict RLS Everywhere** | Every table must have RLS. No "Service Key" bypasses in frontend code. Critical for SOC 2. | 🛡️ Enforced |
