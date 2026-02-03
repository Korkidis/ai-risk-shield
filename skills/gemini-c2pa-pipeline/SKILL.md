---
name: gemini-c2pa-pipeline
description: Protocols for the Analysis Pipeline (Gemini 1.5 Pro + C2PA). Use when modifying scan logic, prompt engineering, or provenance verification.
---

# Gemini & C2PA Skills

## 1. Context & Architecture (Synchronous API)
The "Analysis Engine" currently runs as a **Next.js Serverless Function** (`/api/analyze`).
*   **Trigger**: Client POSTs file directly to API.
*   **Flow**: Upload -> Gemini Analysis -> C2PA Verify -> DB Write.
*   **Warning**: This is a long-running synchronous process. Vercel timeout limits apply (max 60s).
*   **Output**: Returns JSON `RiskProfile` directly to client.

## 2. Gemini 1.5 Pro Guidelines

> **Source of Truth**: See [`GEMINI_C2PA_STANDARDS.md`](../../GEMINI_C2PA_STANDARDS.md) for the exact Prompt Structure, Scoring Matrix, and Weighting Logic.

### A. Prompt Engineering (Forensic Tone)
*   **Objective**: "You are a forensic IP analyst."
*   **Tone**: Objective, factual, severe.
*   **Output**: Strict JSON.

### B. Handling Tokens
*   Video analysis requires upload to File API.
*   Always delete temporary files key after processing (`fs.unlink`).

## 3. C2PA Verification (The Hard Part)
*   **Library**: `c2pa-node` (requires binary bindings) or `c2pa` (WASM).
*   **Failure Mode**: If C2PA fails, **do not fail the scan**.
    *   Log the error.
    *   Set `provenance: { type: 'missing' }`.
    *   User UI: "No Credentials Found" (Yellow Warning), not "Error" (Red).

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
- [ ] are temp files cleaned up?
