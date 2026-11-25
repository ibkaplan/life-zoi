import { getChallengeRepository } from "@/lib/email-challenge/runtime";
import { unsubscribeByToken } from "@/lib/email-challenge/service";
import { jsonError } from "@/lib/http";
import { msg } from "@/lib/i18n/translate";

/**
 * Public. Stops the challenge emails and deletes the address.
 * Takes the token from the query (mail apps' one-click button, RFC 8058, posts
 * "List-Unsubscribe=One-Click") or from a JSON body (the stop page's button).
 * Only POST; a GET never unsubscribes, so link scanners cannot.
 */
export async function POST(request: Request) {
  let token: unknown = new URL(request.url).searchParams.get("token");
  if (!token && (request.headers.get("content-type") ?? "").includes("application/json")) {
    try {
      const text = await request.text();
      if (text.length <= 500) token = (JSON.parse(text) as { token?: unknown })?.token;
    } catch {
      token = undefined;
    }
  }
  try {
    const result = await unsubscribeByToken(token, getChallengeRepository().repo);
    return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError(msg("That did not work. Try again later."), 503);
  }
}
