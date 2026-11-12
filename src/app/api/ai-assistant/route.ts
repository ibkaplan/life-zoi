import { requireMember } from "@/lib/auth/require-member";
import { describeAssistant, handleAssistantRequest } from "@/lib/ai/handle-request";
import { jsonError, readJson } from "@/lib/http";

export async function GET(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  return Response.json(describeAssistant());
}

export async function POST(request: Request) {
  const checked = await requireMember(request);
  if (!checked.ok) return checked.response;
  const body = await readJson(request, 32_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const result = await handleAssistantRequest(body.value);
  return Response.json(result.body, { status: result.status });
}
