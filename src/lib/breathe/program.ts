import { addIsoDays, daysBetween, mondayOf } from "@/lib/dates";
import type { Assessment } from "@/lib/types";
import type { BreatheChallenge, BreatheHabits, BreatheSession, BreatheState, HabitFrequency } from "@/lib/breathe/state";

/**
 * Breathe for Life: the guided session, the weekly calendar, and the 30-day challenge.
 *
 * Safety rules built into the data, and checked by tests:
 * - No step ever asks the person to hold the breath. There is no "hold" phase at all.
 * - Exhalations are never shorter than inhalations, so the pace cannot push toward over-breathing.
 * - Every breath fits a slow, comfortable rhythm (no breath shorter than 3 seconds in or out).
 */

export type StepId = "nasal" | "bhramari" | "diaphragm" | "rest";
export type Phase = "in" | "out" | "hum" | "natural";
export type Pace = BreatheState["pace"];
export type Length = BreatheState["length"];

export type SessionStep = {
  id: StepId;
  title: string;
  seconds: number;
  /** Spoken and shown when the step begins. */
  intro: string;
  cues: string[];
  /** The breath pattern for one cycle. Empty for natural breathing. */
  pattern: { phase: Exclude<Phase, "natural">; seconds: number }[];
};

export const PACES: Record<Pace, { label: string; inhale: number; exhale: number; hum: number }> = {
  gentle: { label: "Gentle pace: in for 3, out for 4", inhale: 3, exhale: 4, hum: 5 },
  standard: { label: "Slower pace: in for 4, out for 6", inhale: 4, exhale: 6, hum: 7 },
};

/** Minutes for each step: the full session follows the suggested 2 + 2 + 3 + 1½ minutes. */
const LENGTHS: Record<Length, Record<StepId, number>> = {
  full: { nasal: 120, bhramari: 120, diaphragm: 180, rest: 90 },
  short: { nasal: 60, bhramari: 90, diaphragm: 90, rest: 60 },
};

export const STEP_TEXT: Record<StepId, { title: string; intro: string; cues: string[] }> = {
  nasal: {
    title: "Relaxed nasal breathing",
    intro: "Sit comfortably. Close your mouth gently and breathe in and out through your nose, softly and quietly.",
    cues: ["Let your shoulders drop.", "Keep the breath soft. It does not need to be deep.", "If your nose feels blocked, breathe through your mouth. That is fine."],
  },
  bhramari: {
    title: "Bhramari humming breath",
    intro: "Breathe in gently through your nose. As you breathe out, hum softly with your lips closed, like a quiet bee. Keep the hum comfortable and easy.",
    cues: ["Hum only as long as feels easy, then breathe in again.", "Feel the gentle buzz around your nose and cheeks.", "There is no need to hum loudly or to empty your lungs."],
  },
  diaphragm: {
    title: "Gentle diaphragmatic breathing",
    intro: "Rest one hand on your belly and one on your chest. Breathe in slowly and let your belly rise under your hand. Breathe out and let it fall.",
    cues: ["Your chest stays fairly still. The belly does the moving.", "Do not force a big breath. Small and slow is enough.", "Breathe out a little longer than you breathe in."],
  },
  rest: {
    title: "Relaxation and normal breathing",
    intro: "Let go of any pattern. Breathe however feels natural, and notice how your body feels.",
    cues: ["Notice your feet, your hands, and your face.", "Let your jaw and shoulders soften.", "When you are ready, open your eyes and stretch gently."],
  },
};

/** Which steps a session includes. Week 1 of the challenge learns the basics before humming is added. */
export type SessionFocus = "foundations" | "complete";

