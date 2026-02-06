---
description: Harden Monorepo Context
---

# 000-monorepo-context

## Goal
Prevent accidental execution of commands in the wrong directory context within the Monorepo.

## Directive
Before running any `npm`, `yarn`, `deno`, or `supabase` command, you **MUST** verify your current working directory.

1. **Root Context**: If installing root dependencies or running workspace-wide scripts, ensure CWD is `<root>`.
2. **App Context**: If running app-specific commands (e.g., `npm run dev` for `apps/tool`), you MUST be in `apps/tool` or `apps/landing-page`.
3. **Supabase Context**: If running `supabase` commands, ensure you are in `<root>` (or wherever `supabase/config.toml` dictates, typically root).

## Behavior
- **NEVER** assume you are in the correct directory.
- **ALWAYS** explicitly check or confirm CWD if uncertain.
- **PREFER** using `npm run <script> -w <workspace>` from root over `cd <workspace> && npm run <script>` when possible, to maintain a stable CWD.

## Violation
Running a command in the wrong folder (e.g., installing a package in root that belongs in `apps/tool`) is a critical failure of this rule.
