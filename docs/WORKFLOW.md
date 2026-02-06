# BlanketSmith Workflow (Beta Push Standard)

This document defines the standardized workflow for completing tasks using the Agentic workflow in Google AntiGravity IDE. It is optimized for the final push to Beta: safety-first, scope-locked execution, and predictable outcomes.

---

## 1) Guiding principles

### 1.1 Plan-first, code-second
The Agent must perform **Recon + Planning** before making edits. For safety-critical tasks, the Agent must **stop and wait for approval** before editing.

### 1.2 No scope creep
Only implement what is explicitly defined in the task **Scope** and **Acceptance Criteria**.

### 1.3 No unplanned refactors
Refactors are allowed **only when explicitly declared** as part of the task:

- The task **Type** must state it is a **Refactor** (full or partial).
- The task **Scope** must define refactor boundaries.
- The **File Touch Contract** must include all files expected to change.
- **Acceptance Criteria** must define what “done” means for the refactor.

Not allowed: opportunistic cleanup, “while I’m here” changes, formatting passes, dependency upgrades, or reorganizations **unless explicitly included**.

### 1.4 Minimal diff approach
Implement the smallest change set that satisfies acceptance criteria. Avoid broad formatting changes and large surface-area edits unless the task is explicitly a refactor task.

### 1.5 Verified completion
Every branch must end with a documented verification run and PR-ready artifacts.

---

## 2) Standard task lifecycle

Each task follows the same lifecycle:

1. **Task definition** (in `BETA_ROADMAP.md` or backlog docs)
2. **Branch planning** (scope + file plan + commit plan)
3. **Agent execution** (Prompt A)
4. **Review & corrections** (Prompt B as needed)
5. **Closeout** (Prompt C)
6. **Merge & post-merge documentation alignment** (as required)

---

## 3) Task implementation template (used in BETA_ROADMAP/backlog)

Copy/paste per task:

```md
## Task: [Task Name]
- Priority: [High/Medium/Low]
- Type: [Feature | Fix | Refactor | Docs | Chore]
- Objective: [One sentence outcome]

### Scope (In Scope)
- [Specific behaviors/outputs]
- [Specific UI/UX expectations]
- [Explicit “refactor scope” if applicable]

### Out of Scope
- [Explicit exclusions]
- No unplanned refactors (refactors allowed only if Type=Refactor and scoped above)

### Dependencies / Notes
- [Dependencies, links, context]

### File Touch Contract
**READ SET** (may inspect):
- [List or “TBD during Recon”]

**EDIT SET / ALLOWLIST** (may modify):
- [Exact file paths]

**DENYLIST** (must not modify):
- [Lockfiles/config/core files as applicable]

### Implementation Plan (high level)
1) [Step]
2) [Step]
3) [Step]

### Acceptance Criteria
- [Functional criteria]
- [UI criteria]
- [Edge case criteria]
- Build/tests: [required commands]

### Testing Plan
- Commands: [list]
- Manual checks: [list]

### Documentation Updates
- [Docs to update, if any]

### PR Requirements
- PR title format: Conventional Commits
- PR description must include Summary + Testing + Risks/Follow-ups
```

---

## 4) Agent prompting system

Three standardized prompts are used for all tasks:

- **Prompt A**: Branch kickoff (Recon → Plan → Implement → Verify → Closeout)
- **Prompt B**: Mid-branch iteration (targeted corrections)
- **Prompt C**: Branch closeout (verification + PR artifacts + doc updates)

### 4.1 Prompt A — Branch kickoff template (Safety + optional refactor)

