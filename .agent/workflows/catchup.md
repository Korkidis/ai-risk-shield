---
description: Catch up on project status and outline the critical path
---

## Session Startup (Run This First)
Every new session begins here. Do not skip steps. Do not start coding until this is done.

### Tier 1: Ground Truth (READ EVERY SESSION)
These files are the operating system of the project. Read them in order.

1. `tasks/rules.md`: The team's operating contract.
2. `NORTH_STAR.md`: The vision and "Why." Skip to the Jobs section and Decision Framework — don't re-read the full 700 lines every time.
3. `brain/walkthrough.md`: **The honest state of the product.** What's real, what's theater, what's broken. This is the most important file. If it's stale, stop and update it before proceeding.
4. `tasks/todo.md`: The sequenced plan (Phases A → B → C → D).
5. `tasks/lessons.md`: The self-correction log. Check what NOT to do before proposing work.

### Tier 2: Context-Specific (Read Based on Task)
Stop and think: What does the current task touch?
*   **If modifying backend/db:** `ARCHITECTURE.md`, `DATABASE_BACKEND.md`
*   **If modifying UI:** `DESIGN_CONTEXT.md`, `FUNCTIONAL_PRD.md`
*   **If modifying billing:** `SUBSCRIPTION_STRATEGY.md`
*   **If modifying auth/setup:** `SUPABASE_SETUP.md`

### Tier 3: Reference (On Demand)
Only if you hit a specific blocker:
*   `GEMINI_C2PA_STANDARDS.md`
*   `FREEMIUM_IMPLEMENTATION.md`
*   `CHANGELOG.md`

## Startup Sequence

1. **Read Tier 1 Docs.**
2. **Sanity Check** (This is the critical step — don't skip it):
   - What are we selling? (If you can't answer in one sentence, re-read `walkthrough.md`)
   - What's the current phase in `todo.md`? What's the NEXT incomplete item?
   - Check `lessons.md` — is the proposed work an anti-pattern we've already identified?
   - Does the proposed work make the **core loop** work better, or is it infrastructure theater?
3. **Identify Tier 2 Docs** based on what the next task touches. Read them.
4. **Produce the Brief** — present to the user:
   - **One sentence**: What are we selling?
   - **Current phase**: Where we are in todo.md
   - **Honest state**: What's real vs. what's broken (from walkthrough.md)
   - **Proposed next step**: The single most important thing
   - **Risk check**: What could go wrong (from lessons.md)
5. **Wait for confirmation.** Do not start coding until the user says go.

## The Sanity Check Test
Before ANY proposed work, ask:
> "If I showed a marketing manager this product right now, would they pay $49/month?"
>
> If yes → you're building the right thing.
> If no → what's the ONE thing preventing it? Build that instead.