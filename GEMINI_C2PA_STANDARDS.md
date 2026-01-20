# Gemini & C2PA Standards: Logic & SDKs
**Version:** 2.1 | **Status:** Implemented | **Scope:** Analysis Logic

This document defines the exact logic, prompts, scoring algorithms, and technical standards used by the automated analysis engine. It serves as the "Rulebook" for how we quantify risk and verify authenticity.

---

## 1. Analysis Architecture

### Pipeline Orchestration (`scan-processor.ts`)
The system employs a "Hybrid Forensic" pipeline that validates content layers via the Gemini 1.5 Pro Vision API and C2PA Node SDK:

1.  **Risk Analysis**: AI assessment of liability (IP) and policy violations (Safety).
2.  **Provenance Layer**: Cryptographic verification of asset history (C2PA).
3.  **Composite Logic**: Weighted scoring combining both layers.

---

## 2. Risk Scoring Models (First Order)

### The "Red Flag" Rule (Critical Override)
If **ANY** single component (IP, Safety, or Provenance) scores **≥ 85**, the Composite Score becomes that maximum value.
*   *Example*: A safe image with an Invalid C2PA signature (tampered) is **Critical Risk (100)**.

### The Weighted Formula
If no Red Flags exist, the score is calculated with this specific weighting:

| Component | Weight | Rationale |
| :--- | :--- | :--- |
| **IP Risk** | **70%** | Primary liability source. Hardest to defend. |
| **Provenance**| **20%** | Metric of authenticity/transparency. |
| **Brand Safety**| **10%** | Often subjective or contextual. |

**Formula:**
`Score = Round( (IP * 0.7) + (Provenance * 0.2) + (Safety * 0.1) )`

### IP Detection Standards (`ip-detection.ts`)
**Prompt Structure**: "Analyze this image for intellectual property (IP) that could pose copyright or trademark risks. Identify: 1. Copyrighted Characters... 2. Trademarked Logos... 3. Celebrity Likenesses... 4. Protected Designs..."

**Scoring Matrix**:
| Detection Type | Critical (100) | High (75) | Medium (50) | Low (25) |
| :--- | :--- | :--- | :--- | :--- |
| **Character** | Mickey Mouse, Batman | Generic Superhero | Cartoon Style | - |
| **Logo** | Nike Swoosh | "Nuke" (Fake Brand) | - | Text only |
| **Celebrity** | Taylor Swift | - | Lookalike | - |

---

## 3. Brand Safety Standards

### Concept (`brand-safety.ts`)
Checks compliance with major ad platform policies (Meta, YouTube, TikTok).

### Categories & Platform Compliance

| Violation | Facebook | Instagram | YouTube | TikTok | Severity |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Hate Symbols** | ❌ | ❌ | ❌ | ❌ | **Critical** |
| **Adult/Nude** | ✅ (Art) | ❌ | ✅ (Age-gate) | ❌ | **High** |
| **Violence**| ⚠️ | ⚠️ | ⚠️ | ❌ | **High** |
| **Alcohol** | ✅ | ✅ | ✅ | ⚠️ | **Medium** |

---

## 4. C2PA Provenance & Audit Trail

### Standard (`lib/c2pa.ts`)
We use the **C2PA (Coalition for Content Provenance and Authenticity)** standard via `c2pa-node` to verify the digital chain of custody.

### Verification Logic & Trust Signals
| Status | Condition | Score Impact |
| :--- | :--- | :--- |
| **Verified** | Valid signature + trusted issuer + no tamper errors. | **0 Risk** (Gold Standard) |
| **Untrusted**| Self-signed or unknown issuer, but valid integrity. | **30 Risk** (Caution) |
| **Invalid** | Cryptographic signature mismatch (tampering detected). | **100 Risk** (Critical) |
| **Missing** | No C2PA metadata found (common for legacy/stock). | **50 Risk** (Standard) |

### Audit Trail Metadata
For every scan, we extract and store:
*   **Issuer**: Who signed it? (e.g., "Adobe Firefly", "Truepic").
*   **Timestamp**: When was it signed?
*   **Assertions**: Claims made in the manifest (e.g., "created via AI", "edited in Photoshop").
*   **Validation Errors**: Specific failure reasons.

---

## 5. Technical Configuration

### Gemini API
*   **Model**: `gemini-1.5-flash`
*   **Safety Settings**: `BLOCK_NONE` (Monitor risk, do not suppress).

### C2PA SDK
*   **Library**: `c2pa-node`
*   **Manifest Handling**: Reads active manifest from binary; fail-safe to "Missing" if unreadable.
