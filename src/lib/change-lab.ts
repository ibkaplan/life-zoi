import { containsProhibitedClaim } from "@/lib/claims";

export const CHANGE_LAB_KEY = "lifezoi.change-lab.v1";

export const EXPERIMENTS = [
  {
    id: "sugar",
    title: "Reduce sugary drinks",
    summary: "Swap one sugary drink a day for water or an unsweetened drink.",
  },
  {
    id: "sleep",
    title: "Improve a sleep routine",
    summary: "Keep a steadier wind-down and wake time for the length of the experiment.",
  },
  {
    id: "walk",
    title: "Walk more often",
    summary: "Add a short walk on the days you choose. Any amount you can repeat counts.",
  },
  {
    id: "fiber",
    title: "Increase dietary fiber",
    summary: "Add one fiber-rich food you already tolerate, such as beans, oats, fruit, or vegetables.",
  },
  {
    id: "balance",
    title: "Practice balance exercises",
    summary: "Practice near a sturdy support, and stop if you feel unsteady.",
  },
  {
    id: "strength",
    title: "Add strength exercises",
    summary: "Use a familiar movement, such as sit-to-stand, on two days you choose.",
  },
  {
    id: "sedentary",
    title: "Reduce sedentary time",
    summary: "Stand up or move for a minute after long sitting periods.",
  },
  {
    id: "stress",
    title: "Practice stress reduction",
    summary: "Repeat one short calming practice, such as slow breathing or a quiet walk.",
  },
] as const;

export type ExperimentId = (typeof EXPERIMENTS)[number]["id"];

export const BASELINE_FIELDS = [
  {
    id: "sleep",
    label: "Sleep lately",
    options: [
      ["short", "Often under a full night"],
      ["mixed", "It varies"],
      ["steady", "Usually a steady night"],
    ],
  },
  {
    id: "activity",
    label: "Walking and activity",
    options: [
      ["rare", "Rarely"],
      ["some", "Some days"],
      ["most", "Most days"],
    ],
  },
  {
    id: "mood",
    label: "Mood lately",
    options: [
      ["low", "Often low"],
      ["mixed", "Up and down"],
      ["steady", "Mostly steady"],
    ],
  },
  {
    id: "sugar",
    label: "Sugary drinks",
    options: [
      ["often", "Most days"],
      ["sometimes", "Some days"],
      ["rarely", "Rarely"],
    ],
  },
  {
    id: "fiber",
    label: "Fiber-rich foods",
    options: [
      ["rare", "Rarely"],
      ["some", "Some days"],
      ["most", "Most days"],
    ],
  },
  {
    id: "sedentary",
    label: "Long sitting stretches",
    options: [
      ["often", "Often"],
      ["some", "Some days"],
      ["rare", "Rarely"],
    ],
  },
] as const;

export type FieldId = (typeof BASELINE_FIELDS)[number]["id"];

export type Measurement = {
  id: string;
  kind: string;
  value: number;
  unit: string;
  measuredOn: string;
};

export type CheckIn = {
  date: string;
  done: boolean;
  note: string;
};

export type ChangeLabState = {
  step: number;
  baseline: Partial<Record<FieldId, string>>;
  goals: string[];
  experimentId: ExperimentId | "";
  duration: 7 | 30;
  checkIns: CheckIn[];
  followUp: Partial<Record<FieldId, string>> | null;
  baselineMeasurements: Measurement[];
  followUpMeasurements: Measurement[];
};

export function emptyChangeLab(): ChangeLabState {
  return {
    step: 0,
    baseline: {},
    goals: [],
    experimentId: "",
    duration: 7,
    checkIns: [],
    followUp: null,
    baselineMeasurements: [],
    followUpMeasurements: [],
  };
}

function cleanChoice(fieldId: FieldId, value: unknown): string {
  const field = BASELINE_FIELDS.find((item) => item.id === fieldId);
  if (!field || typeof value !== "string") return "";
  return field.options.some((option) => option[0] === value) ? value : "";
}

function cleanMeasurements(value: unknown): Measurement[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item): Measurement | null => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== "string" || !/^[A-Za-z0-9-]{8,80}$/.test(row.id)) return null;
      if (typeof row.kind !== "string" || row.kind.length > 40) return null;
      if (typeof row.unit !== "string" || row.unit.length > 24) return null;
      if (typeof row.measuredOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.measuredOn)) return null;
      if (typeof row.value !== "number" || !Number.isFinite(row.value)) return null;
      return {
        id: row.id,
        kind: row.kind,
        value: row.value,
        unit: row.unit,
        measuredOn: row.measuredOn,
      };
    })
    .filter((item): item is Measurement => item !== null)
    .slice(0, 40);
}

