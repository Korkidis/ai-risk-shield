---
description: How to sync current changes to Git
trigger: Run when the user says "/sync" or periodically after completing a major task block.
---
// turbo-all
1. Check the current branch name: `git branch --show-current`
2. Stage all changes: `git add .`
3. Commit with a descriptive message based on recent work: `git commit -m "chore: sync latest progress"` (Note: Agent should generate a more specific message)
4. Push to the remote branch: `git push origin [branch-name]`
