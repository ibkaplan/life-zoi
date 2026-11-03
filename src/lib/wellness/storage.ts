import { isRealISODate } from "@/lib/dates";
import type {
  HabitMark,
  IfThenPlan,
  LifeHabit,
  MomentCategory,
  MomentFilter,
  MomentMinutes,
  MomentPlan,
  MomentStatus,
  NatureActivityId,
  NatureEntry,
  NatureRoutine,
  NatureWeather,
  NextChoice,
  ReminderSlot,
  SupportFlag,
  UrgeEntry,
  UrgeFactor,
  WellnessCheck,
  WellnessLog,
  WellnessMotivation,
} from "@/lib/wellness/types";
import {
  MOMENT_CATEGORIES,
  MOMENT_FILTERS,
  MOMENT_MINUTES,
  MOMENT_STATUSES,
  NATURE_ACTIVITY_IDS,
  NATURE_WEATHER,
  NEXT_CHOICES,
  SUPPORT_FLAGS,
  URGE_FACTORS,
} from "@/lib/wellness/types";

export const WELLNESS_STORAGE_KEY = "lifezoi.wellness.v1";

const CHECK_LIMIT = 400;
const TEXT_LIMIT = 280;
const URGE_LIMIT = 160;
const MOMENT_LIMIT = 80;
const HABIT_LIMIT = 20;
const MARK_LIMIT = 900;
const PLAN_LIMIT = 24;

const emptyMotivation = (): WellnessMotivation => ({
  experience: "",
  people: "",
  activities: "",
  accomplishments: "",
  energyFor: "",
});

export function emptyWellnessLog(): WellnessLog {
  return {
    checks: [],
    challengeStarts: [],
    motivation: emptyMotivation(),
    reminders: [],
    reminderSeenOn: "",
    urges: [],
    moments: [],
    habits: [],
    habitMarks: [],
    ifThen: [],
    natureEntries: [],
    natureRoutine: { morning: "", afternoon: "", evening: "" },
    naturePicks: [],
  };
}

export function newRecordId(): string {
  return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 40);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, TEXT_LIMIT);
}

function cleanId(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!/^[a-z0-9-]{1,80}$/.test(trimmed)) return "";
  return trimmed;
}

function cleanTime(value: unknown): string {
  if (typeof value !== "string") return "";
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : "";
}

function cleanIntensity(value: unknown): number {
  const number = typeof value === "number" ? value : Number.NaN;
  if (!Number.isInteger(number) || number < 1 || number > 10) return 0;
  return number;
}

function unique<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(value)) return [];
  const picked: T[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    if (!allowed.includes(item as T) || picked.includes(item as T)) continue;
    picked.push(item as T);
  }
  return picked;
}

const REMINDERS: readonly ReminderSlot[] = ["morning", "midday", "evening"];

function cleanUrge(row: Record<string, unknown>): UrgeEntry | null {
  const id = cleanId(row.id);
  const date = typeof row.date === "string" ? row.date : "";
  const intensity = cleanIntensity(row.intensity);
  const want = cleanText(row.want);
  if (!id || !isRealISODate(date) || intensity === 0 || !want) return null;
  const pause = row.pauseMinutes;
  const pauseMinutes = pause === 5 || pause === 10 ? pause : 0;
  const choice = NEXT_CHOICES.includes(row.choice as NextChoice) ? (row.choice as NextChoice) : "";
  return {
    id,
    date,
    time: cleanTime(row.time),
    want,
    feeling: cleanText(row.feeling),
    before: cleanText(row.before),
    intensity,
    factors: unique<UrgeFactor>(row.factors, URGE_FACTORS),
    choice,
    choiceNote: cleanText(row.choiceNote),
    breaths: row.breaths === true,
    pauseMinutes,
    outcome: cleanText(row.outcome),
    supportFlags: unique<SupportFlag>(row.supportFlags, SUPPORT_FLAGS),
  };
}

