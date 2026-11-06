import {
  CONFIDENCE,
  DIFFICULT_LINE,
  DURATION,
  EASIER,
  HARD,
  HELPED,
  IN_THE_WAY,
  MOTIVATION,
  RESTART_LINE,
  SUPPORT,
  TINY,
  choiceLabel,
  triedChoices,
  triggerChoices,
  whenChoices,
  type CombPart,
  type HabitId,
} from "@/lib/habit-transformation/catalog";
import { addIsoDays, daysBetween, isRealISODate, mondayOf } from "@/lib/dates";
import {
  habitName,
  type ActionStatus,
  type ActionTune,
  type HabitCheck,
  type HabitJourney,
  type HabitPick,
  type WeekNote,
} from "@/lib/habit-transformation/model";

export type BarrierReading = {
  part: CombPart | null;
  partLabel: string;
  barrier: string;
  strategy: string;
  extra: string;
};

export type HabitPlan = {
  habitId: HabitId;
  name: string;
  why: string;
  difficultLine: string;
  reading: BarrierReading;
  smallAction: string;
  easierAction: string;
  cue: string;
  routine: string;
  whenLabel: string;
  triggerLabel: string;
  personalWhy: string;
  prompt: string;
  notice: string;
  weekly: string;
  safety: string;
};

const PART_LABEL: Record<CombPart, string> = {
  capability: "Capability",
  opportunity: "Opportunity",
  motivation: "Motivation",
};

const BARRIERS: Record<string, { barrier: string; strategy: string }> = {
  "unsure-step": {
    barrier: "You may be missing a step small enough to picture. That can be a capability gap.",
    strategy: "Use the tiny action already written. You do not need a bigger plan today.",
  },
  forget: {
    barrier: "Remembering the plan once the day is moving may be the hard part.",
    strategy: "Tie the step to something you already do, so memory has less work.",
  },
  "no-time": {
    barrier: "The day may not be leaving a pocket of time.",
    strategy: "Keep the step to a few minutes and attach it to a routine you already keep.",
  },
  "people-place": {
    barrier: "People or places around you may be pulling toward the old habit.",
    strategy: "Change one detail of the place, such as where you stand or what is in your hand.",
  },
  "moment-pull": {
    barrier: "In the moment, the familiar habit may feel easier than the new step.",
    strategy: "Make the new step the easier one in that moment, even if it is tiny.",
  },
  feeling: {
    barrier: "A feeling may arrive first, and the habit may follow it.",
    strategy: "Name the feeling before the habit. Naming can be the whole step.",
  },
};

const NOTICE_PROGRESS =
  "Notice whether you did the tiny step, and how the moment felt afterward. You are not measuring a health result.";
const WEEKLY =
  "Once this week, write one line about what helped and one line about what to adjust. A quiet week can stay quiet. Earlier marks stay.";

export function readingFor(pick: HabitPick): BarrierReading {
  const hard = HARD.find((item) => item.id === pick.followUp.hardId);
  const named = hard ? BARRIERS[hard.id] : null;
  const extra =
    pick.followUp.confidenceId === "heavy"
      ? "You also said this feels heavy right now. Motivation may be in the mix. That is still not a score."
      : "";
  if (!hard || !named) {
    return {
      part: null,
      partLabel: "Not pinned to one part",
      barrier: "There is not enough here to point to one part of COM-B. The tiny action can still stand.",
      strategy: "Keep the step small and tied to a routine you already have.",
      extra,
    };
  }
  return {
    part: hard.part,
    partLabel: PART_LABEL[hard.part],
    barrier: named.barrier,
    strategy: named.strategy,
    extra,
  };
}

function cueFor(pick: HabitPick): string {
  const choice = whenChoices(pick.habitId).find((item) => item.id === pick.followUp.whenId);
  return choice?.cue || "take the first quiet minute I get";
}

function safetyFor(habitId: HabitId): string {
  if (habitId === "smoking") {
    return "This pause is not a medical stop-smoking plan. A clinician or a public quitline can help with nicotine.";
  }
  if (habitId === "alcohol") {
    return "This is not a withdrawal plan. If cutting back feels unsafe, talk with a clinician before you change how much you drink.";
  }
  if (habitId === "emotional-eating") {
    return "Eating with a feeling is a common human pattern. The step is to notice, not to scold yourself.";
  }
  return "";
}

