# Implementation Plan — Conversion Gate & Canonical Dashboard
*Last updated: 2026-02-11*

## Intent
Unify post‑scan experience around **one product reality**:
- **Dashboard → Scans & Reports** is the product.
- **Freemium landing** is a **thin bridge** that shows value, creates a pending‑verification account, and hands off to the dashboard.

This plan improves conversion without breaking the current flow and keeps the PDF as the core paid artifact.

---

## Principles (Non‑Negotiable)
1. **Account creation is pending verification.** We create a shadow user and only authenticate after the magic link.
2. **Dashboard is canonical.** Purchases, history, and full reports live in Scans & Reports.
3. **No broken paths.** Do not deprecate `/scan/[id]` until the dashboard route is fully wired and tested.
4. **Canonical scoring rules.** Thresholds align with tiers (91/76/51/26); no ad‑hoc thresholds.

---

## Step 1 — Redesign the Gate (Freemium as Bridge)
**File:** `components/landing/ScanResultsWithGate.tsx`

Replace the “Authorized Recipient” flow with a **mini sign‑up**:
- Email input (same styling)
- Opt‑in checkbox (marketing consent)
- Sub‑text: “Creates your free AI Risk Shield account (pending verification)”
- Button: “CREATE ACCOUNT & DOWNLOAD REPORT”

On submit:
1. POST `/api/scans/capture-email` with `{ scanId, email, marketingConsent }`
2. Immediately download **sample PDF** client‑side (insurance against email failure)
3. Replace form with success state:
   - “Account created (pending verification). Sample report downloading.”
   - “Check email for full dashboard access.”
4. Show **inline CTAs** ($29 one‑time, $49/mo Pro) **in‑context**

**Also:** pass `filename` and `isVideo` through from landing upload so PDF generation has correct metadata.

---

## Step 2 — Immediate Sample PDF Download
**File:** `components/landing/ScanResultsWithGate.tsx`

Reuse `generateForensicReport()` from `lib/pdf-generator.ts`:
- `generateForensicReport(scan, riskProfile, true)`
- No blob URL needed; use existing `jsPDF` save.

---

## Step 3 — Update Capture Email API
**File:** `app/api/scans/capture-email/route.ts`

- Accept `marketingConsent` boolean
- Store in `user_metadata` on shadow user
- Update redirect URL to:
  `/auth/callback?next=/dashboard/scans-reports?scan=${scanId}&welcome=true`

---

## Step 4 — Honor `next` param in Auth Callback
**File:** `app/auth/callback/route.ts`

Support safe redirects:
```
const next = requestUrl.searchParams.get('next')
const redirectPath = next?.startsWith('/') && !next.includes('://') ? next : '/dashboard'
return NextResponse.redirect(requestUrl.origin + redirectPath)
```

---

## Step 5 — Email Templates Route to Dashboard
**Files:**
- `components/email/SampleReportEmail.tsx`
- `components/email/MagicLinkEmail.tsx`

Change CTA text to **“Go to Your Scans & Reports”**.

---

## Step 6 — Dashboard Scans & Reports Param Handling
**File:** `app/(dashboard)/dashboard/scans-reports/page.tsx`

- Read `scan` and `welcome` from search params
- If `scan`: auto‑select and open drawer
- If `welcome=true`: show dismissible banner and call `/api/scans/assign-to-user`

---

## Step 7 — Purchase CTAs in Drawer
**File:** `app/(dashboard)/dashboard/scans-reports/page.tsx`

For **unpurchased** scans:
- Locked section
- `OneTimePurchaseButton` ($29)
- `UpgradeButton` ($49/mo)

For **purchased** scans:
- “Download Full Report” button

---

## Step 8 — Insurance Referral CTA (High‑Risk Only)
**New:** `components/dashboard/InsuranceReferralCTA.tsx`

Render only when score maps to **High/Critical** tier (align with tiers).
Show subtle “Enterprise Protection Available” CTA.

---

## Step 9 — Deprecate `/scan/[id]` (Only After Dashboard Works)
**File:** `app/scan/[id]/page.tsx`

Until fully wired:
- Keep current flow (auto‑download + audit modal)

After:
- Authenticated → redirect to `/dashboard/scans-reports?scan={id}`
- Unauthenticated → minimal teaser + “Create Account”

---

## Step 10 — Cleanup Stubs
- `app/(dashboard)/dashboard/history/page.tsx` → redirect to scans‑reports
- `app/(dashboard)/dashboard/reports/page.tsx` → redirect to scans‑reports

---

## Verification (Happy Path)
1. Upload on landing
2. Enter email → **PDF downloads immediately**
3. Email arrives → click magic link
4. Land on `/dashboard/scans-reports?scan=...&welcome=true`
5. Drawer open, CTAs visible, purchase works

---

## Guardrails
- Keep `/scan/[id]` until dashboard path is tested end‑to‑end
- Ensure C2PA **caution** renders in UI widgets and PDF
- Canonical scoring thresholds only (91/76/51/26)
