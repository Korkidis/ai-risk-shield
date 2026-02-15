# Gemini & C2PA Standards: Logic & SDKs
**Version:** 2.1 | **Status:** Implemented | **Scope:** Analysis Logic

This document defines the exact logic, prompts, scoring algorithms, and technical standards used by the automated analysis engine. It serves as the "Rulebook" for how we quantify risk and verify authenticity.

---

## 1. Analysis Architecture

### Pipeline Orchestration (`scan-processor.ts`)
The system employs a "Hybrid Forensic" pipeline that validates content layers via the Gemini **2.5 Flash** Vision API and C2PA Node SDK:

1.  **Risk Analysis**: AI assessment of liability (IP) and policy violations (Safety).
2.  **Provenance Layer**: Cryptographic verification of asset history (C2PA).
3.  **Composite Logic**: Weighted scoring combining both layers.

---

## 2. Risk Scoring Models (Canonical)

### Composite Algorithm (Single Source of Truth)
Defined in `lib/risk/scoring.ts`.

**Inputs**
- IP score (0–100)
- Safety score (0–100)
- C2PA status → provenance score (mapping below)

**Rules**
1. **C2PA Trust Override ("Firefly Rule")**  
   If C2PA is **valid**, cap IP score at **10**.
2. **Weighted average**  
   `Composite = round(IP * 0.4 + Safety * 0.4 + Provenance * 0.2)`
3. **Compound multiplier**  
   If `IP ≥ 80` and `Provenance ≥ 60`, boost:  
   `Composite += round((IP + Provenance) / 10)` (capped at 100)
4. **Critical override**  
   If `IP ≥ 90`, floor composite to **95**.

### Tier Thresholds (Canonical)
`critical ≥ 91` · `high ≥ 76` · `review ≥ 51` · `caution ≥ 26` · `safe ≤ 25`

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

### Verification Logic & Trust Signals (5‑Value Fidelity)
| Status | Condition | Provenance Score |
| :--- | :--- | :--- |
| **valid** | Valid signature + trusted issuer + no tamper errors. | **0** |
| **caution** | Self‑signed/partial credentials, integrity valid but non‑standard. | **20** |
| **error** | Verification failed (parse/crypto error). | **50** |
| **missing** | No C2PA metadata found. | **80** |
| **invalid** | Signature mismatch (tampering detected). | **100** |

### Audit Trail Metadata
For every scan, we extract and store:
*   **Issuer**: Who signed it? (e.g., "Adobe Firefly", "Truepic").
*   **Timestamp**: When was it signed?
*   **Assertions**: Claims made in the manifest (e.g., "created via AI", "edited in Photoshop").
*   **Validation Errors**: Specific failure reasons.

---

## 5. Technical Configuration

### Gemini API
*   **Model**: `gemini-2.5-flash`
*   **Safety Settings**: `BLOCK_NONE` (Monitor risk, do not suppress).

### C2PA SDK
*   **Library**: `c2pa-node`
*   **Manifest Handling**: Reads active manifest from binary; fail-safe to "Missing" if unreadable.
