---
description: Verify Task & Closeout (Definition of Done)
---

# Verify Task & Closeout

This workflow automates the "Prompt C" verification process to ensure the branch is ready for merging.

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
   - Ensure `task.md` is fully checked off.

4. **Documentation Updates**
   - Update `CHANGELOG.md` with your changes.
   - Update `docs/BETA_ROADMAP.md` if the task status changed.
   - Update specific documentation files if architecture changed.

5. **Generate PR Artifacts**
   - Create a summary of changes.
   - Draft a PR Title (Conventional Commits).
   - Draft a PR Description (Summary, Changes, Testing, Risks).

6. **Final Notification**
   - Call `notify_user` with the PR artifacts and verification results.
