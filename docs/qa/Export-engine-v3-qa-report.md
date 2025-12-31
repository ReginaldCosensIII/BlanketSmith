# Export Engine V3 QA Report

**Version:** 3.1 (Beta)  
**Status:** Active  
**Supersedes:** V2 QA Report  

---

## 1. Purpose

Export Engine V3 exists to eliminate ambiguity in the PDF generation process.

While V2 relied on inference (guessing hybrid mode from symbols, deducing atlas needs from layout side-effects), V3 enforces:

- **Explicit Chart Modes** — Color, Stitch, and Hybrid are always user-selected
- **Canonical Execution Flow** — one deterministic rendering path for all exports
- **Strict Isolation** — Chart-Only options never leak into Pattern Pack options
- **Deterministic Output** — identical inputs always produce identical PDFs

This report defines how QA verifies those guarantees.

---

## 2. Core Architecture (V3)

### 2.1 Canonical Execution Flow

All exports follow a single, strict rendering order. There are no conditional branches between “Chart Mode” and “Pack Mode”.

1. **Cover Page** (optional)
2. **Project Header**
3. **Pattern Overview** (tri-state logic)
4. **Materials & Stitch Key**
5. **Chart Sections** (iterative, each on a fresh page):
   - Color Chart (if enabled)
   - Stitch Chart (if enabled)
   - Hybrid Chart (if enabled)

> There is **no standalone Stitch Legend** in V3.  
> Stitch definitions are rendered exclusively within **Materials & Stitch Key** when required.

---

### 2.2 Shared Atlas Prediction

A single helper, `predictAtlasLayout()`, computes pagination **before any rendering occurs**.

This guarantees:
- Consistent row/column numbering across Color, Stitch, and Hybrid charts
- Correct Pattern Overview overlays
- No duplicate “simulation” logic anywhere in the engine

---

### 2.3 Explicit Chart Modes

- **Chart-Only**
  - Selected via `chartOnlyMode = 'color' | 'stitch' | 'hybrid'`
- **Pattern Pack**
  - Explicit toggles:
    - `includeColorChart`
    - `includeStitchChart`
    - `includeHybridChart`

No chart is ever inferred.

---

### 2.4 Pattern Overview Tri-State

Pattern Overview rendering is governed by `overviewMode`:

- **Auto**
  - Renders only if the reference chart spans multiple pages
- **Always**
  - Forces rendering, even for single-page charts
- **Never**
  - Suppresses rendering entirely

---

## 3. Non-Negotiable Export Rules (Beta)

These rules are **hard-coded** and must never regress.

1. **Fresh Page Policy**
   - Every chart section (Color, Stitch, Hybrid) **always** starts on a fresh page
   - No attempts are made to “fit” charts below other content

2. **Overview Placement**
   - With Cover Page → Overview renders on a fresh page
   - Without Cover Page → Overview may share Page 1 *only if it fits cleanly*

3. **Hybrid Verification**
   - Hybrid charts are never inferred
   - They appear **only** if explicitly enabled

4. **Single Renderer**
   - One renderer draws all grid cells across all chart modes

---

## 4. Materials & Stitch Key (Unified)

### 4.1 Canonical Behavior

The **Materials & Stitch Key** section replaces all legacy “Yarn Requirements” and “Stitch Legend” concepts.

It conditionally includes:

- **Materials Table** — always present if the section is enabled
- **Stitch Key Subsection** — included when:
  - Chart-Only: Stitch or Hybrid mode
  - Pattern Pack: Stitch or Hybrid chart enabled

There is no user toggle controlling stitch inclusion — it is engine-determined.

---

### 4.2 Color Symbol Column Rules

The numeric **Symbol (Sym)** column appears **only when a Color Chart is present**.

| Export Type | Charts Included | Symbol Column |
|------------|-----------------|---------------|
| Chart-Only | Color           | PRESENT |
| Chart-Only | Stitch          | ABSENT |
| Chart-Only | Hybrid          | ABSENT |
| Pattern Pack | Color          | PRESENT |
| Pattern Pack | Hybrid only    | ABSENT |
| Pattern Pack | Stitch only    | ABSENT |
| Pattern Pack | Color + Hybrid | PRESENT |

Symbols correspond exactly to color indices used in Color charts.

---

## 5. QA Harness (V3)

The internal QA harness (`ExportEngineTestPage`) enforces V3 rules.

### 5.1 Scenario Convention

Scenario IDs follow:

- `mode`: `pp` (Pattern Pack) or `co` (Chart-Only)
- `overview`: `ov_auto`, `ov_always`, `ov_never`

---

### 5.2 Verified Behaviors

Scenarios explicitly validate:

- Pattern Overview tri-state behavior
- Symbol column gating rules
- Stitch Key inclusion logic
- Hybrid isolation (no accidental chart enablement)
- Fresh page policy enforcement

---

## 6. Manual QA Checklist

### Chart-Only
- [ ] Color → Color chart + Materials & Stitch Key with Symbol column
- [ ] Stitch → Stitch chart + Materials & Stitch Key (no Symbol column)
- [ ] Hybrid → Hybrid chart + Materials & Stitch Key (no Symbol column)

### Pattern Pack
- [ ] Color only → Symbol column present
- [ ] Stitch only → Stitch Key present, no Symbol column
- [ ] Hybrid only → No Symbol column
- [ ] All enabled → Three chart sections, each on a fresh page

### Pattern Overview
- [ ] Auto → appears only for multi-page charts
- [ ] Always → appears for single-page charts
- [ ] Never → suppressed even for large patterns

### Overview Overlays
- [ ] Multi-page → red overlays labeled **“Part 1..N”**
- [ ] Single-page (Always) → red border around entire overview
- [ ] No overlap with header or following sections

---

## 7. Explicit Out-of-Scope Items

The following are **not** implemented and are not bugs:

- Instructions rendering (`instructionsMode` is a placeholder)
- Auto-selecting Stitch mode based on palette
- Packing charts onto the header page to save space

---

## 8. Post-V3 Polish: Pattern Overview Improvements

**Status:** Merged (2025-12-30)

### Enhancements
1. **Target-Fill Sizing**
   - Overview fills ~80% of available height
   - Max height raised to 550pt
2. **Width Optimization**
   - Reduced horizontal margins and title spacing
3. **Single-Page Border**
   - Red border rendered when no atlas overlays exist

### Verification
- Large patterns produce visibly larger overviews
- Single-page overviews remain readable on white backgrounds
- Multi-page overlays still render “Part 1..N” correctly