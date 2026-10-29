import { acceptedResponse, failureResponse, readJson, validationResponse } from "@/lib/http";
import { getScenario } from "@/lib/scenarios";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body.ok) return failureResponse(body.status, body.message);
    if (!body.value || typeof body.value !== "object") {
      return failureResponse(400, "Include a scenario.");
    }
    const raw = body.value as { scenarioId?: unknown; optionId?: unknown; note?: unknown };
    const scenario = typeof raw.scenarioId === "string" ? getScenario(raw.scenarioId) : undefined;
    if (!scenario || typeof raw.optionId !== "string" || !scenario.options.some((option) => option.id === raw.optionId)) {
      return validationResponse([{ field: "scenarioId", message: "Choose a listed scenario and change." }]);
    }
    const note = typeof raw.note === "string" ? raw.note.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim() : null;
    if (note === null || note.length > 280) {
      return validationResponse([{ field: "note", message: "Keep the note to 280 characters." }]);
    }
    return acceptedResponse();
  } catch {
    return failureResponse(400, "The scenario could not be checked.");
  }
}
