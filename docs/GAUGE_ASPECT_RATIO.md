# Specification: True Proportion (Gauge Aspect Ratio)

## 1. Overview
In fiber arts, stitches are rarely perfectly square. A single crochet stitch might be 1:1, but a double crochet is often 1:2 (taller than it is wide), and knit stockinette is typically 4:5 (wider than it is tall).

BlanketSmith bridges the gap between digital pixels (perfect squares) and physical yarn (rectangles). This feature allows the system to calculate an "Aspect Ratio" based on the user's physical gauge swatch and warp the digital representation to match physical reality.

## 2. Implementation Status

**Phase 1 (Editor Visuals) — ✅ Complete**
**Phase 2 (PDF Export) — ✅ Complete**
Phase 3 (Feature Gating) — Not Started
Phase 4 (AR Swatch) — Future Innovation

## 3. The Mathematical Model

Users input physical measurements from a sample swatch. The system derives a Y-axis scale multiplier.

**Formula:**
`Aspect Ratio (Y-Axis Multiplier) = stitchesPerUnit / rowsPerUnit`

Where `stitchesPerUnit = sample_stitch_count / sample_width` and `rowsPerUnit = sample_row_count / sample_height`.

*Example:* 20 stitches × 15 rows over 4 inches of a swatch.
- `stitchesPerUnit = 20 / 4 = 5`
- `rowsPerUnit = 15 / 4 = 3.75`
- `Aspect Ratio = 5 / 3.75 = 1.333`
- Each digital cell's height is multiplied by 1.333 to accurately represent that stitches are wider than tall.

## 4. Data Schema (`project.settings`)

```typescript
// Stored values (always per-unit rates internally)
stitchesPerUnit: number;    // e.g., 5 (stitches per inch)
rowsPerUnit: number;        // e.g., 3.75 (rows per inch)
unit: string;               // e.g., "in" | "cm"
hookSize?: string;          // e.g., "5mm, H/8"
yarnPerStitch?: number;     // e.g., 1.2 (inches per stitch)

visuals: {
  applyGaugeToEditor: boolean; // Warp on-screen grid cell height
  applyGaugeToPDF: boolean;    // Warp printed PDF chart cell height
}
```

## 5. Settings Modal UX

The Settings modal offers **two input modes**:

### Measure a Swatch (default)
Users enter stitch count + physical width of their swatch for the horizontal gauge, and row count + physical height for the vertical gauge. The system auto-computes the rate.

- Width panel: `stitchesPerUnit = swatchWidthCount / swatchWidthMeasure`
- Height panel: `rowsPerUnit = swatchHeightCount / swatchHeightMeasure`
- "Same stitch count as width" checkbox mirrors the stitch count field for convenience.

### Enter Averages Directly
Users who already know their averages enter the physical size of one stitch directly:

- **Avg. stitch width** (`in` or `cm`) → stored as `stitchesPerUnit = 1 / avgStitchWidth`
- **Avg. stitch height** (`in` or `cm`) → stored as `rowsPerUnit = 1 / avgStitchHeight`

Both modes store identical per-unit rate values in `project.settings`, ensuring all downstream consumers (`editorAspectRatio`, `buildExportOptions`, `exportService`) are model-agnostic.

## 6. PDF Export Wiring

`ExportOptions` in `types.ts` includes `stitchAspectRatio?: number`.

`buildExportOptions()` in `PixelGraphPage.tsx` computes:
```typescript
const _stitchAspectRatio = (applyGaugeToPDF && s > 0 && r > 0) ? s / r : 1;
```
and injects it into both Pattern Pack and Chart-Only export objects.

`exportPixelGridToPDF` in `exportService.ts` reads:
```typescript
const exportAspectRatio = options.stitchAspectRatio ?? 1;
```

## 7. Implementation Roadmap

### ✅ Phase 1: Editor Visuals
- Settings UI with gauge inputs and true-proportion toggles.
- `PixelGridEditor` receives `aspectRatio` prop; `GridRenderer` scales cell height accordingly.
- CTM-corrected mouse coordinate mapping for stretched Y-axis.

### ✅ Phase 2: PDF Export Engine
- `ExportOptions.stitchAspectRatio` type field added.
- `buildExportOptions()` computes and injects real ratio.
- `exportService.ts` reads `options.stitchAspectRatio ?? 1` (replaces hardcoded `= 1` stub).

### Phase 3: Infrastructure Gating (Planned)
- Restrict advanced gauge features to authenticated Beta users.

### Phase 4: AR Swatch Measurement (Future Innovation)
- Mobile-friendly swatch photo flow using computer vision to auto-populate gauge data.