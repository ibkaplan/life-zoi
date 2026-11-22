import type { InstrumentId } from "@/lib/mind/assessments";
import { PLAN_DAYS, type PlanGoal, type PlanState } from "@/lib/mind/plan";

/**
 * Optional LifeZoi Mind progress. Nothing is kept unless the person turns saving on.
 *
 * - Saving off (default): the plan and anything else live in this browser tab only
 *   (sessionStorage) and disappear when the tab is closed.
 * - Saving on: kept in this browser's local storage under the signed-in account's own
 *   key. It is not sent to LifeZoi's servers or database. The app does not encrypt it;
 *   anyone with access to this device and browser profile could read it.
 * - "Delete everything" removes every copy at once.
 */

export const MIND_PROGRESS_KEY = "lifezoi.mind.progress.v1";
export const MIND_CONSENT_KEY = "lifezoi.mind.consent.v1";

export type SavedResult = { id: string; instrument: InstrumentId; total: number; band: string; date: string; item9Positive: boolean };
export type CompletedExercise = { id: string; exercise: string; minutes: number; date: string };
export type SavedReflection = { id: string; reflection: string; date: string; worthAttention: number; strengths: number };

export type MindProgress = {
  version: 1;
  results: SavedResult[];
  exercises: CompletedExercise[];
  reflections: SavedReflection[];
  plan: PlanState | null;
};

export function emptyProgress(): MindProgress {
  return { version: 1, results: [], exercises: [], reflections: [], plan: null };
}

const DATE = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/;
const MAX = 200;

function str(value: unknown, max = 80): string | null {
  return typeof value === "string" && value.length > 0 && value.length <= max ? value : null;
}

function sanitizePlan(value: unknown): PlanState | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.days) || raw.days.length !== PLAN_DAYS.length || !Array.isArray(raw.goals)) return null;
  const goals = raw.goals.filter((goal): goal is PlanGoal => typeof goal === "string" && ["stress", "worry", "mood", "sleep", "relationships", "self-esteem"].includes(goal));
  const days = raw.days.map((day, index) => {
    const entry = (day ?? {}) as Record<string, unknown>;
    const options = PLAN_DAYS[index].options.map((option) => option.exercise);
    const exercise = typeof entry.exercise === "string" && options.includes(entry.exercise) ? entry.exercise : options[0];
    const status = entry.status === "done" || entry.status === "skipped" ? entry.status : "todo";
    const doneCount = typeof entry.doneCount === "number" && entry.doneCount >= 0 && entry.doneCount < 1000 ? Math.floor(entry.doneCount) : 0;
    return { exercise, status, doneCount } as PlanState["days"][number];
  });
  const startedAt = typeof raw.startedAt === "string" && DATE.test(raw.startedAt) ? raw.startedAt : new Date(0).toISOString();
  return { goals, startedAt, days };
}

/** Anything read back from storage is checked; broken entries are dropped. */
export function sanitizeProgress(value: unknown): MindProgress {
  if (!value || typeof value !== "object") return emptyProgress();
  const raw = value as Record<string, unknown>;
  const list = (input: unknown) => (Array.isArray(input) ? input.slice(-MAX) : []);
  const results = list(raw.results).flatMap((entry): SavedResult[] => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const instrument = item.instrument === "phq9" || item.instrument === "gad7" ? item.instrument : null;
    const total = typeof item.total === "number" && Number.isInteger(item.total) && item.total >= 0 && item.total <= 27 ? item.total : null;
    const id = str(item.id);
    const band = str(item.band, 40);
    const date = typeof item.date === "string" && DATE.test(item.date) ? item.date : null;
    if (!instrument || total === null || !id || !band || !date) return [];
    return [{ id, instrument, total, band, date, item9Positive: item.item9Positive === true }];
  });
  const exercises = list(raw.exercises).flatMap((entry): CompletedExercise[] => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const id = str(item.id);
    const exercise = str(item.exercise);
    const minutes = typeof item.minutes === "number" && item.minutes > 0 && item.minutes <= 60 ? item.minutes : null;
    const date = typeof item.date === "string" && DATE.test(item.date) ? item.date : null;
    return id && exercise && minutes && date ? [{ id, exercise, minutes, date }] : [];
  });
  const reflections = list(raw.reflections).flatMap((entry): SavedReflection[] => {
    const item = (entry ?? {}) as Record<string, unknown>;
    const id = str(item.id);
    const reflection = str(item.reflection);
    const date = typeof item.date === "string" && DATE.test(item.date) ? item.date : null;
    const worthAttention = typeof item.worthAttention === "number" ? Math.max(0, Math.min(10, Math.floor(item.worthAttention))) : 0;
    const strengths = typeof item.strengths === "number" ? Math.max(0, Math.min(10, Math.floor(item.strengths))) : 0;
    return id && reflection && date ? [{ id, reflection, date, worthAttention, strengths }] : [];
  });
  return { version: 1, results, exercises, reflections, plan: sanitizePlan(raw.plan) };
}

export function parseProgress(raw: string | null): MindProgress {
  if (!raw) return emptyProgress();
  try {
    return sanitizeProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function newId(now = Date.now(), rand = Math.random()): string {
  return `${now.toString(36)}${Math.floor(rand * 1e8).toString(36)}`;
}

/** Earlier results of the same questionnaire, newest first. */
export function resultsFor(progress: MindProgress, instrument: InstrumentId): SavedResult[] {
  return progress.results.filter((result) => result.instrument === instrument).sort((a, b) => b.date.localeCompare(a.date));
}

/** Days until a two-week questionnaire is due again, or 0 when it can be repeated now. */
export function daysUntilRepeat(lastDate: string, repeatAfterDays: number, now = new Date()): number {
  const last = new Date(lastDate);
  if (Number.isNaN(last.getTime())) return 0;
  const elapsed = Math.floor((now.getTime() - last.getTime()) / 86_400_000);
  return Math.max(0, repeatAfterDays - elapsed);
}
