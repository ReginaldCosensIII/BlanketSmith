-- =============================================================
-- Migration: Recreate trigger_welcome_email database webhook
-- =============================================================
-- This migration ensures the webhook that fires the
-- process-submission Edge Function exists and is active.
-- Running this migration idempotently deletes and recreates
-- the webhook so it is always in a clean, known-good state.
-- This is especially important after a Supabase project
-- pause/restore cycle, which can disable or corrupt webhooks.
-- =============================================================

-- Step 1: Remove any stale/disabled version of this webhook
DELETE FROM supabase_functions.hooks
WHERE hook_name = 'trigger_welcome_email';

-- Step 2: Recreate the webhook cleanly
-- This calls the Edge Function `process-submission` on every
-- new INSERT into the public.contact_submissions table.
INSERT INTO supabase_functions.hooks (
    hook_table_id,
    hook_name,
    hook_events,
    request_payload
)
VALUES (
    -- hook_table_id: OID of the public.contact_submissions table
    (SELECT c.oid
     FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname = 'contact_submissions'),

    -- hook_name: unique name for this webhook
    'trigger_welcome_email',

    -- hook_events: fires on INSERT only
    ARRAY['INSERT'],

    -- request_payload: configuration for the HTTP request to the Edge Function
    jsonb_build_object(
        'method', 'POST',
        'headers', jsonb_build_object(
            'Content-Type', 'application/json'
        )
    )
);
