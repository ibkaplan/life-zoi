import { isRealISODate } from "@/lib/dates";
import {
  coerceAssessment,
  isHabitId,
  isTrackableHabitId,
  validateComplete,
  validateDaysPerWeek,
} from "@/lib/validation";
import {
  emptySession,
  type CheckIn,
  type CompletedAssessment,
  type HabitGoal,
  type SavedScenario,
  type UserSession,
} from "@/lib/types";

const HISTORY_LIMIT = 24;
const SCENARIO_LIMIT = 30;
const CHECKIN_LIMIT = 400;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanId(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9-]{8,80}$/.test(trimmed)) return "";
  return trimmed;
}

function cleanNote(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 280);
}

export function sanitizeSession(input: unknown): UserSession {
  const record = asRecord(input);
  if (!record) return emptySession();
  const draft = coerceAssessment(record.draft);
  const draftStep =
    typeof record.draftStep === "number" &&
    Number.isInteger(record.draftStep) &&
    record.draftStep >= 0 &&
    record.draftStep <= 7
      ? record.draftStep
      : 0;

  const history = Array.isArray(record.history)
    ? record.history
        .map((item): CompletedAssessment | null => {
          const row = asRecord(item);
          if (!row) return null;
          const id = cleanId(row.id);
          const completedAt =
            typeof row.completedAt === "string" ? row.completedAt : "";
          if (!id || Number.isNaN(Date.parse(completedAt))) return null;
          const parsed = validateComplete(row.answers);
          if (!parsed.ok) return null;
          return { id, completedAt, answers: coerceAssessment(row.answers) };
        })
        .filter((item): item is CompletedAssessment => item !== null)
        .slice(0, HISTORY_LIMIT)
    : [];

  const scenarios = Array.isArray(record.scenarios)
    ? record.scenarios
        .map((item): SavedScenario | null => {
          const row = asRecord(item);
          if (!row || !isHabitId(row.habitId)) return null;
          const id = cleanId(row.id);
          const savedAt = typeof row.savedAt === "string" ? row.savedAt : "";
          if (!id || Number.isNaN(Date.parse(savedAt))) return null;
          const note = cleanNote(row.note);
          if (row.habitId === "custom" && !note) return null;
          return { id, habitId: row.habitId, note, savedAt };
        })
        .filter((item): item is SavedScenario => item !== null)
        .slice(0, SCENARIO_LIMIT)
    : [];

  const goals = Array.isArray(record.goals)
    ? record.goals
        .map((item): HabitGoal | null => {
          const row = asRecord(item);
          if (!row || !isTrackableHabitId(row.habitId)) return null;
          if (typeof row.daysPerWeek !== "number") return null;
          if (validateDaysPerWeek(row.daysPerWeek)) return null;
          return { habitId: row.habitId, daysPerWeek: row.daysPerWeek };
        })
        .filter((item): item is HabitGoal => item !== null)
    : [];
  const uniqueGoals = goals.filter(
    (goal, index) => goals.findIndex((item) => item.habitId === goal.habitId) === index,
  );

  const checkIns = Array.isArray(record.checkIns)
    ? record.checkIns
        .map((item): CheckIn | null => {
          const row = asRecord(item);
          if (!row || !isTrackableHabitId(row.habitId)) return null;
          const id = cleanId(row.id);
          const date = typeof row.date === "string" ? row.date : "";
          if (!id || !isRealISODate(date) || typeof row.done !== "boolean") return null;
          return { id, date, habitId: row.habitId, done: row.done, note: cleanNote(row.note) };
        })
        .filter((item): item is CheckIn => item !== null)
        .slice(0, CHECKIN_LIMIT)
    : [];

  return { draft, draftStep, history, scenarios, goals: uniqueGoals, checkIns };
}

export function completeDraft(
  session: UserSession,
  id: string,
  completedAt: string,
): { ok: true; session: UserSession } | { ok: false; fields: Record<string, string> } {
  const parsed = validateComplete(session.draft);
  if (!parsed.ok) return { ok: false, fields: parsed.fields };
  const next: UserSession = {
    ...session,
    history: [
      { id, completedAt, answers: session.draft },
      ...session.history,
    ].slice(0, HISTORY_LIMIT),
  };
  return { ok: true, session: next };
}

export function upsertGoal(session: UserSession, goal: HabitGoal): UserSession {
  const goals = session.goals.filter((item) => item.habitId !== goal.habitId);
  return { ...session, goals: [...goals, goal] };
}

export function removeGoal(session: UserSession, habitId: HabitGoal["habitId"]): UserSession {
  return { ...session, goals: session.goals.filter((item) => item.habitId !== habitId) };
}

export function upsertCheckIn(session: UserSession, checkIn: CheckIn): UserSession {
  const without = session.checkIns.filter(
    (item) => !(item.date === checkIn.date && item.habitId === checkIn.habitId),
  );
  return {
    ...session,
    checkIns: [checkIn, ...without].slice(0, CHECKIN_LIMIT),
  };
}

export function removeCheckIn(session: UserSession, id: string): UserSession {
  return { ...session, checkIns: session.checkIns.filter((item) => item.id !== id) };
}

export function saveScenario(session: UserSession, scenario: SavedScenario): UserSession {
  return {
    ...session,
    scenarios: [scenario, ...session.scenarios].slice(0, SCENARIO_LIMIT),
  };
}

export function removeScenario(session: UserSession, id: string): UserSession {
  return {
    ...session,
    scenarios: session.scenarios.filter((item) => item.id !== id),
  };
}

export const SESSION_STORAGE_KEY = "lifezoi.session.v1";
export const SAMPLE_STORAGE_KEY = "lifezoi.sample.v1";

export function loadStoredSession(storage: Pick<Storage, "getItem"> | null): UserSession {
  if (!storage) return emptySession();
  try {
    const raw = storage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return emptySession();
    return sanitizeSession(JSON.parse(raw) as unknown);
  } catch {
    return emptySession();
  }
}

export function loadStoredSample(storage: Pick<Storage, "getItem"> | null): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(SAMPLE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
