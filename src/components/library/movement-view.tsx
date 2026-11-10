"use client";

import Link from "next/link";
import { useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { MovementSketch } from "@/components/library/art";
import { MovementCheckList, SessionLog } from "@/components/library/session-tools";
import { moveCheckId } from "@/lib/library/ids";
import { LIBRARY_DISCLAIMER } from "@/lib/library/catalog";
import {
  MOVEMENT_GROUPS,
  exerciseBySlug,
  libraryExercises,
  movementPrograms,
  programBySlug,
} from "@/lib/library/movement";

export function MovementLibrary() {
  const t = useT();
  return (
    <div className="library stack-lg">
      <p className="kicker">{t("Health Library")}</p>
      <h1>{t("Movement library")}</h1>
      <p className="lede">
        {t(
          "Text and original drawings. The academy movement pages are still there. Nothing here is a new video, and a missed day is not a failure.",
        )}
      </p>
      <MovementCheckList />
      <section className="stack">
        <h2>{t("Programs")}</h2>
        <div className="library-grid">
          {movementPrograms.map((program) => (
            <Link key={program.slug} className="card learn-link" href={`/library/programs/${program.slug}`}>
              <h3>{t(program.title)}</h3>
              <p>{t(program.summary)}</p>
            </Link>
          ))}
        </div>
      </section>
      {MOVEMENT_GROUPS.map((group) => {
        const items = libraryExercises.filter((item) => item.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="stack">
            <h2>{t(group)}</h2>
            {items.map((item) => (
              <Link key={item.slug} className="card learn-link" href={`/library/move/${item.slug}`}>
                <h3>{t(item.title)}</h3>
                <p>{t("{difficulty}. {duration}", { difficulty: t(item.difficulty), duration: t(item.duration) })}</p>
              </Link>
            ))}
          </section>
        );
      })}
      <p>
        <Link href="/academy/move">{t("Academy movement list")}</Link>
      </p>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
    </div>
  );
}

export function ExerciseView({ slug }: { slug: string }) {
  const t = useT();
  const item = exerciseBySlug(slug);
  if (!item) return null;
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">{t(item.group)}</p>
      <h1>{t(item.title)}</h1>
      <MovementSketch kind={item.sketch} />
      <dl className="review-list">
        <div>
          <dt>{t("Duration")}</dt>
          <dd>{t(item.duration)}</dd>
        </div>
        <div>
          <dt>{t("Difficulty")}</dt>
          <dd>{t(item.difficulty)}</dd>
        </div>
        <div>
          <dt>{t("Equipment")}</dt>
          <dd>{t(item.equipment)}</dd>
        </div>
      </dl>
      <h2>{t("Instructions")}</h2>
      <ol>
        {item.instructions.map((step) => (
          <li key={step}>{t(step)}</li>
        ))}
      </ol>
      <p>
        <strong>{t("Beginner modification.")}</strong> {t(item.beginner)}
      </p>
      <p>
        <strong>{t("Seated alternative.")}</strong> {t(item.seated)}
      </p>
      <p>
        <strong>{t("Safety.")}</strong> {t(item.safety)}
      </p>
      <p className="hint">{t(item.sourceNote)}</p>
      {item.academyHref ? (
        <p>
          <Link href={item.academyHref}>{t("Open the academy page for this movement")}</Link>
        </p>
      ) : null}
      <SessionLog checkId={moveCheckId(item.slug)} noun={msg("session")} />
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
      <p className="no-print">
        <Link href="/library/move">{t("All movement")}</Link>
      </p>
    </article>
  );
}

export function ProgramView({ slug }: { slug: string }) {
  const t = useT();
  const program = programBySlug(slug);
  if (!program) return null;
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">{t("Text-guided program")}</p>
      <h1>{t(program.title)}</h1>
      <p className="lede">{t(program.summary)}</p>
      <p>
        <strong>{t("About {minutes} minutes.", { minutes: program.minutes })}</strong>{" "}
        {t("Equipment: {equipment}", { equipment: t(program.equipment) })}
      </p>
      <ol className="stack">
        {program.blocks.map((block) => (
          <li key={`${block.minutes}-${block.text}`} className="card stack">
            <h2>{t("About {minutes} minutes", { minutes: block.minutes })}</h2>
            <p>{t(block.text)}</p>
            <p>
              <strong>{t("Seated alternative.")}</strong> {t(block.seated)}
            </p>
          </li>
        ))}
      </ol>
      <p>
        <strong>{t("Safety.")}</strong> {t(program.safety)}
      </p>
      <SessionLog checkId={moveCheckId(program.slug)} noun={msg("session")} />
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
      <p className="no-print">
        <Link href="/library/move">{t("All movement")}</Link>
      </p>
    </article>
  );
}
