import type { Answers, GoalId } from "@/lib/assessment";
import { CRISIS_NOTE } from "@/lib/copy";
import type { SourceId } from "@/lib/sources";

export type Recommendation = {
  id: string;
  title: string;
  why: string;
  actions: string[];
  evidence: "Established general guidance" | "Helpful for many people; individual results vary";
  uncertainty: string;
  sourceIds: SourceId[];
};

type Rule = {
  id: string;
  priority: number;
  goal?: GoalId;
  applies: (answers: Answers) => boolean;
  build: (answers: Answers) => Recommendation;
};

const rules: Rule[] = [
  {
    id: "smoking",
    priority: 1,
    goal: "tobacco",
    applies: (answers) =>
      answers.smoking === "daily" ||
      answers.smoking === "some-days" ||
      (answers.smoking === "former" && answers.goals.includes("tobacco")),
    build: (answers) => ({
      id: "smoking",
      title: answers.smoking === "former" ? "Support for staying off tobacco" : "A realistic look at smoking",
      why:
        answers.smoking === "former"
          ? "You reported that you used to smoke, and tobacco is one of your focuses."
          : answers.smoking === "daily"
            ? "You reported smoking daily."
            : "You reported smoking on some days.",
      actions:
        answers.smoking === "former"
          ? [
              "Notice the situations that make a cigarette appealing, and plan one substitute you can actually do.",
              "Smokefree.gov lists free support if staying off tobacco feels shaky.",
            ]
          : [
              "Read the CDC page on benefits of quitting before you set a date.",
              "Use Smokefree.gov if you want free coaching or a quit plan. lifeZoi will not choose a treatment for you.",
              "If you have heart or lung disease, are pregnant, or already use a nicotine product, talk with a clinician about the attempt.",
            ],
      evidence: "Established general guidance",
      uncertainty: "People differ in withdrawal and in the support they need. This is not a personal medical prediction.",
      sourceIds: ["cdcQuit", "smokefree"],
    }),
  },
  {
    id: "mood",
    priority: 2,
    goal: "stress",
    applies: (answers) => answers.mood === "low",
    build: () => ({
      id: "mood",
      title: "Care around a low mood",
      why: "You described your mood as low lately. That deserves attention. lifeZoi cannot tell what is causing it.",
      actions: [
        "Consider telling a clinician, or someone you trust, how the days have felt.",
        "NIMH describes self-care such as sleep, movement, meals, and contact with people, and it describes when to seek professional help.",
        CRISIS_NOTE,
      ],
      evidence: "Helpful for many people; individual results vary",
      uncertainty: "A low mood has many causes. This is not an assessment of depression or any other condition.",
      sourceIds: ["nimhCare"],
    }),
  },
  {
    id: "sleep",
    priority: 3,
    goal: "sleep",
    applies: (answers) =>
      answers.sleepHours === "under-6" ||
      answers.sleepHours === "6-7" ||
      answers.sleepQuality === "restless" ||
      (answers.goals.includes("sleep") && answers.sleepQuality !== "usually-rested"),
    build: (answers) => ({
      id: "sleep",
      title: "A steadier sleep window",
      why: `You reported sleep as ${answers.sleepHours === "under-6" ? "under 6 hours" : answers.sleepHours === "6-7" ? "about 6 to 7 hours" : "something you want to work on"}, with quality marked as ${answers.sleepQuality || "not fully described"}.`,
      actions: [
        "Keep a similar wake time on most days, including days off.",
        "Dim bright screens in the last part of the evening.",
        "Read the CDC sleep pages for age-based ranges. lifeZoi is not setting a personal hour target.",
      ],
      evidence: "Established general guidance",
      uncertainty: "Schedule changes are general education. They are not a sleep study or a treatment for a sleep disorder.",
      sourceIds: ["cdcSleep", "cdcSleepHeart"],
    }),
  },
  {
    id: "movement",
    priority: 4,
    goal: "movement",
    applies: (answers) =>
      answers.activityDays === "none" ||
      answers.activityDays === "1-2" ||
      answers.sedentary === "most-of-day" ||
      (answers.goals.includes("movement") && answers.activityDays !== "5-plus"),
    build: (answers) => ({
      id: "movement",
      title: "A walk you can repeat",
      why:
        answers.activityDays === "none"
          ? "You reported rarely doing intentional activity."
          : answers.sedentary === "most-of-day"
            ? "You reported sitting for most of the day."
            : "Movement is either limited in what you reported, or it is one of your focuses.",
      actions: [
        "Start with a short walk on the days you already leave the house, if walking is comfortable.",
        "Break up long sitting with a minute or two of standing or moving.",
        "Read the CDC adult activity overview before you copy a weekly target. If you have a condition or have been inactive, ask a clinician before vigorous exercise.",
      ],
      evidence: "Established general guidance",
      uncertainty: "Activity guidance is for the general adult population. It is not a clearance for your body.",
      sourceIds: ["cdcActivity", "cdcAddingActivity", "whoActivity"],
    }),
  },
  {
    id: "alcohol",
    priority: 5,
    goal: "alcohol",
    applies: (answers) =>
      answers.alcohol === "weekly" ||
      answers.alcohol === "most-days" ||
      (answers.goals.includes("alcohol") && answers.alcohol !== "none" && answers.alcohol !== "skip" && answers.alcohol !== ""),
    build: (answers) => ({
      id: "alcohol",
      title: "Drinking less, if you drink",
      why:
        answers.alcohol === "most-days"
          ? "You reported drinking on most days."
          : answers.alcohol === "weekly"
            ? "You reported drinking about weekly."
            : "Alcohol is one of your focuses.",
      actions: [
        "Pick drink-free days you can remember, rather than a vague plan to cut back.",
        "CDC says drinking less is better for health than drinking more, and that some people should not drink at all. Read that page before you set a rule for yourself.",
        "If cutting back feels difficult, or you have a health condition, talk with a clinician. lifeZoi cannot tell you what is safe for you.",
      ],
      evidence: "Established general guidance",
      uncertainty: "This does not calculate a personal risk and it does not decide whether you should drink.",
      sourceIds: ["cdcAlcohol", "niaaaDrinking"],
    }),
  },
  {
    id: "stress",
    priority: 6,
    goal: "stress",
    applies: (answers) => answers.stress === "moderate" || answers.stress === "high",
    build: (answers) => ({
      id: "stress",
      title: "One small stress practice",
      why: answers.stress === "high" ? "You reported high stress on many days." : "You reported stress as often noticeable.",
      actions: [
        "Attach a few quiet minutes to something you already do each day.",
        "Protect sleep before you add more productivity habits.",
        "If stress is severe or daily tasks are slipping, NIMH encourages talking with a health professional.",
      ],
      evidence: "Established general guidance",
      uncertainty: "A short practice is not therapy and it is not a measure of whether you are coping well.",
      sourceIds: ["nimhCare"],
    }),
  },
  {
    id: "plants",
    priority: 7,
    goal: "food",
    applies: (answers) => answers.plants === "rarely" || answers.plants === "some-days",
    build: (answers) => ({
      id: "plants",
      title: "Add plants to a meal you already eat",
      why:
        answers.plants === "rarely"
          ? "You reported rarely including vegetables or fruit."
          : "You reported vegetables or fruit on some days, not most days.",
      actions: [
        "Add one vegetable or fruit to one meal, most days.",
        "Use foods you can get easily. Frozen and canned options count in MyPlate guidance.",
        "Skip any calorie or weight target from this app. It will not give you one.",
      ],
      evidence: "Established general guidance",
      uncertainty: "Eating patterns in national guidance are general. They are not a medical diet.",
      sourceIds: ["myplate", "dietaryGuidelines"],
    }),
  },
  {
    id: "social",
    priority: 8,
    goal: "connection",
    applies: (answers) => answers.social === "limited" || answers.social === "some",
    build: (answers) => ({
      id: "social",
      title: "One point of contact",
      why: answers.social === "limited" ? "You reported limited contact with other people." : "You reported some contact, and there may be room for one reliable check-in.",
      actions: [
        "Choose one person or group that feels safe, and one repeating time.",
        "A short message counts. The CDC page on social connection describes small acts, not a personality overhaul.",
        "If contact feels unsafe, do not force it. A counselor or clinician is a better place to sort that out.",
      ],
      evidence: "Established general guidance",
      uncertainty: "Research on connection does not tell lifeZoi which relationship is right for you.",
      sourceIds: ["cdcSocial", "hhsConnection"],
    }),
  },
  {
    id: "hydration",
    priority: 9,
    goal: "food",
    applies: (answers) => answers.hydration === "rarely" || (answers.hydration === "sometimes" && answers.goals.includes("food")),
    build: () => ({
      id: "hydration",
      title: "Make water the easy choice",
      why: "You reported that water is not yet a usual drink.",
      actions: [
        "Keep water where you already sit or work.",
        "Swap one sugary drink for water on days you remember.",
        "CDC notes that fluid needs vary. This is not a daily quota.",
      ],
      evidence: "Established general guidance",
      uncertainty: "Some health conditions change fluid advice. Follow a clinician if you have been given one.",
      sourceIds: ["cdcWater"],
    }),
  },
  {
    id: "meals",
    priority: 10,
    goal: "food",
    applies: (answers) => answers.mealRhythm === "irregular",
    build: () => ({
      id: "meals",
      title: "A weekday meal anchor",
      why: "You reported irregular mealtimes.",
      actions: [
        "Anchor one weekday meal to a clock time you can keep.",
        "Pair it with food you already know how to make.",
        "Treat missed days as information about the schedule, not as a lapse in character.",
      ],
      evidence: "Helpful for many people; individual results vary",
      uncertainty: "A regular meal is a practical habit. It is not evidence that irregular meals caused a health problem.",
      sourceIds: ["myplate", "dietaryGuidelines"],
    }),
  },
  {
    id: "maintenance",
    priority: 20,
    applies: () => true,
    build: (answers) => ({
      id: "maintenance",
      title: "Keep one practice small enough to repeat",
      why:
        answers.goals.length > 0
          ? "Your answers did not point to a single urgent gap. The useful next step is the focus you already named, kept small."
          : "Your answers did not point to a single urgent gap.",
      actions: [
        "Choose one action from your focus and write the day you will do it.",
        "Review it once a week in Progress. Change it if it does not fit.",
        "Use WHAT IF? if you want to compare that action with your current routine.",
      ],
      evidence: "Helpful for many people; individual results vary",
      uncertainty: "Steady habits are a planning idea. They are not proof of current or future health.",
      sourceIds: ["cdcActivity", "cdcSleep"],
    }),
  },
];

export function buildRecommendations(answers: Answers): Recommendation[] {
  const ranked = rules
    .filter((rule) => rule.id === "maintenance" || rule.applies(answers))
    .map((rule) => ({
      recommendation: rule.build(answers),
      score: rule.priority - (rule.goal && answers.goals.includes(rule.goal) ? 5 : 0),
      id: rule.id,
    }))
    .filter((item) => item.id !== "maintenance" || true);

  const specific = ranked.filter((item) => item.id !== "maintenance").sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));
  if (specific.length === 0) {
    const maintenance = ranked.find((item) => item.id === "maintenance");
    return maintenance ? [maintenance.recommendation] : [];
  }
  const top = specific.slice(0, 4).map((item) => item.recommendation);
  const smoking = specific.find((item) => item.id === "smoking");
  if (smoking && !top.some((item) => item.id === "smoking")) {
    top[top.length - 1] = smoking.recommendation;
  }
  return top;
}

export function recommendationText(recommendation: Recommendation): string[] {
  return [
    recommendation.title,
    recommendation.why,
    ...recommendation.actions,
    recommendation.evidence,
    recommendation.uncertainty,
  ];
}
