# AI Content Risk Score — Full Product, UX & Conversion Audit

**Date:** March 15, 2026 | **Auditor:** Claude (code-level + visual evidence) | **Branch:** `main` @ `0ce436d`

---

## 1. TOP-LEVEL VERDICT

### What's Working
- **Hero messaging is strong.** "Know Before You Publish" + "$150K statutory damages" + "Getty v. Stability AI" creates real urgency. Users understand the value in 5 seconds.
- **Scanner-to-results flow works end-to-end.** Upload → Realtime progress → score + findings → drawer → actions. The pipeline is functionally sound.
- **Scans & Reports page is the real product.** Searchable, sortable scan list with ScanCard grid, drawer-on-click, bulk actions. Well-architected.
- **UnifiedScanDrawer is consistent across entry points.** Same sections, same actions, same labels whether opened from `/dashboard` or `/dashboard/scans-reports`. Actions (download, share, delete, mitigation) are identical.
- **Design system is cohesive.** CSS variable tokens, consistent radius/shadow/spacing tokens, dark mode support.

### What's Not Working
- **Pricing buttons on landing page are NOT WIRED.** "INITIALIZE", "ACCESS REPORT", "SUBSCRIBE" have no onClick handlers. This is a **conversion-killing bug** — users who scroll to pricing and click "buy" get nothing.
- **Just-completed scans have degraded data.** `/dashboard` uses `mapScanToRecord()` which constructs a generic `risk_profile` with placeholder teasers ("IP Analysis Complete") instead of real Gemini analysis text. Users re-opening the same scan from scans-reports see richer data from the API blob.
- **Anonymous users can't evaluate findings before email gate.** The email gate blocks the entire findings dossier — users see a score but can't see WHY it's high/low. No teaser motivates email submission.
- **Failed scans display as "completed."** `UnifiedScanDrawer` line 249 maps `failed` → `completed` in RSRiskPanel, which is misleading.

### Biggest Missed Opportunities
1. **Insurance referral partnership is completely absent.** Users see "$150K statutory damages" but are given no path to protect themselves. Partnering with specialist insurance agencies (transparent referral model) would generate qualified leads and a side revenue stream while genuinely helping users.
2. **$29 report value isn't shown until AFTER upload.** The pricing section on landing mentions tiers but doesn't list what the mitigation report actually contains. Users can't evaluate before committing.
3. **No customer proof points anywhere.** Zero testimonials, zero logos, zero "X scans completed" counters.

---

## 2. HOME PAGE REVIEW

### Hero Section (Above the Fold) — 8/10
- ✅ Headline "Know Before You Publish" is clear, action-oriented
- ✅ Sub-copy names the deliverables: "IP risk score. Provenance verification. Downloadable evidence for legal."
- ✅ Primary CTA "Run Free Heuristic Scan" is high-contrast, full-width, unmissable
- ❌ **"Heuristic" is jargon** — non-technical buyers don't know what this means. Change to "Run Free Scan" or "Scan Your AI Image Free"
- ❌ **Free tier cap hidden** — "3/3 REMAINING" badge is small, top-right of upload widget. Move "3 free scans/month — no credit card" directly below the CTA button

### Market Exposure / Benchmarks — 9/10
- ✅ "$150K maximum statutory damages" anchors legal risk concretely
- ✅ "Getty Images v. Stability AI" references a real precedent
- ✅ "15 seconds" speed claim is specific and credible
- This section is the **strongest conversion driver** on the page. Consider promoting it closer to hero.

### How It Works — 7/10
- ✅ Three-step flow (Upload → Verify Provenance → Get Score) is logical
- ❌ Step descriptions are vague on benefits. "Three specialized AI analysts independently score it" → should be "Get a composite risk score across IP, brand safety, and content provenance"
- ❌ No mention of what happens AFTER the score (email gate, account creation, mitigation option)

