import {
  CONFIDENCE,
  DURATION,
  EASIER,
  HABIT_IDS,
  HABIT_STORAGE_KEY,
  HARD,
  HELPED,
  IN_THE_WAY,
  MOTIVATION,
  SUPPORT,
  habitMeta,
  isHabitId,
  triedChoices,
  triggerChoices,
  whenChoices,
  type HabitId,
} from "@/lib/habit-transformation/catalog";
import { isRealISODate } from "@/lib/dates";
import { makeTranslate, type Translate } from "@/lib/i18n/translate";

const english = makeTranslate(null);

export const ACTION_STATUSES = ["accepted", "changed", "easier", "skipped", "complete"] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];
export type CompletedAnswer = "yes" | "partly" | "not-today";
export type DifficultyAnswer = "light" | "mixed" | "heavy";
export type FeelingAnswer = "settled" | "same" | "tender";

export type FollowUp = {
  whenId: string;
  triggerId: string;
  durationId: string;
  triedId: string;
  hardId: string;
  motivationId: string;
  confidenceId: string;
  supportId: string;
  easierId: string;
};

export type HabitPick = {
  habitId: HabitId;
  otherText: string;
  followUp: FollowUp;
};

export type ActionLog = {
  date: string;
  status: ActionStatus;
};

export type ActionTune = {
  habitId: HabitId;
  cue: string;
  action: string;
  acknowledgment: string;
  usingEasier: boolean;
  logs: ActionLog[];
};

export type HabitCheck = {
  date: string;
  habitId: HabitId;
  completed: CompletedAnswer;
  difficulty: DifficultyAnswer;
  feeling: FeelingAnswer;
  helpedId: string;
  helpedNote: string;
  wayId: string;
  wayNote: string;
};

export type WeekNote = {
  date: string;
  worked: string;
  adjust: string;
};

export type HabitJourney = {
  picks: HabitPick[];
  tunes: ActionTune[];
  checks: HabitCheck[];
  notes: WeekNote[];
};

const PICK_LIMIT = 8;
const LOG_LIMIT = 42;
const CHECK_LIMIT = 60;
const NOTE_LIMIT = 16;
const TEXT = 160;
const OTHER = 80;

export function emptyFollowUp(): FollowUp {
  return {
    whenId: "",
    triggerId: "",
    durationId: "",
    triedId: "",
    hardId: "",
    motivationId: "",
    confidenceId: "",
    supportId: "",
    easierId: "",
  };
}

export function emptyHabitJourney(): HabitJourney {
  return { picks: [], tunes: [], checks: [], notes: [] };
}

export function isEmptyHabitJourney(journey: HabitJourney | undefined): boolean {
  if (!journey) return true;
  return (
    journey.picks.length === 0 &&
    journey.tunes.every((tune) => tune.logs.length === 0 && tune.acknowledgment === "") &&
    journey.checks.length === 0 &&
    journey.notes.length === 0
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, max);
}

function oneOf(value: unknown, ids: string[]): string {
  return typeof value === "string" && ids.includes(value) ? value : "";
}

function choiceId(value: unknown, choices: { id: string }[]): string {
  return oneOf(value, choices.map((item) => item.id));
}

export function sanitizeFollowUp(input: unknown, habitId: HabitId): FollowUp {
  const row = asRecord(input);
  const blank = emptyFollowUp();
  if (!row) return blank;
  return {
    whenId: choiceId(row.whenId, whenChoices(habitId)),
    triggerId: choiceId(row.triggerId, triggerChoices(habitId)),
    durationId: choiceId(row.durationId, DURATION),
    triedId: choiceId(row.triedId, triedChoices(habitId)),
    hardId: choiceId(row.hardId, HARD),
    motivationId: choiceId(row.motivationId, MOTIVATION),
    confidenceId: choiceId(row.confidenceId, CONFIDENCE),
    supportId: choiceId(row.supportId, SUPPORT),
    easierId: choiceId(row.easierId, EASIER),
  };
}

