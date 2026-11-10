import { isEmptyBrain, type BrainProgress } from "@/lib/brain-quiz/progress";
import { mealById } from "@/lib/food-plan/meals";
import { planBlockReason } from "@/lib/food-plan/plan";
import type { FoodPlanState } from "@/lib/food-plan/types";
import { mealModule } from "@/lib/wellness/academy";
import { lessonById } from "@/lib/wellness/movement-studio/catalog";
import { scriptById } from "@/lib/wellness/movement-studio/scripts";
import { plansFor, type HabitPlan } from "@/lib/habit-transformation/engine";
import type { HabitJourney } from "@/lib/habit-transformation/model";
import {
  goalLabels,
  hydrationLabels,
  sleepQualityLabels,
  vegetableLabels,
} from "@/lib/labels";
import type { Assessment, GoalId, WeightEntry } from "@/lib/types";
import { msg } from "@/lib/i18n/translate";

export const ITEM_IDS = [
  "water",
  "stretch",
  "movement",
  "breakfast",
  "brain",
  "lunch",
  "break",
  "habit",
  "dinner",
  "relax",
  "check-in",
] as const;

export type ItemId = (typeof ITEM_IDS)[number];
export type ItemStatus = "open" | "done" | "skipped";

export const SUGGESTED_TIMES: Record<ItemId, string> = {
  water: "07:00",
  stretch: "07:10",
  movement: "07:30",
  breakfast: "08:00",
  brain: "10:00",
  lunch: "12:30",
  break: "15:00",
  habit: "16:00",
  dinner: "18:30",
  relax: "20:30",
  "check-in": "21:00",
};

export const PERFECT_DAY =
  msg("Your day does not have to be perfect. Choose one small action you can do now.");

export const HABIT_HREF = "/habit-transformation/actions";

const CLINICAL = /\b(kidney|renal|dialysis|liver|hepatic|pregnan\w*)\b/i;
const GENTLE_NOTE = /\b(pain|injur(?:y|ies|ed)?|surgery|surgeries|fall|falls|falling|wheelchair|joint|dizzy|dizziness)\b/i;

const LOCAL_HABIT: Record<GoalId, string> = {
  walk: msg("Move for a few minutes in a way you already use."),
  sleep: msg("Keep a wind-down you can manage tonight."),
  eating: msg("Eat one meal you already know how to make."),
  smoking: msg("For one urge, you can wait or step away. There is no shame if you smoke."),
  stress: msg("Take a few quiet minutes."),
  alcohol: msg("For one occasion, you can choose a smaller amount or skip it."),
  connection: msg("Send one short note to someone."),
};

export type ItemState = {
  status: ItemStatus;
  note: string;
  variant: number;
  shorter: boolean;
  time: string;
};

export type DayRecord = {
  date: string;
  items: Record<ItemId, ItemState>;
};

export type PresentedItem = {
  id: ItemId;
  section: string;
  title: string;
  time: string;
  timeLabel: "Suggested time" | "Your time";
  detail: string;
  steps: string[];
  href: string | null;
  hrefLabel: string;
  why: string;
  status: ItemStatus;
  note: string;
  shorter: boolean;
};

export type DayProgress = {
  completed: number;
  remaining: number;
  percent: number;
};

export type CalorieEstimate =
  | { kind: "none"; reason: string }
  | { kind: "resting"; kcal: number; reason: string }
  | { kind: "maintenance"; kcal: number; resting: number; reason: string };

export type ProteinEstimate =
  | { kind: "none"; reason: string }
  | { kind: "hold"; reason: string }
  | { kind: "estimate"; grams: number; reason: string };

export type WeightChart =
  | { kind: "empty" }
  | { kind: "single"; entry: WeightEntry }
  | { kind: "list"; entries: WeightEntry[] }
  | { kind: "bars"; unit: WeightEntry["unit"]; entries: WeightEntry[]; max: number };

function mod(value: number, length: number): number {
  if (length <= 0) return 0;
  const index = Math.trunc(value) % length;
  return index < 0 ? index + length : index;
}

function numberIn(value: string, min: number, max: number): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

export function clinicalHold(answers: Assessment | null): boolean {
  return Boolean(answers && CLINICAL.test(answers.conditionsNote));
}

function needsGentle(answers: Assessment | null): boolean {
  if (!answers) return false;
  if (answers.ageRange === "60-69" || answers.ageRange === "70+") return true;
  if (GENTLE_NOTE.test(answers.conditionsNote)) return true;
  if (answers.activityDays.trim()) {
    const days = Number(answers.activityDays);
    if (Number.isFinite(days) && days <= 1) return true;
  }
  return false;
}