```text
ROLE
You are the implementation Agent working inside Google AntiGravity IDE on the BlanketSmith repo.

CONTEXT
- Project: BlanketSmith
- Workflow: Agentic (you implement; I review)
- Beta push: safety-first and scope-locked.

TASK NAME
[Short name]

TASK TYPE
[Feature | Fix | Refactor | Docs | Chore]
NOTE: If type is Refactor, refactor scope is explicitly defined below. No additional refactors beyond that scope.

BRANCH
- Create/checkout: feat/[slug] (or fix/docs/chore/refactor)
- Base branch: main

SCOPE (IN SCOPE)
- [Exact behaviors or refactor changes]
- [Explicit boundaries for refactor if applicable]
- [Expected user-visible outputs]

OUT OF SCOPE (DO NOT DO)
- Do not make changes not required by acceptance criteria.
- Do not upgrade dependencies or change lockfiles unless explicitly included in ALLOWLIST.
- Do not modify configuration/tooling files unless explicitly included in ALLOWLIST.
- Do not touch unrelated components/styles.
- Do not perform formatting passes unless explicitly required by this task.

FILE TOUCH CONTRACT
READ SET (may inspect):
- [List]

EDIT SET / ALLOWLIST (may modify ONLY these files):
- [List exact paths]

DENYLIST (must not modify):
- [List exact paths]

PROCESS RULES (MANDATORY)
1) Recon (NO EDITS): inspect only READ SET and relevant references.
2) Plan: propose changes in 3–6 bullets and confirm the final EDIT SET.
3) STOP AND WAIT: Do not edit any file until I approve the plan (unless explicitly told “approval not required” for this task).
4) Implement with minimal diff strictly within EDIT SET.
5) Verify: run required commands and report results.
6) Closeout: provide PR artifacts and doc changes.

CHECKPOINT 1 OUTPUT (before any edits)
Return:
- Current behavior summary
- Proposed solution (3–6 bullets)
- Final EDIT SET (exact files you will change)
- Risks/unknowns
- Commit plan (single vs multi-commit)

ACCEPTANCE CRITERIA (MUST PASS)
- [List criteria]
- Build passes: [commands]
- No behavior changes outside scope.

TESTING REQUIRED
- Run: [commands]
- Manual checks: [steps]

DELIVERABLES
- Changes on branch
- Docs updated if impacted
- PR Title + PR Description (markdown)
- Suggested commit message(s)

BEGIN NOW
Start with CHECKPOINT 1 (Recon + Plan). Do not edit anything yet.
```

### 4.2 Prompt B — Mid-branch iteration template (Targeted fix)

```text
TASK CONTEXT
We are on branch [branch-name]. Scope is locked.

ISSUES TO FIX
1) [Specific issue]
2) [Specific issue]

REQUIREMENTS
- Fix only the issues listed.
- Do not broaden scope.
- Do not refactor unless explicitly necessary for the fix, and only within the existing file allowlist.

ACCEPTANCE CRITERIA
- [Measurable outcomes]

TESTING
- Re-run: [commands]
- Manual verify: [steps]

OUTPUT REQUIRED
- What changed (bullets)
- Commands run + results
- Any risks or follow-ups
```

### 4.3 Prompt C — Branch closeout template (PR-ready)

```text
BRANCH CLOSEOUT
We are finishing [branch-name]. Prepare for PR.

REQUIRED ACTIONS
1) Run verification:
   - [build/test/lint commands]
2) Ensure no debug logs, dead commented code, or stray TODOs (unless explicitly allowed).
3) Confirm documentation updates are complete:
   - Update BETA_ROADMAP.md if this task changes scope/status/behavior
   - Update any architecture/system docs impacted
4) Produce PR artifacts:
   - PR Title (conventional commits)
   - PR Description (markdown): Summary, Changes, Testing, Notes/Screenshots (if UI), Risks/Follow-ups
5) Provide commit message suggestions:
   - Squash option
   - Multi-commit option (if applicable)

OUTPUT FORMAT
- Verification results
- Final summary (5–10 bullets)
- PR Title
- PR Description (markdown)
- Commit message suggestions
- Docs changed list
```

---

## 5) Hardened safety protocol (Final Beta push)

Use this protocol for any task with elevated risk or large surface area (including planned refactors).

### 5.1 Mandatory checkpoints

