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
-   **Hosting**: Assets are served from `apps/landing-page/public/branding/` via the Vercel production URL.
-   **Base URL**: `https://blanket-smith-landing-page.vercel.app/` (defined as `ASSET_BASE` in `templates.ts`)
-   **Asset Structure**:
    ```
    public/branding/
    ├── logos/
    │   ├── bs-logo-horizontal-white.png   (email header)
    │   ├── bs-logo-vertical-white.png     (email footer)
    │   └── bs-logo-heart.png              (footer heart icon)
    └── icons/email/
        ├── icon-info-light-bulb.png
        ├── icon-feature-image-sparkle.png
        ├── icon-feature-dashboard.png
        ├── icon-feature-spanner.png
        └── icon-feature-community.png
    ```
-   **Vercel Routing**: `apps/landing-page/vercel.json` excludes `branding/` from the SPA rewrite rule so Vercel serves image files directly.

---

## 3. Component Library (`templates.ts`)

| Component | Description | Outlook Quirk |
| :--- | :--- | :--- |
| `getCinematicShellHTML` | Main wrapper with `<head>`, fonts, and resets. | Contains the VML bloat and CSS reset. |
| `getEmailHeaderHTML` | Standard header with Logo. | Uses `bgcolor` on `<td>` to match footer in Dark Mode. |
| `getEmailFooterHTML` | Social links, Unsubscribe, Copyright. | Parent `<td>` elements have inline color styles to prevent "flash of unstyled content". |
| `getEmailButtonHTML` | CTA Button with gradient. | Text requires `<span>` wrapper with `!important` color. |
| `getEmailProgressRailHTML`| Step tracker (Sign Up -> The Forge). | Uses border-radius (degrades to square in older clients). |
| `getFirstPatternMilestoneTemplate`| Achievement celebration with expanded header/emojis. | Uses standard layout with custom Trophy emoji header. |
| `getPasswordResetTemplate` | Secure password reset request. | Standard transactional layout. |
| `getBetaKickoffTemplate` | High-energy "The Forge is Open" email | Uses 4-card feature grid and "Community Resources" InfoBox. |
| `getGenericTemplate` | Flexible notification with optional InfoBox. | Adapts to any Title/Body/CTA combination. |

---

## 4. Database Webhook

The email system is triggered by a **Supabase Database Webhook** named `trigger_welcome_email`.

| Setting | Value |
| :--- | :--- |
| **Table** | `public.contact_submissions` |
| **Event** | `INSERT` |
| **Type** | Supabase Edge Function |
| **Function** | `process-submission` |
| **Timeout** | `5000ms` |

> **Important**: A SQL migration to recreate this webhook exists at:
> `supabase/migrations/20260319000000_recreate_trigger_welcome_email_webhook.sql`

---

## 5. Testing & Verification

**Manual Checklist:**
1.  **Gmail (Web)**: Check for "Show Quoted Text" collapse.
2.  **Gmail (Mobile)**: Check Dark Mode color inversion (Info Box should remain readable).
3.  **Outlook (Desktop)**: Check Header/Footer background alignment (should be seamless Slate 900).
4.  **Outlook (Light Mode)**: Check Button text (must be White, not Black).

---

## 6. Incident Recovery Runbook

> **Use this guide if emails stop sending after a Supabase project pause/restore or any infrastructure event.**

### Symptoms
- Contact/beta signup forms show "success" but no email is received
- Supabase Edge Function logs (`process-submission`) show **no entries** after a form submission
- Images in emails show broken image icons

### Diagnosis Checklist

| # | Check | How |
|---|---|---|
| 1 | **Is the Supabase project active?** | Dashboard → Project should show "Active", not "Paused" |
| 2 | **Is the Edge Function being triggered?** | Dashboard → Edge Functions → `process-submission` → Logs. Submit a form. Do logs appear? |
| 3 | **Is the Edge Function itself broken?** | Dashboard → Edge Functions → `process-submission` → Test/Invoke with a test payload (see below) |
| 4 | **Is the webhook active?** | Dashboard → Database → Webhooks → `trigger_welcome_email` |
| 5 | **Are assets loading in emails?** | Check raw email source (`Show Original` in Gmail) and look at `<img src>` URLs |

### Test Payload (Step 3)
Invoke the Edge Function directly with:
```json
{
  "type": "test_email",
  "email": "your@email.com",
  "template": "beta"
}
```
If this sends successfully → the function works, the **webhook** is the problem (go to Step 4).

### Fix: Webhook Not Firing
The Supabase project restoration **disables the database webhook**. To fix:
1. Go to **Database → Webhooks** in the Supabase dashboard
2. **Delete** the `trigger_welcome_email` webhook
3. **Re-create** it with the settings in Section 4 above
4. Submit a test form — email should arrive within seconds

### Prevention: Project Keep-Alive
To prevent the project from pausing (which causes the webhooks to break in the first place), we run a scheduled GitHub Action that pings the Supabase REST API every 3 days.
- **Documentation**: See [SUPABASE_KEEP_ALIVE.md](./SUPABASE_KEEP_ALIVE.md) for architecture and setup instructions.
- **Workflow File**: `.github/workflows/supabase-keep-alive.yml`
### Fix: Edge Function Not Deployed / Wrong Code
If the function is triggered (logs appear) but emails fail or images are broken:
```powershell
# Deploy local code to Supabase (from project root)
& "$env:TEMP\supabase.exe" functions deploy process-submission --project-ref wpcrfwefpgatappgkfff
```
> **Note**: Deploying from the Supabase Dashboard editor deploys whatever code is saved there (which may be outdated). Always deploy from the local CLI to ensure the repo code is live.

### Fix: Images Not Loading in Emails
The image URLs in emails are generated by `ASSET_BASE` in `templates.ts`. If they appear wrong in the raw email source:

1. Verify `ASSET_BASE` in `supabase/functions/process-submission/templates.ts` has a **trailing slash**: `"https://blanket-smith-landing-page.vercel.app/"`
2. Verify `apps/landing-page/vercel.json` excludes `branding/` from the SPA rewrite rule
3. Verify the image files exist in `apps/landing-page/public/branding/`
4. Redeploy the Edge Function via CLI (see above)
