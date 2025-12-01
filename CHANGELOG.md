# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- **Bucket Fill Tool**: Implemented flood-fill algorithm for filling contiguous areas.
- **Cursor Update**: Changed Fill tool cursor to `crosshair` for better precision.
- **Gauge & Yarn Settings**: Restored gauge configuration UI in Project Settings modal with unit selector, stitches/rows per unit, yarn per stitch, and hook size inputs.
- **Estimated Size Display**: Added real-time physical size calculation based on gauge settings.

### Fixed
- **Replace Tool**: Fixed regression where "Replace All" button was non-functional.
- **Replace Tool**: Fixed workflow to auto-advance from "From" to "To" selection.
- **Replace Tool**: Enabled canvas picking to set "From" and "To" colors.
- **Replace Tool**: Added visual indicator (red X) for transparent color in swatches and fixed "Replace All" for transparent values.
- **Select Tool**: Implemented advanced rotation logic with 4-step lossless cycle and drift prevention.
- **Select Tool**: Implemented "Paste" functionality with auto-centering and Undo/Redo integration.
- **Toolbar**: Refactored main toolbar with logical grouping (Drawing, Shapes, Palette, etc.).
- **UI**: Added contextual tool inputs (Brush Size, etc.) below tool selection and sticky Settings button.
- **Pattern Generation**: New "Generate Pattern" modal with canvas-based preview, responsive sizing, and full-screen zoom.
- **Export**: Consolidated export options into a single modal with PDF (Pattern Pack, Chart Only) and PNG Image support.

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
