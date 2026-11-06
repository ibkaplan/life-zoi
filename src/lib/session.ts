import { isRealISODate, mondayOf } from "@/lib/dates";
import {
  coerceAssessment,
  isHabitId,
  isTrackableHabitId,
  validateComplete,
  validateDaysPerWeek,
} from "@/lib/validation";
import {
  emptySession,
  STEP_IDS,
  WEEKLY_ACCOMPLISHMENT_IDS,
  type CheckIn,
  type CompletedAssessment,
  type EnergyLevel,
  type HabitGoal,
  type SavedScenario,
  type UserSession,
  type WeeklyAccomplishmentId,
  type WeeklyCheckIn,
  type WeightEntry,
  type WeightUnit,
} from "@/lib/types";

const HISTORY_LIMIT = 24;
const SCENARIO_LIMIT = 30;
const CHECKIN_LIMIT = 400;
const WEEKLY_LIMIT = 104;
const WEIGHT_LIMIT = 400;

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

function cleanEnergy(value: unknown): EnergyLevel | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) return null;
  return value as EnergyLevel;
}

function cleanAccomplishments(value: unknown): WeeklyAccomplishmentId[] {
  if (!Array.isArray(value)) return [];
  const picked: WeeklyAccomplishmentId[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !WEEKLY_ACCOMPLISHMENT_IDS.includes(item as WeeklyAccomplishmentId)) continue;
    if (picked.includes(item as WeeklyAccomplishmentId)) continue;
    picked.push(item as WeeklyAccomplishmentId);
  }
  return picked;
}

function cleanWeightValue(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const rounded = Math.round(value * 100) / 100;
  if (rounded <= 0 || rounded > 1000) return null;
  return rounded;
}

function cleanWeightUnit(value: unknown): WeightUnit | null {
  return value === "lb" || value === "kg" ? value : null;
}

export function sanitizeSession(input: unknown): UserSession {
  const record = asRecord(input);
  if (!record) return emptySession();
  const draft = coerceAssessment(record.draft);
  const draftStep =
    typeof record.draftStep === "number" &&
    Number.isInteger(record.draftStep) &&
    record.draftStep >= 0 &&
    record.draftStep <= STEP_IDS.length - 1
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

  const weeklyCheckIns = Array.isArray(record.weeklyCheckIns)
    ? record.weeklyCheckIns
        .map((item): WeeklyCheckIn | null => {
          const row = asRecord(item);
          if (!row) return null;
          const id = cleanId(row.id);
          const weekStart = typeof row.weekStart === "string" ? mondayOf(row.weekStart) : "";
          const savedAt = typeof row.savedAt === "string" ? row.savedAt : "";
          if (!id || !weekStart || Number.isNaN(Date.parse(savedAt))) return null;
          return {
            id,
            weekStart,
            savedAt,
            energy: cleanEnergy(row.energy),
            accomplishments: cleanAccomplishments(row.accomplishments),
            proudOf: cleanNote(row.proudOf),
          };
        })
        .filter((item): item is WeeklyCheckIn => item !== null)
        .filter((item, index, all) => all.findIndex((other) => other.weekStart === item.weekStart) === index)
        .slice(0, WEEKLY_LIMIT)
    : [];

  const weightEntries = Array.isArray(record.weightEntries)
    ? record.weightEntries
        .map((item): WeightEntry | null => {
          const row = asRecord(item);
          if (!row) return null;
          const id = cleanId(row.id);
          const date = typeof row.date === "string" ? row.date : "";
          const unit = cleanWeightUnit(row.unit);
          const value = cleanWeightValue(row.value);
          if (!id || !isRealISODate(date) || !unit || value === null) return null;
          return { id, date, value, unit };
        })
        .filter((item): item is WeightEntry => item !== null)
        .slice(0, WEIGHT_LIMIT)
    : [];

  const reassessDays = record.reassessDays === 30 || record.reassessDays === 90 || record.reassessDays === 180
    ? record.reassessDays
    : 0;
  const reassessOn =
    typeof record.reassessOn === "string" && isRealISODate(record.reassessOn) ? record.reassessOn : "";

  return {
    draft,
    draftStep,
    history,
    scenarios,
    goals: uniqueGoals,
    checkIns,
    weeklyCheckIns,
    weightEntries,
    reassessDays,
    reassessOn,
  };
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

export function upsertWeeklyCheckIn(session: UserSession, checkIn: WeeklyCheckIn): UserSession {
  const rest = session.weeklyCheckIns.filter((item) => item.weekStart !== checkIn.weekStart);
  return { ...session, weeklyCheckIns: [checkIn, ...rest].slice(0, WEEKLY_LIMIT) };
}

export function upsertWeightEntry(session: UserSession, entry: WeightEntry): UserSession {
  const rest = session.weightEntries.filter((item) => !(item.date === entry.date && item.unit === entry.unit));
  return { ...session, weightEntries: [entry, ...rest].slice(0, WEIGHT_LIMIT) };
}

export function removeWeightEntry(session: UserSession, id: string): UserSession {
  return { ...session, weightEntries: session.weightEntries.filter((item) => item.id !== id) };
}

export function saveScenario(session: UserSession, scenario: SavedScenario): UserSession {
  return {
    ...session,
    scenarios: [scenario, ...session.scenarios].slice(0, SCENARIO_LIMIT),
  };
}

export function chooseReassessment(session: UserSession, days: 30 | 90 | 180, on: string): UserSession {
  return { ...session, reassessDays: days, reassessOn: on };
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
