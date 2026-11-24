import { isRealISODate } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";

/**
 * 7-day mini-courses: one short practice a day for a week, each day linking to
 * a practice that already exists in LifeZoi (Breathe for Life, Daily Movement,
 * Chair Yoga Studio, movement breaks, My Music, Nature, Focus).
 *
 * Rules, checked by tests:
 * - Seven days per course, each with a link to an existing members' page.
 * - Practices are short (15 minutes or less) and gentle. Nothing asks the person
 *   to hold the breath, push through pain, or reach a number.
 * - Progress is a count of days the person marked done. There are no streaks,
 *   no deadlines, and a day not done is never called missed.
 */

export const COURSE_IDS = ["calm-breathing", "gentle-movement", "rest-and-calm"] as const;
export type CourseId = (typeof COURSE_IDS)[number];

export const COURSE_DAYS = 7;

export type CourseDay = {
  day: number;
  title: string;
  text: string;
  minutes: number;
  href: string;
  linkLabel: string;
};

export type Course = {
  id: CourseId;
  title: string;
  summary: string;
  /** A short safety line shown with every day of the course. */
  care: string;
  days: CourseDay[];
};

const OPEN_BREATHE = msg("Open Breathe for Life");
const OPEN_DAILY_MOVEMENT = msg("Open Daily Movement");
const OPEN_CHAIR_YOGA = msg("Open Chair Yoga Studio");
const OPEN_BREAKS = msg("Open movement breaks");
const OPEN_MUSIC = msg("Open My Music");
const OPEN_NATURE = msg("Open Nature");
const OPEN_FOCUS = msg("Open Focus & Brain Training");
const OPEN_MOVEMENT = msg("Open Movement");

