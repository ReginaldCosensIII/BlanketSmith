# Export Engine V3 QA Report

**Version:** 3.0 (Beta)
**Status:** Active
**Supersedes:** V2 QA Report

## 1. Purpose
Export Engine V3 exists to eliminate ambiguity in the PDF generation process. While V2 relied on heavy inference (guessing "hybrid" mode from symbol settings, deducing atlas needs from side-effects), V3 enforces:
- **Explicit Modes:** Users select exactly what they want (Color vs. Stitch vs. Hybrid).
- **Canonical Execution Flow:** A single, ordered execution path for all exports.
- **Strict Isolation:** Chart-Only settings do not leak into Pattern Pack settings.

## 2. Core Architecture (V3)

### Single Canonical Flow
All exports now follow a strict rendering order. No more jumping between "Chart Mode" and "Pack Mode" logic blocks.
1. **Cover Page** (if enabled)
2. **Project Header**
3. **Materials / Yarn Requirements**
4. **Project Overview** (The "Map")
5. **Chart Sections** (Iterative: Color -> Stitch -> Hybrid)
6. **Stitch Legend**

### Shared Atlas prediction
A single `predictAtlasLayout()` helper determines pagination for *all* chart types before any drawing occurs. This ensures consistent row/column numbering across Color, Stitch, and Hybrid charts.

### Explicit Chart Modes
- **Chart-Only:** Explicitly selected as `Color`, `Stitch`, or `Hybrid` via `chartOnlyMode`.
- **Pattern Pack:** Explicitly toggled via `includeColorChart`, `includeStitchChart`, and `includeHybridChart`.

### Overview Tri-State
The "Pattern Overview" map is no longer just on/off. It supports three strict states via `overviewMode`:
- **Auto:** logic determines if needed (e.g., if chart spreads across multiple pages).
- **Always:** forces rendering (useful for small projects where a map is desired).
- **Never:** suppresses rendering (even for giant aliases).

## 3. Non-Negotiable Export Rules (Beta)

To guarantee professional output failure is impossible, the following rules are hard-coded:

1.  **Fresh Page Policy:** Every chart section (Color, Stitch, Hybrid) **ALWAYS** starts on a fresh page.
    *   *No more "trying to squeeze" charts onto the header page.*
2.  **Overview Placement:** 
    *   If Cover Page is present -> Overview is on Page 2 (Fresh).
    *   If No Cover -> Overview may share Page 1 with header *only if it fits cleanly*.
3.  **Hybrid Verification:** Hybrid charts are never inferred. They only appear if explicitly requested.
4.  **One Atlas, One Renderer:** There is only one piece of code that draws grid cells. It is reused for all modes.

## 4. QA Harness (V3)

The internal QA tool (`ExportEngineTestPage`) has been updated to V3 standards.

### Scenario Convention
Scenarios are identified by a strict ID schema: `v2_{mode}_{desc}_{overview}_{flags}`.
*   `mode`: `pp` (Pattern Pack) or `co` (Chart-Only).
*   `overview`: `ov_auto`, `ov_always`, or `ov_never`.

### Key Test Capabilities
- **Tri-State Validation:** Scenarios explicitly test `ov_never` on large charts and `ov_always` on small charts.
- **Hybrid Isolation:** Scenarios verify that enabling "Hybrid" does not accidentally enable "Color" or "Stitch" charts.
- **Fresh Page Checks:** "Expected Output" text strictly defines where page breaks must occur.

## 5. Manual QA Checklist

When verifying a release candidate:

- [ ] **Chart-Only Modes**
    - [ ] Color Mode -> Only Color Chart.
    - [ ] Stitch Mode -> Only B&W Symbols.
    - [ ] Hybrid Mode -> Color Bg + Symbols.
- [ ] **Pattern Pack Combinations**
    - [ ] Toggle all 3 ON -> Verify 3 separate sections, each starting on a new page.
    - [ ] Toggle all OFF -> Verify empty PDF (or graceful fallback).
- [ ] **Overview Logic**
    - [ ] `Auto`: Small chart = No Map; Large chart = Map present.
    - [ ] `Always`: Small chart = Map present.
    - [ ] `Never`: Large chart = No Map.
- [ ] **Atlas Overlays**
    - [ ] Verify red overlay rectangles match the number of chart pages generated.
    - [ ] Verify labels read "Page X" and match the PDF page numbers.

## 6. Explicit Out-Of-Scope Items

The following features are **NOT** implemented in V3 and should not be reported as bugs:
- **Instructions Rendering:** The `instructionsMode` is a placeholder. No text instructions are generated.
- **Smart Auto-Selection:** The engine does not auto-select "Stitch Mode" if you pick a stitch palette. It defaults to Color.
- **Layout Optimizations:** We do not attempt to "pack" small charts onto the Header page to save paper. We prioritize layout safety (fresh pages).
