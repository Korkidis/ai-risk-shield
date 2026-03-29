# Current State

Last updated: 2026-03-28
Purpose: concise canonical snapshot of what is actually shipped and what changed most recently

## Shipped Snapshot

- Production branch is `main`
- Governance database is live in production
- Governance hub is live and DB-backed with ISR
- Mitigation generation can pull live governance context with hardcoded fallback
- Server/client import boundary issue for governance code was fixed

## Governance Knowledge Base

Shipped in late March 2026:

- `governance_policies`
- `governance_precedents`
- `platform_requirements`

Supporting code shipped:

- `lib/governance/query.ts` for composable governance queries
- `lib/ai/mitigation-generator.ts` governance context injection
- `lib/marketing/ai-content-governance.server.ts` server-only live fetchers
- `app/ai-content-governance/page.tsx` live governance hub with `revalidate = 3600`

Production follow-up already completed:

- governance migration SQL applied in Supabase
- helper-function `search_path` warnings cleared in production

## Governance Hub

Current hub behavior:

- playbook is grouped into stable sections instead of mixed open/closed containers
- signals show the newest four items by default with an archive toggle for older items
- duplicate React keys in public signals were fixed by using a fuller composite key
- JSON-LD and live governance fetchers remain intact

## Supabase Client Boundary

Current pattern:

- `lib/supabase/client.ts` for browser usage
- `lib/supabase/server.ts` for cookie-aware server usage
- `lib/supabase/middleware.ts` for session refresh
- `lib/supabase/admin.ts` for service-role admin usage only

Rule:

- server-only governance and admin code must never flow into client-consumed modules

## Documentation Notes

- `AGENTS.md` is the main operational guide
- `PAGE_PRODUCTION_BACKLOG.md` contains customer-facing page review and post-launch SEO/AEO work, but it is a local file until committed

## Known Open Work

- commercial intent SEO/AEO landing pages are planned, not built yet:
  - `/ai-content-risk-scanner`
  - `/ai-copyright-risk-checker`
  - `/c2pa-verification-tool`
  - `/brand-safety-scan-ai-images`
- leaked-password protection in Supabase Auth is intentionally deferred
