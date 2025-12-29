# Architecture

## Purpose
This document provides a high-level overview of the BlanketSmith system architecture, focusing on core components, data flow, and design principles.

## System Overview
BlanketSmith is a pattern design and export tool for creating professional-grade printable PDF charts. The system consists of an interactive editor for pattern authoring and a deterministic export engine that generates PDF outputs with strict layout guarantees.

## Core Components

### Editor
The pattern editor provides a pixel grid authoring interface where users create crochet and knitting patterns. It manages the project state, including grid data, color palettes, stitch definitions, and project metadata.

### Export Center UI
The Export Center is the user-facing interface for configuring PDF exports. It provides two primary export modes:
- **Chart-Only**: Single-purpose exports optimized for quick reference.
- **Pattern Pack**: Comprehensive multi-section PDFs including cover pages, materials, charts, and legends.

The UI enforces explicit user choices for chart types (Color, Stitch, Hybrid) and overview behavior (Auto, Always, Never).

### Export Engine
The Export Engine (`exportService.ts`) is the core PDF generation system. It implements a single canonical execution flow that processes export options and generates deterministic PDF output. The engine guarantees consistent pagination, chart ordering, and layout behavior.

### QA Harness
The QA Harness (`ExportEngineTestPage.tsx`) is a development-only tool for visual regression testing. It provides a suite of standardized scenarios that verify export behavior across different configurations and edge cases.

## Data Flow
1. **Pattern Creation**: User creates/edits pattern in the Editor.
2. **Export Configuration**: User selects export options in the Export Center UI.
3. **Export Execution**: Export Engine processes grid data + options → generates PDF.
4. **Output**: PDF is previewed in browser or downloaded.

## Key Design Principles

### Determinism
The export system produces identical output for identical inputs. No randomness, no inference, no side-effects.

### DRY (Don't Repeat Yourself)
Shared logic is centralized. The atlas planning algorithm is used by all chart types. The overview renderer is called once per export.

### Explicit Modes
User intent is captured explicitly through UI controls. The system never infers chart types from visual settings or guesses overview behavior from grid size.

### Beta Rules
The system enforces strict layout guarantees to ensure professional output:
- Charts always start on fresh pages.
- Overview placement follows explicit rules.
- Atlas pagination is calculated once and reused.

## Extension Points (Non-Implemented)

### Instructions Engine Integration
Reserved slot in the export options for future text-based instructions rendering. Currently a placeholder; no rendering logic exists.

### Defaults System
Future UX enhancement to auto-select sensible export options based on project characteristics. Not implemented in V3.

### Materials & Stitch Key Improvements
Planned enhancements to yarn requirements and stitch legend rendering. Current implementation is functional but minimal.
