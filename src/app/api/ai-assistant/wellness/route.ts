import { requireMember } from "@/lib/auth/require-member";
import { jsonError, readJson } from "@/lib/http";
import { describeWellnessModel, handleWellnessRequest } from "@/lib/wellness-assistant/model/handle";

export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  return Response.json(describeWellnessModel());
}

/** Members only, so the free Gemini quota is used only by signed-in members. */
export async function POST(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 16_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const result = await handleWellnessRequest(body.value);
  return Response.json(result.body, { status: result.status });
}
