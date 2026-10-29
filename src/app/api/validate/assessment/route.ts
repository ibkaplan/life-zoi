import { parseAnswers, validateComplete } from "@/lib/assessment";
import { acceptedResponse, failureResponse, readJson, validationResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body.ok) return failureResponse(body.status, body.message);
    if (!body.value || typeof body.value !== "object" || !("answers" in body.value)) {
      return failureResponse(400, "Include the assessment answers.");
    }
    const parsed = parseAnswers((body.value as { answers: unknown }).answers);
    if (!parsed.ok) return validationResponse(parsed.errors);
    const complete = validateComplete(parsed.answers);
    if (!complete.ok) return validationResponse(complete.errors);
    return acceptedResponse();
  } catch {
    return failureResponse(400, "The assessment could not be checked.");
  }
}
