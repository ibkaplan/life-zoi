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

export function DailyChallenge() {
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

  if (!ready) return <p className="card" role="status">Loading today’s challenge…</p>;

  const score = progress.dailyScores.find((item) => item.date === today);
  const correct = picks.filter((pick) => pick.correct).length;
  const showReview = finished || step >= round.items.length;
  const current = round.items[Math.min(step, round.items.length - 1)];

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">Back to Brain & Habit Quiz</Link></p>
      <section className="stack">
        <p className="kicker">Daily challenge</p>
        <h1>Five parts for today</h1>
        <p>One logic puzzle, one memory game, one picture rebus, one word or number item, and one habit question. About 5 to 10 minutes.</p>
        <p className="hint">{QUIZ_NOTICE}</p>
      </section>
      <div className="card stack">
        <p className="progress-label"><span>{showReview ? "Complete" : `Part ${step + 1} of ${round.items.length}`}</span><span>{correct} correct so far</span></p>
        <div className="progress-track" aria-hidden><span style={{ width: `${(Math.min(picks.length, round.items.length) / round.items.length) * 100}%` }} /></div>
      </div>
      {showReview ? (
        <section className="card stack">
          <h2>Today’s review</h2>
          <p>{encouragement(score?.correct ?? correct, round.items.length)}</p>
          <p>{score ? `Daily score ${score.score}, including the 25-point finish bonus when it was new.` : "Finish every part to add the 25-point bonus once."}</p>
          <ol className="record-list">
            {round.items.map((item) => {
              const pick = picks.find((entry) => entry.id === item.id);
              return (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <p>{pick ? (pick.correct ? "Correct" : "Not this time") : "Not answered"}{pick ? ` · ${pick.note}` : ""}</p>
                </li>
              );
            })}
          </ol>
          <div className="actions">
            <Link className="btn btn-primary" href="/brain-quiz">Play more</Link>
            <Link className="btn btn-secondary" href="/brain-quiz/journey">My Brain Journey</Link>
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
              {step + 1 === round.items.length ? "See results" : "Next"}
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
    note: correct ? "Already counted. This activity does not score again." : "Already answered. No new points.",
    gained: 0,
    picked: [],
  };
}
