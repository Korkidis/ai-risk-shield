# Functional Product Requirements Document (PRD)
**Version:** 2.0 | **Status:** Master Plan | **Theme:** "The Forensic Instrument"

## 1. Introduction & Philosophy
This document is the execution blueprint for the full AI Risk Shield platform.
*   **Design Goal**: "Little design as possible." Eliminate decoration. Prioritize data density, clarity, and physical feedback.
*   **Development Goal**: Agile flexibility with Enterprise rigidity on security. Ship fast, but never break trust.
*   **Core Loop**: Upload (Frictionless) → Analyze (Forensic) → Gate (Conversion) → Report (Value) → Manage (Teams).

---

## 2. Feature Specifications

### Feature 1: The Upload Zone (Anonymous Intake)
**User Story**: As a panicked Brand Manager, I want to drag-and-drop a file immediately and see analysis start without creating an account.

*   **Behavior**:
    *   User drags file onto `RSFileUpload` (The "Drop Zone").
    *   System generates `session_id` (UUID) and stores in `httpOnly` cookie.
    *   File uploads to Supabase Storage `uploads/{session_id}/{filename}`.
    *   UI transitions to "Processing State" using **Scanning Hardware** (not a spinner).
*   **Acceptance Criteria**:
    *   [ ] Supports JPG, PNG, MP4. Max 50MB.
    *   [ ] No login required.
    *   [ ] Real-time progress represented by `RSStatusBadge` or mechanical logs.
*   **UI Components**: `RSFileUpload` (Chassis indentation, mechanical state change).
*   **API**: `POST /api/scans/create-anonymous`

### Feature 2: The Analysis Engine (The Instrument)
**User Story**: The system acts as a black box auditor. I want to *feel* the machine working.

*   **Behavior**:
    *   Triggered immediately after upload.
    *   **Visuals**: `RSScanner` activates. Optical reticle scans the asset.
    *   **Telemetry**: `RSTelemetryStream` displays real-time logs (e.g., "INIT_GEMINI_VISION", "C2PA_VERIFY_SIG").
    *   **Feedback**: `RSMeter` needles twitch as confidence scores come in.
*   **Acceptance Criteria**:
    *   [ ] Processing time < 10s for images, < 30s for video.
    *   [ ] No generic spinners. All loading states must look like "System Processing".
    *   [ ] Logs must be real or realistic (no "Lorem Ipsum").
*   **Data Flow**: Storage → API Route → Gemini/C2PA → Supabase DB (`scans`, `scan_findings`).

### Feature 3: The Results Gate (Teaser Interface)
**User Story**: As a user, I want to see the high-level verdict, but I understand I must "unlock" the full forensic details.

*   **Behavior**:
    *   Display **The Gauge**: `RSGauge` (or similar analog meter) swings to the final 0-100 score.
    *   Display Top 3 Findings (Blurred/Redacted) using `RSBlurOverlay`.
    *   **The Gate**: "Enter Email to Unlock Full Forensic Report" overlay.
*   **Acceptance Criteria**:
    *   [ ] Score must be clearly visible via `RSGauge` or `RSMeter`.
    *   [ ] "Blur" effect must look premium (frosted glass/analyzed glass).
    *   [ ] Email submission sends "Magic Link" and unlocks view.
*   **UI Components**: `RSGauge`, `RSBlurOverlay`, `RSInput` (for email).

### Feature 4: The Full Report (Authenticated View)
**User Story**: As a Legal Team member, I need a detailed, audit-ready breakdown of every risk factor to make a "Go/No-Go" decision.

*   **Layout & Tools**:
    *   **Header**: Score, Timestamp, Asset ID displayed in `RSHeader`.
    *   **Tab System (`RSTabs`)**:
        *   **IP Analysis**: Detailed list of detected characters/logos (`RSDataGrid`).
        *   **Brand Safety**: Policy violations checklist with `RSToggle` or `RSStatusBadge` indicators.
        *   **Provenance**: C2PA Chain of Custody (Issuer, Dates) displayed as a timeline or data stream.
    *   **Action Bar**: `RSButton` for "Export PDF", "Share", "Delete Asset".
