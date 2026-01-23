# Export Engine

## Purpose
This document defines the canonical export behavior for the BlanketSmith PDF generation system. It describes export types, options, and the non-negotiable rules that govern PDF output.

## Export Types

### Chart-Only
Chart-Only exports are single-purpose PDFs optimized for quick reference. They contain only the requested chart type (Color, Stitch, or Hybrid) with optional materials and cover pages.

### Pattern Pack
Pattern Pack exports are comprehensive multi-section PDFs that include cover pages, project headers, yarn requirements, multiple chart types, and stitch legends. Users have independent control over which chart types to include.

## Export Options (Conceptual)

### Chart-Only Modes
Chart-Only exports require explicit selection of one chart type:
- **Color**: Displays cell background colors only.
- **Stitch**: Displays stitch symbols in black and white.
- **Hybrid**: Displays both cell background colors and stitch symbols simultaneously.

### Pattern Pack Toggles
Pattern Pack exports provide independent toggles for chart inclusion:
- **Include Color Chart**: Adds a Color chart section.
- **Include Stitch Chart**: Adds a Stitch chart section.
- **Include Hybrid Chart**: Adds a Hybrid chart section.

Any combination of these toggles is valid, including all three enabled or all three disabled.

### Overview Tri-State
The Pattern Overview (atlas map) supports three explicit modes:
- **Auto**: Overview appears only when a chart spans multiple pages.
- **Always**: Overview appears even for single-page charts.
- **Never**: Overview is suppressed even for multi-page charts.

### Atlas Mode (Pagination Strategy)
The system supports two atlas modes for controlling pagination:
- **Auto**: The engine calculates the optimal cell size and page count based on `MIN_READABLE_CELL_SIZE`.
- **Fixed**: The engine attempts to fit the chart into exactly `N` pages (e.g. "Force 2 Pages") using a "Best Fit Topology" search.
  - **Constraint**: If the requested page count results in a cell size smaller than `MIN_READABLE_CELL_SIZE` (8pt), the engine automatically falls back to Auto mode to preserve readability.

## Non-Negotiable Beta Rules

### Fresh-Page Chart Rule
Every chart section (Color, Stitch, Hybrid) always starts on a fresh page. This rule prevents layout collisions and ensures predictable pagination.

### Hybrid Explicit
Hybrid charts are never inferred from visual settings or symbol modes. They only appear when explicitly requested via the `includeHybridChart` option.

### Overview Placement Rules
- **With Cover Page**: Overview appears on a fresh page after the cover.
- **Without Cover Page**: Overview may share the first page with the project header only if it fits cleanly.

### Single Atlas Planning Path
Atlas pagination is calculated once using a shared `predictAtlasLayout` function. This ensures consistent row/column numbering across all chart types.

### Single Overview Renderer
The overview page is rendered by a single `drawOverviewPage` function. There are no alternate code paths or duplicate implementations.

## Canonical Section Order
PDF sections are rendered in strict order:
1. **Cover Page** (if enabled)
2. **Project Header**
3. **Pattern Overview** (if conditions met)
4. **Materials & Stitch Key**
    - **Canonical Name**: Formerly "Yarn Requirements", this section is now unified.
    - **Stitch Key**: Automatically included in this section whenever Stitch or Hybrid charts are present.
    - **Symbol Column**: A numeric "Sym" column appears in the materials table **ONLY** when a Color chart is included. It is suppressed for Stitch-only and Hybrid-only exports.
5. **Instructions** (if enabled)
    - **Placement**: Starts immediately after Materials if space permits (>140pt), otherwise forces a page break.
    - **Pagination**: May span multiple pages.
    - **Chart Isolation**: The end of the instructions section ALWAYS forces a page break before charts begin.
6. **Chart Sections** (Color → Stitch → Hybrid, as enabled)
7. **Stitch Legend** (if stitches are used and legend is enabled)

## Atlas + Overview Semantics

### Atlas
An "atlas" is a multi-page chart where the full pattern is divided into regions. Each region is rendered on a separate page with consistent row/column numbering.

### Overview
The overview page displays a miniature version of the full pattern with red overlay rectangles indicating atlas regions. Each rectangle is labeled "Part 1", "Part 2", etc., corresponding to the page numbers where those regions appear.

**Sizing Policy:**
- Overview uses target-fill sizing: 80% of available page height
- Maximum height: 550pt (raised from original 400pt)
- Horizontal margins: 20pt (reduced from standard 30pt for better width utilization)
- Title space: 30pt (reduced from 40pt)
- Safety buffer: 20pt bottom margin to prevent overlap

**Single-Page Behavior:**
When a pattern fits on a single page (no atlas regions), the overview renders a red border around the entire miniature grid instead of individual region overlays. This maintains visual consistency and improves legibility.

## Out of Scope



### Defaults Automation
The system does not auto-select export options based on project characteristics. All choices must be made explicitly by the user.

### Layout Optimizations Beyond Beta Rules
The engine does not attempt to "pack" small charts onto header pages to save paper. It prioritizes layout safety and predictability over space optimization.

## References
For detailed QA procedures and testing guidelines, see [Export Engine V3 QA Report](qa/Export-engine-v3-qa-report.md).
