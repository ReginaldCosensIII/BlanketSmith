import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

/**
 * Supabase client singleton for the BlanketSmith Tool workspace.
 * Reads credentials from Vite environment variables at build time.
 * Import this instance everywhere — do NOT call createClient() again.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
