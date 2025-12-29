# BlanketSmith
A pattern design and export tool for professional-grade printable PDF charts.

## What It Is
BlanketSmith is a specialized design tool for creating pixel-perfect crochet and knitting charts. It features a robust **Export Center** capable of generating both "Chart-Only" PDFs for quick reference and comprehensive "Pattern Pack" PDFs that include cover pages, yarn requirements, and multi-page atlases.

The system is built on a deterministic V3 Export Engine designed to eliminate ambiguity. It guarantees that charts explicitly follow user preferences for Color, Stitch, or Hybrid modes, and enforces strict pagination rules to ensure professional output every time.

## Key Features
*   **Explicit Export Modes**: Choose exactly between Color, Stitch, or Hybrid (Symbols + Background) charts.
*   **Pattern Pack Control**: Independent toggles for including Color, Stitch, and Hybrid charts in a single PDF.
*   **Tri-State Overview**: Control the Pattern Overview map with `Auto`, `Always`, or `Never` settings.
*   **Smart Pagination**: Shared atlas prediction ensures consistent row/column numbering across all chart types.
*   **Layout Safety**: "Fresh Page Policy" guarantees every chart section starts on a new page to prevent layout collisions.
*   **QA Harness**: Built-in visual regression harness for verifying export behavior.

## Repository Structure
*   `apps/tool/`: Main application (React/Vite) containing the Editor and Export Engine.
*   `docs/`: Canonical architectural documentation.
*   `docs/qa/`: Quality Assurance reports and test procedures.
*   (Internal) `apps/tool/src/pages/ExportEngineTestPage.tsx`: QA Harness.

## Getting Started
This repository is a monorepo using npm workspaces.

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Run the Tool (Editor)**:
    ```bash
    npm run dev:tool
    ```

3.  **Open App**:
    Visit `http://localhost:5173` (or the port shown in your terminal).

## Export Engine Rules (Beta)
To ensure reliability, the Export Engine V3 adheres to strict invariants:
*   **Fresh Pages**: Color, Stitch, and Hybrid charts always start on a new page.
*   **Explicit Hybrid**: Hybrid charts are never inferred; they must be explicitly enabled.
*   **Tri-State Overview**: The Overview map respects strict `auto`/`always`/`never` logic.
*   **Unified Atlas**: A single planner determines page breaks for all chart types.

## Documentation
For detailed information, please refer to the canonical documentation:
*   [Documentation Policy](docs/DOCS_POLICY.md)
*   [Contributing Guidelines](docs/CONTRIBUTING.md)
*   [Export Engine V3 QA Report](docs/qa/Export-engine-v3-qa-report.md)

## Contributing
Please read [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.
