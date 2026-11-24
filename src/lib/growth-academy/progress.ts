import { addIsoDays, isRealISODate } from "@/lib/dates";
import type { GrowthCourse, GrowthLesson } from "@/lib/growth-academy/types";

/**
 * Training Academy progress: one record per person, saved to the account's
 * `academy_state` row (see ./store.ts) and kept in the browser as a copy.
 *
 * Rules, checked by tests:
 * - A lesson is completed only by `completeLesson`, which the page calls when
 *   the person presses Complete lesson. Opening a lesson, reading every part,
 *   or finishing the exercise never completes it.
 * - A course is completed when every required lesson is completed. The date is
 *   saved once and never moves.
 * - Daily challenges are recorded on their own and never touch lessons.
 * - Text the person types is saved only when they press Save, and is trimmed
 *   to a fixed length so the account row stays within its size limit.
 */

export const LESSON_PARTS = 7;
export const TEXT_LIMIT = 1500;
export const SAVED_PRACTICE_LIMIT = 3;
export const HISTORY_LIMIT = 300;
export const DAYS_LIMIT = 400;
export const SECONDS_PER_LESSON_LIMIT = 4 * 3600;

export type LessonStatus = "not-started" | "in-progress" | "completed";

export type LessonRecord = {
  status: "in-progress" | "completed";
  startedOn: string;
  lastOn: string;
  completedOn: string;
  /** The lesson part shown last (0 = introduction … 6 = key takeaways). */
  part: number;
  exerciseDone: boolean;
  practiceTries: number;
  /** Time with the lesson open and visible. */
  seconds: number;
  /** Exercise answers the person chose to save, by field id. */
  answers: Record<string, string>;
  /** Practice answers the person chose to save, newest first. */
  practice: string[];
  /** Reflection answers the person chose to save, by question index. */
  reflections: string[];
  savedOn: string;
};

export type CourseRecord = {
  startedOn: string;
  lastOn: string;
  completedOn: string;
  /** The lesson number to continue from. */
  currentLesson: number;
};

export const HISTORY_KINDS = ["started-lesson", "completed-lesson", "completed-course", "challenge", "achievement", "saved"] as const;
export type HistoryKind = (typeof HISTORY_KINDS)[number];

export type HistoryEntry = {
  date: string;
  kind: HistoryKind;
  course: string;
  lesson: string;
  /** Challenge or achievement id. */
  ref: string;
};

export type AcademyState = {
  lessons: Record<string, LessonRecord>;
  courses: Record<string, CourseRecord>;
  /** Achievement id → the date it was earned. Never removed. */
  achievements: Record<string, string>;
  /** Date → the daily challenge completed that day. */
  challenges: Record<string, string>;
  /** Local dates with any learning activity (lesson or challenge). */
  days: string[];
  history: HistoryEntry[];
  prefs: { voice: boolean };
  updatedAt: string;
};

export type Clock = { today: string };

export function emptyAcademy(): AcademyState {
  return { lessons: {}, courses: {}, achievements: {}, challenges: {}, days: [], history: [], prefs: { voice: true }, updatedAt: "" };
}

export function isEmptyAcademy(state: AcademyState): boolean {
  return (
    Object.keys(state.lessons).length === 0 &&
    Object.keys(state.courses).length === 0 &&
    Object.keys(state.challenges).length === 0 &&
    Object.keys(state.achievements).length === 0 &&
    state.prefs.voice
  );
}

// ---------- sanitizing ----------

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
const isId = (value: unknown): value is string => typeof value === "string" && ID.test(value);
const date = (value: unknown): string => (typeof value === "string" && isRealISODate(value) ? value : "");
const int = (value: unknown, min: number, max: number, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

export function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  // Keep line breaks; drop other control characters.
  return value.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "").trim().slice(0, TEXT_LIMIT);
}

