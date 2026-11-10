"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { usePageFormat } from "@/components/page-format";
import { useSession } from "@/components/session-provider";
import { msg } from "@/lib/i18n/translate";
import { sayJoined } from "@/lib/my-day/say";
import { LoadingState } from "@/components/sources";
import { useAccount } from "@/lib/account-store";
import { isEmptyBrain } from "@/lib/brain-quiz/progress";
import { isEmptyEmotional } from "@/lib/emotional-wellness/storage";
import { getEmotionalServerSnapshot, getEmotionalStoreSnapshot, subscribeEmotionalStore } from "@/lib/emotional-wellness/store";
import { isEmptyFoodPlan } from "@/lib/food-plan/types";
import { getMyDayServerSnapshot, getMyDaySnapshot, subscribeMyDay } from "@/lib/my-day/client";
import { emptyHabitJourney } from "@/lib/habit-transformation/model";
import {
  ayurvedaNote,
  calorieEstimate,
  dayProgress,
  encouragement,
  presentDay,
  proteinEstimate,
  weightChart,
  type ItemId,
} from "@/lib/my-day/plan";
import {
  cycleItem,
  emptyMyDay,
  ensureToday,
  isClockTime,
  setAyurvedaHidden,
  setItemNote,
  setItemStatus,
  setItemTime,
  toggleShorter,
} from "@/lib/my-day/storage";

const OVERVIEW = [
  [msg("Workout"), "/academy/move"],
  [msg("Nutrition"), "/academy/meals"],
  [msg("Brain challenge"), "/brain-quiz"],
  [msg("Habit"), "/habit-transformation"],
  [msg("Sleep and recovery"), "/choices/sleep"],
  [msg("Emotional Wellness"), "/emotional-wellness"],
  [msg("Progress"), "/progress"],
  [msg("Wellness Assistant"), "/ai-assistant"],
] as const;

