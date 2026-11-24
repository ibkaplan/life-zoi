import { addIsoDays, daysBetween, isRealISODate } from "@/lib/dates";
import { msg } from "@/lib/i18n/translate";
import { courseDaysIn } from "@/lib/courses/courses";
import { sources } from "@/lib/sources";
import type { CompanionState, DailyFeeling, DailyTopic } from "@/lib/companion/state";
import { DAILY_TOPICS } from "@/lib/companion/state";
import type { Assessment, CompletedAssessment, Source, UserSession } from "@/lib/types";
import { areaById, wellnessScore, type HabitAreaId } from "@/lib/wellness-score";

/**
 * LifeZoi Daily: one suggestion a day from the person's saved Lifestyle
 * Assessment, one short tip, an optional one-tap feeling, three progress
 * indicators kept apart, and a weekly report.
 *
 * Rules: everything comes from what the person saved. Nothing is sent
 * anywhere. A day without a record is "not recorded", never "missed". Website
 * activity is never presented as a health improvement.
 */

export type ArtKey = "day" | "meal" | "plan" | "sleep" | "brain" | "walk" | "yoga" | "checkin";

export type DailyTopicInfo = {
  id: DailyTopic;
  title: string;
  art: ArtKey;
  /** One suggestion per day, rotated. */
  advice: readonly string[];
  /** A gentler version for a low-energy day. */
  gentle: string;
  href: string;
  linkLabel: string;
};

export const TOPICS: Record<DailyTopic, DailyTopicInfo> = {
  energy: {
    id: "energy",
    title: msg("Energy and motivation"),
    art: "day",
    advice: [
      msg("Step outside for a few minutes of daylight this morning, and take three slow breaths."),
      msg("Pick one small thing you enjoy and give it ten minutes today."),
      msg("Drink a glass of water and stretch your arms before your next task."),
    ],
    gentle: msg("Be kind to yourself today. Sit by a window, breathe slowly for two minutes, and rest when you need to."),
    href: "/breathe",
    linkLabel: msg("Open Breathe for Life"),
  },
  eating: {
    id: "eating",
    title: msg("Healthy eating"),
    art: "meal",
    advice: [
      msg("Add one vegetable or piece of fruit to one meal today."),
      msg("Keep a glass of water where you can see it, and sip it through the day."),
      msg("Try beans, lentils, or whole grains in one meal this week."),
    ],
    gentle: msg("Keep it simple today: one easy meal with something green, and water close by."),
    href: "/academy/meals",
    linkLabel: msg("Open Nutrition"),
  },
  weight: {
    id: "weight",
    title: msg("Weight management"),
    art: "plan",
    advice: [
      msg("Fill half your plate with vegetables at one meal today."),
      msg("Choose water instead of a sweet drink once today."),
      msg("Eat slowly at one meal today and stop when you feel comfortably full."),
    ],
    gentle: msg("No changes needed today. Just notice when you feel hungry and when you feel full."),
    href: "/food-plan",
    linkLabel: msg("Open Food & Wellness"),
  },
  sleep: {
    id: "sleep",
    title: msg("Better sleep"),
    art: "sleep",
    advice: [
      msg("Pick a wake-up time you can keep on most days, including tomorrow."),
      msg("Put screens away 30 minutes before bed tonight and do something calm instead."),
      msg("Get some daylight in the morning. It helps your body know when it is day."),
    ],
    gentle: msg("If you feel tired, a short rest is fine. Try to go to bed at a regular time tonight."),
    href: "/library/guides/better-sleep",
    linkLabel: msg("Open the sleep guide"),
  },
  brain: {
    id: "brain",
    title: msg("Brain health"),
    art: "brain",
    advice: [
      msg("Play one short brain game or do a crossword today."),
      msg("Call or message a friend or family member today."),
      msg("Learn one new thing today: a word, a recipe, or a song."),
    ],
    gentle: msg("Listen to some music you love, or have a short chat with someone you like."),
    href: "/brain-quiz/games",
    linkLabel: msg("Open Brain games"),
  },
  walking: {
    id: "walking",
    title: msg("Walking and movement"),
    art: "walk",
    advice: [
      msg("Take a 10-minute walk at a pace that feels comfortable."),
      msg("Stand up and move for a minute or two every hour you sit."),
      msg("Walk after one meal today, even if it is only around your home."),
    ],
    gentle: msg("A few minutes of gentle movement is enough today, even a slow walk inside your home."),
    href: "/academy/move",
    linkLabel: msg("Open Movement"),
  },
  balance: {
    id: "balance",
    title: msg("Balance and strength"),
    art: "yoga",
    advice: [
      msg("Hold the back of a sturdy chair and rise up on your toes ten times."),
      msg("Stand up from a chair and sit down again slowly, five times."),
      msg("Hold a sturdy chair and stand on one foot for a few seconds, then switch."),
    ],
    gentle: msg("Seated exercises count. Try a few slow leg lifts while sitting in a chair."),
    href: "/balance-challenge",
    linkLabel: msg("Open the Balance and Brain Challenge"),
  },
  aging: {
    id: "aging",
    title: msg("Healthy aging and longevity"),
    art: "checkin",
    advice: [
      msg("Choose one small habit to keep this week, and enjoy it."),
      msg("Spend some time outdoors today, if you can."),
      msg("Think of one thing you look forward to, and plan a small step toward it."),
    ],
    gentle: msg("Rest is part of healthy aging too. Do one thing today that makes you smile."),
    href: "/my-health",
    linkLabel: msg("Open My Health"),
  },
};

