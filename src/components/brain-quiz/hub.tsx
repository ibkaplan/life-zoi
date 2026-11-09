"use client";

import Link from "next/link";
import { useState } from "react";
import { activitiesFor, CATEGORIES } from "@/lib/brain-quiz/catalog";
import { featuredRebus } from "@/lib/brain-quiz/daily";
import { localISODate } from "@/lib/dates";
import {
  badgesFor,
  JOURNEY_NOTE,
  QUIZ_NOTICE,
  QUIZ_TAGLINE,
  QUIZ_TITLE,
  type Difficulty,
} from "@/lib/brain-quiz/progress";
import { RebusArt } from "@/components/brain-quiz/rebus-art";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];

export function BrainQuizHub() {
  const { progress, storageNote, ready } = useBrainProgress();
  const [level, setLevel] = useState<Difficulty>("easy");
  const today = ready ? localISODate() : "2026-11-06";
  const featured = featuredRebus(today);
  const badges = badgesFor(progress);

  return (
    <div className="stack-lg">
      <section className={`hero-panel quiz-hero`}>
        <p className="kicker">LifeZoi</p>
        <h1>{QUIZ_TITLE}</h1>
        <p>{QUIZ_TAGLINE}</p>
        <p>
          Seven short games and a daily set of five. Points are for play: easy 10, medium 20, hard 30, and 25 more when a daily challenge is finished.
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/brain-quiz/daily">START DAILY CHALLENGE</Link>
          <Link className="btn btn-secondary" href="/brain-quiz/journey">My Brain Journey</Link>
          <Link className="btn btn-secondary" href="/brain-quiz/games">Sudoku, memory, and logic games</Link>
        </div>
      </section>
      <p className={"quiz-notice"}>{QUIZ_NOTICE}</p>
      <p className="hint">{storageNote} {JOURNEY_NOTE}</p>
      <section className="card stack">
        <h2>Difficulty</h2>
        <div className={"quiz-levels"}>
          {LEVELS.map((item) => (
            <button key={item} type="button" className={"quiz-level"} aria-pressed={level === item} onClick={() => setLevel(item)}>
              {item[0]?.toUpperCase()}{item.slice(1)} · {item === "easy" ? "10" : item === "medium" ? "20" : "30"} pts
            </button>
          ))}
        </div>
      </section>
      <section className={`card quiz-stats`} aria-label="Points summary">
        <p><strong>{progress.points}</strong> total points</p>
        <p><strong>{progress.correct}</strong> correct</p>
        <p><strong>{progress.games}</strong> games</p>
        <p><strong>{progress.streak}</strong> day streak</p>
        <p><strong>{progress.bestDay}</strong> personal best day</p>
        <p><strong>{badges.length}</strong> badges</p>
      </section>
      <section className="stack">
        <h2>Categories</h2>
        <div className={"quiz-cats"}>
          {CATEGORIES.map((category) => {
            const count = activitiesFor(category.id, level).length;
            return (
              <Link key={category.id} className={`card quiz-cat`} href={`/brain-quiz/${category.id}?level=${level}`}>
                <h3>{category.title}</h3>
                <p>{category.blurb}</p>
                <p className="hint">{count} at {level}</p>
              </Link>
            );
          })}
        </div>
      </section>
      {featured.kind === "rebus" ? (
        <section className="card stack">
          <h2>Featured puzzle</h2>
          <RebusArt layout={featured.rebus} />
          <p>A picture puzzle for today. The answer stays on the next screen until you check it.</p>
          <Link className="btn btn-secondary" href={`/brain-quiz/riddles/${featured.id}?level=${featured.difficulty}`}>
            Play this puzzle
          </Link>
        </section>
      ) : null}
    </div>
  );
}
