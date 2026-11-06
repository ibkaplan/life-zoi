import Link from "next/link";
import { FOGG_URL, LIBRARY, MICHIE_URL, NOTICE, libraryBySlug } from "@/lib/habit-transformation/catalog";
import { partName } from "@/lib/habit-transformation/engine";

export function LibraryIndex() {
  return (
    <section className="stack">
      <h1>Habit library</h1>
      <p>Short explanations in LifeZoi’s own words. Each one names a small action, a COM-B barrier, and a public source.</p>
      <div className="feature-grid">
        {LIBRARY.map((entry) => (
          <Link key={entry.slug} className="card learn-link" href={`/habit-transformation/library/${entry.slug}`}>
            <h2>{entry.title}</h2>
            <p>{entry.barrierPlain}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LibraryDetail({ slug }: { slug: string }) {
  const entry = libraryBySlug(slug);
  if (!entry) return null;
  return (
    <article className="stack">
      <p><Link href="/habit-transformation/library">Habit library</Link></p>
      <h1>{entry.title}</h1>
      <p>{entry.explanation}</p>
      <section className="card stack">
        <h2>Example</h2>
        <p>{entry.example}</p>
        <h2>Small action</h2>
        <p>{entry.action}</p>
        <h2>COM-B barrier</h2>
        <p>{partName(entry.barrier)}. {entry.barrierPlain}</p>
      </section>
      <p>
        <a href={entry.sourceUrl}>{entry.sourceName}: {entry.sourceTitle}</a>
      </p>
    </article>
  );
}

export function ScienceBody() {
  return (
    <article className="stack">
      <h1>The Science Behind</h1>
      <p>
        Susan Michie, Maartje M. van Stralen, and Robert West described COM-B in 2011. The idea is plain enough to use at home: a behavior is more likely when capability, opportunity, and motivation are present together. LifeZoi uses that idea as a lens for everyday habits.
      </p>
      <p>
        <a href={MICHIE_URL}>Michie, van Stralen, and West (2011), Implementation Science</a>
      </p>
      <section className="card stack">
        <h2>Capability</h2>
        <p>Capability is the skill, energy, and know-how a step asks for. A step that is hard to picture is a capability question, not a verdict on the person.</p>
        <h2>Opportunity</h2>
        <p>Opportunity is the time, the place, the tools, and the people around the step. A packed day or a cue sitting on the counter can matter as much as intention.</p>
        <h2>Motivation</h2>
        <p>Motivation is the reason you care, and also the pull of the habit in the moment. Both can be true. Neither is a score.</p>
        <h2>Behavior</h2>
        <p>Behavior is the habit you chose. Changing it can start with one of the other three. The reading on your plan says what may be making the habit difficult. It is not a diagnosis, and it is not clinically validated.</p>
      </section>
      <section className="card stack">
        <h2>A prompt, ability, and motivation</h2>
        <p>
          BJ Fogg’s behavior model says a behavior tends to happen when motivation, ability, and a prompt come together. A tiny action asks for less ability. A prompt can be something you already do. LifeZoi uses that idea in the sentence “After I [existing routine], I will [small new action].”
        </p>
        <p>These are the concepts only. This page does not quote his book.</p>
        <p>
          <a href={FOGG_URL}>Fogg Behavior Model, Stanford Behavior Design Lab</a>
        </p>
      </section>
      <p className="hint" role="note">{NOTICE}</p>
    </article>
  );
}