export type DailyTip = { text: string; source: Source; topic: DailyTopic };

/** Short tips that only repeat the public guidance the app already cites. */
export const TIPS: readonly DailyTip[] = [
  { topic: "sleep", source: sources.nhlbiSleep, text: msg("Experts recommend that adults sleep 7 to 9 hours a night.") },
  { topic: "walking", source: sources.whoActivity, text: msg("Any amount of movement is better than none, and short walks add up over the week.") },
  { topic: "walking", source: sources.whoActivity, text: msg("Adults are advised to aim for at least 150 minutes of moderate activity a week, such as brisk walking.") },
  { topic: "balance", source: sources.usActivityGuidelines, text: msg("Muscle-strengthening activities on two or more days a week are part of the adult activity guidelines.") },
  { topic: "balance", source: sources.whoActivity, text: msg("For older adults, activities that train balance are part of the recommended weekly activity.") },
  { topic: "eating", source: sources.dietaryGuidelines, text: msg("Vegetables, fruit, beans, and whole grains are at the center of a healthy eating pattern.") },
  { topic: "eating", source: sources.nutritionWater, text: msg("Water is a good everyday drink, and it has no added sugar.") },
  { topic: "eating", source: sources.medlineplusFiber, text: msg("Fiber comes from plant foods such as beans, whole grains, vegetables, and fruit.") },
  { topic: "energy", source: sources.nimhStress, text: msg("Regular exercise, sleep, and relaxing activities such as slow breathing can help with stress.") },
  { topic: "brain", source: sources.whoConnection, text: msg("Staying in touch with other people is part of healthy aging. A short call counts.") },
  { topic: "sleep", source: sources.nhlbiSleep, text: msg("Going to bed and waking up at about the same time each day supports good sleep.") },
  { topic: "walking", source: sources.whoActivity, text: msg("Breaking up long periods of sitting with light movement is good for you.") },
];

// ---------- choosing today's suggestion ----------

export type TopicMatch = { topic: DailyTopic; score: number; reason: string };

const LESS_OFTEN = ["rarely", "some-days"];

function chose(a: Assessment, goal: string): boolean {
  return (a.wellnessGoals as readonly string[]).includes(goal);
}

function hasGoal(a: Assessment, goal: string): boolean {
  return (a.goals as readonly string[]).includes(goal);
}

