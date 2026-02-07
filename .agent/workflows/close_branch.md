---
description: Close Branch & Audit (Release Prep)
---

# Close Branch & Audit

This workflow automates the final release of a feature branch, aggregating multiple tasks into a single Pull Request.

## Steps

1. **Documentation Audit (CRITICAL)**
   - **CHANGELOG**: You **MUST** ensure `CHANGELOG.md` is updated with a summary of changes.
   - **Roadmap**: Check `docs/BETA_ROADMAP.md` status.
   - **Feature Gate**: Does this branch introduce a major new service or feature?
     - **YES**: Propose creating a new dedicated `.md` file in `docs/` to explain it.
     - **NO**: Verify existing docs are accurate.

2. **Code & Commit Audit**
   - Run `git status`. Is it clean? 
     - **NO**: You must output a `git add . && git commit -m 'chore: update documentation'` command BEFORE generating the PR.
   - Run `git log main...HEAD --oneline` to review the branch history.

3. **PR Description Generation**
   - Read `.github/pull_request_template.md`.
   - **Synthesis**: Summarize ALL the commits on this branch into a coherent story.
   - **Draft**: Generate the PR Description markdown:
     - **Summary**: High-level impact of the entire branch.
     - **Changes**: Aggregate bullet points from all tasks.
     - **Testing**: Combined testing verification.
     - **Risks**: Any "Supabase Oracle" or "Logic Consistency" warnings found across the whole branch.

4. **Final Notification**
   - Output the Final PR Title and Description block.
   - Output the final `git push` command suggestion.