function weeklyMinutes(answers: Assessment | null): number | null {
  if (!answers?.activityDays.trim() || !answers.activityMinutes.trim()) return null;
  const days = Number(answers.activityDays);
  const minutes = Number(answers.activityMinutes);
  if (!Number.isFinite(days) || !Number.isFinite(minutes) || days < 0 || minutes < 0) return null;
  if (days > 7 || minutes > 300) return null;
  return Math.round(days * minutes);
}

function activityFactor(weekly: number): number {
  if (weekly < 75) return 1.2;
  if (weekly < 150) return 1.375;
  if (weekly < 300) return 1.55;
  return 1.65;
}

function mifflin(sex: "female" | "male", kg: number, cm: number, age: number): number {
  const base = 10 * kg + 6.25 * cm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calorieEstimate(answers: Assessment | null): CalorieEstimate {
  if (!answers) {
    return { kind: "none", reason: msg("No completed assessment is saved, so no calorie estimate is shown.") };
  }
  const missing: string[] = [];
  const age = numberIn(answers.exactAge, 18, 100);
  const height = numberIn(answers.heightCm, 100, 250);
  const weight = numberIn(answers.weightKg, 30, 300);
  const sex = answers.tableSex === "female" || answers.tableSex === "male" ? answers.tableSex : null;
  if (!age) missing.push("an exact age");
  if (!height) missing.push("height in centimeters");
  if (!weight) missing.push("weight in kilograms");
  if (!sex) missing.push("sex saved as female or male");
  if (missing.length > 0 || age === null || height === null || weight === null || !sex) {
    return {
      kind: "none",
      reason: `A calorie estimate needs ${missing.join(", ")}. This page does not ask again and does not choose a missing value.`,
    };
  }
  const resting = Math.round(mifflin(sex, weight, height, age));
  const weekly = weeklyMinutes(answers);
  const hold = clinicalHold(answers)
    ? " Your saved note mentions kidney, liver, or pregnancy. A qualified professional should guide any eating change. This number is not a deficit and not a target."
    : " This is a maintenance estimate, not a calorie goal and not a deficit.";
  if (weekly === null) {
    return {
      kind: "resting",
      kcal: resting,
      reason: `Mifflin-St Jeor resting estimate from the age, height, weight, and sex already saved. Activity days and minutes are not both saved, so a daily maintenance number is not shown.${hold}`,
    };
  }
  const kcal = Math.round(resting * activityFactor(weekly));
  return {
    kind: "maintenance",
    kcal,
    resting,
    reason: `Mifflin-St Jeor resting estimate, times an activity factor from the saved ${weekly} weekly minutes. The factor stays between 1.2 and 1.65.${hold}`,
  };
}

export function proteinEstimate(answers: Assessment | null): ProteinEstimate {
  if (clinicalHold(answers)) {
    return {
      kind: "hold",
      reason:
        msg("Your saved note mentions kidney, liver, or pregnancy. A qualified professional should guide protein. This page does not raise a protein estimate."),
    };
  }
  const weight = answers ? numberIn(answers.weightKg, 30, 300) : null;
  if (!weight) {
    return {
      kind: "none",
      reason: msg("A protein estimate needs a saved weight in kilograms. None is stored, so none is shown."),
    };
  }
  return {
    kind: "estimate",
    grams: Math.round(weight * 0.8),
    reason:
      msg("About 0.8 grams per kilogram of the saved weight. That is a general adult reference, not a target to exceed and not medical advice."),
  };
}

export function weightChart(entries: WeightEntry[]): WeightChart {
  const saved = entries.filter((entry) => Number.isFinite(entry.value) && entry.value > 0);
  if (saved.length === 0) return { kind: "empty" };
  const sorted = [...saved].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 1) return { kind: "single", entry: sorted[0] as WeightEntry };
  const units = new Set(sorted.map((entry) => entry.unit));
  if (units.size > 1) return { kind: "list", entries: sorted };
  const max = Math.max(...sorted.map((entry) => entry.value));
  return { kind: "bars", unit: sorted[0]?.unit ?? "kg", entries: sorted, max };
}

export function dayProgress(items: Pick<ItemState, "status">[]): DayProgress {
  const completed = items.filter((item) => item.status === "done").length;
  const remaining = items.filter((item) => item.status === "open").length;
  const counted = completed + remaining;
  const percent = counted === 0 ? 0 : Math.round((completed / counted) * 100);
  return { completed, remaining, percent };
}

