---
description: Command Registry (Logic Consolidator)
---

# Command Registry (Logic Consolidator)

## Goal
Enforce a "Don't Repeat Yourself" (DRY) principle for all UI actions and keyboard shortcuts.

## Context
The application has multiple ways to trigger the same action (e.g., clicking a "Undo" button vs. pressing `Ctrl+Z`). These MUST share the exact same underlying logic.

## Directive
1. **Source of Truth**: All actions must be defined in `apps/tool/src/config/shortcutConfig.ts` (or equivalent registry).
2. **Shared Handlers**: You are **FORBIDDEN** from writing separate event handlers for a button and a key that perform the same action.
    - **Incorrect**:
        ```typescript
        // Button
        onClick={() => { performUndo(); }}
        // Hotkey
        useHotkeys('ctrl+z', () => { performUndo(); })
        ```
        *(This is bad if `performUndo` is re-implemented or duplicated)*.
    - **Correct**:
        Both must call a shared service, hook, or centralized `executeAction('UNDO')` function.
3. **Registry Mapping**: Every UI interaction that has a corresponding hotkey must map to a `ShortcutAction`.

## Enforcement
- If you are adding a button, ask: "Does this do what a hotkey does?"
- If yes, verify you are calling the EXACT same function reference or hook method.
- **Reject** pull requests or implementation plans that duplicate logic blocks.
