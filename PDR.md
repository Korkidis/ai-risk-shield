# Product Definition Record (PDR) — AI Risk Shield

> **Purpose:** This document defines what AI Risk Shield IS and IS NOT. It is the source of truth for product decisions, feature scoping, and go/no-go calls. Every code change, design choice, and marketing claim must be consistent with this document.

> **Last Updated:** February 16, 2026

---

## 1. What This Product Is

**AI Risk Shield is a forensic validation platform that turns AI content risk from a scary unknown into a quantified, documented decision.**

It answers one question: **"Is this AI-generated asset safe to publish?"**

It first delivers **findings** — what's wrong and why. Then, when needed, it delivers **a forensic report with mitigation strategy** — enough technical authority that a legal team, client, or compliance officer accepts it as due diligence.

It serves one moment: **The gap between "we made this with AI" and "we published it."**

### The Core Promise

When a marketing manager sees a headline about AI copyright lawsuits, when a designer's client asks "is this safe?", when legal blocks AI use — AI Risk Shield gives them:

1. **A number** (0-100 composite risk score) — defensible, quantified, instant
2. **A verdict** (safe / caution / review / high / critical) — actionable, not ambiguous
3. **A document** (PDF forensic report) — downloadable, shareable, audit-ready
4. **A provenance trail** (C2PA verification) — cryptographic, tamper-evident, timestamped

All delivered in under 20 seconds through an interface that looks like lab equipment, not a consumer toy.

### It's a Platform, Not a PDF Generator

The report is the gateway. The platform is the product.

AI Risk Shield isn't "upload → get PDF → leave." It's **the place where AI content decisions live:**

- The marketing manager returns before every campaign to validate new assets
- Legal/compliance logs in to review flagged scans and make go/no-go calls
- The agency account director pulls up provenance records when client legal has questions
- The designer shares scan results with their client to demonstrate professionalism
- Enterprise teams maintain a single source of truth for AI content governance

The sample report hooks them. The full report makes them look good in front of their boss. The **platform** — the dashboard, the archive, the accumulated evidence — is what makes this indispensable.

**The bigger picture:** Companies using AI content under hyperscaler agreements (Google, Microsoft, Adobe) need to prove compliance with terms. Insurance companies need evidence of due diligence for indemnity. Compliance platforms like Credo need data feeds. AI Risk Shield generates the defensible evidence that satisfies all of these — and having it centralized in one platform (not scattered PDFs on a desktop) is what makes it enterprise-grade and audit-ready.

Future: hosted report galleries (think Frame.io for compliance), DAM integrations, enterprise storage connectors. The archive becomes the compliance layer for AI content workflows.

### The Moat

- **Gemini multi-persona analysis** — Three AI "specialists" (IP Analyst, Safety Auditor, Report Generator) analyze every asset independently, then cross-reference. This produces richer, more defensible analysis than single-pass scanning.
- **C2PA provenance verification** — Reads and validates Content Credentials (the emerging standard). Most competitors ignore provenance entirely.
- **Instrument-grade UX** — The Braun/Dieter Rams aesthetic isn't decoration. It's deliberate: legal teams trust tools that look precise and authoritative. Consumer-grade UIs undermine the core promise.

---

## 2. Who Hires This Product

### When Do They Hire It? (Trigger Moments)

| Trigger | Emotional State | What They Need |
|---------|----------------|----------------|
| NYT v. OpenAI headline hits | "Oh shit, are WE at risk?" | Immediate validation of current assets |
| Client asks "Is this AI image safe?" | No answer, looks unprofessional | A report to send back same-day |
| Legal department blocks AI use | Frustrated — AI is faster/cheaper but banned | Proof/validation framework to unblock |
| Platform removes content | Embarrassed, need prevention | Pre-publish checking process |
| Insurance renewal asks about AI use | Need to show due diligence | Documentation of risk management |
| Competitor gets sued for AI content | Fear of being next | Batch validation of existing assets |
| Client legal sends 10 questions about asset creation | Overwhelmed, no documentation | A report that answers all of them |
| Agency pitch requires "responsible AI" proof | Need competitive differentiation | Process documentation + branded reports |
| Regulatory audit requests content authenticity records | Must produce provenance documentation | Audit-ready trails with timestamps |
| Internal audit discovers ungoverned AI use | Need to establish process company-wide | Validation workflow for teams |

### Primary Personas

**Marketing Manager at Growth-Stage Company**
- *Job:* "Validate this campaign image before launch so legal approves it"
- *Trigger:* CMO demands AI-scale content, Legal is nervous
- *Success:* "Legal signed off in 1 hour instead of 2 weeks"
- *Plan:* PRO ($49/mo) — 50 scans/month covers regular campaign work

