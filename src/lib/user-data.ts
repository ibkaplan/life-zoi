import { parseAnswers, validateComplete, type Answers } from "@/lib/assessment";
import { compareDateISO, isValidDateISO } from "@/lib/dates";
import { getScenario } from "@/lib/scenarios";

export type Profile = { displayName: string };

export type AssessmentRecord = {
  id: string;
  completedAt: string;
  answers: Answers;
};

export type SavedScenario = {
  id: string;
  scenarioId: string;
  optionId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};

export type HabitCadence = "daily" | "most-days" | "weekly";

export type HabitGoal = {
  id: string;
  title: string;
  detail: string;
  cadence: HabitCadence;
  sourceScenarioId: string | null;
  createdAt: string;
  archivedAt: string | null;
};

export type CheckInStatus = "done" | "partial" | "skipped";

export type CheckIn = {
  id: string;
  goalId: string;
  date: string;
  status: CheckInStatus;
  note: string;
  updatedAt: string;
};

export type UserData = {
  version: 1;
  profile: Profile;
  draft: { step: number; answers: Answers; updatedAt: string } | null;
  assessments: AssessmentRecord[];
  scenarios: SavedScenario[];
  goals: HabitGoal[];
  checkIns: CheckIn[];
};

export type FieldError = { field: string; message: string };

const NOTE_MAX = 280;
const NAME_MAX = 40;
const TITLE_MAX = 80;
const DETAIL_MAX = 180;

export function createEmptyUserData(): UserData {
  return {
    version: 1,
    profile: { displayName: "" },
    draft: null,
    assessments: [],
    scenarios: [],
    goals: [],
    checkIns: [],
  };
}

