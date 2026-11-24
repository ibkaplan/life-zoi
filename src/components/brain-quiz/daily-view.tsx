"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLockedKind } from "@/lib/brain-quiz/activities";
import type { Activity } from "@/lib/brain-quiz/activities";
import { CATEGORIES } from "@/lib/brain-quiz/catalog";
import { dailyRoundFor, ensureDailyRound } from "@/lib/brain-quiz/daily";
import { completeDaily, encouragement, POINT_VALUES, saveDailyPick, QUIZ_NOTICE, type BrainProgress, type CategoryId, type DailyPick } from "@/lib/brain-quiz/progress";
import { useLocalToday } from "@/components/brain-quiz/use-local-today";
import { QuizActivity } from "@/components/brain-quiz/quiz-activity";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { useLocale } from "@/components/locale-provider";
import { usePageFormat } from "@/components/page-format";
import { localizeActivity, noteText, titleText } from "@/lib/brain-quiz/localize";
import { msg } from "@/lib/i18n/translate";

export function DailyChallenge() {
  const today = useLocalToday();
  const { t } = useLocale();
  const { ready } = useBrainProgress();
  if (!today || !ready) return <p className="card" role="status">{t("Loading today’s challenge…")}</p>;
  // A new key at local midnight starts the new day's set from part one.
  return <DailyRoundView key={today} today={today} />;
}

const CATEGORY_NAMES: Record<CategoryId, string> = Object.fromEntries(CATEGORIES.map((item) => [item.id, item.title])) as Record<CategoryId, string>;

function DailyRoundView({ today }: { today: string }) {
  const { locale, t, longDate } = usePageFormat();
  const { progress, save, ready, sample } = useBrainProgress();
  const round = dailyRoundFor(progress, today);
  const picks = progress.lastDaily?.date === today ? progress.lastDaily.picks : [];
  // After a refresh, carry on from the first part that has no answer yet.
  const [step, setStep] = useState(() => {
    const open = round.items.findIndex((item) => !picks.some((pick) => pick.id === item.id));
    return open === -1 ? round.items.length : open;
  });
  const finished = progress.dailyDone.includes(today);

  // Save today's five the first time they are shown, so a refresh or another device keeps them.
  useEffect(() => {
    if (!ready || sample || progress.round?.date === today) return;
    const next = ensureDailyRound(progress, today);
    if (next !== progress) save(next);
  }, [progress, ready, sample, save, today]);

  useEffect(() => {
    if (!ready || finished || round.items.length === 0 || picks.length < round.items.length) return;
    const result = completeDaily(progress, today, round.items.length);
    if (!result.already && result.gained > 0) save(result.progress);
  }, [finished, picks.length, progress, ready, round.items.length, save, today]);

  if (!ready) return <p className="card" role="status">{t("Loading today’s challenge…")}</p>;

  const score = progress.dailyScores.find((item) => item.date === today);
  const correct = picks.filter((pick) => pick.correct).length;
  const position = step;
  // The review opens after the last part is read and "See results" is pressed, or straight away on a return visit.
  const showReview = position >= round.items.length;
  const current = round.items[Math.min(position, round.items.length - 1)];
  const mix = round.items.map((item) => t(CATEGORY_NAMES[item.category])).join(" · ");
  const earned = picks.reduce((sum, pick) => sum + pick.gained, 0) + (finished ? POINT_VALUES.dailyBonus : 0);

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">{t("Back to Brain & Habit Quiz")}</Link></p>
      <section className="stack">
        <p className="kicker">{t("Daily challenge")} · {longDate(today)}</p>
        <h1>{t("Five parts for today")}</h1>
        <p>{t("Today’s mix: {mix}. Picked from questions you have not seen lately, with easy, medium, and hard parts. About 5 to 10 minutes.", { mix })}</p>
        <p className="hint">{t("A new set unlocks at midnight in your own time zone. Your answers save as you go, so you can stop and come back.")}</p>
        <p className="hint">{t(QUIZ_NOTICE)}</p>
      </section>
      <div className="card stack">
        <p className="progress-label"><span>{showReview ? t("Complete") : t("Part {current} of {total}", { current: position + 1, total: round.items.length })}</span><span>{t("{count} correct so far", { count: correct })}</span></p>
        <div className="progress-track" aria-hidden><span style={{ width: `${(Math.min(picks.length, round.items.length) / Math.max(1, round.items.length)) * 100}%` }} /></div>
      </div>
      {showReview ? (
        <section className="card stack">
          {finished ? (
            <div className="quiz-done" role="status">
              <h2>{t("Challenge complete!")}</h2>
              <p>{t("You earned {points} points today, including the 25-point finish bonus.", { points: score?.score ?? earned })}</p>
              <p>{t("Come back tomorrow for five new questions.")}</p>
            </div>
          ) : (
            <h2>{t("Today’s review")}</h2>
          )}
          <p>{t(encouragement(score?.correct ?? correct, round.items.length))}</p>
          {finished ? null : <p>{t("Finish every part to add the 25-point bonus once.")}</p>}
          <ol className="record-list">
            {round.items.map((item) => {
              const pick = picks.find((entry) => entry.id === item.id);
              return (
                <li key={item.id}>
                  <strong>{titleText(localizeActivity(item, locale).title, t)}</strong>
                  <p>{pick ? (pick.correct ? t("Correct") : t("Not this time")) : t("Not answered")}{pick ? ` · ${noteText(pick.note, t)}` : ""}{pick && pick.gained > 0 ? ` · ${t("{points} points added.", { points: pick.gained })}` : ""}</p>
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
                setStep(position + 1);
              }}
            >
              {position + 1 === round.items.length ? t("See results") : t("Next")}
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
