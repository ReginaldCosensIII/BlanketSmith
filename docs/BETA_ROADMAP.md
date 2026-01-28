# BlanketSmith Beta Roadmap (Living Document)

**Status:** Active (Beta push)  
**Timezone:** America/New_York  
**Scope:** `apps/tool` + Beta Landing Page integration (import into monorepo + deploy)  
**Change policy:** This plan will grow/shrink over the next ~2 weeks. Tasks will be added/removed/split/merged as we ship work and discover issues.

---

## 1) Purpose

Ship a credible BlanketSmith **Tool Beta** with:
- Stability and safety (no silent failures, graceful errors, actionable logs)
- Strong usability on desktop + mobile/tablet + non-mouse workflows
- Predictable exports with clean UI
- Clear onboarding + in-tool help
- A feedback/bug reporting pathway connected to the Beta Landing experience

---

## 2) Workflow and Standards

All work must follow:
- `WORKFLOW.md`
- `pull_request_template.md`

### Operating rules
- Plan-first execution (scope + file touch contract + acceptance criteria)
- Small, reviewable PRs
- Verification steps required for merge
- Update docs when behavior changes
- Prefer “de-risk early”: stabilize logging/error handling before sweeping refactors

---

## 3) Definitions

**Beta Blocker:** Beta should not ship without it.  
**High Priority:** Strongly required for a credible Beta.  
**Medium Priority:** Important, but may slip if risk/time increases.  
**Low Priority:** Nice-to-have.

**Status values:** Not Started | Planned | In Progress | Blocked | Done

---

## 4) Milestones (Execution-Oriented)

Milestones are ordered for delivery efficiency. Tasks can move between milestones.

### Milestone A — Beta Foundations (Observability + Safety)
**Outcome:** Problems are visible, debuggable, and fail gracefully.

- **LOG-001:** Professional logging + error handling baseline (Done)
  - Consistent error handling patterns for critical flows (editor actions, load/save, export)
  - UI-safe error boundaries where appropriate
  - Production-safe logs (actionable, minimal noise)

---

### Milestone B — Beta Access (Mobile/Tablet + Non-Mouse)
**Outcome:** Tool is usable across devices and input methods.

- **UX-001:** Mobile/tablet usable editor experience (Blocker)
- **UX-002:** Non-mouse zoom/navigation controls (Blocker)
- **ZOOM-001 / ZOOM-002 / GRID-001:** Zoom + gridline behavior polish (Medium)
- **UX-003:** Click Background to Deselect Selection (Done)

---

### Milestone C — Core Reliability (Data Integrity + Export Safety)
**Outcome:** Core tools do not corrupt state; exports fail safely and predictably.

- **ROT-001:** Rotate/select tool data integrity + undo/redo compatibility (Blocker)
- **EXP-001:** Export pipeline hardening (High)
- **EXP-002:** Export Center UI alignment (High)

---

### Milestone D — Beta Feedback Loop (Tool ↔ Landing)
**Outcome:** Beta users can report issues quickly with useful diagnostic context.

- **RPT-001:** Feedback/bug reporting mechanism (Blocker)
- [x] **Landing Scaffolding**: Import & configure landing page workspace (Done).
- [x] **Supabase Integration**: Wire up contact form & backend (Done).
    - [x] Debugging `PGRST204` (Schema Cache Mismatch)
    - [x] Email Automation: Live (SMTP) Dispatcher & Admin Alerts (Complete)
- [ ] **Vercel Secrets Config**: Configure env vars for Supabase connectivity (Next).
- [ ] **Deployment**: Deploy landing page sub-directory (Pending).

---

### Milestone E — Beta Feature Expectations (Instructions + Stitches + Generator)
**Outcome:** The Beta feature set matches expectations and supports real use.

- **INS-001:** Instructions Engine v2 (Blocker)
- **STCH-001 / STCH-002:** Stitch library expansion + custom stitches (High)
- **GEN-001:** Generate Pattern v2 (High)
- **OVR-001:** Stitch icons + overlays (High; enhancement pass if needed)
- **CHART-001:** New chart integrated into export + UI (High)

---

### Milestone F — UX Support (Help + Tour + Contextual Hints)
**Outcome:** Users can self-serve learning and troubleshooting inside the tool.

- **HLP-001:** Help/Docs/FAQs page (High)
- **TOUR-001:** Interactive guided tour (High)
- **INFO-001:** Contextual info hint system (Medium)

---

### Milestone G — Export Expansion + Print + Page Presets
**Outcome:** Expanded export formats and optional print workflows.

- **EXP-003:** PDF page-count presets (Medium)
- **EXP-004:** PNG export (Medium)
- **EXP-005:** SVG export (Medium)
- **EXP-006:** Text pattern generation (Medium; scope must be defined)
- **PRT-001:** Print feature (Low/Medium)

---

