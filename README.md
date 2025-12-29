# BlanketSmith

BlanketSmith is a **professional-grade pattern design and PDF export system** focused on producing **deterministic, predictable, and verifiable chart exports** for complex crochet and knitting patterns.

The project prioritizes **explicit user intent**, **strict layout guarantees**, and a **formal QA process** over ad-hoc layout heuristics. It is designed for large patterns that may span many pages and must remain readable, consistent, and printable.

---

## Project Status

* Active development
* Export Engine **v3** complete and QA-verified
* Core documentation foundation established
* Instructions engine, defaults automation, and materials/stitch key redesign planned

---

## What BlanketSmith Does

BlanketSmith provides an interactive **pattern editor** and a robust **Export Center** that generates printable PDF charts.

Users can:

* Design patterns on a pixel grid
* Define colors and stitch symbols
* Export charts as PDFs using explicit, predictable rules

The system supports both **quick reference exports** and **full pattern packs** suitable for distribution.

---

## Core Concepts

### Deterministic Export Engine (v3)

The Export Engine is the heart of BlanketSmith. Version 3 establishes a strict, documented contract for PDF generation:

* Explicit chart modes (Color / Stitch / Hybrid)
* No inferred behavior or hidden heuristics
* Charts always start on a **fresh page**
* Single shared atlas planning path
* Single overview rendering path
* Fully documented QA expectations

Given identical inputs, the engine always produces identical output.

---

## Export Types

### Chart-Only

Single-purpose PDFs optimized for quick reference.

* Exactly one chart type per export
* Explicit mode selection:

  * Color
  * Stitch
  * Hybrid
* Optional cover, overview, and materials sections

### Pattern Pack

Comprehensive multi-section PDFs intended for full pattern distribution.

* Independent toggles for:

  * Color Chart
  * Stitch Chart
  * Hybrid Chart
* Optional cover page
* Materials section
* Stitch legend

Any combination of chart types is valid.

---

## Pattern Overview (Atlas Map)

For large patterns that span multiple pages, BlanketSmith can generate a **Pattern Overview**:

* A miniature full-pattern map
* Red overlay boxes indicating chart page regions
* Regions labeled "Part 1", "Part 2", etc.

Overview behavior is controlled by a **tri-state option**:

* **Auto** — shown only for multi-page charts
* **Always** — always shown
* **Never** — suppressed entirely

Placement rules are deterministic and documented.

---

## Fresh Page Policy

One of the core guarantees of Export Engine v3:

> **Every chart always starts on a fresh page.**

This rule applies to:

* Chart-Only exports
* Pattern Pack exports
* Color, Stitch, and Hybrid charts

The engine does not attempt to squeeze charts onto header or materials pages.

---

## Repository Structure

```
apps/
  tool/                       # BlanketSmith application
    src/
      pages/
        PixelGraphPage.tsx       # Export Center UI
        ExportEngineTestPage.tsx # QA harness
      services/
        exportService.ts         # Export Engine (v3)

docs/
  ARCHITECTURE.md             # System architecture overview
  EXPORT_ENGINE.md            # Canonical export rules (v3)
  QA.md                       # QA harness usage & regression checklist
  DOCS_POLICY.md              # Documentation standards
  CONTRIBUTING.md             # Workflow & contribution rules
  qa/
    Export-engine-v3-qa-report.md
```

---

## Getting Started

BlanketSmith uses npm workspaces.

```bash
npm install
npm run dev:tool
```

The application will be available locally for development and QA testing.

---

## Quality Assurance

BlanketSmith includes a dedicated **QA Harness** used for visual regression testing of exports.

* Located in `ExportEngineTestPage.tsx`
* Provides standardized scenarios
* Each scenario defines explicit expected output

Before export-related changes are merged, QA scenarios must be reviewed.

See:

* `docs/QA.md`
* `docs/qa/Export-engine-v3-qa-report.md`

---

## Documentation System

Documentation is treated as part of the system contract.

Rules:

* All major behavioral changes must be documented
* Export behavior is considered API-like and versioned
* QA artifacts are preserved

Start here:

* `docs/DOCS_POLICY.md`
* `docs/ARCHITECTURE.md`
* `docs/EXPORT_ENGINE.md`

---

## Contributing

Contributions must follow:

* Explicit commits
* One conceptual change per commit
* Manual QA verification
* Documentation updates where required

See:

* `docs/CONTRIBUTING.md`

---

## License

License information will be added in a future documentation phase.
