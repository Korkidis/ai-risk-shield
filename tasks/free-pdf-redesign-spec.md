# Free PDF Report Redesign — Spec & Implementation Record

**Date:** 2026-03-15
**Status:** V1 Implemented

---

## 1. Current-State Audit

### What the free PDF had before this change

The free PDF was generated via `generateForensicReport(scan, profile, isSample=true)` in `lib/pdf-generator.ts`. It was attached to the email sent from `app/api/scans/capture-email/route.ts`.

**Problems identified:**

| Problem | File | Line(s) |
|---------|------|---------|
| Header: "SAMPLE FORENSIC ANALYSIS" | pdf-generator.ts | 105 |
| Only 1 hero finding shown, rest gated behind 80-char teasers | pdf-generator.ts | 269-339 |
| `MITIGATION: {hint}` inline on findings | pdf-generator.ts | 403 |
| `NEXT STEP: Get a remediation plan — $29` on teasers | pdf-generator.ts | 411 |
| Locked content section with $29 CTA and explicit URL | pdf-generator.ts | 421-471 |
| No asset visual/thumbnail | pdf-generator.ts | — |
| Safe/green results: 3 thin hardcoded checks, no real telemetry | pdf-generator.ts | 492-527 |
| `chief_officer_strategy` hidden from free PDF | pdf-generator.ts | 476 |
| Provenance footer hidden from free PDF | pdf-generator.ts | 533 |
| Footer: "SAMPLE REPORT" | pdf-generator.ts | 569 |
| Filename prefix: `AIRS_Sample_` | pdf-generator.ts | 576 |
| Email: "$29 unlocks this full report" (incorrect — scan reports are free) | SampleReportEmail.tsx | 138 |
| Email: "Legal remediation steps you can act on" (that's mitigation) | SampleReportEmail.tsx | 143 |
| Email subject: lock emoji + "Forensic Analysis Complete" | email.ts | 76 |
| Email attachment: `Sample_Report_` | email.ts | 69 |

### Core design flaw

The free PDF was designed as a crippled version of a "full report," hiding findings behind teasers and locked sections to drive $29 purchases. But the $29 product is the **mitigation report**, not the scan report. Scan reports are free for all authenticated users. The PDF should therefore be a complete findings summary.

---

## 2. Target Artifact Definition

**Name:** Scan Findings Summary

**Purpose:** A complete, shareable artifact documenting what was detected in a scanned asset, what the risk score is, and why.

**Not included:** Mitigation steps, remediation plans, action items, compliance matrices, bias audits. Those belong in the paid mitigation report.

**Tone:** Professional, factual, readable. Like a lab report, not a sales brochure.

---

## 3. PDF Sections (V1)

| # | Section | Data Source | Notes |
|---|---------|------------|-------|
| 1 | Header | scan.id, scan.created_at | "AI CONTENT RISK SCORE" + "SCAN FINDINGS SUMMARY" |
| 2 | Asset Context | scan.filename, scan.is_video | Filename + type |
| 3 | Asset Preview | Supabase Storage (signed URL) | Embedded image via jsPDF addImage. Images only, skip for video. |
| 4 | Risk Assessment | profile.composite_score, tier | Large score circle + verdict |
| 5 | Risk Breakdown | profile.{ip,safety,provenance}_report.score | Three sub-scores with tier labels |
| 6 | Domain Teasers | profile.{ip,safety,provenance}_report.teaser | Plain-language explanation of what each domain found |
| 7 | C2PA Provenance | profile.c2pa_report | Status, issuer, tool |
| 8 | Key Findings | scan_findings[] (DB) or synthesized from profile | All findings shown — title, severity, type, description. No gating. |
| 9 | Risk Intelligence Summary | profile.chief_officer_strategy | Plain-language explanation of the overall risk picture |
| 10 | Provenance Data | profile.c2pa_report | Status, issuer, tool, signature verification |
| 11 | End Section | — | Brand attribution + subtle "Mitigation guidance available in your workspace" |
| 12 | Footer | scan.created_at | "FINDINGS SUMMARY" on every page |

### Safe/green result handling

When score ≤ 25 and no findings exist:
- 3 status checks (IP PASS, SAFETY PASS, C2PA status)
- Domain teasers showing what was analyzed
- C2PA details if available (issuer, tool, creator)
- Risk Intelligence Summary (even for safe results)
- Asset preview (if available)

---

## 4. Email Alignment

| Element | Before | After |
|---------|--------|-------|
| Subtitle | "Forensic Analysis Complete" | "Your Scan Results Are Ready" |
| Subject | "🔒 Forensic Analysis Complete • Risk Score: {n}" | "Your AI Content Risk Score: {n}" |
| CTA button | "View Full Report →" | "View Your Results →" |
| Upsell section | "$29 unlocks this full report" + feature list | Single line: "Need remediation guidance? Explore mitigation reports in your workspace." |
| Footer | "Automated Legal Forensic Analysis" | "Automated Risk Analysis" |
| Attachment name | `Sample_Report_` | `Findings_Summary_` |

---

## 5. Files Modified (V1)

1. **`lib/pdf-generator.ts`** — Core refactor of `generateForensicReport()`. New `AssetImageData` type exported. Added asset preview, domain teasers, ungated findings, risk intelligence summary, provenance data for all paths, subtle end section.

2. **`app/api/scans/capture-email/route.ts`** — Fetches asset image from Supabase Storage for PDF embedding. Added `parseImageDimensions()` helper. Updated `AssetRow` type. Passes image data to PDF generator.

3. **`components/email/SampleReportEmail.tsx`** — Softened tone. Removed upsell block. Updated CTA, subtitle, and footer text.

4. **`lib/email.ts`** — Updated subject line and attachment filename.

---

## 6. What Changed vs What Didn't

### Changed
- Free PDF shows ALL findings (not gated behind hero+teaser pattern)
- Removed all inline MITIGATION/NEXT STEP/$29 labels
- Removed locked content section and CTA block
- Added asset preview image embedding
- Added domain teasers (what each analysis found)
- Added Risk Intelligence Summary (chief_officer_strategy) to free PDF
- Added provenance data footer to free PDF
- Added subtle end section (brand + soft mitigation mention)
- Enhanced safe/green results with domain teasers and C2PA details
- Renamed from "SAMPLE" to "SCAN FINDINGS SUMMARY" throughout
- Email tone softened and upsell section replaced

### NOT changed
- Mitigation PDF (`generateMitigationPDF`) — untouched
- Entitlements logic — untouched
- Capture-email auth flow (shadow user, magic link) — untouched
- Scan processor — untouched
- Database schema — no changes needed

---

## 7. V2 / Later Improvements

- **Structured findings narrative** — Purpose-built Gemini output for the free PDF summary (better than reusing `chief_officer_strategy` which is designed for executive briefing)
- **Video frame preview** — Extract a representative frame from video scans for the asset preview
- **Confidence score badges** — Show `confidence_score` on each finding in the PDF
- **PDF template theming** — Brand colors, custom logo placement
- **PDF download analytics** — Track opens/downloads for conversion funnel measurement

---

## 8. Backlog Notes

### Post-delivery email sequence
Not built in V1. Future opportunity:
- Day 1: "Your scan results are ready" (current email)
- Day 3: "Here's what you can do with your findings" (educational, links to mitigation)
- Day 7: "Your scan expires in 23 days" (retention)

### Indemnity insurance content path
Not built in V1. Not appropriate for the PDF body.
- Future: on-site content hub about responsible AI content insurance
- Future: follow-up email with educational content if risk score is high
- If we share leads with partner insurers, transparent disclosure required
- Better handled via dedicated landing page or email, not embedded in scan artifact
