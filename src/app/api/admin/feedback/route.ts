import { requireAdmin } from "@/lib/auth/require-member";
import { getFeedbackRepository } from "@/lib/feedback/runtime";
import { adminAction, adminOverview } from "@/lib/feedback/service";
import { jsonError, readJson } from "@/lib/http";
import { msg } from "@/lib/i18n/translate";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Administrator only: every review and suggestion, private notes, and the analytics overview. */
export async function GET(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  try {
    const result = await adminOverview({ id: checked.member.id, isAdmin: checked.member.isAdmin }, getFeedbackRepository());
    return Response.json(result.body, { status: result.status, headers: NO_STORE });
  } catch {
    return Response.json({ error: msg("Feedback could not be loaded. Try again later.") }, { status: 503, headers: NO_STORE });
  }
}

/** Administrator only: publish, hide, restore, flag, note, categorize, change status, delete, and announcements. */
export async function POST(request: Request) {
  const checked = await requireAdmin(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 8_000);
  if (!body.ok) return jsonError(body.error, body.status);
  if (!body.value || typeof body.value !== "object" || Array.isArray(body.value)) {
    return jsonError(msg("The request could not be read."), 400);
  }
  try {
    const result = await adminAction(
      { id: checked.member.id, isAdmin: checked.member.isAdmin },
      body.value as Record<string, unknown>,
      getFeedbackRepository(),
    );
    return Response.json(result.body, { status: result.status, headers: NO_STORE });
  } catch {
    return Response.json({ error: msg("That change could not be saved. Try again later.") }, { status: 503, headers: NO_STORE });
  }
}
