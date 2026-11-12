/**
 * The only addresses a visitor can open without signing in.
 * Everything else, pages and APIs alike, needs a signed-in member.
 * Keep this list short. A new page is members-only unless it is added here.
 */
export const PUBLIC_PAGES = ["/", "/sign-in", "/reset-password", "/accept-invite", "/welcome", "/privacy"] as const;

export const PUBLIC_APIS = ["/api/status", "/api/register"] as const;

/** Images the public landing page shows. */
export const PUBLIC_ASSET_PREFIXES = ["/home/"] as const;

/** Where "/" is served from for a signed-in member. The address bar keeps "/". */
export const MEMBER_HOME = "/home";

function trimSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function isApiPath(pathname: string): boolean {
  return pathname === "/api" || pathname.startsWith("/api/");
}

export function isPublicPath(pathname: string): boolean {
  const path = trimSlash(pathname);
  if ((PUBLIC_PAGES as readonly string[]).includes(path)) return true;
  if ((PUBLIC_APIS as readonly string[]).includes(path)) return true;
  return PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * A same-site path to return to after sign-in, or null.
 * Refuses other sites, protocol-relative links, and the sign-in pages themselves.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 512) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\\]/.test(value)) return null;
  let parsed: URL;
  try {
    parsed = new URL(value, "https://lifezoi.invalid");
  } catch {
    return null;
  }
  if (parsed.origin !== "https://lifezoi.invalid") return null;
  const path = trimSlash(parsed.pathname);
  if (["/sign-in", "/reset-password", "/accept-invite", MEMBER_HOME].includes(path)) return null;
  if (isApiPath(path)) return null;
  return `${parsed.pathname}${parsed.search}`;
}

export function signInLocation(pathname: string, search = ""): string {
  const next = safeNextPath(`${pathname}${search}`);
  return next && next !== "/" ? `/sign-in?next=${encodeURIComponent(next)}` : "/sign-in";
}

export type SignInStatus = "member" | "needs-mfa" | "signed-out" | "not-configured";

export type GateDecision =
  | { kind: "next" }
  | { kind: "rewrite"; pathname: string }
  | { kind: "redirect"; location: string }
  | { kind: "deny"; status: 401 | 503 };

/** What the proxy does with one request. Pure, so every rule is unit tested. */
export function decideGate(input: { pathname: string; search?: string; status: SignInStatus }): GateDecision {
  const { pathname, status } = input;
  const member = status === "member";
  const path = trimSlash(pathname);
  if (path === "/") return member ? { kind: "rewrite", pathname: MEMBER_HOME } : { kind: "next" };
  if (isPublicPath(pathname)) return { kind: "next" };
  if (member) return { kind: "next" };
  if (isApiPath(pathname)) return { kind: "deny", status: status === "not-configured" ? 503 : 401 };
  if (path === MEMBER_HOME) return { kind: "redirect", location: "/sign-in" };
  return { kind: "redirect", location: signInLocation(pathname, input.search ?? "") };
}