export function encouragement(progress: DayProgress): string {
  if (progress.completed === 0) return PERFECT_DAY;
  if (progress.remaining === 0) {
    return `You marked the open items done. Anything you skipped can stay skipped. ${PERFECT_DAY}`;
  }
  return `You have already done something today. The rest can wait. ${PERFECT_DAY}`;
}

function lessonSteps(scriptId: string, limit: number): string[] {
  const script = scriptById(scriptId);
  if (!script) return [];
  return script.cues.slice(0, limit).map((cue) => `${cue.heading}. ${cue.words}`);
}

function lessonHref(id: string): string {
  return `/academy/move/studio/lessons/${id}`;
}

type MoveView = {
  title: string;
  detail: string;
  steps: string[];
  href: string;
  hrefLabel: string;
  why: string;
};

function presentLesson(id: string, shorter: boolean, why: string): MoveView {
  const lesson = lessonById(id);
  if (!lesson) {
    return {
      title: msg("A short movement"),
      detail: msg("Open Movement for the lessons that are already on this site. This page does not add a play button."),
      steps: [],
      href: "/academy/move",
      hrefLabel: msg("Open Movement"),
      why,
    };
  }
  if (lesson.kind === "video") {
    return {
      title: lesson.title,
      detail: `${lesson.summary} The film plays on its Movement Studio page. This page does not add a play button.`,
      steps: [],
      href: lessonHref(lesson.id),
      hrefLabel: msg("Open this film in Movement Studio"),
      why,
    };
  }
  const limit = shorter ? 2 : lesson.script.cues.length;
  return {
    title: lesson.title,
    detail: msg("Written steps from the existing practice. This is not a video and there is no play button."),
    steps: lessonSteps(lesson.script.id, limit),
    href: lessonHref(lesson.id),
    hrefLabel: msg("Open the written practice"),
    why,
  };
}

function gentleWhy(answers: Assessment | null): string {
  if (!answers) return "";
  if (answers.ageRange === "60-69" || answers.ageRange === "70+") {
    return msg("Your saved age range is 60 or older, so movement stays short or seated. Skip any part that does not fit.");
  }
  if (GENTLE_NOTE.test(answers.conditionsNote)) {
    return msg("Your saved note mentions pain, injury, or a fall, so movement stays seated or written.");
  }
  if (answers.activityDays.trim() && Number(answers.activityDays) <= 1) {
    return msg("You saved activity on one day or fewer in a typical week, so the movement stays small.");
  }
  return "";
}

function movementView(answers: Assessment | null, variant: number, shorter: boolean): MoveView {
  const gentle = needsGentle(answers);
  const options = gentle
    ? ["script-chair", "video-hands", "script-morning"]
    : ["video-workout-10", "video-hands", "script-chair"];
  let id = options[mod(variant, options.length)] ?? "script-chair";
  const lesson = lessonById(id);
  if (shorter && lesson?.kind === "video" && lesson.durationSeconds > 300) id = "video-hands";
  else if (shorter && lesson?.kind === "video") id = "script-chair";
  return presentLesson(id, shorter, gentleWhy(answers));
}

function breakView(variant: number, shorter: boolean): MoveView {
  const id = mod(variant, 2) === 0 ? "script-back" : "script-morning";
  const view = presentLesson(id, true, "");
  if (!shorter) {
    const lesson = lessonById(id);
    if (lesson?.kind === "script") view.steps = lessonSteps(lesson.script.id, 3);
  }
  view.title = msg("Movement break");
  return view;
}

function stretchView(variant: number, shorter: boolean): MoveView {
  if (mod(variant, 2) === 1 && !shorter) {
    return presentLesson("video-ankle", false, "");
  }
  return presentLesson("script-morning", shorter, "");
}

function mealLink(slug: string): { href: string; label: string } {
  const meal = mealModule(slug);
  return {
    href: meal ? `/academy/meals/${meal.slug}` : "/academy/meals",
    label: meal ? `Open ${meal.title}` : msg("Open Nutrition"),
  };
}