function sanitizeLesson(value: unknown): LessonRecord | null {
  const row = asRecord(value);
  const startedOn = date(row.startedOn);
  if (!startedOn) return null;
  const status = row.status === "completed" ? "completed" : "in-progress";
  const completedOn = status === "completed" ? date(row.completedOn) || startedOn : "";
  const answers: Record<string, string> = {};
  for (const [key, text] of Object.entries(asRecord(row.answers)).slice(0, 12)) {
    const clean = cleanText(text);
    if (isId(key) && clean) answers[key] = clean;
  }
  return {
    status,
    startedOn,
    lastOn: date(row.lastOn) || startedOn,
    completedOn,
    part: int(row.part, 0, LESSON_PARTS - 1, 0),
    exerciseDone: row.exerciseDone === true,
    practiceTries: int(row.practiceTries, 0, 999, 0),
    seconds: int(row.seconds, 0, SECONDS_PER_LESSON_LIMIT, 0),
    answers,
    practice: (Array.isArray(row.practice) ? row.practice : []).map(cleanText).filter(Boolean).slice(0, SAVED_PRACTICE_LIMIT),
    reflections: (Array.isArray(row.reflections) ? row.reflections : []).slice(0, 6).map(cleanText),
    savedOn: date(row.savedOn),
  };
}

export function sanitizeAcademy(input: unknown): AcademyState {
  const row = asRecord(input);
  const lessons: AcademyState["lessons"] = {};
  for (const [id, value] of Object.entries(asRecord(row.lessons)).slice(0, 2000)) {
    const lesson = isId(id) ? sanitizeLesson(value) : null;
    if (lesson) lessons[id] = lesson;
  }
  const courses: AcademyState["courses"] = {};
  for (const [id, value] of Object.entries(asRecord(row.courses)).slice(0, 200)) {
    const course = asRecord(value);
    const startedOn = date(course.startedOn);
    if (!isId(id) || !startedOn) continue;
    courses[id] = {
      startedOn,
      lastOn: date(course.lastOn) || startedOn,
      completedOn: date(course.completedOn),
      currentLesson: int(course.currentLesson, 1, 999, 1),
    };
  }
  const achievements: Record<string, string> = {};
  for (const [id, value] of Object.entries(asRecord(row.achievements)).slice(0, 500)) if (isId(id) && date(value)) achievements[id] = date(value);
  const challenges: Record<string, string> = {};
  for (const [day, value] of Object.entries(asRecord(row.challenges)).sort().slice(-DAYS_LIMIT)) if (date(day) && isId(value)) challenges[day] = value as string;
  const days = [...new Set((Array.isArray(row.days) ? row.days : []).map(date).filter(Boolean))].sort().slice(-DAYS_LIMIT);
  const history = (Array.isArray(row.history) ? row.history : [])
    .map((value): HistoryEntry | null => {
      const item = asRecord(value);
      const kind = (HISTORY_KINDS as readonly string[]).includes(item.kind as string) ? (item.kind as HistoryKind) : null;
      const day = date(item.date);
      if (!kind || !day) return null;
      const id = (field: unknown) => (isId(field) ? field : "");
      return { date: day, kind, course: id(item.course), lesson: id(item.lesson), ref: id(item.ref) };
    })
    .filter((item): item is HistoryEntry => item !== null)
    .slice(0, HISTORY_LIMIT);
  const prefs = asRecord(row.prefs);
  return {
    lessons,
    courses,
    achievements,
    challenges,
    days,
    history,
    prefs: { voice: prefs.voice !== false },
    updatedAt: typeof row.updatedAt === "string" ? row.updatedAt.slice(0, 40) : "",
  };
}

// ---------- reading ----------

export function lessonStatus(state: AcademyState, lessonId: string): LessonStatus {
  return state.lessons[lessonId]?.status ?? "not-started";
}

export function requiredCount(course: GrowthCourse): number {
  return Math.min(course.lessons.length, course.requiredLessons ?? course.lessons.length);
}