export const COURSES: Course[] = [
  {
    id: "calm-breathing",
    title: msg("A week of calm breathing"),
    summary: msg("Seven short breathing practices that build from simple nose breathing to a full calm session."),
    care: msg("Breathe softly and never hold your breath. If you feel dizzy or uncomfortable, stop and breathe normally."),
    days: [
      { day: 1, title: msg("Notice your breath"), text: msg("Sit comfortably and breathe through your nose for three minutes. Just notice the breath without changing it."), minutes: 3, href: "/breathe/practice", linkLabel: OPEN_BREATHE },
      { day: 2, title: msg("A longer out-breath"), text: msg("Try the calm pace: in for 4, out for 6. Let the out-breath be slow and easy."), minutes: 3, href: "/breathe/practice", linkLabel: OPEN_BREATHE },
      { day: 3, title: msg("Belly breathing"), text: msg("Rest one hand on your belly and let it rise as you breathe in and fall as you breathe out."), minutes: 5, href: "/breathe/practice", linkLabel: OPEN_BREATHE },
      { day: 4, title: msg("Learn why nose breathing helps"), text: msg("Read the short Breathe for Life page about nose breathing, then do one quick session."), minutes: 5, href: "/breathe/learn", linkLabel: OPEN_BREATHE },
      { day: 5, title: msg("Humming breath"), text: msg("Add a soft hum on the out-breath, like a quiet bee. Hum only as long as feels easy."), minutes: 5, href: "/breathe/practice", linkLabel: OPEN_BREATHE },
      { day: 6, title: msg("Breathing with music"), text: msg("Play a calm track from My Music and breathe slowly with it for a few minutes."), minutes: 5, href: "/library/music", linkLabel: OPEN_MUSIC },
      { day: 7, title: msg("Your full calm session"), text: msg("Do the full guided session from start to finish. Notice how you feel afterwards."), minutes: 9, href: "/breathe/practice", linkLabel: OPEN_BREATHE },
    ],
  },
  {
    id: "gentle-movement",
    title: msg("A week of gentle movement"),
    summary: msg("Seven short ways to move a little more, standing or seated, at your own pace."),
    care: msg("Move gently and stay within what feels comfortable. Stop if anything hurts or you feel dizzy, and use a chair for support if you need it."),
    days: [
      { day: 1, title: msg("A short movement break"), text: msg("Stand up and follow one short movement break. Two or three minutes is plenty."), minutes: 3, href: "/academy/move/breaks", linkLabel: OPEN_BREAKS },
      { day: 2, title: msg("Morning stretch"), text: msg("Choose a short morning video in Daily Movement and follow it slowly."), minutes: 10, href: "/academy/move/studio/daily-movement", linkLabel: OPEN_DAILY_MOVEMENT },
      { day: 3, title: msg("Chair yoga"), text: msg("Pick a short seated session in the Chair Yoga Studio. Everything can be done sitting down."), minutes: 10, href: "/academy/move/studio/chair-yoga", linkLabel: OPEN_CHAIR_YOGA },
      { day: 4, title: msg("An easy walk"), text: msg("Take an easy walk, outside or around your home, at a pace where you can still talk."), minutes: 10, href: "/academy/move", linkLabel: OPEN_MOVEMENT },
      { day: 5, title: msg("Gentle balance"), text: msg("Try a short balance video in Daily Movement. Keep a counter or sturdy chair within reach."), minutes: 10, href: "/academy/move/studio/daily-movement", linkLabel: OPEN_DAILY_MOVEMENT },
      { day: 6, title: msg("Move to music"), text: msg("Put on a song you enjoy from My Music and move freely, seated or standing."), minutes: 5, href: "/library/music", linkLabel: OPEN_MUSIC },
      { day: 7, title: msg("Evening wind-down"), text: msg("Finish the week with a short evening video in Daily Movement or a seated chair yoga session."), minutes: 10, href: "/academy/move/studio/daily-movement", linkLabel: OPEN_DAILY_MOVEMENT },
    ],
  },
  {
    id: "rest-and-calm",
    title: msg("A week of rest and calm"),
    summary: msg("Seven quiet moments with calm music, nature sounds, slow breathing, and short breaks for the mind."),
    care: msg("These are moments of rest, not a treatment. If you often feel very low or anxious, please talk with a health professional."),
    days: [
      { day: 1, title: msg("Five quiet minutes"), text: msg("Play a calm track from My Music. Sit, rest your eyes, and simply listen."), minutes: 5, href: "/library/music", linkLabel: OPEN_MUSIC },
      { day: 2, title: msg("Sounds of nature"), text: msg("Open Nature and spend a few minutes with one nature scene or sound."), minutes: 5, href: "/nature", linkLabel: OPEN_NATURE },
      { day: 3, title: msg("A slow breath before bed"), text: msg("In the evening, do a quick breathing session at the calm pace."), minutes: 3, href: "/breathe/practice", linkLabel: OPEN_BREATHE },
      { day: 4, title: msg("A short focus break"), text: msg("Use the Focus timer for one short session, then take the break it offers."), minutes: 10, href: "/focus", linkLabel: OPEN_FOCUS },
      { day: 5, title: msg("Seated stretch"), text: msg("Follow a short seated session in the Chair Yoga Studio to loosen your neck and shoulders."), minutes: 10, href: "/academy/move/studio/chair-yoga", linkLabel: OPEN_CHAIR_YOGA },
      { day: 6, title: msg("Music and breathing"), text: msg("Play calm music and breathe slowly with it, out-breath a little longer than the in-breath."), minutes: 5, href: "/library/music", linkLabel: OPEN_MUSIC },
      { day: 7, title: msg("Look back on your week"), text: msg("Choose the moment from this week you liked most and do it again."), minutes: 5, href: "/library/music", linkLabel: OPEN_MUSIC },
    ],
  },
];

export const COURSE_NOTE = msg("General wellness ideas, not medical advice. Check with your doctor before starting something new if you have a health condition.");

export function courseById(id: string): Course | undefined {
  return COURSES.find((course) => course.id === id);
}

// ---------- progress ----------

export type CourseProgress = {
  startedOn: string;
  /** Days the person marked done, with the date they marked each one. */
  done: { day: number; date: string }[];
};