export function planFor(pick: HabitPick, tune?: ActionTune): HabitPlan {
  const tiny = TINY[pick.habitId];
  const reading = readingFor(pick);
  const cue = tune?.cue.trim() || cueFor(pick);
  const usingEasier = tune?.usingEasier === true;
  const smallAction = tune?.action.trim() || tiny.action;
  const shown = usingEasier ? tiny.easier : smallAction;
  const duration = choiceLabel(DURATION, pick.followUp.durationId);
  const trigger = choiceLabel(triggerChoices(pick.habitId), pick.followUp.triggerId);
  const tried = choiceLabel(triedChoices(pick.habitId), pick.followUp.triedId);
  const whenLabel = choiceLabel(whenChoices(pick.habitId), pick.followUp.whenId);
  const motivation = choiceLabel(MOTIVATION, pick.followUp.motivationId);
  const name = habitName(pick);
  const whyBits = [
    `${name} may continue because a familiar moment keeps offering an easy reward.`,
    trigger ? `You pointed to this just before it: ${trigger}.` : "",
    duration ? `You placed it on this timescale: ${duration}.` : "",
    tried ? `You have already tried: ${tried}.` : "",
    "That is a description of a pattern, not a judgment.",
  ].filter(Boolean);
  const promptByEasier: Record<string, string> = {
    reminder: "Put a short note where this routine already happens.",
    smaller: "On a hard day, use the easier version and stop there.",
    time: "Keep the same small step and move it to a time that is already quiet.",
    someone: "Ask one person to keep you company for this one small step.",
    nearby: "Put the one thing you need where the routine already happens.",
  };
  return {
    habitId: pick.habitId,
    name,
    why: whyBits.join(" "),
    difficultLine: DIFFICULT_LINE,
    reading,
    smallAction: shown,
    easierAction: tiny.easier,
    cue,
    routine: `After I ${cue}, I will ${shown}.`,
    whenLabel: whenLabel || "Not named yet",
    triggerLabel: trigger || "Not named yet",
    personalWhy: motivation || "Not named yet",
    prompt: promptByEasier[pick.followUp.easierId] ?? "Let a routine you already do be the prompt. You do not need a new tool.",
    notice: NOTICE_PROGRESS,
    weekly: WEEKLY,
    safety: safetyFor(pick.habitId),
  };
}

export function plansFor(journey: HabitJourney): HabitPlan[] {
  return journey.picks.map((pick) => planFor(pick, journey.tunes.find((tune) => tune.habitId === pick.habitId)));
}

export type ActionCard = HabitPlan & {
  acknowledgment: string;
  usingEasier: boolean;
  todayStatus: ActionStatus | null;
};

export function actionCard(journey: HabitJourney, pick: HabitPick, today: string): ActionCard {
  const tune = journey.tunes.find((item) => item.habitId === pick.habitId);
  const plan = planFor(pick, tune);
  return {
    ...plan,
    acknowledgment: tune?.acknowledgment ?? "",
    usingEasier: tune?.usingEasier === true,
    todayStatus: tune?.logs.find((log) => log.date === today)?.status ?? null,
  };
}

const MARK_DATES = (journey: HabitJourney): string[] => {
  const dates = [
    ...journey.tunes.flatMap((tune) => tune.logs.map((log) => log.date)),
    ...journey.checks.map((check) => check.date),
  ];
  return [...new Set(dates)].filter((date) => isRealISODate(date)).sort();
};

export function showRestart(journey: HabitJourney, today: string): boolean {
  if (!isRealISODate(today)) return false;
  const yesterday = addIsoDays(today, -1);
  const dates = MARK_DATES(journey);
  return dates.some((date) => date < yesterday) && !dates.includes(yesterday);
}

export function smallerNextStep(check: HabitCheck, easierAction: string): { kind: "smaller" | "same"; text: string } {
  const heavy = check.completed !== "yes" || check.difficulty === "heavy" || check.feeling === "tender";
  if (heavy) {
    return {
      kind: "smaller",
      text: `A smaller next step: ${easierAction}. ${RESTART_LINE}`,
    };
  }
  return {
    kind: "same",
    text: "The same small step is enough next time. It does not need to get bigger.",
  };
}

export const ACHIEVEMENTS = [
  { id: "started", title: "Journey started", detail: "You chose at least one habit to look at." },
  { id: "plan", title: "Plan saved", detail: "A personal action plan is saved with your other LifeZoi answers." },
  { id: "first-complete", title: "First tiny action", detail: "You marked one small action complete." },
  { id: "checked-in", title: "Checked in", detail: "You saved a daily check-in." },
  { id: "easier", title: "Smaller step", detail: "You chose an easier version. That still counts." },
  { id: "returned", title: "Came back", detail: "You returned after a quiet day. Nothing was erased." },
  {
    id: "week-marks",
    title: "Three days this week",
    detail: "Three days this week have a saved mark. The days do not need to be in a row.",
  },
  { id: "reflected", title: "Weekly note", detail: "You saved a weekly review." },
] as const;

export type AchievementId = (typeof ACHIEVEMENTS)[number]["id"];

function returnedAfterQuietDay(dates: string[]): boolean {
  for (let index = 1; index < dates.length; index += 1) {
    const gap = daysBetween(dates[index - 1], dates[index]);
    if (gap !== null && gap >= 2) return true;
  }
  return false;
}

