import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readPublicSupabaseConfig } from "@/lib/supabase-config";

/**
 * Server-only Supabase client with the service role key.
 * Used for invitations (and, separately, the community repository).
 * It must never be imported by a "use client" file; a unit test checks that.
 * The key is read from SUPABASE_SERVICE_ROLE_KEY, which is never a NEXT_PUBLIC_ variable.
 */
export function getAdminSupabase(env: Record<string, string | undefined> = process.env): SupabaseClient | null {
  const config = readPublicSupabaseConfig(env);
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  if (!config || serviceKey.length < 20 || /\s/.test(serviceKey)) return null;
  return createClient(config.url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
