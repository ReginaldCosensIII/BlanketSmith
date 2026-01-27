
import { createClient } from "@supabase/supabase-js";

// Ensure environment variables are defined or throw error/fallback in dev.
// In a real monorepo, we might use a stricter config package, but for now we rely on Vite's import.meta.env
// or process.env depending on context. Since this is used in Vite apps, we assume import.meta.env.

// We need a way to pass these in or read them from the consuming app's environment.
// For the landing page (Vite), it will be import.meta.env.VITE_SUPABASE_URL.
// To make this package agnostic, we can export a creation function or expect globals.

// Simpler approach for this specific task: Expect the consuming app to initialize it,
// OR export a helper that reads from standard Vite env vars.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("@blanketsmith/supabase: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
