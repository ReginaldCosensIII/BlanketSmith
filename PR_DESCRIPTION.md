# Pull Request Template

## Summary

* feat(tool): implement phase 1 supabase auth infrastructure and security hardening

## Changes

* **Infrastructure**: Created `apps/tool/src/lib/supabase.ts` for the Supabase client singleton.
* **State Management**: Built `AuthContext.tsx` to handle global session state hydration and live subscription events.
* **Component**: Implemented a modern `AuthModal` with glassmorphism styling, clean inputs, and basic error handling connecting seamlessly to the BlanketSmith UI design tokens.
* **Layout**: Wired the `Header` to reflect authentication state, showing a "Sign In" button when logged out and a user dropdown when logged in.
* **Security**: Standardized and locked down `.gitignore` across the root and app boundaries for `.env*` files, and sanitized `.env.example` files to prevent future secret leaks.

## Testing

* [x] `npm run build`
* [ ] `npm run test` (if applicable)
* [x] `npm run type-check` (Verified no new TS errors)
* ## [x] Manual verification:
  * Manually verified local spin-up of both landing-page and tool workspaces.
  * Attempting to log in/sign up correctly passes the inputs to Supabase and handles validation logic.

## Notes / Screenshots (if UI)

* N/A

## Risks / Follow-ups

* Need to implement the full Beta-to-Account Pipeline and restrict usage based on account state.
