# Export Center Smart Defaults (V3)

This document defines the canonical behavior for defaults, policies, and guardrails in the Export Center (V3).

## Source of Truth
The exact default values are defined in `apps/tool/src/services/exportDefaultsV3.ts`. Changes to these values propagate to the UI via the helpers declared in `PixelGraphPage.tsx`.

- **Chart-Only Defaults**: `getDefaultChartOnlyExportOptionsV3()`
- **Pattern Pack Defaults**: `getDefaultPatternPackExportOptionsV3()`

## Policy & Guardrails

The `PixelGraphPage.tsx` UI layer enforces specific policies over the raw engine capabilities.

### 1. Pattern Pack Policy
- **Capabilities**: Full multi-page PDF generation.
- **UI Constraints**:
  - "Cell Appearance" toggles are **HIDDEN**. We strictly enforce deterministic defaults to ensure professional consistency.
  - Default: Symbols ON, Backgrounds ON.
- **Restore Defaults Behavior**:
  - **Action**: Resets all sections (Layout, Branding, Instructions).
  - **Chart Selection**: Explicitly resets to enable **ALL THREE** charts (Color, Stitch, and Hybrid) to encourage exploring all available outputs.

### 2. Chart-Only Policy
- **Capabilities**: Single-diagram focus (Color, Stitch, or Hybrid).
- **UI Constraints**:
  - "Cell Appearance" toggles are **VISIBLE** for Color/Hybrid modes.
  - **Stitch Mode Lock**: If `Stitch` mode is selected, visuals are LOCKED to `{ Symbols: true, Background: false }`. Helper text is displayed.
- **Blank Chart Guard**:
  - If a user manually disables both *Symbols* and *Backgrounds* (in Color/Hybrid mode), the **Export** and **Preview** buttons are DISABLED.
  - A warning message prompts the user to select at least one visual style.
- **State Persistence**:
  - Transitioning into Stitch mode temporarily snapshots the user's previous visual preferences.
  - Leaving Stitch mode restores those preferences (e.g., if Backgrounds were enabled, they re-enable).
- **Restore Defaults Behavior**:
  - **Action**: Resets Layout and Visuals to V3 defaults.
  - **Mode Preservation**: Does **NOT** change the currently selected chart mode (Color/Stitch/Hybrid). The user's intent to export a specific type is respected.

## QA Verification Checklist

### Chart-Only Verification
- [ ] **Stitch Lock**: Select "Stitch Chart". Verify "Cell Appearance" section is replaced by a lock message. Confirm symbols are visible on canvas/preview.
- [ ] **Mode Persistence**:
    1. Select "Color Chart" -> Turn OFF Symbols (Background ON).
    2. Switch to "Stitch Chart" (Verify Lock: Symbols ON / Bg OFF).
    3. Switch back to "Color Chart" (Verify Restoration: Symbols OFF / Bg ON).
- [ ] **Blank Guard**:
    1. Select "Color Chart".
    2. Turn OFF Symbols AND Backgrounds.
    3. Verify "Export" button is DISABLED and warning text appears.
- [ ] **Restore Defaults**:
    1. Select "Hybrid Chart".
    2. Change settings (e.g. Include Cover).
    3. Click "Restore Defaults".
    4. Verify Mode remains "Hybrid", but settings reset.

### Pattern Pack Verification
- [ ] **Clean UI**: Verify "Cell Appearance" section is NOT present.
- [ ] **Restore Defaults**:
    1. Uncheck "Include Color Chart".
    2. Click "Restore Defaults".
    3. Verify Color, Stitch, and Hybrid charts are ALL checked.

### Regression
- [ ] **Cross-Tab Isolation**: Changing settings/defaults in Chart-Only does not affect Pattern Pack state, and vice versa.
