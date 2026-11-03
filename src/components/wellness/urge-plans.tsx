"use client";

import Link from "next/link";
import { useState } from "react";
import { ReadOnlyNote } from "@/components/wellness/bits";
import { RecordChart, SupportNotice } from "@/components/wellness/urge-bits";
import { useWellness } from "@/components/wellness/use-wellness";
import { EXAMPLE_MOMENT_STORY } from "@/lib/wellness/moments";
import { LIFE_HABITS, MANAGEABLE_HABIT_COUNT, combinedProgress, habitSnapshots, periodCounts, urgePattern } from "@/lib/wellness/life-plan";
import { CHOICE_LABELS, FACTOR_LABELS } from "@/lib/wellness/urges";
import { challenges } from "@/lib/wellness/challenges";
import type { LifeHabit } from "@/lib/wellness/types";

export function HabitDashboard() {
  const wellness = useWellness();
  const snapshots = habitSnapshots(wellness.log, wellness.today);
  const progress = combinedProgress(wellness.log, wellness.today);
  const periods = periodCounts(wellness.log, wellness.today);
  const [message, setMessage] = useState<string | null>(null);
  const [custom, setCustom] = useState({ title: "", cadence: "daily" as LifeHabit["cadence"], target: "1", note: "" });
  const activeCount = wellness.log.habits.filter((habit) => !habit.paused).length;

  return (
    <div className="learn stack-lg">
      <p className="kicker">Habit dashboard</p>
      <h1>Several habits, tracked separately</h1>
      <p className="lede">
        Add, edit, pause, or remove habits. Pausing or removing a habit keeps the earlier marks. Start with a manageable number, about one to three. Water is not a meal, and a missed target is not a failure.
      </p>
      <p>
        The assessment plan, with weekly priorities and a 30, 90, or 180 day reminder, lives on{" "}
        <Link href="/plan">My Life Improvement Plan</Link>.
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {activeCount >= MANAGEABLE_HABIT_COUNT ? (
        <p className="hint" role="status">You already have {activeCount} active habits. More is allowed. A smaller set is easier to keep.</p>
      ) : null}
      <section className="card stack">
        <h2>Combined progress</h2>
        <p>
          {progress.active} active habits, {progress.met} meeting the current target, {progress.paused} paused. This week’s marks: {periods.weekMarks}. This month’s marks: {periods.monthMarks}.
        </p>
        <ul className="chart-list">
          {periods.weekDays.map((day) => (
            <li key={day.date}>
              <span>{day.date}</span>
              <span>{day.count} marks</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="stack">
        <h2>Catalog</h2>
        {LIFE_HABITS.map((item) => (
          <article key={item.slug} className="card stack">
            <h3>{item.title}</h3>
            <p>{item.detail}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() =>
                setMessage(wellness.addHabit({ slug: item.slug, title: item.title, cadence: "daily", target: 1, note: item.detail }))
              }
            >
              Add to my plan
            </button>
          </article>
        ))}
      </section>
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          const target = Number(custom.target);
          if (!custom.title.trim() || !Number.isInteger(target) || target < 1 || target > 7) {
            setMessage("Give the habit a name and a target from 1 to 7.");
            return;
          }
          setMessage(
            wellness.addHabit({
              title: custom.title.trim(),
              cadence: custom.cadence,
              target,
              note: custom.note,
            }),
          );
        }}
      >
        <h2>Your own habit</h2>
        <label className="field" htmlFor="habit-title">
          <span>Name</span>
          <input id="habit-title" maxLength={80} value={custom.title} onChange={(event) => setCustom({ ...custom, title: event.target.value })} />
        </label>
        <label className="field" htmlFor="habit-cadence">
          <span>Cadence</span>
          <select id="habit-cadence" value={custom.cadence} onChange={(event) => setCustom({ ...custom, cadence: event.target.value as LifeHabit["cadence"] })}>
            <option value="daily">Daily target</option>
            <option value="weekly">Weekly target</option>
          </select>
        </label>
        <label className="field" htmlFor="habit-target">
          <span>Target count</span>
          <input id="habit-target" inputMode="numeric" value={custom.target} onChange={(event) => setCustom({ ...custom, target: event.target.value })} />
        </label>
        <label className="field" htmlFor="habit-note">
          <span>Note</span>
          <textarea id="habit-note" maxLength={280} value={custom.note} onChange={(event) => setCustom({ ...custom, note: event.target.value })} />
        </label>
        <button className="btn btn-primary" type="submit">Add habit</button>
      </form>
      <section className="stack">
        <h2>Your habits</h2>
        {snapshots.length === 0 ? <p>None yet.</p> : null}
        {snapshots.map(({ habit, count, met }) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            count={count}
            met={met}
            onMessage={setMessage}
          />
        ))}
      </section>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}

