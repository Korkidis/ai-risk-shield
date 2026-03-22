# Scanner Overview

Last updated: 2026-03-22
Audience: founders, operators, product, engineering, trust and safety
Purpose: plain-English explanation of how the scanner works today, what it is actually doing, and where findings end and mitigation begins

## What the scanner is

The scanner is a structured inspection system for uploaded creative assets.

It is not one single AI guess.
It is a layered pipeline that checks:

- IP risk
- brand safety risk
- provenance and authenticity risk

Those three signals are then combined into one composite risk score, a risk level, a set of findings, and a stored report object the product can render later.

The scanner is the signal.
The mitigation report is the interpretation and action layer built on top of that signal.

## What the product is trying to do

The scanner exists to help a team answer:

- What did we detect?
- Where does the risk seem to come from?
- How serious is it?
- What is documented and what is not?
- Does this need revision, escalation, or proof before publishing?

The purpose is not to shut work down reflexively.
The purpose is to help teams move faster with clearer evidence and better judgment.

## Findings vs mitigation

These are separate layers and should stay separate.

### Findings

Findings are the factual output of the scan layer.
They should explain:

- what the system detected
- where it appears
- what kind of risk it may represent
- why it may matter

Examples:

- potential logo or character detection
- brand safety violation
- missing or invalid provenance

### Mitigation

Mitigation is the advisory layer built on top of findings.
It should turn scan output into:

- practical next steps
- evidence requests
- approval or escalation guidance
- safer alternatives
- residual-risk framing

The scanner is the signal.
The mitigation report is the flashlight, the microscope, and the medicine.

## Exact stack

- Frontend and app runtime: Next.js 16, React 19, TypeScript
- Database, auth, storage, realtime: Supabase
- AI analysis: Google Gemini via `@google/generative-ai`
- Main scan model: `gemini-2.5-flash`
- Guideline extraction model: `gemini-1.5-flash`
- Response validation: JSON schema + Zod
- Provenance verification: `c2pa-node`
- Video frame extraction: `fluent-ffmpeg`
- Billing: Stripe
- Email/PDF delivery: Resend + jsPDF

## Main files

- Authenticated upload: `app/api/scans/upload/route.ts`
- Anonymous upload: `app/api/scans/anonymous-upload/route.ts`
- Main scan processor: `lib/ai/scan-processor.ts`
- Image multi-persona analysis: `lib/gemini.ts`
- IP analyzer: `lib/ai/ip-detection.ts`
- Brand safety analyzer: `lib/ai/brand-safety.ts`
- Canonical scoring: `lib/risk/scoring.ts`
- Canonical score bands: `lib/risk/tiers.ts`
- Scan retrieval API: `app/api/scans/[id]/route.ts`
- Mitigation API: `app/api/scans/[id]/mitigation/route.ts`
- Mitigation generator: `lib/ai/mitigation-generator.ts`
- Guideline extraction: `app/api/guidelines/extract/route.ts`

## End-to-end flow

### 1. The user uploads a file

There are two main entry points:

- authenticated upload for tenant users
- anonymous upload for free users

The system checks:

- file type
- file size
- plan limits
- quota
- for videos, duration limits

If the file passes, it is stored in Supabase Storage and a database record is created for both the asset and the scan.

The scan starts in `processing` state.

### 2. The scan runs in the background

The upload route returns quickly, then background processing starts.

The scan processor:

- fetches the stored asset
- loads any selected brand guideline
- determines whether the file is an image or a video
- broadcasts progress messages to the UI through Supabase Realtime

### 3. The system checks provenance

The scanner tries to verify C2PA Content Credentials.

This is the chain-of-custody layer.
It helps answer whether the asset has verifiable authenticity metadata.

Possible outcomes include:

- valid
- caution
- missing
- invalid
- error

This provenance result matters a lot in final scoring.

### 4. Image scans use a richer multi-persona analysis path

For images, the system runs multiple specialist lenses in parallel:

- IP specialist
- brand safety analyst
- provenance specialist

These are all Gemini-backed analysis roles with structured JSON outputs.

If a tenant guideline exists, the prompt includes brand-specific rules so the analysis can reflect explicit policy rather than only generic defaults.

### 5. Video scans use a frame-based path

For videos, the system:

- checks provenance on the full video file
- extracts a limited number of frames based on plan level
- runs IP and brand safety analysis on each frame
- keeps the highest-risk signals it finds

So video is currently:

- file-level provenance
- frame-level risk detection
- worst-case aggregation

It is useful, but it is thinner than the image pipeline.

### 6. The system computes the final risk score

The canonical scoring module combines three inputs:

- IP score
- brand safety score
- provenance score

Current weightings:

- IP: 40%
- brand safety: 40%
- provenance: 20%

Important behavior:

- valid C2PA credentials strongly reduce IP risk
- high IP risk plus weak provenance increases the final score
- extremely high IP risk can force the result into near-critical territory

### 7. The score is translated into a risk tier

Current canonical thresholds:

- 0-25: Safe
- 26-50: Caution
- 51-75: Review
- 76-90: High
- 91-100: Critical

### 8. Findings are saved

Once scoring is complete, the processor stores:

- composite score
- risk level
- per-domain scores
- risk profile blob
- scan findings
- provenance details
- video frame summaries when relevant

This data becomes the factual inspection record the app can display later.

### 9. Usage is charged only after successful completion

Quota is consumed on successful completion, not on upload.

That means:

- completed scans count
- failed scans should not count

For paid tenants, usage is also reported to Stripe after the scan succeeds.

### 10. The UI decides how much to reveal

Authenticated tenant users can access the full scan report for scans inside their tenant.

Anonymous users go through a softer gate:

- before email capture, they see a partial or masked view
- after email capture, the full scan report can be unlocked

This means the system can process the scan first, then decide how much detail to reveal based on entitlement and state.

### 11. Mitigation is a separate premium layer

The mitigation report is generated after the scan exists and only if:

- the scan is complete
- the user is authorized
- mitigation credits are available, or a mitigation purchase has been made

The mitigation generator reads:

- scan scores
- findings
- risk profile
- optional guideline context

It then returns a structured mitigation report object.

## Methodology in plain English

The methodology is straightforward:

1. Inspect the asset for recognizable risk signals
2. Check whether the asset has trustworthy provenance
3. Translate those signals into per-domain scores
4. Combine them using one canonical scoring model
5. Save factual findings
6. Optionally generate a deeper mitigation layer on top

The strongest current scanner domains are:

- IP and identity signals
- brand safety signals
- C2PA-based provenance

The scanner is strongest when it can say:

- this appears to contain X
- this kind of issue usually matters because Y
- provenance is valid, weak, or absent

## What the scanner does well today

- It has a real end-to-end pipeline, not just a demo prompt.
- It separates scanning from mitigation.
- It stores structured results.
- It has one canonical score-combination module.
- It supports tenant-specific guidelines.
- It handles image and video differently rather than pretending they are the same.

## What to keep in mind

- Findings are not the same thing as final business advice.
- Mitigation should not collapse into generic AI writing or legal posturing.
- Governance should influence interpretation, thresholds, and advice, not muddy the factual finding layer.
- Clear issues should be treated differently from ambiguous ones.
- The system should be pro-creativity, pro-human workflow, and pro-defensibility at the same time.

## Short version

If you explain the product to a non-technical person:

The scanner takes in an image or video, checks for IP problems, brand safety issues, and authenticity signals, then combines that into one risk score and a set of findings. Those findings tell you what may be wrong. The mitigation report is the next layer: it tells you what to do about it, what proof to collect, what approvals may be needed, and what risk would remain if you publish anyway.
