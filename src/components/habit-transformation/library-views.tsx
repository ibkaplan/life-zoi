"use client";

import Link from "next/link";
import { useLocale, useT } from "@/components/locale-provider";
import { FOGG_URL, LIBRARY, MICHIE_URL, NOTICE, libraryBySlug } from "@/lib/habit-transformation/catalog";
import { partName } from "@/lib/habit-transformation/engine";

export function LibraryIndex() {
  const t = useT();
  return (
    <section className="stack">
      <h1>{t("Habit library")}</h1>
      <p>{t("Short explanations in LifeZoi’s own words. Each one names a small action, a COM-B barrier, and a public source.")}</p>
      <div className="feature-grid">
        {LIBRARY.map((entry) => (
          <Link key={entry.slug} className="card learn-link" href={`/habit-transformation/library/${entry.slug}`}>
            <h2>{t(entry.title)}</h2>
            <p>{t(entry.barrierPlain)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LibraryDetail({ slug }: { slug: string }) {
  const t = useT();
  const entry = libraryBySlug(slug);
  if (!entry) return null;
  return (
    <article className="stack">
      <p><Link href="/habit-transformation/library">{t("Habit library")}</Link></p>
      <h1>{t(entry.title)}</h1>
      <p>{t(entry.explanation)}</p>
      <section className="card stack">
        <h2>{t("Example")}</h2>
        <p>{t(entry.example)}</p>
        <h2>{t("Small action")}</h2>
        <p>{t(entry.action)}</p>
        <h2>{t("COM-B barrier")}</h2>
        <p>{partName(entry.barrier, t)}. {t(entry.barrierPlain)}</p>
      </section>
      <p>
        <a href={entry.sourceUrl} lang="en">{entry.sourceName}: {entry.sourceTitle}</a>
        <EnglishSourceNote />
      </p>
    </article>
  );
}

export function ScienceBody() {
  const t = useT();
  return (
    <article className="stack">
      <h1>{t("The Science Behind")}</h1>
      <p>
        {t("Susan Michie, Maartje M. van Stralen, and Robert West described COM-B in 2011. The idea is plain enough to use at home: a behavior is more likely when capability, opportunity, and motivation are present together. LifeZoi uses that idea as a lens for everyday habits.")}
      </p>
      <p>
        <a href={MICHIE_URL} lang="en">Michie, van Stralen, and West (2011), Implementation Science</a><EnglishSourceNote />
      </p>
      <section className="card stack">
        <h2>{t("Capability")}</h2>
        <p>{t("Capability is the skill, energy, and know-how a step asks for. A step that is hard to picture is a capability question, not a verdict on the person.")}</p>
        <h2>{t("Opportunity")}</h2>
        <p>{t("Opportunity is the time, the place, the tools, and the people around the step. A packed day or a cue sitting on the counter can matter as much as intention.")}</p>
        <h2>{t("Motivation")}</h2>
        <p>{t("Motivation is the reason you care, and also the pull of the habit in the moment. Both can be true. Neither is a score.")}</p>
        <h2>{t("Behavior")}</h2>
        <p>{t("Behavior is the habit you chose. Changing it can start with one of the other three. The reading on your plan says what may be making the habit difficult. It is not a diagnosis, and it is not clinically validated.")}</p>
      </section>
      <section className="card stack">
        <h2>{t("A prompt, ability, and motivation")}</h2>
        <p>
          {t("BJ Fogg’s behavior model says a behavior tends to happen when motivation, ability, and a prompt come together. A tiny action asks for less ability. A prompt can be something you already do. LifeZoi uses that idea in the sentence “After I [existing routine], I will [small new action].”")}
        </p>
        <p>{t("These are the concepts only. This page does not quote his book.")}</p>
        <p>
          <a href={FOGG_URL} lang="en">Fogg Behavior Model, Stanford Behavior Design Lab</a><EnglishSourceNote />
        </p>
      </section>
      <p className="hint" role="note">{t(NOTICE)}</p>
    </article>
  );
}

/** Shown next to an English-language source when the page is in another language. */
function EnglishSourceNote() {
  const t = useT();
  const { locale } = useLocale();
  if (locale === "en") return null;
  return <span className="hint"> {t("(source in English)")}</span>;
}