function HabitCard({
  habit,
  count,
  met,
  onMessage,
}: {
  habit: LifeHabit;
  count: number;
  met: boolean;
  onMessage: (message: string | null) => void;
}) {
  const wellness = useWellness();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(habit.title);
  const [target, setTarget] = useState(String(habit.target));
  const [note, setNote] = useState(habit.note);
  const [cadence, setCadence] = useState(habit.cadence);

  return (
    <article className="card stack">
      <h3>{habit.title}</h3>
      <p>
        {habit.paused ? "Paused. History is kept." : met ? "Target met for this period." : "Still in progress."} {count} of {habit.target} ({habit.cadence}).
      </p>
      {habit.note ? <p>{habit.note}</p> : null}
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => onMessage(wellness.addHabitMark(habit.slug))}>Mark once today</button>
        <button className="btn btn-ghost" type="button" onClick={() => onMessage(wellness.removeHabitMark(habit.slug))}>Undo one mark today</button>
        <button className="btn btn-ghost" type="button" onClick={() => onMessage(wellness.updateHabit(habit.id, { paused: !habit.paused }))}>
          {habit.paused ? "Resume" : "Pause"}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => setEditing((value) => !value)}>Edit</button>
        <button className="btn btn-ghost" type="button" onClick={() => onMessage(wellness.removeHabit(habit.id))}>Remove</button>
      </div>
      {editing ? (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            const nextTarget = Number(target);
            if (!Number.isInteger(nextTarget) || nextTarget < 1 || nextTarget > 7) {
              onMessage("Target stays between 1 and 7.");
              return;
            }
            onMessage(wellness.updateHabit(habit.id, { title, cadence, target: nextTarget, note }));
            setEditing(false);
          }}
        >
          <label className="field" htmlFor={`edit-${habit.id}`}>
            <span>Name</span>
            <input id={`edit-${habit.id}`} value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field" htmlFor={`cadence-${habit.id}`}>
            <span>Cadence</span>
            <select id={`cadence-${habit.id}`} value={cadence} onChange={(event) => setCadence(event.target.value as LifeHabit["cadence"])}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className="field" htmlFor={`target-${habit.id}`}>
            <span>Target</span>
            <input id={`target-${habit.id}`} value={target} onChange={(event) => setTarget(event.target.value)} />
          </label>
          <label className="field" htmlFor={`note-${habit.id}`}>
            <span>Note</span>
            <textarea id={`note-${habit.id}`} maxLength={280} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">Save edits</button>
        </form>
      ) : null}
    </article>
  );
}

export function ActionPlan() {
  const wellness = useWellness();
  const [cue, setCue] = useState("If evening boredom shows up and I am not hungry");
  const [action, setAction] = useState("then I open Choose Your Moment");
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const missions = challenges.filter((item) => ["choose-moment", "habits-30", "nature-7", "nature-30"].includes(item.id));

  return (
    <div className="learn stack-lg">
      <p className="kicker">My personal action plan</p>
      <h1>If this happens, then I can choose</h1>
      <p className="lede">
        If–then lines are editable plans, not orders. The starter sentence about evening boredom is an example until you save it. Hunger still gets food.
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage(wellness.saveIfThen({ id: editing ?? undefined, cue, action }));
          setEditing(null);
        }}
      >
        <label className="field" htmlFor="if-cue">
          <span>If</span>
          <textarea id="if-cue" maxLength={280} value={cue} onChange={(event) => setCue(event.target.value)} />
        </label>
        <label className="field" htmlFor="then-action">
          <span>Then</span>
          <textarea id="then-action" maxLength={280} value={action} onChange={(event) => setAction(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">{editing ? "Update plan" : "Save plan"}</button>
        {message ? <p role="status">{message}</p> : null}
      </form>
      <ul className="record-list">
        {wellness.log.ifThen.map((plan) => (
          <li key={plan.id}>
            <p>If {plan.cue}, then {plan.action}.</p>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setEditing(plan.id);
                setCue(plan.cue);
                setAction(plan.action);
              }}
            >
              Edit
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setMessage(wellness.removeIfThen(plan.id))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <section className="stack">
        <h2>Optional missions</h2>
        {missions.map((mission) => (
          <Link key={mission.id} className="card learn-link" href={`/habits/${mission.id}`}>
            <h3>{mission.title}</h3>
            <p>{mission.summary}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export function UrgeProgress() {
  const wellness = useWellness();
  const pattern = urgePattern(wellness.log.urges);
  const factorRows = pattern.byFactor.map((row) => ({
    label: FACTOR_LABELS[row.label as keyof typeof FACTOR_LABELS] ?? row.label,
    value: row.value,
  }));
  const choiceRows = pattern.byChoice.map((row) => ({
    label: CHOICE_LABELS[row.label as keyof typeof CHOICE_LABELS] ?? row.label,
    value: row.value,
  }));

  return (
    <div className="learn stack-lg">
      <p className="kicker">Urge progress</p>
      <h1>Your records, kept apart from examples</h1>
      <p className="lede">
        Charts below use only notes saved in this browser tab. They are user-reported. They are not measured lab values, not estimates, and not hypothetical WHAT IF? text.
      </p>
      <p>
        {pattern.total} urge notes. Average intensity {pattern.meanIntensity}. A pattern is a count of what you wrote. It does not rename every craving as emotional eating.
      </p>
      <RecordChart title="Factors you marked" rows={factorRows} empty="No factors recorded yet." />
      <RecordChart title="Choices you marked" rows={choiceRows} empty="No choices recorded yet." />
      <section className="card stack">
        <h2>Reflections</h2>
        {wellness.log.urges.length === 0 ? <p>No urge notes yet.</p> : null}
        <ul className="record-list">
          {wellness.log.urges.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.date}</strong>
              <p>{entry.want || "Want not named."} Intensity {entry.intensity}.</p>
              {entry.outcome ? <p>{entry.outcome}</p> : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>Habits this week</h2>
        <p>{periodCounts(wellness.log, wellness.today).weekMarks} marks across separate habits.</p>
        <Link href="/urges/plan">Open the habit dashboard</Link>
      </section>
      <aside className="card example-only stack">
        <h2>Example only</h2>
        <p>{EXAMPLE_MOMENT_STORY}</p>
        <p>This example is not mixed into the charts.</p>
      </aside>
      <SupportNotice show={wellness.log.urges.some((entry) => entry.supportFlags.length > 0)} />
    </div>
  );
}
