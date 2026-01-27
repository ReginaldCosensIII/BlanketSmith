# BlanketSmith Beta Landing Page

The marketing and landing site for BlanketSmith.

## Purpose
This workspace (`@blanketsmith/landing-page`) serves as the public face of the project, including the beta signup flow, feature showcase, and Supabase integration.

## Tech Stack
- **Framework**: React (Vite + SWC)
- **Styling**: Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (`@blanketsmith/supabase`)
- **State**: Tanstack Query
- **Animation**: Framer Motion

## Environment Variables

Create a `.env` file in the root of this workspace with the following keys:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Backend Schema Mapping

The forms map to the `contact_submissions` table (requires `PGRST204` compliance):

- **Columns**: `category`, `sub_type`, `full_name`, `email`
- **Beta Specific**: `primary_craft`, `experience_level` (top-level)
- **Bug Reports**: `steps_to_reproduce`, `expected_behavior` (top-level)

## Local Development

To run this workspace locally:

```bash
npm run dev:landing
```

This will start the Vite dev server at `http://localhost:8080`.