**Freelance Designer / Creative**
- *Job:* "Answer my client's 'Is this safe?' question professionally"
- *Trigger:* Client asks about AI risk, designer has no answer
- *Success:* "Client impressed with forensic report, paid invoice faster"
- *Plan:* FREE (3 scans) → $29 per-report for client deliverables

**In-House Legal / Compliance**
- *Job:* "Give marketing a framework to use AI without calling me every time"
- *Trigger:* 50 marketing requests to review AI images per week
- *Success:* "Marketing self-serves validation, I only review red flags"
- *Plan:* TEAM ($199/mo) — custom thresholds (auto-approve <40, escalate >70)

**Agency Account Director**
- *Job:* "Streamline client approval with documented provenance"
- *Trigger:* Client legal requires proof for every deliverable
- *Success:* "Client approves full campaign in one meeting instead of three"
- *Plan:* AGENCY ($499/mo) — bulk scanning + branded reports

**Enterprise Risk/Compliance Officer**
- *Job:* "Establish and enforce AI content governance policy"
- *Trigger:* Board asks "How are we managing AI risk?"
- *Success:* "Implemented validation workflow, zero incidents in 12 months"
- *Plan:* ENTERPRISE (custom) — audit dashboard, SSO, dedicated support

### Champion / Recommender Persona

**IP Attorney (In-House or Agency Counsel)**
- *Role:* Not a daily user — the person who RECOMMENDS or REQUIRES the tool
- *Job:* "Give my clients a framework to validate AI content so they stop calling me for every image"
- *Trigger:* Client sends C&D letter, or attorney sees AI risk patterns across multiple engagements
- *Value:* Trusts the forensic report enough to cite it in legal memos; recommends tool to marketing teams
- *Why they matter:* When an IP attorney tells a marketing team "use this tool," it becomes mandatory. They're the highest-leverage recommender.

### What They're Firing (Alternatives We Replace)

| Alternative | Why It Fails |
|-------------|-------------|
| Doing nothing (hope for the best) | Too risky — headlines everywhere |
| Manual legal review ($400/hr, 2-week turnaround) | Too slow, doesn't scale |
| Reverse image search | Only catches exact copies, not similarity/style |
| Reading AI vendor ToS | Confusing, doesn't validate specific outputs |
| Generic content moderation tools (NSFW only) | Don't check IP risk or provenance |
| Avoiding AI entirely | Competitive disadvantage |
| Manual provenance spreadsheets | Error-prone, not verifiable, no audit trail |
| Relying on vendor indemnification | Doesn't cover output infringement |
| "Agency says it's fine" | Legal doesn't accept that anymore |
| Consumer-grade tools | Legal doesn't trust tools that look like toys |

---

## 3. How Users Measure Success

### Functional Success
- Got a clear risk score in under 20 seconds
- Can download a report to show legal/client
- Didn't publish risky content (avoided lawsuit/takedown)
- Platform didn't ban the post
- Client legal approved deliverables without additional documentation
- Complete provenance trail available for audit/litigation
- Got actionable mitigation steps (not just "it's risky")

### Emotional Success
- Feel confident hitting "publish"
- Can sleep at night (not worried about lawsuit)
- Boss/client thinks I'm thorough and professional
- Feel sophisticated using the tool (interface conveys expertise)

