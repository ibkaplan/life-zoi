"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { formatDate, useMindStore } from "@/components/mind/shared";
import { compareResults, INSTRUMENTS } from "@/lib/mind/assessments";
import { exerciseById } from "@/lib/mind/exercises";
import { planSummary } from "@/lib/mind/plan";
import { daysUntilRepeat, resultsFor } from "@/lib/mind/progress";
import { reflectionById } from "@/lib/mind/reflections";
import { deleteAllMindData, setMindConsent } from "@/lib/mind/store";

export function MindProgressView() {
  const t = useT();
  const { locale } = useLocale();
  const store = useMindStore();
  const [confirm, setConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const { progress } = store;
  const nothing = progress.results.length === 0 && progress.exercises.length === 0 && progress.reflections.length === 0 && !progress.plan;

  return (
    <div className="stack-lg">
      <section className="card stack" aria-labelledby="consent-title">
        <h2 id="consent-title">{store.consent ? t("Saving is on") : t("Saving is off")}</h2>
        {store.consent ? (
          <p>
            {t("Questionnaire totals, completed exercises, and your 7-day plan are kept in this browser on this device, under your account's own key. They are not sent to LifeZoi's servers or database, and they are not shared with anyone. The app does not encrypt them, so anyone who can use this browser profile could see them.")}
          </p>
        ) : (
          <p>
            {t("Nothing from LifeZoi Mind is kept after you close this tab. If you would like to look back on questionnaire totals and exercises, you can turn saving on. It is entirely optional.")}
          </p>
        )}
        <details>
          <summary>{t("What is and is not saved")}</summary>
          <ul className="mind-list">
            <li>{t("Saved when you choose: questionnaire totals and ranges with the date, whether the PHQ-9 safety question was answered, exercises you mark as done, reflections you note, and your plan.")}</li>
            <li>{t("Never saved: your individual questionnaire answers, anything you write in exercises, and your conversation, which stays in this tab only.")}</li>
            <li>{t("Never sold, and never used to train AI.")}</li>
          </ul>
        </details>
        <div className="actions">
          {store.consent ? (
            <button type="button" className="btn btn-secondary" onClick={() => setMindConsent(false)}>
              {t("Turn saving off and delete the saved copy")}
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setMindConsent(true)}>
              {t("I agree, turn saving on in this browser")}
            </button>
          )}
        </div>
      </section>

      {nothing ? (
        <section className="card stack">
          <h2>{t("Nothing here yet")}</h2>
          <p>
            {t("When you take a questionnaire, try an exercise, or start a 7-day plan, you can choose to keep a record here.")}{" "}
            <Link href="/mind/understand">{t("Understand yourself")}</Link> · <Link href="/mind/exercises">{t("Guided exercises")}</Link> · <Link href="/mind/plan">{t("7-day wellness plan")}</Link>
          </p>
        </section>
      ) : null}

      {INSTRUMENTS.map((instrument) => {
        const results = resultsFor(progress, instrument.id);
        if (results.length === 0) return null;
        const due = daysUntilRepeat(results[0].date, instrument.repeatAfterDays);
        return (
          <section key={instrument.id} className="card stack" aria-labelledby={`hist-${instrument.id}`}>
            <h2 id={`hist-${instrument.id}`}>{t("{name} results", { name: instrument.shortName })}</h2>
            <div style={{ overflowX: "auto" }}>
              <table className="mind-table">
                <thead>
                  <tr>
                    <th scope="col">{t("Date")}</th>
                    <th scope="col">{t("Total")}</th>
                    <th scope="col">{t("Range")}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td>{formatDate(result.date, locale)}</td>
                      <td>
                        {t("{total} of {max}", { total: result.total, max: instrument.maxScore })}
                      </td>
                      <td>
                        {t(result.band)}
                        {result.item9Positive ? ` · ${t("safety question answered")}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {results.length > 1 ? <p>{compareResults(instrument, results[1].total, results[0].total, t)}</p> : null}
            <p className="hint">
              {due > 0
                ? locale === "en"
                  ? `This questionnaire asks about two weeks, so it is most useful to repeat it in about ${due} day${due === 1 ? "" : "s"}.`
                  : t("This questionnaire asks about two weeks, so it is most useful to repeat it in about {days} days.", { days: due })
                : t("You can repeat this questionnaire now if you would like.")}{" "}
              {t("A change in score is not a diagnosis, and small changes do not prove that things are better or worse.")}
            </p>
            <Link className="btn btn-secondary" href={`/mind/understand/${instrument.id}`}>
              {t("Take the {name} again", { name: instrument.shortName })}
            </Link>
          </section>
        );
      })}

      {progress.exercises.length ? (
        <section className="card stack">
          <h2>{t("Exercises you completed")}</h2>
          <ul className="mind-list">
            {[...progress.exercises].reverse().slice(0, 30).map((entry) => (
              <li key={entry.id}>
                {formatDate(entry.date, locale)}: <Link href={`/mind/exercises/${entry.exercise}`}>{t(exerciseById(entry.exercise)?.title ?? entry.exercise)}</Link> ({t("{minutes} min", { minutes: entry.minutes })})
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {progress.reflections.length ? (
        <section className="card stack">
          <h2>{t("Reflections you noted")}</h2>
          <ul className="mind-list">
            {[...progress.reflections].reverse().map((entry) => (
              <li key={entry.id}>
                {formatDate(entry.date, locale)}: {t(reflectionById(entry.reflection)?.title ?? entry.reflection)}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {progress.plan ? (
        <section className="card stack">
          <h2>{t("Your 7-day plan")}</h2>
          <p>
            {t("{done} of 7 days done, started {date}.", { done: planSummary(progress.plan).done, date: formatDate(progress.plan.startedAt, locale) })} <Link href="/mind/plan">{t("Open the plan")}</Link>
          </p>
        </section>
      ) : null}

      <section className="card stack" aria-labelledby="delete-title">
        <h2 id="delete-title">{t("Delete my LifeZoi Mind data")}</h2>
        <p>{t("This deletes saved results, exercises, reflections, your plan, and this tab's conversation from this browser. It cannot be undone.")}</p>
        {deleted ? (
          <p role="status" className="mind-note">
            {t("Deleted.")}
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
              {t("Yes, delete everything")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)}>
              {t("Cancel")}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}>
            {t("Delete everything")}
          </button>
        )}
      </section>
      <p className="hint">
        {t("LifeZoi Mind is one source of support among many. Time with people you trust, and help from professionals when you need it, matter more than any app.")}
      </p>
    </div>
  );
}