export type CoursesState = {
  /** The course shown first on the dashboard. Empty when none is chosen. */
  current: CourseId | "";
  progress: Partial<Record<CourseId, CourseProgress>>;
};

export function emptyCourses(): CoursesState {
  return { current: "", progress: {} };
}

export function isEmptyCourses(state: CoursesState): boolean {
  return !state.current && Object.keys(state.progress).length === 0;
}

function isCourseId(value: unknown): value is CourseId {
  return typeof value === "string" && (COURSE_IDS as readonly string[]).includes(value);
}

export function sanitizeCourses(value: unknown): CoursesState {
  const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const raw = row.progress && typeof row.progress === "object" && !Array.isArray(row.progress) ? (row.progress as Record<string, unknown>) : {};
  const progress: CoursesState["progress"] = {};
  for (const [id, entry] of Object.entries(raw)) {
    if (!isCourseId(id) || !entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    if (typeof item.startedOn !== "string" || !isRealISODate(item.startedOn)) continue;
    const seen = new Set<number>();
    const done = (Array.isArray(item.done) ? item.done : [])
      .map((mark) => {
        const m = mark && typeof mark === "object" ? (mark as Record<string, unknown>) : {};
        const day = typeof m.day === "number" && Number.isInteger(m.day) && m.day >= 1 && m.day <= COURSE_DAYS ? m.day : 0;
        return day && typeof m.date === "string" && isRealISODate(m.date) && !seen.has(day) && seen.add(day) ? { day, date: m.date } : null;
      })
      .filter((mark): mark is { day: number; date: string } => mark !== null)
      .sort((a, b) => a.day - b.day);
    progress[id] = { startedOn: item.startedOn, done };
  }
  const current = isCourseId(row.current) && progress[row.current] ? row.current : "";
  return { current, progress };
}

/** Start a course, or come back to it. Coming back keeps the days already done. */
export function startCourse(state: CoursesState, id: CourseId, today: string): CoursesState {
  const existing = state.progress[id];
  return { current: id, progress: { ...state.progress, [id]: existing ?? { startedOn: today, done: [] } } };
}

/** Begin a course again from day 1. */
export function restartCourse(state: CoursesState, id: CourseId, today: string): CoursesState {
  return { current: id, progress: { ...state.progress, [id]: { startedOn: today, done: [] } } };
}

/** Put the course aside. Its progress is kept for later. */
export function pauseCourse(state: CoursesState): CoursesState {
  return { ...state, current: "" };
}

export function markDay(state: CoursesState, id: CourseId, day: number, today: string, done: boolean): CoursesState {
  const existing = state.progress[id] ?? { startedOn: today, done: [] };
  if (day < 1 || day > COURSE_DAYS) return state;
  const others = existing.done.filter((mark) => mark.day !== day);
  const next = done ? [...others, { day, date: today }].sort((a, b) => a.day - b.day) : others;
  return { ...state, progress: { ...state.progress, [id]: { ...existing, done: next } } };
}

export type CourseSummary = {
  doneCount: number;
  /** The first day not yet done, or null when all seven are done. */
  nextDay: number | null;
  finished: boolean;
  /** A day was already marked done today. A gentle cue to rest, never a lock. */
  doneToday: boolean;
};

export function summarize(progress: CourseProgress | undefined, today: string): CourseSummary {
  const done = new Set((progress?.done ?? []).map((mark) => mark.day));
  let nextDay: number | null = null;
  for (let day = 1; day <= COURSE_DAYS; day += 1)
    if (!done.has(day)) {
      nextDay = day;
      break;
    }
  return {
    doneCount: done.size,
    nextDay,
    finished: nextDay === null,
    doneToday: (progress?.done ?? []).some((mark) => mark.date === today),
  };
}

/** Course practices marked done between two dates, inclusive. */
export function courseDaysIn(state: CoursesState, start: string, end: string): { date: string }[] {
  return Object.values(state.progress).flatMap((item) => (item?.done ?? []).filter((mark) => mark.date >= start && mark.date <= end));
}
