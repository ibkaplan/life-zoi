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
import { makeTranslate, msg, type Translate } from "@/lib/i18n/translate";
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

const english = makeTranslate(null);

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
  capability: msg("Capability"),
  opportunity: msg("Opportunity"),
  motivation: msg("Motivation"),
};

const BARRIERS: Record<string, { barrier: string; strategy: string }> = {
  "unsure-step": {
    barrier: msg("You may be missing a step small enough to picture. That can be a capability gap."),
    strategy: msg("Use the tiny action already written. You do not need a bigger plan today."),
  },
  forget: {
    barrier: msg("Remembering the plan once the day is moving may be the hard part."),
    strategy: msg("Tie the step to something you already do, so memory has less work."),
  },
  "no-time": {
    barrier: msg("The day may not be leaving a pocket of time."),
    strategy: msg("Keep the step to a few minutes and attach it to a routine you already keep."),
  },
  "people-place": {
    barrier: msg("People or places around you may be pulling toward the old habit."),
    strategy: msg("Change one detail of the place, such as where you stand or what is in your hand."),
  },
  "moment-pull": {
    barrier: msg("In the moment, the familiar habit may feel easier than the new step."),
    strategy: msg("Make the new step the easier one in that moment, even if it is tiny."),
  },
  feeling: {
    barrier: msg("A feeling may arrive first, and the habit may follow it."),
    strategy: msg("Name the feeling before the habit. Naming can be the whole step."),
  },
};

const NOTICE_PROGRESS = msg(
  "Notice whether you did the tiny step, and how the moment felt afterward. You are not measuring a health result.",
);
const WEEKLY = msg(
  "Once this week, write one line about what helped and one line about what to adjust. A quiet week can stay quiet. Earlier marks stay.",
);

export function readingFor(pick: HabitPick, t: Translate = english): BarrierReading {
  const hard = HARD.find((item) => item.id === pick.followUp.hardId);
  const named = hard ? BARRIERS[hard.id] : null;
  const extra =
    pick.followUp.confidenceId === "heavy"
      ? t("You also said this feels heavy right now. Motivation may be in the mix. That is still not a score.")
      : "";
  if (!hard || !named) {
    return {
      part: null,
      partLabel: t("Not pinned to one part"),
      barrier: t("There is not enough here to point to one part of COM-B. The tiny action can still stand."),
      strategy: t("Keep the step small and tied to a routine you already have."),
      extra,
    };
  }
  return {
    part: hard.part,
    partLabel: t(PART_LABEL[hard.part]),
    barrier: t(named.barrier),
    strategy: t(named.strategy),
    extra,
  };
}

function cueFor(pick: HabitPick): string {
  const choice = whenChoices(pick.habitId).find((item) => item.id === pick.followUp.whenId);
  return choice?.cue || msg("take the first quiet minute I get");
}

function safetyFor(habitId: HabitId, t: Translate): string {
  if (habitId === "smoking") {
    return t("This pause is not a medical stop-smoking plan. A clinician or a public quitline can help with nicotine.");
  }
  if (habitId === "alcohol") {
    return t("This is not a withdrawal plan. If cutting back feels unsafe, talk with a clinician before you change how much you drink.");
  }
  if (habitId === "emotional-eating") {
    return t("Eating with a feeling is a common human pattern. The step is to notice, not to scold yourself.");
  }
  return "";
}

export function planFor(pick: HabitPick, tune?: ActionTune, t: Translate = english): HabitPlan {
  const tiny = TINY[pick.habitId];
  const reading = readingFor(pick, t);
  const cue = t(tune?.cue.trim() || cueFor(pick));
  const usingEasier = tune?.usingEasier === true;
  const smallAction = t(tune?.action.trim() || tiny.action);
  const shown = usingEasier ? t(tiny.easier) : smallAction;
  const label = (text: string) => (text ? t(text) : "");
  const duration = label(choiceLabel(DURATION, pick.followUp.durationId));
  const trigger = label(choiceLabel(triggerChoices(pick.habitId), pick.followUp.triggerId));
  const tried = label(choiceLabel(triedChoices(pick.habitId), pick.followUp.triedId));
  const whenLabel = label(choiceLabel(whenChoices(pick.habitId), pick.followUp.whenId));
  const motivation = label(choiceLabel(MOTIVATION, pick.followUp.motivationId));
  const name = habitName(pick, t);
  const whyBits = [
    t("{name} may continue because a familiar moment keeps offering an easy reward.", { name }),
    trigger ? t("You pointed to this just before it: {trigger}.", { trigger }) : "",
    duration ? t("You placed it on this timescale: {duration}.", { duration }) : "",
    tried ? t("You have already tried: {tried}.", { tried }) : "",
    t("That is a description of a pattern, not a judgment."),
  ].filter(Boolean);
  const promptByEasier: Record<string, string> = {
    reminder: msg("Put a short note where this routine already happens."),
    smaller: msg("On a hard day, use the easier version and stop there."),
    time: msg("Keep the same small step and move it to a time that is already quiet."),
    someone: msg("Ask one person to keep you company for this one small step."),
    nearby: msg("Put the one thing you need where the routine already happens."),
  };
  return {
    habitId: pick.habitId,
    name,
    why: whyBits.join(" "),
    difficultLine: t(DIFFICULT_LINE),
    reading,
    smallAction: shown,
    easierAction: t(tiny.easier),
    cue,
    routine: t("After I {cue}, I will {action}.", { cue, action: shown }),
    whenLabel: whenLabel || t("Not named yet"),
    triggerLabel: trigger || t("Not named yet"),
    personalWhy: motivation || t("Not named yet"),
    prompt: t(
      promptByEasier[pick.followUp.easierId] ??
        msg("Let a routine you already do be the prompt. You do not need a new tool."),
    ),
    notice: t(NOTICE_PROGRESS),
    weekly: t(WEEKLY),
    safety: safetyFor(pick.habitId, t),
  };
}

