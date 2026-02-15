---
Status: Superseded — See `brain/implementation_plan.md`
Last Updated: 2026-02-11
Owner: Implementation Team
Context: Original freemium implementation plan. Current strategy: **dashboard Scans & Reports is canonical**, landing is a thin bridge.
---

## Reality Update (Feb 11, 2026)
- Freemium landing is **bridge-only**: show score + sample PDF, then route to dashboard.
- Account creation is **pending verification** (shadow user + magic link).
- Email should route to `/dashboard/scans-reports?scan=...&welcome=true`.
- PDF generation exists but is still fed thin data until Phase A (pipeline unification + risk_profile handoff) lands.

> **Pricing Details**: See [SUBSCRIPTION_STRATEGY.md](SUBSCRIPTION_STRATEGY.md) for the comprehensive pricing model, tier limits, and unit economics.

### Completed ✅
1. Database migration created (`20260104_freemium_model.sql`)
2. Landing page with hero section created (`app/page.tsx`)

### Next Steps (In Order)

#### 1. Run Database Migration
```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/20260104_freemium_model.sql
```

#### 2. Create Free Upload Component
File: `components/landing/FreeUploadContainer.tsx`
- Anonymous upload (no login)
- Generate session ID (UUID stored in cookie)
- Upload to storage with session_id
- Create scan record with session_id (no tenant_id)
- Show processing spinner
- Auto-poll for results

#### 3. Create Results Display with Email Gate
File: `components/landing/ScanResultsWithGate.tsx`
- Show teaser: Risk score + top 3 findings (blurred)
- "Enter email to see full report" modal
- After email: Full report visible + upgrade CTA
- Track in scans.email + scans.email_captured_at

#### 4. Update Upload Actions for Anonymous
File: `app/api/scans/create-anonymous/route.ts`
- Accept session_id from cookie
- Create asset with session_id (no user_id, no tenant_id)
- Create scan with session_id
- Return scan_id

#### 5. Create Email Capture Flow
File: `app/api/email/capture/route.ts`
- Accept: email + scan_id
- Update scan.email
- Create temp account (if doesn't exist)
- Send email with full report link
- Return success

#### 6. One-Time Purchase Flow ($29)
Files:
- `app/api/stripe/create-checkout/route.ts` - Create Stripe session
- `app/api/stripe/webhook/route.ts` - Handle payment success
- `components/landing/UpgradeModal.tsx` - Pricing modal

#### 7. Session Management
File: `lib/session.ts`
- Generate session ID (v4 UUID)
- Store in httpOnly cookie
- Retrieve on requests
- 30-day expiration

#### 8. Anonymous Scan Limits
- Track scans per session_id (3/month)
- Show "X scans remaining" counter
- After 3: Show upgrade modal

## Database Schema Changes

### scans table
- `analyzed_by` - Now nullable for anonymous
- `session_id` - UUID for anonymous tracking
- `email` - Captured at gate
- `email_captured_at` - Timestamp
- `purchased` - Boolean (paid for full report)
- `purchase_type` - 'one_time' | 'subscription'

### assets table
- `uploaded_by` - Now nullable
- `session_id` - UUID for anonymous

### RLS Policies Added (Hardened Feb 1, 2026)
- Anonymous can INSERT assets (with strict session_id checks)
- Anonymous can SELECT own assets (by session_id)
- Anonymous can INSERT scans (with strict session_id checks)
- Anonymous can SELECT own scans (by session_id)
- Anonymous can SELECT findings for own scans
- **Security Update**: All `auth.functions` are wrapped in `SELECT` for performance, and permissive policies are restricted where possible.

## Conversion Funnel

```
100 visitors
  ↓ 60% upload (60)
  ↓ 70% wait for results (42)
  ↓ 45% enter email (19)
  ↓ 15% purchase one-time (3)
  ↓ 5% subscribe (1)

Total revenue per 100 visitors:
- One-time: 3 × $29 = $87
- Subscription: 1 × $49/mo (Pro) = $49/mo

Est. monthly with 10K visitors:
- 100 × $87 = $8,700 one-time
- 100 × $49 = $4,900/mo recurring (Pro)
```

## Implementation Time Estimate

- Database migration: 5 min
- Free upload component: 30 min
- Results with email gate: 45 min
- Anonymous upload API: 20 min
- Email capture flow: 30 min
- Stripe one-time purchase: 60 min
- Session management: 20 min
- Anonymous limits: 15 min

**Total: ~4 hours**

## What's Working Now

Currently, the authenticated flow works:
- Login/Signup functional
- Dashboard with upload
- Full AI analysis (Gemini)
- Results display with findings

This freemium model adds:
- Anonymous landing page uploads
- Email gate for lead capture
- One-time $29 purchase option
- 3 free scans/month limit