export function buildSession(length: Length, pace: Pace, focus: SessionFocus = "complete"): SessionStep[] {
  const p = PACES[pace];
  const time = LENGTHS[length];
  const order: StepId[] = focus === "foundations" ? ["nasal", "diaphragm", "rest"] : ["nasal", "bhramari", "diaphragm", "rest"];
  return order.map((id) => {
    const text = STEP_TEXT[id];
    // In foundations the humming minutes go to the two basic steps instead.
    const extra = focus === "foundations" && id !== "rest" ? Math.round(time.bhramari / 2) : 0;
    const pattern: SessionStep["pattern"] =
      id === "rest"
        ? []
        : id === "bhramari"
          ? [
              { phase: "in", seconds: p.inhale },
              { phase: "hum", seconds: p.hum },
            ]
          : [
              { phase: "in", seconds: p.inhale },
              { phase: "out", seconds: p.exhale },
            ];
    return { id, title: text.title, intro: text.intro, cues: text.cues, seconds: time[id] + extra, pattern };
  });
}

export function sessionSeconds(steps: SessionStep[]): number {
  return steps.reduce((sum, step) => sum + step.seconds, 0);
}

export type PhaseState = {
  done: boolean;
  stepIndex: number;
  step: SessionStep | null;
  phase: Phase;
  /** Seconds into the current breath phase, and its length. */
  phaseElapsed: number;
  phaseLength: number;
  /** A counter that changes with every new phase, so the UI can restart its animation. */
  phaseKey: number;
  stepRemaining: number;
  totalRemaining: number;
};

/** Where the guide is after `elapsed` seconds. Pure, so the timer can be tested without a clock. */
export function phaseAt(steps: SessionStep[], elapsed: number): PhaseState {
  const total = sessionSeconds(steps);
  const t = Math.max(0, elapsed);
  if (t >= total || steps.length === 0) {
    return { done: true, stepIndex: steps.length, step: null, phase: "natural", phaseElapsed: 0, phaseLength: 0, phaseKey: -1, stepRemaining: 0, totalRemaining: 0 };
  }
  let start = 0;
  for (let i = 0; i < steps.length; i += 1) {
    const step = steps[i] as SessionStep;
    if (t < start + step.seconds) {
      const inStep = t - start;
      const base = { done: false, stepIndex: i, step, stepRemaining: step.seconds - inStep, totalRemaining: total - t };
      if (step.pattern.length === 0) {
        return { ...base, phase: "natural", phaseElapsed: inStep, phaseLength: step.seconds, phaseKey: i * 10000 };
      }
      const cycle = step.pattern.reduce((sum, item) => sum + item.seconds, 0);
      const cycles = Math.floor(inStep / cycle);
      let within = inStep - cycles * cycle;
      for (let j = 0; j < step.pattern.length; j += 1) {
        const item = step.pattern[j] as SessionStep["pattern"][number];
        if (within < item.seconds) {
          // A step can end part-way through a breath; the phase is cut short to the step's end.
          const length = Math.min(item.seconds, within + base.stepRemaining);
          return { ...base, phase: item.phase, phaseElapsed: within, phaseLength: length, phaseKey: i * 10000 + cycles * step.pattern.length + j };
        }
        within -= item.seconds;
      }
    }
    start += step.seconds;
  }
  return { done: true, stepIndex: steps.length, step: null, phase: "natural", phaseElapsed: 0, phaseLength: 0, phaseKey: -1, stepRemaining: 0, totalRemaining: 0 };
}

export const PHASE_WORD: Record<Phase, string> = {
  in: "Breathe in",
  out: "Breathe out",
  hum: "Hum softly",
  natural: "Breathe naturally",
};

/** A session of at least one minute is worth saving, even when stopped early. */
export const MIN_SAVED_SECONDS = 60;

// ---------- weekly calendar ----------

export const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const WEEKLY_TARGET = 4;

export type CalendarDay = {
  date: string;
  weekday: number;
  name: string;
  recommended: boolean;
  sessions: number;
  isToday: boolean;
  isFuture: boolean;
};

export function sessionDates(sessions: BreatheSession[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const session of sessions) map.set(session.date, (map.get(session.date) ?? 0) + 1);
  return map;
}

export function weekCalendar(state: Pick<BreatheState, "days" | "sessions">, today: string): CalendarDay[] {
  const monday = mondayOf(today);
  const counts = sessionDates(state.sessions);
  return WEEKDAY_NAMES.map((name, weekday) => {
    const date = addIsoDays(monday, weekday);
    return { date, weekday, name, recommended: state.days.includes(weekday), sessions: counts.get(date) ?? 0, isToday: date === today, isFuture: date > today };
  });
}

