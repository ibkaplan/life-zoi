import { parseCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { bearerToken, cookieClient } from "@/lib/auth/session";
import { getAdminSupabase } from "@/lib/supabase-admin";
import { readPublicSupabaseConfig } from "@/lib/supabase-config";
import { createSupabaseTipRepository, type TipRepository } from "./repository";

type Env = Record<string, string | undefined>;

/**
 * The member's own rows, read with their own sign-in so row level security
 * applies. Call only after requireMember. Returns null without a Supabase config.
 */
export async function memberTipRepository(request: Request, env: Env = process.env): Promise<TipRepository | null> {
  const config = readPublicSupabaseConfig(env);
  if (!config) return null;
  let token = bearerToken(request.headers.get("authorization"));
  if (!token) {
    const parsed = parseCookieHeader(request.headers.get("cookie") ?? "").map((cookie) => ({ name: cookie.name, value: cookie.value ?? "" }));
    const { data } = await cookieClient(config, { getAll: () => parsed }).auth.getSession();
    token = data.session?.access_token ?? null;
  }
  if (!token) return null;
  const client = createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  return createSupabaseTipRepository(client);
}

/** Every active row, for the daily send. Needs the service role key on the server. */
export function senderTipAccess(env: Env = process.env) {
  const admin = getAdminSupabase(env);
  if (!admin) return null;
  return {
    repo: createSupabaseTipRepository(admin),
    /** The account's own sign-in address. Tips never go anywhere else. */
    emailFor: async (userId: string) => {
      const { data, error } = await admin.auth.admin.getUserById(userId);
      return error ? null : (data.user?.email ?? null);
    },
  };
}

export function siteUrl(env: Env = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim() || env.SITE_URL?.trim() || "https://www.lifezoi.com";
  return /^https:\/\/[^\s/]+/.test(raw) ? raw.replace(/\/$/, "") : "https://www.lifezoi.com";
}
