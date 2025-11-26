# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- **Bucket Fill Tool**: Implemented flood-fill algorithm for filling contiguous areas.
- **Cursor Update**: Changed Fill tool cursor to `crosshair` for better precision.

## [v0.1.0-stable-baseline] - 2025-11-25

### Added
- **Monorepo Structure**: Established `apps/tool` (Vite) and `apps/web` (Next.js) workspaces.
- **Editor Core**: Decomposed `PixelGridEditor` into `GridRenderer` (SVG), `Rulers`, and `EditorOverlay`.
- **Select Tool**: Implemented Select All, Copy, Cut, Paste, Flip, and Rotate.
- **Context Menu**: Custom event-driven context menu for the editor.
- **State Management**: `ProjectContext` for global state persistence.

### Changed
- **Rendering**: Switched from DOM-based to SVG-based grid rendering for performance.
- **Event Handling**: Unified mouse and touch events in the editor.