export function isCourseComplete(state: AcademyState, course: GrowthCourse): boolean {
  const done = course.lessons.filter((lesson) => lessonStatus(state, lesson.id) === "completed").length;
  return course.lessons.length > 0 && done >= requiredCount(course);
}

export type CourseProgress = {
  completed: number;
  total: number;
  remaining: number;
  /** Whole percent of lessons completed, 0 to 100. */
  percent: number;
  started: boolean;
  startedOn: string;
  lastOn: string;
  completedOn: string;
  /** The lesson to open next: the current one if not completed, else the first not completed. */
  next: GrowthLesson;
  exercisesDone: number;
  /** Lessons with an exercise (every lesson in this format has one). */
  exercisesTotal: number;
};

export function courseProgress(state: AcademyState, course: GrowthCourse): CourseProgress {
  const record = state.courses[course.id];
  const completed = course.lessons.filter((lesson) => lessonStatus(state, lesson.id) === "completed").length;
  const total = course.lessons.length;
  const notDone = (lesson: GrowthLesson) => lessonStatus(state, lesson.id) !== "completed";
  const current = course.lessons.find((lesson) => lesson.number === record?.currentLesson);
  const next =
    (current && notDone(current) ? current : undefined) ??
    course.lessons.find((lesson) => notDone(lesson) && lesson.number > (record?.currentLesson ?? 0)) ??
    course.lessons.find(notDone) ??
    course.lessons[0];
  return {
    completed,
    total,
    remaining: total - completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    started: Boolean(record) || course.lessons.some((lesson) => Boolean(state.lessons[lesson.id])),
    startedOn: record?.startedOn ?? "",
    lastOn: record?.lastOn ?? "",
    completedOn: isCourseComplete(state, course) ? record?.completedOn || "" : "",
    next,
    exercisesDone: course.lessons.filter((lesson) => state.lessons[lesson.id]?.exerciseDone).length,
    exercisesTotal: total,
  };
}

/** Days in a row with learning activity, ending today or yesterday. Zero is shown kindly, never as a loss. */
export function learningStreak(state: AcademyState, today: string): number {
  const days = new Set(state.days);
  let cursor = days.has(today) ? today : addIsoDays(today, -1);
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = addIsoDays(cursor, -1);
  }
  return count;
}

export type JourneySummary = {
  coursesStarted: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  lessonsRemaining: number;
  seconds: number;
  streak: number;
  achievements: number;
  lastOn: string;
  challengesDone: number;
  /** Where Continue Learning goes. Null before anything was started. */
  continueAt: { course: GrowthCourse; lesson: GrowthLesson } | null;
};

export function journeySummary(state: AcademyState, courses: readonly GrowthCourse[], today: string): JourneySummary {
  const progress = courses.map((course) => ({ course, progress: courseProgress(state, course) }));
  const lastOn = [...Object.values(state.courses).map((c) => c.lastOn), ...Object.keys(state.challenges)].sort().at(-1) ?? "";
  const open = progress
    .filter((item) => item.progress.started && item.progress.remaining > 0)
    .sort((a, b) => (b.progress.lastOn || "").localeCompare(a.progress.lastOn || ""));
  const first = open[0];
  return {
    coursesStarted: progress.filter((item) => item.progress.started).length,
    coursesCompleted: progress.filter((item) => isCourseComplete(state, item.course)).length,
    lessonsCompleted: progress.reduce((sum, item) => sum + item.progress.completed, 0),
    lessonsRemaining: progress.reduce((sum, item) => sum + item.progress.remaining, 0),
    seconds: Object.values(state.lessons).reduce((sum, lesson) => sum + lesson.seconds, 0),
    streak: learningStreak(state, today),
    achievements: Object.keys(state.achievements).length,
    lastOn,
    challengesDone: Object.keys(state.challenges).length,
    continueAt: first ? { course: first.course, lesson: first.progress.next } : null,
  };
}

// ---------- changing ----------

function withDay(state: AcademyState, today: string): AcademyState {
  if (state.days.includes(today)) return state;
  return { ...state, days: [...state.days, today].sort().slice(-DAYS_LIMIT) };
}

