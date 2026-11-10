"use client";

import Link from "next/link";
import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { ReadOnlyNote } from "@/components/wellness/bits";
import { RecordChart, SupportNotice } from "@/components/wellness/urge-bits";
import { useWellness } from "@/components/wellness/use-wellness";
import { EXAMPLE_MOMENT_STORY } from "@/lib/wellness/moments";
import { LIFE_HABITS, MANAGEABLE_HABIT_COUNT, combinedProgress, habitSnapshots, periodCounts, urgePattern } from "@/lib/wellness/life-plan";
import { CHOICE_LABELS, FACTOR_LABELS } from "@/lib/wellness/urges";
import { challenges } from "@/lib/wellness/challenges";
import type { LifeHabit } from "@/lib/wellness/types";

const CADENCE_LABELS: Record<string, string> = { daily: msg("daily"), weekly: msg("weekly") };

export function HabitDashboard() {
  const t = useT();
  const wellness = useWellness();
  const snapshots = habitSnapshots(wellness.log, wellness.today);
  const progress = combinedProgress(wellness.log, wellness.today);
  const periods = periodCounts(wellness.log, wellness.today);
  const [message, setMessage] = useState<string | null>(null);
  const [custom, setCustom] = useState({ title: "", cadence: "daily" as LifeHabit["cadence"], target: "1", note: "" });
  const activeCount = wellness.log.habits.filter((habit) => !habit.paused).length;

  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("Habit dashboard")}</p>
      <h1>{t("Several habits, tracked separately")}</h1>
      <p className="lede">
        {t("Add, edit, pause, or remove habits. Pausing or removing a habit keeps the earlier marks. Start with a manageable number, about one to three. Water is not a meal, and a missed target is not a failure.")}
      </p>
      <p>
        {t("The assessment plan, with weekly priorities and a 30, 90, or 180 day reminder, lives on")}{" "}
        <Link href="/plan">{t("My Life Improvement Plan")}</Link>.
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {activeCount >= MANAGEABLE_HABIT_COUNT ? (
        <p className="hint" role="status">{t("You already have {count} active habits. More is allowed. A smaller set is easier to keep.", { count: activeCount })}</p>
      ) : null}
      <section className="card stack">
        <h2>{t("Combined progress")}</h2>
        <p>
          {t("Active habits: {active}. Meeting the current target: {met}. Paused: {paused}. This week’s marks: {week}. This month’s marks: {month}.", { active: progress.active, met: progress.met, paused: progress.paused, week: periods.weekMarks, month: periods.monthMarks })}
        </p>
        <ul className="chart-list">
          {periods.weekDays.map((day) => (
            <li key={day.date}>
              <span>{day.date}</span>
              <span>{t("Marks: {count}", { count: day.count })}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="stack">
        <h2>{t("Catalog")}</h2>
        {LIFE_HABITS.map((item) => (
          <article key={item.slug} className="card stack">
            <h3>{t(item.title)}</h3>
            <p>{t(item.detail)}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() =>
                setMessage(wellness.addHabit({ slug: item.slug, title: item.title, cadence: "daily", target: 1, note: item.detail }))
              }
            >
              {t("Add to my plan")}
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
            setMessage(t("Give the habit a name and a target from 1 to 7."));
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
        <h2>{t("Your own habit")}</h2>
        <label className="field" htmlFor="habit-title">
          <span>{t("Name")}</span>
          <input id="habit-title" maxLength={80} value={custom.title} onChange={(event) => setCustom({ ...custom, title: event.target.value })} />
        </label>
        <label className="field" htmlFor="habit-cadence">
          <span>{t("Cadence")}</span>
          <select id="habit-cadence" value={custom.cadence} onChange={(event) => setCustom({ ...custom, cadence: event.target.value as LifeHabit["cadence"] })}>
            <option value="daily">{t("Daily target")}</option>
            <option value="weekly">{t("Weekly target")}</option>
          </select>
        </label>
        <label className="field" htmlFor="habit-target">
          <span>{t("Target count")}</span>
          <input id="habit-target" inputMode="numeric" value={custom.target} onChange={(event) => setCustom({ ...custom, target: event.target.value })} />
        </label>
        <label className="field" htmlFor="habit-note">
          <span>{t("Note")}</span>
          <textarea id="habit-note" maxLength={280} value={custom.note} onChange={(event) => setCustom({ ...custom, note: event.target.value })} />
        </label>
        <button className="btn btn-primary" type="submit">{t("Add habit")}</button>
      </form>
      <section className="stack">
        <h2>{t("Your habits")}</h2>
        {snapshots.length === 0 ? <p>{t("None yet.")}</p> : null}
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
      {message ? <p role="status">{t(message)}</p> : null}
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
  const t = useT();
  const wellness = useWellness();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(habit.title);
  const [target, setTarget] = useState(String(habit.target));
  const [note, setNote] = useState(habit.note);
  const [cadence, setCadence] = useState(habit.cadence);

  return (
    <article className="card stack">
      <h3>{t(habit.title)}</h3>
      <p>
        {habit.paused ? t("Paused. History is kept.") : met ? t("Target met for this period.") : t("Still in progress.")}{" "}
        {t("{count} of {target} ({cadence}).", { count, target: habit.target, cadence: t(CADENCE_LABELS[habit.cadence] ?? habit.cadence) })}
      </p>
      {habit.note ? <p>{t(habit.note)}</p> : null}
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => onMessage(wellness.addHabitMark(habit.slug))}>{t("Mark once today")}</button>
        <button className="btn btn-ghost" type="button" onClick={() => onMessage(wellness.removeHabitMark(habit.slug))}>{t("Undo one mark today")}</button>
        <button className="btn btn-ghost" type="button" onClick={() => onMessage(wellness.updateHabit(habit.id, { paused: !habit.paused }))}>
          {habit.paused ? t("Resume") : t("Pause")}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => setEditing((value) => !value)}>{t("Edit")}</button>
        <button className="btn btn-ghost" type="button" onClick={() => onMessage(wellness.removeHabit(habit.id))}>{t("Remove")}</button>
      </div>
      {editing ? (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            const nextTarget = Number(target);
            if (!Number.isInteger(nextTarget) || nextTarget < 1 || nextTarget > 7) {
              onMessage(t("Target stays between 1 and 7."));
              return;
            }
            onMessage(wellness.updateHabit(habit.id, { title, cadence, target: nextTarget, note }));
            setEditing(false);
          }}
        >
          <label className="field" htmlFor={`edit-${habit.id}`}>
            <span>{t("Name")}</span>
            <input id={`edit-${habit.id}`} value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="field" htmlFor={`cadence-${habit.id}`}>
            <span>{t("Cadence")}</span>
            <select id={`cadence-${habit.id}`} value={cadence} onChange={(event) => setCadence(event.target.value as LifeHabit["cadence"])}>
              <option value="daily">{t("Daily")}</option>
              <option value="weekly">{t("Weekly")}</option>
            </select>
          </label>
          <label className="field" htmlFor={`target-${habit.id}`}>
            <span>{t("Target")}</span>
            <input id={`target-${habit.id}`} value={target} onChange={(event) => setTarget(event.target.value)} />
          </label>
          <label className="field" htmlFor={`note-${habit.id}`}>
            <span>{t("Note")}</span>
            <textarea id={`note-${habit.id}`} maxLength={280} value={note} onChange={(event) => setNote(event.target.value)} />
          </label>
          <button className="btn btn-primary" type="submit">{t("Save edits")}</button>
        </form>
      ) : null}
    </article>
  );
}

