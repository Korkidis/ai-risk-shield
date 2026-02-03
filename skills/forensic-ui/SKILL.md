---
name: forensic-ui-construction
description: Best practices for building UI components in the 'Forensic Instrument' style. Use when creating new pages, components, or modifying the interface.
---

# Forensic UI Construction Skill

## 1. Context & Philosophy
Our UI design is not "clean" or "minimal" - it is **Forensic**. It mimics high-end physical equipment (Braun, Keysight).
*   **Physicality**: Everything has weight. Shadows define depth, not elevation.
*   **Precision**: Data is dense, monospace, and labelled.
*   **No Magic**: Loading states show "Processing", not spinners.

## 2. Core Components (The "Parts Bin")
Do not build from scratch. Assemble using `components/rs/*`.

### A. The Chassis
*   **`RSPanel`**: The main structural container. Use for large sections.
*   **`RSCard`**: Inner grouping units.
*   **`RSWell`**: Recessed areas for data display (darker background, inner shadow).

### B. The Controls
*   **`RSLever`**: Use instead of standard checkboxes for boolean states.
*   **`RSKnob`**: Use for scalar adjustments (0-100).
*   **`RSButton`**: Tactile "keys" with deep press states.

### C. The Feedback
*   **`RSMeter` / `RSGauge`**: Visualizing scalar data.
*   **`RSTelemetryStream`**: Scrolling logs for async operations.
*   **`RSStatusBadge`**: Small, illuminated indicators (Safe/Warning/Critical).

## 3. Styling Rules (Tailwind)

> **Source of Truth**: See [`DESIGN_CONTEXT.md`](../../DESIGN_CONTEXT.md) for the full "MOMA_SPEC" token list.

### Quick Reference
*   **Background**: `bg-[#EBE7E0]` (Clay White)
*   **Signal**: `text-[#FF4F00]` (Active/Error only)
*   **Shadows**: Use custom Z-axis utilities (`shadow-l1`, `shadow-l2`). Do not use default tailwind shadows.

## 4. Implementation Workflow
1.  **Check `dashboard/design-lab`**: Does the component exist?
2.  **Assemble**: Combine `RSPanel` (Container) + `RSWell` (Screen) + `RSData` (Content).
3.  **Label**: Every input needs a generic `.rs-type-label` (uppercase, bold, small).

## 5. Verification Checklist
- [ ] Did I use `RS` components?
- [ ] Is the background `Clay White` (not `#FFFFFF`)?
- [ ] Do inputs look "recessed" (inner shadow)?
- [ ] Is the font family correct (`Inter` for UI, `JetBrains Mono` for data)?