function log(state: AcademyState, entry: Omit<HistoryEntry, "course" | "lesson" | "ref"> & Partial<HistoryEntry>): AcademyState {
  const item: HistoryEntry = { course: "", lesson: "", ref: "", ...entry };
  return { ...state, history: [item, ...state.history].slice(0, HISTORY_LIMIT) };
}

function touchCourse(state: AcademyState, course: GrowthCourse, lessonNumber: number, today: string): AcademyState {
  const existing = state.courses[course.id];
  const record: CourseRecord = existing
    ? { ...existing, lastOn: today, currentLesson: lessonNumber }
    : { startedOn: today, lastOn: today, completedOn: "", currentLesson: lessonNumber };
  return { ...state, courses: { ...state.courses, [course.id]: record } };
}

/** Opening a lesson starts it (once) and makes it the course's current lesson. It never completes it. */
export function openLesson(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, { today }: Clock): AcademyState {
  let next = touchCourse(state, course, lesson.number, today);
  const existing = next.lessons[lesson.id];
  if (existing) {
    next = { ...next, lessons: { ...next.lessons, [lesson.id]: { ...existing, lastOn: today } } };
  } else {
    const record: LessonRecord = {
      status: "in-progress",
      startedOn: today,
      lastOn: today,
      completedOn: "",
      part: 0,
      exerciseDone: false,
      practiceTries: 0,
      seconds: 0,
      answers: {},
      practice: [],
      reflections: [],
      savedOn: "",
    };
    next = log({ ...next, lessons: { ...next.lessons, [lesson.id]: record } }, { date: today, kind: "started-lesson", course: course.id, lesson: lesson.id });
  }
  return withDay(next, today);
}

function changeLesson(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, clock: Clock, change: (record: LessonRecord) => LessonRecord): AcademyState {
  const opened = state.lessons[lesson.id] ? state : openLesson(state, course, lesson, clock);
  const record = opened.lessons[lesson.id] as LessonRecord;
  return { ...opened, lessons: { ...opened.lessons, [lesson.id]: { ...change(record), lastOn: clock.today } } };
}

export function setPart(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, part: number, clock: Clock): AcademyState {
  const clamped = Math.min(LESSON_PARTS - 1, Math.max(0, Math.round(part)));
  return changeLesson(state, course, lesson, clock, (record) => ({ ...record, part: clamped }));
}

export function setExerciseDone(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, done: boolean, clock: Clock): AcademyState {
  return changeLesson(state, course, lesson, clock, (record) => ({ ...record, exerciseDone: done }));
}

/** Saves exercise answers. Empty answers remove what was saved for that box. */
export function saveAnswers(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, answers: Record<string, string>, clock: Clock): AcademyState {
  const allowed = new Set(lesson.exercise.fields.map((field) => field.id));
  const next = changeLesson(state, course, lesson, clock, (record) => {
    const merged = { ...record.answers };
    for (const [key, value] of Object.entries(answers)) {
      if (!allowed.has(key)) continue;
      const clean = cleanText(value);
      if (clean) merged[key] = clean;
      else delete merged[key];
    }
    return { ...record, answers: merged, savedOn: clock.today };
  });
  return log(next, { date: clock.today, kind: "saved", course: course.id, lesson: lesson.id, ref: "exercise" });
}

export function savePractice(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, text: string, clock: Clock): AcademyState {
  const clean = cleanText(text);
  if (!clean) return state;
  const next = changeLesson(state, course, lesson, clock, (record) => ({
    ...record,
    practice: [clean, ...record.practice.filter((item) => item !== clean)].slice(0, SAVED_PRACTICE_LIMIT),
    savedOn: clock.today,
  }));
  return log(next, { date: clock.today, kind: "saved", course: course.id, lesson: lesson.id, ref: "practice" });
}

