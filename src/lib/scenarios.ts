import { assertEducationalCopy } from "@/lib/claims";
import {
  alcoholLabels,
  habitTitle,
  hydrationLabels,
  moodLabels,
  sleepQualityLabels,
  smokingLabels,
  socialLabels,
  stressLabels,
  vegetableLabels,
  weeklyActivityMinutes,
} from "@/lib/labels";
import { PROFESSIONAL_NOTICE, sources } from "@/lib/sources";
import type { HabitId, NormalizedAssessment, Source } from "@/lib/types";

export type ScenarioIllustration = {
  habitId: HabitId;
  title: string;
  yourNote: string;
  currentRoutine: string;
  proposedChange: string;
  likelyBenefits: string[];
  challenges: string[];
  nextSteps: string[];
  established: string;
  uncertain: string;
  sources: Source[];
  notice: string;
  withheld: boolean;
};

const NO_ASSESSMENT =
  "No completed assessment is available, so this illustration does not describe your current routine.";

const UNCERTAIN =
  "What changes for you personally is uncertain. This is an educational illustration, not a medical prediction, and it does not estimate a personal health outcome.";

function withheldScenario(
  habitId: HabitId,
  note: string,
  sourcesForHabit: Source[],
): ScenarioIllustration {
  return {
    habitId,
    title: habitTitle(habitId),
    yourNote: note,
    currentRoutine: "",
    proposedChange: "",
    likelyBenefits: [],
    challenges: [],
    nextSteps: [],
    established: "",
    uncertain:
      "The detailed illustration was withheld because it did not pass an internal wording check. No personal prediction is available.",
    sources: sourcesForHabit,
    notice: PROFESSIONAL_NOTICE,
    withheld: true,
  };
}

function finish(
  scenario: Omit<ScenarioIllustration, "withheld" | "notice">,
): ScenarioIllustration {
  const problem = assertEducationalCopy([
    scenario.currentRoutine,
    scenario.proposedChange,
    scenario.established,
    scenario.uncertain,
    ...scenario.likelyBenefits,
    ...scenario.challenges,
    ...scenario.nextSteps,
  ]);
  if (problem) return withheldScenario(scenario.habitId, scenario.yourNote, scenario.sources);
  return { ...scenario, notice: PROFESSIONAL_NOTICE, withheld: false };
}

function movementCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  const weekly = weeklyActivityMinutes(
    assessment.activityDays,
    assessment.activityMinutes,
  );
  return `You reported activity on ${assessment.activityDays} days in a typical week, about ${assessment.activityMinutes} minutes on those days (${weekly} minutes a week), and about ${assessment.sedentaryHours} hours of sitting or reclining. WHO describes a recommendation of at least 150 minutes of moderate-intensity activity a week, and says any amount is better than none.`;
}

function sleepCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return `You reported about ${assessment.sleepHours} hours of sleep and described the quality as “${sleepQualityLabels[assessment.sleepQuality]}.” The National Heart, Lung, and Blood Institute says experts recommend that adults sleep between 7 and 9 hours a night.`;
}

function smokingCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  if (!assessment.smoking || assessment.smoking === "prefer-not") {
    return "Your assessment did not include a tobacco answer, so this illustration does not describe your tobacco use.";
  }
  return `You reported: ${smokingLabels[assessment.smoking]}. WHO says all forms of tobacco use are harmful and that there is no safe level of exposure to tobacco.`;
}

function eatingCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return `You reported vegetables or fruit: ${vegetableLabels[assessment.vegetables]}. You reported water: ${hydrationLabels[assessment.hydration]}. The Dietary Guidelines for Americans describe vegetables, fruits, and other whole foods as part of a nutritious pattern.`;
}

function stressCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return `You described stress as “${stressLabels[assessment.stress]}” and mood as “${moodLabels[assessment.mood]}.” The National Institute of Mental Health describes stress as a response to an external cause, and lists simple practices people can try.`;
}

function alcoholCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  if (!assessment.alcohol || assessment.alcohol === "prefer-not") {
    return "Your assessment did not include an alcohol answer, so this illustration does not describe your drinking.";
  }
  return `You reported drinking: ${alcoholLabels[assessment.alcohol]}. NIAAA describes effects of alcohol on the body, including a higher chance of some diseases and injuries. This is not a diagnosis.`;
}

function connectionCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return `You described social connection as “${socialLabels[assessment.social]}.” WHO describes high-quality social connections as important for mental and physical health and well-being.`;
}

