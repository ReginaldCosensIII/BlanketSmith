---
description: Supabase Oracle (Backend Integrity)
---

# Supabase Oracle

## Goal
Enforce absolute accuracy when interacting with Supabase Edge Functions, Database Schemas, and Generated Types.

## Context
The project uses a monorepo structure with Supabase logic split between `/supabase` (migrations/functions) and `apps/landing-page/src/integrations/supabase` (types/client).

## Directives
1. **Schema Verification**: You are FORBIDDEN from assuming a table or column exists. You must verify against `apps/landing-page/src/integrations/supabase/types.ts` before writing queries.
2. **Migration Awareness**: Before suggesting database changes, you must read the latest files in `supabase/migrations/` to understand the current state.
3. **Edge Function Pathing**: All Edge Function work must happen in `supabase/functions/`. You must verify the `index.ts` and `templates.ts` structure before editing.
4. **Type Safety**: Always prefer using the generated `Database` types over `any`. If a type is missing, you must suggest updating the types via the Supabase CLI.

## Enforcement
- If the agent proposes a query to a non-existent column, the plan must be rejected.
- Every backend change must include a check of the local `config.toml`.
