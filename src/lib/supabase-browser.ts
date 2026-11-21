import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isPublicSupabaseConfig } from "@/lib/supabase-config";

let client: SupabaseClient | null = null;
let legacyMove: Promise<void> | null = null;

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

/**
 * Browser client. Uses the anon key only.
 * The sign-in is kept in a cookie (Secure on HTTPS, SameSite=Lax) so the server
 * can check it before it sends a members' page or answers a members' API.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  const config = readBrowserSupabaseConfig();
  if (!config || typeof window === "undefined") return null;
  if (!client) {
    client = createBrowserClient(config.url, config.anonKey, {
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

/** The key supabase-js used before this app kept the sign-in in a cookie. */
export function legacySessionKey(url: string): string | null {
  try {
    const ref = new URL(url).hostname.split(".")[0];
    return ref ? `sb-${ref}-auth-token` : null;
  } catch {
    return null;
  }
}

export function readLegacySession(raw: string | null): { access_token: string; refresh_token: string } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { access_token?: unknown; refresh_token?: unknown };
    if (typeof parsed.access_token !== "string" || typeof parsed.refresh_token !== "string") return null;
    if (!parsed.access_token || !parsed.refresh_token) return null;
    return { access_token: parsed.access_token, refresh_token: parsed.refresh_token };
  } catch {
    return null;
  }
}

/**
 * Moves a sign-in saved by the earlier browser-storage client into the cookie once,
 * so people who were signed in stay signed in. The old copy is then removed.
 */
export function moveLegacyBrowserSession(): Promise<void> {
  if (legacyMove) return legacyMove;
  legacyMove = (async () => {
    const supabase = getBrowserSupabase();
    const config = readBrowserSupabaseConfig();
    if (!supabase || !config) return;
    const key = legacySessionKey(config.url);
    if (!key) return;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return;
    }
    if (raw === null) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // The copy stays; nothing else depends on it.
    }
    const legacy = readLegacySession(raw);
    if (!legacy) return;
    const current = await supabase.auth.getSession();
    if (current.data.session) return;
    await supabase.auth.setSession(legacy);
  })().catch(() => undefined);
  return legacyMove;
}