export function buildScenario(
  habitId: HabitId,
  assessment: NormalizedAssessment | null,
  note: string,
): ScenarioIllustration {
  if (habitId === "custom") {
    return finish({
      habitId,
      title: habitTitle(habitId),
      yourNote: note,
      currentRoutine: assessment
        ? "A completed assessment is on file, but a custom note does not have its own reviewed evidence summary."
        : NO_ASSESSMENT,
      proposedChange: "You described a change in your own words. It is saved with your note and is not turned into a medical claim.",
      likelyBenefits: [],
      challenges: [
        "Without a reviewed summary, lifeZoi will not invent benefits for this note.",
      ],
      nextSteps: [
        "Keep the note as a reminder, and talk through personal health changes with a clinician.",
      ],
      established:
        "lifeZoi does not have a reviewed evidence summary for custom scenarios, so it does not attach benefits or statistics to this note.",
      uncertain: UNCERTAIN,
      sources: [],
    });
  }

  const library: Record<
    Exclude<HabitId, "custom">,
    Omit<ScenarioIllustration, "habitId" | "yourNote" | "withheld" | "notice" | "title">
  > = {
    walk: {
      currentRoutine: movementCurrent(assessment),
      proposedChange:
        "Walk more often, building toward the public guidance of at least 150 minutes of moderate activity a week. A shorter start still counts.",
      likelyBenefits: [
        "WHO states that regular physical activity provides significant physical and mental health benefits.",
        "Walking is one of the ways WHO lists to be active.",
        "WHO also says any amount of physical activity is better than none.",
      ],
      challenges: [
        "Time, weather, pain, and an uneven schedule can make a new walking habit hard to keep.",
        "Sitting time may stay high even in a week with a few walks.",
      ],
      nextSteps: [
        "Choose a few days and a route you already know.",
        "Start with a length that feels workable, then add time gradually.",
        "If pain, chest symptoms, or a medical condition makes activity uncertain, ask a clinician before you increase effort.",
      ],
      established:
        "Established public guidance: WHO recommends at least 150 minutes of moderate-intensity activity a week for adults and says any amount is better than none. The Physical Activity Guidelines for Americans are the U.S. evidence-based guidance on activity and health.",
      uncertain: UNCERTAIN,
      sources: [sources.whoActivity, sources.usActivityGuidelines],
    },
    sleep: {
      currentRoutine: sleepCurrent(assessment),
      proposedChange:
        "Protect a sleep window closer to the 7 to 9 hours experts recommend for adults, and keep a steadier sleep routine.",
      likelyBenefits: [
        "NHLBI says adults who sleep less than 7 hours a night may have more health issues than those who sleep 7 or more hours.",
        "NIMH includes a steady sleep routine among practices to try when stress feels overwhelming.",
      ],
      challenges: [
        "Shift work, caregiving, pain, and worry can interrupt sleep even with a plan.",
        "A new routine often takes repetition before it feels ordinary.",
      ],
      nextSteps: [
        "Pick a wake time you can keep on most days.",
        "Leave a wind-down period before bed.",
        "If sleep stays poor, or you gasp or stop breathing during sleep, talk with a clinician. This page cannot tell you why.",
      ],
      established:
        "Established public guidance: NHLBI says experts recommend that adults sleep between 7 and 9 hours a night.",
      uncertain: UNCERTAIN,
      sources: [sources.nhlbiSleep, sources.nimhStress],
    },
    smoking: {
      currentRoutine: smokingCurrent(assessment),
      proposedChange:
        "Smoke less, or stop, and use support rather than relying on willpower alone.",
      likelyBenefits: [
        "WHO states that all forms of tobacco use are harmful and that there is no safe level of exposure to tobacco.",
        "WHO notes that counseling and medication can improve the chance of quitting. lifeZoi does not recommend a medicine.",
        "Smokefree.gov, from the National Cancer Institute, offers free quit plans and support.",
      ],
      challenges: [
        "Cravings, other people smoking nearby, and stress are common reasons quit attempts stall.",
        "Cutting down and stopping are different steps, and either one can be difficult.",
      ],
      nextSteps: [
        "If you smoke, consider a free quit plan at Smokefree.gov.",
        "Talk with a clinician about support that fits you, including whether any treatment is appropriate.",
        "Tell someone you trust what you are trying, if that feels safe.",
      ],
      established:
        "Established public guidance: WHO says there is no safe level of exposure to tobacco. Quitting support is available through Smokefree.gov. This page does not promise a personal health outcome.",
      uncertain: UNCERTAIN,
      sources: [sources.whoTobacco, sources.smokefree],
    },
    eating: {
      currentRoutine: eatingCurrent(assessment),
      proposedChange:
        "Shift gradually toward more vegetables, fruits, and other whole foods, without an all-or-nothing diet.",
      likelyBenefits: [
        "The Dietary Guidelines for Americans, summarized at RealFood.gov, describe vegetables and fruits as essential and encourage fiber-rich whole grains.",
        "Nutrition.gov explains that water helps the body function and points to healthier drink choices.",
      ],
      challenges: [
        "Cost, time, culture, and what is available nearby all shape eating. A gradual change respects that.",
        "A single week of different meals does not rewrite a pattern.",
      ],
      nextSteps: [
        "Add one vegetable or fruit you already like to a meal you already eat.",
        "Keep water easy to reach during the day.",
        "Ask a registered dietitian or clinician before a large change if you have a medical condition or a prescribed eating plan.",
      ],
      established:
        "Established public guidance: the Dietary Guidelines for Americans emphasize whole, nutrient-dense foods, including vegetables and fruits. This illustration does not prescribe a personal diet.",
      uncertain: UNCERTAIN,
      sources: [sources.dietaryGuidelines, sources.realFood, sources.nutritionWater],
    },
    stress: {
      currentRoutine: stressCurrent(assessment),
      proposedChange:
        "Add one or two stress-management practices from the National Institute of Mental Health list, and repeat them.",
      likelyBenefits: [
        "NIMH says learning which coping techniques work for you can help reduce anxiety and improve daily life.",
        "Practices NIMH lists include journaling, relaxation or mindfulness, movement, regular meals, a sleep routine, less excess caffeine, and reaching out to supportive people.",
      ],
      challenges: [
        "A practice can feel awkward at first, and it may take trial and error.",
        "Stress from work, money, or caregiving does not disappear because a breathing exercise exists.",
      ],
      nextSteps: [
        "Choose one practice from the NIMH list and try it for a week.",
        "If stress or low mood will not ease, or it interferes with daily life, talk with a professional. NIMH says that may be the time to get more help.",
        "If you are in immediate distress in the United States, call or text 988.",
      ],
      established:
        "Established public guidance: NIMH describes stress, anxiety, and coping practices in its fact sheet. SAMHSA describes the 988 Suicide & Crisis Lifeline for people in immediate distress.",
      uncertain: UNCERTAIN,
      sources: [sources.nimhStress, sources.samhsa988],
    },
    alcohol: {
      currentRoutine: alcoholCurrent(assessment),
      proposedChange:
        "Drink less often, or not at all, if that is a change you want to explore.",
      likelyBenefits: [
        "NIAAA describes effects of alcohol on the body, including a higher chance of some diseases and injuries.",
        "Drinking less removes some of those occasions. How that matters for you is individual.",
      ],
      challenges: [
        "Social plans, habit, and stress can make “less often” harder than it sounds.",
        "This page cannot tell how much, if any, is right for you.",
      ],
      nextSteps: [
        "Decide what “less often” means for the next week in plain language.",
        "If drinking feels hard to change, or you are worried about it, talk with a clinician. This is not a diagnosis of an alcohol problem.",
      ],
      established:
        "Established public information: NIAAA publishes material on alcohol’s effects on health. This illustration does not set a personal limit or diagnose anything.",
      uncertain: UNCERTAIN,
      sources: [sources.niaaa],
    },
    connection: {
      currentRoutine: connectionCurrent(assessment),
      proposedChange:
        "Add one recurring point of contact with someone you trust, or a group where you feel welcome.",
      likelyBenefits: [
        "WHO describes high-quality social connections as essential to mental and physical health and well-being.",
        "WHO also describes social isolation and loneliness as having a serious impact on health and quality of life.",
      ],
      challenges: [
        "Moving, grief, illness, and limited time can make connection harder. A small plan is still a plan.",
        "More contact is not helpful if a relationship feels unsafe.",
      ],
      nextSteps: [
        "Send one message, or put one walk or meal with someone on the calendar.",
        "If loneliness is heavy or comes with hopelessness, talk with someone you trust or a clinician. If you are in immediate distress in the United States, call or text 988.",
      ],
      established:
        "Established public guidance: WHO treats social connection, isolation, and loneliness as public health topics. This page cannot say how a new habit would change your health.",
      uncertain: UNCERTAIN,
      sources: [sources.whoConnection, sources.samhsa988],
    },
  };

  const content = library[habitId];
  return finish({
    habitId,
    title: habitTitle(habitId),
    yourNote: note,
    ...content,
  });
}

export function scenarioText(scenario: ScenarioIllustration): string {
  return [
    scenario.currentRoutine,
    scenario.proposedChange,
    scenario.established,
    scenario.uncertain,
    ...scenario.likelyBenefits,
    ...scenario.challenges,
    ...scenario.nextSteps,
  ].join(" ");
}
