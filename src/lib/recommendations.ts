import { assertEducationalCopy } from "@/lib/claims";
import { sleepQualityLabels, weeklyActivityMinutes } from "@/lib/labels";
import { CRISIS_NOTICE, PROFESSIONAL_NOTICE, sources } from "@/lib/sources";
import { fmt } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { localizeBuilt, type Translate } from "@/lib/page-format";
import type { GoalId, NormalizedAssessment, Source } from "@/lib/types";

const SLEEP_WHY = msg(
  "You reported about {hours} hours of sleep, with quality “{quality}.” NHLBI says experts recommend that adults sleep between 7 and 9 hours a night, and that adults who sleep less than 7 hours may have more health issues than those who sleep 7 or more.",
);
const WALK_WHY = msg(
  "You reported about {weekly} minutes of activity in a typical week, and about {sitting} hours of sitting or reclining. WHO describes a recommendation of at least 150 minutes of moderate-intensity activity a week, and says any amount is better than none.",
);
const SLEEP_GOAL_WHY = msg(
  "You chose sleep as a focus. You reported about {hours} hours, which sits in the 7 to 9 hour range NHLBI says experts recommend for adults. Keeping a steady routine is a reasonable next step.",
);

/** English templates the suggestions route fills in, matched on the page to show them translated. */
export const RECOMMENDATION_TEMPLATES: readonly string[] = [SLEEP_WHY, WALK_WHY, SLEEP_GOAL_WHY];

/** The same suggestions with every sentence in the chosen language. */
export function localizeRecommendations(result: RecommendationResult, t: Translate): RecommendationResult {
  const local = (text: string) => localizeBuilt(t, text, RECOMMENDATION_TEMPLATES);
  return {
    ...result,
    notice: t(result.notice),
    crisisNotice: t(result.crisisNotice),
    items: result.items.map((item) => ({
      ...item,
      title: t(item.title),
      why: local(item.why),
      actions: item.actions.map(local),
    })),
  };
}

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
        msg("Sleep"),
        fmt(SLEEP_WHY, { hours: assessment.sleepHours, quality: sleepQualityLabels[assessment.sleepQuality] }),
        [
          msg("Try a wake time you can keep on most days."),
          msg("If sleep stays poor, talk with a clinician. This is not an explanation of the cause."),
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
        msg("Movement"),
        fmt(WALK_WHY, { weekly, sitting: assessment.sedentaryHours }),
        [
          msg("Add a short walk on days that already have a little room."),
          msg("Ask a clinician before you increase effort if activity causes pain or you have a condition that makes exertion uncertain."),
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
        msg("Everyday food and drinks"),
        msg("You answered about vegetables, fruit, and water. The Dietary Guidelines for Americans describe vegetables and fruits as essential, and Nutrition.gov explains that water helps the body function. A gradual shift is enough to start."),
        [
          msg("Add one vegetable or fruit to a meal you already eat."),
          msg("Keep water somewhere you will actually see it."),
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
        msg("Tobacco"),
        msg("You reported smoking on some days or daily. WHO says there is no safe level of exposure to tobacco. lifeZoi cannot say how quitting would change your health, and it does not recommend medication."),
        [
          msg("Look at the free quit plan on Smokefree.gov if you want support."),
          msg("Talk with a clinician about options. Do not change a prescribed medicine based on this page."),
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
        msg("Tobacco"),
        msg("You reported that you used to smoke. WHO describes all tobacco use as harmful. Staying away from it is a meaningful step. This is not a prediction about your health."),
        [msg("If cravings return, Smokefree.gov offers free support.")],
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
        msg("Alcohol"),
        msg("You noted drinking most weeks. NIAAA describes effects of alcohol on the body, including a higher chance of some diseases and injuries. This is not a diagnosis of an alcohol problem."),
        [
          msg("If you want to drink less often, pick a plain definition for the next week."),
          msg("Talk with a clinician if drinking is hard to change."),
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
        msg("Stress and mood"),
        msg("You described stress or mood in a way that sounds heavy at times. NIMH says coping practices can help, and that ongoing stress or anxiety that interferes with life is a reason to talk with a professional. This is not a diagnosis."),
        [
          msg("Try one practice NIMH lists: a journal, a relaxation exercise, a walk, regular meals, or a steadier sleep routine."),
          msg("If this will not ease, talk with a professional. If you are in immediate distress in the United States, call or text 988."),
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
        msg("People around you"),
        msg("You described limited social connection. WHO describes high-quality social connections as important for mental and physical health, and describes isolation and loneliness as having a serious impact. This is not a judgment of your relationships."),
        [
          msg("Choose one person or group and one small, repeatable contact."),
          msg("Skip any plan that does not feel safe."),
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
        msg("Keep what is already working"),
        msg("Nothing you entered is asking for a specific change in this educational check. Public guidance still describes regular movement, sufficient sleep, and everyday whole foods as useful for health. This does not mean lifeZoi has judged you healthy or ruled anything out."),
        [
          msg("Keep a routine that already feels sustainable."),
          msg("Use WHAT IF? if you want to look at one change anyway."),
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
      msg("Sleep, because you chose it"),
      fmt(SLEEP_GOAL_WHY, { hours: assessment.sleepHours }),
      [msg("Keep a wake time you can repeat.")],
      [sources.nhlbiSleep],
      "goal",
    );
  }
  if (goal === "walk") {
    return card(
      "walk-goal",
      msg("Movement, because you chose it"),
      msg("You chose movement as a focus. Your reported week already meets the WHO figure of at least 150 minutes. Keeping a pattern you can repeat matters more than adding intensity for its own sake."),
      [msg("Keep the days that already work, and adjust if the week changes.")],
      [sources.whoActivity],
      "goal",
    );
  }
  if (goal === "eating") {
    return card(
      "eating-goal",
      msg("Eating patterns, because you chose them"),
      msg("You chose food as a focus. Your answers already include vegetables or fruit on most days and water on most days. The Dietary Guidelines still describe variety in whole foods as useful."),
      [msg("Keep one meal that already includes vegetables or fruit.")],
      [sources.dietaryGuidelines, sources.realFood],
      "goal",
    );
  }
  if (goal === "smoking") {
    return card(
      "smoking-goal",
      msg("Tobacco, because you chose it"),
      msg("You chose tobacco as a focus, and you did not report current smoking. There may be nothing to change for yourself. WHO still describes tobacco as harmful."),
      [msg("If you are supporting someone else, Smokefree.gov lists free quit support.")],
      [sources.whoTobacco, sources.smokefree],
      "goal",
    );
  }
  if (goal === "alcohol") {
    return card(
      "alcohol-goal",
      msg("Alcohol, because you chose it"),
      msg("You chose alcohol as a focus. Your answer was not “most weeks.” NIAAA still describes health effects of alcohol. This is not a diagnosis."),
      [msg("If you want a change, define it in plain language for one week.")],
      [sources.niaaa],
      "goal",
    );
  }
  if (goal === "stress") {
    return card(
      "stress-goal",
      msg("Stress, because you chose it"),
      msg("You chose stress as a focus, and you described it as mostly manageable. NIMH still lists practices people try, such as a journal, movement, and a sleep routine."),
      [msg("Keep one practice that already helps.")],
      [sources.nimhStress],
      "goal",
    );
  }
  return card(
    "connection-goal",
    msg("Connection, because you chose it"),
    msg("You chose time with other people as a focus, and you described feeling connected. WHO describes social connection as important for health. Keeping a tie that already helps is a reasonable plan."),
    [msg("Keep one recurring contact that feels welcome.")],
    [sources.whoConnection],
    "goal",
  );
}
