---
name: gemini-c2pa-pipeline
description: Protocols for the Analysis Pipeline (Gemini 2.5 Flash + C2PA). Use when modifying scan logic, prompt engineering, or provenance verification.
---

# Gemini & C2PA Skills

## 1. Context & Architecture (Two Pipelines)
The system currently has **two pipelines** that must remain consistent:
*   **Synchronous**: `POST /api/analyze` (client upload → Gemini → C2PA → DB write → returns `RiskProfile`).
*   **Asynchronous**: background processor (`scan-processor.ts`) for anonymous uploads.
*   **Warning**: The sync path is long‑running; Vercel timeouts apply (max 60s).
*   **Source of Truth**: Canonical scoring + tiers live in `lib/risk/scoring.ts` and `lib/risk/tiers.ts`. Do not re‑implement thresholds.

## 2. Gemini 2.5 Flash Guidelines

> **Source of Truth**: See [`GEMINI_C2PA_STANDARDS.md`](../../GEMINI_C2PA_STANDARDS.md) for the exact Prompt Structure, Scoring Matrix, and Weighting Logic.

### A. Prompt Engineering (Forensic Tone)
*   **Objective**: "You are a forensic IP analyst."
*   **Tone**: Objective, factual, severe.
*   **Output**: Strict JSON.

### B. Handling Tokens
*   Video analysis requires upload to File API.
*   Always delete temporary files after processing (`fs.unlink`).

## 3. C2PA Verification (The Hard Part)
*   **Library**: `c2pa-node` (requires binary bindings) or `c2pa` (WASM).
*   **Failure Mode**: If C2PA fails, **do not fail the scan**.
    *   Log the error.
    *   Set provenance status to `error` or `missing` per canonical mapping.
    *   User UI: "No Credentials Found" (Yellow Warning) vs "Error" (Red) is a **5‑value** system.
*   **Status Mapping**: Use `computeProvenanceStatus()` / `computeProvenanceScore()` from `lib/risk/scoring.ts`. Do not derive status from score in‑line.

## 4. Realtime Feedback Protocol
The frontend `RSScanner` expects specific log events via Supabase Realtime channel `scan:{id}`.

### Standard Events:
1.  `INIT`: "Initializing System..."
2.  `UPLOAD_GCP`: "Secure Tunnel Established (Google Cloud)"
3.  `VISION_ANALYSIS`: "Running Optical Character Recognition..."
4.  `IP_MATCH`: "Comparing against Trademark Database..."
5.  `C2PA_VERIFY`: "Extracting Cryptographic Manifest..."
6.  `COMPLETE`: "Analysis Finalized."

## 5. Verification Checklist
- [ ] Does Gemini output valid JSON?
- [ ] Is the C2PA step wrapped in a `try/catch` block?
- [ ] Are we emitting Realtime logs for every step?
- [ ] Are temp files cleaned up?
- [ ] Are both pipelines using canonical scoring/tiers?
