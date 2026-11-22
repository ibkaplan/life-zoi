"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, useMindStore } from "@/components/mind/shared";
import { compareResults, INSTRUMENTS } from "@/lib/mind/assessments";
import { exerciseById } from "@/lib/mind/exercises";
import { planSummary } from "@/lib/mind/plan";
import { daysUntilRepeat, resultsFor } from "@/lib/mind/progress";
import { reflectionById } from "@/lib/mind/reflections";
import { deleteAllMindData, setMindConsent } from "@/lib/mind/store";

export function MindProgressView() {
  const store = useMindStore();
  const [confirm, setConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { progress } = store;
  const nothing = progress.results.length === 0 && progress.exercises.length === 0 && progress.reflections.length === 0 && !progress.plan;

  return (
    <div className="stack-lg">
      <section className="card stack" aria-labelledby="consent-title">
        <h2 id="consent-title">Saving is {store.consent ? "on" : "off"}</h2>
        {store.consent ? (
          <p>
            Questionnaire totals, completed exercises, and your 7-day plan are kept in <strong>this browser on this device</strong>, under your account&apos;s own key. They are not sent to LifeZoi&apos;s servers or database, and they are not shared with anyone. The app does not encrypt them, so anyone who can use this browser profile could see them.
          </p>
        ) : (
          <p>
            Nothing from LifeZoi Mind is kept after you close this tab. If you would like to look back on questionnaire totals and exercises, you can turn saving on. It is entirely optional.
          </p>
        )}
        <details>
          <summary>What is and is not saved</summary>
          <ul className="mind-list">
            <li>Saved when you choose: questionnaire totals and ranges with the date, whether the PHQ-9 safety question was answered, exercises you mark as done, reflections you note, and your plan.</li>
            <li>Never saved: your individual questionnaire answers, anything you write in exercises, and your conversation, which stays in this tab only.</li>
            <li>Never sold, and never used to train AI.</li>
          </ul>
        </details>
        <div className="actions">
          {store.consent ? (
            <button type="button" className="btn btn-secondary" onClick={() => setMindConsent(false)}>
              Turn saving off and delete the saved copy
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setMindConsent(true)}>
              I agree, turn saving on in this browser
            </button>
          )}
        </div>
      </section>

      {nothing ? (
        <section className="card stack">
          <h2>Nothing here yet</h2>
          <p>
            When you take a <Link href="/mind/understand">questionnaire</Link>, try an <Link href="/mind/exercises">exercise</Link>, or start a <Link href="/mind/plan">7-day plan</Link>, you can choose to keep a record here.
          </p>
        </section>
      ) : null}

      {INSTRUMENTS.map((instrument) => {
        const results = resultsFor(progress, instrument.id);
        if (results.length === 0) return null;
        const due = daysUntilRepeat(results[0].date, instrument.repeatAfterDays);
        return (
          <section key={instrument.id} className="card stack" aria-labelledby={`hist-${instrument.id}`}>
            <h2 id={`hist-${instrument.id}`}>{instrument.shortName} results</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="mind-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Total</th>
                    <th scope="col">Range</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td>{formatDate(result.date)}</td>
                      <td>
                        {result.total} of {instrument.maxScore}
                      </td>
                      <td>
                        {result.band}
                        {result.item9Positive ? " · safety question answered" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {results.length > 1 ? <p>{compareResults(instrument, results[1].total, results[0].total)}</p> : null}
            <p className="hint">
              {due > 0 ? `This questionnaire asks about two weeks, so it is most useful to repeat it in about ${due} day${due === 1 ? "" : "s"}.` : "You can repeat this questionnaire now if you would like."} A change in score is not a diagnosis, and small changes do not prove that things are better or worse.
            </p>
            <Link className="btn btn-secondary" href={`/mind/understand/${instrument.id}`}>
              Take the {instrument.shortName} again
            </Link>
          </section>
        );
      })}

      {progress.exercises.length ? (
        <section className="card stack">
          <h2>Exercises you completed</h2>
          <ul className="mind-list">
            {[...progress.exercises].reverse().slice(0, 30).map((entry) => (
              <li key={entry.id}>
                {formatDate(entry.date)}: <Link href={`/mind/exercises/${entry.exercise}`}>{exerciseById(entry.exercise)?.title ?? entry.exercise}</Link> ({entry.minutes} min)
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {progress.reflections.length ? (
        <section className="card stack">
          <h2>Reflections you noted</h2>
          <ul className="mind-list">
            {[...progress.reflections].reverse().map((entry) => (
              <li key={entry.id}>
                {formatDate(entry.date)}: {reflectionById(entry.reflection)?.title ?? entry.reflection}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {progress.plan ? (
        <section className="card stack">
          <h2>Your 7-day plan</h2>
          <p>
            {planSummary(progress.plan).done} of 7 days done, started {formatDate(progress.plan.startedAt)}. <Link href="/mind/plan">Open the plan</Link>
          </p>
        </section>
      ) : null}

      <section className="card stack" aria-labelledby="delete-title">
        <h2 id="delete-title">Delete my LifeZoi Mind data</h2>
        <p>This deletes saved results, exercises, reflections, your plan, and this tab&apos;s conversation from this browser. It cannot be undone.</p>
        {deleted ? (
          <p role="status" className="mind-note">
            Deleted.
          </p>
        ) : null}
        {confirm ? (
          <div className="actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                deleteAllMindData();
                setConfirm(false);
                setDeleted(true);
              }}
            >
              Yes, delete everything
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}>
            Delete everything
          </button>
        )}
      </section>
      <p className="hint">
        LifeZoi Mind is one source of support among many. Time with people you trust, and help from professionals when you need it, matter more than any app.
      </p>
    </div>
  );
}
