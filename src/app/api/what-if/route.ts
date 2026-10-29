import { jsonError, readJson } from "@/lib/http";
import { buildScenario } from "@/lib/scenarios";
import { validateScenarioRequest } from "@/lib/validation";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body.ok) return jsonError(body.error, body.status);
  const parsed = validateScenarioRequest(body.value);
  if (!parsed.ok) {
    return jsonError("Check the scenario and try again.", 400, parsed.fields);
  }
  try {
    return Response.json(
      buildScenario(parsed.habitId, parsed.assessment, parsed.note),
    );
  } catch {
    return jsonError("The illustration could not be prepared.", 500);
  }
}
