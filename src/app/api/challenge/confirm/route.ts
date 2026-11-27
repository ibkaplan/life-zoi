import { getChallengeRepository } from "@/lib/email-challenge/runtime";
import { confirmByToken } from "@/lib/email-challenge/service";
import { jsonError, readJson } from "@/lib/http";
import { msg } from "@/lib/i18n/translate";

/** Public. The confirmation link's button posts its token here. A GET never confirms, so link scanners cannot. */
export async function POST(request: Request) {
  const body = await readJson(request, 500);
  if (!body.ok) return jsonError(body.error, body.status);
  const token = body.value && typeof body.value === "object" ? (body.value as { token?: unknown }).token : undefined;
  try {
    const result = await confirmByToken(token, getChallengeRepository().repo, new Date());
    return Response.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return jsonError(msg("That did not work. Try again later."), 503);
  }
}
