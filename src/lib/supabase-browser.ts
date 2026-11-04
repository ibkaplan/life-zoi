import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isPublicSupabaseConfig } from "@/lib/supabase-config";

let client: SupabaseClient | null = null;

/**
 * Next inlines these direct property reads into the browser bundle.
 * Reading them from a `process.env` argument stays empty on the client.
 */
function readBrowserSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
  if (!isPublicSupabaseConfig(url, anonKey)) return null;
  return { url, anonKey };
}

/** Browser client. Uses the anon key only. */
export function getBrowserSupabase(): SupabaseClient | null {
  const config = readBrowserSupabaseConfig();
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
