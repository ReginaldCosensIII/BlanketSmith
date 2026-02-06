---
description: Close Branch & Audit (PR Prep)
---

# Close Branch & Audit

This workflow automates the final steps of a task, ensuring all compliance checks are met before a Pull Request is opened.

## Steps

1. **Documentation Audit**
   - **Check**: Compare your `implementation_plan.md` "EDIT SET" against the actual `git diff --name-only main...HEAD`.
   - **Action**: Explain any discrepancies in the PR description.
   - **Update**: Ensure `CHANGELOG.md` is updated.

2. **Commit Catalog**
   - Run `git log main...HEAD --oneline` to review your commit history.
   - **Squash Recommendation**: If there are many "wip" or "fix" commits, recommend squashing.

3. **PR Description Generation**
   - Read `.github/pull_request_template.md`.
   - Generate a PR description that fills out:
     - **Summary**: High-level impact.
     - **Changes**: Bullet points of technical changes.
     - **Testing**: What was verified.
     - **Risks**: Any "Supabase Oracle" or "Logic Consistency" warnings.

4. **Final Verification**
   - Run `/verify_task` (if not already run) to ensure build/test health.

5. **Notification**
   - Output the Final PR Title and Description block for the user to copy-paste.
   - **Crucial**: Always output a final `git commit` command with a suggested message (Conventional Commits) for any remaining changes (like these workflow artifacts).
