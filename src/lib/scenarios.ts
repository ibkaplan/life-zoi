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
import { fmt } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { englishT, localizeBuilt, type Translate } from "@/lib/page-format";
import { PROFESSIONAL_NOTICE, sources } from "@/lib/sources";
import { HABIT_IDS, type HabitId, type NormalizedAssessment, type Source } from "@/lib/types";

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

const NO_ASSESSMENT = msg(
  "No completed assessment is available, so this illustration does not describe your current routine.",
);

const UNCERTAIN = msg(
  "What changes for you personally is uncertain. This is an educational illustration, not a medical prediction, and it does not estimate a personal health outcome.",
);

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
    uncertain: msg(
      "The detailed illustration was withheld because it did not pass an internal wording check. No personal prediction is available.",
    ),
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

const MOVEMENT_CURRENT = msg(
  "You reported activity on {days} days in a typical week, about {minutes} minutes on those days ({weekly} minutes a week), and about {sitting} hours of sitting or reclining. WHO describes a recommendation of at least 150 minutes of moderate-intensity activity a week, and says any amount is better than none.",
);
const SLEEP_CURRENT = msg(
  "You reported about {hours} hours of sleep and described the quality as “{quality}.” The National Heart, Lung, and Blood Institute says experts recommend that adults sleep between 7 and 9 hours a night.",
);
const SMOKING_NONE = msg(
  "Your assessment did not include a tobacco answer, so this illustration does not describe your tobacco use.",
);
const SMOKING_CURRENT = msg(
  "You reported: {answer}. WHO says all forms of tobacco use are harmful and that there is no safe level of exposure to tobacco.",
);
const EATING_CURRENT = msg(
  "You reported vegetables or fruit: {vegetables}. You reported water: {water}. The Dietary Guidelines for Americans describe vegetables, fruits, and other whole foods as part of a nutritious pattern.",
);
const STRESS_CURRENT = msg(
  "You described stress as “{stress}” and mood as “{mood}.” The National Institute of Mental Health describes stress as a response to an external cause, and lists simple practices people can try.",
);
const ALCOHOL_NONE = msg(
  "Your assessment did not include an alcohol answer, so this illustration does not describe your drinking.",
);
const ALCOHOL_CURRENT = msg(
  "You reported drinking: {answer}. NIAAA describes effects of alcohol on the body, including a higher chance of some diseases and injuries. This is not a diagnosis.",
);
const CONNECTION_CURRENT = msg(
  "You described social connection as “{answer}.” WHO describes high-quality social connections as important for mental and physical health and well-being.",
);
const STRENGTH_CURRENT = msg("{movement} Strength practice: “{answer}.”");
const SUGARY_CURRENT = msg(
  "You reported added-sugar drinks as “{answer}.” Sugary drinks are a common source of added sugars. Naturally occurring sugars in milk and fruit are a different question.",
);
const FIBER_CURRENT = msg("You reported fiber-containing foods as “{answer}.” Vegetables or fruit: {vegetables}.");
const NOT_ANSWERED = msg("not answered");
const COMBINED_ONE = msg("{title}. {change}");
const COMBINED_TOGETHER = msg(
  "{title} together with {other}. {change} Each change stays educational. lifeZoi does not merge them into a personal forecast.",
);

/**
 * English templates the WHAT IF? route fills in. The page matches the route's English
 * against these to show the same sentence in the chosen language.
 */
export const SCENARIO_TEMPLATES: readonly string[] = [
  MOVEMENT_CURRENT,
  SLEEP_CURRENT,
  SMOKING_CURRENT,
  EATING_CURRENT,
  STRESS_CURRENT,
  ALCOHOL_CURRENT,
  CONNECTION_CURRENT,
  STRENGTH_CURRENT,
  SUGARY_CURRENT,
  FIBER_CURRENT,
];

function movementCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  const weekly = weeklyActivityMinutes(
    assessment.activityDays,
    assessment.activityMinutes,
  );
  return fmt(MOVEMENT_CURRENT, {
    days: assessment.activityDays,
    minutes: assessment.activityMinutes,
    weekly,
    sitting: assessment.sedentaryHours,
  });
}

function sleepCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return fmt(SLEEP_CURRENT, {
    hours: assessment.sleepHours,
    quality: sleepQualityLabels[assessment.sleepQuality],
  });
}

function smokingCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  if (!assessment.smoking || assessment.smoking === "prefer-not") {
    return SMOKING_NONE;
  }
  return fmt(SMOKING_CURRENT, { answer: smokingLabels[assessment.smoking] });
}

function eatingCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return fmt(EATING_CURRENT, {
    vegetables: vegetableLabels[assessment.vegetables],
    water: hydrationLabels[assessment.hydration],
  });
}

function stressCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return fmt(STRESS_CURRENT, { stress: stressLabels[assessment.stress], mood: moodLabels[assessment.mood] });
}

function alcoholCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  if (!assessment.alcohol || assessment.alcohol === "prefer-not") {
    return ALCOHOL_NONE;
  }
  return fmt(ALCOHOL_CURRENT, { answer: alcoholLabels[assessment.alcohol] });
}

function connectionCurrent(assessment: NormalizedAssessment | null): string {
  if (!assessment) return NO_ASSESSMENT;
  return fmt(CONNECTION_CURRENT, { answer: socialLabels[assessment.social] });
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
        ? msg("A completed assessment is on file, but a custom note does not have its own reviewed evidence summary.")
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
    strength: {
      currentRoutine: assessment
        ? fmt(STRENGTH_CURRENT, {
            movement: movementCurrent(assessment),
            answer: assessment.strength ? vegetableLabels[assessment.strength] : NOT_ANSWERED,
          })
        : NO_ASSESSMENT,
      proposedChange:
        "Hypothetical: add muscle-strengthening movements on two days a week, starting with a familiar motion such as sit-to-stand. A chair version counts, only if it feels safe.",
      likelyBenefits: [
        "WHO includes muscle-strengthening activities for all major muscle groups on two or more days a week in its adult activity guidance.",
        "Regular physical activity is associated with important health benefits.",
        "The Physical Activity Guidelines describe muscle-strengthening as part of the adult picture, alongside aerobic activity.",
        "A shorter or easier start still counts. This page does not promise a change in strength or disease risk.",
      ],
      challenges: [
        "Pain, balance, illness, equipment, and access to a safe place can limit what is realistic. Skip anything that hurts.",
        "Two days is a target to discuss, not a rule you must meet.",
      ],
      nextSteps: [
        "Pick two days and one movement you can do near a sturdy chair.",
        "Ask a clinician if a condition makes strength work unclear.",
        "Stop if you feel pain, chest symptoms, or dizziness, and ask a clinician which movements are suitable.",
      ],
      established:
        "Established public guidance: WHO describes muscle-strengthening activity as part of its physical activity recommendations for adults. The Physical Activity Guidelines also describe muscle-strengthening alongside aerobic activity. This illustration does not prescribe a personal program, and not every exercise fits every condition. This is hypothetical.",
      uncertain: UNCERTAIN,
      sources: [sources.whoActivity, sources.usActivityGuidelines],
    },
    balance: {
      currentRoutine: movementCurrent(assessment),
      proposedChange:
        "Practice balance near a counter or chair, and keep a hand free to hold on.",
      likelyBenefits: [
        "WHO describes multicomponent activity, including functional balance and strength, as part of activity guidance for older adults.",
        "Practicing near support is a safety choice. It is not a prediction about falls.",
      ],
      challenges: [
        "Dizziness, neuropathy, and an unfamiliar floor make balance practice riskier.",
        "A person who feels unsteady should ask a clinician or physical therapist before trying one-foot standing.",
      ],
      nextSteps: [
        "Start by standing at a counter with both feet down.",
        "Skip the practice on any day you feel lightheaded.",
        "If you have fallen recently, talk with a clinician before adding balance work.",
      ],
      established:
        "Established public guidance: WHO includes functional balance and strength training in its physical activity guidance for older adults. This page does not estimate a personal fall risk.",
      uncertain: UNCERTAIN,
      sources: [sources.whoActivity, sources.usActivityGuidelines],
    },
    "sugary-drinks": {
      currentRoutine: assessment
        ? fmt(SUGARY_CURRENT, { answer: assessment.addedSugar ? vegetableLabels[assessment.addedSugar] : NOT_ANSWERED })
        : NO_ASSESSMENT,
      proposedChange: "Hypothetical: choose water or an unsweetened drink more often, if fluids are not restricted for you.",
      likelyBenefits: [
        "CDC’s Rethink Your Drink page discusses added sugars in drinks as something people can notice and change gradually.",
        "A smaller change can still be the whole experiment.",
      ],
      challenges: ["Habit, cost, and social drinks can make a swap feel inconvenient."],
      nextSteps: ["Read one label.", "Keep the drink you enjoy and make the next one smaller if you want."],
      established: "Established public education about added sugars in drinks. This is hypothetical. It is not a personal quota.",
      uncertain: UNCERTAIN,
      sources: [sources.cdcRethinkDrink],
    },
    fiber: {
      currentRoutine: assessment
        ? fmt(FIBER_CURRENT, {
            answer: assessment.fiber ? vegetableLabels[assessment.fiber] : NOT_ANSWERED,
            vegetables: vegetableLabels[assessment.vegetables],
          })
        : NO_ASSESSMENT,
      proposedChange: "Hypothetical: add a small amount of beans, oats, fruit, or a whole grain, and increase slowly with the fluids you are allowed.",
      likelyBenefits: [
        "MedlinePlus describes fiber as part of a usual eating pattern and says to increase it gradually.",
        "The Dietary Guidelines encourage vegetables, fruits, and whole grains.",
      ],
      challenges: ["A sudden large increase can feel uncomfortable. A fluid restriction from a clinician comes first."],
      nextSteps: ["Add one familiar food.", "Drink fluids you are allowed."],
      established: "Established public nutrition education. This is hypothetical and not a personal diet.",
      uncertain: UNCERTAIN,
      sources: [sources.medlineplusFiber, sources.dietaryGuidelines],
    },
    outdoors: {
      currentRoutine: assessment
        ? msg("Time outside is not a required field. Your movement and stress answers are the closest notes already saved.")
        : NO_ASSESSMENT,
      proposedChange: "Hypothetical: spend a few adaptable minutes outside, at a window, or on a balcony. There is no fixed distance.",
      likelyBenefits: [
        "Regular physical activity is associated with important health benefits.",
        "CDC says time outside can be a way to be active and reduce stress, and that sun protection still matters.",
      ],
      challenges: ["Weather, access, and disability change what outside means. A window counts as daylight, not as a workout."],
      nextSteps: ["Use shade, clothing, or sunscreen when the sun is strong.", "Skip intentional tanning."],
      established: "Established public notes on activity and sun safety. Time outside is not medicine and not a replacement for other habits. This is hypothetical.",
      uncertain: UNCERTAIN,
      sources: [sources.cdcSunSafety, sources.whoActivity],
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

export function buildCombination(
  primary: ScenarioIllustration,
  secondary: ScenarioIllustration,
  t: Translate = englishT,
) {
  return {
    label: t("Hypothetical"),
    current: primary.currentRoutine,
    oneChange: t(COMBINED_ONE, { title: primary.title, change: primary.proposedChange }),
    together: t(COMBINED_TOGETHER, { title: primary.title, other: secondary.title, change: secondary.proposedChange }),
  };
}

/** The same illustration with every sentence in the chosen language. The person's own note stays as typed. */
export function localizeScenario(scenario: ScenarioIllustration, t: Translate): ScenarioIllustration {
  const local = (text: string) => localizeBuilt(t, text, SCENARIO_TEMPLATES);
  return {
    ...scenario,
    title: t(scenario.title),
    currentRoutine: local(scenario.currentRoutine),
    proposedChange: local(scenario.proposedChange),
    likelyBenefits: scenario.likelyBenefits.map(local),
    challenges: scenario.challenges.map(local),
    nextSteps: scenario.nextSteps.map(local),
    established: local(scenario.established),
    uncertain: local(scenario.uncertain),
    notice: t(scenario.notice),
  };
}

/** Every fixed sentence an illustration can show, for the translation check. */
export function scenarioCatalogText(): unknown[] {
  return HABIT_IDS.flatMap((habitId) => {
    const { proposedChange, likelyBenefits, challenges, nextSteps, established, uncertain, notice } = buildScenario(
      habitId,
      null,
      "",
    );
    return [proposedChange, likelyBenefits, challenges, nextSteps, established, uncertain, notice];
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
