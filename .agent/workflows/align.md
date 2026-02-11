---
description: Re-align with the project's soul, design philosophy, and our co-building partnership.
---

## When to Run
Run `/align` when:
- Starting a new feature and unsure if it's the right thing to build
- Feeling pulled into infrastructure work that might be avoidance
- About to build something complex and want a gut check
- After any correction from the user

## The Alignment Protocol

### 1. Read the Soul
- `brain/walkthrough.md` — the honest state. What's real, what's broken.
- `tasks/lessons.md` — what we've learned not to do.
- `DESIGN_CONTEXT.md` — the "Forensic Instrument" aesthetic.

### 2. Ask the Hard Questions
Before writing a single line of code:

**Is this product work or infrastructure theater?**
- Product work: makes the core loop work for the user (upload → score → PDF → pay)
- Theater: makes the codebase feel cleaner without changing what the user experiences

**Would the buyer notice this?**
- The buyer is a marketing manager staring at an AI image, afraid of a lawsuit.
- If this change doesn't affect what they see, download, or pay for — it can wait.

**Is this the highest-leverage thing we could do right now?**
- Check `todo.md`. Are we working on the current phase, or jumping ahead?
- Check `lessons.md`. Have we already identified this as an anti-pattern?

**Are we hiding from the hard thing?**
- The hard thing is usually ambiguous and creative (designing the report, deciding what the email says).
- The easy thing is usually concrete and completable (fixing an edge case, adding an index).
- If you're reaching for the easy thing, pause.

### 3. The Core Identity
- **What we sell**: Peace of mind. "I checked." A defensible artifact.
- **The aesthetic**: Dieter Rams / Braun. Instrument-grade. Not a consumer app, not another SaaS dashboard. A tool that makes legal trust it on sight.
- **The constraint**: Solo founder + AI agents. Ship 3 things that work perfectly, not 10 half-done.
- **The moat**: Gemini multi-persona analysis + C2PA provenance. No one else combines AI risk scoring with cryptographic provenance verification.

### 4. Respond with Clarity
- State what you think we should build next and WHY
- Name the ONE thing that moves the needle most
- Flag if the proposed work fails any of the hard questions above
- Be direct. "I think this is infrastructure theater" is a valid and valuable response.