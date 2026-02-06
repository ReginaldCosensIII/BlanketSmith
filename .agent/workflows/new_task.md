---
description: Start a New Task (Strict Safety Protocol)
---

# Start a New Task

This workflow automates the "Prompt A" kickoff process, ensuring safety and compliance with the BlanketSmith workflow.

## Steps

1. **Reconnaissance**
   - Read `docs/BETA_ROADMAP.md` or the specific issue description.
   - Read `docs/WORKFLOW.md` to refresh on the latest standards.
   - Inspect the codebase using `list_dir` and `search` tools to understand the context. **DO NOT EDIT ANY FILES YET.**

2. **Create Branch**
   - Create a new branch using the naming convention: `feat/<slug>`, `fix/<slug>`, `refactor/<slug>`, `docs/<slug>`, or `chore/<slug>`.
   - Command: `git checkout -b <branch_name>`

3. **Initialize Task Artifacts**
   - Create/Update `task.md` with a checklist of steps.
   - Create `implementation_plan.md` using the standard template:
     - **Goal Description**
     - **User Review Required**
     - **Proposed Changes** (Grouped by component)
     - **Verification Plan**

4. **Define File Touch Contract**
   - In `implementation_plan.md`, explicitly list:
     - **READ SET**: Files you will inspect.
     - **EDIT SET**: The *exact* list of files you intend to modify.
     - **DENYLIST**: Critical files you will NOT touch (e.g., lockfiles, config) unless explicitly authorized.

5. **Stop and Wait (CRITICAL)**
   - **ACTION**: Call `notify_user` to request approval for the `implementation_plan.md` and the File Touch Contract.
   - **MESSAGE**: "I have created the Implementation Plan and File Touch Contract. I am STOPPING now. Please review `implementation_plan.md` and approve the file edit list before I proceed."
   - **RULE**: You must NOT proceed to edit code until the user explicitly approves.

6. **Execution**
   - Once approved, begin executing the plan.
