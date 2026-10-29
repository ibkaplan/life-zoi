import { jsonError, readJson } from "@/lib/http";
import { buildRecommendations } from "@/lib/recommendations";
import { validateComplete } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body.ok) return jsonError(body.error, body.status);
  const record =
    body.value && typeof body.value === "object"
      ? (body.value as { assessment?: unknown }).assessment
      : undefined;
  const parsed = validateComplete(record);
  if (!parsed.ok) {
    return jsonError("Check the assessment and try again.", 400, parsed.fields);
  }
  try {
    return Response.json(buildRecommendations(parsed.value));
  } catch {
    return jsonError("The suggestion could not be prepared.", 500);
  }
}
