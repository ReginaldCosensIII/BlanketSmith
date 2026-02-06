---
description: Logic Consistency (DRY Architecture)
---

# Logic Consistency & Single Source of Truth

## Goal
Prevent architectural divergence where multiple implementations of the same business logic exist (e.g., two different "numbering systems" in the Export Engine).

## Context
Code duplication in business logic leads to "forgotten" updates and maintenance headaches. We strictly prefer **reusing** or **refactoring** existing services over creating parallel locally-scoped logic.

## Directives

### 1. Verification Before Creation
Before implementing any algorithmic logic (e.g., Pagination, Grid Transposition, Color Quantization, Numbering):
1.  **Search**: Use `grep_search` to find if this concept exists.
2.  **Evaluate**: specifically look in `apps/tool/src/services` or `packages/`.
3.  **Check**: Does an existing function do 80% of what you need?

### 2. The "Stop & Discuss" Trigger
If you find existing logic that *almost* fits but requires modification, or if you feel the existing logic is insufficient:
- **YOU MUST STOP**.
- **PROPOSE**:
    - "I found `existingFunction` in `ExportService`. It handles X but not Y."
    - "Option A: Refactor `existingFunction` to support Y (Recommended)."
    - "Option B: Create separate `newFunction` (Requires Strong Justification)."
- **WAIT** for user decision.

### 3. Forbidden Patterns
- **Do NOT** copy-paste a function to "tweak it slightly".
- **Do NOT** create a "v2" helper without a plan to deprecate "v1".
- **Do NOT** assume "it's just a small helper" if it handles core domain logic.