function mealView(slot: "breakfast" | "lunch" | "dinner", answers: Assessment | null, variant: number, shorter: boolean) {
  const slugs =
    slot === "breakfast"
      ? ["produce", "planning", "protein"]
      : slot === "lunch"
        ? ["fiber", "portions", "fish"]
        : ["preparation", "planning", "produce"];
  const slug = slugs[mod(variant, slugs.length)] ?? "planning";
  const link = mealLink(slug);
  const plants =
    answers?.vegetables === "rarely" || answers?.vegetables === "some-days"
      ? ` You reported vegetables ${vegetableLabels[answers.vegetables].toLowerCase()}. The nutrition lesson is a place to read, not a menu.`
      : "";
  const detail = shorter
    ? `A smaller plate of a meal you already make is enough.${plants}`
    : `Use a meal you already know how to make. Vegetables, a protein food you already eat, and a starch can share the plate.${plants}`;
  return {
    title: slot === "breakfast" ? msg("Breakfast") : slot === "lunch" ? msg("Lunch") : msg("Dinner"),
    detail,
    href: link.href,
    hrefLabel: link.label,
    why: answers ? "" : msg("No completed assessment is saved, so this stays a general meal cue."),
  };
}

function waterView(answers: Assessment | null, variant: number): { detail: string; why: string } {
  const alt = mod(variant, 2) === 1;
  if (!answers?.hydration) {
    return {
      detail: alt
        ? msg("If water is not appealing, a warm unsweetened drink you already like is a fine stand-in. A fluid limit from a clinician comes first.")
        : msg("Drink when you are thirsty, unless a clinician has limited your fluids. There is no amount you must finish."),
      why: "",
    };
  }
  const label = hydrationLabels[answers.hydration].toLowerCase();
  return {
    detail: alt
      ? msg("A warm unsweetened drink you already like can stand in for water. A fluid limit from a clinician comes first.")
      : `You reported water ${label}. Drink when you are thirsty. A medical fluid limit comes first.`,
    why: msg("This uses the water answer already saved on your assessment."),
  };
}

function habitOptions(answers: Assessment | null, plans: HabitPlan[]): { detail: string; shorterDetail: string; why: string }[] {
  if (plans.length > 0) {
    return plans.map((plan) => ({
      detail: plan.smallAction,
      shorterDetail: plan.easierAction,
      why: msg("This is the tiny action already saved in Habit Transformation. My Day does not write a new one."),
    }));
  }
  const goals = answers?.goals ?? [];
  if (goals.length === 0) {
    return [
      {
        detail: msg("Choose one small action you can do now."),
        shorterDetail: msg("One minute is enough. Then stop."),
        why: msg("No habit journey is saved, so this is a general small action. Habit Transformation is not filled in here."),
      },
    ];
  }
  return goals.map((goal) => ({
    detail: LOCAL_HABIT[goal],
    shorterDetail: msg("One minute is enough. Then stop."),
    why: `This line uses the focus “${goalLabels[goal]}” already saved on your assessment. It is not a Habit Transformation record.`,
  }));
}

function sleepWhy(answers: Assessment | null): string {
  if (!answers) return "";
  const bits: string[] = [];
  if (answers.sleepHours.trim()) bits.push(`about ${answers.sleepHours} hours`);
  if (answers.sleepQuality) bits.push(sleepQualityLabels[answers.sleepQuality].toLowerCase());
  if (bits.length === 0) return "";
  return `You already saved sleep as ${bits.join(", ")}.`;
}

function relaxView(answers: Assessment | null, shorter: boolean): MoveView {
  const view = presentLesson("script-breathe", shorter, sleepWhy(answers));
  view.href = "/choices/sleep";
  view.hrefLabel = msg("Open the sleep lesson");
  if (answers?.stress === "high" || answers?.stress === "moderate") {
    view.why = [view.why, msg("Your saved stress answer is included only as context. This is not treatment.")].filter(Boolean).join(" ");
  }
  view.title = msg("Relaxation");
  return view;
}

export type DaySources = {
  date?: string;
  foodPlan?: FoodPlanState | null;
  brain?: BrainProgress | null;
  emotionalNotes?: boolean;
};

function weekdayIndex(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  const sunday = date.getUTCDay();
  return sunday === 0 ? 6 : sunday - 1;
}

function savedMeal(plan: FoodPlanState | null | undefined, date: string, slot: "breakfast" | "lunch" | "dinner") {
  if (!plan?.week || planBlockReason(plan.profile)) return null;
  const index = weekdayIndex(date);
  if (index === null) return null;
  const planned = plan.week.days.find((item) => item.index === index)?.meals.find((meal) => meal.slot === slot);
  if (!planned) return null;
  return mealById(planned.mealId);
}

