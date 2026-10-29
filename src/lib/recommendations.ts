import { assertEducationalCopy } from "@/lib/claims";
import { sleepQualityLabels, weeklyActivityMinutes } from "@/lib/labels";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE, sources } from "@/lib/sources";
import type { GoalId, NormalizedAssessment, Source } from "@/lib/types";

export type Recommendation = {
  id: string;
  title: string;
  why: string;
  actions: string[];
  sources: Source[];
  kind: "focus" | "goal" | "maintenance";
};

export type RecommendationResult = {
  items: Recommendation[];
  notice: string;
  crisisNotice: string;
  withheld: boolean;
};

function card(
  id: string,
  title: string,
  why: string,
  actions: string[],
  sourceList: Source[],
  kind: Recommendation["kind"],
): Recommendation {
  return { id, title, why, actions, sources: sourceList, kind };
}

export function buildRecommendations(
  assessment: NormalizedAssessment,
): RecommendationResult {
  const items: Recommendation[] = [];
  const covered = new Set<string>();
  const weekly = weeklyActivityMinutes(
    assessment.activityDays,
    assessment.activityMinutes,
  );

  if (
    assessment.sleepHours < 7 ||
    assessment.sleepHours > 9 ||
    assessment.sleepQuality === "poor" ||
    assessment.sleepQuality === "fair"
  ) {
    covered.add("sleep");
    items.push(
      card(
        "sleep",
        "Sleep",
        `You reported about ${assessment.sleepHours} hours of sleep, with quality “${sleepQualityLabels[assessment.sleepQuality]}.” NHLBI says experts recommend that adults sleep between 7 and 9 hours a night, and that adults who sleep less than 7 hours may have more health issues than those who sleep 7 or more.`,
        [
          "Try a wake time you can keep on most days.",
          "If sleep stays poor, talk with a clinician. This is not an explanation of the cause.",
        ],
        [sources.nhlbiSleep, sources.nimhStress],
        "focus",
      ),
    );
  }

  if (weekly < 150) {
    covered.add("walk");
    items.push(
      card(
        "walk",
        "Movement",
        `You reported about ${weekly} minutes of activity in a typical week, and about ${assessment.sedentaryHours} hours of sitting or reclining. WHO describes a recommendation of at least 150 minutes of moderate-intensity activity a week, and says any amount is better than none.`,
        [
          "Add a short walk on days that already have a little room.",
          "Ask a clinician before you increase effort if activity causes pain or you have a condition that makes exertion uncertain.",
        ],
        [sources.whoActivity, sources.usActivityGuidelines],
        "focus",
      ),
    );
  }

  if (
    assessment.vegetables === "rarely" ||
    assessment.vegetables === "some-days" ||
    assessment.hydration === "rarely" ||
    assessment.hydration === "some"
  ) {
    covered.add("eating");
    items.push(
      card(
        "eating",
        "Everyday food and drinks",
        "You answered about vegetables, fruit, and water. The Dietary Guidelines for Americans describe vegetables and fruits as essential, and Nutrition.gov explains that water helps the body function. A gradual shift is enough to start.",
        [
          "Add one vegetable or fruit to a meal you already eat.",
          "Keep water somewhere you will actually see it.",
        ],
        [sources.dietaryGuidelines, sources.realFood, sources.nutritionWater],
        "focus",
      ),
    );
  }

  if (assessment.smoking === "daily" || assessment.smoking === "some-days") {
    covered.add("smoking");
    items.push(
      card(
        "smoking",
        "Tobacco",
        "You reported smoking on some days or daily. WHO says there is no safe level of exposure to tobacco. lifeZoi cannot say how quitting would change your health, and it does not recommend medication.",
        [
          "Look at the free quit plan on Smokefree.gov if you want support.",
          "Talk with a clinician about options. Do not change a prescribed medicine based on this page.",
        ],
        [sources.whoTobacco, sources.smokefree],
        "focus",
      ),
    );
  } else if (assessment.smoking === "former") {
    covered.add("smoking");
    items.push(
      card(
        "smoking",
        "Tobacco",
        "You reported that you used to smoke. WHO describes all tobacco use as harmful. Staying away from it is a meaningful step. This is not a prediction about your health.",
        ["If cravings return, Smokefree.gov offers free support."],
        [sources.whoTobacco, sources.smokefree],
        "focus",
      ),
    );
  }

  if (assessment.alcohol === "most-weeks") {
    covered.add("alcohol");
    items.push(
      card(
        "alcohol",
        "Alcohol",
        "You noted drinking most weeks. NIAAA describes effects of alcohol on the body, including a higher chance of some diseases and injuries. This is not a diagnosis of an alcohol problem.",
        [
          "If you want to drink less often, pick a plain definition for the next week.",
          "Talk with a clinician if drinking is hard to change.",
        ],
        [sources.niaaa],
        "focus",
      ),
    );
  }

  if (assessment.stress !== "low" || assessment.mood === "low") {
    covered.add("stress");
    items.push(
      card(
        "stress",
        "Stress and mood",
        "You described stress or mood in a way that sounds heavy at times. NIMH says coping practices can help, and that ongoing stress or anxiety that interferes with life is a reason to talk with a professional. This is not a diagnosis.",
        [
          "Try one practice NIMH lists: a journal, a relaxation exercise, a walk, regular meals, or a steadier sleep routine.",
          "If this will not ease, talk with a professional. If you are in immediate distress in the United States, call or text 988.",
        ],
        [sources.nimhStress, sources.samhsa988],
        "focus",
      ),
    );
  }

  if (assessment.social !== "connected") {
    covered.add("connection");
    items.push(
      card(
        "connection",
        "People around you",
        "You described limited social connection. WHO describes high-quality social connections as important for mental and physical health, and describes isolation and loneliness as having a serious impact. This is not a judgment of your relationships.",
        [
          "Choose one person or group and one small, repeatable contact.",
          "Skip any plan that does not feel safe.",
        ],
        [sources.whoConnection],
        "focus",
      ),
    );
  }

  for (const goal of assessment.goals) {
    if (covered.has(goal)) continue;
    items.push(goalCard(goal, assessment));
    covered.add(goal);
  }

  if (items.length === 0) {
    items.push(
      card(
        "maintenance",
        "Keep what is already working",
        "Nothing you entered is asking for a specific change in this educational check. Public guidance still describes regular movement, sufficient sleep, and everyday whole foods as useful for health. This does not mean lifeZoi has judged you healthy or ruled anything out.",
        [
          "Keep a routine that already feels sustainable.",
          "Use WHAT IF? if you want to look at one change anyway.",
        ],
        [sources.whoActivity, sources.nhlbiSleep, sources.dietaryGuidelines],
        "maintenance",
      ),
    );
  }

  const notice = PROFESSIONAL_NOTICE;
  const problem = assertEducationalCopy(
    items.flatMap((item) => [item.title, item.why, ...item.actions]),
  );
  if (problem) {
    return {
      items: [],
      notice,
      crisisNotice: CRISIS_NOTICE,
      withheld: true,
    };
  }
  return { items, notice, crisisNotice: CRISIS_NOTICE, withheld: false };
}