### Pricing Section — 2/10 (BROKEN)
- ❌ **CRITICAL: Buttons are not wired.** "INITIALIZE", "ACCESS REPORT", "SUBSCRIBE" buttons have no `onClick` handlers. Users cannot convert.
- ❌ **Tier names don't match product reality.** Landing says "BASIC / ASSESSMENT / PROFESSIONAL / ENTERPRISE" but the actual product tiers are "FREE / ONE-TIME REPORT / PRO / TEAM / AGENCY / ENTERPRISE" (per `lib/plans.ts`)
- ❌ **"CLEARANCE ACCESS" header + "operational theater" sub-copy is jargon.** Replace with "Choose Your Plan" / "Select the analysis depth that matches your needs"
- ❌ **$29 mitigation report features not listed.** AuditModal shows "Remediation Plan, Bias Audit, Compliance Matrix, PDF Report" but pricing section doesn't
- ❌ **No annual discount shown** on landing (only on `/pricing` page)
- ❌ **No money-back guarantee shown** on landing (only on `/pricing` page)

### Trust & Compliance Section — 6/10
- ✅ Privacy specifics are good: "TLS 1.3", "7-day retention", "No training on user data", "Row-level security"
- ⚠️ "SOC 2 PLANNED" and "GDPR PLANNED" badges **undermine trust** — "planned" reads as "we haven't done it yet"
- ❌ **No customer testimonials, logos, or traction signals**
- ❌ **No insurance referral pathway** — users see legal risk numbers but no way to protect themselves. Partner referral opportunity missed.

### Footer — 5/10
- ✅ "Know before you publish" closing is on-brand
- ❌ Disclaimer "We do not provide legal advice" is prominent but no alternative offered (e.g., "Our reports are designed to supplement your legal review")
- ❌ No contact info, no support link, no social proof

### SEO & Meta — 3/10
- ❌ Title is generic: "AI Content Risk Score" — should include keywords like "copyright checker" or "AI image risk"
- ❌ Description is jargon: "Forensic AI Audit" — should be benefits-driven
- ❌ No Open Graph or Twitter Card tags
- ❌ No sitemap or robots.txt configuration visible

### Mobile — 6/10
- ✅ Pricing switches from table to card carousel at `lg:` breakpoint
- ✅ Text scales responsively (`text-5xl md:text-7xl`)
- ❌ **No mobile navigation.** `hidden md:flex` hides ALL nav links on mobile — no hamburger menu, no way to reach Pricing/Login from header

---

## 3. DASHBOARD REVIEW

### First-Use Clarity — 5/10
- The scanner chassis aesthetic (dark background, "Scanner_v2.0", "CH_01_INPUT", "BUFFER_READY") is visually striking but **doesn't orient new users**
- No onboarding card, no "Welcome — upload your first image to get started" prompt
- Right pane shows empty "Ready for Inspection" state with dimmed dials — unclear what they will become
- **Recommendation:** Add a lightweight onboarding overlay on first visit: "1. Upload → 2. Analyze → 3. Review your risk score"

### Ongoing Usefulness — 7/10
- Scanner works well for power users who know the product
- Real-time Supabase progress updates are smooth (no polling)
- Guideline selector dropdown (for users with brand profiles) is a nice touch
- **Issue:** Dashboard is the SCANNER, but `/dashboard/scans-reports` is the PRODUCT. The relationship is unclear.

### Information Hierarchy — 6/10
- **Inversion:** Telemetry panel (provenance rows) sits ABOVE findings dossier in the right pane. Users see C2PA metadata before risk findings, which is backwards for decision-making.
- **Fix:** Move findings above telemetry. Findings answer "Am I safe?" — telemetry answers "How do you know?"
- **Right pane scroll** (Sprint 12 change) works correctly — parent scrolls as unit, no inner scrollbar on findings

### Right Pane as Morphable Module — 4/10
- Right pane is currently single-purpose: shows RSRiskPanel + telemetry + findings for one scan.
- **Opportunity:** Right pane could be a **morphable module** that adapts to context:
  - **Empty state:** Onboarding card / "Upload your first image"
  - **Scanning state:** Scan animation + progress (no premature score display)
  - **Completed state:** Score + findings (current behavior, but with slide-in transition)
  - **Batch upload state (future):** Thumbnail grid showing per-file scan status/scores
- This reuse of real estate makes the scanner page feel more like a workspace, less like a one-shot tool.

### Right Next Action — 5/10
- After scan completes, users see score + findings but unclear CTA for "what now?"
- "Open Full Details" button exists but competes with inline findings display
- **Recommendation:** After completion, show a prominent card: "Score: 73 (HIGH RISK) — View findings and get remediation guidance →"

---

## 3.a SIDEBAR & DRAWER CONSISTENCY REVIEW

