# BlanketSmith Beta Roadmap

**Status:** Active Sprint (Landing Page Polish)
**Target:** Public Beta (v0.8.0)

## ✅ Completed (Gold Master)
- [x] **Selection Engine v2:** Rectangular selection, persistence, resizing.
- [x] **Rotation Engine:** 90/180/270 degree rotation of selections.
- [x] **Interaction Core:** Pointer Events migration (No "Sticky Drag"), Loose Clamping.
- [x] **Undo/Redo System:** Unified History + Floating State ("Smart Undo").
- [x] **Mobile Touch Polish:** Native Pointer Events, Gesture Immunity, Deferred Selection.
- [x] **Email Fidelity & Outlook Compatibility:** Hybrid VML/CSS design, Gmail Threading fix, Dark Mode hardening.
- [x] **Milestone & Campaign Emails:** First Pattern, Beta Kickoff, Password Reset, Generic.

---

## 🚀 Phase 1: Landing Page Polish (Current Focus)
**Goal:** Create a high-impact, marketing-ready landing page to drive beta signups.

### 1. Visual Enhancements (Homepage)
- [x] **Mockup Overlay:** Add depth and animation to the browser/mobile mockup section.
- [ ] **Interactive Tour**: Implement guided tour of features on the homepage.
- [x] **Icon & Asset Polish**: Consolidated assets, standardized icon sizes, and refined visual consistency across the landing page.
- [x] **Mobile Responsiveness**: Refine mobile mockup presentation.
- [x] **Scroll Animations**: Fix scroll-locked animation behavior on desktop and unify with mobile behavior.
- [x] **Hero Section**: Force full viewport height (100dvh) and responsive vertical scaling.

## 🗺️ Phase 1.5: Storytelling & Resources (New Focus)
**Goal**: Build trust and engagement through interactive content and transparency.

### 1. Interactive Components
- [ ] **Interactive Tour**: Build guided walkthrough of the tool features.
- [ ] **Roadmap Story**: Create an interactive, on-brand roadmap component to tell the 1-year vision.
- [ ] **Feature Overlays**: Add depth, context, and "wow" factor to existing feature cards.

### 2. Content & Docs
- [ ] **Blog/Resources Page**: Scaffold page with 1-2 initial posts and YouTube embed support.
- [ ] **Docs Link**: Connect "Help" implementation to documentation.

### 2. SEO & Analytics (Launch Prep)
- [ ] **Google Analytics:** Setup tracking and conversion goals.
- [ ] **SEO Optimization:** Meta tags, Open Graph data, sitemap generation.
- [ ] **Performance:** Optimize asset loading and CWV (Core Web Vitals).

---

## 🔐 Phase 2: Infrastructure & Authentication (Current Focus)
**Goal:** Build the secure foundation for user accounts, data syncing, and feature gating.

### 1. The Dual Auth Funnel
- [ ] **Beta-to-Account Pipeline:** Connect Beta Welcome email verification to the account creation flow.
- [ ] **In-Tool Authentication:** Implement Supabase Auth (Sign Up / Log In) modals directly within the tool UI.
- [ ] **Password Set:** Implement secure password creation and reset flows.

### 2. Local-to-Cloud Data Bridge
- [ ] **Local-First Persistence:** Ensure guest users can save projects to `localStorage`.
- [ ] **Cloud Migration:** Automatically push local blanket data to Supabase upon successful account creation/login.
- [ ] **Access Control:** Restrict high-value features (Export, Pattern Gen) to logged-in users.

---

## 🧶 Phase 3: Application Core (Beta Blockers)
**Goal:** Complete the essential features required for a viable product.

### 1. Gauge & Proportions
- [x] **Stitch Aspect Ratio:** Non-square pixel rendering in the editor and PDF export both complete. Users can measure a swatch or enter averages directly to compute stitch proportions. Merged on `fix/pdf-export-aspect-ratio`.

### 2. Instructions Engine v3 (High Priority)
- [ ] **Row-by-Row Generation:** Convert grid data to "Row 1: 5 SC Blue, 3 SC Red" text.
- [ ] **RLE Optimization:** Compress repeating stitches (Run-Length Encoding).
- [ ] **Export Formats:** PDF Export (Text + Chart) and Clipboard Copy.

### 3. Yarn Palette & Data (High Priority)
- [ ] **Brand Database:** Ingest standard palettes (Red Heart, Stylecraft, etc.).
- [ ] **Palette UI:** Improve color picker to support Brand -> Color selection.

---

## 🔮 Beta Wishlist (Post-Launch)
- [ ] **Local Storage Autosave:** Prevent data loss on refresh.