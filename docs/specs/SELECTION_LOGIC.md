# Selection Logic & Behavior Specification

**Status:** Active (v2.0)
**Context:** Implemented in `refactor/selection-foundation`
**Primary Components:** `PixelGraphPage.tsx`, `PixelGridEditor.tsx`, `EditorOverlay.tsx`

---

## 1. Philosophy
The BlanketSmith selection engine mimics standard professional image editors (e.g., Photoshop, Paint.net) rather than "spreadsheet" selection models. This prioritizes **destructive editing** (committing changes to the grid) and **modal states** (Floating vs. Static).

## 2. Terminology
- **Static Selection:** A defined boundary `(x, y, w, h)` on the grid. No pixel data is floating.
- **Floating Selection:** A "lifted" chunk of pixel data floating *above* the grid.
- **Source Mask (Ghost):** The area on the grid *underneath* the original position of a floating selection. It remains visible (ghosted) until commit.
- **Commit:** The atomic action of clearing the Source Mask and pasting the Floating Selection into the grid.

---

## 3. Interaction Rules

### A. Drag & Move
- **Implicit Lift:** Dragging a Static Selection automatically "Lifts" it into a Floating Selection.
- **Constraints:** Floating selections are **hard-clamped** to the canvas edges. Users cannot drag a selection off-screen (preventing "lost" pixels).
- **Text Selection Guard:** The Editor Canvas prevents native browser text selection events (`select-none` + `preventDefault`), ensuring aggressive dragging doesn't highlight UI elements.

### B. Rotation
- **Lossless Cycle:** Rotation uses a 4-step cycle (0 -> 90 -> 180 -> 270 -> 0) stored in a `transformRef`.
- **Drift Prevention:** Pixels are always re-calculated from the *original* source data, preventing degradation/blurring from repeated rotations.
- **Even-Dimension Logic:** Rotation for even-sized selections (e.g., 2x2) uses `Math.trunc` for coordinates to prevent sub-pixel snapping issues.

### C. Undo / Redo Policy
The `Ctrl+Z` (Undo) shortcut is **context-aware**:

| State | Action on Undo | Reason |
| :--- | :--- | :--- |
| **Floating Active** | **Transform Undo** | Reverts the last Move or Rotate action. Does *not* drop the selection. |
| **Static Active** | **Deselect** | Clears the selection boundary. Does *not* undo the last drawing action yet. |
| **No Selection** | **Global Undo** | Reverts the last Grid History state (Draw, Paste, etc.). |

### D. Smart Commit (Atomic)
When a Floating Selection is committed (by clicking off or changing tools):
1.  **Clear Source:** The pixels at the `sourceBounds` are wiped (set to transparent).
2.  **Paste Dest:** The floating pixels are stamped onto the grid at the new location.
3.  **History:** This pair of actions is recorded as a *single* undoable history step.

---

## 4. Visual Styles
The Selection Marquee uses a "Three-Layer" Strategy to ensure visibility on *any* background color.

1.  **Tint Layer (Bottom):**
    -   `fill: rgba(33, 150, 243, 0.4)`
    -   `mix-blend-mode: hard-light`
    -   *Result:* Visible on white (blue tint) AND visible on blue (brightens/shifts color).

2.  **Black Stroke (Middle):**
    -   `stroke: black`, `width: 1.5px`
    -   **Inset:** 0.1 grid units.
    -   *Result:* Provides contrast against light backgrounds.

3.  **White Dash (Top):**
    -   `stroke: white`, `width: 1.5px`, `dasharray: 4, 4`
    -   **Inset:** 0.1 grid units.
    -   *Result:* Provides contrast against dark/black backgrounds.

**Inset Logic:** Strokes are inset by `0.1 units` to ensure they are strictly contained within the selection bounds, preventing clipping artifacts at the canvas edges (x=0, y=0).
