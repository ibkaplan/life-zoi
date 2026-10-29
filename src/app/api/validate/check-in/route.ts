import { isValidDateISO } from "@/lib/dates";
import { acceptedResponse, failureResponse, readJson, validationResponse } from "@/lib/http";

const STATUSES = new Set(["done", "partial", "skipped"]);

export async function POST(request: Request) {
  try {
    const body = await readJson(request);
    if (!body.ok) return failureResponse(body.status, body.message);
    if (!body.value || typeof body.value !== "object") {
      return failureResponse(400, "Include a check-in.");
    }
    const raw = body.value as { goalId?: unknown; date?: unknown; status?: unknown; note?: unknown; today?: unknown };
    const errors = [];
    if (typeof raw.goalId !== "string" || raw.goalId.length < 8 || raw.goalId.length > 80) {
      errors.push({ field: "goalId", message: "Choose one of your habits." });
    }
    if (typeof raw.date !== "string" || !isValidDateISO(raw.date)) {
      errors.push({ field: "date", message: "Choose a real day." });
    }
    if (typeof raw.today !== "string" || !isValidDateISO(raw.today) || (typeof raw.date === "string" && raw.date > raw.today)) {
      errors.push({ field: "date", message: "Choose today or an earlier day." });
    }
    if (typeof raw.status !== "string" || !STATUSES.has(raw.status)) {
      errors.push({ field: "status", message: "Mark the day as done, partial, or skipped." });
    }
    const note = typeof raw.note === "string" ? raw.note.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim() : null;
    if (note === null || note.length > 280) {
      errors.push({ field: "note", message: "Keep the note to 280 characters." });
    }
    if (errors.length > 0) return validationResponse(errors);
    return acceptedResponse();
  } catch {
    return failureResponse(400, "The check-in could not be checked.");
  }
}
