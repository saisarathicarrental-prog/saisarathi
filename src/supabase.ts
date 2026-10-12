import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Load from Vite environment variables with production-ready public fallback
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string)?.trim() ||
  "https://nibtsbtxrraitealuarm.supabase.co";

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim() ||
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string)?.trim() ||
  "sb_publishable_GKc7IyjmJtKMrB8LCUfLCA_Myd7RzpZ";

/**
 * Checks whether valid Supabase credentials have been configured
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim() !== "" &&
    !supabaseUrl.includes("your-project") &&
    !supabaseUrl.includes("placeholder-project") &&
    supabaseAnonKey &&
    supabaseAnonKey.trim() !== "" &&
    !supabaseAnonKey.includes("your-anon-key") &&
    !supabaseAnonKey.includes("placeholder-anon-key")
  );
};

/**
 * Supabase client instance with Realtime enabled
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);
