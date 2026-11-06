"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import {
  commitMyDay,
  getMyDayServerSnapshot,
  getMyDaySnapshot,
  subscribeMyDay,
} from "@/lib/my-day/client";
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
  isClockTime,
  setAyurvedaHidden,
  setItemNote,
  setItemStatus,
  setItemTime,
  toggleShorter,
} from "@/lib/my-day/storage";

const OVERVIEW = [
  ["Workout", "/academy/move"],
  ["Nutrition", "/academy/meals"],
  ["Brain challenge", "/brain-quiz"],
  ["Habit", "/habit-transformation"],
  ["Sleep and recovery", "/choices/sleep"],
  ["Progress", "/progress"],
  ["Wellness Assistant", "/ai-assistant"],
] as const;

export function MyDayView() {
  const session = useSession();
  const snap = useSyncExternalStore(subscribeMyDay, getMyDaySnapshot, getMyDayServerSnapshot);
  if (!session.ready || !snap.ready || !snap.today) return <LoadingState label="Loading your day…" />;

  const answers = session.sample ? null : (session.session.history[0]?.answers ?? null);
  const journey = session.sample ? emptyHabitJourney() : session.session.habitJourney;
  const weights = session.sample ? [] : session.session.weightEntries;
  const day = snap.file.days[snap.today];
  if (!day) return <LoadingState label="Loading your day…" />;

  const items = presentDay(day, snap.file.savedTimes, answers, journey);
  const progress = dayProgress(items);
  const calories = calorieEstimate(answers);
  const protein = proteinEstimate(answers);
  const chart = weightChart(weights);
  const today = snap.today;
  const file = snap.file;

  function update(next: typeof file) {
    commitMyDay(next);
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <p className="kicker">My Day at LifeZoi</p>
        <h1>TAKE CARE OF YOUR HEALTH EASILY</h1>
        <p className="lede">Take Care of Your Health Easily.</p>
        <p>
          One day, in the order you can walk through it. Times you have saved stay yours. Other times are labeled suggested, and you can change them.
          Nothing here is sent to an outside service.
        </p>
      </section>

      <section className="card stack" aria-labelledby="day-progress-title">
        <p className="kicker">Wellness overview</p>
        <h2 id="day-progress-title">Today</h2>
        <div className="progress-label">
          <span>{progress.percent}%</span>
          <span>
            {progress.completed} done, {progress.remaining} still open
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
          aria-label="Activities marked done today"
        >
          <span style={{ width: `${progress.percent}%` }} />
        </div>
        <p>{encouragement(progress)}</p>
        <p className="hint">Skipped items stay off the count. An unfinished day is not a failure.</p>
        <div className="actions">
          {OVERVIEW.map(([label, href]) => (
            <Link key={href} className="btn btn-secondary" href={href}>
              {label}
            </Link>
          ))}
        </div>
        {answers ? (
          <p className="hint">Suggestions use the completed assessment already saved. This page does not ask those questions again.</p>
        ) : (
          <p className="hint">No completed assessment is saved, so the day stays general. Sample answers are not used.</p>
        )}
      </section>

      <ol className="stack-lg">
        {items.map((item) => (
          <li key={item.id} className="card stack" id={`day-${item.id}`}>
            <p className="kicker">{item.section}</p>
            <h2>{item.title}</h2>
            <p>
              <span className="hint">{item.timeLabel}. </span>
              <strong>{item.time}</strong>
              {item.status === "done" ? " · Done" : item.status === "skipped" ? " · Skipped" : ""}
            </p>
            <p>{item.detail}</p>
            {item.steps.length > 0 ? (
              <ol>
                {item.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            ) : null}
            {item.why ? <p className="hint">{item.why}</p> : null}
            {item.href ? (
              <Link className="btn btn-secondary" href={item.href}>
                {item.hrefLabel}
              </Link>
            ) : null}
            <div className="actions">
              <button className="btn btn-primary" type="button" onClick={() => update(setItemStatus(file, today, item.id, item.status === "done" ? "open" : "done"))}>
                {item.status === "done" ? "Mark open" : "Mark done"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => update(setItemStatus(file, today, item.id, item.status === "skipped" ? "open" : "skipped"))}>
                {item.status === "skipped" ? "Put back" : "Skip"}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => update(cycleItem(file, today, item.id))}>
                Replace
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => update(toggleShorter(file, today, item.id))}>
                {item.shorter ? "Full version" : "Shorter alternative"}
              </button>
            </div>
            <TimeField key={`${item.id}-${item.time}`} id={item.id} value={item.time} onCommit={(time) => update(setItemTime(file, today, item.id, time))} />
            <label className="field" htmlFor={`note-${item.id}`}>
              <span>Note</span>
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
        <h2 id="estimates-title">Estimates from saved answers</h2>
        <p>{calories.reason}</p>
        {calories.kind === "resting" ? <p>Resting estimate: about {calories.kcal} kcal.</p> : null}
        {calories.kind === "maintenance" ? (
          <p>
            Resting estimate: about {calories.resting} kcal. Maintenance estimate: about {calories.kcal} kcal.
          </p>
        ) : null}
        <p>{protein.reason}</p>
        {protein.kind === "estimate" ? <p>Protein estimate: about {protein.grams} grams.</p> : null}
      </section>

      <section className="card stack" aria-labelledby="weight-title">
        <h2 id="weight-title">Saved weight</h2>
        {chart.kind === "empty" ? <p>No saved weight entries, so there is no chart.</p> : null}
        {chart.kind === "single" ? (
          <p>
            One saved entry on {chart.entry.date}: {chart.entry.value} {chart.entry.unit}. One entry is not drawn as a chart.
          </p>
        ) : null}
        {chart.kind === "list" ? (
          <>
            <p>These entries use more than one unit, so they are listed as saved and not drawn on one chart.</p>
            <ul>
              {chart.entries.map((entry) => (
                <li key={entry.id}>
                  {entry.date}: {entry.value} {entry.unit}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {chart.kind === "bars" ? (
          <>
            <p className="hint">Bar length compares these saved entries only.</p>
            <ul className="stack">
              {chart.entries.map((entry) => (
                <li key={entry.id}>
                  <div className="progress-label">
                    <span>{entry.date}</span>
                    <span>
                      {entry.value} {entry.unit}
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
            Show the optional traditional note
          </button>
        </p>
      ) : (
        <section className="card stack" aria-labelledby="tradition-title">
          <h2 id="tradition-title">Optional traditional note</h2>
          <p>{ayurvedaNote()}</p>
          <button className="btn btn-ghost" type="button" onClick={() => update(setAyurvedaHidden(file, true))}>
            Skip this note
          </button>
        </section>
      )}
    </div>
  );
}

function TimeField({ id, value, onCommit }: { id: ItemId; value: string; onCommit: (time: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <label className="field" htmlFor={`time-${id}`}>
      <span>Time</span>
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