export function earnedAchievements(journey: HabitJourney, today: string): AchievementId[] {
  const ids: AchievementId[] = [];
  if (journey.picks.length > 0) ids.push("started", "plan");
  const logs = journey.tunes.flatMap((tune) => tune.logs);
  if (logs.some((log) => log.status === "complete")) ids.push("first-complete");
  if (journey.checks.length > 0) ids.push("checked-in");
  if (logs.some((log) => log.status === "easier") || journey.tunes.some((tune) => tune.usingEasier)) {
    ids.push("easier");
  }
  const dates = MARK_DATES(journey);
  if (returnedAfterQuietDay(dates)) ids.push("returned");
  const start = mondayOf(today);
  if (start) {
    const end = addIsoDays(start, 6);
    const inWeek = dates.filter((date) => date >= start && date <= end);
    if (inWeek.length >= 3) ids.push("week-marks");
  }
  if (journey.notes.some((note) => note.worked.trim() || note.adjust.trim())) ids.push("reflected");
  return ids;
}

export type WeekBar = { date: string; label: string; completed: number; checks: number };

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function weekBars(journey: HabitJourney, today: string): WeekBar[] {
  if (!isRealISODate(today)) return [];
  const bars: WeekBar[] = [];
  for (let back = 6; back >= 0; back -= 1) {
    const date = addIsoDays(today, -back);
    const [year, month, day] = date.split("-").map(Number);
    const weekday = WEEKDAY[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? "";
    const completed = journey.tunes.reduce(
      (sum, tune) => sum + (tune.logs.some((log) => log.date === date && log.status === "complete") ? 1 : 0),
      0,
    );
    const checks = journey.checks.filter((check) => check.date === date).length;
    bars.push({ date, label: weekday, completed, checks });
  }
  return bars;
}

export function progressSnapshot(journey: HabitJourney, today: string) {
  const worked = [
    ...journey.checks.map((check) => choiceLabel(HELPED, check.helpedId)).filter(Boolean),
    ...journey.checks.map((check) => check.helpedNote).filter(Boolean),
    ...journey.notes.map((note) => note.worked).filter(Boolean),
  ];
  const adjust = [
    ...journey.checks.map((check) => choiceLabel(IN_THE_WAY, check.wayId)).filter(Boolean),
    ...journey.checks.map((check) => check.wayNote).filter(Boolean),
    ...journey.notes.map((note) => note.adjust).filter(Boolean),
  ];
  const completed = journey.tunes.reduce(
    (sum, tune) => sum + tune.logs.filter((log) => log.status === "complete").length,
    0,
  );
  return {
    habits: journey.picks.map((pick) => ({ id: pick.habitId, name: habitName(pick) })),
    completed,
    week: weekBars(journey, today),
    milestones: earnedAchievements(journey, today),
    worked: unique(worked),
    adjust: unique(adjust),
    reflections: [...journey.notes].sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

export function answerLines(pick: HabitPick): { label: string; value: string }[] {
  const follow = pick.followUp;
  return [
    { label: "When", value: choiceLabel(whenChoices(pick.habitId), follow.whenId) || "Not named yet" },
    { label: "Trigger", value: choiceLabel(triggerChoices(pick.habitId), follow.triggerId) || "Not named yet" },
    { label: "How long", value: choiceLabel(DURATION, follow.durationId) || "Not named yet" },
    { label: "What you tried", value: choiceLabel(triedChoices(pick.habitId), follow.triedId) || "Not named yet" },
    { label: "What makes it hard", value: choiceLabel(HARD, follow.hardId) || "Not named yet" },
    { label: "Motivation", value: choiceLabel(MOTIVATION, follow.motivationId) || "Not named yet" },
    { label: "A small step feels", value: choiceLabel(CONFIDENCE, follow.confidenceId) || "Not named yet" },
    { label: "Time and support", value: choiceLabel(SUPPORT, follow.supportId) || "Not named yet" },
    { label: "What would make it easier", value: choiceLabel(EASIER, follow.easierId) || "Not named yet" },
  ];
}

export function statusCopy(status: ActionStatus | null): string {
  if (status === "accepted") return "Accepted for today.";
  if (status === "changed") return "You changed the wording today.";
  if (status === "easier") return "You chose the smaller step today.";
  if (status === "skipped") return "You skipped today. A skipped day is not a failure.";
  if (status === "complete") return "Marked complete today.";
  return "Nothing is marked for today yet.";
}

export function hasSavedChartData(journey: HabitJourney): boolean {
  return journey.tunes.some((tune) => tune.logs.length > 0) || journey.checks.length > 0;
}

export function partName(part: CombPart): string {
  return PART_LABEL[part];
}

export function confidenceLabel(id: string): string {
  return choiceLabel(CONFIDENCE, id);
}

export function supportLabel(id: string): string {
  return choiceLabel(SUPPORT, id);
}

export type { WeekNote, HabitId };
