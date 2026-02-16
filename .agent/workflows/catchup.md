---
description: Catch up on project status and outline the critical path
---

## Session Startup (Run This First)
Every new session begins here. Do not skip steps. Do not start coding until this is done.

### Tier 0: The Lens (READ FIRST)
Read `brain/AGENT_BRIEFING.md`. This sets the mental model for everything that follows — who you're building with, why the architecture is complex, and what "done" means.

### Tier 1: Ground Truth (READ EVERY SESSION)
These files are the operating system of the project. Read them in order.

1. `tasks/todo.md`: **The execution plan.** Sprint-level tasks, dependencies, file references. This is what we're building and why.
2. `brain/walkthrough.md`: **The honest state of the product.** What's real, what's theater, what's broken.
3. `tasks/lessons.md`: The self-correction log. Check what NOT to do before proposing work.
4. `tasks/rules.md`: The team's operating contract.

**Do NOT read `roadmap.md`** — it's deprecated and redirects to `todo.md`.
**Do NOT plan from `NORTH_STAR.md`** — that's vision/strategy, not execution. Read it only for context on personas and jobs-to-be-done.

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
   - What sprint are we in? What's the next unchecked item in `todo.md`?
   - Check `lessons.md` — is the proposed work an anti-pattern we've already identified?
   - Does the proposed work complete the transaction, or is it infrastructure theater?
3. **Identify Tier 2 Docs** based on what the next task touches. Read them.
4. **Produce the Brief** — present to the user:
   - **Current sprint**: Which sprint in todo.md, which task is next
   - **Honest state**: What's real vs. what's broken (from walkthrough.md)
   - **Proposed next step**: The single most important thing
   - **Risk check**: What could go wrong (from lessons.md)
5. **Wait for confirmation.** Do not start coding until the user says go.

## The Sanity Check Test
Before ANY proposed work, ask:
> "Does this help someone go from scared → paid → PDF in hand?"
>
> If yes → you're building the right thing.
> If no → what's the ONE thing preventing that? Build that instead.

## Document Authority
| Doc | Role |
|-----|------|
| `tasks/todo.md` | **Execution source of truth** — what to build, in what order |
| `brain/walkthrough.md` | Session orientation — what's real, what's broken |
| `NORTH_STAR.md` | Vision & strategy (read for context, don't plan from it) |
| `roadmap.md` | **DEPRECATED** — do not read |