function cleanText(value: unknown, max: number, allowEmpty: boolean): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  if (trimmed.length > max) return null;
  if (!allowEmpty && trimmed.length === 0) return null;
  return trimmed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseStoredUserData(input: unknown): { ok: true; data: UserData } | { ok: false; errors: FieldError[] } {
  if (!isRecord(input) || input.version !== 1) {
    return { ok: false, errors: [{ field: "version", message: "Saved notes are not a supported lifeZoi file." }] };
  }
  if ("sample" in input) {
    return { ok: false, errors: [{ field: "sample", message: "Sample data cannot be stored as your notes." }] };
  }
  const empty = createEmptyUserData();
  const profileName = isRecord(input.profile) ? cleanText(input.profile.displayName ?? "", NAME_MAX, true) : null;
  if (profileName === null) {
    return { ok: false, errors: [{ field: "displayName", message: "The saved name could not be read." }] };
  }
  empty.profile.displayName = profileName;

  if (input.draft !== null && input.draft !== undefined) {
    if (!isRecord(input.draft) || typeof input.draft.updatedAt !== "string") {
      return { ok: false, errors: [{ field: "draft", message: "The saved draft could not be read." }] };
    }
    const parsed = parseAnswers(input.draft.answers);
    if (!parsed.ok || typeof input.draft.step !== "number" || input.draft.step < 0 || input.draft.step > 8) {
      return { ok: false, errors: [{ field: "draft", message: "The saved draft could not be read." }] };
    }
    empty.draft = { step: input.draft.step, answers: parsed.answers, updatedAt: input.draft.updatedAt };
  }

  if (!Array.isArray(input.assessments) || input.assessments.length > 50) {
    return { ok: false, errors: [{ field: "assessments", message: "Saved assessments could not be read." }] };
  }
  for (const item of input.assessments) {
    if (!isRecord(item) || typeof item.id !== "string" || typeof item.completedAt !== "string" || "sample" in item) {
      return { ok: false, errors: [{ field: "assessments", message: "Saved assessments could not be read." }] };
    }
    const parsed = parseAnswers(item.answers);
    const complete = parsed.ok ? validateComplete(parsed.answers) : parsed;
    if (!parsed.ok || !complete.ok) {
      return { ok: false, errors: [{ field: "assessments", message: "Saved assessments could not be read." }] };
    }
    empty.assessments.push({ id: item.id, completedAt: item.completedAt, answers: parsed.answers });
  }

  if (!Array.isArray(input.scenarios) || input.scenarios.length > 40) {
    return { ok: false, errors: [{ field: "scenarios", message: "Saved scenarios could not be read." }] };
  }
  for (const item of input.scenarios) {
    if (!isRecord(item) || "sample" in item) {
      return { ok: false, errors: [{ field: "scenarios", message: "Saved scenarios could not be read." }] };
    }
    const scenario = typeof item.scenarioId === "string" ? getScenario(item.scenarioId) : undefined;
    const note = cleanText(item.note ?? "", NOTE_MAX, true);
    if (
      !scenario ||
      typeof item.id !== "string" ||
      typeof item.optionId !== "string" ||
      !scenario.options.some((option) => option.id === item.optionId) ||
      note === null ||
      typeof item.createdAt !== "string" ||
      typeof item.updatedAt !== "string"
    ) {
      return { ok: false, errors: [{ field: "scenarios", message: "Saved scenarios could not be read." }] };
    }
    empty.scenarios.push({
      id: item.id,
      scenarioId: scenario.id,
      optionId: item.optionId,
      note,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  if (!Array.isArray(input.goals) || input.goals.length > 30) {
    return { ok: false, errors: [{ field: "goals", message: "Saved goals could not be read." }] };
  }
  for (const item of input.goals) {
    if (!isRecord(item) || "sample" in item) {
      return { ok: false, errors: [{ field: "goals", message: "Saved goals could not be read." }] };
    }
    const title = cleanText(item.title, TITLE_MAX, false);
    const detail = cleanText(item.detail ?? "", DETAIL_MAX, true);
    const cadence = item.cadence === "daily" || item.cadence === "most-days" || item.cadence === "weekly" ? item.cadence : null;
    if (
      title === null ||
      detail === null ||
      !cadence ||
      typeof item.id !== "string" ||
      typeof item.createdAt !== "string" ||
      (item.archivedAt !== null && typeof item.archivedAt !== "string") ||
      (item.sourceScenarioId !== null && typeof item.sourceScenarioId !== "string")
    ) {
      return { ok: false, errors: [{ field: "goals", message: "Saved goals could not be read." }] };
    }
    empty.goals.push({
      id: item.id,
      title,
      detail,
      cadence,
      sourceScenarioId: item.sourceScenarioId,
      createdAt: item.createdAt,
      archivedAt: item.archivedAt,
    });
  }

  if (!Array.isArray(input.checkIns) || input.checkIns.length > 800) {
    return { ok: false, errors: [{ field: "checkIns", message: "Saved check-ins could not be read." }] };
  }
  for (const item of input.checkIns) {
    if (!isRecord(item) || "sample" in item) {
      return { ok: false, errors: [{ field: "checkIns", message: "Saved check-ins could not be read." }] };
    }
    const note = cleanText(item.note ?? "", NOTE_MAX, true);
    const status = item.status === "done" || item.status === "partial" || item.status === "skipped" ? item.status : null;
    if (
      typeof item.id !== "string" ||
      typeof item.goalId !== "string" ||
      typeof item.date !== "string" ||
      !isValidDateISO(item.date) ||
      !status ||
      note === null ||
      typeof item.updatedAt !== "string" ||
      !empty.goals.some((goal) => goal.id === item.goalId)
    ) {
      return { ok: false, errors: [{ field: "checkIns", message: "Saved check-ins could not be read." }] };
    }
    empty.checkIns.push({ id: item.id, goalId: item.goalId, date: item.date, status, note, updatedAt: item.updatedAt });
  }

  return { ok: true, data: empty };
}

export function latestAssessment(data: UserData): AssessmentRecord | null {
  return data.assessments[data.assessments.length - 1] ?? null;
}

export function draftHasProgress(data: UserData): boolean {
  const draft = data.draft;
  if (!draft) return false;
  if (draft.step > 0) return true;
  if (draft.answers.goals.length > 0 || draft.answers.goalNote) return true;
  return Object.entries(draft.answers).some(([key, value]) => key !== "goals" && key !== "goalNote" && value !== "");
}

export function saveDraft(
  data: UserData,
  step: number,
  answers: Answers,
  updatedAt: string,
): { ok: true; data: UserData } | { ok: false; errors: FieldError[] } {
  const parsed = parseAnswers(answers);
  if (!parsed.ok) return parsed;
  if (step < 0 || step > 8) return { ok: false, errors: [{ field: "step", message: "That step is not part of the assessment." }] };
  return { ok: true, data: { ...data, draft: { step, answers: parsed.answers, updatedAt } } };
}

export function completeAssessment(
  data: UserData,
  answers: Answers,
  completedAt: string,
  id: string,
): { ok: true; data: UserData } | { ok: false; errors: FieldError[] } {
  const parsed = parseAnswers(answers);
  if (!parsed.ok) return parsed;
  const complete = validateComplete(parsed.answers);
  if (!complete.ok) return complete;
  if (data.assessments.length >= 50) {
    return { ok: false, errors: [{ field: "assessments", message: "This browser already has 50 assessments. Remove one before saving another." }] };
  }
  return {
    ok: true,
    data: {
      ...data,
      draft: null,
      assessments: [...data.assessments, { id, completedAt, answers: parsed.answers }],
    },
  };
}

export function removeAssessment(data: UserData, id: string): UserData {
  return { ...data, assessments: data.assessments.filter((item) => item.id !== id) };
}

export function updateProfile(data: UserData, displayName: string): { ok: true; data: UserData } | { ok: false; errors: FieldError[] } {
  const cleaned = cleanText(displayName, NAME_MAX, true);
  if (cleaned === null) {
    return { ok: false, errors: [{ field: "displayName", message: `Use ${NAME_MAX} characters or fewer, on one line.` }] };
  }
  return { ok: true, data: { ...data, profile: { displayName: cleaned } } };
}

export function saveScenario(
  data: UserData,
  input: { id: string; scenarioId: string; optionId: string; note: string; now: string },
): { ok: true; data: UserData } | { ok: false; errors: FieldError[] } {
  const scenario = getScenario(input.scenarioId);
  if (!scenario || !scenario.options.some((option) => option.id === input.optionId)) {
    return { ok: false, errors: [{ field: "scenarioId", message: "Choose a listed scenario and change." }] };
  }
  const note = cleanText(input.note, NOTE_MAX, true);
  if (note === null) {
    return { ok: false, errors: [{ field: "note", message: `Keep the note to ${NOTE_MAX} characters on one line.` }] };
  }
  const existing = data.scenarios.find((item) => item.id === input.id);
  if (!existing && data.scenarios.length >= 40) {
    return { ok: false, errors: [{ field: "scenarios", message: "Remove a saved scenario before adding another." }] };
  }
  const next: SavedScenario = {
    id: input.id,
    scenarioId: scenario.id,
    optionId: input.optionId,
    note,
    createdAt: existing?.createdAt ?? input.now,
    updatedAt: input.now,
  };
  return {
    ok: true,
    data: {
      ...data,
      scenarios: existing ? data.scenarios.map((item) => (item.id === input.id ? next : item)) : [...data.scenarios, next],
    },
  };
}

export function removeScenario(data: UserData, id: string): UserData {
  return { ...data, scenarios: data.scenarios.filter((item) => item.id !== id) };
}

export function saveGoal(
  data: UserData,
  input: {
    id: string;
    title: string;
    detail: string;
    cadence: HabitCadence;
    sourceScenarioId: string | null;
    now: string;
  },
): { ok: true; data: UserData } | { ok: false; errors: FieldError[] } {
  const title = cleanText(input.title, TITLE_MAX, false);
  const detail = cleanText(input.detail, DETAIL_MAX, true);
  if (title === null) return { ok: false, errors: [{ field: "title", message: "Give the habit a short name." }] };
  if (detail === null) return { ok: false, errors: [{ field: "detail", message: `Keep the detail to ${DETAIL_MAX} characters.` }] };
  if (input.sourceScenarioId && !getScenario(input.sourceScenarioId)) {
    return { ok: false, errors: [{ field: "sourceScenarioId", message: "That scenario is not available." }] };
  }
  const existing = data.goals.find((goal) => goal.id === input.id);
  const sameSource = input.sourceScenarioId
    ? data.goals.find((goal) => goal.sourceScenarioId === input.sourceScenarioId && goal.id !== input.id)
    : undefined;
  if (!existing && !sameSource && data.goals.length >= 30) {
    return { ok: false, errors: [{ field: "goals", message: "Archive a habit before adding another." }] };
  }
  if (sameSource) {
    return {
      ok: true,
      data: {
        ...data,
        goals: data.goals.map((goal) =>
          goal.id === sameSource.id ? { ...goal, title, detail, cadence: input.cadence, archivedAt: null } : goal,
        ),
      },
    };
  }
  const next: HabitGoal = {
    id: input.id,
    title,
    detail,
    cadence: input.cadence,
    sourceScenarioId: input.sourceScenarioId,
    createdAt: existing?.createdAt ?? input.now,
    archivedAt: existing?.archivedAt ?? null,
  };
  return {
    ok: true,
    data: {
      ...data,
      goals: existing ? data.goals.map((goal) => (goal.id === input.id ? next : goal)) : [...data.goals, next],
    },
  };
}

export function setGoalArchived(data: UserData, id: string, archivedAt: string | null): UserData {
  return {
    ...data,
    goals: data.goals.map((goal) => (goal.id === id ? { ...goal, archivedAt } : goal)),
  };
}

export function upsertCheckIn(
  data: UserData,
  input: { id: string; goalId: string; date: string; status: CheckInStatus; note: string; now: string; today: string },
): { ok: true; data: UserData } | { ok: false; errors: FieldError[] } {
  if (!data.goals.some((goal) => goal.id === input.goalId)) {
    return { ok: false, errors: [{ field: "goalId", message: "Choose one of your habits." }] };
  }
  if (!isValidDateISO(input.date) || !isValidDateISO(input.today) || compareDateISO(input.date, input.today) > 0) {
    return { ok: false, errors: [{ field: "date", message: "Choose today or an earlier day." }] };
  }
  const note = cleanText(input.note, NOTE_MAX, true);
  if (note === null) return { ok: false, errors: [{ field: "note", message: `Keep the note to ${NOTE_MAX} characters.` }] };
  if (input.status !== "done" && input.status !== "partial" && input.status !== "skipped") {
    return { ok: false, errors: [{ field: "status", message: "Mark the day as done, partial, or skipped." }] };
  }
  const existing = data.checkIns.find((item) => item.goalId === input.goalId && item.date === input.date);
  if (!existing && data.checkIns.length >= 800) {
    return { ok: false, errors: [{ field: "checkIns", message: "Remove an older check-in before adding another." }] };
  }
  const next: CheckIn = {
    id: existing?.id ?? input.id,
    goalId: input.goalId,
    date: input.date,
    status: input.status,
    note,
    updatedAt: input.now,
  };
  return {
    ok: true,
    data: {
      ...data,
      checkIns: existing
        ? data.checkIns.map((item) => (item.id === existing.id ? next : item))
        : [...data.checkIns, next],
    },
  };
}

export function removeCheckIn(data: UserData, id: string): UserData {
  return { ...data, checkIns: data.checkIns.filter((item) => item.id !== id) };
}
