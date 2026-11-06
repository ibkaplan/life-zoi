import Link from "next/link";
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
  return (
    <div className="library stack-lg">
      <p className="kicker">Health Library</p>
      <h1>Movement library</h1>
      <p className="lede">
        Text and original drawings. The academy movement pages are still there. Nothing here is a new video, and a missed day is not a failure.
      </p>
      <MovementCheckList />
      <section className="stack">
        <h2>Programs</h2>
        <div className="library-grid">
          {movementPrograms.map((program) => (
            <Link key={program.slug} className="card learn-link" href={`/library/programs/${program.slug}`}>
              <h3>{program.title}</h3>
              <p>{program.summary}</p>
            </Link>
          ))}
        </div>
      </section>
      {MOVEMENT_GROUPS.map((group) => {
        const items = libraryExercises.filter((item) => item.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="stack">
            <h2>{group}</h2>
            {items.map((item) => (
              <Link key={item.slug} className="card learn-link" href={`/library/move/${item.slug}`}>
                <h3>{item.title}</h3>
                <p>
                  {item.difficulty}. {item.duration}
                </p>
              </Link>
            ))}
          </section>
        );
      })}
      <p>
        <Link href="/academy/move">Academy movement list</Link>
      </p>
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
    </div>
  );
}

export function ExerciseView({ slug }: { slug: string }) {
  const item = exerciseBySlug(slug);
  if (!item) return null;
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">{item.group}</p>
      <h1>{item.title}</h1>
      <MovementSketch kind={item.sketch} />
      <dl className="review-list">
        <div>
          <dt>Duration</dt>
          <dd>{item.duration}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>{item.difficulty}</dd>
        </div>
        <div>
          <dt>Equipment</dt>
          <dd>{item.equipment}</dd>
        </div>
      </dl>
      <h2>Instructions</h2>
      <ol>
        {item.instructions.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p>
        <strong>Beginner modification.</strong> {item.beginner}
      </p>
      <p>
        <strong>Seated alternative.</strong> {item.seated}
      </p>
      <p>
        <strong>Safety.</strong> {item.safety}
      </p>
      <p className="hint">{item.sourceNote}</p>
      {item.academyHref ? (
        <p>
          <Link href={item.academyHref}>Open the academy page for this movement</Link>
        </p>
      ) : null}
      <SessionLog checkId={moveCheckId(item.slug)} noun="session" />
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
      <p className="no-print">
        <Link href="/library/move">All movement</Link>
      </p>
    </article>
  );
}

export function ProgramView({ slug }: { slug: string }) {
  const program = programBySlug(slug);
  if (!program) return null;
  return (
    <article className="library library-sheet stack-lg">
      <p className="kicker">Text-guided program</p>
      <h1>{program.title}</h1>
      <p className="lede">{program.summary}</p>
      <p>
        <strong>About {program.minutes} minutes.</strong> Equipment: {program.equipment}
      </p>
      <ol className="stack">
        {program.blocks.map((block) => (
          <li key={`${block.minutes}-${block.text}`} className="card stack">
            <h2>About {block.minutes} minutes</h2>
            <p>{block.text}</p>
            <p>
              <strong>Seated alternative.</strong> {block.seated}
            </p>
          </li>
        ))}
      </ol>
      <p>
        <strong>Safety.</strong> {program.safety}
      </p>
      <SessionLog checkId={moveCheckId(program.slug)} noun="session" />
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
      <p className="no-print">
        <Link href="/library/move">All movement</Link>
      </p>
    </article>
  );
}
