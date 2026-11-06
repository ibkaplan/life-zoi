"use client";

import { useMemo, useState } from "react";
import { ReadOnlyNote } from "@/components/wellness/bits";
import { useWellness } from "@/components/wellness/use-wellness";
import { formatMonth } from "@/lib/dates";
import { LIFE_HABITS } from "@/lib/wellness/life-plan";
import { MISSION_CHECK_ID, lessonCheckId, moveCheckId } from "@/lib/library/ids";
import { dailyMissions, itemForDate, monthCells } from "@/lib/library/lessons";

function minutesNote(value: string) {
  if (!/^\d{1,3}$/.test(value)) return "";
  const minutes = Number(value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) return "";
  return `${minutes} minutes`;
}

export function SessionLog({ checkId, noun }: { checkId: string; noun: string }) {
  const wellness = useWellness();
  const [minutes, setMinutes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const today = wellness.log.checks.find((item) => item.id === checkId && item.date === wellness.today);
  const earlier = wellness.log.checks.filter((item) => item.id === checkId && item.done);

  function save() {
    const reflection = minutesNote(minutes);
    const result = wellness.toggleCheck(checkId, reflection);
    setMessage(result ?? (today?.done ? "Cleared for today." : "Saved in this browser tab."));
  }

  return (
    <section className="card stack no-print">
      <h2>Today&apos;s session</h2>
      <p className="hint">
        Optional. A missed day is not recorded as a miss, and nothing here is a streak. Notes stay in this browser tab.
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <label className="field">
        <span>Minutes, if you want a number</span>
        <input
          inputMode="numeric"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
          placeholder="Leave blank if you prefer"
        />
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={save}>
          {today?.done ? `Clear today's ${noun}` : `Mark this ${noun}`}
        </button>
      </div>
      {message ? <p role="status">{message}</p> : null}
      {today?.done ? <p>Marked for today{today.reflection ? `: ${today.reflection}` : ""}.</p> : null}
      {earlier.length > 0 ? (
        <p>Recorded on {earlier.map((item) => item.date).join(", ")}.</p>
      ) : (
        <p>Nothing recorded yet. A quiet day is fine.</p>
      )}
    </section>
  );
}

export function LessonCompletion({ slug }: { slug: string }) {
  const wellness = useWellness();
  const id = lessonCheckId(slug);
  const [note, setNote] = useState(wellness.reflection(id));
  const [message, setMessage] = useState<string | null>(null);
  const done = wellness.checked(id);

  return (
    <section className="card stack no-print">
      <h2>Your note</h2>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <label className="field">
        <span>Reflection</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
      </label>
      <div className="actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => setMessage(wellness.saveReflection(id, note) ?? "Reflection saved in this browser tab.")}
        >
          Save reflection
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            const result = wellness.toggleCheck(id, note);
            setMessage(result ?? (done ? "Completion cleared for today." : "Marked complete for today."));
          }}
        >
          {done ? "Clear today's completion" : "Mark lesson complete"}
        </button>
      </div>
      {message ? <p role="status">{message}</p> : null}
      <p className="hint">Closing the tab removes the note. A day without a mark is not a failure.</p>
    </section>
  );
}

export function MissionCard() {
  const wellness = useWellness();
  const mission = itemForDate(wellness.today, dailyMissions);
  const done = wellness.checked(MISSION_CHECK_ID);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="card stack">
      <h2>Optional daily mission</h2>
      <p>{mission.text}</p>
      <p className="hint">You can ignore it. Marking it is only a reminder in this browser tab.</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => setMessage(wellness.toggleCheck(MISSION_CHECK_ID) ?? (done ? "Mission cleared." : "Mission marked for today."))}
      >
        {done ? "Marked. Clear it" : "Mark the mission done"}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}

export function HabitPicker() {
  const wellness = useWellness();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="stack">
      <h2>Pick a habit</h2>
      <p>Choose one you might actually repeat. You can pause or remove it later on the challenges page.</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {message ? <p role="status">{message}</p> : null}
      <ul className="stack">
        {LIFE_HABITS.map((habit) => {
          const saved = wellness.log.habits.some((item) => item.slug === habit.slug);
          return (
            <li key={habit.slug} className="card stack">
              <h3>{habit.title}</h3>
              <p>{habit.detail}</p>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={saved}
                onClick={() =>
                  setMessage(
                    wellness.addHabit({
                      slug: habit.slug,
                      title: habit.title,
                      cadence: "daily",
                      target: 1,
                      note: habit.detail,
                    }) ?? "Added to your plan in this browser tab.",
                  )
                }
              >
                {saved ? "Already in the plan" : "Add this habit"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PracticeCalendar() {
  const wellness = useWellness();
  const [cursor, setCursor] = useState(() => wellness.today.slice(0, 7));
  const [year, month] = cursor.split("-").map(Number);
  const marked = useMemo(() => {
    const dates = new Set<string>();
    for (const mark of wellness.log.habitMarks) dates.add(mark.date);
    for (const check of wellness.log.checks) {
      if (check.done && check.id.startsWith("lib-")) dates.add(check.date);
    }
    return dates;
  }, [wellness.log]);
  const cells = monthCells(year, month);

  function shift(delta: number) {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1));
    setCursor(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <section className="stack">
      <h2>Calendar</h2>
      <p>A dot means something was recorded. A blank day is not a failure, and there is no streak to lose.</p>
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => shift(-1)}>
          Previous month
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => shift(1)}>
          Next month
        </button>
      </div>
      <h3>{formatMonth(cursor)}</h3>
      <ul className="library-cal">
        {cells.map((cell) => (
          <li key={cell.iso} className={cell.day && marked.has(cell.iso) ? "is-marked" : undefined}>
            {cell.day ? (
              <>
                <span className="sr-only">
                  {cell.iso}
                  {marked.has(cell.iso) ? ", something recorded" : ", nothing recorded. A blank day is not a failure."}
                </span>
                <span aria-hidden="true">{cell.day}</span>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MovementCheckList() {
  const wellness = useWellness();
  const suggestions = ["chair-yoga", "easy-walk", "seated-breath", "feet-ankles"];
  return (
    <section className="card stack no-print">
      <h2>Optional checkoffs</h2>
      <p className="hint">Mark only what you did. Days you skip are left blank on purpose.</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <ul className="stack">
        {suggestions.map((slug) => {
          const id = moveCheckId(slug);
          const done = wellness.checked(id);
          return (
            <li key={slug}>
              <button className="btn btn-secondary" type="button" onClick={() => wellness.toggleCheck(id)}>
                {done ? `Marked: ${slug.replace(/-/g, " ")}` : `Mark ${slug.replace(/-/g, " ")}`}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
