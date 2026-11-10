"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { usePageFormat } from "@/components/page-format";
import { PagePhoto } from "@/components/page-photo";
import type { Translate } from "@/lib/page-format";
import { msg } from "@/lib/i18n/translate";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { isEmptyEmotional } from "@/lib/emotional-wellness/storage";
import { CONTEXT_OPTIONS } from "@/lib/emotional-wellness/copy";
import { getEmotionalServerSnapshot, getEmotionalStoreSnapshot, subscribeEmotionalStore } from "@/lib/emotional-wellness/store";
import { isEmptyFoodPlan } from "@/lib/food-plan/types";
import { habitMeta } from "@/lib/habit-transformation/catalog";
import { isEmptyHabitJourney } from "@/lib/habit-transformation/model";
import {
  ageLabels,
  alcoholLabels,
  assessmentHasAnswers,
  goalLabels,
  hydrationLabels,
  moodLabels,
  sleepQualityLabels,
  smokingLabels,
  socialLabels,
  stressLabels,
  vegetableLabels,
} from "@/lib/labels";
import { LoadingState } from "@/components/sources";
import type { Assessment } from "@/lib/types";

function Row({ term, value }: { term: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt>{term}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function rows(answers: Assessment, t: Translate) {
  const hours = answers.sleepHours ? t("About {hours} hours", { hours: answers.sleepHours }) : "";
  const days = answers.activityDays ? t("{count} days a week", { count: answers.activityDays }) : "";
  return (
    <dl className="review-list">
      <Row term={t("Name")} value={answers.displayName} />
      <Row term={t("Age range")} value={answers.ageRange ? t(ageLabels[answers.ageRange]) : ""} />
      <Row
        term={t("Sleep")}
        value={
          answers.sleepHours
            ? answers.sleepQuality
              ? t("{hours}, {quality}", { hours, quality: t(sleepQualityLabels[answers.sleepQuality]) })
              : hours
            : ""
        }
      />
      <Row
        term={t("Activity")}
        value={
          answers.activityDays
            ? answers.activityMinutes
              ? t("{days}, about {minutes} minutes on those days", { days, minutes: answers.activityMinutes })
              : days
            : ""
        }
      />
      <Row
        term={t("Sitting or reclining")}
        value={answers.sedentaryHours ? t("About {hours} hours", { hours: answers.sedentaryHours }) : ""}
      />
      <Row term={t("Vegetables and fruit")} value={answers.vegetables ? t(vegetableLabels[answers.vegetables]) : ""} />
      <Row term={t("Water")} value={answers.hydration ? t(hydrationLabels[answers.hydration]) : ""} />
      <Row term={t("Tobacco")} value={answers.smoking ? t(smokingLabels[answers.smoking]) : ""} />
      <Row term={t("Alcohol")} value={answers.alcohol ? t(alcoholLabels[answers.alcohol]) : ""} />
      <Row term={t("Stress")} value={answers.stress ? t(stressLabels[answers.stress]) : ""} />
      <Row term={t("Mood")} value={answers.mood ? t(moodLabels[answers.mood]) : ""} />
      <Row term={t("Social connection")} value={answers.social ? t(socialLabels[answers.social]) : ""} />
      <Row term={t("Focus")} value={answers.goals.map((goal) => t(goalLabels[goal])).join(", ")} />
      <Row term={t("Note")} value={answers.habitNote} />
      <Row term={t("Hope for what health could support")} value={answers.purposeHope} />
    </dl>
  );
}

const FOOD_GOAL: Record<string, string> = {
  lose: msg("Lose weight"),
  maintain: msg("Maintain weight"),
  gain: msg("Gain weight"),
  balance: msg("Eat in a balanced way"),
  variety: msg("More variety"),
  seasonal: msg("Follow the season"),
  ayurveda: msg("Explore Ayurveda as inspiration"),
};

const FOOD_PATTERN: Record<string, string> = {
  omnivore: msg("Omnivore"),
  pescatarian: msg("Pescatarian"),
  vegetarian: msg("Vegetarian"),
  vegan: msg("Vegan"),
};

export function ProfileView() {
  const { ready, sample, session } = useSession();
  const { t, timestamp } = usePageFormat();
  const account = useAccount();
  const emotional = useSyncExternalStore(subscribeEmotionalStore, getEmotionalStoreSnapshot, getEmotionalServerSnapshot);
  if (!ready) return <LoadingState label={t("Loading your session…")} />;
  const food = sample || isEmptyFoodPlan(session.foodPlan) ? null : session.foodPlan;
  const habits = sample || isEmptyHabitJourney(session.habitJourney) ? [] : session.habitJourney.picks;
  const context = !sample && account.phase === "ready" && !isEmptyEmotional(emotional) ? emotional.context : "";
  const contextLabel = CONTEXT_OPTIONS.find((item) => item.id === context)?.label ?? "";
  const emotionalNotes = emotional.journal.length + emotional.joys.length + emotional.caregiverNotes.length;
  const showEmotional = account.phase === "ready" && !sample && ((context !== "" && context !== "general") || emotionalNotes > 0);
  const latest = session.history[0] ?? null;
  const draftStarted = assessmentHasAnswers(session.draft);

  return (
    <div className="stack-lg narrow">
      <PagePhoto id="profile" />
      <div>
        <p className="kicker">{t("My Profile")}</p>
        <h1>{t("Only what you provided")}</h1>
        <p className="lede">{t("lifeZoi does not add age, diagnoses, or habits you did not enter.")}</p>
      </div>
      {latest ? (
        <section className="card stack">
          <p className="hint">{t("Latest completed assessment, {date}", { date: timestamp(latest.completedAt) })}</p>
          {rows(latest.answers, t)}
          <Link className="btn btn-secondary" href="/assessment">{t("Update answers")}</Link>
        </section>
      ) : draftStarted ? (
        <section className="card stack">
          <p className="hint">{t("In progress. This is not a completed assessment yet.")}</p>
          {rows(session.draft, t)}
          <Link className="btn btn-primary" href="/assessment">{t("Continue assessment")}</Link>
        </section>
      ) : (
        <section className="card empty">
          <h2>{t("Your profile is empty")}</h2>
          <p>{t("It fills in from the lifestyle assessment. Nothing is assumed.")}</p>
          <Link className="btn btn-primary" href="/assessment">{t("Start assessment")}</Link>
        </section>
      )}
      {food || habits.length > 0 || showEmotional ? (
        <section className="card stack">
          <h2>{t("Other saved answers")}</h2>
          <p className="hint">{t("These are answers you already saved. Nothing here is a diagnosis.")}</p>
          {food?.profile.goal ? (
            <p>{t("Food goal you saved: {goal}", { goal: FOOD_GOAL[food.profile.goal] ? t(FOOD_GOAL[food.profile.goal]) : "" })}</p>
          ) : null}
          {food?.profile.pattern ? (
            <p>
              {t("Eating pattern you saved: {pattern}", {
                pattern: FOOD_PATTERN[food.profile.pattern] ? t(FOOD_PATTERN[food.profile.pattern]) : "",
              })}
            </p>
          ) : null}
          {food?.week ? (
            <p>
              <Link href="/food-plan/week">{t("A week of meals is saved.")}</Link>
            </p>
          ) : null}
          {habits.length > 0 ? (
            <p>
              {t("Habit journey you saved: {habits}", {
                habits: habits.map((pick) => t(habitMeta(pick.habitId).label)).join(", "),
              })}
            </p>
          ) : null}
          {context && context !== "general" ? (
            <p>
              {t("Emotional context you selected: {context}. This is not a diagnosis, and that page has not been clinically reviewed.", {
                context: t(contextLabel),
              })}
            </p>
          ) : null}
          {showEmotional && emotionalNotes > 0 ? (
            <p>
              <Link href="/emotional-wellness">{t("Private emotional notes")}</Link>{" "}
              {t("are saved in this browser. The words stay on that page.")}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
