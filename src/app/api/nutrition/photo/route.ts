import { requireMember } from "@/lib/auth/require-member";
import { jsonError, readJson } from "@/lib/http";
import {
  parsePhotoBody,
  PHOTO_LIMITS,
  PHOTO_MAX_BASE64,
  PHOTO_NOT_CONFIGURED,
  PHOTO_QUOTA,
  recognisePlate,
  takePhotoTurn,
} from "@/lib/calories/photo";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** Whether photo recognition is switched on (the server has GEMINI_API_KEY). The key itself never leaves the server. */
export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const configured = Boolean(process.env.GEMINI_API_KEY?.trim());
  return Response.json({ configured, limits: PHOTO_LIMITS, notice: configured ? null : PHOTO_NOT_CONFIGURED }, { headers: NO_STORE });
}

/** Members only. The photo is read in memory, sent to the free Gemini tier, and dropped when the reply is sent. */
export async function POST(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const apiKey = process.env.GEMINI_API_KEY?.trim() ?? "";
  if (!apiKey) return Response.json({ ok: false, reason: "not-configured", message: PHOTO_NOT_CONFIGURED }, { headers: NO_STORE });
  const body = await readJson(request, PHOTO_MAX_BASE64 + 2_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const parsed = parsePhotoBody(body.value);
  if (!parsed.ok) return jsonError(parsed.error, 400);
  if (!takePhotoTurn(checked.member.id)) {
    return Response.json({ ok: false, reason: "quota", message: PHOTO_QUOTA }, { headers: NO_STORE });
  }
  const result = await recognisePlate(parsed.input, apiKey);
  return Response.json(result, { headers: NO_STORE });
}
