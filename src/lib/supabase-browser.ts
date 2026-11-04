import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readPublicSupabaseConfig } from "@/lib/supabase-config";

let client: SupabaseClient | null = null;

/** Browser client. Uses the anon key only. */
export function getBrowserSupabase(): SupabaseClient | null {
  const config = readPublicSupabaseConfig();
  if (!config || typeof window === "undefined") return null;
  if (!client) {
    client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    });
  }
  return client;
}
