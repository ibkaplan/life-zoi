"use client";

import Link from "next/link";
import { useState } from "react";
import { HabitFrame } from "@/components/habit-transformation/frame";
import { useHabitJourney } from "@/components/habit-transformation/use-habit-journey";
import { useLocale, useT } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import {
  ACHIEVEMENTS,
  earnedAchievements,
  hasSavedChartData,
  progressSnapshot,
  showRestart,
  weekBars,
} from "@/lib/habit-transformation/engine";
import { NOTICE, RESTART_LINE, SECTIONS, TITLE } from "@/lib/habit-transformation/catalog";
import { saveWeekNote } from "@/lib/habit-transformation/model";
import { localISODate } from "@/lib/dates";

export function IntroView() {
  const t = useT();
  return (
    <HabitFrame>
      <section className="hero-panel">
        <h1>{t(TITLE)}</h1>
        <p>
          {t("LifeZoi Habit Transformation helps you choose a habit, see what may be keeping it in place, and practice a step small enough for an ordinary day.")}
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/habit-transformation/journey">{t("Start My Habit Journey")}</Link>
          <Link className="btn btn-secondary" href="/habit-transformation/science">{t("The Science Behind")}</Link>
        </div>
      </section>
      <section className="grid-2">
        {SECTIONS.filter((section) => section.href !== "/habit-transformation").map((section) => (
          <Link key={section.href} className="card learn-link" href={section.href}>
            <h2>{t(section.label)}</h2>
          </Link>
        ))}
      </section>
      <p className="hint" role="note">{t(NOTICE)}</p>
    </HabitFrame>
  );
}

function Loading() {
  const t = useT();
  return (
    <HabitFrame>
      <p className="card">{t("Loading your habit journey…")}</p>
    </HabitFrame>
  );
}