export function presentDay(
  day: DayRecord,
  savedTimes: Partial<Record<ItemId, string>>,
  answers: Assessment | null,
  journey: HabitJourney,
  sources?: DaySources,
): PresentedItem[] {
  const plans = plansFor(journey);
  const habits = habitOptions(answers, plans);
  return ITEM_IDS.map((id) => {
    const state = day.items[id];
    const timeLabel: PresentedItem["timeLabel"] = savedTimes[id] === state.time ? "Your time" : "Suggested time";
    const base = {
      id,
      time: state.time,
      timeLabel,
      status: state.status,
      note: state.note,
      shorter: state.shorter,
      steps: [] as string[],
    };
    if (id === "water") {
      const water = waterView(answers, state.variant);
      return { ...base, section: msg("Morning"), title: msg("Water"), detail: water.detail, href: "/wellness-coach/hydration", hrefLabel: msg("Open the hydration lesson"), why: water.why };
    }
    if (id === "stretch") {
      const stretch = stretchView(state.variant, state.shorter);
      return { ...base, section: msg("Morning"), ...stretch };
    }
    if (id === "movement") {
      const move = movementView(answers, state.variant, state.shorter);
      return { ...base, section: msg("Workout"), ...move };
    }
    if (id === "breakfast" || id === "lunch" || id === "dinner") {
      const saved = savedMeal(sources?.foodPlan, sources?.date || day.date, id);
      if (saved) {
        return {
          ...base,
          section: msg("Nutrition"),
          title: saved.name,
          detail: state.shorter ? saved.summary : `${saved.summary} Portions stay the ones already saved.`,
          steps: state.shorter ? [] : saved.steps.slice(0, 3),
          href: "/food-plan/week",
          hrefLabel: msg("Open the saved food plan"),
          why: msg("This is the meal already saved on your food plan for this weekday. My Day does not build a new menu."),
        };
      }
      const meal = mealView(id, answers, state.variant, state.shorter);
      return { ...base, section: msg("Nutrition"), steps: [], ...meal };
    }
    if (id === "brain") {
      const daily = mod(state.variant, 2) === 0;
      const savedBrain = Boolean(sources?.brain && !isEmptyBrain(sources.brain));
      return {
        ...base,
        section: msg("Brain challenge"),
        title: msg("Brain challenge"),
        detail: state.shorter
          ? msg("One question is enough. A score is not a health measure.")
          : msg("One link to the quiz that is already on this site. A score is not a health measure."),
        href: daily ? "/brain-quiz/daily" : "/brain-quiz",
        hrefLabel: daily ? msg("Open today's Brain & Habit Quiz") : msg("Open the Brain & Habit Quiz"),
        why: savedBrain ? msg("You already have Brain & Habit Quiz marks saved. A score is not a health measure.") : "",
      };
    }
    if (id === "break") {
      const pause = breakView(state.variant, state.shorter);
      return { ...base, section: msg("Workout"), ...pause };
    }
    if (id === "habit") {
      const option = habits[mod(state.variant, habits.length)] ?? habits[0];
      return {
        ...base,
        section: msg("Habit"),
        title: msg("One tiny habit"),
        detail: state.shorter ? (option?.shorterDetail ?? "") : (option?.detail ?? ""),
        href: HABIT_HREF,
        hrefLabel: msg("Open My Tiny Daily Actions"),
        why: option?.why ?? "",
      };
    }
    if (id === "relax") {
      const relax = relaxView(answers, state.shorter);
      if (sources?.emotionalNotes) {
        relax.why = [relax.why, msg("You have Emotional Wellness notes in this browser. They are not a diagnosis, and that page has not been clinically reviewed.")]
          .filter(Boolean)
          .join(" ");
      }
      return { ...base, section: msg("Sleep and recovery"), ...relax };
    }
    const progressLink = mod(state.variant, 2) === 0;
    return {
      ...base,
      section: msg("Sleep and recovery"),
      title: msg("Evening check-in"),
      detail: state.shorter
        ? msg("One word is enough. An open day is not a failure.")
        : msg("A short evening note, if you want one. An unfinished day can stay unfinished."),
      href: progressLink ? "/progress" : "/habit-transformation/check-in",
      hrefLabel: progressLink ? msg("Open Progress") : msg("Open the Habit Transformation check-in"),
      why: "",
    };
  });
}

export function ayurvedaNote(): string {
  return msg("A traditional daily rhythm, sometimes called dinacharya, is a cultural practice of morning care, a midday meal, and a quieter evening. It is not a diagnosis, not a body-type label, and not a medical diet. It does not change the meals on this page.");
}
