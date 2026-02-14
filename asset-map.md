# Asset Map & Migration Plan

This map defines the current state of assets and their proposed standardized location/name.

**Status Legend:**
- **Keep**: Currently used, will be renamed/moved in place.
- **Archive**: Unused, will be moved to `unused-archive`.
- **Move**: Source asset (`src/assets`) moving to Public (`public/branding` or `public/images`).

## Asset Inventory

| Current Path | New Standardized Name | Status | Functional Role |
| :--- | :--- | :--- | :--- |
| **`apps/tool/public`** | | | |
| `branding/logos/Horizontal-Lockup-No-Slogan.svg` | `branding-logo-horizontal-lockup-no-slogan.svg` | Keep | Main App Header Logo |
| `favicon-16x16.png` | `favicon-16x16.png` | Keep | Browser Tab Icon |
| `favicon-32x32.png` | `favicon-32x32.png` | Keep | Browser Tab Icon |
| `favicon.ico` | `favicon.ico` | Keep | Browser Tab Icon |
| `branding/gradients/*` | (Move to Archive) | Archive | Unused Assets (Moved) |
| `branding/typography/*` | (Move to Archive) | Archive | Unused Assets (Moved) |
| `branding/icons/*` | (Move to Archive) | Archive | Unused Assets |
| `branding/logos/*` (others) | (Move to Archive) | Archive | Unused Logo Variations |
| | | | |
| **`apps/landing-page/public`** | | | |
| `email-assets/horizontal-logo-white.png` | `branding-logo-horizontal-white.png` | Keep | Email Header |
| `email-assets/vertical-logo-no-slogan-white.png` | `branding-logo-vertical-no-slogan-white.png` | Keep | Email Footer |
| `email-assets/favicon-heart-v2.png` | `icon-favicon-heart-v2.png` | Keep | Footer "Made with Love" |
| `email-assets/icons/374FD9/image-sparkle.png` | `icon-feature-image-sparkle.png` | Keep | Email Feature Icon |
| `email-assets/icons/374FD9/dashboard.png` | `icon-feature-dashboard.png` | Keep | Email Feature Icon |
| `email-assets/icons/374FD9/spanner.png` | `icon-feature-spanner.png` | Keep | Email Feature Icon |
| `email-assets/icons/374FD9/community.png` | `icon-feature-community.png` | Keep | Email Feature Icon |
| `email-assets/icons/374FD9/light-bulb.png` | `icon-info-light-bulb.png` | Keep | Email Info Box Icon |
| `favicon.ico` | `favicon.ico` | Keep | Browser Tab Icon |
| `email-assets/PNG/*` | (Move to Archive) | Archive | Unused PNG Assets (Move Failed - Locked?) |
| `email-assets/*.svg` | (Move to Archive) | Archive | Unused SVG Assets |
| | | | |
| **`apps/landing-page/src/assets`** | | | |
| `community-crafting.jpg` | `image-community-crafting.jpg` | Move | Landing Page "About" Image |
| `favicon-badge.svg` | `icon-favicon-badge.svg` | Move | Footer Icon |
| `beta-ui-screenshot.png` | `image-ui-beta-screenshot.png` | Move | Tool Mockup |
| `hero-screenshot.png` | `image-ui-hero-screenshot.png` | Move | Hero Section |
| `mobile-ui-screenshot.png` | `image-ui-mobile-screenshot.png` | Move | Mobile Mockup |
| `Horizontal-Logo-WHITE.svg` | (Move to Archive) | Archive | Seemingly Unused (Email uses PNG) |
| (Other `src/assets/*`) | (Move to Archive) | Archive | Unused |

**Note on Migration:**
- `apps/tool/public/branding/gradients` and `typography` were successfully moved to archive.
- `apps/landing-page/public/email-assets/PNG` failed to move (permission denied), likely locked by process.
- `src/assets` should be moved to `apps/landing-page/public/branding/images` and `icons`.
