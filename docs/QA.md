# QA

## Purpose
This document describes the quality assurance procedures for the BlanketSmith export system, including how to run the QA harness and verify export behavior.

## How to Run QA Harness
The QA Harness is a development-only tool located at `apps/tool/src/pages/ExportEngineTestPage.tsx`. It provides a visual interface for running standardized export scenarios and verifying PDF output.

To access the harness:
1. Run the development server: `npm run dev:tool`
2. Navigate to the QA Harness page in the application (dev-only route)
3. Use the "Run All Scenarios" button or run individual scenarios

Each scenario generates a PDF preview that can be inspected for correctness.

## Scenario Conventions
QA scenarios follow a strict naming convention: `v2_{mode}_{desc}_{overview}_{flags}`

**Components:**
- `mode`: `pp` (Pattern Pack) or `co` (Chart-Only)
- `overview`: `ov_auto`, `ov_always`, or `ov_never`
- `flags`: Descriptive tags like `cover`, `yarn`, `hybrid`, `large`

**Expected Output Rules:**
- No ambiguous language (e.g., "might be P1 or P2")
- Explicit statements about overview presence/absence
- Clear fresh-page expectations
- Specific atlas behavior descriptions

## Regression Checklist
Before merging export changes, verify:

### Chart-Only Modes
- [ ] **Color Mode**: Only Color chart appears
- [ ] **Stitch Mode**: Only Stitch chart (B&W symbols) appears
- [ ] **Hybrid Mode**: Color backgrounds + symbols appear

### Pattern Pack Toggles
- [ ] **All Charts Enabled**: Color, Stitch, and Hybrid all appear in separate sections
- [ ] **Hybrid Only**: Only Hybrid chart appears (Color and Stitch suppressed)
- [ ] **Independent Toggles**: Each chart type can be enabled/disabled independently

### Overview Tri-State
- [ ] **Auto (Small Chart)**: No overview for single-page charts
- [ ] **Auto (Large Chart)**: Overview appears for multi-page atlases
- [ ] **Always**: Overview appears even for small charts
- [ ] **Never**: Overview suppressed even for large charts

### Fresh-Page Charts
- [ ] All chart sections start on a new page
- [ ] No charts "squeezed" onto header pages

## QA Artifacts
For detailed export rules and manual QA procedures, see:
- [Export Engine V3 QA Report](qa/Export-engine-v3-qa-report.md)