function cleanMoment(row: Record<string, unknown>): MomentPlan | null {
  const id = cleanId(row.id);
  const date = typeof row.date === "string" ? row.date : "";
  const title = cleanText(row.title);
  const minutes = MOMENT_MINUTES.includes(row.minutes as MomentMinutes)
    ? (row.minutes as MomentMinutes)
    : null;
  const status = MOMENT_STATUSES.includes(row.status as MomentStatus) ? (row.status as MomentStatus) : null;
  if (!id || !isRealISODate(date) || !title || minutes === null || !status) return null;
  return {
    id,
    date,
    minutes,
    filters: unique<MomentFilter>(row.filters, MOMENT_FILTERS),
    categories: unique<MomentCategory>(row.categories, MOMENT_CATEGORIES),
    prompt: cleanText(row.prompt),
    title,
    detail: cleanText(row.detail),
    status,
  };
}

function cleanHabit(row: Record<string, unknown>): LifeHabit | null {
  const id = cleanId(row.id);
  const slug = cleanId(row.slug);
  const title = cleanText(row.title);
  const createdOn = typeof row.createdOn === "string" ? row.createdOn : "";
  const cadence = row.cadence === "daily" || row.cadence === "weekly" ? row.cadence : null;
  const target = typeof row.target === "number" && Number.isInteger(row.target) ? row.target : 1;
  if (!id || !slug || !title || !cadence || !isRealISODate(createdOn)) return null;
  return {
    id,
    slug,
    title,
    cadence,
    target: Math.min(7, Math.max(1, target)),
    paused: row.paused === true,
    createdOn,
    note: cleanText(row.note),
  };
}

function cleanMark(row: Record<string, unknown>): HabitMark | null {
  const id = cleanId(row.id);
  const slug = cleanId(row.slug);
  const date = typeof row.date === "string" ? row.date : "";
  if (!id || !slug || !isRealISODate(date)) return null;
  return { id, slug, date };
}

function cleanScale(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5) return null;
  return value;
}

function cleanMinutes(value: unknown): number | null {
  if (value === null || value === "") return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 600) return null;
  return value;
}

function cleanNature(row: Record<string, unknown>): NatureEntry | null {
  const id = cleanId(row.id);
  const date = typeof row.date === "string" ? row.date : "";
  if (!id || !isRealISODate(date)) return null;
  const weather = NATURE_WEATHER.includes(row.weather as NatureWeather) ? (row.weather as NatureWeather) : "";
  return {
    id,
    date,
    outdoorMinutes: cleanMinutes(row.outdoorMinutes),
    weather,
    moodBefore: cleanScale(row.moodBefore),
    moodAfter: cleanScale(row.moodAfter),
    energy: cleanScale(row.energy),
    sleep: cleanScale(row.sleep),
    activities: unique<NatureActivityId>(row.activities, NATURE_ACTIVITY_IDS),
    movement: cleanText(row.movement),
    connection: cleanText(row.connection),
    reflection: cleanText(row.reflection),
  };
}

function cleanRoutine(value: unknown): NatureRoutine {
  const row = asRecord(value);
  if (!row) return { morning: "", afternoon: "", evening: "" };
  return {
    morning: cleanText(row.morning),
    afternoon: cleanText(row.afternoon),
    evening: cleanText(row.evening),
  };
}

function cleanPlan(row: Record<string, unknown>): IfThenPlan | null {
  const id = cleanId(row.id);
  const cue = cleanText(row.cue);
  const action = cleanText(row.action);
  if (!id || !cue || !action) return null;
  return { id, cue, action };
}

function cleanRows<T>(value: unknown, limit: number, map: (row: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(value)) return [];
  const items: T[] = [];
  for (const item of value) {
    const row = asRecord(item);
    if (!row) continue;
    const cleaned = map(row);
    if (!cleaned) continue;
    items.push(cleaned);
    if (items.length >= limit) break;
  }
  return items;
}

