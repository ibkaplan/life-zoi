import { requireMember } from "@/lib/auth/require-member";
import { memberTipRepository } from "@/lib/daily-tip/runtime";
import { tipAction, tipState } from "@/lib/daily-tip/service";
import { jsonError, readJson } from "@/lib/http";
import { msg } from "@/lib/i18n/translate";
import { readMessagingConfig } from "@/lib/messaging/config";

const NO_STORE = { "Cache-Control": "private, no-store" };
const NO_ACCOUNT = msg("Daily tips need a signed-in account.");

/** The member's daily-tip choices and which channels this server can use. */
export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const repo = await memberTipRepository(request);
  if (!repo) return Response.json({ error: NO_ACCOUNT }, { status: 401, headers: NO_STORE });
  const result = await tipState(checked.member, repo, readMessagingConfig());
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}

/** Save choices, link or unlink Telegram, or stop the tips. Nothing is sent from here. */
export async function POST(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 4_000);
  if (!body.ok) return jsonError(body.error, body.status);
  if (!body.value || typeof body.value !== "object" || Array.isArray(body.value)) return jsonError(msg("The request could not be read."), 400);
  const repo = await memberTipRepository(request);
  if (!repo) return Response.json({ error: NO_ACCOUNT }, { status: 401, headers: NO_STORE });
  const result = await tipAction(checked.member, body.value as Record<string, unknown>, repo, readMessagingConfig());
  return Response.json(result.body, { status: result.status, headers: NO_STORE });
}