- **Checkpoint 1**: Recon + Plan (**no edits**) → **STOP**
- **Checkpoint 2**: Implementation complete → provide a concise diff summary
- **Checkpoint 3**: Verification + Closeout → commands run, results, PR artifacts

### 5.2 File Touch Contract
Every task must define:

- **READ SET**: files that may be inspected
- **EDIT SET / ALLOWLIST**: files that may be modified
- **DENYLIST**: files that must not be modified

If the Agent believes additional files must be modified:

- Stop and request approval with rationale and the smallest possible addition.

### 5.3 No hallucinations rules

- Never invent file paths; search the repo.
- Never assume functions/APIs exist; verify in code.
- Never add dependencies without explicit instruction.
- Never introduce “improvements” not requested.

---

## 6) Definition of Done (applies to every branch)

- Builds successfully and runs without new console errors.
- No new TypeScript errors.
- Acceptance criteria satisfied (including edge cases).
- UI sanity checked if UI was touched (layout, responsiveness basics, keyboard navigation where relevant).
- Docs updated if behavior/config/architecture changed.
- PR artifacts produced (title + description + testing notes).
- Branch is merge-ready (no WIP placeholders unless explicitly approved).

---

## 7) Git standards

### 7.1 Branch naming

- `feat/<short-hyphen-slug>`
- `fix/<short-hyphen-slug>`
- `refactor/<short-hyphen-slug>` (optional; use when task type is Refactor)
- `docs/<short-hyphen-slug>`
- `chore/<short-hyphen-slug>`

### 7.2 Commit message format (Conventional Commits)

- `feat: ...`
- `fix: ...`
- `refactor: ...` (only when task type is refactor)
- `docs: ...`
- `chore: ...`

### 7.3 Commit sizing rules

- Small tasks: 1 commit (squash-friendly).
- Medium tasks: 2–5 commits max (setup → core → polish → docs/tests).
- Large planned refactors: multiple commits permitted, but each commit must represent a coherent unit of value.

---

## 8) PR template standard

PRs must include:

- Summary
- Changes
- Testing
- Notes/Screenshots (if UI)
- Risks/Follow-ups

See `.github/pull_request_template.md`.

---

## 9) Standardization techniques to reduce pain points

1. Force a file touch allowlist before editing begins.
2. Use explicit out-of-scope bullets to prevent drift.
3. Require verification outputs (commands + results).
4. Treat documentation updates as deliverables, not “later.”
5. Use checkpoints that require stopping before edits for high-risk tasks.
6. Enforce minimal-diff discipline: no formatting churn unless required.
7. Always produce PR artifacts at closeout to reduce merge-time overhead.

---

## 10) Relationship to `BETA_ROADMAP.md`

`BETA_ROADMAP.md` and backlog items should be structured using the **Task Implementation Template** in Section 3, including:

- Task type (Feature/Fix/Refactor)
- Explicit scope boundaries
- File Touch Contract
- Acceptance criteria and testing plan
- Documentation updates
- PR requirements

This keeps planning and execution consistent and makes every task “prompt-ready.”

---

## 11) Agentic Automation (New)

The workflow described above is now automated via Agentic Workflows and Skills.

### 11.1 Workflows
Executable workflows are located in `.agent/workflows/`.
- **/new_task**: Automates "Prompt A", enforcing the "Stop and Wait" protocol and File Touch Contract.
- **/verify_task**: Automates "Prompt C" and the Definition of Done.
- **/close_branch**: Audits documentation, catalogs commits, and generates PR descriptions.

### 11.2 Skills & Rules
For a full catalog of active skills and the Staging Area policy, see [AGENT_SKILLS.md](./AGENT_SKILLS.md).

- **Context Rules**: `.agent/rules/` contains strict context rules (e.g., verifying `cwd`).
- **Skills**: `.agent/skills/` contains domain-specific instructions.
    - **Staging**: New skills are created in `staging/` and must be promoted by the user.
    - **Command Registry**: Defines strict mapping between UI actions and keyboard shortcuts.
    - **Frontend & Brand**: Defines design system and brand identity usage.


