"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { ReadOnlyNote } from "@/components/wellness/bits";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg, type Translate } from "@/lib/i18n/translate";
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

/** The saved note stays in English ("12 minutes"); it is shown in the chosen language. */
function shownNote(note: string, t: Translate) {
  const match = /^(\d{1,3}) minutes$/.exec(note);
  return match ? t("{minutes} minutes", { minutes: match[1] }) : note;
}

export function SessionLog({ checkId, noun }: { checkId: string; noun: string }) {
  const t = useT();
  const wellness = useWellness();
  const [minutes, setMinutes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const today = wellness.log.checks.find((item) => item.id === checkId && item.date === wellness.today);
  const earlier = wellness.log.checks.filter((item) => item.id === checkId && item.done);

  function save() {
    const reflection = minutesNote(minutes);
    const result = wellness.toggleCheck(checkId, reflection);
    setMessage(result ? t(result) : today?.done ? t("Cleared for today.") : t("Saved in this browser tab."));
  }

  return (
    <section className="card stack no-print">
      <h2>{t("Today's session")}</h2>
      <p className="hint">
        {t("Optional. A missed day is not recorded as a miss, and nothing here is a streak. Notes stay in this browser tab.")}
      </p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <label className="field">
        <span>{t("Minutes, if you want a number")}</span>
        <input
          inputMode="numeric"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value.replace(/[^\d]/g, "").slice(0, 3))}
          placeholder={t("Leave blank if you prefer")}
        />
      </label>
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={save}>
          {today?.done ? t("Clear today's {noun}", { noun: t(noun) }) : t("Mark this {noun}", { noun: t(noun) })}
        </button>
      </div>
      {message ? <p role="status">{message}</p> : null}
      {today?.done ? (
        <p>{today.reflection ? t("Marked for today: {note}.", { note: shownNote(today.reflection, t) }) : t("Marked for today.")}</p>
      ) : null}
      {earlier.length > 0 ? (
        <p>{t("Recorded on {dates}.", { dates: earlier.map((item) => item.date).join(", ") })}</p>
      ) : (
        <p>{t("Nothing recorded yet. A quiet day is fine.")}</p>
      )}
    </section>
  );
}

export function LessonCompletion({ slug }: { slug: string }) {
  const t = useT();
  const wellness = useWellness();
  const id = lessonCheckId(slug);
  const [note, setNote] = useState(wellness.reflection(id));
  const [message, setMessage] = useState<string | null>(null);
  const done = wellness.checked(id);

  return (
    <section className="card stack no-print">
      <h2>{t("Your note")}</h2>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <label className="field">
        <span>{t("Reflection")}</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
      </label>
      <div className="actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            const result = wellness.saveReflection(id, note);
            setMessage(result ? t(result) : t("Reflection saved in this browser tab."));
          }}
        >
          {t("Save reflection")}
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            const result = wellness.toggleCheck(id, note);
            setMessage(result ? t(result) : done ? t("Completion cleared for today.") : t("Marked complete for today."));
          }}
        >
          {done ? t("Clear today's completion") : t("Mark lesson complete")}
        </button>
      </div>
      {message ? <p role="status">{message}</p> : null}
      <p className="hint">{t("Closing the tab removes the note. A day without a mark is not a failure.")}</p>
    </section>
  );
}

export function MissionCard() {
  const t = useT();
  const wellness = useWellness();
  const mission = itemForDate(wellness.today, dailyMissions);
  const done = wellness.checked(MISSION_CHECK_ID);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="card stack">
      <h2>{t("Optional daily mission")}</h2>
      <p>{t(mission.text)}</p>
      <p className="hint">{t("You can ignore it. Marking it is only a reminder in this browser tab.")}</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => {
          const result = wellness.toggleCheck(MISSION_CHECK_ID);
          setMessage(result ? t(result) : done ? t("Mission cleared.") : t("Mission marked for today."));
        }}
      >
        {done ? t("Marked. Clear it") : t("Mark the mission done")}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}

export function HabitPicker() {
  const t = useT();
  const wellness = useWellness();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <section className="stack">
      <h2>{t("Pick a habit")}</h2>
      <p>{t("Choose one you might actually repeat. You can pause or remove it later on the challenges page.")}</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      {message ? <p role="status">{message}</p> : null}
      <ul className="stack">
        {LIFE_HABITS.map((habit) => {
          const saved = wellness.log.habits.some((item) => item.slug === habit.slug);
          return (
            <li key={habit.slug} className="card stack">
              <h3>{t(habit.title)}</h3>
              <p>{t(habit.detail)}</p>
              <button
                className="btn btn-secondary"
                type="button"
                disabled={saved}
                onClick={() => {
                  const result = wellness.addHabit({
                    slug: habit.slug,
                    title: habit.title,
                    cadence: "daily",
                    target: 1,
                    note: habit.detail,
                  });
                  setMessage(result ? t(result) : t("Added to your plan in this browser tab."));
                }}
              >
                {saved ? t("Already in the plan") : t("Add this habit")}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PracticeCalendar() {
  const { t, locale } = useLocale();
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
      <h2>{t("Calendar")}</h2>
      <p>{t("A dot means something was recorded. A blank day is not a failure, and there is no streak to lose.")}</p>
      <div className="actions">
        <button className="btn btn-secondary" type="button" onClick={() => shift(-1)}>
          {t("Previous month")}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => shift(1)}>
          {t("Next month")}
        </button>
      </div>
      <h3>{formatMonth(cursor, LOCALE_META[locale].htmlLang)}</h3>
      <ul className="library-cal">
        {cells.map((cell) => (
          <li key={cell.iso} className={cell.day && marked.has(cell.iso) ? "is-marked" : undefined}>
            {cell.day ? (
              <>
                <span className="sr-only">
                  {marked.has(cell.iso)
                    ? t("{date}, something recorded", { date: cell.iso })
                    : t("{date}, nothing recorded. A blank day is not a failure.", { date: cell.iso })}
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

/** Shown names of the suggested checkoffs. The English matches the slug with spaces. */
const CHECKOFF_NAMES: Record<string, string> = {
  "chair-yoga": msg("chair yoga"),
  "easy-walk": msg("easy walk"),
  "seated-breath": msg("seated breath"),
  "feet-ankles": msg("feet ankles"),
};

export function MovementCheckList() {
  const t = useT();
  const wellness = useWellness();
  const suggestions = ["chair-yoga", "easy-walk", "seated-breath", "feet-ankles"];
  return (
    <section className="card stack no-print">
      <h2>{t("Optional checkoffs")}</h2>
      <p className="hint">{t("Mark only what you did. Days you skip are left blank on purpose.")}</p>
      <ReadOnlyNote message={wellness.readOnlyMessage} />
      <ul className="stack">
        {suggestions.map((slug) => {
          const id = moveCheckId(slug);
          const done = wellness.checked(id);
          const name = t(CHECKOFF_NAMES[slug] ?? slug.replace(/-/g, " "));
          return (
            <li key={slug}>
              <button className="btn btn-secondary" type="button" onClick={() => wellness.toggleCheck(id)}>
                {done ? t("Marked: {name}", { name }) : t("Mark {name}", { name })}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
