import { WELLNESS_COACH_PATH, type CombPart, type HabitId } from "@/lib/habit-transformation/catalog";

export { WELLNESS_COACH_PATH };

export type WellnessCoachRequest = {
  source: "habit-transformation";
  habitId: HabitId;
  barrier: CombPart | "unspecified";
  smallAction: string;
};

export type CoachInput = {
  habitId: HabitId;
  habitName: string;
  barrier: CombPart | null;
  barrierLabel: string;
  smallAction: string;
  easierAction: string;
};

const PART: Record<CombPart, string> = {
  capability: "Capability",
  opportunity: "Opportunity",
  motivation: "Motivation",
};

export function toWellnessCoachRequest(input: CoachInput): WellnessCoachRequest {
  return {
    source: "habit-transformation",
    habitId: input.habitId,
    barrier: input.barrier ?? "unspecified",
    smallAction: input.smallAction,
  };
}

export function ruleCoachNote(input: CoachInput): string {
  const part = input.barrier ? PART[input.barrier] : "No single part";
  return `${part} may be the tight spot for ${input.habitName}. One small action is: ${input.smallAction}. On a hard day: ${input.easierAction}. This note is educational. It is not a diagnosis, and it is not clinically validated.`;
}

export async function readWellnessCoach(
  request: WellnessCoachRequest,
  fetchImpl: typeof fetch,
): Promise<string | null> {
  const response = await fetchImpl(WELLNESS_COACH_PATH, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) return null;
  const body: unknown = await response.json();
  if (!body || typeof body !== "object") return null;
  const note = (body as { note?: unknown }).note;
  if (typeof note !== "string") return null;
  const trimmed = note.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 500);
  return trimmed || null;
}

/**
 * Rule-based coach. Pass allowRoute only when /api/ai-assistant/wellness exists.
 * This app does not add another model, a key, or billing.
 */
export async function coachNote(
  input: CoachInput,
  options?: { fetchImpl?: typeof fetch; allowRoute?: boolean },
): Promise<{ text: string; via: "rules" | "wellness" }> {
  if (options?.allowRoute && options.fetchImpl) {
    try {
      const note = await readWellnessCoach(toWellnessCoachRequest(input), options.fetchImpl);
      if (note) return { text: note, via: "wellness" };
    } catch {
      // The route is absent or unreachable. Stay with the rules.
    }
  }
  return { text: ruleCoachNote(input), via: "rules" };
}