export type WeekProgress = { practiceDays: number; recommendedDone: number; extraDays: number; target: number; met: boolean };

/** Days with at least one session this week. Any day counts; extra days are welcome. */
export function weekProgress(state: Pick<BreatheState, "days" | "sessions">, today: string): WeekProgress {
  const days = weekCalendar(state, today);
  const practiced = days.filter((day) => day.sessions > 0);
  const recommendedDone = practiced.filter((day) => day.recommended).length;
  return {
    practiceDays: practiced.length,
    recommendedDone,
    extraDays: practiced.length - recommendedDone,
    target: WEEKLY_TARGET,
    met: practiced.length >= WEEKLY_TARGET,
  };
}

/** True when today is one of the person's chosen practice days. */
export function isPracticeDay(state: Pick<BreatheState, "days">, today: string): boolean {
  const offset = daysBetween(mondayOf(today), today);
  return offset !== null && state.days.includes(offset);
}

export type ConsistencyDay = { date: string; practiced: boolean };

/** The last 30 days, oldest first, for the consistency strip. */
export function last30Days(sessions: BreatheSession[], today: string): ConsistencyDay[] {
  const counts = sessionDates(sessions);
  return Array.from({ length: 30 }, (_, i) => {
    const date = addIsoDays(today, i - 29);
    return { date, practiced: (counts.get(date) ?? 0) > 0 };
  });
}

// ---------- 30-day challenge ----------

export const CHALLENGE_DAYS = 30;

export const CHALLENGE_WEEKS = [
  {
    week: 1,
    title: "Learn nasal and diaphragmatic breathing",
    goal: "Four short sessions of relaxed nasal breathing and gentle belly breathing.",
    focus: "foundations" as SessionFocus,
  },
  {
    week: 2,
    title: "Add Bhramari humming",
    goal: "Four sessions that include two minutes of soft humming.",
    focus: "complete" as SessionFocus,
  },
  {
    week: 3,
    title: "Breathing, walking, and nitrate-rich foods",
    goal: "Four sessions, a few comfortable walks, and leafy greens or beetroot on some days.",
    focus: "complete" as SessionFocus,
  },
  {
    week: 4,
    title: "Build a steady routine",
    goal: "Four sessions on the days that suit you best, so the routine can continue after the challenge.",
    focus: "complete" as SessionFocus,
  },
] as const;

/** Day 1 is the start date. Returns 0 before the start. Days after 30 stay at 31 ("finished"). */
export function challengeDay(challenge: Pick<BreatheChallenge, "startedOn">, today: string): number {
  const diff = daysBetween(challenge.startedOn, today);
  if (diff === null || diff < 0) return 0;
  return Math.min(diff + 1, CHALLENGE_DAYS + 1);
}

