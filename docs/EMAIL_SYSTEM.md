# BlanketSmith Email System Architecture

**Status:** Beta (Hybrid VML/CSS)
**Backend:** Supabase Edge Functions (`process-submission`)
**Templating:** TypeScript String Literals (`templates.ts`)

## 1. Core Philosophy: "The Super Hybrid"

We utilize a **Hybrid Design Strategy** to deliver a "Cinematic" experience to modern clients (Apple Mail, Gmail, Superhuman) while gracefully degrading to a rock-solid, consistent "Business" layout for Outlook Desktop (Windows).

### The Tiered System
1.  **Tier 1 (Modern)**: Uses CSS Grid/Flexbox (limited), CSS Gradients, Rounded Corners, and transparent PNGs.
    -   *Clients*: Apple Mail, iOS, Gmail (Mobile/Web), Android.
2.  **Tier 2 (Outlook/Windows)**: Uses VML (Vector Markup Language), Tables nested 4-levels deep, and specific styling overrides.
    -   *Clients*: Outlook 2016, 2019, 365 (Desktop).

---

## 2. Technical Implementation

### A. The "Threading Buster" (Gmail Fix)
Gmail collapses content when it detects duplicate text (e.g., standard footers) in a thread. To prevent this:
-   **Mechanism**: We inject a unique, invisible Timestamp ID at the **very top** of the `<body>`.
-   **Code**:
    ```html
    <div style="display:none; font-size:0; line-height:0; color:#334155; max-height:0; opacity:0; overflow:hidden;">
      Ref: ${new Date().getTime()}
    </div>
    ```
-   **Why Top?**: Putting it at the bottom failed because Gmail scans from the bottom up for signatures. Putting it at the top ensures the "content hash" is unique immediately.

### B. VML Backgrounds (Outlook Fix)
Outlook Desktop **does not support** CSS `background-image` or `linear-gradient`.
-   **Solution**: We inject VML (`<v:background>`) inside conditional comments `<!--[if gte mso 9]>`.
-   **Current State**: Configured to render a solid color (Slate 900) to match Dark Mode headers.
-   **Future capability**: Can be updated to use a tiled image (e.g., graph paper) by adding a `<v:fill src="..." />` tag.

### C. Dark Mode Strategy
We use a **"Force & Override"** strategy.
1.  **Root Level**: We declare `<meta name="color-scheme" content="light dark">`.
2.  **Styles**: We use `@media (prefers-color-scheme: dark)` to swap colors.
3.  **Outlook Hack**: Outlook tries to invert colors automatically. We fight this by:
    -   **Text**: Wrapping white text in `<span>` tags with `!important` color rules (e.g. Buttons).
    -   **Backgrounds**: Using specific hex codes (e.g., `#0f172a`) on `bgcolor` attributes of wrapper tables.

### D. Asset Management
-   **Hosting**: Assets are served from `public/email-assets/` via the Vercel production URL.
-   **Versioning**: We use cache-busting filenames or folder structures where possible (currently flat).
-   **Logos**: We use "Vertical" and "Horizontal" lockups. White variations are used on dark backgrounds.

---

## 3. Component Library (`templates.ts`)

| Component | Description | Outlook Quirk |
| :--- | :--- | :--- |
| `getCinematicShellHTML` | Main wrapper with `<head>`, fonts, and resets. | Contains the VML bloat and CSS reset. |
| `getEmailHeaderHTML` | standard header with Logo. | Uses `bgcolor` on `<td>` to match footer in Dark Mode. |
| `getEmailFooterHTML` | Social links, Unsubscribe, Copyright. | Parent `<td>` elements have inline color styles to prevent "flash of unstyled content". |
| `getEmailButtonHTML` | CTA Button with gradient. | Text requires `<span>` wrapper with `!important` color. |
| `getEmailProgressRailHTML`| Step tracker (Sign Up -> The Forge). | Uses border-radius (degrades to square in older clients). |
| `getFirstPatternMilestoneTemplate`| Achievement celebration with expanded header/emojis. | Uses standard layout with custom Trophy emoji header. |
| `getPasswordResetTemplate` | Secure password reset request. | Standard transactional layout. |
| `getBetaKickoffTemplate` | High-energy "The Forge is Open" email | Uses 4-card feature grid and "Community Resources" InfoBox. |
| `getGenericTemplate` | Flexible notification with optional InfoBox. | Adapts to any Title/Body/CTA combination. |

---

## 4. Testing & Verification

**Manual Checklist:**
1.  **Gmail (Web)**: Check for "Show Quoted Text" collapse.
2.  **Gmail (Mobile)**: Check Dark Mode color inversion (Info Box should remain readable).
3.  **Outlook (Desktop)**: Check Header/Footer background alignment (should be seamless Slate 900).
4.  **Outlook (Light Mode)**: Check Button text (must be White, not Black).
