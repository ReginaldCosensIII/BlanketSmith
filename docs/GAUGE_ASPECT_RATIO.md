# Specification: True Proportion (Gauge Aspect Ratio)

## 1. Overview
In fiber arts, stitches are rarely perfectly square. A single crochet stitch might be 1:1, but a double crochet is often 1:2 (taller than it is wide), and knit stockinette is typically 4:5 (wider than it is tall). 

BlanketSmith must bridge the gap between digital pixels (perfect squares) and physical yarn (rectangles). This feature allows the system to calculate an "Aspect Ratio" based on the user's physical gauge swatch and warp the digital representation to match physical reality.

## 2. The Mathematical Model
The system does not require users to understand aspect ratios. Instead, users input physical measurements from a sample swatch.

**Variables:**
- `S`: Number of Stitches measured.
- `R`: Number of Rows measured.
- `U`: The physical unit length (e.g., 4 inches, 10 cm).

**Formula:**
`Aspect Ratio (Y-Axis Multiplier) = S / R`

*Example:* A knitter enters a gauge of 20 stitches and 15 rows over 4 inches. 
Aspect Ratio = 20 / 15 = 1.333.
The digital cell's height is multiplied by 1.333, accurately representing that the stitches are wider than they are tall.

## 3. Data Schema (`project.settings`)
The project state must be expanded to handle flexible gauge inputs and explicit user toggles.

```typescript
gauge: {
  stitches: number;       // e.g., 20
  rows: number;           // e.g., 15
  measurementUnit: string;// e.g., "inches", "cm"
  unitValue: number;      // e.g., 4 (for a 4x4 swatch)
},
visuals: {
  applyGaugeToEditor: boolean; // Toggle: Warp the on-screen grid
  applyGaugeToPDF: boolean;    // Toggle: Warp the printed PDF chart
}

## 4. Implementation Roadmap

### Phase 1: Editor Visuals (Active)
- Update settings UI to include the true proportion toggles.
- Update `GridRenderer` to scale cell height by the aspect ratio.
- Update `PixelGridEditor` and `EditorOverlay` coordinate mapping (CTM) to ensure mouse clicks accurately map to the stretched Y-axis logical rows.

### Phase 2: PDF Export Engine
- Update the Atlas Planner in `exportService.ts`.
- Dynamically recalculate pagination (`rowsPerPage`) based on the stretched cell height to ensure page breaks do not slice horizontally through cells.
- Ensure text symbols remain vertically centered inside rectangular cells.

### Phase 3: Infrastructure Gating
- Restrict advanced gauge calculations and proportional PDF printing to authenticated users as a premium/Beta feature.

### Phase 4: AR Swatch Measurement (Future Innovation)
- Develop a mobile-friendly flow where a user photographs a physical swatch alongside a known reference object (e.g., a US Quarter, $0.25).
- Utilize computer vision to count the stitches/rows and automatically populate the `gauge` data schema.