"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useT } from "@/components/locale-provider";
import { LibraryArt } from "@/components/library/art";
import { msg, type Translate } from "@/lib/i18n/translate";
import { hardMoments } from "@/lib/library/lessons";
import { libraryExercises } from "@/lib/library/movement";
import {
  LIBRARY_BRAND,
  LIBRARY_DISCLAIMER,
  LIBRARY_HEADLINE,
  LIBRARY_SUBTITLE,
  filterLibrary,
  libraryCategories,
  searchHits,
  type SearchHit,
  type SearchKind,
} from "@/lib/library/catalog";

const kinds: { id: SearchKind | "all"; label: string }[] = [
  { id: "all", label: msg("All") },
  { id: "article", label: msg("Articles") },
  { id: "guide", label: msg("Guides") },
  { id: "recipe", label: msg("Recipes") },
  { id: "exercise", label: msg("Exercises") },
  { id: "video", label: msg("Videos") },
  { id: "pdf", label: msg("PDFs") },
];

/** The type names under each search result, in English as they were shown before. */
const KIND_NAMES: Record<SearchKind, string> = {
  article: msg("article"),
  guide: msg("guide"),
  recipe: msg("recipe"),
  exercise: msg("exercise"),
  video: msg("video"),
  pdf: msg("pdf"),
};

/** A search result in the chosen language. Some English results are built from pieces, so they are rebuilt here. */
function shownHit(hit: SearchHit, t: Translate): { title: string; text: string } {
  if (hit.id.startsWith("exercise-")) {
    const item = libraryExercises.find((exercise) => `exercise-${exercise.slug}` === hit.id);
    if (item) return { title: t(item.title), text: t("{group}. {duration}", { group: t(item.group), duration: t(item.duration) }) };
  }
  if (hit.id.startsWith("moment-")) {
    const moment = hardMoments.find((item) => `moment-${item.slug}` === hit.id);
    if (moment) return { title: t("Having a hard moment: {title}", { title: t(moment.title) }), text: t(moment.body[0]) };
  }
  return { title: t(hit.title), text: t(hit.text) };
}

/** Matches what the person types against the English and the translated text. */
function findHits(query: string, kind: SearchKind | "all", t: Translate) {
  const needle = query.trim().toLocaleLowerCase();
  const english = new Set(filterLibrary(query, kind).map((hit) => hit.id));
  return searchHits()
    .filter((hit) => kind === "all" || hit.kinds.includes(kind))
    .map((hit) => ({ hit, shown: shownHit(hit, t) }))
    .filter(({ hit, shown }) => !needle || english.has(hit.id) || `${shown.title} ${shown.text}`.toLocaleLowerCase().includes(needle));
}

export function LibraryHome() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | "all">("all");
  const hits = useMemo(() => findHits(query, kind, t), [query, kind, t]);
  const showHits = query.trim().length > 0 || kind !== "all";

  return (
    <div className="library stack-lg">
      <header className="hero-panel">
        <p className="library-kicker">{t("Health Library")}</p>
        <h1>{t(LIBRARY_HEADLINE)}</h1>
        <p>{t(LIBRARY_SUBTITLE)}</p>
        <p className="library-brand">{t(LIBRARY_BRAND)}</p>
        <p>{t("Free to read. No account is required.")}</p>
      </header>
      <p className="library-disclaimer">{t(LIBRARY_DISCLAIMER)}</p>
      <section className="stack">
        <h2>{t("Search the library")}</h2>
        <label className="field">
          <span>{t("Search articles, guides, recipes, exercises, and PDFs")}</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Try fiber, chair, or sleep")} />
        </label>
        <div className="actions" role="group" aria-label={t("Filter by type")}>
          {kinds.map((item) => (
            <button
              key={item.id}
              className={kind === item.id ? "btn btn-primary" : "btn btn-secondary"}
              type="button"
              aria-pressed={kind === item.id}
              onClick={() => setKind(item.id)}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
        {showHits ? (
          <div className="stack">
            {hits.length === 0 ? (
              <p>
                {kind === "video"
                  ? t("This library does not host videos. Movement is text and original drawings.")
                  : t("Nothing in this library matches that filter.")}
              </p>
            ) : (
              hits.slice(0, 40).map(({ hit, shown }) => (
                <Link key={hit.id} className="card learn-link" href={hit.href}>
                  <h3>{shown.title}</h3>
                  <p>{shown.text}</p>
                  <p className="hint">{hit.kinds.map((item) => t(KIND_NAMES[item])).join(", ")}</p>
                </Link>
              ))
            )}
          </div>
        ) : null}
      </section>
      <section className="stack">
        <h2>{t("Categories")}</h2>
        <div className="library-grid">
          {libraryCategories.map((category) => (
            <article key={category.slug} className="card stack">
              <LibraryArt name={category.art} label={t("Illustration for {title}", { title: t(category.title) })} />
              <h3>
                <Link href={`/library/topics/${category.slug}`}>{t(category.title)}</Link>
              </h3>
              <p>{t(category.description)}</p>
              <ul>
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{t(link.label)}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2>{t("Illustrated ideas")}</h2>
        <p>{t("These drawings were made for lifeZoi. They are illustrations, not testimonials, and they are not results.")}</p>
        <div className="library-grid">
          <article className="card stack">
            <LibraryArt name="walk" label={t("Illustration of a person walking")} />
            <h3>{t("A short walk")}</h3>
            <p>{t("An illustration of movement, not a person's story and not a promised outcome.")}</p>
          </article>
          <article className="card stack">
            <LibraryArt name="bowl" label={t("Illustration of a bowl")} />
            <h3>{t("An ordinary meal")}</h3>
            <p>{t("An illustration of a bowl. It is not a meal plan and not a before-and-after.")}</p>
          </article>
          <article className="card stack">
            <LibraryArt name="chair" label={t("Illustration of a chair")} />
            <h3>{t("A chair is enough")}</h3>
            <p>{t("An illustration of seated movement. It is not a fitness result.")}</p>
          </article>
        </div>
      </section>
      <p>
        <Link href="/library/cards">{t("Share a healthy idea")}</Link>
        {" · "}
        <Link href="/library/lessons">{t("Daily lessons")}</Link>
        {" · "}
        <Link href="/library/moments">{t("Having a hard moment?")}</Link>
        {" · "}
        <Link href="/library/music">{t("My Music")}</Link>
        {" · "}
        <Link href="/library/books">{t("Books and listening")}</Link>
        {" · "}
        <Link href="/academy/move/library">{t("Wellness Library")}</Link>
      </p>
    </div>
  );
}
