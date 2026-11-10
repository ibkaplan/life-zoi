"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLockedKind } from "@/lib/brain-quiz/activities";
import type { Activity } from "@/lib/brain-quiz/activities";
import { dailyRound } from "@/lib/brain-quiz/daily";
import { localISODate } from "@/lib/dates";
import { completeDaily, encouragement, saveDailyPick, QUIZ_NOTICE, type BrainProgress, type DailyPick } from "@/lib/brain-quiz/progress";
import { QuizActivity } from "@/components/brain-quiz/quiz-activity";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { useLocale } from "@/components/locale-provider";
import { localizeActivity, noteText, titleText } from "@/lib/brain-quiz/localize";
import { msg } from "@/lib/i18n/translate";

export function DailyChallenge() {
  const { locale, t } = useLocale();
  const { progress, save, ready } = useBrainProgress();
  const today = localISODate();
  const [step, setStep] = useState(0);
  const round = dailyRound(today);
  const picks = today && progress.lastDaily?.date === today ? progress.lastDaily.picks : [];
  const finished = today ? progress.dailyDone.includes(today) : false;

  useEffect(() => {
    if (!today || !round || finished || picks.length < round.items.length) return;
    const result = completeDaily(progress, today, round.items.length);
    if (!result.already && result.gained > 0) save(result.progress);
  }, [finished, picks.length, progress, round, save, today]);

  if (!ready) return <p className="card" role="status">{t("Loading today’s challenge…")}</p>;

  const score = progress.dailyScores.find((item) => item.date === today);
  const correct = picks.filter((pick) => pick.correct).length;
  const showReview = finished || step >= round.items.length;
  const current = round.items[Math.min(step, round.items.length - 1)];

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">{t("Back to Brain & Habit Quiz")}</Link></p>
      <section className="stack">
        <p className="kicker">{t("Daily challenge")}</p>
        <h1>{t("Five parts for today")}</h1>
        <p>{t("One logic puzzle, one memory game, one picture rebus, one word or number item, and one habit question. About 5 to 10 minutes.")}</p>
        <p className="hint">{t(QUIZ_NOTICE)}</p>
      </section>
      <div className="card stack">
        <p className="progress-label"><span>{showReview ? t("Complete") : t("Part {current} of {total}", { current: step + 1, total: round.items.length })}</span><span>{t("{count} correct so far", { count: correct })}</span></p>
        <div className="progress-track" aria-hidden><span style={{ width: `${(Math.min(picks.length, round.items.length) / round.items.length) * 100}%` }} /></div>
      </div>
      {showReview ? (
        <section className="card stack">
          <h2>{t("Today’s review")}</h2>
          <p>{t(encouragement(score?.correct ?? correct, round.items.length))}</p>
          <p>{score ? t("Daily score {score}, including the 25-point finish bonus when it was new.", { score: score.score }) : t("Finish every part to add the 25-point bonus once.")}</p>
          <ol className="record-list">
            {round.items.map((item) => {
              const pick = picks.find((entry) => entry.id === item.id);
              return (
                <li key={item.id}>
                  <strong>{titleText(localizeActivity(item, locale).title, t)}</strong>
                  <p>{pick ? (pick.correct ? t("Correct") : t("Not this time")) : t("Not answered")}{pick ? ` · ${noteText(pick.note, t)}` : ""}</p>
                </li>
              );
            })}
          </ol>
          <div className="actions">
            <Link className="btn btn-primary" href="/brain-quiz">{t("Play more")}</Link>
            <Link className="btn btn-secondary" href="/brain-quiz/journey">{t("My Brain Journey")}</Link>
          </div>
        </section>
      ) : current ? (
        <article className="card stack">
          <QuizActivity key={current.id} activity={current} dailyDate={today} />
          {picks.some((pick) => pick.id === current.id) || alreadySettled(progress, current) ? (
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                if (!picks.some((pick) => pick.id === current.id)) {
                  save(saveDailyPick(progress, today, rememberedPick(progress, current)));
                }
                setStep((value) => value + 1);
              }}
            >
              {step + 1 === round.items.length ? t("See results") : t("Next")}
            </button>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}

function alreadySettled(progress: BrainProgress, activity: Activity): boolean {
  if (progress.awarded.includes(activity.id)) return true;
  return isLockedKind(activity) && progress.attempted.includes(activity.id);
}

function rememberedPick(progress: BrainProgress, activity: Activity): DailyPick {
  const correct = progress.awarded.includes(activity.id);
  return {
    id: activity.id,
    correct,
    note: correct ? msg("Already counted. This activity does not score again.") : msg("Already answered. No new points."),
    gained: 0,
    picked: [],
  };
}