function goalCard(goal: GoalId, assessment: NormalizedAssessment): Recommendation {
  if (goal === "sleep") {
    return card(
      "sleep-goal",
      "Sleep, because you chose it",
      `You chose sleep as a focus. You reported about ${assessment.sleepHours} hours, which sits in the 7 to 9 hour range NHLBI says experts recommend for adults. Keeping a steady routine is a reasonable next step.`,
      ["Keep a wake time you can repeat."],
      [sources.nhlbiSleep],
      "goal",
    );
  }
  if (goal === "walk") {
    return card(
      "walk-goal",
      "Movement, because you chose it",
      "You chose movement as a focus. Your reported week already meets the WHO figure of at least 150 minutes. Keeping a pattern you can repeat matters more than adding intensity for its own sake.",
      ["Keep the days that already work, and adjust if the week changes."],
      [sources.whoActivity],
      "goal",
    );
  }
  if (goal === "eating") {
    return card(
      "eating-goal",
      "Eating patterns, because you chose them",
      "You chose food as a focus. Your answers already include vegetables or fruit on most days and water on most days. The Dietary Guidelines still describe variety in whole foods as useful.",
      ["Keep one meal that already includes vegetables or fruit."],
      [sources.dietaryGuidelines, sources.realFood],
      "goal",
    );
  }
  if (goal === "smoking") {
    return card(
      "smoking-goal",
      "Tobacco, because you chose it",
      "You chose tobacco as a focus, and you did not report current smoking. There may be nothing to change for yourself. WHO still describes tobacco as harmful.",
      ["If you are supporting someone else, Smokefree.gov lists free quit support."],
      [sources.whoTobacco, sources.smokefree],
      "goal",
    );
  }
  if (goal === "alcohol") {
    return card(
      "alcohol-goal",
      "Alcohol, because you chose it",
      "You chose alcohol as a focus. Your answer was not “most weeks.” NIAAA still describes health effects of alcohol. This is not a diagnosis.",
      ["If you want a change, define it in plain language for one week."],
      [sources.niaaa],
      "goal",
    );
  }
  if (goal === "stress") {
    return card(
      "stress-goal",
      "Stress, because you chose it",
      "You chose stress as a focus, and you described it as mostly manageable. NIMH still lists practices people try, such as a journal, movement, and a sleep routine.",
      ["Keep one practice that already helps."],
      [sources.nimhStress],
      "goal",
    );
  }
  return card(
    "connection-goal",
    "Connection, because you chose it",
    "You chose time with other people as a focus, and you described feeling connected. WHO describes social connection as important for health. Keeping a tie that already helps is a reasonable plan.",
    ["Keep one recurring contact that feels welcome."],
    [sources.whoConnection],
    "goal",
  );
}