function num(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Which topics fit the person, from their own saved answers only.
 * 3: a goal they chose. 2: an answer shows room to grow. 1: a general fit.
 * Weight is offered only when the person chose a weight goal; it is never inferred.
 */
export function matchTopics(a: Assessment | null): TopicMatch[] {
  if (!a) return [];
  const found = new Map<DailyTopic, TopicMatch>();
  const add = (topic: DailyTopic, score: number, reason: string) => {
    const current = found.get(topic);
    if (!current || current.score < score) found.set(topic, { topic, score, reason });
  };

  const hours = num(a.sleepHours);
  if (hasGoal(a, "sleep") || chose(a, "sleep")) add("sleep", 3, msg("You chose better sleep as one of your goals."));
  if ((hours !== null && (hours < 7 || hours > 9)) || a.sleepQuality === "poor" || a.sleepQuality === "fair")
    add("sleep", 2, msg("Your assessment says your sleep could be more restful."));

  const days = num(a.activityDays);
  const minutes = num(a.activityMinutes);
  if (hasGoal(a, "walk") || chose(a, "fitness")) add("walking", 3, msg("You chose more movement as one of your goals."));
  if ((days !== null && minutes !== null && days * minutes < 150) || LESS_OFTEN.includes(a.walking))
    add("walking", 2, msg("Your assessment shows room for a little more walking in your week."));

  if (chose(a, "flexibility-balance")) add("balance", 3, msg("You chose balance and flexibility as one of your goals."));
  if (LESS_OFTEN.includes(a.strength) || LESS_OFTEN.includes(a.balance))
    add("balance", 2, msg("Your assessment says strength or balance exercises are not yet a regular part of your week."));
  if (a.ageRange === "60-69" || a.ageRange === "70+") add("balance", 1, msg("Balance and strength help you stay steady and independent."));

  if (hasGoal(a, "eating") || chose(a, "nutrition") || chose(a, "blood-sugar") || chose(a, "cholesterol"))
    add("eating", 3, msg("You chose healthier eating as one of your goals."));
  if (
    LESS_OFTEN.includes(a.vegetables) ||
    LESS_OFTEN.includes(a.fruit) ||
    LESS_OFTEN.includes(a.fiber) ||
    a.addedSugar === "most-days" ||
    a.addedSugar === "daily" ||
    a.hydration === "rarely" ||
    a.hydration === "some"
  )
    add("eating", 2, msg("Your assessment shows room for more vegetables, fruit, or water."));

  if (chose(a, "lose-weight") || chose(a, "gain-weight") || chose(a, "maintain-weight"))
    add("weight", 3, msg("You chose a weight goal in your assessment."));

  if (chose(a, "energy") || chose(a, "stress") || hasGoal(a, "stress"))
    add("energy", 3, msg("You chose more energy or less stress as one of your goals."));
  if (a.stress === "high" || a.mood === "low" || a.mood === "mixed")
    add("energy", 2, msg("Your assessment mentions stress or a low mood on some days."));

  if (chose(a, "memory")) add("brain", 3, msg("You chose memory and brain health as one of your goals."));
  if (a.social === "isolated" || a.social === "some" || hasGoal(a, "connection"))
    add("brain", 2, msg("Your assessment mentions wanting more time with other people."));

  if (chose(a, "well-being")) add("aging", 3, msg("You chose overall well-being as one of your goals."));
  add("aging", 1, msg("Small, steady habits are the heart of healthy aging."));

  return [...found.values()].sort((x, y) => y.score - x.score || DAILY_TOPICS.indexOf(x.topic) - DAILY_TOPICS.indexOf(y.topic));
}

/** Days since 2000-01-01, so the choice changes once a day and is the same all day. */
export function dayNumber(today: string): number {
  return isRealISODate(today) ? (daysBetween("2000-01-01", today) ?? 0) : 0;
}

export type TodayPick = {
  topic: DailyTopicInfo;
  advice: string;
  /** Why this topic, from the person's answers. Empty without an assessment. */
  reason: string;
  /** Every other topic, best fit first, for "Explore more". */
  more: { topic: DailyTopicInfo; advice: string; reason: string }[];
  personalized: boolean;
};

function adviceFor(topic: DailyTopicInfo, n: number, feeling: DailyFeeling | null): string {
  if (feeling === "low") return topic.gentle;
  return topic.advice[n % topic.advice.length];
}

/** The one suggestion for today, plus the rest for "Explore more". */
export function pickToday(answers: Assessment | null, today: string, feeling: DailyFeeling | null = null): TodayPick {
  const n = dayNumber(today);
  const matches = matchTopics(answers);
  const strong = matches.filter((match) => match.score >= 2);
  const pool = strong.length > 0 ? strong : matches.length > 0 ? matches : DAILY_TOPICS.map((topic) => ({ topic, score: 0, reason: "" }));
  const chosen = pool[n % pool.length];
  const reasonOf = (topic: DailyTopic) => matches.find((match) => match.topic === topic)?.reason ?? "";
  const ordered: DailyTopic[] = [...matches.map((match) => match.topic), ...DAILY_TOPICS.filter((topic) => !matches.some((match) => match.topic === topic))];
  // Weight is shown only to people who chose a weight goal.
  const allowed = ordered.filter((topic) => topic !== "weight" || matches.some((match) => match.topic === "weight"));
  return {
    topic: TOPICS[chosen.topic],
    advice: adviceFor(TOPICS[chosen.topic], n, feeling),
    reason: chosen.reason,
    more: allowed
      .filter((topic) => topic !== chosen.topic)
      .map((topic) => ({ topic: TOPICS[topic], advice: adviceFor(TOPICS[topic], n, feeling), reason: reasonOf(topic) })),
    personalized: matches.length > 0,
  };
}

/** One tip a day. On most days it matches today's topic when a tip for it exists. */
export function tipFor(today: string, topic: DailyTopic | null = null): DailyTip {
  const n = dayNumber(today);
  const matching = topic ? TIPS.filter((tip) => tip.topic === topic) : [];
  if (matching.length > 0 && n % 3 !== 2) return matching[Math.floor(n / 3) % matching.length];
  return TIPS[n % TIPS.length];
}

export const FEELING_CHOICES: { id: DailyFeeling; face: string; label: string; reply: string }[] = [
  { id: "great", face: "😊", label: msg("Great"), reply: msg("Wonderful! Enjoy your day. If you like, today's idea can be a little longer than usual.") },
  { id: "okay", face: "🙂", label: msg("Okay"), reply: msg("Thank you. A steady day is a good day. Today's idea is below.") },
  { id: "low", face: "😔", label: msg("Low Energy"), reply: msg("Thank you for telling us. Today's ideas are gentler. Rest is fine, and if you feel unwell, talk with a clinician.") },
];

// ---------- the three progress indicators ----------

export type AssessmentIndicator =
  | { status: "none" }
  | { status: "started" }
  | { status: "done"; completedAt: string; met: number; counted: number; reassessOn: string };

export type LifestyleIndicator =
  | { status: "no-assessment" }
  | { status: "one-assessment"; since: string }
  | { status: "compared"; from: string; to: string; improved: HabitAreaId[]; slipped: HabitAreaId[]; steady: number };

export type EngagementIndicator = {
  /** Days in the last 7 with anything recorded in LifeZoi. */
  activeDays: number;
  /** Things recorded in LifeZoi in the last 7 days. */
  actions: number;
};

export type ProgressIndicators = {
  assessment: AssessmentIndicator;
  lifestyle: LifestyleIndicator;
  engagement: EngagementIndicator;
};

function hasAnswers(session: UserSession): boolean {
  const d = session.draft;
  return Boolean(d.sleepHours || d.activityDays || d.vegetables || d.stress || d.goals.length > 0);
}

export function assessmentIndicator(session: UserSession): AssessmentIndicator {
  const score = wellnessScore(session.history);
  const latest = session.history[0];
  if (latest)
    return {
      status: "done",
      completedAt: latest.completedAt.slice(0, 10),
      met: score?.current.met.length ?? 0,
      counted: score?.current.counted ?? 0,
      reassessOn: session.reassessOn,
    };
  return hasAnswers(session) ? { status: "started" } : { status: "none" };
}

/** Lifestyle progress compares the person's own saved assessments. App use never counts here. */
export function lifestyleIndicator(history: readonly CompletedAssessment[]): LifestyleIndicator {
  const score = wellnessScore(history);
  if (!score) return { status: "no-assessment" };
  if (!score.previous) return { status: "one-assessment", since: score.current.completedAt.slice(0, 10) };
  const steady = score.current.met.filter((id) => score.previous!.met.includes(id)).length;
  return {
    status: "compared",
    from: score.previous.completedAt.slice(0, 10),
    to: score.current.completedAt.slice(0, 10),
    improved: score.improved,
    slipped: score.slipped,
    steady,
  };
}

function inRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end;
}

