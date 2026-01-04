# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Pre-launch: Blocked search engine indexing via robots.txt and global noindex.

### Added
- **PDF Export System**: Complete overhaul of the PDF export functionality.
- **Instructions System**: Added first-class support for generic pattern instructions.
    - **Visual Editor**: Block-based editor for creating custom pattern notes and instructions.
    - **Auto-Generator (v1)**: Deterministic generation of Materials and Stitch Keys from project data.
    - **PDF Integration**: Instructions render seamlessly in Pattern Packs with smart pagination logic.
- **Export Center**: New modal for managing exports with "Pattern Pack" and "Chart Only" presets.
- **Pattern Pack**: Multi-page PDF generation including cover page, yarn requirements, color charts, stitch charts, and stitch legend.
- **Chart Only**: Single-page optimized export for quick printing.
- **Advanced Settings**: Reorganized into logical groups (Stitch & Symbol, Layout, Branding) for improved usability.
- **Hybrid Chart Mode**: New export mode rendering both cell background colors and stitch symbols simultaneously.
- **Stitch Charts**: Dedicated rendering mode for stitch symbols with high-contrast visibility.
- **Yarn Requirements**: Detailed yarn usage table with estimated yardage and skein counts.
- **Preview Mode**: Ability to preview generated PDFs in the browser before downloading.
- **Bucket Fill Tool**: Implemented flood-fill algorithm for filling contiguous areas.
- **Cursor Update**: Changed Fill tool cursor to `crosshair` for better precision.
- **Gauge & Yarn Settings**: Restored gauge configuration UI in Project Settings modal with unit selector, stitches/rows per unit, yarn per stitch, and hook size inputs.
- **Estimated Size Display**: Added real-time physical size calculation based on gauge settings.
- **Compact Layout**: Auto-optimization of Pattern Pack layout to fit Yarn Requirements and Charts on the first page when no cover page is selected.
- **Dev Tools**: Added `ExportEngineTestPage` QA harness (dev-only) for rapid verification of PDF export scenarios.
- **Stitch System (Phase 1)**: Implemented core stitch system including:
    - **Data Model**: Added `stitchId` to cell data and created `StitchDefinition` library.
    - **Stitch Palette**: New UI for managing primary/secondary stitches.
    - **Combo Paint Mode**: New mode to apply both color and stitch simultaneously.
- **Replace Tool**: Enabled canvas picking to set "From" and "To" colors.
- **Replace Tool**: Added visual indicator (red X) for transparent color in swatches and fixed "Replace All" for transparent values.
- **Select Tool**: Implemented advanced rotation logic with 4-step lossless cycle and drift prevention.
- **Select Tool**: Implemented "Paste" functionality with auto-centering and Undo/Redo integration.
- **Toolbar**: Refactored main toolbar with logical grouping (Drawing, Shapes, Palette, etc.).
- **UI**: Added contextual tool inputs (Brush Size, etc.) below tool selection and sticky Settings button.
- **Pattern Generation**: New "Generate Pattern" modal with canvas-based preview, responsive sizing, and full-screen zoom.
- **Export**: Consolidated export options into a single modal with PDF (Pattern Pack, Chart Only) and Image support.

### Changed
- **Export Engine V2 QA Polish**:
    - **Beta Stability**: Forced fresh page breaks for charts to prevent layout collisions.
    - **Pattern Overview**: Restored "Overview Page" with miniature map and red "Page X" atlas overlays for both Chart-Only and Pattern Pack modes.
    - **UX Polish**: Simplified overview overlay labels to large bold numbers; removed blank page glitch in Pattern Pack exports.
    - **Legibility**: Enforced minimum cell sizes (12pt) for single-page fits, falling back to atlas otherwise.
- **Export Engine V3 Refactor**:
    - **Architecture**: Unified backend into a single canonical execution flow with shared atlas prediction.
    - **Explicit Modes**: Introduced explicit settings for Color, Stitch, and Hybrid charts (no more inference).
    - **Tri-State Overview**: Added Auto/Always/Never control for pattern overviews.
    - **QA Harness**: Fully standardized test harness with V2 convention scenarios and explicit hybrid verification.
    - **Documentation**: Updated QA procedures in `docs/qa/Export-engine-v3-qa-report.md`.
- **Pattern Overview Polish**:
    - **Target-Fill Sizing**: Overview now uses 80% of available page height with raised max bound (550pt) for better space utilization.
    - **Width Optimization**: Reduced horizontal margins (20pt vs 30pt) and title space (30pt vs 40pt) for improved width usage on tall patterns.
    - **Single-Page Border**: Single-page overviews now render a red border when no atlas overlays are present, improving visual consistency.
    - **V3 Guarantees Preserved**: No changes to core export rules (charts always start fresh page, tri-state overview unchanged).
- **Materials & Stitch Key Unification**:
    - **UI Alignment**: Renamed all "Yarn Requirements" UI labels to "Materials & Stitch Key" to match canonical section naming.
    - **Deterministic Stitch Key**: Removed obsolete manual Stitch Key toggle from Export Center; stitch definitions are now automatically included within the Materials section whenever Stitch or Hybrid charts are present.
    - **Symbol Column Gating**: Restored "Sym" column in the Materials table, but strictly gated to appear ONLY when a Color Chart is included. Hybrid-only exports do not trigger this column.
- **Smart Defaults V3 & UI Polish**:
    - **Canonical Defaults**: Established `exportDefaultsV3.ts` as the single source of truth for all export options, ensuring consistency between the UI and QA harness.
    - **UI Policies**: Implemented "Restore Defaults" with intelligent logic (Chart-Only preserves mode; Pattern Pack resets to full capabilities).
    - **Guardrails**: Added "Blank Chart Guard" to disable export when no visual elements are selected, and "Stitch Lock" to enforce standard stitch visuals.
    - **State Persistence**: Chart-Only visual settings are now preserved when temporarily switching to Stitch mode.
    - **QA Alignment**: Refactored `ExportEngineTestPage` to consume canonical defaults, removing legacy overrides.
    - **Policy Documentation**: Added `docs/EXPORT_CENTER_DEFAULTS.md` defining all V3 policies.

## [v0.1.0-stable-baseline] - 2025-11-25

### Added
- **Monorepo Structure**: Established `apps/tool` (Vite) and `apps/web` (Next.js) workspaces.
- **Infrastructure**: Separate Vercel projects for editor and marketing site.
- **Config**: Shared `@blanketsmith/config` package with no-op build script.
- **Editor Core**: Decomposed `PixelGridEditor` into `GridRenderer` (SVG), `Rulers`, and `EditorOverlay`.
- **Select Tool**: Implemented Select All, Copy, Cut, Paste, Flip, and Rotate.
- **Context Menu**: Custom event-driven context menu for the editor.
- **State Management**: `ProjectContext` for global state persistence.

### Changed
- **Build System**: Root build script now builds both app workspaces explicitly.
- **Workflow**: Standardized dev workflow: `npm run dev:tool` and `npm run dev:web`.
- **Rendering**: Switched from DOM-based to SVG-based grid rendering for performance.
- **Event Handling**: Unified mouse and touch events in the editor.

### Notes
- This version serves as the official baseline for BlanketSmith Beta development.
