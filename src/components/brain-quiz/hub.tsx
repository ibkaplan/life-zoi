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
import { msg } from "@/lib/i18n/translate";
import { StatLine } from "@/components/brain-quiz/stat-line";
import { useBrainProgress } from "@/components/brain-quiz/use-brain-progress";
import { useLocale } from "@/components/locale-provider";
import { localizeActivity } from "@/lib/brain-quiz/localize";

const LEVELS: Difficulty[] = ["easy", "medium", "hard"];
const LEVEL_NAMES: Record<Difficulty, string> = { easy: msg("Easy"), medium: msg("Medium"), hard: msg("Hard") };

export function BrainQuizHub() {
  const { locale, t } = useLocale();
  const { progress, storageNote, ready } = useBrainProgress();
  const [level, setLevel] = useState<Difficulty>("easy");
  const today = ready ? localISODate() : "2026-11-06";
  const featured = localizeActivity(featuredRebus(today), locale);
  const badges = badgesFor(progress);

  return (
    <div className="stack-lg">
      <section className={`hero-panel quiz-hero`}>
        <p className="kicker">LifeZoi</p>
        <h1>{t(QUIZ_TITLE)}</h1>
        <p>{t(QUIZ_TAGLINE)}</p>
        <p>
          {t("Seven short games and a daily set of five. Points are for play: easy 10, medium 20, hard 30, and 25 more when a daily challenge is finished.")}
        </p>
        <div className="actions">
          <Link className="btn btn-primary" href="/brain-quiz/daily">{t("START DAILY CHALLENGE")}</Link>
          <Link className="btn btn-secondary" href="/brain-quiz/journey">{t("My Brain Journey")}</Link>
          <Link className="btn btn-secondary" href="/brain-quiz/games">{t("Sudoku, memory, and logic games")}</Link>
        </div>
      </section>
      <p className={"quiz-notice"}>{t(QUIZ_NOTICE)}</p>
      <p className="hint">{t(storageNote)} {t(JOURNEY_NOTE)}</p>
      <section className="card stack">
        <h2>{t("Difficulty")}</h2>
        <div className={"quiz-levels"}>
          {LEVELS.map((item) => (
            <button key={item} type="button" className={"quiz-level"} aria-pressed={level === item} onClick={() => setLevel(item)}>
              {t("{level} · {points} pts", { level: t(LEVEL_NAMES[item]), points: item === "easy" ? "10" : item === "medium" ? "20" : "30" })}
            </button>
          ))}
        </div>
      </section>
      <section className={`card quiz-stats`} aria-label={t("Points summary")}>
        <StatLine value={progress.points} label={msg("{count} total points")} />
        <StatLine value={progress.correct} label={msg("{count} correct")} />
        <StatLine value={progress.games} label={msg("{count} games")} />
        <StatLine value={progress.streak} label={msg("{count} day streak")} />
        <StatLine value={progress.bestDay} label={msg("{count} personal best day")} />
        <StatLine value={badges.length} label={msg("{count} badges")} />
      </section>
      <section className="stack">
        <h2>{t("Categories")}</h2>
        <div className={"quiz-cats"}>
          {CATEGORIES.map((category) => {
            const count = activitiesFor(category.id, level).length;
            return (
              <Link key={category.id} className={`card quiz-cat`} href={`/brain-quiz/${category.id}?level=${level}`}>
                <h3>{t(category.title)}</h3>
                <p>{t(category.blurb)}</p>
                <p className="hint">{t("{count} at {level}", { count, level: t(level) })}</p>
              </Link>
            );
          })}
        </div>
      </section>
      {featured.kind === "rebus" ? (
        <section className="card stack">
          <h2>{t("Featured puzzle")}</h2>
          <RebusArt layout={featured.rebus} />
          <p>{t("A picture puzzle for today. The answer stays on the next screen until you check it.")}</p>
          <Link className="btn btn-secondary" href={`/brain-quiz/riddles/${featured.id}?level=${featured.difficulty}`}>
            {t("Play this puzzle")}
          </Link>
        </section>
      ) : null}
    </div>
  );
}