export type WeekWindow = { start: string; end: string };

/** The last seven days, today included. */
export function lastSevenDays(today: string): WeekWindow {
  return { start: addIsoDays(today, -6) || today, end: today };
}

export type ActivityCount = { id: string; label: string; count: number };

/** Activities the person recorded in LifeZoi in the window. Only real entries count. */
export function activitiesIn(session: UserSession, companion: CompanionState, window: WeekWindow): ActivityCount[] {
  const { start, end } = window;
  let planned = 0;
  let breaks = 0;
  for (const day of Object.values(companion.days)) {
    if (!inRange(day.date, start, end)) continue;
    planned += Object.values(day.entries).filter((entry) => entry.status === "done" || entry.status === "partial").length;
    breaks += day.movementBreaks;
  }
  const breathing = companion.breathe.sessions.filter((item) => inRange(item.date, start, end)).length;
  const focus = companion.focus.days.filter((item) => inRange(item.date, start, end)).reduce((sum, item) => sum + item.sessions, 0);
  const games = companion.games.filter((item) => item.completed && inRange(item.date, start, end)).length;
  const habits = session.checkIns.filter((item) => item.done && inRange(item.date, start, end)).length;
  const courses = courseDaysIn(companion.courses, start, end).length;
  const all: ActivityCount[] = [
    { id: "plan", label: msg("Activities marked done"), count: planned },
    { id: "breathing", label: msg("Breathing sessions"), count: breathing },
    { id: "focus", label: msg("Focus sessions"), count: focus },
    { id: "games", label: msg("Brain games finished"), count: games },
    { id: "habits", label: msg("Habit days you marked"), count: habits },
    { id: "breaks", label: msg("Movement breaks"), count: breaks },
    { id: "courses", label: msg("Mini-course practices"), count: courses },
  ];
  return all.filter((item) => item.count > 0);
}