export function ProgressView() {
  const { journey, ready, sample, save } = useHabitJourney();
  const t = useT();
  const { locale } = useLocale();
  const today = localISODate();
  const [worked, setWorked] = useState("");
  const [adjust, setAdjust] = useState("");
  const [savedNote, setSavedNote] = useState(false);
  if (!ready) return <Loading />;
  const snapshot = progressSnapshot(journey, today, t);
  const bars = weekBars(journey, today, t);
  const dateText = (iso: string) => {
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(date.getTime())
      ? iso
      : date.toLocaleDateString(LOCALE_META[locale].htmlLang, { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" });
  };
  const maxCompleted = Math.max(1, ...bars.map((bar) => bar.completed));
  const maxChecks = Math.max(1, ...bars.map((bar) => bar.checks));
  return (
    <HabitFrame>
      <section className="stack">
        <h1>{t("My Progress")}</h1>
        <p>{t("Habits, completed actions, this week, milestones, and notes. A quiet day is not a failure, and nothing here promises a health result.")}</p>
      </section>
      <section className="card stack">
        <h2>{t("Habits")}</h2>
        {snapshot.habits.length === 0 ? <p>{t("No habits saved yet.")}</p> : (
          <ul className="record-list">
            {snapshot.habits.map((habit) => <li key={habit.id}>{habit.name}</li>)}
          </ul>
        )}
        <p>{t("Completed tiny actions saved: {count}", { count: snapshot.completed })}</p>
      </section>
      <section className="card stack">
        <h2>{t("This week")}</h2>
        {hasSavedChartData(journey) ? (
          <>
            <p>{t("Completed tiny actions. A day with no bar is a quiet day, not a failure.")}</p>
            <BarChart label={t("Completed tiny actions this week")} rows={bars.map((bar) => ({ label: bar.label, value: bar.completed }))} max={maxCompleted} />
            <p>{t("Saved check-ins.")}</p>
            <BarChart label={t("Saved check-ins this week")} rows={bars.map((bar) => ({ label: bar.label, value: bar.checks }))} max={maxChecks} />
          </>
        ) : (
          <p>{t("Charts appear after you save a check-in or a tiny action.")}</p>
        )}
      </section>
      <section className="card stack">
        <h2>{t("Milestones")}</h2>
        {snapshot.milestones.length === 0 ? <p>{t("Milestones appear as you save a journey, an action, or a note.")}</p> : (
          <ul className="record-list">
            {ACHIEVEMENTS.filter((item) => snapshot.milestones.includes(item.id)).map((item) => (
              <li key={item.id}><strong>{t(item.title)}</strong><p>{t(item.detail)}</p></li>
            ))}
          </ul>
        )}
      </section>
      <section className="card stack">
        <h2>{t("What worked")}</h2>
        {snapshot.worked.length === 0 ? <p>{t("Notes from check-ins and weekly reviews will show here.")}</p> : (
          <ul className="record-list">{snapshot.worked.map((item) => <li key={item}>{item}</li>)}</ul>
        )}
      </section>
      <section className="card stack">
        <h2>{t("What to adjust")}</h2>
        {snapshot.adjust.length === 0 ? <p>{t("When something gets in the way, it can be listed here without turning into a grade.")}</p> : (
          <ul className="record-list">{snapshot.adjust.map((item) => <li key={item}>{item}</li>)}</ul>
        )}
      </section>
      <section className="card stack">
        <h2>{t("Reflections")}</h2>
        {snapshot.reflections.length === 0 ? <p>{t("A weekly note will be listed here.")}</p> : (
          <ul className="record-list">
            {snapshot.reflections.map((note) => (
              <li key={note.date}>
                <strong>{dateText(note.date)}</strong>
                {note.worked ? <p>{t("Worked: {note}", { note: note.worked })}</p> : null}
                {note.adjust ? <p>{t("Adjust: {note}", { note: note.adjust })}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (sample) return;
          save(saveWeekNote(journey, { date: today, worked, adjust }));
          setSavedNote(true);
        }}
      >
        <h2>{t("Weekly review")}</h2>
        <label className="stack">
          <span>{t("What worked")}</span>
          <input type="text" value={worked} maxLength={160} onChange={(event) => setWorked(event.target.value)} />
        </label>
        <label className="stack">
          <span>{t("What to adjust")}</span>
          <input type="text" value={adjust} maxLength={160} onChange={(event) => setAdjust(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={sample || (worked.trim() === "" && adjust.trim() === "")}>
          {t("Save weekly note")}
        </button>
        {savedNote ? <p role="status">{t("Weekly note saved. Earlier achievements stay.")}</p> : null}
      </form>
    </HabitFrame>
  );
}

export function AchievementsView() {
  const { journey, ready } = useHabitJourney();
  const t = useT();
  const today = localISODate();
  if (!ready) return <Loading />;
  const earned = earnedAchievements(journey, today);
  return (
    <HabitFrame>
      <section className="stack">
        <h1>{t("My Achievements")}</h1>
        <p>{t("These mark what you saved. A missed day is not a failure and does not wipe them.")}</p>
        {showRestart(journey, today) ? <p className="banner" role="status">{t(RESTART_LINE)}</p> : null}
      </section>
      <ul className="record-list">
        {ACHIEVEMENTS.map((item) => {
          const on = earned.includes(item.id);
          return (
            <li className="card" key={item.id}>
              <strong>{t(item.title)}</strong>
              <p>{t(item.detail)}</p>
              <p>{on ? t("Saved.") : t("Still ahead, whenever you want it.")}</p>
            </li>
          );
        })}
      </ul>
    </HabitFrame>
  );
}

function BarChart({ rows, max, label }: { rows: { label: string; value: number }[]; max: number; label: string }) {
  const width = 320;
  const height = rows.length * 28;
  return (
    <svg className="quiz-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      {rows.map((row, index) => (
        <g key={`${row.label}-${index}`} transform={`translate(0 ${index * 28})`}>
          <text className="quiz-barLabel" y="16" x="0">{row.label}</text>
          <rect className="quiz-bar" x="48" y="4" height="14" width={row.value === 0 ? 0 : Math.max(4, (row.value / max) * 200)} rx="4" />
          <text className="quiz-barLabel" y="16" x="260">{row.value}</text>
        </g>
      ))}
    </svg>
  );
}
