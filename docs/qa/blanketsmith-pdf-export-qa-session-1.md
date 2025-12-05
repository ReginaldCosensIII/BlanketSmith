# BlanketSmith — PDF Export System QA Report
**Version:** v1 (Task Groups A–D)
**Status:** Completed
**Reporter:** Reggie
**Reviewed & Documented by:** Antigravity AI
**Date:** 2025-12-04

## 📄 Overview
This document captures the full QA cycle performed on the BlanketSmith PDF Export System after completion of Task Groups A, B, C, and D.

**Test categories covered:**
- Sanity & UI checks
- Chart Only (Color + Stitch)
- Pattern Pack (Color / Stitch / Combined / No Stitches)
- Large pattern stress tests
- Left-Handed Mode
- UX Observations & Recommendations

This QA cycle confirms the reliability of the new export engine and identifies remaining issues to be addressed before Beta release.

## 🧪 Test Summary Table

| Test # | Description | Status | Notes |
| :--- | :--- | :--- | :--- |
| **1.0** | **Sanity checks** | **PASS** | Export Center modal/UI correct |
| **3.1** | **Chart Only – Color** | **FAIL** | Layout overlap with Yarn table |
| **3.2** | **Chart Only – Stitch** | **FAIL** | Same layout overlap |
| **4.1** | **Pattern Pack – Default** | **PASS** | Clean & correct |
| **4.2** | **Pattern Pack – Color Only** | **PASS** | Correct layout |
| **4.3** | **Pattern Pack – Stitch Only** | **PASS** | Stitch chart + legend correct |
| **4.4** | **Pattern Pack – Both Charts** | **PASS** | Multi-page ordering correct |
| **4.5** | **Pattern Pack – No Stitches** | **PASS** | Legend suppressed correctly |
| **5.1** | **Large Pattern – Chart Only (Color)** | **PASS** | Multi-page, no clipping |
| **5.2** | **Large Pattern – Chart Only (Stitch)** | **PASS** | Clean, symbols ON/OFF correct |
| **6.0** | **Left-Handed Mode** | **PASS** | Numbering reversed; layout stable |
| **UX** | **Overview Page inconsistency** | **Logged** | Future enhancement |

## 📌 Detailed QA Findings

### 1. Sanity Checks — PASS
- Export Center modal loads correctly
- Preview/Export buttons work
- Advanced settings open/close
- No runtime UI errors

### 3. Chart Only Tests
#### 3.1 Chart Only — Color Mode — ❌ FAIL
**Issues observed:**
- Yarn Requirements table always included (unexpected default)
- Chart grid overlaps Yarn table
- No vertical spacing based on `doc.lastAutoTable.finalY`
- Layout becomes unreadable

#### 3.2 Chart Only — Stitch Mode — ❌ FAIL
**Same failure as 3.1:**
- Chart overlaps yarn table
- No spacing applied
- Page layout incorrect

**Root Cause:**
Chart Only mode still uses the same entry-page and spacing logic as Pattern Pack without proper Y-offset adjustments.

### 4. Pattern Pack Tests
#### 4.1 Pattern Pack — Default — ✔ PASS
- Cover page correct
- Yarn Requirements correct
- Color chart correct
- No clipping or blank pages

#### 4.2 Pattern Pack — Color Only — ✔ PASS
- 2-page structure correct
- Layout clean

#### 4.3 Pattern Pack — Stitch Only — ✔ PASS
- Cover page
- Yarn Requirements
- Full Stitch Chart
- Correct Stitch Legend
- No blank pages

#### 4.4 Pattern Pack — Color + Stitch — ✔ PASS
- Correct multi-page order:
  - Cover
  - Yarn
  - 3–? Color Chart
  - 4–? Stitch Chart
  - Final: Stitch Legend
- All pages clean
- No layout issues

#### 4.5 Pattern Pack — No Stitches Edge Case — ✔ PASS
- No Stitch Legend generated
- No Stitch Chart
- No blank pages

### 5. Large Pattern Tests
#### 5.1 Large Chart Only — Color — ✔ PASS
- Yarn table on page 1
- Large chart begins on page 2
- No clipping
- No blank pages
- Chart readable

#### 5.2 Large Chart Only — Stitch — ✔ PASS
- Yarn Requirements on page 1
- Full stitch chart on page 2
- Symbols ON/OFF behave correctly
- No layout issues

### 6. Left-Handed Mode Tests — ✔ PASS
**Findings:**
- Column numbers reversed left↔right
- Row numbers remain correct
- Metadata shows “Left-Handed Mode”
- Pattern Pack and Chart-Only both respected LH numbering
- No layout breakage

### 🟦 UX Note Logged
**Inconsistency:**
Small Pattern Pack exports have no overview page, while large ones do.

**Recommendation:**
Add an optional setting:
- **Include Overview Page (Preview Chart)**
  - Default ON for large charts
  - Optional ON for small charts