/** Counts one go at the interactive practice. Practising again is always allowed. */
export function countPracticeTry(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, clock: Clock): AcademyState {
  return changeLesson(state, course, lesson, clock, (record) => ({ ...record, practiceTries: record.practiceTries + 1 }));
}

export function saveReflections(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, answers: string[], clock: Clock): AcademyState {
  const reflections = lesson.reflection.map((_, index) => cleanText(answers[index]));
  const next = changeLesson(state, course, lesson, clock, (record) => ({ ...record, reflections, savedOn: clock.today }));
  return log(next, { date: clock.today, kind: "saved", course: course.id, lesson: lesson.id, ref: "reflection" });
}

/** Removes every saved answer for one lesson. Progress stays. */
export function clearSavedText(state: AcademyState, lessonId: string): AcademyState {
  const record = state.lessons[lessonId];
  if (!record) return state;
  return { ...state, lessons: { ...state.lessons, [lessonId]: { ...record, answers: {}, practice: [], reflections: [], savedOn: "" } } };
}

export function addSeconds(state: AcademyState, lessonId: string, seconds: number): AcademyState {
  const record = state.lessons[lessonId];
  if (!record || !(seconds > 0)) return state;
  const added = Math.min(600, Math.round(seconds));
  return { ...state, lessons: { ...state.lessons, [lessonId]: { ...record, seconds: Math.min(SECONDS_PER_LESSON_LIMIT, record.seconds + added) } } };
}

/**
 * The only way a lesson becomes completed: the person pressed Complete lesson.
 * Completing the last required lesson completes the course and saves its date once.
 */
export function completeLesson(state: AcademyState, course: GrowthCourse, lesson: GrowthLesson, clock: Clock): AcademyState {
  if (!course.lessons.some((item) => item.id === lesson.id)) return state;
  const already = lessonStatus(state, lesson.id) === "completed";
  let next = changeLesson(state, course, lesson, clock, (record) =>
    already ? record : { ...record, status: "completed", completedOn: clock.today },
  );
  if (!already) next = log(next, { date: clock.today, kind: "completed-lesson", course: course.id, lesson: lesson.id });
  const following = course.lessons.find((item) => item.number > lesson.number && lessonStatus(next, item.id) !== "completed") ?? course.lessons.find((item) => lessonStatus(next, item.id) !== "completed");
  const record = next.courses[course.id] as CourseRecord;
  next = { ...next, courses: { ...next.courses, [course.id]: { ...record, currentLesson: (following ?? lesson).number } } };
  if (isCourseComplete(next, course) && !record.completedOn) {
    next = { ...next, courses: { ...next.courses, [course.id]: { ...(next.courses[course.id] as CourseRecord), completedOn: clock.today } } };
    next = log(next, { date: clock.today, kind: "completed-course", course: course.id });
  }
  return withDay(next, clock.today);
}

/** Records today's challenge once. It never changes lesson or course progress. */
export function completeChallenge(state: AcademyState, challengeId: string, { today }: Clock): AcademyState {
  if (!isId(challengeId) || state.challenges[today]) return state;
  const next = { ...state, challenges: { ...state.challenges, [today]: challengeId } };
  return withDay(log(next, { date: today, kind: "challenge", ref: challengeId }), today);
}

export function setVoicePref(state: AcademyState, voice: boolean): AcademyState {
  return { ...state, prefs: { ...state.prefs, voice } };
}

/** Lessons with saved text, newest first, for the Saved reflections list. */
export function savedEntries(state: AcademyState, courses: readonly GrowthCourse[]) {
  const out: { course: GrowthCourse; lesson: GrowthLesson; record: LessonRecord }[] = [];
  for (const course of courses)
    for (const lesson of course.lessons) {
      const record = state.lessons[lesson.id];
      if (!record) continue;
      const hasText = Object.keys(record.answers).length > 0 || record.practice.length > 0 || record.reflections.some(Boolean);
      if (hasText) out.push({ course, lesson, record });
    }
  return out.sort((a, b) => b.record.savedOn.localeCompare(a.record.savedOn));
}
