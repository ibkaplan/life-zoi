import { NextResponse, type NextRequest } from "next/server";
import { bearerToken, memberFromCookies, type CookieWrite } from "@/lib/auth/session";
import { decideGate, isApiPath, isPublicPath } from "@/lib/auth/public-paths";
import { msg } from "@/lib/i18n/translate";

/**
 * The members-only gate. It runs on the server before any page or API answers.
 * Visitors can open only the public pages in `PUBLIC_PAGES`; every other page
 * redirects to sign-in, and every other API answers 401.
 * The members' layout and each API route check the sign-in again, and row level
 * security still guards the stored rows, so this is not the only check.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const pending: CookieWrite[] = [];

  // An API caller may send its own token instead of the cookie; the route verifies it.
  const apiWithToken = isApiPath(pathname) && bearerToken(request.headers.get("authorization")) !== null;
  const needsCheck = pathname === "/" || !isPublicPath(pathname);

  const state =
    needsCheck && !apiWithToken
      ? await memberFromCookies(
          {
            getAll: () => request.cookies.getAll(),
            setAll: (list) => {
              for (const cookie of list) {
                request.cookies.set(cookie.name, cookie.value);
                pending.push(cookie);
              }
            },
          },
          { quick: true },
        )
      : null;

  const decision = apiWithToken
    ? ({ kind: "next" } as const)
    : decideGate({ pathname, search, status: state?.status ?? "signed-out" });

  let response: NextResponse;
  if (decision.kind === "rewrite") {
    const url = request.nextUrl.clone();
    url.pathname = decision.pathname;
    response = NextResponse.rewrite(url, { request: { headers: request.headers } });
  } else if (decision.kind === "redirect") {
    response = NextResponse.redirect(new URL(decision.location, request.url));
  } else if (decision.kind === "deny") {
    response = NextResponse.json(
      {
        error:
          decision.status === 503
            ? msg("Account sign-in is not configured in this environment.")
            : msg("Sign in to use lifeZoi."),
      },
      { status: decision.status },
    );
  } else {
    response = NextResponse.next({ request: { headers: request.headers } });
  }

  for (const cookie of pending) {
    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);
  }
  if (!isPublicPath(pathname) || pathname === "/") {
    // Members' pages and answers are personal: never keep them in a shared cache.
    response.headers.set("Cache-Control", "private, no-store");
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except Next's own build files, the tab icon, and the landing-page images.
    "/((?!_next/static|_next/image|__nextjs|icon\\.svg|favicon\\.ico|home/).*)",
  ],
};