/** Dates in the window with anything recorded in LifeZoi. */
export function activeDates(session: UserSession, companion: CompanionState, window: WeekWindow): string[] {
  const { start, end } = window;
  const dates = new Set<string>();
  for (const day of Object.values(companion.days)) {
    const any = Object.keys(day.entries).length > 0 || day.movementBreaks > 0 || day.brainGames > 0;
    if (any && inRange(day.date, start, end)) dates.add(day.date);
  }
  for (const date of Object.keys(companion.daily.feelings)) if (inRange(date, start, end)) dates.add(date);
  for (const item of companion.daily.explored) if (inRange(item.date, start, end)) dates.add(item.date);
  for (const item of companion.breathe.sessions) if (inRange(item.date, start, end)) dates.add(item.date);
  for (const item of companion.focus.days) if (item.sessions > 0 && inRange(item.date, start, end)) dates.add(item.date);
  for (const item of companion.games) if (inRange(item.date, start, end)) dates.add(item.date);
  for (const item of session.checkIns) if (inRange(item.date, start, end)) dates.add(item.date);
  for (const item of courseDaysIn(companion.courses, start, end)) dates.add(item.date);
  return [...dates].sort();
}

export function engagementIndicator(session: UserSession, companion: CompanionState, today: string): EngagementIndicator {
  const window = lastSevenDays(today);
  const actions =
    activitiesIn(session, companion, window).reduce((sum, item) => sum + item.count, 0) +
    Object.keys(companion.daily.feelings).filter((date) => inRange(date, window.start, window.end)).length +
    companion.daily.explored.filter((item) => inRange(item.date, window.start, window.end)).length;
  return { activeDays: activeDates(session, companion, window).length, actions };
}

