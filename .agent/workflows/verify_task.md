---
description: Verify Task (Commit & Save)
---

# Verify Task (Commit & Save)

This workflow automates the "Definition of Done" for a single task within a branch. **It ends with a Commit, not a PR.**

## Steps

1. **Automated Verification**
   - **Type Check**: Run `npm run type-check` (or `npm run type-check -w <workspace>`).
   - **Lint**: Run `npm run lint`.
   - **Tests**: Run `npm run test` (if applicable).
   - **Build**: Run `npm run build` to ensure no build errors.

2. **Manual Verification Check**
   - Review your `task.md` and `implementation_plan.md`.
   - Have you met all Acceptance Criteria?
   - Have you verified the UI (if applicable)?

3. **Cleanup**
   - Remove any temporary debug logs (`console.log`).
   - Remove any commented-out dead code.
   - Ensure `task.md` is fully checked off for this specific item.

4. **Generate Commit Artifact**
   - **Analyze**: Look at `git status` and `git diff`.
   - **Draft**: Create a Conventional Commit message that summarizes strictly what was verified in this step.
   - **Output**: "Ready to save progress. Run:"
     ```bash
     git add .
     git commit -m "type: description of this specific task"
     ```
   - **NOTE**: Do NOT generate a PR description yet. That happens in `/close_branch`.
