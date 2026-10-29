import type { Answers } from "@/lib/assessment";
import type { SourceId } from "@/lib/sources";

export type EvidenceKind = "established" | "varies";

export type ScenarioOption = {
  id: string;
  label: string;
  detail: string;
};

export type Scenario = {
  id: string;
  title: string;
  lead: string;
  options: readonly ScenarioOption[];
  benefits: readonly { text: string; kind: EvidenceKind }[];
  uncertain: readonly string[];
  challenges: readonly string[];
  nextSteps: readonly string[];
  sourceIds: readonly SourceId[];
  currentRoutine: (answers: Answers | null) => string;
  proposedRoutine: (optionId: string) => string;
};

const NO_ASSESSMENT =
  "You have not completed a lifestyle assessment, so there is no current routine on file. The comparison below is a general illustration.";

function proposedFrom(scenarioId: string, optionId: string): string {
  const scenario = scenarios.find((item) => item.id === scenarioId);
  return scenario?.options.find((option) => option.id === optionId)?.detail ?? "Choose one of the listed changes.";
}

export const scenarios: readonly Scenario[] = [
  {
    id: "walk",
    title: "What if I walk regularly?",
    lead: "Compare your current movement with a walking routine you could actually keep.",
    options: [
      {
        id: "short",
        label: "Short walks on most days",
        detail: "A short walk on most days, at a pace that lets you talk.",
      },
      {
        id: "brisk",
        label: "Brisk walks through the week",
        detail: "Brisk walks spread through the week, building toward the adult activity guidance on the CDC page.",
      },
    ],
    benefits: [
      {
        kind: "established",
        text: "CDC materials for adults describe moderate-intensity activity, such as brisk walking, as one of the most useful things people can do for health. Some activity is described as better than none.",
      },
      {
        kind: "established",
        text: "WHO’s physical activity fact sheet describes benefits for heart health, mood, and sleep at the population level. lifeZoi does not turn that into a personal forecast.",
      },
      {
        kind: "varies",
        text: "Energy, comfort, and schedule fit differ from person to person. A walk that helps one person can be the wrong dose for another.",
      },
    ],
    uncertain: [
      "This page does not know your joints, heart, balance, or neighborhood.",
      "It cannot say how your body will respond, or that walking will change the course of a disease.",
    ],
    challenges: [
      "Time, weather, pain, caregiving, and routes that feel unsafe can get in the way.",
      "An ambitious target is easier to drop than a short walk you can repeat.",
    ],
    nextSteps: [
      "Pick the smaller option if the larger one already feels tight.",
      "Put shoes where you will see them, and tie the walk to something you already do.",
      "If you have a health condition, or you have been inactive and want vigorous exercise, talk with a clinician about what is appropriate. CDC’s getting-started page makes the same point.",
    ],
    sourceIds: ["cdcActivity", "cdcAddingActivity", "whoActivity"],
    currentRoutine: (answers) => {
      if (!answers?.activityDays) return NO_ASSESSMENT;
      if (answers.activityDays === "none") {
        return "You reported rarely doing intentional activity. Sitting you reported: " + sitting(answers) + ".";
      }
      if (answers.activityDays === "1-2") {
        return "You reported activity on 1 to 2 days a week. " + sitting(answers) + ".";
      }
      if (answers.activityDays === "3-4") {
        return "You reported activity on 3 to 4 days a week. A walking change would be an adjustment to a routine you already have, not a start from zero.";
      }
      return "You reported activity on 5 or more days a week. More walking may not be the change you need. Keeping a routine you can sustain matters more than adding volume.";
    },
    proposedRoutine: (optionId) => proposedFrom("walk", optionId),
  },
  {
    id: "sleep",
    title: "What if I improve my sleep schedule?",
    lead: "Look at a steadier sleep window without treating it as a sleep study.",
    options: [
      {
        id: "anchor",
        label: "A steady wake time",
        detail: "Keep a similar wake time through the week, including days off, and protect a wind-down before bed.",
      },
      {
        id: "window",
        label: "A longer sleep window",
        detail: "Move the bedtime earlier in small steps so the sleep window is longer, while keeping the wake time steady.",
      },
    ],
    benefits: [
      {
        kind: "established",
        text: "CDC’s sleep overview says enough sleep and sleep quality both matter, and that the suggested amount changes with age. For many adults that guidance includes 7 or more hours.",
      },
      {
        kind: "established",
        text: "CDC also describes practical habits: a regular schedule, daylight, daytime activity, and a cool, dark, quiet room.",
      },
      {
        kind: "varies",
        text: "Shift work, pain, caregiving, and some medicines can make a textbook schedule unrealistic. lifeZoi cannot tell which barrier is yours.",
      },
    ],
    uncertain: [
      "A steadier schedule is general education, not a treatment for insomnia or a breathing disorder.",
      "Feeling more rested is a reasonable hope. It is not a promised result.",
    ],
    challenges: [
      "Late work, screens, caffeine, and alcohol near bedtime can fight a new schedule.",
      "Changing bedtime by a lot in one night often fails. Small shifts are easier.",
    ],
    nextSteps: [
      "Choose a wake time you can keep on most days.",
      "Dim screens and bright overhead light in the last part of the evening.",
      "If sleep trouble is severe, lasts, or comes with gasping or a very low mood, talk with a clinician. This page is not a sleep evaluation.",
    ],
    sourceIds: ["cdcSleep", "cdcSleepHeart"],
    currentRoutine: (answers) => {
      if (!answers?.sleepHours) return NO_ASSESSMENT;
      const amount: Record<string, string> = {
        "under-6": "under 6 hours",
        "6-7": "about 6 to 7 hours",
        "7-9": "about 7 to 9 hours",
        "over-9": "more than 9 hours",
      };
      const quality: Record<string, string> = {
        restless: "often restless",
        mixed: "mixed",
        "usually-rested": "usually rested",
      };
      return `You reported usual sleep of ${amount[answers.sleepHours] ?? "an unspecified amount"}, and quality as ${quality[answers.sleepQuality] ?? "not described"}.`;
    },
    proposedRoutine: (optionId) => proposedFrom("sleep", optionId),
  },
  {
    id: "smoking",
    title: "What if I reduce or stop smoking?",
    lead: "See what public health agencies say about quitting, without a personal prediction.",
    options: [
      {
        id: "delay",
        label: "Delay the first cigarette",
        detail: "On smoking days, delay the first cigarette and remove cigarettes from the places you usually reach for them.",
      },
      {
        id: "quit-plan",
        label: "A quit attempt with support",
        detail: "Set a quit date you choose, and use free support such as Smokefree.gov. A clinician can discuss further help. lifeZoi does not choose a treatment.",
      },
    ],
    benefits: [
      {
        kind: "established",
        text: "The CDC describes quitting smoking as one of the most important health actions people who smoke can take, at any age, and says health starts to change after the last cigarette.",
      },
      {
        kind: "established",
        text: "Free coaching and quit resources are available through Smokefree.gov, run by the National Cancer Institute.",
      },
      {
        kind: "varies",
        text: "Cravings, stress, and the people around you change how hard a quit attempt feels. lifeZoi will not estimate how long anyone will live, and it will not promise a personal result.",
      },
    ],
    uncertain: [
      "Cutting down and quitting are not the same. Many people need more than one attempt.",
      "This does not choose a treatment, and it does not replace counseling or clinical care.",
    ],
    challenges: [
      "Nicotine withdrawal can include irritability, trouble sleeping, and strong urges.",
      "Alcohol, coffee, and certain places can cue a cigarette even after a good week.",
    ],
    nextSteps: [
      "If you smoke, read the CDC benefits page and the Smokefree.gov resources before you decide on a date.",
      "Tell one person what you are trying, if that feels safe.",
      "If you are pregnant, have heart or lung disease, or use other nicotine products, talk with a clinician about the attempt.",
    ],
    sourceIds: ["cdcQuit", "smokefree"],
    currentRoutine: (answers) => {
      if (!answers?.smoking) return NO_ASSESSMENT;
      if (answers.smoking === "skip") return "You chose not to answer the tobacco question. This page stays general education.";
      if (answers.smoking === "never") {
        return "You reported that you have not smoked regularly. This scenario is general education, not a plan for you.";
      }
      if (answers.smoking === "former") {
        return "You reported that you used to smoke and do not now. The useful question may be how to stay off cigarettes, not how to start a first quit.";
      }
      if (answers.smoking === "some-days") return "You reported smoking on some days.";
      return "You reported smoking daily.";
    },
    proposedRoutine: (optionId) => proposedFrom("smoking", optionId),
  },
  {
    id: "eating",
    title: "What if I make gradual changes to my eating habits?",
    lead: "Explore a small shift in everyday eating. This is not a diet plan or a weight target.",
    options: [
      {
        id: "plants",
        label: "Add vegetables or fruit",
        detail: "Add vegetables or fruit to one meal you already eat, most days, without changing everything else at once.",
      },
      {
        id: "rhythm",
        label: "A more regular meal rhythm",
        detail: "Keep a simple meal rhythm on weekdays so long gaps and last-minute choices happen less often.",
      },
    ],
    benefits: [
      {
        kind: "established",
        text: "USDA MyPlate and the Dietary Guidelines for Americans describe patterns built from vegetables, fruit, and other nutrient-dense foods. Amounts depend on the person.",
      },
      {
        kind: "established",
        text: "CDC notes that plain water can replace sugary drinks and supports normal body function. Needs still vary.",
      },
      {
        kind: "varies",
        text: "Appetite, culture, budget, and medical diets all change what a gradual shift should look like. lifeZoi will not prescribe meals or calories.",
      },
    ],
    uncertain: [
      "Adding one food is not a treatment for cholesterol, diabetes, or any other condition.",
      "Weight change is not the goal of this scenario, and none is promised.",
    ],
    challenges: [
      "Cost, time, and the food available at work can limit choices.",
      "Changing many foods at once is harder to keep than one repeated addition.",
    ],
    nextSteps: [
      "Pick one meal, not the whole day.",
      "If a clinician or dietitian has already given you a pattern to follow, use that instead of this illustration.",
      "Read MyPlate for examples, then adapt them to foods you can get and enjoy.",
    ],
    sourceIds: ["myplate", "dietaryGuidelines", "cdcWater"],
    currentRoutine: (answers) => {
      if (!answers?.plants) return NO_ASSESSMENT;
      const plants: Record<string, string> = {
        rarely: "rarely including vegetables or fruit",
        "some-days": "including vegetables or fruit on some days",
        "most-days": "including vegetables or fruit on most days",
      };
      const meals: Record<string, string> = {
        irregular: "irregular mealtimes",
        mixed: "a mix of regular and irregular meals",
        "mostly-regular": "mostly regular meals",
      };
      return `You reported ${plants[answers.plants] ?? "an eating pattern"}, with ${meals[answers.mealRhythm] ?? "no meal rhythm on file"}.`;
    },
    proposedRoutine: (optionId) => proposedFrom("eating", optionId),
  },
  {
    id: "stress",
    title: "What if I add stress-management practices?",
    lead: "Try a small, repeatable practice. This is self-care education, not therapy.",
    options: [
      {
        id: "breath",
        label: "A few quiet minutes",
        detail: "Once a day, take a few quiet minutes for slow breathing, a short walk, or another low-stress activity you already tolerate.",
      },
      {
        id: "boundary",
        label: "One smaller commitment",
        detail: "Each week, decline or shorten one commitment that is optional, and protect time for sleep.",
      },
    ],
    benefits: [
      {
        kind: "established",
        text: "NIMH describes self-care, including movement, sleep, relaxing activities, and staying connected, as part of caring for mental health.",
      },
      {
        kind: "varies",
        text: "A brief practice can feel useful, neutral, or frustrating. That difference is normal, and it is not a measure of effort or character.",
      },
    ],
    uncertain: [
      "Stress practices do not treat trauma, anxiety disorders, or depression.",
      "If distress is severe or daily tasks are slipping, NIMH encourages professional help. lifeZoi cannot decide whether that applies to you.",
    ],
    challenges: [
      "A new practice is easy to skip when the day is already full. That is a scheduling problem, not a personal failure.",
      "Some breathing or meditation exercises feel unpleasant. Switching to a walk or music is allowed.",
    ],
    nextSteps: [
      "Anchor the practice to something you already do, such as the first coffee or the commute.",
      "Keep it short enough that you would still do it on a bad day.",
      "If you are in crisis, use 988 in the United States or local emergency services. Do not wait on a wellness app.",
    ],
    sourceIds: ["nimhCare"],
    currentRoutine: (answers) => {
      if (!answers?.stress) return NO_ASSESSMENT;
      if (answers.stress === "low") return "You reported stress as mostly manageable. A practice can still be a buffer, and it is optional.";
      if (answers.stress === "moderate") return "You reported stress as often noticeable.";
      return "You reported high stress on many days. A small practice is a starting point, not a full response to that load.";
    },
    proposedRoutine: (optionId) => proposedFrom("stress", optionId),
  },
  {
    id: "connection",
    title: "What if I make more room for people?",
    lead: "Look at one realistic point of contact. Connection has to feel safe to you.",
    options: [
      {
        id: "check-in",
        label: "One real check-in",
        detail: "Once a week, contact one person you trust, by a message or a short visit, with no need to make it an event.",
      },
      {
        id: "shared",
        label: "A repeated shared activity",
        detail: "Join or keep one repeated activity with other people, such as a walk, a class, faith community, or volunteering.",
      },
    ],
    benefits: [
      {
        kind: "established",
        text: "CDC describes small, repeated contact as a way to strengthen social connection, and notes links with stress and sleep. Those are population findings, not a personal promise.",
      },
      {
        kind: "established",
        text: "The U.S. Surgeon General’s office has published an advisory on social connection. lifeZoi links it so you can read the source, and does not restate it as a forecast for you.",
      },
      {
        kind: "varies",
        text: "More contact is not automatically better. Some relationships add strain. You decide what is welcome.",
      },
    ],
    uncertain: [
      "lifeZoi cannot tell which relationships are safe, or whether loneliness has a medical cause.",
      "No chart here links a visit with a friend to a change in disease risk for you.",
    ],
    challenges: [
      "Time, distance, social anxiety, and past harm can make contact costly.",
      "A large social goal is easier to abandon than one recurring check-in.",
    ],
    nextSteps: [
      "Name one person or group, not a new social life.",
      "If reaching out feels unsafe, a clinician, counselor, or trusted service is a better next step than forcing contact.",
      "Read the CDC social connection page before you decide what “more” should mean.",
    ],
    sourceIds: ["cdcSocial", "hhsConnection"],
    currentRoutine: (answers) => {
      if (!answers?.social) return NO_ASSESSMENT;
      if (answers.social === "limited") return "You reported limited contact with other people.";
      if (answers.social === "some") return "You reported some contact with other people.";
      return "You reported regular contact that feels supportive. This scenario may be less relevant than another change.";
    },
    proposedRoutine: (optionId) => proposedFrom("connection", optionId),
  },
];

function sitting(answers: Answers): string {
  if (answers.sedentary === "most-of-day") return "you also reported sitting for most of the day";
  if (answers.sedentary === "some") return "you reported sitting for part of the day";
  if (answers.sedentary === "little") return "you reported sitting for short stretches";
  return "you did not describe sitting time";
}

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find((scenario) => scenario.id === id);
}

export function scenarioText(scenario: Scenario, answers: Answers | null, optionId: string): string[] {
  return [
    scenario.title,
    scenario.lead,
    ...scenario.options.flatMap((option) => [option.label, option.detail]),
    ...scenario.benefits.map((benefit) => benefit.text),
    ...scenario.uncertain,
    ...scenario.challenges,
    ...scenario.nextSteps,
    scenario.currentRoutine(answers),
    scenario.proposedRoutine(optionId),
  ];
}