export function plansFor(journey: HabitJourney, t: Translate = english): HabitPlan[] {
  return journey.picks.map((pick) => planFor(pick, journey.tunes.find((tune) => tune.habitId === pick.habitId), t));
}

export type ActionCard = HabitPlan & {
  acknowledgment: string;
  usingEasier: boolean;
  todayStatus: ActionStatus | null;
};

export function actionCard(journey: HabitJourney, pick: HabitPick, today: string, t: Translate = english): ActionCard {
  const tune = journey.tunes.find((item) => item.habitId === pick.habitId);
  const plan = planFor(pick, tune, t);
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

export function smallerNextStep(
  check: HabitCheck,
  easierAction: string,
  t: Translate = english,
): { kind: "smaller" | "same"; text: string } {
  const heavy = check.completed !== "yes" || check.difficulty === "heavy" || check.feeling === "tender";
  if (heavy) {
    return {
      kind: "smaller",
      text: t("A smaller next step: {step}. {restart}", { step: easierAction, restart: t(RESTART_LINE) }),
    };
  }
  return {
    kind: "same",
    text: t("The same small step is enough next time. It does not need to get bigger."),
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

const WEEKDAY = [msg("Sun"), msg("Mon"), msg("Tue"), msg("Wed"), msg("Thu"), msg("Fri"), msg("Sat")];

export function weekBars(journey: HabitJourney, today: string, t: Translate = english): WeekBar[] {
  if (!isRealISODate(today)) return [];
  const bars: WeekBar[] = [];
  for (let back = 6; back >= 0; back -= 1) {
    const date = addIsoDays(today, -back);
    const [year, month, day] = date.split("-").map(Number);
    const weekday = t(WEEKDAY[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? "");
    const completed = journey.tunes.reduce(
      (sum, tune) => sum + (tune.logs.some((log) => log.date === date && log.status === "complete") ? 1 : 0),
      0,
    );
    const checks = journey.checks.filter((check) => check.date === date).length;
    bars.push({ date, label: weekday, completed, checks });
  }
  return bars;
}

export function progressSnapshot(journey: HabitJourney, today: string, t: Translate = english) {
  const worked = [
    ...journey.checks
      .map((check) => choiceLabel(HELPED, check.helpedId))
      .filter(Boolean)
      .map((text) => t(text)),
    ...journey.checks.map((check) => check.helpedNote).filter(Boolean),
    ...journey.notes.map((note) => note.worked).filter(Boolean),
  ];
  const adjust = [
    ...journey.checks
      .map((check) => choiceLabel(IN_THE_WAY, check.wayId))
      .filter(Boolean)
      .map((text) => t(text)),
    ...journey.checks.map((check) => check.wayNote).filter(Boolean),
    ...journey.notes.map((note) => note.adjust).filter(Boolean),
  ];
  const completed = journey.tunes.reduce(
    (sum, tune) => sum + tune.logs.filter((log) => log.status === "complete").length,
    0,
  );
  return {
    habits: journey.picks.map((pick) => ({ id: pick.habitId, name: habitName(pick, t) })),
    completed,
    week: weekBars(journey, today, t),
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

export function answerLines(pick: HabitPick, t: Translate = english): { label: string; value: string }[] {
  const follow = pick.followUp;
  const value = (text: string) => (text ? t(text) : t("Not named yet"));
  return [
    { label: t("When"), value: value(choiceLabel(whenChoices(pick.habitId), follow.whenId)) },
    { label: t("Trigger"), value: value(choiceLabel(triggerChoices(pick.habitId), follow.triggerId)) },
    { label: t("How long"), value: value(choiceLabel(DURATION, follow.durationId)) },
    { label: t("What you tried"), value: value(choiceLabel(triedChoices(pick.habitId), follow.triedId)) },
    { label: t("What makes it hard"), value: value(choiceLabel(HARD, follow.hardId)) },
    { label: t("Motivation"), value: value(choiceLabel(MOTIVATION, follow.motivationId)) },
    { label: t("A small step feels"), value: value(choiceLabel(CONFIDENCE, follow.confidenceId)) },
    { label: t("Time and support"), value: value(choiceLabel(SUPPORT, follow.supportId)) },
    { label: t("What would make it easier"), value: value(choiceLabel(EASIER, follow.easierId)) },
  ];
}

export function statusCopy(status: ActionStatus | null, t: Translate = english): string {
  if (status === "accepted") return t("Accepted for today.");
  if (status === "changed") return t("You changed the wording today.");
  if (status === "easier") return t("You chose the smaller step today.");
  if (status === "skipped") return t("You skipped today. A skipped day is not a failure.");
  if (status === "complete") return t("Marked complete today.");
  return t("Nothing is marked for today yet.");
}

export function hasSavedChartData(journey: HabitJourney): boolean {
  return journey.tunes.some((tune) => tune.logs.length > 0) || journey.checks.length > 0;
}

export function partName(part: CombPart, t: Translate = english): string {
  return t(PART_LABEL[part]);
}

export function confidenceLabel(id: string, t: Translate = english): string {
  const label = choiceLabel(CONFIDENCE, id);
  return label ? t(label) : "";
}

export function supportLabel(id: string, t: Translate = english): string {
  const label = choiceLabel(SUPPORT, id);
  return label ? t(label) : "";
}

export type { WeekNote, HabitId };