export function sanitizeChangeLab(input: unknown): ChangeLabState {
  if (!input || typeof input !== "object") return emptyChangeLab();
  const row = input as Record<string, unknown>;
  const baseline: ChangeLabState["baseline"] = {};
  const source = row.baseline && typeof row.baseline === "object" ? (row.baseline as Record<string, unknown>) : {};
  for (const field of BASELINE_FIELDS) {
    const choice = cleanChoice(field.id, source[field.id]);
    if (choice) baseline[field.id] = choice;
  }
  const goals = Array.isArray(row.goals)
    ? row.goals.filter((goal): goal is string => typeof goal === "string").map((goal) => goal.slice(0, 40)).slice(0, 8)
    : [];
  const experimentId = EXPERIMENTS.some((item) => item.id === row.experimentId)
    ? (row.experimentId as ExperimentId)
    : "";
  const duration = row.duration === 30 ? 30 : 7;
  const step = typeof row.step === "number" && row.step >= 0 && row.step <= 6 ? Math.floor(row.step) : 0;
  const checkIns = Array.isArray(row.checkIns)
    ? row.checkIns
        .map((item): CheckIn | null => {
          if (!item || typeof item !== "object") return null;
          const check = item as Record<string, unknown>;
          if (typeof check.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(check.date)) return null;
          if (typeof check.done !== "boolean") return null;
          const note = typeof check.note === "string" ? check.note.replace(/[\u0000-\u001F]/g, "").slice(0, 240) : "";
          return { date: check.date, done: check.done, note };
        })
        .filter((item): item is CheckIn => item !== null)
        .slice(0, 40)
    : [];
  let followUp: ChangeLabState["followUp"] = null;
  if (row.followUp && typeof row.followUp === "object") {
    followUp = {};
    const follow = row.followUp as Record<string, unknown>;
    for (const field of BASELINE_FIELDS) {
      const choice = cleanChoice(field.id, follow[field.id]);
      if (choice) followUp[field.id] = choice;
    }
  }
  return {
    step,
    baseline,
    goals,
    experimentId,
    duration,
    checkIns,
    followUp,
    baselineMeasurements: cleanMeasurements(row.baselineMeasurements),
    followUpMeasurements: cleanMeasurements(row.followUpMeasurements),
  };
}

export function fieldLabel(fieldId: FieldId, value: string): string {
  const field = BASELINE_FIELDS.find((item) => item.id === fieldId);
  return field?.options.find((option) => option[0] === value)?.[1] ?? "Not answered";
}

export function buildPlan(experimentId: ExperimentId, duration: 7 | 30): string[] {
  const experiment = EXPERIMENTS.find((item) => item.id === experimentId);
  const focus = experiment?.summary ?? "Repeat one small habit you chose.";
  const days = Array.from({ length: duration }, (_, index) => {
    const day = index + 1;
    if (index % 7 === 6) {
      return `Day ${day}: Look back at the week. Note what was workable. Skip any day that does not feel safe.`;
    }
    return `Day ${day}: ${focus} This is practice, not a treatment.`;
  });
  const problem = containsProhibitedClaim(days.join(" "));
  if (problem) return ["The plan was withheld because the wording did not stay educational."];
  return days;
}

export type ComparisonRow = {
  label: string;
  before: string;
  after: string;
  kind: "entered" | "missing";
};

export function compareChangeLab(state: ChangeLabState): ComparisonRow[] {
  const rows: ComparisonRow[] = BASELINE_FIELDS.map((field) => {
    const before = state.baseline[field.id];
    const after = state.followUp?.[field.id];
    return {
      label: field.label,
      before: before ? fieldLabel(field.id, before) : "Not entered",
      after: after ? fieldLabel(field.id, after) : "Not entered yet",
      kind: before || after ? "entered" : "missing",
    };
  });
  const kinds = new Set([
    ...state.baselineMeasurements.map((item) => item.kind),
    ...state.followUpMeasurements.map((item) => item.kind),
  ]);
  for (const kind of kinds) {
    const before = state.baselineMeasurements.find((item) => item.kind === kind);
    const after = state.followUpMeasurements.find((item) => item.kind === kind);
    rows.push({
      label: kind,
      before: before ? `${before.value} ${before.unit} on ${before.measuredOn}` : "Not entered",
      after: after ? `${after.value} ${after.unit} on ${after.measuredOn}` : "Not entered yet",
      kind: "entered",
    });
  }
  return rows;
}

export function encouragement(doneCount: number, duration: number): string {
  if (doneCount <= 0) return "No check-in is marked yet. You can start with today.";
  if (doneCount >= duration) return `You marked all ${duration} days. That is a record of practice, not a health outcome.`;
  return `You marked ${doneCount} of ${duration} days. A missed day is part of learning, not a failure.`;
}

export function habitJourneySummary(state: ChangeLabState): string {
  const done = state.checkIns.filter((item) => item.done).length;
  return `Health Habits Journey: ${done} practice day${done === 1 ? "" : "s"} marked in this experiment. This is not a biological age and it is not a medical score.`;
}

const listeners = new Set<() => void>();
let clientState: ChangeLabState | null = null;

export function subscribeChangeLab(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getChangeLab(): ChangeLabState {
  if (typeof window === "undefined") return emptyChangeLab();
  if (!clientState) {
    try {
      clientState = sanitizeChangeLab(JSON.parse(window.sessionStorage.getItem(CHANGE_LAB_KEY) ?? "null"));
    } catch {
      clientState = emptyChangeLab();
    }
  }
  return clientState;
}

export function getChangeLabServer(): ChangeLabState {
  return emptyChangeLab();
}

export function writeChangeLab(next: ChangeLabState) {
  const clean = sanitizeChangeLab(next);
  clientState = clean;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(CHANGE_LAB_KEY, JSON.stringify(clean));
  }
  listeners.forEach((listener) => listener());
}

export function clearChangeLab(storage: Pick<Storage, "removeItem"> | null) {
  storage?.removeItem(CHANGE_LAB_KEY);
  clientState = emptyChangeLab();
  listeners.forEach((listener) => listener());
}