### Social Success
- Legal team approves AI use (I'm the hero who unblocked it)
- Saved company from potential liability
- Enabled marketing to move faster with AI
- Agency differentiated in pitch: "We validate all AI content"
- Compliance can report to board: "AI governance established"

### Enterprise Success
- Reduced legal review bottleneck by 80% (self-clearing low-risk content)
- Client approval cycle shortened from 2 weeks to 2 days
- Zero AI-related incidents in 12 months
- Custom brand rules eliminate false positives

---

## 4. What This Product Does NOT Do

These are **hard boundaries**. If a feature request falls into this list, the answer is no.

| Boundary | Explanation |
|----------|-------------|
| Give legal advice ("Can I publish this?") | We give data and risk scores. The lawyer decides. |
| Create or generate AI content | We validate, not generate. |
| Monitor published content continuously | We scan on-demand. Continuous monitoring is a different business. |
| Represent users in court | Our forensic report is evidence, not legal defense. |
| Guarantee zero risk | We assess and quantify risk. We cannot eliminate it. |
| Replace legal review entirely | High-risk content (score >70) still needs a lawyer. We reduce the volume that reaches them. |
| Validate non-AI content | Designed for AI outputs. General IP clearance is a different tool. |
| Scan competitors' content | Legal/ethical issues. Not our market. |
| Generate alternative content | We identify problems. Users fix them with their own tools. |

---

## 5. The Product Surface

### One Scanner. One Result View. One Archive.

| Surface | Purpose | URL |
|---------|---------|-----|
| **Landing page** | On-ramp. Show immediate value. Convert to account. | `/` |
| **Dashboard** | THE product. Scan assets. View results. Convert free users. | `/dashboard` |
| **Scans & Reports** | Archive. Search, filter, download past scans and reports. | `/dashboard/scans-reports` |

### The Flow

```
ANONYMOUS USER:
  Landing page → upload asset → brief processing animation
  → Redirect to /dashboard?scan=<id>
  → See: risk score + C2PA telemetry + safety scores (visible)
  → See: findings (gated — blurred/locked)
  → CTA (above fold, below scores): "Enter email to unlock details & access sample report"
  → Email captured → magic link sent
  → Click magic link → account auto-provisioned (free plan) → scan saved
  → Return to /dashboard?scan=<id>
  → Findings revealed + sample report downloadable (PDF: hero finding + teaser)
  → CTA changes to: "Buy Full Report ($29)" — unlocks complete findings + deep mitigation
  → Scan saved to /dashboard/scans-reports archive

AUTHENTICATED FREE USER (3 scans/month, 3 sample reports):
  /dashboard → upload → processing → results in-place
  → Score + C2PA telemetry visible
  → Findings revealed (free users see basic findings after email capture)
  → CTA (above fold): "Download Sample Report" (PDF with hero finding)
  → CTA (secondary): "Buy Full Report ($29)" → complete findings + mitigation
  → Drawer: findings log + C2PA telemetry stream + "Buy Full Report" CTA

AUTHENTICATED PAID USER:
  /dashboard → upload → processing → full results
  → Everything visible: findings, C2PA details, full provenance
  → CTA (above fold): "Generate Deep Mitigation Report" (if not yet generated)
    → Triggers second Gemini call with findings + brand guidelines context
    → Produces tailored remediation strategy document
    → Quota-limited per tier (~5% of monthly scans)
  → CTA (above fold, if mitigation exists): "Download Mitigation Report"
  → "View Full Provenance" button → opens side drawer
  → Drawer: findings log + C2PA telemetry + mitigation CTA + "Download Findings PDF"
  → All scans saved to /dashboard/scans-reports

ALL USERS:
  /dashboard/scans-reports → browse past scans as thumbnails
  → Search, filter (high risk / safe / all), sort, bulk actions
  → Click thumbnail → image detail view + side drawer opens
  → Drawer shows: findings log, C2PA telemetry, comments
  → Generate or download reports (sample/full/mitigation depending on tier)
  → Previously generated reports stored as attachments (downloadable)
  → Invite team members, leave comments
  → Delete scan (de-emphasized, not primary action)
```

### The Value Ladder

Each step delivers meaningfully more than the last. No step feels like repackaging.

| Step | What User Gets | Cost | Gemini Calls |
|------|---------------|------|-------------|
| **1. Free scan** | Risk score + C2PA status + safety scores (visible). Findings gated/blurred. | Free (3/mo) | 1 (standard analysis) |
| **2. Email capture** | Findings revealed + sample report PDF (hero finding + teaser). | Free (email) | 0 (uses existing data) |
| **3. Deep Report** | Enhanced analysis + full C2PA chain + strategic briefing + tailored mitigation. Stored as scan attachment. | $29 one-time OR included in subscription quota | 1 additional (mitigation + brand context) |

**$29 = deep findings + mitigation.** One price, one product. Same whether it's a one-time purchase, a subscription report, or an overage report. Always $29.

### Report Quotas Per Tier

| Plan | Scans/mo | Deep Reports (included) | Overage Cost |
|------|----------|------------------------|-------------|
| FREE | 3 | 0 | $29/report |
| PRO | 50 | 5 | $29/report |
| TEAM | 300 | 30 | $29/report |
| AGENCY | 1000 | 100 | $29/report |
| ENTERPRISE | Custom | Unlimited | Included |

~10% of scan volume as deep report quota. Every scan produces findings (included in scan). Deep reports with mitigation are the premium, quota-limited asset.

### The Consumption Flywheel

1. **Scans are cheap** — high volume, low unit cost. Every scan shows findings.
2. **Most scans are fine** — safe score, no action needed. Findings confirm "you're good."
3. **Some scans flag risk** — these need the deep report with mitigation strategy.
4. **Mitigation is scarce** — ~5% of scan quota. Users burn reports only on high-risk items.
5. **Need more?** → Buy per-report ($29) or upgrade tier for better ratio.

### Why Subscriptions Win

| | One-Time | PRO ($49/mo) | TEAM ($199/mo) | AGENCY ($499/mo) |
|---|---|---|---|---|
| Deep reports included | 1 | 5 | 30 | 100 |
| Per-report cost | $29 | ~$9.80 | ~$6.63 | ~$4.99 |
| Break-even vs one-time | — | 2 reports/month | 7 reports/month | 18 reports/month |

At 2+ deep reports/month, PRO is cheaper than buying one-time. The subscription sells **volume and workflow** — not depth.

### CTA Zone Placement

The CTA zone sits **above the fold, below the score/telemetry area** on the dashboard results view. Same physical space, different content by tier:

| User State | CTA in Results Area | CTA in Drawer |
|-----------|-------------------|---------------|
| Anonymous (pre-email) | "Enter email to unlock details & sample report" | N/A (drawer not accessible) |
| Free (post-email) | "Download Sample Report" | "Generate Deep Report ($29)" |
| Paid (post-scan, no deep report) | "Generate Deep Report" (uses quota) | Same + "Download Findings PDF" |
| Paid (deep report exists) | "Download Deep Report" | "View Full Provenance" → opens drawer |
| Any user (quota exceeded) | "Generate Deep Report ($29)" (overage) | Same |

The drawer opens via a "View Full Provenance / Manifest" button — visually clear invitation to go deeper.

### What Each Surface Shows

**Dashboard (`/dashboard`) — THE Product**
- Left pane: RSScanner (dark mode, drag-drop upload, scanning animation)
- Right pane: RSRiskPanel (score + verdict) + RSTelemetryPanel (C2PA telemetry grid)
- CTA Zone (above fold): tier-appropriate CTA (see table above)
- Below CTA: RSFindingsDossier (gated/blurred for anonymous, visible for auth)
- "View Full Provenance" button → RSProvenanceDrawer (side drawer with full C2PA + findings log)
- Processing state: real-time telemetry from Gemini analysis via Supabase Realtime
- Results persist via `?scan=<id>` URL param (survives refresh)

**Scans & Reports (`/dashboard/scans-reports`) — The Archive**
- Thumbnail grid of all scans (future: folders)
- Search, filter by risk level (high risk / safe / all), sort by date
- Click thumbnail → image detail + side drawer opens
- Drawer: findings log, C2PA telemetry stream, comments
- Report actions: generate/download sample, full, or mitigation reports
- Previously generated reports stored as scan attachments
- Team: invite members, leave comments
- Delete scan (de-emphasized)

**Landing Page (`/`) — The On-Ramp**
- Hero + FreeUploadContainer (lightweight scanner)
- After scan: redirect to `/dashboard?scan=<id>` (user experiences the real product)
- Marketing sections: How It Works, Pricing, Trust & Compliance

---

## 6. Pricing & Business Model

### Hybrid Billing: Subscriptions + Per-Report Purchases + Metered Overage

| Tier | Price | Scans/mo | Deep Reports (included) | Target |
|------|-------|----------|------------------------|--------|
| **FREE** | $0 | 3 | 0 | Try before you buy |
| **PRO** | $49/mo | 50 | 5 | Freelancer / regular user |
| **TEAM** | $199/mo | 300 | 30 | Studio / department |
| **AGENCY** | $499/mo | 1,000 | 100 | Production house |
| **ENTERPRISE** | Custom | Custom | Unlimited | Corporate / legal |

Every scan produces findings (included with scan). Deep reports (findings + mitigation) are the premium, quota-limited asset.

### One Price: $29 per Deep Report
Available to any user, any plan. Includes **enhanced findings + full C2PA chain + tailored mitigation strategy**. Same price whether one-time purchase, subscription overage, or standalone buy.

### Overage Pricing

| | Scan Overage | Deep Report Overage |
|---|---|---|
| **PRO** | $2.50/scan | $29/report |
| **TEAM** | $1.00/scan | $29/report |
| **AGENCY** | $0.60/scan | $29/report |

- Scan overage deliberately punishing on PRO ($2.50) → drives TEAM upgrades
- Deep report is always $29 — simple, no tier-based confusion

### Margin Target: 96%+
- Scan: ~$0.015 (Gemini API + storage)
- Deep report: ~$0.03-0.05 (additional Gemini call with brand context)
- At $29/report, margin is 99%+

---

## 7. The Trust Rule

> **This product sells trust to legal teams. It cannot contain lies.**

Every number on screen must be real or absent.
Every progress message must reflect a real analysis step.
Every button must do what it says.
Every upgrade modal must list only features that exist today.
Every "remaining scans" counter must read from the database.

If a feature isn't built, don't show it. If a number isn't computed, don't display it. If a button doesn't work, don't render it.

**This is non-negotiable.** The entire value proposition collapses if a legal team discovers any fabrication in the tool they're relying on for due diligence.

---

## 8. Technical Foundation

### Analysis Engine
- **Model:** Gemini 2.5 Flash (3 personas: IP Analyst, Safety Auditor, Report Generator)
- **Scoring:** Weighted composite (IP 70%, Provenance 20%, Safety 10%) with red-flag override at >=85
- **C2PA:** 5-value fidelity system (verified / caution / untrusted / invalid / missing)
- **Single source of truth:** `lib/risk/tiers.ts` and `lib/risk/scoring.ts`

### Architecture
- Next.js 14 (App Router) + Supabase (Postgres + Auth + Storage + Realtime) + Stripe
- Multi-tenant with RLS on every table
- Session-based anonymous tracking → account creation → scan ownership transfer
- PDF generation via `lib/pdf-generator.ts`
- **Web UI only** — no public API exists. All plans are UI-only in v1. API access is a future enterprise feature.

### Data Model
- `risk_profile` JSONB blob on scans table = canonical rich data source
- `provenance_details` table = C2PA-specific details (populated for valid/caution only)
- `scan_findings` table = individual findings with severity + confidence

---

## 9. What's Real Today vs. What's Next

### Shipping Now (Works End-to-End)
- Anonymous upload + Gemini analysis + risk scoring
- C2PA provenance verification
- PDF report generation (sample for free, full for paid)
- Stripe billing (subscriptions + one-time purchases)
- Magic link email gate + shadow user creation
- Scans & Reports archive with search/filter
- Supabase Realtime for scan status updates
- Multi-tenant isolation with RLS
- 5-tier plan configuration in `lib/plans.ts`

### Not Wired Yet (Exists in Code/Schema, Not Tested E2E)
- **Metered overage billing** — Stripe Usage Records code exists but not verified. Core to the hybrid consumption model.
- **API access** — No API exists for any plan. All interaction is through the web UI. API is on the roadmap but not v1.
- **Shadow user → tenant provisioning** — Auth user created but no profile/tenant. Dashboard crashes.
- **Scan assignment** — Anonymous scans don't transfer `tenant_id` to dashboard.
- **Deep Mitigation Reports** — Schema exists (`mitigation_reports` table). PDF generator has `chief_officer_strategy` field. But no separate generation flow, no quota tracking, no second Gemini call. Needs to be built as a first-class feature.
- **Report quota enforcement** — `monthly_report_limit` exists in plans.ts but no code checks it. Currently unlimited report downloads for paid users.

### Must Fix Before Launch
- Shadow user provisioning (auth/callback creates no profile/tenant)
- Scan assignment (anonymous scans don't transfer tenant_id)
- Unified scan flow (landing → dashboard redirect, dashboard as single result surface)
- Metered overage billing (verify Stripe Usage Records work E2E)
- Report quota enforcement (track and limit full reports + mitigation reports per tier)
- Deep Mitigation Report generation (second Gemini call with brand context)
- Scripted telemetry → real analysis progress
- Hardcoded quota displays → live database reads
- AuditModal feature claims → only list what exists
- `/api/scans/process` authentication
- `listUsers()` scalability
- Remove `/api/debug-provenance`

### Roadmap (Post-Launch)
- Brand Guidelines wired to analysis (schema ready, UI built, not connected to scan pipeline)
  - **Critical for mitigation reports** — brand context makes mitigation dramatically more valuable
- Insurance referral integration
- **API access** (no API exists today for any plan)
- Bulk upload UI
- White-label reports for agencies
- SSO (Okta/Azure AD)
- Team comments and collaboration on scans
- Scan folders / organization
- Continuous monitoring (future product line, not v1)

---

## 10. Decision Framework

When evaluating any feature request, code change, or design decision, ask:

1. **Does it help someone confidently publish AI content?** If no, it's out of scope.
2. **Does it produce or enhance the forensic report?** The report is the deliverable. Everything else is infrastructure.
3. **Would a legal team trust this?** If it looks like a toy, feels approximate, or contains any theater — fix it or cut it.
4. **Does it serve a trigger moment?** (Section 2) If it doesn't connect to a real scenario where someone needs this product, deprioritize it.
5. **Does it violate the Trust Rule?** (Section 7) If yes, it's a blocker, not a feature.

---

*"Scared → validated → PDF in hand. That is the entire product."*