*   **Acceptance Criteria**:
    *   [ ] All data from `scan_findings` is rendered.
    *   [ ] PDF Export generates a clean, stamped document.
    *   [ ] "Delete" complies with data retention policy (immediate hard delete).

### Feature 5: Team Accounts & Dashboard (Logged In)
**User Story**: As an Agency Director, I want to see what my team is scanning and manage billing.

*   **Dashboard View**:
    *   **Project List**: `RSDataGrid` showing recent scans, risk scores, and users.
    *   **Team Management**: Invite users via email (`RSInput` + `RSButton`).
    *   **Billing**: View usage vs. limit (`RSMeter` for 3/100 scans used).
*   **Acceptance Criteria**:
    *   [ ] RLS policies enforce team-only access.
    *   [ ] Admin can revoke access.
    *   [ ] "Workspace" concept isolates data between clients. (**Backend Implemented Jan 2026**: `parent_tenant_id` + Switching API).

### Feature 6: Admin Context (Brand Guidelines)
*(To be developed - Placeholder)*
*   User can upload "Brand Config" (Safe/Unsafe lists).
*   System checks against specific "Do Not Use" assets.

### Feature 7: Deep Mitigation & Insurance (The Upsell)
**User Story**: As a user with a "High Risk" asset, I need a step-by-step plan to fix it, or insurance if I choose to publish it.

*   **Deep Mitigation Report (Paid Feature)**:
    *   **Action**: "Generate Mitigation Plan" `RSButton` (available only on Paid Tiers).
    *   **Output**: AI-generated legal/creative advice (e.g., "Blur the Nike logo at 0:04", "Obtain release for person A").
    *   **Limits**: Paid accounts get X mitigation reports/month (sliding scale).
*   **Insurance Referral**:
    *   **Trigger**: If Composite Score > 10 (Non-Zero Risk).
    *   **UI**: "Insure this Asset" callout card via Partner API (e.g., "Get a quote for $50k liability coverage").
    *   **Logic**: "This asset has a risk score of 45. Cover your downside."
*   **Acceptance Criteria**:
    *   [ ] Mitigation Button is locked for Free Tier.
    *   [ ] Insurance Card appears dynamically based on risk score.
    *   [ ] Usage limits tracked in `tenants.usage_limit_mitigation`.

---

## 3. Technical Constraints & Security
*   **SOC 2 Readiness**:
    *   All DB access via RLS policies.
    *   Assets stored with random UUID filenames.
    *   Audit logs for all "Unlock" and "Delete" actions.
*   **Privacy Context (Ephemeral)**:
    *   Video analysis requires temporary upload to Google Cloud (Gemini).
    *   Processing uses local `/tmp` storage (purged after use).
    *   *Constraint*: Must disclose "Cloud Processing" in Terms of Service.
*   **Performance**:
    *   Edge Functions for lightweight API routes.
    *   `gemini-1.5-flash` for speed.
    *   **Async Processing**: Uses self-referential HTTP calls (monitor for timeout risks).
*   **Design System**:
    *   Strict adherence to `DESIGN_CONTEXT.md` tokens.
    *   **NO** ad-hoc styling. Use `RSPanel`, `RSCard`, `RSButton`, `RSLever`, `RSKnob`, `RSStatusBadge` exclusively.

---

## 4. Data Model Reference
*   `assets`: `id`, `session_id` (nullable), `storage_path`, `tenant_id`.
*   `scans`: `id`, `asset_id`, `risk_score` (0-100), `email`, `purchased` (bool), `tenant_id`.
*   `scan_findings`: `scan_id`, `type` (ip/safety/c2pa), `severity`, `description`.
*   `tenants`: `id`, `name`, `plan`, `monthly_scan_limit`, `scans_used_this_month`, `parent_tenant_id`.
*   `provenance_details`: `id`, `signature_status`, `raw_manifest` (JSONB), `edit_history` (JSONB).
*   `users`: `id`, `email`, `tenant_id` (FK).

---

*End of PRD*
