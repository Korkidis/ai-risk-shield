# Workflow Orchestration

## Project Context
*   **Environment:** Mac, Next.js, Supabase, Tailwind CSS
*   [Add specific project context or environment details here]

## 1. Spec Before Build (The Mini Spec)
*   **Before writing code**, you MUST create a mini-spec containing:
    *   **User Story**: Who is it for? What do they want? Why?
    *   **Acceptance Criteria**: Boolean pass/fail conditions.
    *   **Edge Cases**: What happens if offline? Null data? Weird inputs?
    *   **UI Rules**: Spacing, typography tokens, mobile behavior (responsive).
    *   **Tracking**: Any analytics events needing capture?
*   Do not proceed to coding until this spec is clear.

## 2. Subagent Strategy
*   Use subagents liberally to keep main context window clean
*   Offload research, exploration, and parallel analysis to subagents
*   For complex problems, throw more compute at it via subagents
*   One task per subagent for focused execution

## 3. Self-Improvement Loop
*   After ANY correction from the user: update `tasks/lessons.md` with the pattern
*   Write rules for yourself that prevent the same mistake
*   Ruthlessly iterate on these lessons until mistake rate drops
*   Review lessons at session start for relevant project

## 4. Proof of Work (The Definition of Done)
*   When a task is done, you MUST return:
    *   **6-Bullet Change Summary**: Specifics of what changed.
    *   **Commands Run**: Exact tests, lints, or build commands executed.
    *   **Git Diff Highlights**: Key architectural changes (not every line).
    *   **Visual Proof**: Screenshots or browser recording for key flows.
*   "It works on my machine" is not a valid output. Show the proof.

## 5. Demand Elegance (Balanced)
*   For non-trivial changes: pause and ask "is there a more elegant way?"
*   If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
*   Skip this for simple, obvious fixes – don't over-engineer
*   Challenge your own work before presenting it

## 6. Autonomous Bug Fixing
*   When given a bug report: just fix it. Don't ask for hand-holding
*   Point at logs, errors, failing tests – then resolve them
*   Zero context switching required from the user
*   Go fix failing CI tests without being told how

# Task Management
*   **Plan First:** Write plan to `tasks/todo.md` with checkable items
*   **Verify Plan:** Check in before starting implementation
*   **Track Progress:** Mark items complete as you go
*   **Explain Changes:** High-level summary at each step
*   **Document Results:** Add review section to `tasks/todo.md`
*   **Capture Lessons:** Update `tasks/lessons.md` after corrections

# Core Principles
*   **Simplicity First:** Make every change as simple as possible. Impact minimal code.
*   **No Laziness:** Find root causes. No temporary fixes. Senior developer standards.
*   **Minimal Impact:** Changes should only touch what's necessary. Avoid introducing bugs.
