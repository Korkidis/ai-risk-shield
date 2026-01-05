# AI Risk Shield - Claude Code Guide

## Project Overview
SaaS platform for AI content risk validation. Stack: Next.js 14 (App Router) + Supabase + Google Gemini 2.5 Flash + Stripe.

**Business Model:** Freemium SaaS (3 free scans/month → $49-599/mo subscriptions)

**Core Value Prop:** Validate AI-generated images/videos for copyright risk, brand safety, and C2PA provenance in 15 seconds.

## Critical Security Rules

### Data Protection
- **ALWAYS use Row Level Security (RLS)** on every database query
- **NEVER expose PII** in logs, URLs, or error messages
- **ALWAYS encrypt brand guidelines** before storing (AES-256, see lib/brand-profiles/encrypt.ts when created)
- **NEVER use localStorage for auth** - httpOnly cookies only (Supabase handles this)
- **ALWAYS verify tenant_id** server-side (don't trust client)

### API Security
- **API routes pattern:** Check auth → verify tenant_id → check quota → process request
- **Service role key:** Server-side only, NEVER expose to client
- **Anon key:** Client-side only, limited permissions
- **Input validation:** Sanitize all user inputs (file names, emails, etc.)

### Multi-Tenant Isolation
- **Every table must have tenant_id** column with RLS policy
- **Test cross-tenant access** after every feature (should always fail)
- **Quota enforcement:** Use atomic database function (prevent race conditions)

## Architecture Principles

### Next.js 14 App Router
- **Server Components by default** - Use "use client" only when needed (useState, useEffect, browser APIs)
- **Server Actions** for mutations (no need for API routes for simple forms)
- **API routes** for complex workflows (file upload, Gemini analysis)

### Supabase Best Practices
- **Three client types:**
  - `createBrowserClient` - Client Components
  - `createServerClient` - Server Components, API Routes
  - Middleware client - Session refresh
- **RLS is defense-in-depth** - Always filter by tenant_id in code too
- **Storage paths:** Always use tenant_id in folder structure (`uploads/{tenant_id}/{file}`)

### Gemini API Usage
- **Safety blocks = feature, not bug** - Convert to critical finding (score: 100)
- **Three separate calls:** Legal Analyst (IP) + Compliance Auditor (Safety) + Report Generator
- **Temperature:** 0.2 for analysis (consistent), 0.4 for reports (creative)
- **Never send PII** - Only image data, no user emails/names

## Common Mistakes to Avoid

❌ **Don't trust client-side validation** - Always re-validate server-side
❌ **Don't forget audit logging** - Log all sensitive actions (scans, purchases, data access)
❌ **Don't expose stack traces** - Generic errors to users, detailed logs server-side
❌ **Don't use sequential IDs** - Use UUIDs (prevent enumeration attacks)
❌ **Don't store Stripe card data** - Stripe handles it, we only store customer IDs
❌ **Don't block paid users at quota** - Allow overages, bill automatically

## File Structure Patterns

```
app/
├── (auth)/              # Auth routes (login, signup)
├── (dashboard)/         # Protected routes (dashboard, settings)
├── api/                 # API routes (analyze, webhooks)
├── layout.tsx           # Root layout
└── page.tsx             # Landing page

lib/
├── supabase/           # Supabase clients (client.ts, server.ts, middleware.ts)
├── gemini/             # Gemini integration (client.ts, prompts.ts, schemas.ts)
├── stripe/             # Stripe integration (client.ts, webhooks.ts)
├── email/              # Resend email (client.ts, templates/, sequences/)
├── c2pa/               # C2PA verification (verify.ts)
├── video/              # FFmpeg processing (extract-frames.ts)
└── utils/              # Shared utilities

components/
├── ui/                 # Reusable UI components
├── dashboard/          # Dashboard-specific components
├── results/            # Results display components
└── modals/             # Modal dialogs
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=          # Project URL (safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Anon key (safe to expose)
SUPABASE_SERVICE_ROLE_KEY=         # Service role (SERVER-SIDE ONLY)

# Google Gemini
GOOGLE_GEMINI_API_KEY=             # Gemini API key (SERVER-SIDE ONLY)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # Publishable key (safe to expose)
STRIPE_SECRET_KEY=                 # Secret key (SERVER-SIDE ONLY)
STRIPE_WEBHOOK_SECRET=             # Webhook signing secret

# Resend
RESEND_API_KEY=                    # Email API key (SERVER-SIDE ONLY)

# Encryption
ENCRYPTION_MASTER_KEY=             # For brand guidelines (SERVER-SIDE ONLY)
```

## Testing Checklist (Run After Each Feature)

- [ ] Upload image → verify scores appear
- [ ] Upload video as free user → verify blocked
- [ ] Upload video as paid user → verify 10 frames analyzed
- [ ] Hit quota limit (free) → verify upgrade modal
- [ ] Hit quota limit (paid) → verify overage allowed
- [ ] Cross-tenant test → verify can't access other tenant's data
- [ ] Invalid file upload → verify helpful error message
- [ ] Network error simulation → verify graceful handling

## Database Schema Overview

### Core Tables
- `tenants` - Organizations (one per signup, stores plan/quota/Stripe IDs)
- `profiles` - Links auth.users to tenants (role: owner/admin/member)
- `assets` - Uploaded file metadata (path, checksum, size)
- `scans` - Analysis records (scores, risk level, status)
- `scan_findings` - Detailed findings (type, severity, description)
- `video_frames` - Frame-by-frame analysis for videos
- `brand_profiles` - Encrypted custom brand guidelines
- `usage_ledger` - Quota tracking (atomic increment)
- `subscriptions` - Stripe subscription cache
- `audit_log` - Security audit trail (append-only)

### Every Table Must Have
- `id` (UUID primary key)
- `created_at` (timestamp)
- `tenant_id` (UUID, foreign key, indexed) - *except auth tables*
- RLS policies enabled

## Video Processing Rules

- **Paid tiers only** - Check plan before allowing upload
- **Extract 10 frames** - Evenly distributed (0%, 12.5%, 25%, ..., 95%, 100%)
- **Aggregate scores** - Use MAX(all frame scores), not average
- **Storage** - Delete frames after retention period (same as video)
- **Frame limit** - 10 frames balances cost vs coverage

## Quota Enforcement

```typescript
// CORRECT - Atomic server-side check
const { allowed, usage, remaining } = await consumeQuota(tenantId, 1);
if (!allowed && plan === 'free') {
  return res.status(403).json({ error: 'quota_exceeded' });
}
// For paid plans, allow overage (will bill automatically)
```

## Deployment Notes

- **Platform:** Vercel (automatic Next.js optimization)
- **Database:** Supabase (hosted PostgreSQL)
- **CDN:** Vercel Edge Network (automatic)
- **Region:** US East (iad1) - or closest to target users
- **Environment:** Separate env vars for preview vs production

## Lessons Learned (Updated as we build)

### Step 1: Next.js Initialization (2026-01-03)
- **Tailwind CSS v4 requires `@tailwindcss/postcss`** instead of the old `tailwindcss` PostCSS plugin
- PostCSS config must use `'@tailwindcss/postcss': {}` not `tailwindcss: {}`
- Next.js 16 uses Turbopack by default (much faster builds)
- TypeScript strict mode catches errors early - keep it enabled
- Always use `npm run type-check` before committing

### Step 2: Supabase Setup (2026-01-03)
- **Initial migrations must be run manually in SQL Editor** - Supabase doesn't expose `exec_sql` RPC by default
- **Storage policies require tenant_id from profiles** - Use `auth.uid()` to get user, then lookup `tenant_id`
- **Three separate Supabase clients needed:** browser (anon), server (anon or service role), middleware (session refresh)
- **Service role key bypasses RLS** - Only use for admin operations (Stripe webhooks, background jobs)
- **Environment variables in scripts** - Need `dotenv` to load `.env.local` in standalone TypeScript scripts
- **RLS helper function** - Created `public.user_tenant_id()` (not `auth.` - permission issue) for easy tenant filtering in policies
- **Atomic quota function** - Uses `FOR UPDATE` row locking to prevent race conditions

### Step 3: Authentication Flow (2026-01-03)
- **Server Actions for auth** - signup, login, logout all server-side (secure, no API routes needed)
- **Atomic tenant creation** - Signup creates user + tenant + profile in transaction (rollback on any failure)
- **First user = owner** - Role automatically set to 'owner' for first user in tenant
- **Password validation** - Zod schema: min 12 chars, uppercase, lowercase, number
- **Middleware protects routes** - Auto-redirect to login if accessing /dashboard without auth
- **Service role for signup** - Needed to create tenant/profile before user fully authenticated
- **Form validation both sides** - Client-side UX + server-side security (never trust client)

---

**Last Updated:** 2026-01-03 (Step 3 Complete - Auth fully functional)
