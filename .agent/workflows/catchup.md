---
description: Catch up on project status and outline the critical path
---

## Session Startup (Run This First)
Every new session begins here. Do not skip steps. Do not start coding until this is done.

### Tier 1: Ground Truth (READ EVERY SESSION)
These files are the operating system of the project. You must read them to orient yourself.
1. `tasks/rules.md`: The team's operating contract.
2. `NORTH_STAR.md`: The vision and "Why".
3. `brain/walkthrough.md`: The recent history. **If missing, create it immediately from what you just read before presenting the brief.**
4. `tasks/todo.md`: The active plan.
5. `roadmap.md`: The phased timeline.
6. `tasks/lessons.md`: The self-correction log.

### Tier 2: Context Specific (Read based on Task)
Stop and think: What does the current task touch? Read the relevant specs.
*   **If modifying backend/db:** `ARCHITECTURE.md`, `SOC 2 Compliance.md`, `DATABASE_BACKEND.md`.
*   **If modifying UI:** `DESIGN_CONTEXT.md`, `FUNCTIONAL_PRD.md`.
*   **If modifying billing:** `SUBSCRIPTION_STRATEGY.md`.
*   **If modifying auth/setup:** `SUPABASE_SETUP.md`.

### Tier 3: Reference (On Demand)
Only read these if you hit a specific blocker or need deep detail.
*   `GEMINI_C2PA_STANDARDS.md`
*   `FREEMIUM_IMPLEMENTATION.md`
*   `CHANGELOG.md`

## Startup Sequence

1. **Read Tier 1 Docs.**
2. **Synthesize Status:**
   - Where are we on the `roadmap.md`?
   - What did we just finish (`walkthrough.md`)?
   - What is next (`todo.md`)?
3. **Identify Tier 2 Docs:**
   - Based on the "Next Step", which Tier 2 docs are required?
   - Read them now.
4. **Produce Summary Block:**
   - Present the current phase, recent progress, pending blockers, and **proposed next steps** to the user.
   - Wait for confirmation.