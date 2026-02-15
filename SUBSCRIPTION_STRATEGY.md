---
Status: Active
Last Updated: Feb 1, 2026
Owner: Product Lead
Context: The canonical reference for all pricing, limits, and entitlements. Drives `lib/plans.ts` and Stripe logic.
---

# Subscription Strategy & Pricing Model
**Version:** 1.0 | **Status:** Source of Truth | **Last Updated:** February 1, 2026

> [!IMPORTANT]
> This document is the **canonical reference** for all pricing, limits, and entitlements.
> All code (`lib/plans.ts`, Stripe webhooks, UI pricing pages) MUST reflect these values exactly.

---

## 1. Pricing Tiers Overview

| Tier | **FREE** | **PRO** | **TEAM** | **AGENCY** | **ENTERPRISE** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Target User** | Curious Tester | Freelancer | Small Studio | Production House | Corporate/Legal |
| **Monthly Price** | $0 | $49 | $199 | $499 | Contact Sales |
| **Annual Price** (20% off) | — | $470/yr | $1,910/yr | $4,790/yr | Custom |
| **Effective $/mo** (Annual) | — | $39.17 | $159.17 | $399.17 | — |
| **🔑 Key Unlock** | *"3 Scans to Test"* | *"Brand Profile + Pro Reports"* | *"Multi-Seat + Bulk Upload"* | *"White-Label + Priority Queue"* | *"SSO + Dedicated CSM"* |

---

## 2. Core Limits (Entitlements)

| Limit | **FREE** | **PRO** | **TEAM** | **AGENCY** | **ENTERPRISE** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Seats** | 1 | 1 | 5 | 15 | Custom |
| **Monthly Scans** | 3 | 50 | 300 | 1,000 | Custom |
| **Scan Overage Cost** | BLOCKED | **$2.50** | $1.00 | $0.60 | Negotiated |
| **Mitigation Reports** | 0 | 5 | 20 | 100 | Unlimited |
| **Report Overage Cost** | $29 | $20 | $15 | $10 | Custom |
| **Brand Profiles** | 0 | 1 | 5 | 20 | Unlimited |
| **Data Retention** | 7 days | 30 days | 90 days | 1 year | 2 years (default; custom by contract) |

> [!NOTE]
> Enterprise limits are **contract‑specific**. The codebase uses high defaults as a safety ceiling; contracts override them.
### Overage Psychology
PRO overage is deliberately **punishing** ($2.50/scan = 5x base cost) to drive upgrades to TEAM.

| PRO User Scenario | Total Cost | vs. TEAM ($199) |
| :--- | :--- | :--- |
| 50 scans (included) | $49 | Save $150 |
| +50 overage | $49 + $125 = $174 | Save $25 |
| +60 overage | $49 + $150 = **$199** | Break-even |
| +75 overage | $49 + $187.50 = $236.50 | **Upgrade trigger** |

---

## 3. Feature Flags (Boolean Entitlements)

| Feature | **FREE** | **PRO** | **TEAM** | **AGENCY** | **ENTERPRISE** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Full Report Access** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Bulk Upload** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Co-Branding** *(Add your logo)* | ❌ | ❌ | ✅ | ✅ | ✅ |
| **White-Label** *(Remove our brand)* | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Team Activity Dashboard** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Audit Logs** *(Compliance)* | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Priority Processing Queue** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **SSO (Okta/Azure)** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Dedicated CSM** | ❌ | ❌ | ❌ | ❌ | ✅ |

### Feature Definitions

| Feature | Description |
| :--- | :--- |
| **Co-Branding** | *"Add your studio's logo to PDF reports. Look professional to clients while we do the forensic work."* |
| **White-Label** | *"Your brand, your product. AI Risk Shield disappears entirely—resell as your own service."* |
| **Audit Logs** | Full compliance trail: who scanned what, when, and what actions were taken. Required for SOC 2 / Legal. |
| **Priority Queue** | **Planned**: Agency scans skip ahead of Free/Pro users during high traffic. Target SLA: <5s image, <15s video. |

### Implementation Status (As of Feb 2026)
The feature table above defines **entitlements**, not necessarily shipped UI or workflows. Use these labels when communicating externally:
- **Shipped**: Full Report Access (core flow), Stripe billing, plan enforcement, metered usage reporting.
- **Planned**: Bulk Upload, Co-Branding, White-Label, Team Activity Dashboard, Audit Logs, Priority Queue SLA enforcement, SSO, Dedicated CSM.

---

## 4. Support Tiers

| Tier | **FREE** | **PRO** | **TEAM** | **AGENCY** | **ENTERPRISE** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Channel** | Community (Discord) | Email (48h SLA) | Email (24h SLA) | Slack (4h SLA) | Dedicated Slack + CSM |

> [!NOTE]
> Support SLAs are **target commitments**; automation and staffing to enforce them is planned.

---

## 5. Unit Economics

