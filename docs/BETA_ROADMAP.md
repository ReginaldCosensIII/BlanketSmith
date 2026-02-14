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
- [ ] **Mockup Overlay:** Add depth and animation to the browser/mobile mockup section.
- [ ] **Interactive Tour**: Implement guided tour of features on the homepage.
- [x] **Icon & Asset Polish**: Consolidated assets, standardized icon sizes, and refined visual consistency across the landing page.
- [ ] **Mobile Responsiveness**: Refine mobile mockup presentation.

### 2. SEO & Analytics (Launch Prep)
- [ ] **Google Analytics:** Setup tracking and conversion goals.
- [ ] **SEO Optimization:** Meta tags, Open Graph data, sitemap generation.
- [ ] **Performance:** Optimize asset loading and CWV (Core Web Vitals).

---

## 🔐 Phase 2: Infrastructure & Authentication
**Goal:** Build the secure foundation for user accounts and feature gating.

### 1. User System
- [ ] **Sign Up Flow:** Connect Beta Welcome email verification to account creation.
- [ ] **Password Set:** Implement secure password creation flow.
- [ ] **Login System:** Integrate Supabase Auth with the main tool.

### 2. Feature Gating
- [ ] **Access Control:** Restrict high-value features (Export, Pattern Gen) to logged-in users.
- [ ] **Data Persistence:** Ensure user projects are saved to their authenticated account.
- [ ] **Database Strategy:** Evaluate Supabase vs Postgres migration path.

---

## 🧶 Phase 3: Application Core (Beta Blockers)
**Goal:** Complete the essential features required for a viable product.

### 1. Instructions Engine v3 (High Priority)
- [ ] **Row-by-Row Generation:** Convert grid data to "Row 1: 5 SC Blue, 3 SC Red" text.
- [ ] **RLE Optimization:** Compress repeating stitches (Run-Length Encoding).
- [ ] **Export Formats:** PDF Export (Text + Chart) and Clipboard Copy.

### 2. Yarn Palette & Data (High Priority)
- [ ] **Brand Database:** Ingest standard palettes (Red Heart, Stylecraft, etc.).
- [ ] **Palette UI:** Improve color picker to support Brand -> Color selection.

---

## 🔮 Beta Wishlist (Post-Launch)
- [ ] **Local Storage Autosave:** Prevent data loss on refresh.
