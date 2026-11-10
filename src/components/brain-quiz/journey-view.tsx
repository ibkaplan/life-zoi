"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/brain-quiz/catalog";
import { localISODate } from "@/lib/dates";
import {
  badgesFor,
  favoriteCategory,
  JOURNEY_NOTE,
  weekActivity,
} from "@/lib/brain-quiz/progress";
import { StatLine } from "@/components/brain-quiz/stat-line";
import { msg } from "@/lib/i18n/translate";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { useT } from "@/components/locale-provider";

export function JourneyView() {
  const t = useT();
  const { progress, storageNote, ready } = useBrainProgress();
  if (!ready) return <p className="card">{t("Loading your journey…")}</p>;
  const today = localISODate();
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
        <StatLine value={progress.games} label={msg("{count} games")} />
        <StatLine value={progress.correct} label={msg("{count} correct")} />
        <StatLine value={progress.streak} label={msg("{count} current streak")} />
        <StatLine value={progress.bestStreak} label={msg("{count} best streak")} />
        <StatLine value={progress.bestDaily} label={msg("{count} best daily score")} />
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
          <thead><tr><th>{t("Level")}</th><th>{t("Played")}</th><th>{t("Correct")}</th></tr></thead>
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
