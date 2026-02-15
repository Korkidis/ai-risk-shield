---
description: How to sync current changes to Git
trigger: Run when the user says "/sync" or periodically after completing a major task block.
---
// turbo-all
1. Check the current branch name: `git branch --show-current`
2. Verify upstream is set (or confirm before pushing): `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
3. Stage all changes: `git add .`
4. Commit with a descriptive message based on recent work: `git commit -m "chore: sync latest progress"` (Note: Agent should generate a more specific message)
5. **Confirm with user before pushing** (especially if no upstream is set or migrations are included).
6. Push to the remote branch: `git push origin [branch-name]`