### Cost per Scan (COGS)

| Component | Image (70%) | Video (30%) | **Weighted Avg** |
| :--- | :--- | :--- | :--- |
| AI Compute (Gemini Flash) | $0.009 | $0.025 | $0.014 |
| Storage + Bandwidth | $0.002 | $0.008 | $0.004 |
| Compute (Vercel/C2PA) | $0.001 | $0.002 | $0.001 |
| **TOTAL COGS** | **$0.012** | **$0.035** | **$0.015** |

### Margin Analysis (Base Subscription)

| Tier | Revenue | Scans | COGS | **Gross Margin** |
| :--- | :--- | :--- | :--- | :--- |
| **PRO** | $49 | 50 | $0.75 | **98.5%** |
| **TEAM** | $199 | 300 | $4.50 | **97.7%** |
| **AGENCY** | $499 | 1,000 | $15.00 | **97.0%** |

### LTV Analysis (Conservative: 15% Monthly Churn)

| Metric | PRO | TEAM | AGENCY |
| :--- | :--- | :--- | :--- |
| **Monthly Gross Profit** | $48.25 | $194.50 | $484.00 |
| **Avg. Lifespan** | 6.7 months | 6.7 months | 6.7 months |
| **LTV** | **$323** | **$1,303** | **$3,243** |
| **LTV:CAC** (@ $50 CAC) | **6.5x** | **26x** | **65x** |

> [!NOTE]
> Annual prepay eliminates Year 1 churn, effectively doubling LTV.

---

## 6. Billing Logic

### Stripe Integration

| Event | Action |
| :--- | :--- |
| `checkout.session.completed` | Update `tenants.plan`, apply limits from this doc |
| `customer.subscription.updated` | Sync `subscription_status`, handle upgrades/downgrades |
| `invoice.created` | Attach overage line items (scans + reports) |
| `customer.subscription.deleted` | Downgrade to FREE, reset limits |

### Overage Billing
**Allocated Limits vs. Metered Usage:**
- **Allocated**: Plan limits (e.g., 50 scans) are enforced by `monthly_scan_limit` in DB.
- **Metered**: Usage *beyond* the limit is handled by Stripe Metered Billing.
- **Implementation**:
    1.  Checkout Session includes `price_metered_xxx` (Usage Type: Metered).
    2.  Webhook stores `stripe_metered_item_id` in `tenants`.
    3.  `reportScanUsage()` calls Stripe API `usage_records.create({ action: 'increment' })` on every scan.
    4.  Stripe automatically calculates overage at end of billing cycle based on tiers.

```typescript
// lib/stripe-usage.ts
await stripe.subscriptionItems.createUsageRecord(meteredItemId, {
  quantity: 1,
  action: 'increment',
  timestamp: 'now'
})
```

---

## 7. Database Schema (Enforcement)

### Required Columns in `tenants`
```sql
plan TEXT CHECK (plan IN ('free', 'pro', 'team', 'agency', 'enterprise'))
monthly_scan_limit INTEGER NOT NULL DEFAULT 3
monthly_report_limit INTEGER NOT NULL DEFAULT 0
seat_limit INTEGER NOT NULL DEFAULT 1
brand_profile_limit INTEGER NOT NULL DEFAULT 0
retention_days INTEGER NOT NULL DEFAULT 7
-- Feature flags
feature_bulk_upload BOOLEAN DEFAULT false
feature_co_branding BOOLEAN DEFAULT false
feature_white_label BOOLEAN DEFAULT false
feature_audit_logs BOOLEAN DEFAULT false
feature_priority_queue BOOLEAN DEFAULT false
feature_sso BOOLEAN DEFAULT false
```

### Required Columns in `usage_ledger`
```sql
scans_used INTEGER NOT NULL DEFAULT 0
reports_used INTEGER NOT NULL DEFAULT 0
overage_scans INTEGER NOT NULL DEFAULT 0
overage_reports INTEGER NOT NULL DEFAULT 0
```

---

## 8. Implementation Checklist

- [x] Create `lib/plans.ts` with all values from this document
- [x] Update `app/api/stripe/webhook/route.ts` to apply limits on upgrade
- [x] Update `lib/entitlements.ts` to read from `plans.ts`
- [x] Add feature flag columns to `tenants` table (migration)
- [x] Update `consume_quota()` to allow overages for paid plans
- [x] Build pricing page UI reflecting these tiers
- [x] Implement annual billing option in Stripe checkout
- [x] Implement Stripe Metered Billing (usage reporting)

---

## 9. Revision History

| Date | Version | Author | Changes |
| :--- | :--- | :--- | :--- |
| 2026-02-01 | 1.1 | AI + Product | Implemented Metered Billing, Annual Discounts, and Pricing Page |
| 2026-02-01 | 1.0 | AI + Product | Initial spec: 5 tiers, annual discount, overage pricing |

---

*End of Subscription Strategy*
