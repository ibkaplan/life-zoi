"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/brain-quiz/catalog";
import {
  activityCalendar,
  badgesFor,
  favoriteCategory,
  JOURNEY_NOTE,
  liveStreak,
  nextMilestones,
  weekActivity,
  weeklyHistory,
  type CalendarDay,
  type WeekSummary,
} from "@/lib/brain-quiz/progress";
import { useLocalToday } from "@/components/brain-quiz/use-local-today";
import { StatLine } from "@/components/brain-quiz/stat-line";
import { msg } from "@/lib/i18n/translate";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { useT } from "@/components/locale-provider";

export function JourneyView() {
  const t = useT();
  const { progress, storageNote, ready } = useBrainProgress();
  const today = useLocalToday();
  if (!ready || !today) return <p className="card">{t("Loading your journey…")}</p>;
  const weeks = weeklyHistory(progress, today, 12);
  const calendar = activityCalendar(progress, today, 12);
  const milestones = nextMilestones(progress);
  const history = progress.days.filter((day) => day.plays > 0 || day.points > 0).slice(0, 60);
  const dailyByDate = new Map(progress.dailyScores.map((item) => [item.date, item]));
  const answers = progress.right + progress.wrong;
  const week = weekActivity(progress, today);
  const favorite = favoriteCategory(progress);
  const badges = badgesFor(progress);
  const favoriteName = t(CATEGORIES.find((item) => item.id === favorite)?.title ?? "None yet");
  const maxPoints = Math.max(1, ...CATEGORIES.map((item) => progress.byCategory[item.id].points));
  const maxPlays = Math.max(1, ...week.map((day) => day.plays));

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">{t("Back to Brain & Habit Quiz")}</Link></p>
      <section className="stack">
        <p className="kicker">{t("My Brain Journey")}</p>
        <h1>{t("What you have played")}</h1>
        <p>{t(JOURNEY_NOTE)}</p>
        <p className="hint">{t(storageNote)}</p>
      </section>
      <section className={`card quiz-stats`}>
        <StatLine value={progress.points} label={msg("{count} points")} />
        <StatLine value={answers} label={msg("{count} questions answered")} />
        <StatLine value={progress.right} label={msg("{count} right answers")} />
        <StatLine value={progress.wrong} label={msg("{count} not right this time")} />
        <StatLine value={progress.dailyDone.length} label={msg("{count} daily challenges completed")} />
        <StatLine value={progress.games} label={msg("{count} games")} />
        <StatLine value={liveStreak(progress, today)} label={msg("{count} current streak")} />
        <StatLine value={progress.bestStreak} label={msg("{count} best streak")} />
        <StatLine value={progress.bestDaily} label={msg("{count} best daily score")} />
      </section>
      <section className="card stack">
        <h2>{t("Next milestones")}</h2>
        <ul className="quiz-milestones">
          {milestones.map((item) => (
            <li key={item.id}>
              <p className="progress-label"><span>{t(item.label, { value: item.value, target: item.target })}</span></p>
              <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={item.target} aria-valuenow={Math.min(item.value, item.target)} aria-label={t(item.label, { value: item.value, target: item.target })}>
                <span style={{ width: `${Math.min(100, (item.value / Math.max(1, item.target)) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className="card stack">
        <h2>{t("Days you played")}</h2>
        <p className="hint">{t("The last 12 weeks. Darker squares mean more play that day; a ring marks a finished daily challenge.")}</p>
        <CalendarChart days={calendar} />
      </section>
      <section className="card stack">
        <h2>{t("Points by week")}</h2>
        <WeekChart weeks={weeks} value={(week) => week.points} label={(week) => t("Week of {date}: {count} points", { date: week.start, count: week.points })} />
      </section>
      <section className="card stack">
        <h2>{t("Answers by week")}</h2>
        {weeks.every((week) => week.activeDays === 0) ? <p>{t("Weeks you play will show up here.")}</p> : (
          <ul className="record-list">
            {[...weeks].reverse().filter((week) => week.activeDays > 0).map((week) => (
              <li key={week.start}>
                <strong>{t("Week of {date}", { date: week.start })}</strong>
                <p>{t("{days} days played · {right} right · {wrong} not right · {dailies} daily challenges", { days: week.activeDays, right: week.right, wrong: week.wrong, dailies: week.dailies })}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card stack">
        <h2>{t("Points by category")}</h2>
        <BarChart rows={CATEGORIES.map((item) => ({ label: t(item.title), value: progress.byCategory[item.id].points }))} max={maxPoints} />
      </section>
      <section className="card stack">
        <h2>{t("Accuracy by category")}</h2>
        <table className="data-table">
          <thead><tr><th>{t("Category")}</th><th>{t("Correct")}</th><th>{t("Played")}</th><th>{t("Accuracy")}</th></tr></thead>
          <tbody>
            {CATEGORIES.map((item) => {
              const stats = progress.byCategory[item.id];
              const accuracy = stats.played === 0 ? t("Not yet") : `${Math.round((stats.correct / stats.played) * 100)}%`;
              return <tr key={item.id}><td>{t(item.title)}</td><td>{stats.correct}</td><td>{stats.played}</td><td>{accuracy}</td></tr>;
            })}
          </tbody>
        </table>
        <p>{t("Favorite category: {name}.", { name: favoriteName })}</p>
      </section>
      <section className="card stack">
        <h2>{t("Difficulties")}</h2>
        <table className="data-table">
          <thead><tr><th>{t("Level")}</th><th>{t("Played")}</th><th>{t("Completed correctly")}</th></tr></thead>
          <tbody>
            {(["easy", "medium", "hard"] as const).map((level) => (
              <tr key={level}><td>{t(level)}</td><td>{progress.byDifficulty[level].played}</td><td>{progress.byDifficulty[level].correct}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card stack">
        <h2>{t("This week")}</h2>
        <BarChart rows={week.map((day) => ({ label: day.date.slice(5), value: day.plays }))} max={maxPlays} />
      </section>
      <section className="card stack">
        <h2>{t("Activity history")}</h2>
        {history.length === 0 ? <p>{t("Days you play will show up here.")}</p> : (
          <ul className="record-list">
            {history.map((day) => {
              const daily = dailyByDate.get(day.date);
              return (
                <li key={day.date}>
                  <strong>{day.date === today ? t("Today") : day.date}</strong>
                  <p>{t("{points} points · {right} right · {wrong} not right", { points: day.points, right: day.right, wrong: day.wrong })}</p>
                  <p className="hint">{daily ? t("Daily challenge finished: {score} points · {correct} correct", { score: daily.score, correct: daily.correct }) : t("Daily challenge not finished")}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section className="card stack">
        <h2>{t("Daily history")}</h2>
        {progress.dailyScores.length === 0 ? <p>{t("Finished daily challenges will show up here.")}</p> : (
          <ul className="record-list">
            {progress.dailyScores.map((item) => (
              <li key={item.date}><strong>{item.date}</strong><p>{t("{score} points · {correct} correct", { score: item.score, correct: item.correct })}</p></li>
            ))}
          </ul>
        )}
      </section>
      <section className="card stack">
        <h2>{t("Achievements")}</h2>
        {badges.length === 0 ? <p>{t("Badges appear after you play.")}</p> : (
          <ul className="record-list">
            {badges.map((badge) => <li key={badge.id}><strong>{t(badge.title)}</strong><p>{t(badge.detail)}</p></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}

function BarChart({ rows, max }: { rows: { label: string; value: number }[]; max: number }) {
  const t = useT();
  const width = 320;
  const height = rows.length * 28;
  return (
    <svg className={"quiz-chart"} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={t("Bar chart of saved play")}>
      {rows.map((row, index) => (
        <g key={row.label} transform={`translate(0 ${index * 28})`}>
          <text className={"quiz-barLabel"} y="16" x="0">{row.label}</text>
          <rect className={"quiz-bar"} x="108" y="4" height="14" width={Math.max(2, (row.value / max) * 160)} rx="4" />
          <text className={"quiz-barLabel"} y="16" x="276">{row.value}</text>
        </g>
      ))}
    </svg>
  );
}

function WeekChart({ weeks, value, label }: { weeks: WeekSummary[]; value: (week: WeekSummary) => number; label: (week: WeekSummary) => string }) {
  const t = useT();
  const width = 336;
  const height = 150;
  const max = Math.max(1, ...weeks.map(value));
  const slot = width / Math.max(1, weeks.length);
  const bar = Math.max(6, slot - 8);
  return (
    <svg className="quiz-chart quiz-weeks" viewBox={`0 0 ${width} ${height + 22}`} role="img" aria-label={t("Column chart of points by week")}>
      <line x1="0" x2={width} y1={height} y2={height} className="quiz-axis" />
      {weeks.map((week, index) => {
        const amount = value(week);
        const h = amount === 0 ? 0 : Math.max(3, (amount / max) * (height - 18));
        const x = index * slot + (slot - bar) / 2;
        return (
          <g key={week.start}>
            <title>{label(week)}</title>
            <rect x={index * slot} y={0} width={slot} height={height} fill="transparent" />
            {h > 0 ? <rect className="quiz-bar" x={x} y={height - h} width={bar} height={h} rx="4" /> : null}
            {index === weeks.length - 1 || index % 3 === 0 ? (
              <text className="quiz-barLabel" x={x + bar / 2} y={height + 16} textAnchor="middle">{week.start.slice(5)}</text>
            ) : null}
            {index === weeks.length - 1 && amount > 0 ? (
              <text className="quiz-barLabel" x={x + bar / 2} y={height - h - 4} textAnchor="middle">{amount}</text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

function CalendarChart({ days }: { days: CalendarDay[] }) {
  const t = useT();
  const cell = 22;
  const gap = 4;
  const weeks = Math.ceil(days.length / 7);
  const max = Math.max(1, ...days.map((day) => day.plays));
  const level = (plays: number) => (plays === 0 ? 0 : Math.min(4, Math.ceil((plays / max) * 4)));
  return (
    <svg className="quiz-chart quiz-calendar" viewBox={`0 0 ${weeks * (cell + gap)} ${7 * (cell + gap)}`} role="img" aria-label={t("Calendar of the days you played")}>
      {days.map((day, index) => {
        const col = Math.floor(index / 7);
        const row = index % 7;
        return (
          <rect
            key={day.date}
            className={`quiz-day quiz-day${level(day.plays)}${day.daily ? " quiz-dayDaily" : ""}`}
            x={col * (cell + gap)}
            y={row * (cell + gap)}
            width={cell}
            height={cell}
            rx="4"
          >
            <title>{day.daily ? t("{date}: {count} played, daily challenge finished", { date: day.date, count: day.plays }) : t("{date}: {count} played", { date: day.date, count: day.plays })}</title>
          </rect>
        );
      })}
    </svg>
  );
}
