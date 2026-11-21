/**
 * The guided start: welcome, questionnaire, starting health profile, and a plan whose every
 * item opens a page that already exists in LifeZoi.
 *
 * Everything here reads only what the person reported. Nothing is measured, scored, or
 * predicted, and no medicine is ever suggested.
 */
import { safetyFlags } from "@/lib/health-profile";
import { msg } from "@/lib/i18n/translate";
import type { NormalizedAssessment } from "@/lib/types";

export type JourneyStepId = "welcome" | "questionnaire" | "profile" | "plan";
export type JourneyStepState = "done" | "current" | "next";

export type JourneyStep = {
  id: JourneyStepId;
  title: string;
  text: string;
  href: string;
  cta: string;
  state: JourneyStepState;
};

const STEP_COPY: Record<JourneyStepId, { title: string; text: string; href: string; cta: string }> = {
  welcome: {
    title: msg("Welcome to LifeZoi"),
    text: msg("A short tour of how LifeZoi works and what stays private."),
    href: "/start",
    cta: msg("You are here"),
  },
  questionnaire: {
    title: msg("Your health questionnaire"),
    text: msg("About ten minutes. Skip anything you prefer not to answer."),
    href: "/assessment",
    cta: msg("Start the questionnaire"),
  },
  profile: {
    title: msg("Your starting health profile"),
    text: msg("What you told us, explained in plain words. Not a diagnosis."),
    href: "/my-health/baseline",
    cta: msg("See my health profile"),
  },
  plan: {
    title: msg("Your personal plan"),
    text: msg("Small steps for food, movement, sleep, calm, and your mind, each with a button to start."),
    href: "/my-health/baseline#plan",
    cta: msg("See my plan"),
  },
};

/** Where the person is on the guided start. `draftStarted` means answers exist but were not saved yet. */
export function journeySteps(input: { assessmentSaved: boolean; draftStarted: boolean }): JourneyStep[] {
  const order: JourneyStepId[] = ["welcome", "questionnaire", "profile", "plan"];
  return order.map((id, index) => {
    const copy = STEP_COPY[id];
    // Before saving: the questionnaire is the step to do. After saving: profile and plan are open.
    const state: JourneyStepState =
      index === 0 ? "done" : input.assessmentSaved ? (index === 1 ? "done" : "current") : index === 1 ? "current" : "next";
    let cta = copy.cta;
    if (id === "questionnaire" && input.assessmentSaved) cta = msg("Update my answers");
    else if (id === "questionnaire" && input.draftStarted) cta = msg("Continue the questionnaire");
    return { id, ...copy, cta, state };
  });
}

export type BodySummary = {
  heightCm: number | null;
  weightKg: number | null;
  targetKg: number | null;
  /** Target minus current, rounded to one decimal. Null unless both are known. */
  changeKg: number | null;
};

export function bodySummary(answers: NormalizedAssessment): BodySummary {
  const target = answers.desiredWeightKg.trim() ? Number(answers.desiredWeightKg) : null;
  const targetKg = target !== null && Number.isFinite(target) ? target : null;
  const changeKg =
    targetKg !== null && answers.weightKg !== null ? Math.round((targetKg - answers.weightKg) * 10) / 10 : null;
  return { heightCm: answers.heightCm, weightKg: answers.weightKg, targetKg, changeKg };
}

export type PlanItemId =
  | "nutrition"
  | "meals"
  | "movement"
  | "sleep"
  | "stress"
  | "brain"
  | "habit"
  | "connection"
  | "urges"
  | "goals";

export type PlanItem = {
  id: PlanItemId;
  area: string;
  action: string;
  why: string;
  href: string;
  cta: string;
};

const has = <T,>(list: readonly T[], value: T) => list.includes(value);

/**
 * The personal plan. Always the same eight areas in the same order (so the page is predictable),
 * plus connection or urges only when the answers point there. Every item links to an existing page.
 */