/** Week 1 to 4. Days 29 and 30 belong to week 4. */
export function challengeWeek(day: number): 1 | 2 | 3 | 4 {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

export function focusFor(challenge: BreatheChallenge | null, today: string): SessionFocus {
  if (!challenge || challenge.finishedOn) return "complete";
  const day = challengeDay(challenge, today);
  return day >= 1 && day <= CHALLENGE_DAYS && challengeWeek(day) === 1 ? "foundations" : "complete";
}

export type WeekConsistency = { week: number; from: string; to: string; practiceDays: number; target: number; met: boolean };

export type ChallengeSummary = {
  day: number;
  week: 1 | 2 | 3 | 4;
  ended: boolean;
  sessions: number;
  completeSessions: number;
  minutes: number;
  practiceDays: number;
  weeks: WeekConsistency[];
  walkDays: number;
  greensDays: number;
  stressBefore: number | null;
  stressLatest: number | null;
  relaxBefore: number | null;
  relaxLatest: number | null;
  feltAfterAverage: number | null;
};

function avg(values: (number | null)[]): number | null {
  const real = values.filter((v): v is number => typeof v === "number");
  return real.length === 0 ? null : Math.round((real.reduce((s, v) => s + v, 0) / real.length) * 10) / 10;
}

/** Everything counted in a challenge window. All of it is self-reported. */
export function challengeSummary(state: Pick<BreatheState, "sessions" | "challenge">, today: string): ChallengeSummary | null {
  const challenge = state.challenge;
  if (!challenge) return null;
  const day = challengeDay(challenge, today);
  const end = addIsoDays(challenge.startedOn, CHALLENGE_DAYS - 1);
  const inWindow = state.sessions.filter((s) => s.date >= challenge.startedOn && s.date <= end);
  const counts = sessionDates(inWindow);
  const weeks: WeekConsistency[] = [1, 2, 3, 4].map((week) => {
    const from = addIsoDays(challenge.startedOn, (week - 1) * 7);
    const to = week === 4 ? end : addIsoDays(from, 6);
    const practiceDays = [...counts.keys()].filter((d) => d >= from && d <= to).length;
    return { week, from, to, practiceDays, target: WEEKLY_TARGET, met: practiceDays >= WEEKLY_TARGET };
  });
  const extras = challenge.extras.filter((e) => e.date >= challenge.startedOn && e.date <= end);
  const lastStress = [...challenge.checkIns].reverse().find((c) => c.stress !== null)?.stress ?? null;
  const lastRelax = [...challenge.checkIns].reverse().find((c) => c.relaxation !== null)?.relaxation ?? null;
  return {
    day,
    week: challengeWeek(Math.max(day, 1)),
    ended: day > CHALLENGE_DAYS || Boolean(challenge.finishedOn),
    sessions: inWindow.length,
    completeSessions: inWindow.filter((s) => s.complete).length,
    minutes: Math.round(inWindow.reduce((sum, s) => sum + s.seconds, 0) / 60),
    practiceDays: counts.size,
    weeks,
    walkDays: extras.filter((e) => e.walked).length,
    greensDays: extras.filter((e) => e.greens).length,
    stressBefore: challenge.before.stress,
    stressLatest: challenge.after?.stress ?? lastStress,
    relaxBefore: challenge.before.relaxation,
    relaxLatest: challenge.after?.relaxation ?? lastRelax,
    feltAfterAverage: avg(inWindow.map((s) => s.feltAfter)),
  };
}

/** Plain words for a change in a 1-to-5 self-rating. Never presented as a health result. */
export function describeChange(label: "stress" | "relaxation", before: number | null, after: number | null): string {
  if (before === null || after === null) return `Rate your ${label} at the start and the end to see a comparison.`;
  if (before === after) return `Your ${label} rating stayed at ${after} out of 5.`;
  const better = label === "stress" ? after < before : after > before;
  return `Your ${label} rating went from ${before} to ${after} out of 5${better ? ". Well done for noticing." : ". Some weeks are harder than others, and that is normal."}`;
}

// ---------- My Current Life / My New Life ----------

export type LifeChange = { id: string; current: string; next: string; why: string };

const VEG_TO_HABIT: Record<string, HabitFrequency> = { rarely: "rarely", "some-days": "some-days", "most-days": "most-days", daily: "most-days" };

/** Prefill the challenge's habit questions from the lifestyle assessment, where it has an answer. */
export function habitsFromAssessment(answers: Assessment | null): Partial<BreatheHabits> {
  if (!answers) return {};
  const out: Partial<BreatheHabits> = {};
  if (answers.vegetables && VEG_TO_HABIT[answers.vegetables]) out.greens = VEG_TO_HABIT[answers.vegetables];
  if (answers.walking && VEG_TO_HABIT[answers.walking]) out.walking = VEG_TO_HABIT[answers.walking];
  if (answers.stress) out.stress = answers.stress === "high" ? 4 : answers.stress === "moderate" ? 3 : 2;
  return out;
}

const CHANGES = {
  practice: {
    current: "I rarely practice breathing exercises.",
    next: "I practice gentle breathing four times a week.",
    why: "Slow, relaxed breathing is a simple way to settle the body, and a short routine is easier to keep than a long one.",
  },
  humming: {
    current: "I have never tried humming breath.",
    next: "I include a few minutes of soft Bhramari humming.",
    why: "In small studies, humming raised the nitric oxide measured in the nose compared with quiet breathing out. It is a comfortable, gentle practice.",
  },
  mouth: {
    current: "I often breathe through my mouth.",
    next: "I breathe gently through my nose when it is comfortable.",
    why: "The nose and sinuses make nitric oxide, and nasal breathing carries some of it with the air you breathe in.",
  },
  activity: {
    current: "I am not very physically active.",
    next: "I walk regularly, at a pace where I can still talk.",
    why: "Research links regular aerobic activity with better blood vessel function as people age.",
  },
  greens: {
    current: "I rarely eat nitrate-rich vegetables.",
    next: "I add leafy greens or beetroot to some meals.",
    why: "Vegetables such as spinach, arugula, and beetroot contain nitrate, which the body can turn into nitric oxide through the nitrate pathway.",
  },
  stress: {
    current: "I often feel stressed.",
    next: "I make time to relax each day, even for a few minutes.",
    why: "Relaxation and slow breathing can help many people feel calmer. Feeling calmer is worth having for its own sake.",
  },
} as const;

/**
 * Pairs of "my current life" and "my new life" habits, from the assessment and the
 * challenge's own questions. Only what the person reported is used. Nothing is inferred.
 */
export function lifeChanges(answers: Assessment | null, habits: Partial<BreatheHabits> | null): LifeChange[] {
  const out: LifeChange[] = [];
  const h = habits ?? {};
  const add = (id: keyof typeof CHANGES) => out.push({ id, ...CHANGES[id] });
  if (h.practice === "rarely" || h.practice === "sometimes") add("practice");
  if (h.practice && h.practice !== "often") add("humming");
  if (h.mouthBreathing === "often" || h.mouthBreathing === "sometimes") add("mouth");
  const days = answers ? Number(answers.activityDays) : NaN;
  if (h.walking === "rarely" || answers?.walking === "rarely" || (Number.isFinite(days) && answers?.activityDays !== "" && days < 3)) add("activity");
  if (h.greens === "rarely" || h.greens === "some-days" || answers?.vegetables === "rarely" || answers?.vegetables === "some-days") add("greens");
  if ((h.stress ?? 0) >= 4 || answers?.stress === "high") add("stress");
  return out;
}

/** The general "new life" list shown before anything is known. */
export function generalNewLife(): LifeChange[] {
  return (Object.keys(CHANGES) as (keyof typeof CHANGES)[]).map((id) => ({ id, ...CHANGES[id] }));
}

export const HABIT_LABELS = {
  practice: { rarely: "Rarely", sometimes: "Sometimes", often: "Often" },
  mouthBreathing: { often: "Often", sometimes: "Sometimes", rarely: "Rarely", "not-sure": "Not sure" },
  greens: { rarely: "Rarely", "some-days": "Some days", "most-days": "Most days" },
  walking: { rarely: "Rarely", "some-days": "Some days", "most-days": "Most days" },
} as const;

export type HabitRow = { label: string; before: string; after: string };

/** The start-versus-end table at the end of a challenge. */
export function compareHabits(before: BreatheHabits, after: BreatheHabits | null): HabitRow[] {
  const show = <K extends keyof typeof HABIT_LABELS>(key: K, value: string) =>
    value ? ((HABIT_LABELS[key] as Record<string, string>)[value] ?? value) : "Not answered";
  const rate = (value: number | null) => (value === null ? "Not answered" : `${value} out of 5`);
  return [
    { label: "Breathing practice", before: show("practice", before.practice), after: show("practice", after?.practice ?? "") },
    { label: "Breathing through the mouth", before: show("mouthBreathing", before.mouthBreathing), after: show("mouthBreathing", after?.mouthBreathing ?? "") },
    { label: "Leafy greens or beetroot", before: show("greens", before.greens), after: show("greens", after?.greens ?? "") },
    { label: "Walking", before: show("walking", before.walking), after: show("walking", after?.walking ?? "") },
    { label: "Stress (1 calm, 5 very stressed)", before: rate(before.stress), after: rate(after?.stress ?? null) },
    { label: "Relaxation (1 hard, 5 easy)", before: rate(before.relaxation), after: rate(after?.relaxation ?? null) },
  ];
}
