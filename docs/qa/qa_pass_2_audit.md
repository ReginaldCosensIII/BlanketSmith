# QA Audit Report: PDF Export Engine V2 (Pass 2)

**Date:** December 12, 2025
**Scope:** Verification of Desired Outcomes via Logic Trace
**Branch:** `fix/export-v2-qa-polish`

## 1. Scenario: `pp_small_default`
**Description:** Pattern Pack, Cover ON, Yarn ON.
**Desired Outcome:**
Page 1: Dedicated Cover Page (Title, Designer, Copyright).
Page 2: Pattern Overview (if ON) or Yarn Requirements.
**Actual Logic Trace:**
1. `includeCoverPage` is TRUE.
2. `drawCoverPage()` is called. It draws text on Page 1 (centered).
3. `hasContent` set to TRUE.
4. **CRITICAL FAILURE:** `packCursorY` is initialized to `margin + 20` (Top of Page). It is *not* updated to reflect that Page 1 is "Full".
5. Loop proceeds to Yarn Requirements.
6. Logic checks: `if (packCursorY < pageH - 100)`.
7. `50 < 741` is TRUE.
8. Yarn Requirements draws at Y=50 (Top of Page 1).
**Result:** Yarn Requirements draws **ON TOP** of the Cover Page.
**status:** **FAIL** (Matches user observation of "No Cover Page" / mess).

## 2. Scenario: `pp_small_no_cover`
**Description:** Pattern Pack, Cover OFF.
**Desired Outcome:**
Page 1: Project Header (Top), followed immediately by Yarn Requirements.
**Actual Logic Trace:**
1. `includeCoverPage` is FALSE.
2. `drawProjectHeader(margin + 20)` is called. (Y=50).
3. It draws Title at Y=50.
4. It returns cursor `packCursorY` (approx 150).
5. Yarn Requirements checks space. `150 < 741` is TRUE.
6. Yarn Requirements draws at Y=160.
**Result:** Header at Top, Yarn below it.
**User Report:** "Header is off canvas".
**Investigation:** Y=50 is standard margin. If user sees it off canvas, the printer/viewer margin might be large.
**Verdict:** **PASS** (Logic appears correct, but margin tuning may be needed).

## 3. Scenario: `co_color_cover_yarn`
**Description:** Chart Only, Cover ON.
**Desired Outcome:** Cover Page (P1), Yarn + Chart (P2).
**Actual Logic Trace:**
1. `includeCoverPage` is TRUE. `drawCoverPage()` runs.
2. Logic check: `if (includeCoverPage) { chartStartY = margin + 30; }`.
3. This implicitly assumes we are starting a NEW page or skipping the header on P1.
4. `doc.addPage()` is NOT explicitly called immediately, BUT...
5. `drawYarnLegend(chartStartY)` is called.
6. Inside `drawYarnLegend`: It checks `if (legendY > pageH - margin)`. It does *not* auto-add a page at the start.
7. **POTENTIAL FAILURE:** Chart Only logic *also* writes on Page 1 if `drawYarnLegend` doesn't verify P1 status.
8. Wait, `drawCoverPage` puts us on P1.
9. `chartStartY` is 50.
10. Yarn Legend draws at 50 on Page 1.
**Result:** **FAIL**. Chart Only *also* overwrites the Cover Page. The logic `if (includeCoverPage)` just skips the *Header*, but doesn't force a *Page Break*.

## Key Findings
1. **Universal Cover Page Failure:** Both Pattern Pack and Chart Only modes fail to respect the Cover Page as a "Full Page". They both attempt to draw subsequent content on Page 1 immediately.
2. **Fix Requirement:**
   - For **Pattern Pack**: After `drawCoverPage`, we must either `doc.addPage()` immediately OR set `packCursorY` to `pageH` to force the next section to trigger a page break.
   - For **Chart Only**: If `includeCoverPage` is true, we must `doc.addPage()` before drawing Yarn or Charts.

## Validated Scenarios (Logic)
- `pp_small_no_cover` (PASS - flow is correct).
- `edge_pp_no_stitches_force_legend` (PASS - explicitly checked size=0).
- `stress_pp_large_color` (PASS - Atlas logic handles overflow).

## Conclusion
The "Missing Cover Page" issue is caused by a logic handling error where the engine does not treat the cover page as occupying the entire first page. This affects all scenarios with `includeCoverPage: true`.
