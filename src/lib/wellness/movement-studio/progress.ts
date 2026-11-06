import { isRealISODate, localISODate } from "@/lib/dates";
import { lessonById } from "@/lib/wellness/movement-studio/catalog";

export const MOVEMENT_STUDIO_KEY = "lifezoi.movement-studio.v1";

export const MISSION_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type MissionDay = (typeof MISSION_DAYS)[number];

export const missionPlan: { day: MissionDay; label: string; focus: string; lessonId: string }[] = [
  { day: "mon", label: "Monday", focus: "Hands", lessonId: "video-hands" },
  { day: "tue", label: "Tuesday", focus: "Balance", lessonId: "video-balance" },
  { day: "wed", label: "Wednesday", focus: "Legs", lessonId: "script-strength" },
  { day: "thu", label: "Thursday", focus: "Back", lessonId: "script-back" },
  { day: "fri", label: "Friday", focus: "10-minute walk", lessonId: "script-walk" },
  { day: "sat", label: "Saturday", focus: "Gentle yoga", lessonId: "script-yoga" },
  { day: "sun", label: "Sunday", focus: "Breathe", lessonId: "script-breathe" },
];

export type StudioProgress = {
  completedLessonIds: string[];
  missionWeeks: Partial<Record<string, Partial<Record<MissionDay, true>>>>;
};

export function emptyProgress(): StudioProgress {
  return { completedLessonIds: [], missionWeeks: {} };
}

export function dateFromIso(iso: string): Date | null {
  if (!isRealISODate(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function weekStartMonday(iso: string): string | null {
  const date = dateFromIso(iso);
  if (!date) return null;
  const weekday = date.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + diff);
  return localISODate(date);
}

export function missionDayForDate(iso: string): MissionDay | null {
  const date = dateFromIso(iso);
  if (!date) return null;
  const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][date.getDay()];
  return day === "mon" || day === "tue" || day === "wed" || day === "thu" || day === "fri" || day === "sat" || day === "sun"
    ? day
    : null;
}

function knownLessonIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  const clean: string[] = [];
  for (const id of ids) {
    if (typeof id !== "string" || seen.has(id) || !lessonById(id)) continue;
    seen.add(id);
    clean.push(id);
  }
  return clean.slice(0, 80);
}

function cleanWeek(value: unknown): Partial<Record<MissionDay, true>> {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  const week: Partial<Record<MissionDay, true>> = {};
  for (const day of MISSION_DAYS) {
    if (record[day] === true) week[day] = true;
  }
  return week;
}

export function sanitizeProgress(value: unknown): StudioProgress {
  if (!value || typeof value !== "object") return emptyProgress();
  const record = value as Record<string, unknown>;
  const missionWeeks: StudioProgress["missionWeeks"] = {};
  if (record.missionWeeks && typeof record.missionWeeks === "object") {
    for (const [key, week] of Object.entries(record.missionWeeks as Record<string, unknown>)) {
      if (weekStartMonday(key) !== key) continue;
      const cleaned = cleanWeek(week);
      if (Object.keys(cleaned).length > 0) missionWeeks[key] = cleaned;
    }
  }
  return {
    completedLessonIds: knownLessonIds(record.completedLessonIds),
    missionWeeks,
  };
}

export function loadProgress(storage: Pick<Storage, "getItem"> | null): StudioProgress {
  if (!storage) return emptyProgress();
  try {
    const raw = storage.getItem(MOVEMENT_STUDIO_KEY);
    if (!raw) return emptyProgress();
    return sanitizeProgress(JSON.parse(raw) as unknown);
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(storage: Pick<Storage, "setItem">, state: StudioProgress) {
  storage.setItem(MOVEMENT_STUDIO_KEY, JSON.stringify(sanitizeProgress(state)));
}

export function markLessonComplete(state: StudioProgress, lessonId: string): StudioProgress {
  if (!lessonById(lessonId) || state.completedLessonIds.includes(lessonId)) return state;
  return { ...state, completedLessonIds: [...state.completedLessonIds, lessonId] };
}

export function markMission(state: StudioProgress, day: MissionDay, today: string): StudioProgress {
  const start = weekStartMonday(today);
  if (!start) return state;
  const current = state.missionWeeks[start] ?? {};
  if (current[day] === true) return state;
  return {
    ...state,
    missionWeeks: { ...state.missionWeeks, [start]: { ...current, [day]: true } },
  };
}

/** Playing a film does not mark a lesson or a mission complete. */
export function progressAfterPlay(state: StudioProgress, lessonId: string): StudioProgress {
  if (!lessonById(lessonId)) return state;
  return state;
}

export function restartWeek(state: StudioProgress, today: string): StudioProgress {
  const start = weekStartMonday(today);
  if (!start || !state.missionWeeks[start]) return state;
  const missionWeeks = { ...state.missionWeeks };
  delete missionWeeks[start];
  return { ...state, missionWeeks };
}

export function videoSecondsCompleted(state: StudioProgress): number {
  return state.completedLessonIds.reduce((total, id) => {
    const lesson = lessonById(id);
    return lesson?.kind === "video" ? total + lesson.durationSeconds : total;
  }, 0);
}

export function completedLessonCount(state: StudioProgress): number {
  return state.completedLessonIds.length;
}

export function completedCategoryCount(state: StudioProgress): number {
  const categories = new Set<string>();
  for (const id of state.completedLessonIds) {
    const lesson = lessonById(id);
    if (lesson) categories.add(lesson.categorySlug);
  }
  return categories.size;
}

export function missionsMarked(state: StudioProgress, today: string): number {
  const start = weekStartMonday(today);
  if (!start) return 0;
  const week = state.missionWeeks[start] ?? {};
  return MISSION_DAYS.filter((day) => week[day] === true).length;
}

export function isMissionMarked(state: StudioProgress, day: MissionDay, today: string): boolean {
  const start = weekStartMonday(today);
  if (!start) return false;
  return state.missionWeeks[start]?.[day] === true;
}

export const PROGRESS_COPY = {
  lessons: "Lessons marked complete",
  minutes: "Video minutes",
  week: "This week",
  categories: "Categories with a completed lesson",
  missions: "Missions marked this week",
  storage: "Saved in this browser tab. Nothing is sent to an account.",
  minutesNote: "Video minutes are the real player length of films you mark complete. A written script adds none. Pressing play does not mark anything complete.",
  restart: "Restart this week clears the seven mission checks. Lessons you already marked stay marked.",
} as const;
