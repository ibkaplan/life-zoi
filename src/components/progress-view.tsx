"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import {
  formatLongDate,
  formatMonth,
  formatTimestamp,
  isFutureDate,
  localISODate,
  monthKey,
} from "@/lib/dates";
import { habitLabels } from "@/lib/labels";
import { TRACKABLE_HABIT_IDS, type TrackableHabitId } from "@/lib/types";

export function ProgressView() {
  const { ready, sample, session, setGoal, removeGoal, saveCheckIn, removeCheckIn } =
    useSession();
  const today = localISODate();
  const [month, setMonth] = useState(monthKey(today));
  const [habitId, setHabitId] = useState<TrackableHabitId>("walk");
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [checkDate, setCheckDate] = useState(today);
  const [checkHabit, setCheckHabit] = useState<TrackableHabitId>("walk");
  const [checkDone, setCheckDone] = useState(true);
  const [checkNote, setCheckNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const months = useMemo(() => {
    const keys = new Set<string>([monthKey(today)]);
    for (const item of session.checkIns) keys.add(monthKey(item.date));
    return [...keys].sort().reverse();
  }, [session.checkIns, today]);

  if (!ready) return <LoadingState label="Loading progress…" />;

  const monthItems = session.checkIns
    .filter((item) => item.date.startsWith(month))
    .sort((a, b) => a.date.localeCompare(b.date) || a.habitId.localeCompare(b.habitId));

  return (
    <div className="stack-lg">
      <div className="narrow stack">
        <p className="kicker">Progress</p>
        <h1>A record of what you try</h1>
        <p className="lede">
          A missed day is information, not a failure. lifeZoi does not claim a habit change caused a health result.
        </p>
      </div>
      <section className="card stack">
        <h2>Habit goals</h2>
        <p>Choose a habit and how many days a week you want to aim for. This is your goal, not a prescription.</p>
        {session.goals.length === 0 ? (
          <p>No goals yet. Add one when you are ready.</p>
        ) : (
          <ul className="record-list">
            {session.goals.map((goal) => (
              <li key={goal.habitId}>
                <strong>{habitLabels[goal.habitId]}</strong>
                <p>{goal.daysPerWeek} days a week</p>
                <button
                  className="btn btn-ghost"
                  type="button"
                  disabled={sample}
                  onClick={() => removeGoal(goal.habitId)}
                >
                  Remove goal
                </button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            const result = setGoal(habitId, daysPerWeek);
            setError(result ?? "");
            setMessage(result ? "" : "Goal saved in this tab.");
          }}
        >
          <label className="field" htmlFor="goal-habit">
            <span>Goal habit</span>
            <select
              id="goal-habit"
              value={habitId}
              onChange={(event) => setHabitId(event.target.value as TrackableHabitId)}
            >
              {TRACKABLE_HABIT_IDS.map((id) => (
                <option key={id} value={id}>
                  {habitLabels[id]}
                </option>
              ))}
            </select>
          </label>
          <label className="field" htmlFor="goal-days">
            <span>Days per week</span>
            <input
              id="goal-days"
              type="number"
              min={1}
              max={7}
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(Number(event.target.value))}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={sample}>
            Save goal
          </button>
        </form>
      </section>
      <section className="card stack">
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <h2>Check-ins</h2>
          <label className="field" htmlFor="month">
            <span className="sr-only">Month</span>
            <select id="month" value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((value) => (
                <option key={value} value={value}>
                  {formatMonth(value)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          {formatMonth(month)}. {monthItems.length === 0
            ? "No check-ins in this month yet."
            : `${monthItems.filter((item) => item.done).length} of ${monthItems.length} recorded check-ins were marked done.`}
        </p>
        {session.goals.map((goal) => {
          const rows = monthItems.filter((item) => item.habitId === goal.habitId);
          if (rows.length < 2) {
            return (
              <p key={goal.habitId}>
                {habitLabels[goal.habitId]} needs at least two check-ins in {formatMonth(month)} before a chart is shown.
              </p>
            );
          }
          return <CheckChart key={goal.habitId} label={habitLabels[goal.habitId]} rows={rows} />;
        })}
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            if (isFutureDate(checkDate, today)) {
              setError("Choose today or an earlier date.");
              setMessage("");
              return;
            }
            const result = saveCheckIn({
              date: checkDate,
              habitId: checkHabit,
              done: checkDone,
              note: checkNote,
            });
            setError(result ?? "");
            setMessage(result ? "" : "Check-in saved in this tab.");
            if (!result) setCheckNote("");
          }}
        >
          <h3>Record or update a check-in</h3>
          <div className="grid-2">
            <label className="field" htmlFor="check-date">
              <span>Date</span>
              <input
                id="check-date"
                type="date"
                value={checkDate}
                max={today}
                onChange={(event) => setCheckDate(event.target.value)}
              />
            </label>
            <label className="field" htmlFor="check-habit">
              <span>Check-in habit</span>
              <select
                id="check-habit"
                value={checkHabit}
                onChange={(event) => setCheckHabit(event.target.value as TrackableHabitId)}
              >
                {TRACKABLE_HABIT_IDS.map((id) => (
                  <option key={id} value={id}>
                    {habitLabels[id]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={checkDone}
              onChange={(event) => setCheckDone(event.target.checked)}
            />
            <span>Marked done</span>
          </label>
          <label className="field" htmlFor="check-note">
            <span>Note</span>
            <span className="hint">Optional.</span>
            <input
              id="check-note"
              type="text"
              maxLength={280}
              value={checkNote}
              onChange={(event) => setCheckNote(event.target.value)}
            />
          </label>
          <button className="btn btn-primary" type="submit" disabled={sample}>
            Save check-in
          </button>
        </form>
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="alert alert-ok" role="status">
            {message}
          </p>
        ) : null}
        {monthItems.length > 0 ? (
          <ul className="record-list">
            {monthItems.map((item) => (
              <li key={item.id}>
                <strong>
                  {formatLongDate(item.date)} · {habitLabels[item.habitId]}
                </strong>
                <p>{item.done ? "Done" : "Not done"}</p>
                {item.note ? <p>{item.note}</p> : null}
                <div className="actions">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={sample}
                    onClick={() =>
                      saveCheckIn({
                        date: item.date,
                        habitId: item.habitId,
                        done: !item.done,
                        note: item.note,
                      })
                    }
                  >
                    {item.done ? "Mark not done" : "Mark done"}
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    disabled={sample}
                    onClick={() => removeCheckIn(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      <section className="grid-2">
        <article className="card stack">
          <h2>Assessments</h2>
          {session.history.length === 0 ? (
            <p>
              Completed assessments will be listed here. <Link href="/assessment">Start one</Link>
            </p>
          ) : (
            <ul className="record-list">
              {session.history.map((item) => (
                <li key={item.id}>
                  <p>{formatTimestamp(item.completedAt)}</p>
                  <p className="hint">
                    {item.answers.displayName || "Assessment"} · {item.answers.goals.length} focus
                    {item.answers.goals.length === 1 ? "" : "es"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
        <article className="card stack">
          <h2>WHAT IF? scenarios</h2>
          {session.scenarios.length === 0 ? (
            <p>
              Saved illustrations will be listed here. <Link href="/what-if">Explore one</Link>
            </p>
          ) : (
            <ul className="record-list">
              {session.scenarios.map((item) => (
                <li key={item.id}>
                  <Link href={`/what-if/${item.id}`}>{habitLabels[item.habitId]}</Link>
                  <p className="hint">{formatTimestamp(item.savedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}

function CheckChart({
  label,
  rows,
}: {
  label: string;
  rows: { date: string; done: boolean }[];
}) {
  const done = rows.filter((row) => row.done).length;
  return (
    <figure className="stack">
      <figcaption>
        {label} in this month. {done} of {rows.length} recorded days were marked done. Bars use the words Done and Not done, not color alone.
      </figcaption>
      <div className="day-grid" aria-hidden="true">
        {rows.map((row) => (
          <div className={row.done ? "day is-done" : "day"} key={row.date}>
            <span className="day-num">{formatLongDate(row.date)}</span>
            <span>{row.done ? "Done" : "Not done"}</span>
          </div>
        ))}
      </div>
      <details>
        <summary>View {label} as a table</summary>
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">{label} check-ins</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.date}>
                  <td>{formatLongDate(row.date)}</td>
                  <td>{row.done ? "Done" : "Not done"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
