"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { localDateISO, shiftMonth } from "@/lib/dates";
import { activeGoals, summarizeMonth, supportiveNote } from "@/lib/progress";
import { getScenario } from "@/lib/scenarios";
import {
  removeAssessment,
  removeCheckIn,
  saveGoal,
  setGoalArchived,
  upsertCheckIn,
  type CheckInStatus,
  type HabitCadence,
  type UserData,
} from "@/lib/user-data";
import { SampleExample } from "@/components/sample-example";
import { Button, Card, EmptyState, PageHeader, TextField } from "@/components/ui";
import { DataGate, postValidation } from "@/components/user-data-provider";

export function ProgressView() {
  return (
    <DataGate>
      {(ready) => <ProgressBody data={ready.data} commit={ready.commit} />}
    </DataGate>
  );
}

function ProgressBody({ data, commit }: { data: UserData; commit: (next: UserData) => string | null }) {
  const [cursor, setCursor] = useState<{ year: number; monthIndex: number; today: string } | null>(null);
  const [goalId, setGoalId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<CheckInStatus>("done");
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [cadence, setCadence] = useState<HabitCadence>("most-days");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();
      const today = localDateISO(now);
      setCursor({ year: now.getFullYear(), monthIndex: now.getMonth(), today });
      setDate(today);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!cursor) return <p role="status">Loading this month…</p>;
  const summary = summarizeMonth(data.checkIns, cursor.year, cursor.monthIndex);
  const goals = activeGoals(data.goals);
  const monthCheckIns = data.checkIns
    .filter((item) => item.date.startsWith(`${cursor.year}-${String(cursor.monthIndex + 1).padStart(2, "0")}`))
    .sort((a, b) => b.date.localeCompare(a.date));
  const atCurrent = cursor.year === Number(cursor.today.slice(0, 4)) && cursor.monthIndex === Number(cursor.today.slice(5, 7)) - 1;

  async function saveCheckIn() {
    setError("");
    const selectedGoal = goalId || goals[0]?.id || "";
    const server = await postValidation("/api/validate/check-in", { goalId: selectedGoal, date, status, note, today: cursor?.today });
    if (!server.ok) {
      setError(server.errors?.[0]?.message ?? server.message);
      return;
    }
    const result = upsertCheckIn(data, {
      id: crypto.randomUUID(),
      goalId: selectedGoal,
      date,
      status,
      note,
      now: new Date().toISOString(),
      today: cursor?.today ?? date,
    });
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "Nothing was saved.");
      return;
    }
    const failure = commit(result.data);
    setMessage(failure ?? "Check-in updated on this device.");
    setNote("");
  }

  function addGoal() {
    const result = saveGoal(data, {
      id: crypto.randomUUID(),
      title,
      detail,
      cadence,
      sourceScenarioId: null,
      now: new Date().toISOString(),
    });
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "The habit was not added.");
      return;
    }
    const failure = commit(result.data);
    setMessage(failure ?? "Habit added. Past days were not filled in.");
    setTitle("");
    setDetail("");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Progress"
        title={summary.label}
        lede="Record what you tried. lifeZoi does not turn a check-in into proof that a habit caused a health result."
      />
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => setCursor((current) => current && { ...current, ...shiftMonth(current.year, current.monthIndex, -1) })}>
          Previous month
        </Button>
        <Button type="button" variant="secondary" disabled={atCurrent} onClick={() => setCursor((current) => current && { ...current, ...shiftMonth(current.year, current.monthIndex, 1) })}>
          Next month
        </Button>
      </div>
      <Card>
        <h2 className="font-display text-3xl">Monthly overview</h2>
        {summary.hasRecords ? (
          <>
            <p className="mt-3 text-lg">
              {summary.done} done, {summary.partial} partial, {summary.skipped} skipped
            </p>
            <WeekChart weeks={summary.weeks} />
          </>
        ) : (
          <p className="mt-3 text-muted">No check-ins in {summary.label}.</p>
        )}
        <p className="mt-4 text-muted">{supportiveNote(summary)}</p>
      </Card>
      {goals.length === 0 ? (
        <EmptyState title="Add one habit before you track days">
          <p>Keep it small. lifeZoi will not create a history for you.</p>
        </EmptyState>
      ) : (
        <Card>
          <h2 className="font-display text-3xl">Check in</h2>
          <div className="mt-4 grid gap-4">
            <label className="block font-semibold" htmlFor="goal-select">
              Habit
              <select id="goal-select" className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface px-3" value={goalId || goals[0]?.id} onChange={(event) => setGoalId(event.target.value)}>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
            </label>
            <TextField id="check-date" label="Day" type="date" max={cursor.today} value={date} onChange={(event) => setDate(event.target.value)} />
            <fieldset>
              <legend className="font-semibold">How did it go?</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(["done", "partial", "skipped"] as const).map((value) => (
                  <label key={value} className={`flex min-h-11 items-center gap-2 rounded-2xl border px-3 ${status === value ? "border-forest bg-sage" : "border-line"}`}>
                    <input type="radio" name="status" value={value} checked={status === value} onChange={() => setStatus(value)} />
                    <span className="capitalize">{value}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <TextField id="check-note" label="Note" hint="Optional. You can change this later." value={note} maxLength={280} onChange={(event) => setNote(event.target.value)} />
            <Button type="button" onClick={saveCheckIn}>
              Save check-in
            </Button>
          </div>
        </Card>
      )}
      <Card>
        <h2 className="font-display text-3xl">Habits</h2>
        <div className="mt-4 grid gap-3">
          <TextField id="habit-title" label="Habit name" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
          <TextField id="habit-detail" label="Detail" hint="Optional." value={detail} maxLength={180} onChange={(event) => setDetail(event.target.value)} />
          <label className="font-semibold" htmlFor="cadence">
            Cadence
            <select id="cadence" className="mt-2 min-h-11 w-full rounded-2xl border border-line bg-surface px-3" value={cadence} onChange={(event) => setCadence(event.target.value as HabitCadence)}>
              <option value="daily">Daily</option>
              <option value="most-days">Most days</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <Button type="button" variant="secondary" onClick={addGoal}>
            Add habit
          </Button>
        </div>
        <ul className="mt-4 space-y-2">
          {data.goals.map((goal) => (
            <li key={goal.id} className="flex flex-col gap-2 rounded-2xl border border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{goal.title}</p>
                <p className="text-sm text-muted">
                  {goal.cadence}
                  {goal.archivedAt ? " · paused" : ""}
                  {goal.detail ? ` · ${goal.detail}` : ""}
                </p>
              </div>
              <Button type="button" variant="quiet" onClick={() => commit(setGoalArchived(data, goal.id, goal.archivedAt ? null : new Date().toISOString()))}>
                {goal.archivedAt ? "Resume" : "Pause"}
              </Button>
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="font-display text-3xl">Entries you can correct</h2>
        {monthCheckIns.length === 0 ? (
          <p className="mt-2 text-muted">Nothing to edit in this month.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {monthCheckIns.map((item) => {
              const goal = data.goals.find((candidate) => candidate.id === item.goalId);
              return (
                <li key={item.id} className="rounded-2xl bg-bg px-3 py-3">
                  <p className="font-semibold">
                    {item.date} · {goal?.title ?? "Habit"} · {item.status}
                  </p>
                  {item.note ? <p className="text-muted">{item.note}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setGoalId(item.goalId);
                        setDate(item.date);
                        setStatus(item.status);
                        setNote(item.note);
                      }}
                    >
                      Edit
                    </Button>
                    <Button type="button" variant="quiet" onClick={() => commit(removeCheckIn(data, item.id))}>
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <Card>
        <h2 className="font-display text-3xl">Assessment history</h2>
        {data.assessments.length === 0 ? (
          <p className="mt-2 text-muted">No completed assessment yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {[...data.assessments].reverse().map((item) => (
              <li key={item.id} className="flex flex-col gap-2 rounded-2xl border border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p>Completed {new Date(item.completedAt).toLocaleDateString()}</p>
                <Button type="button" variant="quiet" onClick={() => commit(removeAssessment(data, item.id))}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card>
        <h2 className="font-display text-3xl">Saved WHAT IF? scenarios</h2>
        {data.scenarios.length === 0 ? (
          <p className="mt-2 text-muted">
            None yet. Explore them in <Link className="font-semibold text-forest" href="/what-if">WHAT IF?</Link>
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data.scenarios.map((item) => (
              <li key={item.id}>
                <Link className="font-semibold text-forest" href={`/what-if/${item.scenarioId}`}>
                  {getScenario(item.scenarioId)?.title ?? "Saved scenario"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {data.checkIns.length === 0 && data.assessments.length === 0 ? <SampleExample /> : null}
      {error ? <p role="alert" className="font-semibold text-danger">{error}</p> : null}
      {message ? <p role="status" className="text-muted">{message}</p> : null}
    </div>
  );
}

function WeekChart({ weeks }: { weeks: { label: string; done: number; partial: number; skipped: number }[] }) {
  const max = Math.max(1, ...weeks.map((week) => week.done + week.partial + week.skipped));
  return (
    <figure className="mt-4">
      <figcaption className="font-semibold">Check-ins by week</figcaption>
      <ul className="mt-3 space-y-3">
        {weeks.map((week) => (
          <li key={week.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>{week.label}</span>
              <span>
                {week.done} done, {week.partial} partial, {week.skipped} skipped
              </span>
            </div>
            <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span className="bg-forest" style={{ width: `${(week.done / max) * 100}%` }} />
              <span className="bg-clay" style={{ width: `${(week.partial / max) * 100}%` }} />
              <span className="bg-sand" style={{ width: `${(week.skipped / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <table className="mt-4 w-full text-left text-sm">
        <caption className="sr-only">Check-in counts by week</caption>
        <thead>
          <tr>
            <th className="py-1">Week</th>
            <th className="py-1">Done</th>
            <th className="py-1">Partial</th>
            <th className="py-1">Skipped</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={`${week.label}-row`} className="border-t border-line">
              <td className="py-1">{week.label}</td>
              <td>{week.done}</td>
              <td>{week.partial}</td>
              <td>{week.skipped}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