export function journeyPlan(answers: NormalizedAssessment | null): PlanItem[] {
  const goals = answers?.wellnessGoals ?? [];
  const flags = answers ? safetyFlags(answers) : null;
  const items: PlanItem[] = [];

  // Nutrition
  if (has(goals, "lose-weight")) {
    items.push({
      id: "nutrition",
      area: msg("Nutrition"),
      action: msg("At one meal a day, fill half the plate with vegetables. No calorie counting and no skipped meals."),
      why: msg("You chose losing weight as a goal. Gentle, steady changes are easier to keep than strict cutting."),
      href: "/food-plan/simple/plate",
      cta: msg("Open the healthy plate"),
    });
  } else if (has(goals, "gain-weight")) {
    items.push({
      id: "nutrition",
      area: msg("Nutrition"),
      action: msg("Add one protein food you enjoy to two meals a day."),
      why: msg("You chose gaining weight as a goal. A clinician can tell you how quickly is right for you."),
      href: "/food-plan/protein",
      cta: msg("Open the protein guide"),
    });
  } else if (!answers || answers.vegetables === "rarely" || answers.vegetables === "some-days") {
    items.push({
      id: "nutrition",
      area: msg("Nutrition"),
      action: msg("Add one vegetable or fruit you already like on three days this week."),
      why: msg("You said vegetables or fruit are not yet an everyday habit."),
      href: "/food-plan/simple",
      cta: msg("Open simple eating"),
    });
  } else {
    items.push({
      id: "nutrition",
      area: msg("Nutrition"),
      action: msg("Keep your vegetables going and try one seasonal food this week."),
      why: msg("You already eat vegetables or fruit most days. That is worth keeping."),
      href: "/food-plan/seasonal",
      cta: msg("Open seasonal foods"),
    });
  }

  items.push({
    id: "meals",
    area: msg("Suggested meals"),
    action: msg("Look at today's breakfast, lunch, and dinner ideas and pick one to cook."),
    why: flags?.allergies
      ? msg("The ideas skip the allergies and foods to avoid that you listed.")
      : msg("The ideas follow the food choices and requirements you listed."),
    href: "/food-plan/today",
    cta: msg("See today's meals"),
  });

  // Movement
  if (flags?.seatedFirst) {
    items.push({
      id: "movement",
      area: msg("Physical activity"),
      action: msg("Do one seated chair class of about 10 minutes on three days."),
      why: msg("You told us standing for long is hard, so the plan starts seated."),
      href: "/academy/move/studio/chair-yoga",
      cta: msg("Open Chair Yoga Studio"),
    });
  } else if (has(goals, "flexibility-balance") || flags?.fallRisk) {
    items.push({
      id: "movement",
      area: msg("Physical activity"),
      action: msg("Do a short balance or stretching class with a sturdy chair nearby, three times this week."),
      why: msg("You asked for better balance and flexibility. Hold on to support whenever you like."),
      href: "/academy/move/library",
      cta: msg("Open the Wellness Library"),
    });
  } else if (!answers || answers.activityDays < 3) {
    items.push({
      id: "movement",
      area: msg("Physical activity"),
      action: msg("Follow a 10-minute Daily Movement class on three days."),
      why: msg("You reported fewer than three active days a week. Short sessions count."),
      href: "/academy/move/studio/daily-movement",
      cta: msg("Open Daily Movement"),
    });
  } else {
    items.push({
      id: "movement",
      area: msg("Physical activity"),
      action: msg("Keep your active days and add one strength or balance class."),
      why: msg("You are already active on most days. Strength and balance help with everyday tasks."),
      href: "/academy/move/library",
      cta: msg("Open the Wellness Library"),
    });
  }

  // Sleep
  const shortSleep = answers !== null && (answers.sleepHours < 7 || answers.sleepQuality === "poor" || answers.sleepQuality === "fair");
  items.push({
    id: "sleep",
    area: msg("Sleep"),
    action:
      shortSleep || has(goals, "sleep")
        ? msg("Start a wind-down 30 minutes before bed: lights low, screens away, five minutes of slow breathing.")
        : msg("Keep your bedtime and wake time within about an hour, even at weekends."),
    why:
      shortSleep || has(goals, "sleep")
        ? msg("You told us sleep could be better. A calm routine is a gentle place to start.")
        : msg("Your sleep sounds steady. Regular timing helps keep it that way."),
    href: "/breathe",
    cta: msg("Open Breathe for Life"),
  });

  // Stress
  const stressed = answers !== null && (answers.stress === "high" || answers.stress === "moderate");
  items.push({
    id: "stress",
    area: msg("Stress management"),
    action: stressed || has(goals, "stress")
      ? msg("Try one guided breathing practice for a few minutes on three days.")
      : msg("Keep one calm moment in your day, like a short walk or a breathing practice."),
    why: stressed || has(goals, "stress")
      ? msg("You described stress as moderate or high. If it feels like too much, talk with someone you trust or a professional.")
      : msg("Calm moments help even on good weeks."),
    href: "/breathe/practice",
    cta: msg("Open breathing practices"),
  });

  // Brain
  items.push({
    id: "brain",
    area: msg("Brain exercise"),
    action: has(goals, "memory")
      ? msg("Play one 5-minute memory or word game each day.")
      : msg("Play one 5-minute brain game on three days, just for enjoyment."),
    why: has(goals, "memory")
      ? msg("You chose memory as a goal. Games are for fun and practice, not a test.")
      : msg("Learning something new keeps the day interesting. Scores are not a health measure."),
    href: "/brain-quiz/games",
    cta: msg("Open brain games"),
  });

  // Daily habit
  if (answers && (answers.hydration === "rarely" || answers.hydration === "some")) {
    items.push({
      id: "habit",
      area: msg("Daily wellness habit"),
      action: msg("Keep a glass of water in sight and drink it when you finish a task, within any limit your clinician set."),
      why: msg("You said drinking water is not yet a daily habit."),
      href: "/academy/move/breaks",
      cta: msg("Open water and movement breaks"),
    });
  } else if (answers && answers.sedentaryHours >= 6) {
    items.push({
      id: "habit",
      area: msg("Daily wellness habit"),
      action: msg("Stand up or move your legs for a minute every 30 minutes while sitting."),
      why: msg("You reported long hours of sitting. Short breaks help circulation."),
      href: "/academy/move/breaks",
      cta: msg("Open movement breaks"),
    });
  } else {
    items.push({
      id: "habit",
      area: msg("Daily wellness habit"),
      action: msg("Choose one small habit to practise this week and tick it off each day."),
      why: msg("One habit at a time is easier to keep."),
      href: "/habit-transformation",
      cta: msg("Open Habit Transformation"),
    });
  }

  if (answers?.social === "isolated") {
    items.push({
      id: "connection",
      area: msg("Connection"),
      action: msg("Send one message or share one meal with someone this week."),
      why: msg("You said you often feel alone. Small contacts count."),
      href: "/community",
      cta: msg("Open Community"),
    });
  }

  if (answers && (answers.smoking === "daily" || answers.smoking === "some-days" || answers.alcohol === "most-weeks")) {
    items.push({
      id: "urges",
      area: msg("Cravings and urges"),
      action: msg("When a craving comes, pause for a few breaths and write down what started it."),
      why: msg("You reported tobacco or regular alcohol. A clinician can talk with you about support and options."),
      href: "/urges",
      cta: msg("Open Urges"),
    });
  }

  items.push({
    id: "goals",
    area: msg("Personal goals"),
    action: answers?.habitNote ? msg("Look back at your own note once this week and write how it went.") : msg("Write one thing you want this season to make easier."),
    why: msg("Your weekly check-in keeps your goals and progress in one place."),
    href: "/progress/weekly",
    cta: msg("Open the weekly check-in"),
  });

  return items;
}
