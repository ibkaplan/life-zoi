import type { Assessment, ReassessDays } from "@/lib/types";
import { personalProfile } from "@/lib/outlook";
import { validateComplete } from "@/lib/validation";

export type PlanAction = {
  area: string;
  weekly: string;
  kind: "user-reported";
};

const ACTIONS: Record<string, PlanAction> = {
  "Vegetables or fruit": {
    area: "Nutrition",
    weekly: "Add one vegetable or fruit you already like, on three days.",
    kind: "user-reported",
  },
  Fiber: {
    area: "Nutrition",
    weekly: "Add one small fiber food and the fluids you are allowed.",
    kind: "user-reported",
  },
  Movement: {
    area: "Movement",
    weekly: "Take two short walks or chair breaks. No fixed distance.",
    kind: "user-reported",
  },
  Sleep: {
    area: "Sleep",
    weekly: "Keep one wind-down cue on four evenings.",
    kind: "user-reported",
  },
  Stress: {
    area: "Stress",
    weekly: "Try one calm practice for a few minutes on three days.",
    kind: "user-reported",
  },
  "Social connection": {
    area: "Social connection",
    weekly: "Send one message or share one meal.",
    kind: "user-reported",
  },
  Tobacco: {
    area: "Healthy aging",
    weekly: "Open a free public quit page once, or write the cue that shows up.",
    kind: "user-reported",
  },
  Alcohol: {
    area: "Healthy aging",
    weekly: "Choose one occasion to drink less or skip it.",
    kind: "user-reported",
  },
};

export function improvementPlan(assessment: Assessment | null): PlanAction[] {
  const parsed = assessment ? validateComplete(assessment) : null;
  const profile = personalProfile(parsed && parsed.ok ? parsed.value : null);
  const chosen = profile.opportunities
    .map((topic) => ACTIONS[topic])
    .filter((item): item is PlanAction => Boolean(item))
    .slice(0, 4);
  const outdoors: PlanAction = {
    area: "Outdoors",
    weekly: "Spend a few minutes at a window, bench, balcony, or outside. Rest counts.",
    kind: "user-reported",
  };
  const goals: PlanAction = {
    area: "Personal goals",
    weekly: assessment?.habitNote
      ? `Return to your note: ${assessment.habitNote}`
      : "Write one thing you want this season to make easier.",
    kind: "user-reported",
  };
  return [...chosen, outdoors, goals].slice(0, 6);
}

export function habitDelta(current: Assessment, previous: Assessment | null) {
  if (!previous) return [];
  const fields: { label: string; before: string; after: string; kind: "user-reported" }[] = [
    { label: "Sleep hours", before: previous.sleepHours, after: current.sleepHours, kind: "user-reported" },
    { label: "Activity days", before: previous.activityDays, after: current.activityDays, kind: "user-reported" },
    { label: "Vegetables or fruit", before: previous.vegetables, after: current.vegetables, kind: "user-reported" },
    { label: "Stress", before: previous.stress, after: current.stress, kind: "user-reported" },
    { label: "Tobacco", before: previous.smoking, after: current.smoking, kind: "user-reported" },
    {
      label: "Blood pressure text",
      before: previous.bloodPressure,
      after: current.bloodPressure,
      kind: "user-reported",
    },
  ];
  return fields.filter((field) => field.before !== field.after);
}

export function reassessDue(startedOn: string, days: ReassessDays | 0, today: string) {
  if (!startedOn || days === 0) return false;
  const [year, month, day] = startedOn.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const start = Date.UTC(year, month - 1, day);
  const now = Date.UTC(ty, tm - 1, td);
  return Math.round((now - start) / 86400000) >= days;
}
