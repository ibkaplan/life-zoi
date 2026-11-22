import { requireMember } from "@/lib/auth/require-member";
import { getFeedbackRepository } from "@/lib/feedback/runtime";
import { feedbackBoard, memberAction } from "@/lib/feedback/service";
import { jsonError, readJson } from "@/lib/http";
import { msg } from "@/lib/i18n/translate";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Published reviews, the rating summary, announcements, and the member's own submissions. */
export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  try {
    const result = await feedbackBoard({ id: checked.member.id, isAdmin: checked.member.isAdmin }, getFeedbackRepository());
    return Response.json(result.body, { status: result.status, headers: NO_STORE });
  } catch {
    return Response.json({ error: msg("Reviews could not be loaded. Try again later.") }, { status: 503, headers: NO_STORE });
  }
}

/** Sends a review or a suggestion. Nothing a member sends is public until an administrator publishes it. */
export async function POST(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 12_000);
  if (!body.ok) return jsonError(body.error, body.status);
  if (!body.value || typeof body.value !== "object" || Array.isArray(body.value)) {
    return jsonError(msg("The request could not be read."), 400);
  }
  try {
    const result = await memberAction(
      { id: checked.member.id, isAdmin: checked.member.isAdmin },
      body.value as Record<string, unknown>,
      getFeedbackRepository(),
    );
    return Response.json(result.body, { status: result.status, headers: NO_STORE });
  } catch {
    return Response.json({ error: msg("Your feedback could not be saved. Nothing was lost on your side. Try again later.") }, { status: 503, headers: NO_STORE });
  }
}
