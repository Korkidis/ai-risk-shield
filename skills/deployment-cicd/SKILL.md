---
name: deployment-cicd-guardrails
description: Protocols for safe deployment and CI/CD checks. Use when preparing for production release or modifying build pipelines.
---

# Deployment & CI/CD Guardrails Skill

## 1. Safety First (SOC 2)
Deployment is not just "pushing code." It is a compliance event.
*   **Audit**: Every deployment trace is evidence.
*   **Secrets**: No `.env` files in git. All secrets must be in Vercel/Supabase dashboard.
*   **Rollback**: Must be able to revert instantly.
*   **Async Jobs**: If using Job Queues, *every state change* (Enqueued -> Processing -> Done) must be logged for SOC 2 transparency.

## 2. Pre-Deployment Checklist
Before merging to `main` or triggering a build:

### A. Database Sync
*   [ ] Do local migrations match remote?
*   [ ] Run `npx supabase db diff` to check for drift.
*   [ ] Are there destructive changes (DROP COLUMN)? If yes, backup first.

### B. Environment Variables
*   [ ] Did I add a new `NEXT_PUBLIC_...` var?
*   [ ] Is it added to Vercel (Production & Preview)?
*   [ ] Is it added to GitHub Secrets (for CI)?

### C. Build Check
*   [ ] Run `npm run build` locally. Vercel builds fail on type errors that dev mode ignores.
*   [ ] Run `npm run lint`.

## 3. Post-Deployment Verification
After Vercel says "Ready":
1.  **Smoke Test**: Log in, Upload 1 file, Verify 1 result.
2.  **Check Logs**: Look for "500" errors in Vercel Monitoring.
3.  **Check Edges**: Verify Edge Function cold starts are acceptable.

## 4. Emergency Rollback
If a SOC 2 violation or critical bug occurs:
1.  **Vercel**: "Instant Rollback" to previous deployment.
2.  **Supabase**: PITR (Point-in-Time Recovery) if data corruption occurred.
