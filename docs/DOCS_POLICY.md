# Documentation Policy

## 1. Purpose
The purpose of documentation in this repository is to act as a source of truth for architectural decisions, QA procedures, and release history. Documentation is not an afterthought; it is a deliverable equal in importance to code.

## 2. Structure
*   **`README.md`**: High-level project entry point. Setup, build commands, and quick start.
*   **`docs/`**: Feature-specific architectural documentation and guides.
*   **`docs/qa/`**: QA reports, testing procedures, and specialized test harness documentation.
*   **`CHANGELOG.md`**: User-facing version history.

## 3. Update Rules
Documentation must be updated **immediately** when:
*   **Export Engine Logic Changes**: Update `docs/qa/Export-engine-v3-qa-report.md`.
*   **New Feature Implementation**: Create or update relevant file in `docs/`.
*   **Bug Fixes influencing behavior**: Update `CHANGELOG.md`.

**Pull Requests are considered incomplete without corresponding documentation updates.**

## 4. Writing Guidelines
*   **Avoid Duplication**: Do not repeat the same procedure in multiple files. Link to the canonical source.
*   **Behavioral Guarantees**: Focus on what the system *guarantees* (e.g., "Charts always start on a fresh page") rather than implementation details.
*   **Keep It Current**: If a document contradicts the code, the document is a bug. Remove or update stale documentation.
*   **Tone**: Professional, technical, and concise. No conversational filler or marketing fluff.

## 5. Versioning Guidance
*   **Versioning**: Reference major systems by version (e.g., "Export Engine V3") to disambiguate from legacy behaviors.
*   **QA Artifacts**: When a major refactor occurs, rename the QA report (e.g., `v2` -> `v3`) to preserve history while establishing a new baseline.

## 6. Doc Review Checklist
Before merging changes, verify:
*   [ ] Does `CHANGELOG.md` capture the changes?
*   [ ] If Export Engine changed, is the [QA Report](qa/Export-engine-v3-qa-report.md) accurate?
*   [ ] Are new files placed correctly in `docs/`?
*   [ ] Is the tone consistent and professional?
*   [ ] Are there any dead links or references to deleted files?
