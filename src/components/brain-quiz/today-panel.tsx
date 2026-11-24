"use client";

import Link from "next/link";
import type { Activity } from "@/lib/brain-quiz/activities";
import { categoryMeta } from "@/lib/brain-quiz/catalog";
import { dailyRoundFor, dayNumber, freshFor } from "@/lib/brain-quiz/daily";
import { promptText, localizeActivity, titleText } from "@/lib/brain-quiz/localize";
import { liveStreak, weeklyHistory, welcomeFor, type Difficulty } from "@/lib/brain-quiz/progress";
import { factOfTheDay } from "@/lib/encyclopedia/facts";
import { questionFor } from "@/lib/encyclopedia/fact-quiz";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { usePageFormat } from "@/components/page-format";

/**
 * The top of the quiz page: a friendly welcome, where today's challenge stands, and a few
 * things that are new today. Everything here changes with the person's local date.
 */
export function TodayPanel({ today, level }: { today: string; level: Difficulty }) {
  const { locale, t, longDate } = usePageFormat();
  const { progress } = useBrainProgress();
  const welcome = welcomeFor(progress, today, dayNumber(today));
  const picks = progress.lastDaily?.date === today ? progress.lastDaily.picks.length : 0;
  const done = progress.dailyDone.includes(today);
  const round = dailyRoundFor(progress, today);
  const todayMark = progress.days.find((day) => day.date === today);
  const week = weeklyHistory(progress, today, 1)[0];
  const fact = factOfTheDay(today);
  const factQuiz = questionFor(fact.id);
  const logic = freshFor(progress, "logic", level, today, 1)[0];
  const memory = freshFor(progress, "memory", level, today, 1)[0];
  const attention = freshFor(progress, "attention", level, today, 1)[0];
  const action = done ? t("See today’s results") : picks > 0 ? t("Continue today’s challenge") : t("START DAILY CHALLENGE");

  return (
    <>
      <section className="card stack quiz-welcome" aria-live="polite">
        <p className="kicker">{longDate(today)}</p>
        <h2>{t(welcome.title, welcome.values)}</h2>
        <p>{t(welcome.detail, welcome.values)}</p>
        <ul className="quiz-todayFacts">
          <li>
            <strong>{done ? t("Done") : t("{count} of 5", { count: picks })}</strong>
            <span>{t("Daily challenge")}</span>
          </li>
          <li>
            <strong>{todayMark?.points ?? 0}</strong>
            <span>{t("Points today")}</span>
          </li>
          <li>
            <strong>{liveStreak(progress, today)}</strong>
            <span>{t("Days in a row")}</span>
          </li>
          <li>
            <strong>{t("{count} of 7", { count: week?.activeDays ?? 0 })}</strong>
            <span>{t("Days played this week")}</span>
          </li>
        </ul>
        <p className="hint">{t("Today’s mix: {mix}.", { mix: round.items.map((item) => t(categoryMeta(item.category).title)).join(" · ") })}</p>
        <div className="actions">
          <Link className="btn btn-primary" href="/brain-quiz/daily">{action}</Link>
        </div>
      </section>
      <section className="stack">
        <h2>{t("New today")}</h2>
        <p className="hint">{t("These change every day and skip what you have played recently.")}</p>
        <div className="quiz-cats">
          {logic ? <Discovery kicker={t("A new logic puzzle")} activity={logic} level={level} locale={locale} t={t} /> : null}
          {memory ? <Discovery kicker={t("A new memory exercise")} activity={memory} level={level} locale={locale} t={t} /> : null}
          {attention ? <Discovery kicker={t("A new focus and attention game")} activity={attention} level={level} locale={locale} t={t} /> : null}
          <article className="card quiz-cat">
            <p className="kicker">{t("Today’s health fact")}</p>
            <h3 lang="en">{fact.headline}</h3>
            <p className="hint">{t("From the Did You Know? facts, with the source on the fact page.")}</p>
            <div className="actions">
              <Link className="btn btn-secondary" href={`/encyclopedia/facts/${fact.id}`}>{t("Read the full fact")}</Link>
              {factQuiz ? <Link className="btn btn-ghost" href={`/brain-quiz/health-facts?fact=${fact.id}`}>{t("Health Facts Quiz")}</Link> : null}
            </div>
          </article>
          <Link className="card quiz-cat" href="/focus">
            <p className="kicker">{t("A calm focus session")}</p>
            <h3>{t("Focus & Brain Training")}</h3>
            <p>{t("A short timed focus block with a break. Go at your own pace.")}</p>
          </Link>
          <Link className="card quiz-cat" href="/brain-quiz/games">
            <p className="kicker">{t("Brain games")}</p>
            <h3>{t("Sudoku, memory, and logic games")}</h3>
            <p>{t("A new Sudoku and puzzle board each day, and another each time you play again.")}</p>
          </Link>
        </div>
      </section>
    </>
  );
}

function Discovery({
  kicker,
  activity: source,
  level,
  locale,
  t,
}: {
  kicker: string;
  activity: Activity;
  level: Difficulty;
  locale: Parameters<typeof localizeActivity>[1];
  t: ReturnType<typeof usePageFormat>["t"];
}) {
  const activity = localizeActivity(source, locale);
  return (
    <Link className="card quiz-cat" href={`/brain-quiz/${activity.category}/${activity.id}?level=${level}`}>
      <p className="kicker">{kicker}</p>
      <h3>{titleText(activity.title, t)}</h3>
      <p>{promptText(activity, t)}</p>
      <p className="hint">{t(activity.difficulty)}</p>
    </Link>
  );
}
