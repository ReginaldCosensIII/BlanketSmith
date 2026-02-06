# Agentic Skills & Architecture

This document defines the Agentic Skills architecture for BlanketSmith, enabling the AI agent to embody domain-specific expertise and follow strict safety protocols.

## 1. Skill Architecture

Skills are markdown files located in `.agent/skills/` that provide context, directives, and enforcement rules for specific domains.

### Staging Area Policy
- **Location**: `.agent/skills/staging/`
- **Purpose**: All *new* or *proposed* skills must be created here first.
- **Activation**: A skill is only "Active" (enforced) when moved to the parent `.agent/skills/` directory by the user.
- **Autonomous Growth**: The **Skill Architect** may autonomously propose new skills in Staging if it detects repeated architectural corrections.

## 2. Active Skills Catalog

| Skill | Filename | Key Directives |
| :--- | :--- | :--- |
| **Monorepo Context** | `.agent/rules/000-monorepo-context.md` | **ALWAYS** verify CWD before running `npm`/`supabase`. |
| **Supabase Oracle** | `supabase_oracle.md` | **FORBIDDEN** from assuming DB schema; must verify `types.ts`. checks migrations. |
| **Logic Consistency** | `logic_consistency.md` | **STOP & DISCUSS** if duplicating business logic (DRY). |
| **Frontend & Brand** | `frontend_brand.md` | **MUST** use `SharedComponents.tsx` as UI Source of Truth. |
| **Command Registry** | `command_registry.md` | **FORBIDDEN** from separating Button/Hotkey logic. |
| **Skill Architect** | `skill-architect.md` | autonomously suggests new skills in Staging. |

## 3. Workflows

Executable workflows in `.agent/workflows/` automate standard processes:

- **/new_task**: Enforces "Stop and Wait" and File Touch Contracts.
- **/verify_task**: Enforces Definition of Done (Type-check, Lint, Test).
- **/close_branch**: Audits documentation, reviews commits, and generates PR artifacts.