export function ActionPlan() {
  const t = useT();
  const wellness = useWellness();
  // The starter sentence is shown in the chosen language until the person edits it.
  const [cueDraft, setCue] = useState<string | null>(null);
  const [actionDraft, setAction] = useState<string | null>(null);
  const cue = cueDraft ?? t("If evening boredom shows up and I am not hungry");
  const action = actionDraft ?? t("then I open Choose Your Moment");
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const missions = challenges.filter((item) => ["choose-moment", "habits-30", "nature-7", "nature-30"].includes(item.id));

  return (
    <div className="learn stack-lg">
      <p className="kicker">{t("My personal action plan")}</p>
      <h1>{t("If this happens, then I can choose")}</h1>
      <p className="lede">
        {t("If–then lines are editable plans, not orders. The starter sentence about evening boredom is an example until you save it. Hunger still gets food.")}
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
          <span>{t("If")}</span>
          <textarea id="if-cue" maxLength={280} value={cue} onChange={(event) => setCue(event.target.value)} />
        </label>
        <label className="field" htmlFor="then-action">
          <span>{t("Then")}</span>
          <textarea id="then-action" maxLength={280} value={action} onChange={(event) => setAction(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit">{editing ? t("Update plan") : t("Save plan")}</button>
        {message ? <p role="status">{t(message)}</p> : null}
      </form>
      <ul className="record-list">
        {wellness.log.ifThen.map((plan) => (
          <li key={plan.id}>
            <p>{t("If {cue}, then {action}.", { cue: plan.cue, action: plan.action })}</p>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                setEditing(plan.id);
                setCue(plan.cue);
                setAction(plan.action);
              }}
            >
              {t("Edit")}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setMessage(wellness.removeIfThen(plan.id))}>
              {t("Remove")}
            </button>
          </li>
        ))}
      </ul>
      <section className="stack">
        <h2>{t("Optional missions")}</h2>
        {missions.map((mission) => (
          <Link key={mission.id} className="card learn-link" href={`/habits/${mission.id}`}>
            <h3>{t(mission.title)}</h3>
            <p>{t(mission.summary)}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export function UrgeProgress() {
  const t = useT();
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
      <p className="kicker">{t("Urge progress")}</p>
      <h1>{t("Your records, kept apart from examples")}</h1>
      <p className="lede">
        {t("Charts below use only notes saved in this browser tab. They are user-reported. They are not measured lab values, not estimates, and not hypothetical WHAT IF? text.")}
      </p>
      <p>
        {t("Urge notes: {total}. Average intensity: {mean}. A pattern is a count of what you wrote. It does not rename every craving as emotional eating.", { total: pattern.total, mean: pattern.meanIntensity })}
      </p>
      <RecordChart title={msg("Factors you marked")} rows={factorRows} empty={msg("No factors recorded yet.")} />
      <RecordChart title={msg("Choices you marked")} rows={choiceRows} empty={msg("No choices recorded yet.")} />
      <section className="card stack">
        <h2>{t("Reflections")}</h2>
        {wellness.log.urges.length === 0 ? <p>{t("No urge notes yet.")}</p> : null}
        <ul className="record-list">
          {wellness.log.urges.map((entry) => (
            <li key={entry.id}>
              <strong>{entry.date}</strong>
              <p>{entry.want || t("Want not named.")} {t("Intensity {value}.", { value: entry.intensity })}</p>
              {entry.outcome ? <p>{entry.outcome}</p> : null}
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>{t("Habits this week")}</h2>
        <p>{t("Marks across separate habits: {count}.", { count: periodCounts(wellness.log, wellness.today).weekMarks })}</p>
        <Link href="/urges/plan">{t("Open the habit dashboard")}</Link>
      </section>
      <aside className="card example-only stack">
        <h2>{t("Example only")}</h2>
        <p>{t(EXAMPLE_MOMENT_STORY)}</p>
        <p>{t("This example is not mixed into the charts.")}</p>
      </aside>
      <SupportNotice show={wellness.log.urges.some((entry) => entry.supportFlags.length > 0)} />
    </div>
  );
}