### Milestone H — Pre-Release Performance + Final QA
**Outcome:** Beta build is fast enough and regression-tested.

- **PERF-001:** Large-grid performance pass (High; scheduled late but before release)
- Regression sweep, export verification,
- [ ] **Mobile/Tablet Experience** (UX-001)
    - [x] Phase 1: Layout Fixes (Header/Footer/Sidebar)
    - [x] Phase 2: Touch Interaction Refactor (Pan/Zoom/Gestures)
    - [x] Phase 3: Zoom Logic Unification & Robustness (Completed via Phase 8/9)

---

## 5) Backlog Index (Living)

Add items freely; keep IDs stable once created. Promote to Blocker list when needed.

### Beta Blockers (Must-Have)
- [x] **LOG-001:** Professional logging + error handling baseline (Status: Done)
- [x] **UX-001:** Mobile/tablet usable editor experience (Status: Done)
- [x] **UX-002:** Non-mouse zoom/navigation controls (Status: Done)
    - [x] Stage 1: Shortcut Engine & Documentation
- [x] **INS-001:** Instructions Engine v2 (Status: Done)
- [ ] **RPT-001:** Feedback/bug reporting mechanism (Status: Not Started)
- [ ] **ROT-001:** Rotate/select tool data integrity + undo/redo compatibility (Status: Not Started)
- [x] **INFRA-001:** Global Type Checking (Status: Done)

### High Priority
- [ ] **EXP-001:** Export pipeline hardening (Status: Not Started)
- [x] **EXP-002:** Export Center UI alignment (Status: Done)
- [ ] **STCH-001:** Expand default stitch library (Status: Not Started)
- [ ] **STCH-002:** Custom stitches (Status: Not Started)
- [ ] **OVR-001:** Stitch icons + overlays (Status: Initially completed; enhancement pass TBD)
- [ ] **PERF-001:** Large-grid performance pass (Status: Not Started; schedule near release)
- [ ] **HLP-001:** Help/Docs/FAQs page (tool) (Status: Not Started)
- [ ] **TOUR-001:** Interactive guided tour (Status: Not Started)
- [x] **GEN-001:** Generate Pattern v2 (advanced settings + improved algorithms) (Status: Done)
- [ ] **CHART-001:** New chart type integrated into export + UI (Status: Not Started)

### Medium Priority
- [x] **UX-003:** Click Background to Deselect Selection (Status: Done)
- [ ] **ZOOM-001:** Zoom lock + control layout stability (Status: Not Started)
- [ ] **ZOOM-002:** Zoom slider behavior across pages (Status: Not Started)
- [ ] **GRID-001:** Gridline visibility thresholds by zoom (Status: Not Started)
- [ ] **INFO-001:** Contextual info hint system (Status: Not Started)
- [x] **EXP-003:** PDF page-count presets (“N pages”) (Status: Done)
- [ ] **EXP-004:** PNG export (Status: Not Started)
- [ ] **EXP-005:** SVG export (Status: Not Started)
- [ ] **EXP-006:** Text pattern generation (scope definition required) (Status: Not Started)
- [ ] **ASSET-001:** Consolidate branding assets (`/assets` vs `/public`) (Status: Not Started)

### Low Priority / Nice-to-Have
- [ ] **FONT-001:** Additional fonts (Status: Not Started)
- [ ] **PRT-001:** Print feature (Status: Not Started)

---

## 6) Notes / Watchlist

- Rotate/select tool: verify no data loss after multiple rotations; confirm undo/redo correctness.
- Cursor selection accuracy: verify selection maps to cursor center reliably.
- Export UI consistency: Pattern Pack vs Chart-Only should look and behave the same.
- Instructions default behavior: if instruction data exists (user-entered or generated), Pattern Pack should default to including Instructions.
- Branding assets: confirm canonical asset location and eliminate duplicates.

---

## 7) Governance: Adding/Changing Tasks

1) Add the new task to the Backlog Index with an ID, priority, and initial status.  
2) If it impacts Beta viability, add it to Beta Blockers.  
3) When pulling into execution, create an implementation-ready task definition using the workflow planning template (scope, out of scope, file touch contract, acceptance criteria, verification steps).  
4) Execute via branch + PR per repo standards.  
5) Keep this roadmap updated as PRs land.

---

## 8) Immediate Execution Order (Initial Recommendation)

**Batch 1 (de-risk early):**
1) **LOG-001** — Logging + error handling baseline  
2) **UX-001** — Mobile/tablet usable editor experience  
3) **RPT-001** — Feedback/bug reporting mechanism

**Batch 2 (critical integrity):**
4) **ROT-001** — Rotate/select correctness + undo/redo  
5) **UX-002** — Non-mouse navigation controls (if not covered by UX-001)  
6) **EXP-001** — Export pipeline hardening

(Adjust as needed based on discoveries during implementation.)
