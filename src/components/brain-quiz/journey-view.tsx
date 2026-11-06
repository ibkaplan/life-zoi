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
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";

export function JourneyView() {
  const { progress, storageNote, ready } = useBrainProgress();
  if (!ready) return <p className="card">Loading your journey…</p>;
  const today = localISODate();
  const week = weekActivity(progress, today);
  const favorite = favoriteCategory(progress);
  const badges = badgesFor(progress);
  const favoriteName = CATEGORIES.find((item) => item.id === favorite)?.title ?? "None yet";
  const maxPoints = Math.max(1, ...CATEGORIES.map((item) => progress.byCategory[item.id].points));
  const maxPlays = Math.max(1, ...week.map((day) => day.plays));

  return (
    <div className="stack-lg">
      <p><Link href="/brain-quiz">Back to Brain & Habit Quiz</Link></p>
      <section className="stack">
        <p className="kicker">My Brain Journey</p>
        <h1>What you have played</h1>
        <p>{JOURNEY_NOTE}</p>
        <p className="hint">{storageNote}</p>
      </section>
      <section className={`card quiz-stats`}>
        <p><strong>{progress.points}</strong> points</p>
        <p><strong>{progress.games}</strong> games</p>
        <p><strong>{progress.correct}</strong> correct</p>
        <p><strong>{progress.streak}</strong> current streak</p>
        <p><strong>{progress.bestStreak}</strong> best streak</p>
        <p><strong>{progress.bestDaily}</strong> best daily score</p>
      </section>
      <section className="card stack">
        <h2>Points by category</h2>
        <BarChart rows={CATEGORIES.map((item) => ({ label: item.title, value: progress.byCategory[item.id].points }))} max={maxPoints} />
      </section>
      <section className="card stack">
        <h2>Accuracy by category</h2>
        <table className="data-table">
          <thead><tr><th>Category</th><th>Correct</th><th>Played</th><th>Accuracy</th></tr></thead>
          <tbody>
            {CATEGORIES.map((item) => {
              const stats = progress.byCategory[item.id];
              const accuracy = stats.played === 0 ? "Not yet" : `${Math.round((stats.correct / stats.played) * 100)}%`;
              return <tr key={item.id}><td>{item.title}</td><td>{stats.correct}</td><td>{stats.played}</td><td>{accuracy}</td></tr>;
            })}
          </tbody>
        </table>
        <p>Favorite category: {favoriteName}.</p>
      </section>
      <section className="card stack">
        <h2>Difficulties</h2>
        <table className="data-table">
          <thead><tr><th>Level</th><th>Played</th><th>Correct</th></tr></thead>
          <tbody>
            {(["easy", "medium", "hard"] as const).map((level) => (
              <tr key={level}><td>{level}</td><td>{progress.byDifficulty[level].played}</td><td>{progress.byDifficulty[level].correct}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card stack">
        <h2>This week</h2>
        <BarChart rows={week.map((day) => ({ label: day.date.slice(5), value: day.plays }))} max={maxPlays} />
      </section>
      <section className="card stack">
        <h2>Daily history</h2>
        {progress.dailyScores.length === 0 ? <p>Finished daily challenges will show up here.</p> : (
          <ul className="record-list">
            {progress.dailyScores.map((item) => (
              <li key={item.date}><strong>{item.date}</strong><p>{item.score} points · {item.correct} correct</p></li>
            ))}
          </ul>
        )}
      </section>
      <section className="card stack">
        <h2>Achievements</h2>
        {badges.length === 0 ? <p>Badges appear after you play.</p> : (
          <ul className="record-list">
            {badges.map((badge) => <li key={badge.id}><strong>{badge.title}</strong><p>{badge.detail}</p></li>)}
          </ul>
        )}
      </section>
    </div>
  );
}

function BarChart({ rows, max }: { rows: { label: string; value: number }[]; max: number }) {
  const width = 320;
  const height = rows.length * 28;
  return (
    <svg className={"quiz-chart"} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart of saved play">
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