export function sanitizeWellness(input: unknown): WellnessLog {
  const record = asRecord(input);
  if (!record) return emptyWellnessLog();

  const checks = Array.isArray(record.checks)
    ? record.checks
        .map((item): WellnessCheck | null => {
          const row = asRecord(item);
          if (!row) return null;
          const id = cleanId(row.id);
          const date = typeof row.date === "string" ? row.date : "";
          if (!id || !isRealISODate(date) || typeof row.done !== "boolean") return null;
          return { id, date, done: row.done, reflection: cleanText(row.reflection) };
        })
        .filter((item): item is WellnessCheck => item !== null)
        .slice(0, CHECK_LIMIT)
    : [];

  const challengeStarts = Array.isArray(record.challengeStarts)
    ? record.challengeStarts
        .map((item) => {
          const row = asRecord(item);
          if (!row) return null;
          const challengeId = cleanId(row.challengeId);
          const startedOn = typeof row.startedOn === "string" ? row.startedOn : "";
          if (!challengeId || !isRealISODate(startedOn)) return null;
          return { challengeId, startedOn };
        })
        .filter((item): item is { challengeId: string; startedOn: string } => item !== null)
        .filter(
          (item, index, list) =>
            list.findIndex((other) => other.challengeId === item.challengeId) === index,
        )
    : [];

  const motivationRecord = asRecord(record.motivation);
  const motivation = emptyMotivation();
  if (motivationRecord) {
    motivation.experience = cleanText(motivationRecord.experience);
    motivation.people = cleanText(motivationRecord.people);
    motivation.activities = cleanText(motivationRecord.activities);
    motivation.accomplishments = cleanText(motivationRecord.accomplishments);
    motivation.energyFor = cleanText(motivationRecord.energyFor);
  }

  const rawReminders = Array.isArray(record.reminders) ? record.reminders : [];
  const reminders = REMINDERS.filter((slot) => rawReminders.includes(slot));

  const reminderSeenOn =
    typeof record.reminderSeenOn === "string" && isRealISODate(record.reminderSeenOn)
      ? record.reminderSeenOn
      : "";

  const habits = cleanRows(record.habits, HABIT_LIMIT, cleanHabit).filter(
    (item, index, list) => list.findIndex((other) => other.slug === item.slug) === index,
  );

  return {
    checks,
    challengeStarts,
    motivation,
    reminders,
    reminderSeenOn,
    urges: cleanRows(record.urges, URGE_LIMIT, cleanUrge),
    moments: cleanRows(record.moments, MOMENT_LIMIT, cleanMoment),
    habits,
    habitMarks: cleanRows(record.habitMarks, MARK_LIMIT, cleanMark),
    ifThen: cleanRows(record.ifThen, PLAN_LIMIT, cleanPlan),
    natureEntries: cleanRows(record.natureEntries, 200, cleanNature),
    natureRoutine: cleanRoutine(record.natureRoutine),
    naturePicks: unique<NatureActivityId>(record.naturePicks, NATURE_ACTIVITY_IDS).slice(0, 12),
  };
}

export function loadWellness(storage: Pick<Storage, "getItem"> | null): WellnessLog {
  if (!storage) return emptyWellnessLog();
  try {
    const raw = storage.getItem(WELLNESS_STORAGE_KEY);
    if (!raw) return emptyWellnessLog();
    return sanitizeWellness(JSON.parse(raw) as unknown);
  } catch {
    return emptyWellnessLog();
  }
}

export function saveWellness(storage: Pick<Storage, "setItem">, log: WellnessLog) {
  storage.setItem(WELLNESS_STORAGE_KEY, JSON.stringify(sanitizeWellness(log)));
}

export function clearWellness(storage: Pick<Storage, "removeItem"> | null) {
  storage?.removeItem(WELLNESS_STORAGE_KEY);
}

export function upsertCheck(log: WellnessLog, check: WellnessCheck): WellnessLog {
  const without = log.checks.filter((item) => !(item.id === check.id && item.date === check.date));
  return {
    ...log,
    checks: [{ ...check, reflection: cleanText(check.reflection) }, ...without].slice(0, CHECK_LIMIT),
  };
}

export function findCheck(log: WellnessLog, id: string, date: string) {
  return log.checks.find((item) => item.id === id && item.date === date) ?? null;
}

export function slugifyHabit(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "habit";
}

export function uniqueHabitSlug(log: WellnessLog, title: string): string {
  const base = slugifyHabit(title);
  if (!log.habits.some((item) => item.slug === base)) return base;
  let n = 2;
  while (log.habits.some((item) => item.slug === `${base.slice(0, 36)}-${n}`)) n += 1;
  return `${base.slice(0, 36)}-${n}`;
}
