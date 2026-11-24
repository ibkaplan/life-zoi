"use client";

import "@/components/health-day/health-day.css";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { FeelingMatches } from "@/components/health-day/feeling-matches";
import { GuidedDayPicks } from "@/components/guided/guided-launch";
import { useT } from "@/components/locale-provider";
import { getCalorieServerSnapshot, getCalorieSnapshot, subscribeCalories } from "@/lib/calories/store";
import { useCompanion } from "@/lib/companion/store";
import { FEELING_CHOICES } from "@/lib/daily/daily";
import { localISODate } from "@/lib/dates";
import { gentleReminder, healthDaySummary, partOfDay } from "@/lib/health-day/health-day";

/**
 * My Health Day on the members' home: today's small habits, movement,
 * breathing, food, and the Fact of the Day in one place. It only reads what
 * the person already recorded in this browser. Nothing here is required.
 */
export function MyHealthDay() {
  const t = useT();
  const companion = useCompanion();
  const calories = useSyncExternalStore(subscribeCalories, getCalorieSnapshot, getCalorieServerSnapshot);
  if (!companion.ready) return null;

  const today = localISODate();
  const part = partOfDay(new Date().getHours());
  const summary = healthDaySummary(companion.state, calories, today);
  const reminder = gentleReminder(summary, part);
  const feeling = companion.state.daily.feelings[today] ?? null;
  const feelingLabel = FEELING_CHOICES.find((choice) => choice.id === feeling)?.label;

  return (
    <section className="hd" aria-labelledby="hd-title">
      <div className="hd-head">
        <p className="lzd-kicker">{t("Today at a glance")}</p>
        <h2 id="hd-title">{t("My Health Day")}</h2>
        <p className="hd-lede">{t("What you have noted today, in one place. Nothing here is required, and an empty day is fine.")}</p>
      </div>

      {reminder ? (
        <p className="hd-reminder" role="note">
          <span aria-hidden="true">🌱 </span>
          {t(reminder)}
        </p>
      ) : null}

      <div className="hd-grid">
        <Link className="hd-tile" href="/academy/move/breaks">
          <span className="hd-tile-icon" aria-hidden="true">✅</span>
          <span className="hd-tile-title">{t("Small habits")}</span>
          <span className="hd-tile-value">
            {summary.habits.done > 0
              ? t("{done} of {total} ticked today", { done: summary.habits.done, total: summary.habits.total })
              : t("Nothing ticked yet")}
          </span>
          <span className="hd-tile-sub">{t("Water, a walk, a few breaths")}</span>
        </Link>

        <Link className="hd-tile" href="/academy/move/library">
          <span className="hd-tile-icon" aria-hidden="true">🚶</span>
          <span className="hd-tile-title">{t("Movement")}</span>
          <span className="hd-tile-value">
            {summary.movement.minutes > 0
              ? t("Minutes noted: {minutes}", { minutes: summary.movement.minutes })
              : summary.movement.breaks > 0
                ? t("Movement breaks: {count}", { count: summary.movement.breaks })
                : t("Nothing noted yet")}
          </span>
          <span className="hd-tile-sub">
            {summary.movement.minutes > 0 && summary.movement.breaks > 0
              ? t("Movement breaks: {count}", { count: summary.movement.breaks })
              : t("Find a gentle movement")}
          </span>
        </Link>

        <Link className="hd-tile" href="/breathe">
          <span className="hd-tile-icon" aria-hidden="true">🌬️</span>
          <span className="hd-tile-title">{t("Breathing")}</span>
          <span className="hd-tile-value">
            {summary.breathing.sessions > 0
              ? t("Sessions today: {count}", { count: summary.breathing.sessions })
              : t("No session yet")}
          </span>
          <span className="hd-tile-sub">
            {summary.breathing.minutes > 0 ? t("About {minutes} min", { minutes: summary.breathing.minutes }) : t("Breathe for Life")}
          </span>
        </Link>

        <Link className="hd-tile" href="/academy/meals#calorie-counter">
          <span className="hd-tile-icon" aria-hidden="true">🥗</span>
          <span className="hd-tile-title">{t("Food today")}</span>
          <span className="hd-tile-value">
            {summary.food ? t("About {kcal} kcal noted", { kcal: summary.food.kcal }) : t("No meals noted")}
          </span>
          <span className="hd-tile-sub">
            {summary.food
              ? t("Foods in the calorie counter: {count}", { count: summary.food.items })
              : t("Recording food is optional")}
          </span>
        </Link>
      </div>

      <article className="lzd-card hd-guided" aria-labelledby="hd-guided-title">
        <p className="hd-match-kind">
          <span aria-hidden="true">🎧 </span>
          {t("Voice-guided")}
        </p>
        <h3 id="hd-guided-title">{t("Guided sessions for now")}</h3>
        <p className="hd-hint">
          {summary.guided.sessions > 0
            ? t("Guided sessions today: {count}, about {minutes} min", { count: summary.guided.sessions, minutes: Math.max(1, summary.guided.minutes) })
            : t("Tap Start and the LifeZoi voice guides you step by step.")}
        </p>
        <GuidedDayPicks only={part} headingLevel="h4" />
        <Link className="hd-match-go" href="/guided">
          {t("All guided sessions")}
        </Link>
      </article>

      <div className="hd-lower">
        <article className="lzd-card hd-feel" aria-labelledby="hd-feel-title">
          <h3 id="hd-feel-title">{t("Matched to how you feel")}</h3>
          {feeling ? (
            <>
              <p className="hd-hint">{t("You said: {feeling}", { feeling: t(feelingLabel ?? "") })}</p>
              <FeelingMatches feeling={feeling} part={part} />
            </>
          ) : (
            <p className="hd-hint">
              {t("Tap “How Do I Feel Today?” above, and a breathing practice, music, and a movement will be matched to it.")}
            </p>
          )}
        </article>

        <article className="lzd-card hd-fact" aria-labelledby="hd-fact-title">
          <p className="hd-match-kind" id="hd-fact-title">
            <span aria-hidden="true">💡 </span>
            {t("Fact of the Day")}
          </p>
          <h3 lang="en">{summary.fact.headline}</h3>
          <p lang="en">{summary.fact.fact}</p>
          <Link className="hd-match-go" href={`/encyclopedia/facts/${summary.fact.id}`}>
            {t("Read more")}
          </Link>
          <Link href="/encyclopedia/facts">{t("Did You Know?")}</Link>
        </article>
      </div>

      <p className="hd-note">{t("Built only from what you noted in LifeZoi. Nothing here is sent to an AI or any outside service.")}</p>
    </section>
  );
}
