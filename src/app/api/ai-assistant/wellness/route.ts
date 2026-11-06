import { jsonError, readJson } from "@/lib/http";
import { describeWellnessModel, handleWellnessRequest } from "@/lib/wellness-assistant/model/handle";

export async function GET() {
  return Response.json(describeWellnessModel());
}

export async function POST(request: Request) {
  const body = await readJson(request, 16_000);
  if (!body.ok) return jsonError(body.error, body.status);
  const result = await handleWellnessRequest(body.value);
  return Response.json(result.body, { status: result.status });
}
