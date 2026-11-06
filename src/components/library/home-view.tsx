"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LibraryArt } from "@/components/library/art";
import {
  LIBRARY_BRAND,
  LIBRARY_DISCLAIMER,
  LIBRARY_HEADLINE,
  LIBRARY_SUBTITLE,
  filterLibrary,
  libraryCategories,
  type SearchKind,
} from "@/lib/library/catalog";

const kinds: { id: SearchKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "guide", label: "Guides" },
  { id: "recipe", label: "Recipes" },
  { id: "exercise", label: "Exercises" },
  { id: "video", label: "Videos" },
  { id: "pdf", label: "PDFs" },
];

export function LibraryHome() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | "all">("all");
  const hits = useMemo(() => filterLibrary(query, kind), [query, kind]);
  const showHits = query.trim().length > 0 || kind !== "all";

  return (
    <div className="library stack-lg">
      <header className="hero-panel">
        <p className="library-kicker">Health Library</p>
        <h1>{LIBRARY_HEADLINE}</h1>
        <p>{LIBRARY_SUBTITLE}</p>
        <p className="library-brand">{LIBRARY_BRAND}</p>
        <p>Free to read. No account is required.</p>
      </header>
      <p className="library-disclaimer">{LIBRARY_DISCLAIMER}</p>
      <section className="stack">
        <h2>Search the library</h2>
        <label className="field">
          <span>Search articles, guides, recipes, exercises, and PDFs</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try fiber, chair, or sleep" />
        </label>
        <div className="actions" role="group" aria-label="Filter by type">
          {kinds.map((item) => (
            <button
              key={item.id}
              className={kind === item.id ? "btn btn-primary" : "btn btn-secondary"}
              type="button"
              aria-pressed={kind === item.id}
              onClick={() => setKind(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {showHits ? (
          <div className="stack">
            {hits.length === 0 ? (
              <p>
                {kind === "video"
                  ? "This library does not host videos. Movement is text and original drawings."
                  : "Nothing in this library matches that filter."}
              </p>
            ) : (
              hits.slice(0, 40).map((hit) => (
                <Link key={hit.id} className="card learn-link" href={hit.href}>
                  <h3>{hit.title}</h3>
                  <p>{hit.text}</p>
                  <p className="hint">{hit.kinds.join(", ")}</p>
                </Link>
              ))
            )}
          </div>
        ) : null}
      </section>
      <section className="stack">
        <h2>Categories</h2>
        <div className="library-grid">
          {libraryCategories.map((category) => (
            <article key={category.slug} className="card stack">
              <LibraryArt name={category.art} label={`Illustration for ${category.title}`} />
              <h3>
                <Link href={`/library/topics/${category.slug}`}>{category.title}</Link>
              </h3>
              <p>{category.description}</p>
              <ul>
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="stack">
        <h2>Illustrated ideas</h2>
        <p>These drawings were made for lifeZoi. They are illustrations, not testimonials, and they are not results.</p>
        <div className="library-grid">
          <article className="card stack">
            <LibraryArt name="walk" label="Illustration of a person walking" />
            <h3>A short walk</h3>
            <p>An illustration of movement, not a person&apos;s story and not a promised outcome.</p>
          </article>
          <article className="card stack">
            <LibraryArt name="bowl" label="Illustration of a bowl" />
            <h3>An ordinary meal</h3>
            <p>An illustration of a bowl. It is not a meal plan and not a before-and-after.</p>
          </article>
          <article className="card stack">
            <LibraryArt name="chair" label="Illustration of a chair" />
            <h3>A chair is enough</h3>
            <p>An illustration of seated movement. It is not a fitness result.</p>
          </article>
        </div>
      </section>
      <p>
        <Link href="/library/cards">Share a healthy idea</Link>
        {" · "}
        <Link href="/library/lessons">Daily lessons</Link>
        {" · "}
        <Link href="/library/moments">Having a hard moment?</Link>
      </p>
    </div>
  );
}