export function progressIndicators(session: UserSession, companion: CompanionState, today: string): ProgressIndicators {
  return {
    assessment: assessmentIndicator(session),
    lifestyle: lifestyleIndicator(session.history),
    engagement: engagementIndicator(session, companion, today),
  };
}

// ---------- weekly report ----------

export type WeeklyReport = {
  window: WeekWindow;
  activities: ActivityCount[];
  topics: DailyTopic[];
  libraryOpened: number;
  feelings: Record<DailyFeeling, number>;
  weights: { first: { date: string; value: number; unit: string }; last: { date: string; value: number; unit: string } | null } | null;
  assessmentUpdated: { improved: HabitAreaId[] } | null;
  focusNext: { topic: DailyTopicInfo; reason: string }[];
  suggestAssessment: boolean;
  /** True when nothing at all was recorded in the window. */
  empty: boolean;
};

export function weeklyReport(session: UserSession, companion: CompanionState, today: string): WeeklyReport {
  const window = lastSevenDays(today);
  const { start, end } = window;
  const activities = activitiesIn(session, companion, window);
  const topics = [...new Set(companion.daily.explored.filter((item) => inRange(item.date, start, end)).map((item) => item.topic))];
  const libraryOpened = companion.media.recent.filter((item) => inRange(item.at.slice(0, 10), start, end)).length;

  const feelings: Record<DailyFeeling, number> = { great: 0, okay: 0, low: 0 };
  for (const [date, feeling] of Object.entries(companion.daily.feelings)) if (inRange(date, start, end)) feelings[feeling] += 1;

  const weightRows = session.weightEntries
    .filter((entry) => inRange(entry.date, start, end))
    .sort((a, b) => a.date.localeCompare(b.date));
  const weights =
    weightRows.length > 0
      ? {
          first: { date: weightRows[0].date, value: weightRows[0].value, unit: weightRows[0].unit },
          last:
            weightRows.length > 1
              ? { date: weightRows[weightRows.length - 1].date, value: weightRows[weightRows.length - 1].value, unit: weightRows[weightRows.length - 1].unit }
              : null,
        }
      : null;

  const latest = session.history[0];
  const lifestyle = lifestyleIndicator(session.history);
  const assessmentUpdated =
    latest && inRange(latest.completedAt.slice(0, 10), start, end)
      ? { improved: lifestyle.status === "compared" ? lifestyle.improved : [] }
      : null;

  // Areas to focus on next week: the person's own goals and answers first.
  const answers = latest?.answers ?? null;
  const matches = matchTopics(answers).filter((match) => match.score >= 2);
  const focusNext: { topic: DailyTopicInfo; reason: string }[] = [];
  if (feelings.low >= 2) {
    focusNext.push({ topic: TOPICS.sleep, reason: msg("You tapped Low Energy on more than one day this week. Rest and steady sleep are a gentle place to start.") });
  }
  for (const match of matches) {
    if (focusNext.length >= 2) break;
    if (!focusNext.some((item) => item.topic.id === match.topic)) focusNext.push({ topic: TOPICS[match.topic], reason: match.reason });
  }

  const feelingCount = feelings.great + feelings.okay + feelings.low;
  const empty =
    activities.length === 0 && topics.length === 0 && libraryOpened === 0 && feelingCount === 0 && !weights && !assessmentUpdated;

  return {
    window,
    activities,
    topics,
    libraryOpened,
    feelings,
    weights,
    assessmentUpdated,
    focusNext,
    suggestAssessment: !latest,
    empty,
  };
}

export function areaLabel(id: HabitAreaId): string {
  return areaById(id).label;
}