export function sanitizeHabitJourney(input: unknown): HabitJourney {
  const row = asRecord(input);
  if (!row) return emptyHabitJourney();
  const picks = Array.isArray(row.picks)
    ? row.picks
        .map((item): HabitPick | null => {
          const pick = asRecord(item);
          if (!pick || !isHabitId(pick.habitId)) return null;
          return {
            habitId: pick.habitId,
            otherText: pick.habitId === "other" ? cleanText(pick.otherText, OTHER) : "",
            followUp: sanitizeFollowUp(pick.followUp, pick.habitId),
          };
        })
        .filter((item): item is HabitPick => item !== null)
        .filter((item, index, all) => all.findIndex((other) => other.habitId === item.habitId) === index)
        .slice(0, PICK_LIMIT)
    : [];

  const tunes = Array.isArray(row.tunes)
    ? row.tunes
        .map((item): ActionTune | null => {
          const tune = asRecord(item);
          if (!tune || !isHabitId(tune.habitId)) return null;
          const logs = Array.isArray(tune.logs)
            ? tune.logs
                .map((log): ActionLog | null => {
                  const entry = asRecord(log);
                  const date = typeof entry?.date === "string" ? entry.date : "";
                  const status = entry?.status;
                  if (!isRealISODate(date) || !ACTION_STATUSES.includes(status as ActionStatus)) return null;
                  return { date, status: status as ActionStatus };
                })
                .filter((item): item is ActionLog => item !== null)
                .filter((item, index, all) => all.findIndex((other) => other.date === item.date) === index)
                .slice(-LOG_LIMIT)
            : [];
          return {
            habitId: tune.habitId,
            cue: cleanText(tune.cue, TEXT),
            action: cleanText(tune.action, TEXT),
            acknowledgment: cleanText(tune.acknowledgment, TEXT),
            usingEasier: tune.usingEasier === true,
            logs,
          };
        })
        .filter((item): item is ActionTune => item !== null)
        .filter((item, index, all) => all.findIndex((other) => other.habitId === item.habitId) === index)
        .slice(0, HABIT_IDS.length)
    : [];

  const checks = Array.isArray(row.checks)
    ? row.checks
        .map((item): HabitCheck | null => {
          const check = asRecord(item);
          if (!check || !isHabitId(check.habitId) || !isRealISODate(typeof check.date === "string" ? check.date : "")) {
            return null;
          }
          const completed = oneOf(check.completed, ["yes", "partly", "not-today"]) as CompletedAnswer;
          const difficulty = oneOf(check.difficulty, ["light", "mixed", "heavy"]) as DifficultyAnswer;
          const feeling = oneOf(check.feeling, ["settled", "same", "tender"]) as FeelingAnswer;
          if (!completed || !difficulty || !feeling) return null;
          return {
            date: check.date as string,
            habitId: check.habitId,
            completed,
            difficulty,
            feeling,
            helpedId: choiceId(check.helpedId, HELPED),
            helpedNote: cleanText(check.helpedNote, TEXT),
            wayId: choiceId(check.wayId, IN_THE_WAY),
            wayNote: cleanText(check.wayNote, TEXT),
          };
        })
        .filter((item): item is HabitCheck => item !== null)
        .filter(
          (item, index, all) =>
            all.findIndex((other) => other.date === item.date && other.habitId === item.habitId) === index,
        )
        .slice(-CHECK_LIMIT)
    : [];

  const notes = Array.isArray(row.notes)
    ? row.notes
        .map((item): WeekNote | null => {
          const note = asRecord(item);
          const date = typeof note?.date === "string" ? note.date : "";
          if (!note || !isRealISODate(date)) return null;
          return {
            date,
            worked: cleanText(note.worked, TEXT),
            adjust: cleanText(note.adjust, TEXT),
          };
        })
        .filter((item): item is WeekNote => item !== null)
        .filter((item, index, all) => all.findIndex((other) => other.date === item.date) === index)
        .slice(-NOTE_LIMIT)
    : [];

  return { picks, tunes, checks, notes };
}

export function habitName(pick: HabitPick, t: Translate = english): string {
  if (pick.habitId === "other" && pick.otherText.trim()) return pick.otherText.trim();
  return t(habitMeta(pick.habitId).label);
}

export function savePicks(journey: HabitJourney, picks: HabitPick[]): HabitJourney {
  const clean = sanitizeHabitJourney({ ...journey, picks });
  return {
    ...clean,
    tunes: clean.tunes.map((tune) => ({ ...tune, cue: "", action: "", usingEasier: false })),
  };
}

export type TunePatch = {
  cue?: string;
  action?: string;
  acknowledgment?: string;
  usingEasier?: boolean;
};

function withTune(journey: HabitJourney, habitId: HabitId, patch: TunePatch, log?: ActionLog): HabitJourney {
  const existing = journey.tunes.find((item) => item.habitId === habitId);
  const base: ActionTune = existing ?? {
    habitId,
    cue: "",
    action: "",
    acknowledgment: "",
    usingEasier: false,
    logs: [],
  };
  const logs = log
    ? [...base.logs.filter((item) => item.date !== log.date), log].slice(-LOG_LIMIT)
    : base.logs;
  const next: ActionTune = {
    ...base,
    cue: patch.cue === undefined ? base.cue : cleanText(patch.cue, TEXT),
    action: patch.action === undefined ? base.action : cleanText(patch.action, TEXT),
    acknowledgment: patch.acknowledgment === undefined ? base.acknowledgment : cleanText(patch.acknowledgment, TEXT),
    usingEasier: patch.usingEasier === undefined ? base.usingEasier : patch.usingEasier,
    logs,
  };
  return sanitizeHabitJourney({
    ...journey,
    tunes: [...journey.tunes.filter((item) => item.habitId !== habitId), next],
  });
}

export function logAction(
  journey: HabitJourney,
  habitId: HabitId,
  date: string,
  status: ActionStatus,
  patch: TunePatch = {},
): HabitJourney {
  if (!isRealISODate(date)) return journey;
  const usingEasier = status === "easier" ? true : patch.usingEasier;
  return withTune(journey, habitId, { ...patch, usingEasier }, { date, status });
}

export function saveAcknowledgment(journey: HabitJourney, habitId: HabitId, acknowledgment: string): HabitJourney {
  return withTune(journey, habitId, { acknowledgment });
}

export function saveCheck(journey: HabitJourney, check: HabitCheck): HabitJourney {
  const checks = [
    ...journey.checks.filter((item) => !(item.date === check.date && item.habitId === check.habitId)),
    check,
  ];
  return sanitizeHabitJourney({ ...journey, checks });
}

export function saveWeekNote(journey: HabitJourney, note: WeekNote): HabitJourney {
  const notes = [...journey.notes.filter((item) => item.date !== note.date), note];
  return sanitizeHabitJourney({ ...journey, notes });
}

export function readHabitLocal(storage: Pick<Storage, "getItem"> | null, key = HABIT_STORAGE_KEY): HabitJourney | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return sanitizeHabitJourney(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeHabitLocal(storage: Pick<Storage, "setItem"> | null, journey: HabitJourney, key = HABIT_STORAGE_KEY) {
  if (!storage) return;
  storage.setItem(key, JSON.stringify(sanitizeHabitJourney(journey)));
}

export function clearHabitLocal(storage: Pick<Storage, "removeItem"> | null, key = HABIT_STORAGE_KEY) {
  storage?.removeItem(key);
}