### Dynamic Color States — Missing
- ❌ **C2PA provenance indicators don't reflect verification status visually.** When a scan HAS valid C2PA metadata, the provenance bars/indicators should turn **green** in the dashboard and sidebar. Currently all indicators use the same styling regardless of provenance outcome.
- ❌ **Hardcoded greys bypass design tokens in key components:**
  - `RSC2PAWidget.tsx` line 51: `text-gray-400` (Tailwind grey, doesn't invert in dark mode)
  - `RSSectionHeader.tsx` line 25: `#9A9691` (hardcoded hex from light theme)
  - `ProvenanceTelemetryStream.tsx`: hardcoded `#00DDFF` (cyan) and `#FFFFFF` (white) instead of CSS variable tokens
- ❌ **Dark mode grey scale contrast is broken.** `globals.css` dark mode greys don't follow proper inversion:
  - `--rs-gray-400` goes from `#9A9691` (light) → `#666666` (dark) — too dark on `#121212` surface
  - `--rs-gray-500` and `--rs-gray-600` don't preserve contrast relationships
  - Result: some text/elements become unreadable in dark mode

### Sidebar Navigation (`RSSidebar.tsx`)
**Items shown:**
| Item | Route | Condition | Status |
|---|---|---|---|
| Dashboard | `/dashboard` | Always | ✅ Works |
| Scans & Reports | `/dashboard/scans-reports` | Always | ✅ Works |
| Guidelines & Policies | `/dashboard/brand-guidelines` | Always | ⚠️ UI works but not wired to analysis |
| Help & Documentation | `/dashboard/help` | Always | ⚠️ Light content |
| Team | `/dashboard/team` | TEAM+ plans only | ✅ Feature-gated |
| Audit Logs | `/dashboard/audit-logs` | AGENCY+ plans only | ✅ Feature-gated |

**Issues:**
- ❌ **Gated features are invisible.** Free/PRO users don't know Team or Audit Logs exist. Show locked state with "Upgrade to unlock" instead of hiding entirely.
- ❌ **Plan badge buried at sidebar bottom.** Quota status (scans used, seats) requires scrolling. Move to top or make sticky.
- ❌ **Mobile sidebar behavior unclear.** `sticky top-0` may block content on small screens. No responsive collapse to drawer pattern visible in code.

### Drawer Consistency (UnifiedScanDrawer)

**Section Order (consistent across all entry points):**
1. Scan Summary (asset preview + metadata)
2. Risk Overview (RSRiskPanel with dials)
3. Detected_Anomalies (findings list)
4. Frame_Analysis (video only, if frames > 0)
5. Content_Credentials (provenance telemetry)
6. Mitigation_Report (if generated and complete)
7. Compliance_Log (notes textarea)
8. Actions (Export, Share, Purge)
9. **Sticky Footer:** Mitigation CTA

**✅ Consistent across entry points:** Sections, labels, ordering, and actions are identical whether drawer is opened from scan list (scans-reports) or scanner page (dashboard). Both pass same `ScanWithRelations` type, both wire same action handlers.

**❌ Data freshness divergence (HIGH severity):**

| Entry Point | Data Source | Quality |
|---|---|---|
| `/dashboard` (just-completed) | `mapScanToRecord()` constructs risk_profile from individual columns | Generic teasers like "IP Analysis Complete" |
| `/dashboard/scans-reports` (history) | Supabase Realtime hook returns stored `risk_profile` blob | Full Gemini analysis text |
| `/api/scans/[id]` (drawer fetch) | Reads stored blob, legacy fallback for pre-blob scans | Correct data |

**Impact:** A user who just completed a scan sees "IP Analysis Complete" as the IP report teaser. If they navigate to scans-reports and re-open the same scan, they see the full Gemini analysis text. This is confusing and inconsistent.

**Fix:** After processing completes, re-fetch from `/api/scans/[id]` instead of using the constructed `mapScanToRecord()` data.

**❌ Failed scans show as "completed" (MEDIUM):**
Line 249: `scan.status === 'failed' ? 'completed' : 'completed'` — failed scans get green "completed" status indicator in RSRiskPanel. Should show error state.

**❌ VideoFrameGrid fetches independently (LOW-MEDIUM):**
Frame data is NOT part of the scan prop — VideoFrameGrid makes its own API call to `/api/scans/[id]/frames`. This means:
- Drawer opens → frame skeleton renders → frames load 1-2s later
- If share token expired between drawer open and frame fetch, frames silently disappear (no error shown)

---

## 4. SCANNER REVIEW

### Framing — 6/10
- Scanner chassis aesthetic communicates "serious tool" but doesn't communicate "easy to use"
- "Scanner_v2.0" label is internal versioning, not user-facing value
- **Recommendation:** Replace with "AI Risk Scanner" or just "Upload"

### Confidence-Building — 5/10
- ✅ Real-time progress via Supabase Realtime is smooth
- ✅ Provenance telemetry rows animate during processing (visual feedback)
- ✅ Score appears with statement ("Immediate Remediation Required" etc.)
- ❌ **Scanner red line animation runs once and stops feeling broken.** `RSScanner.tsx` uses `animate-scan` (3s, ease-in-out, infinite) but it's vertical-only (top→bottom). User wants **both vertical and horizontal scan lines** for a more polished, continuous feel. Animation is defined in `globals.css` lines 440-458.
- ❌ **Right pane risk score panel is jarring during long scans.** RSRiskPanel renders immediately in `scanning` state with "--" scores and pulsing opacity — then suddenly snaps to real values on completion. For scans that take 10-15s, this feels broken. Score panel should **stay hidden until near-completion, then slide/fade in** with real data.
- ❌ Pre-processing telemetry shows "NOT DECLARED / --- / N/A" which looks like errors, not pending
- ❌ No estimated time remaining shown during processing

### Motivation — 5/10
- After completion, findings are shown but no clear CTA for "what do I do about this?"
- Mitigation CTA is in the drawer (Sprint 12: sticky footer) but not on the main dashboard result
- **Recommendation:** After scan completes, show inline CTA: "Your content has 3 risks — Get remediation guidance ($29)"

---

## 5. REPORT EXPERIENCE REVIEW

### PDF Report Generation — 5/10
- ✅ Sample PDF emailed to anonymous users (pre-account)
- ✅ Full PDF available in-app for authenticated users (always `isSample = false`)
- ✅ `generateForensicReport()` creates professional PDF with risk scores and findings
- ❌ **Sample PDF speaks in the wrong voice.** Currently masks ALL finding descriptions with "[Unlock full report for details]" and uses aggressive "UNLOCK COMPLETE FORENSIC ANALYSIS" CTA. It reads like locked premium content, not a practical report. The sample PDF should be **a clear, useful scan findings report** — the first thing someone shares in a meeting. It should present real findings practically. The mitigation report (the $29 purchase) is the deeper, leadership-ready document with remediation plans and compliance matrices.
- ❌ No preview of PDF before download — users must download to see what they get

### Mitigation Report — 8/10
- ✅ Clearly separated from scan report: scan = free, mitigation = $29
- ✅ Contains: remediation plan, bias audit, compliance matrix, RAI considerations
- ✅ PDF export available after generation
- ✅ Sticky CTA in drawer (Sprint 12) makes it always visible
- ❌ No sample/preview of what mitigation report looks like before purchase

### Actionability — 6/10
- Findings list severity badges are clear (CRITICAL/HIGH/MEDIUM/LOW)
- But findings descriptions may be masked for unpurchased scans (soft gate)
- **Missing:** Priority ordering of findings by severity (highest first)
- **Missing:** "What to do" guidance inline with each finding (this IS the mitigation report value)

---

## 6. FRICTION LOG

| # | Point | Where | Severity | User Impact |
|---|---|---|---|---|
| 1 | Pricing buttons not wired | Landing `/` pricing section | **CRITICAL** | Users cannot convert from pricing comparison |
| 2 | Email gate blocks ALL findings | `/dashboard` right pane (anonymous) | **HIGH** | Users can't evaluate value before providing email |
| 3 | Just-completed scans have degraded data | `/dashboard` mapScanToRecord() | **HIGH** | Generic teasers instead of real analysis text |
| 4 | "Heuristic Scan" jargon | Landing CTA button | **MEDIUM** | Non-technical users confused by terminology |
| 5 | Video upload: alert() popup | Free user video attempt | **MEDIUM** | Jarring browser alert instead of styled error |
| 6 | Failed scans show as "completed" | UnifiedScanDrawer line 249 | **MEDIUM** | User thinks failed scan succeeded |
| 7 | No mobile navigation | Landing navbar `hidden md:flex` | **MEDIUM** | Mobile users can't reach Pricing/Login from header |
| 8 | Team/Audit features invisible | Sidebar gating | **LOW-MEDIUM** | Users don't know features exist, can't discover upgrade path |
| 9 | No onboarding for first-time users | `/dashboard` | **MEDIUM** | Users stare at dark chassis, unsure what to do |
| 10 | Telemetry rows show "---" pre-scan | Dashboard right pane | **LOW** | Looks like errors, not pending state |
| 11 | No user profile dropdown | Navbar avatar | **LOW** | No logout or settings access |
| 12 | Share token expiry: frames silently disappear | VideoFrameGrid | **LOW** | Shared view suddenly has no frame data |
| 13 | Scanner red line runs once, feels broken | `RSScanner.tsx` + `globals.css` | **MEDIUM** | Users think scan stopped or errored |
| 14 | Right pane score jarring on long scans | `dashboard/page.tsx` RSRiskPanel | **MEDIUM** | Empty dials → sudden values feels broken |
| 15 | Sample PDF voice is wrong | `lib/pdf-generator.ts` | **HIGH** | First shared artifact reads like locked content, not a report |
| 16 | C2PA bars don't reflect verification status | `RSC2PAWidget.tsx`, sidebar | **MEDIUM** | Users can't visually distinguish verified from missing provenance |
| 17 | Hardcoded greys break dark mode | `RSC2PAWidget`, `RSSectionHeader` | **MEDIUM** | Text unreadable in dark mode |

---

## 7. CODE & IMPLEMENTATION ISSUES

| Issue | File | Impact |
|---|---|---|
| **Pricing buttons no onClick** | `SubscriptionComparison.tsx` | Conversion blocker — no handlers wired |
| **mapScanToRecord() generic teasers** | `dashboard/page.tsx:102-129` | Data quality mismatch between fresh scan and history |
| **Failed → completed status mapping** | `UnifiedScanDrawer.tsx:249` | UX bug — misleading status |
| **alert() for video gate** | `FreeUploadContainer.tsx` | Unprofessional UX |
| **No hamburger menu** | `RSNavbar.tsx` | Mobile usability broken |
| **querySelector for Free Scan button** | `RSNavbar.tsx` navbar CTA | Fragile DOM coupling |
| **VideoFrameGrid silent 401** | `VideoFrameGrid.tsx:82-83` | No error feedback on expired tokens |
| **Entitlements calculated once** | Dashboard drawer open handler | Stale credits if plan changes mid-session |
| **SEO metadata minimal** | `app/layout.tsx` | Title generic, no OG/Twitter cards |
| **Sidebar no responsive collapse** | `RSSidebar.tsx` | Mobile behavior undefined |
| **Scanner animation vertical-only** | `RSScanner.tsx`, `globals.css:440-458` | Single-pass scan line feels incomplete |
| **RSRiskPanel shown during scanning** | `dashboard/page.tsx:773-784` | Empty dials visible for entire scan duration |
| **Sample PDF masks all findings** | `pdf-generator.ts:269-467` | Reads like locked content, not a practical report |
| **Hardcoded greys in RS components** | `RSC2PAWidget.tsx:51`, `RSSectionHeader.tsx:25` | Dark mode readability broken |
| **C2PA status not reflected visually** | `RSC2PAWidget.tsx`, `ProvenanceTelemetryStream.tsx` | No green indicators for verified provenance |
| **Dark mode grey scale broken** | `globals.css:108-145` | `--rs-gray-400/500/600` don't preserve contrast in dark mode |

---

## 8. PRIORITIZED RECOMMENDATIONS

### Critical Fixes (Conversion Blockers)

1. **Wire pricing buttons to Stripe checkout.** Map "ACCESS REPORT" → one-time $29 checkout, "SUBSCRIBE" → PRO $49/mo checkout, "INITIALIZE" → scroll-to-upload or signup. Without this, the pricing section is decorative.

2. **Fix data freshness on just-completed scans.** After `processScan()` completes, re-fetch from `/api/scans/[id]` to get the real `risk_profile` blob instead of using the constructed `mapScanToRecord()` fallback. This ensures drawer data matches regardless of entry point.

3. **Show findings teaser ABOVE email gate.** Instead of blocking the entire findings dossier, show 1-2 finding titles + severity badges (masked descriptions) to motivate email submission. The current pattern gives away nothing, so users have no reason to provide their email.

### High-Impact Improvements

4. **Fix sample PDF voice.** Transform from "locked premium content" to a **practical scan findings report**. Show the hero finding in full (not masked). Use plain English titles. Drop "UNLOCK COMPLETE FORENSIC ANALYSIS" language. Add subtle insurance referral CTA in footer. This is the first artifact someone shares in a meeting — it must be useful, not a teaser.
   - **File:** `lib/pdf-generator.ts` lines 269-467
   - **Changes:** Show 1-2 findings in full with descriptions. Remove mask language. Replace "Unlock full report" CTA with "Get remediation guidance — $29". Add insurance referral in footer per Section 9.

5. **Upgrade scanner animation to dual-axis.** Add horizontal scan line alongside existing vertical. Both should loop continuously during processing. Current animation in `RSScanner.tsx` uses a single top→bottom pass that feels incomplete.
   - **File:** `components/rs/RSScanner.tsx` + `app/globals.css` (scan-line keyframe)
   - **Changes:** Add second `animate-scan-h` keyframe (left→right). Offset timing so lines cross at different phases. Both infinite loop during `isScanning`.

6. **Defer risk score panel until near-completion.** Instead of showing RSRiskPanel with "--" dials during the entire scan, hide the score panel and show it with a slide-in/fade transition only when scan reaches ~90% progress or completes.
   - **File:** `app/(dashboard)/dashboard/page.tsx` lines 773-832
   - **Changes:** Track progress percentage from Realtime updates. Conditionally render RSRiskPanel with Framer Motion `AnimatePresence` + `motion.div` slide-from-right when `progress >= 90` or `isComplete`. Remove the standby panel ("Standing_By" / "Awaiting_Analysis..." at opacity-20).

7. **Fix dark mode color issues.** Replace all hardcoded greys with design system tokens. Fix dark mode grey scale contrast.
   - `RSC2PAWidget.tsx` line 51: `text-gray-400` → `text-[var(--rs-text-tertiary)]`
   - `RSSectionHeader.tsx` line 25: `#9A9691` → `var(--rs-gray-400)`
   - `ProvenanceTelemetryStream.tsx`: `#00DDFF` → `var(--rs-accent-secondary)`, `#FFFFFF` → `var(--rs-text-primary)`
   - `globals.css` dark mode: Fix `--rs-gray-400/500/600` contrast values to maintain readability on `#121212` surface

8. **Add dynamic C2PA color states.** When a scan has verified C2PA provenance metadata, provenance indicators should turn green in dashboard, reports sidebar, and drawer. Currently all indicators use the same styling regardless of verification outcome.
   - **File:** `RSC2PAWidget.tsx`, `ProvenanceTelemetryStream.tsx`, sidebar indicator
   - **Changes:** Map C2PA fidelity values to colors: verified → green (`--rs-safe`), caution → yellow (`--rs-risk-caution`), untrusted/invalid → red (`--rs-signal`), missing → muted grey (`--rs-text-tertiary`)

9. **Rename CTA buttons to plain language.** "Run Free Heuristic Scan" → "Scan Your Image Free". "INITIALIZE" → "Start Free". "ACCESS REPORT" → "Get Report — $29". "SUBSCRIBE" → "Subscribe — $49/mo".

10. **Add mobile hamburger navigation.** Implement a slide-out drawer on mobile with: Pricing, Login, Free Scan. Current `hidden md:flex` hides everything.

11. **Add insurance referral partner placements** (see Section 9). Surface in mitigation report footer, sample PDF, landing near-footer, and drawer for HIGH/CRITICAL scans. Transparent referral model — never imply we provide insurance.

12. **Fix failed scan status display.** Map `status === 'failed'` → error state in RSRiskPanel, not "completed". Show error message with retry option.

13. **Replace alert() video gate.** Show styled inline error card: "Video analysis requires PRO plan or higher — Upgrade →"

14. **Improve SEO metadata.** Title: "AI Content Risk Score — Check AI Images for Copyright Risk in 15s". Add OG image, Twitter cards, targeted description.

### Nice-to-Have Refinements

15. **First-use onboarding card.** Show a 3-step card on first `/dashboard` visit: "1. Upload your AI image → 2. Get instant risk score → 3. Download legal-defensible report"

16. **Show locked nav items for gated features.** Instead of hiding Team/Audit Logs, show with lock icon + "Upgrade to TEAM" tooltip.

17. **Move plan badge to sidebar top.** Quota info (scans used, seats) is at sidebar bottom — easy to miss.

18. **Re-order right pane.** Move findings dossier ABOVE telemetry panel. Findings answer "Am I safe?" (primary question), telemetry answers "How do you know?" (secondary).

19. **Add sample mitigation report preview.** Before asking for $29, show what the report looks like (anonymized example or 1-page preview).

20. **Right pane as morphable module (future).** Extend right pane to adapt to context: onboarding card when empty, progress-only during scan, batch thumbnail grid for multi-file uploads. Requires refactoring to a state-machine pattern.

---

## 9. INDEMNITY INSURANCE — REFERRAL PARTNERSHIP MODEL

**Critical distinction:** AI Content Risk Score does NOT provide insurance. The revenue model is a **transparent referral commission** — we identify users with high risk scores, qualify them as leads, and connect them with **specialized partner insurance agencies** that offer AI content indemnity / errors & omissions coverage. We earn referral commission on successful placements.

**Transparency is non-negotiable.** Every placement must make it clear: "We partner with specialist agencies" — never imply we underwrite coverage ourselves.

### Where Users Are Most Receptive (by intent + context)

**Highest receptivity:** Users who just received a HIGH or CRITICAL risk score. They've just seen "$150K statutory damages" on the landing page and now have a concrete number attached to their own content. This is when "protect yourself" messaging lands hardest.

**Medium receptivity:** Users browsing pricing, weighing whether to buy mitigation reports. Insurance referral as an adjacent service reinforces "we think about your full risk picture."

**Low receptivity:** Hero section, first visit. Users haven't felt the pain yet. Insurance feels premature.

### Placement A: Mitigation Report Footer (Post-Purchase, Highest Intent)
After generating a $29 mitigation report, include a section at the bottom:
```
ADDITIONAL PROTECTION
Your scan identified [X] risks with potential statutory exposure.
We partner with specialist AI content insurance agencies who can provide
indemnity coverage tailored to your use case.

[Connect with an Insurance Specialist →]

Disclosure: We may receive a referral fee if you purchase coverage through our partners.
```
**Why here:** User has already paid $29, trusts the product, understands their risk. Highest-quality lead.

### Placement B: Sample PDF Report (Email to Anonymous Users)
Footer of the free sample PDF emailed after upload:
```
PROTECT YOUR PUBLISHING DECISIONS
This scan identified potential IP and provenance risks.
Our partner agencies specialize in AI content indemnity insurance.

Learn more about coverage options →

We transparently partner with specialist agencies and may receive referral fees.
```
**Why here:** First touchpoint after value delivery. Pre-account users see risk data, natural next thought is "how do I protect myself?"

### Placement C: Landing Page — Near Footer (Subtle, Awareness-Level)
Add a small section between Trust & Compliance and Footer:
```
NEED COVERAGE?
High-risk AI content? Our partner agencies specialize in
indemnity insurance for AI-generated assets.
[Learn About Insurance Options →]

We partner with and may receive referral fees from specialist insurance agencies.
```
**Why here:** Users scrolling to footer are evaluating deeply. This plants the seed without cluttering the core conversion flow. Positioned BELOW pricing, never competing with scan/mitigation CTAs.

### Placement D: Drawer — Post-Findings (Contextual, After Risk Assessment)
In UnifiedScanDrawer, after the Detected_Anomalies section, for HIGH/CRITICAL scans only:
```
{scan.risk_level === 'critical' || scan.risk_level === 'high' ? (
  <div className="text-xs opacity-60 border-t pt-3 mt-3">
    Concerned about liability? Our partner insurance agencies
    specialize in AI content indemnity coverage.
    <a href="/insurance-referral">Learn more →</a>
  </div>
) : null}
```
**Why here:** User is looking at their specific risk findings. Insurance feels relevant, not sales-y.

### Placement E: Email Nurture Sequence (Future)
**Email 3 (Day 7):** After user has seen their report
- Subject: "Your risk score was [HIGH] — here's how teams protect themselves"
- Body: "Many of our users pair their risk assessments with indemnity insurance from our specialist partners. They offer coverage specifically designed for AI-generated content publishing."
- CTA: "Explore coverage options →"
- Footer: "We transparently partner with insurance agencies and may receive referral fees."

**Email 5 (Day 21):** For users who haven't converted to paid
- Subject: "Still publishing without coverage?"
- Body: Case study format — "How [persona] used their risk score to secure $X in coverage"
- CTA: "Get connected with a specialist →"

### Messaging Rules
- ✅ "We partner with specialist insurance agencies"
- ✅ "Connect with an indemnity insurance specialist"
- ✅ "Our partners offer coverage tailored to AI content risk"
- ✅ "We may receive a referral fee" (mandatory transparency)
- ✅ "Indemnity coverage for AI-generated content"
- ❌ NEVER say "we provide insurance" or "coverage included"
- ❌ NEVER say "insured by us" or "backed by our insurance"
- ❌ NEVER position insurance as a product feature or pricing tier row
- ❌ NEVER put insurance CTA above or competing with scan/mitigation CTAs
- ❌ NEVER hide the referral relationship — transparency builds trust

### Lead Qualification Strategy
Not every user is a qualified insurance lead. Route only:
1. Users with **HIGH or CRITICAL** risk scores (demonstrated exposure)
2. Users who have **purchased a mitigation report** (demonstrated willingness to pay for risk management)
3. Users on **PRO+ plans** (professional/commercial use case)
4. Users who **click through** an insurance CTA (self-qualified intent)

**Tracking:** Use `referral_events` table (schema already exists) to track:
- `event_type: 'insurance_referral_click'`
- `scan_id` (which scan triggered interest)
- `risk_level` (qualification signal)
- `tenant_id` (for attribution)

---

## VERIFICATION

After implementing fixes, validate:

1. **Pricing buttons:** Click each button on landing → verify Stripe checkout opens with correct plan/price
2. **Data freshness:** Upload image → wait for completion → compare findings text with same scan opened from scans-reports
3. **Email gate teaser:** Upload anonymously → verify 1-2 finding titles visible above email gate
4. **Mobile nav:** Resize to 375px → verify hamburger menu → verify all nav links accessible
5. **Failed scan status:** Trigger a failed scan → verify drawer shows error state, not "completed"
6. **SEO:** View page source → verify og:title, og:description, og:image present
7. **Video gate:** Upload video as free user → verify styled error card (not alert())
8. **Scanner animation:** Upload image → verify both vertical AND horizontal scan lines loop continuously throughout processing
9. **Score panel timing:** Upload image → verify risk score panel does NOT show during early scan stages → verify it slides in smoothly near completion
10. **Sample PDF voice:** Generate sample PDF → verify findings are presented practically (not masked) → verify no "UNLOCK" language → verify insurance referral CTA in footer
11. **Dark mode:** Toggle dark mode → verify no unreadable grey text → verify C2PA indicators, section headers, telemetry rows all maintain contrast
12. **C2PA color states:** Upload image with C2PA metadata → verify provenance indicators show GREEN → upload image without C2PA → verify indicators show muted/grey state

---

## 10. REBRAND CLEANUP

**Customer-facing code: ✅ CLEAN.** Sprint 11 rebrand removed all "AI Risk Shield" references from `.tsx`, `.ts`, `.css`, and metadata. RSNavbar correctly shows `AI_CONTENT_RISK_SCORE`.

**Internal documentation: ❌ NOT UPDATED.** These files still reference "AI Risk Shield":
- `README.md` (title + description)
- `PDR.md` (throughout)
- `DESIGN_CONTEXT.md` (title)
- `NORTH_STAR.md` (title + references)
- `ARCHITECTURE.md` (description)
- `FUNCTIONAL_PRD.md` (description)
- `SUBSCRIPTION_STRATEGY.md` (white-label row)
- `brain/AGENT_BRIEFING.md` (description)
- `brain/implementation_plan.md` (sub-text)
- Various SQL migration comments (cosmetic, no runtime impact)

**Action:** Bulk find-and-replace "AI Risk Shield" → "AI Content Risk Score" across all documentation files. SQL migration comments are historical and should NOT be changed.

---

**Overall Product Grade: 6.5/10**
Strong technical foundation and pipeline. Conversion flow has critical blockers (pricing buttons, email gate). Trust layer needs indemnity insurance + social proof. Mobile needs hamburger nav. Data freshness gap between dashboard and scans-reports is a consistency bug. Scanner UX needs animation polish (dual-axis scan line, deferred score panel) and dark mode color fixes. Sample PDF voice needs to be a practical findings report, not locked content. All fixable within 1-2 sprints.
