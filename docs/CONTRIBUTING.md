# Contributing to BlanketSmith

## 1. Branching Conventions
*   **Feature Branches**: `feat/` prefix (e.g., `feat/export-center-v3`). Use for new features or major refactors.
*   **Documentation Branches**: `docs/` or `chore/` prefix (e.g., `docs/update-qa-report`). Use for documentation-only changes.
*   **Bug Fixes**: `fix/` prefix (e.g., `fix/atlas-pagination`).

## 2. Commit Discipline
*   **Atomic Commits**: Each commit should represent one conceptual change.
*   **Descriptive Messages**: Use imperative mood (e.g., "Add hybrid chart support" not "Added support").
*   **Scope**: Avoid mixing refactors, style changes, and feature logic in a single commit.

## 3. QA Expectations
*   **Mandatory QA**: All changes affecting export logic must be verified using the [QA Harness](../apps/tool/src/pages/ExportEngineTestPage.tsx).
*   **Update Harness**: If you add a new feature, you must add a corresponding scenario to the harness.
*   **Manual Checklist**: Refer to the [V3 QA Manual Checklist](qa/Export-engine-v3-qa-report.md#5-manual-qa-checklist) before requesting review.

## 4. Export Center / Engine Guardrails (V3)
The following architectural invariants must **NEVER** be violated:
*   **Fresh Page Policy**: Color, Stitch, and Hybrid charts must *always* start on a new page `doc.addPage()`. No exceptions for "saving paper".
*   **Explicit Hybrid**: Hybrid diagrams must only be generated if `includeHybridChart` is explicitly true. Do not infer from symbol settings.
*   **Tri-State Overview**: Respect `overviewMode` (`auto` | `always` | `never`) strictly.
*   **Single Atlas Plan**: Do not recalculate pagination during the render loop. Use `predictAtlasLayout`.

## 5. Documentation Expectations
*   **Policy**: Review [Docs Policy](DOCS_POLICY.md) before contributing.
*   **Changelog**: Update `CHANGELOG.md` with every user-facing change.
*   **QA Report**: Keep the QA report in sync with the current engine version.