export function MyDayView() {
  const session = useSession();
  const { t, longDate, locale } = usePageFormat();
  const account = useAccount();
  const say = (text: string) => sayJoined(t, text, locale === "en");
  const snap = useSyncExternalStore(subscribeMyDay, getMyDaySnapshot, getMyDayServerSnapshot);
  const emotional = useSyncExternalStore(subscribeEmotionalStore, getEmotionalStoreSnapshot, getEmotionalServerSnapshot);
  const signedIn = account.phase === "ready";
  if (!session.ready || !snap.ready || !snap.today) return <LoadingState label={t("Loading your day…")} />;

  const answers = session.sample ? null : (session.session.history[0]?.answers ?? null);
  const journey = session.sample ? emptyHabitJourney() : session.session.habitJourney;
  const weights = session.sample ? [] : session.session.weightEntries;
  const source = session.sample ? emptyMyDay() : session.session.myDay;
  const file = ensureToday(source, snap.today);
  const day = file.days[snap.today];
  if (!day) return <LoadingState label={t("Loading your day…")} />;

  const items = presentDay(day, file.savedTimes, answers, journey, {
    date: snap.today,
    foodPlan: session.sample || isEmptyFoodPlan(session.session.foodPlan) ? null : session.session.foodPlan,
    brain: session.sample || isEmptyBrain(session.session.brainQuiz) ? null : session.session.brainQuiz,
    emotionalNotes: !session.sample && signedIn && !isEmptyEmotional(emotional),
  });
  const progress = dayProgress(items);
  const calories = calorieEstimate(answers);
  const protein = proteinEstimate(answers);
  const chart = weightChart(weights);
  const today = snap.today;
  // English shows the saved date as it was stored. Other languages show it written out.
  const day0 = (isoDate: string) => (locale === "en" ? isoDate : longDate(isoDate));

  function update(next: typeof file) {
    if (session.sample) return;
    session.saveMyDay(next);
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">{t("My Day at LifeZoi")}</p>
        <h1>{t("TAKE CARE OF YOUR HEALTH EASILY")}</h1>
        <p className="lede">{t("Take Care of Your Health Easily.")}</p>
        <p>
          {t("One day, in the order you can walk through it. Times you have saved stay yours. Other times are labeled suggested, and you can change them.")}
          {" "}
          {t("Nothing here is sent to an outside service.")}
        </p>
      </section>

      <section className="card stack" aria-labelledby="day-progress-title">
        <p className="kicker">{t("Wellness overview")}</p>
        <h2 id="day-progress-title">{t("Today")}</h2>
        <div className="progress-label">
          <span>{progress.percent}%</span>
          <span>
            {t("{done} done, {open} still open", { done: progress.completed, open: progress.remaining })}
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-label={t("Activities marked done today")}
        >
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <p>{t(encouragement(progress))}</p>
        <p className="hint">{t("Skipped items stay off the count. An unfinished day is not a failure.")}</p>
        <div className="actions">
          {OVERVIEW.map(([label, href]) => (
            <Link key={href} className="btn btn-secondary" href={href}>
              {t(label)}
            </Link>
          ))}
        </div>
        {answers ? (
          <p className="hint">{t("Suggestions use the completed assessment already saved. This page does not ask those questions again.")}</p>
        ) : (
          <p className="hint">{t("No completed assessment is saved, so the day stays general. Sample answers are not used.")}</p>
        )}
      </section>

      <ol className="stack-lg">
        {items.map((item) => (
          <li key={item.id} className="card stack" id={`day-${item.id}`}>
            <p className="kicker">{t(item.section)}</p>
            <h2>{say(item.title)}</h2>
            <p>
              <span className="hint">{t(item.timeLabel)}. </span>
              <strong>{item.time}</strong>
              {item.status === "done" ? ` · ${t("Done")}` : item.status === "skipped" ? ` · ${t("Skipped")}` : ""}
            </p>
            <p>{say(item.detail)}</p>
            {item.steps.length > 0 ? (
              <ol>
                {item.steps.map((step) => (
                  <li key={step}>{say(step)}</li>
                ))}
              </ol>
            ) : null}
            {item.why ? <p className="hint">{say(item.why)}</p> : null}
            {item.href ? (
              <Link className="btn btn-secondary" href={item.href}>
                {say(item.hrefLabel)}
              </Link>
            ) : null}
            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={() => update(setItemStatus(file, today, item.id, item.status === "done" ? "open" : "done"))}>
                {item.status === "done" ? t("Mark open") : t("Mark done")}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => update(setItemStatus(file, today, item.id, item.status === "skipped" ? "open" : "skipped"))}>
                {item.status === "skipped" ? t("Put back") : t("Skip")}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => update(cycleItem(file, today, item.id))}>
                {t("Replace")}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => update(toggleShorter(file, today, item.id))}>
                {item.shorter ? t("Full version") : t("Shorter alternative")}
              </button>
            </div>
            <TimeField key={`${item.id}-${item.time}`} id={item.id} value={item.time} onCommit={(time) => update(setItemTime(file, today, item.id, time))} />
            <label className="field" htmlFor={`note-${item.id}`}>
              <span>{t("Note")}</span>
              <input
                id={`note-${item.id}`}
                type="text"
                maxLength={280}
                value={item.note}
                onChange={(event) => update(setItemNote(file, today, item.id, event.target.value))}
              />
            </label>
          </li>
        ))}
      </ol>

      <section className="card stack" aria-labelledby="estimates-title">
        <h2 id="estimates-title">{t("Estimates from saved answers")}</h2>
        <p>{t(calories.reason)}</p>
        {calories.kind === "resting" ? <p>{t("Resting estimate: about {kcal} kcal.", { kcal: calories.kcal })}</p> : null}
        {calories.kind === "maintenance" ? (
          <p>
            {t("Resting estimate: about {resting} kcal. Maintenance estimate: about {kcal} kcal.", {
              resting: calories.resting,
              kcal: calories.kcal,
            })}
          </p>
        ) : null}
        <p>{t(protein.reason)}</p>
        {protein.kind === "estimate" ? <p>{t("Protein estimate: about {grams} grams.", { grams: protein.grams })}</p> : null}
      </section>

      <section className="card stack" aria-labelledby="weight-title">
        <h2 id="weight-title">{t("Saved weight")}</h2>
        {chart.kind === "empty" ? <p>{t("No saved weight entries, so there is no chart.")}</p> : null}
        {chart.kind === "single" ? (
          <p>
            {t("One saved entry on {date}: {value} {unit}. One entry is not drawn as a chart.", {
              date: day0(chart.entry.date),
              value: chart.entry.value,
              unit: t(chart.entry.unit),
            })}
          </p>
        ) : null}
        {chart.kind === "list" ? (
          <>
            <p>{t("These entries use more than one unit, so they are listed as saved and not drawn on one chart.")}</p>
            <ul>
              {chart.entries.map((entry) => (
                <li key={entry.id}>
                  {day0(entry.date)}: {entry.value} {t(entry.unit)}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {chart.kind === "bars" ? (
          <>
            <p className="hint">{t("Bar length compares these saved entries only.")}</p>
            <ul className="stack">
              {chart.entries.map((entry) => (
                <li key={entry.id}>
                  <div className="progress-label">
                    <span>{day0(entry.date)}</span>
                    <span>
                      {entry.value} {t(entry.unit)}
                    </span>
                  </div>
                  <div className="progress-track" aria-hidden="true">
                    <span style={{ width: `${Math.round((entry.value / chart.max) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {file.ayurvedaHidden ? (
        <p>
          <button className="btn btn-ghost" type="button" onClick={() => update(setAyurvedaHidden(file, false))}>
            {t("Show the optional traditional note")}
          </button>
        </p>
      ) : (
        <section className="card stack" aria-labelledby="tradition-title">
          <h2 id="tradition-title">{t("Optional traditional note")}</h2>
          <p>{t(ayurvedaNote())}</p>
          <button className="btn btn-ghost" type="button" onClick={() => update(setAyurvedaHidden(file, true))}>
            {t("Skip this note")}
          </button>
        </section>
      )}
    </div>
  );
}

function TimeField({ id, value, onCommit }: { id: ItemId; value: string; onCommit: (time: string) => void }) {
  const { t } = usePageFormat();
  const [draft, setDraft] = useState(value);
  return (
    <label className="field" htmlFor={`time-${id}`}>
      <span>{t("Time")}</span>
      <input
        id={`time-${id}`}
        type="text"
        inputMode="numeric"
        maxLength={5}
        placeholder="07:30"
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (isClockTime(next)) onCommit(next);
        }}
        onBlur={() => {
          if (isClockTime(draft)) onCommit(draft);
          else {
            setDraft(value);
            if (draft === "") onCommit("");
          }
        }}
      />
    </label>
  );
}
