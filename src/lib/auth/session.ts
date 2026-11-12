import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin-allowlist";
import { readPublicSupabaseConfig, type PublicSupabaseConfig } from "@/lib/supabase-config";

/**
 * Server-side sign-in checks. Every check uses the public anon key and the
 * caller's own Supabase session. None of them uses the service role.
 */

export type Member = { id: string; email: string; isAdmin: boolean };

export type MemberState =
  | { status: "member"; member: Member }
  | { status: "needs-mfa" }
  | { status: "signed-out" }
  | { status: "not-configured" };

export type CookieRecord = { name: string; value: string };
export type CookieWrite = { name: string; value: string; options?: Record<string, unknown> };

export type CookieAdapter = {
  getAll: () => CookieRecord[];
  /** Optional. A refreshed session is written back here when the caller can set cookies. */
  setAll?: (cookies: CookieWrite[]) => void;
};

type Env = Record<string, string | undefined>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function bearerToken(header: string | null | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (!match) return null;
  const token = match[1];
  if (token.length < 20 || token.length > 8192) return null;
  return token;
}

/** Reads a JWT payload without trusting it. Only call after Supabase has verified the token. */
export function jwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

type FactorList = { status?: string }[] | null | undefined;

/**
 * A person with a confirmed authenticator app must finish the 6-digit step (AAL2)
 * before they count as signed in. The database rows follow the same rule.
 */
export function stateFor(
  user: { id?: string | null; email?: string | null; factors?: FactorList } | null | undefined,
  aal: unknown,
): MemberState {
  if (!user?.id || !UUID.test(user.id) || !user.email) return { status: "signed-out" };
  const hasFactor = (user.factors ?? []).some((factor) => factor?.status === "verified");
  if (hasFactor && aal !== "aal2") return { status: "needs-mfa" };
  return { status: "member", member: { id: user.id, email: user.email, isAdmin: isAdminEmail(user.email) } };
}

function anonClient(config: PublicSupabaseConfig) {
  return createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Confirms an access token with Supabase Auth. Network call; authoritative. */
export async function verifyAccessToken(token: string, env: Env = process.env): Promise<MemberState> {
  const config = readPublicSupabaseConfig(env);
  if (!config) return { status: "not-configured" };
  try {
    const { data, error } = await anonClient(config).auth.getUser(token);
    if (error || !data.user) return { status: "signed-out" };
    return stateFor(data.user, jwtPayload(token)?.aal);
  } catch {
    return { status: "signed-out" };
  }
}

export function cookieClient(config: PublicSupabaseConfig, cookies: CookieAdapter) {
  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => cookies.getAll(),
      setAll: (list) => {
        try {
          cookies.setAll?.(list);
        } catch {
          // Server components cannot set cookies. The proxy refreshes them first.
        }
      },
    },
  });
}

/**
 * Reads the sign-in cookie.
 * `quick` verifies the token signature and expiry (locally when the project uses
 * asymmetric signing keys) and is used by the proxy on every request.
 * Otherwise the token is confirmed with Supabase Auth, which also sees a revoked login.
 */
export async function memberFromCookies(
  cookies: CookieAdapter,
  options: { env?: Env; quick?: boolean } = {},
): Promise<MemberState> {
  const config = readPublicSupabaseConfig(options.env ?? process.env);
  if (!config) return { status: "not-configured" };
  if (!cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"))) return { status: "signed-out" };
  try {
    const supabase = cookieClient(config, cookies);
    if (!options.quick) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return { status: "signed-out" };
      return verifyAccessToken(token, options.env ?? process.env);
    }
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) return { status: "signed-out" };
    const claims = data.claims as Record<string, unknown>;
    const id = typeof claims.sub === "string" ? claims.sub : "";
    const email = typeof claims.email === "string" ? claims.email : "";
    if (claims.aal === "aal2") return stateFor({ id, email, factors: [] }, "aal2");
    // AAL1: the stored session lists the account's factors. The database still
    // refuses rows to an AAL1 session when a factor is verified.
    const session = await supabase.auth.getSession();
    return stateFor({ id, email, factors: session.data.session?.user?.factors as FactorList }, claims.aal);
  } catch {
    return { status: "signed-out" };
  }
}

/** For route handlers: a bearer token if the caller sent one, otherwise the sign-in cookie. */
export async function memberFromRequest(request: Request, env: Env = process.env): Promise<MemberState> {
  const token = bearerToken(request.headers.get("authorization"));
  if (token) return verifyAccessToken(token, env);
  const header = request.headers.get("cookie") ?? "";
  const parsed = parseCookieHeader(header).map((cookie) => ({ name: cookie.name, value: cookie.value ?? "" }));
  return memberFromCookies({ getAll: () => parsed }, { env });
}
