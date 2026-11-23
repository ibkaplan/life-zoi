"use client";

import "@/components/encyclopedia/encyclopedia.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/components/locale-provider";
import { ArticleBody } from "@/components/encyclopedia/article-body";
import { SavedFacts } from "@/components/encyclopedia/facts-view";
import { Illustration } from "@/components/encyclopedia/illustrations";
import { ArticleCard, Disclaimer, EnglishOnlyNote, favoriteId, FavoriteToggle } from "@/components/encyclopedia/parts";
import { useArticles, useRecentArticles } from "@/components/encyclopedia/use-encyclopedia";
import { useCompanion } from "@/lib/companion/store";
import { findArticle, inCategory, relatedArticles } from "@/lib/encyclopedia/catalog";
import { categoryFor, CATEGORIES } from "@/lib/encyclopedia/categories";
import { GLOSSARY } from "@/lib/encyclopedia/glossary";
import { TIMELINE, TIMELINE_ERAS } from "@/lib/encyclopedia/timeline";
import type { Article, TimelineEra } from "@/lib/encyclopedia/types";

function Crumbs({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return (
    <nav className="ency-crumbs" aria-label={t("Breadcrumb")}>
      <Link href="/encyclopedia">{t("Health Encyclopedia")}</Link>
      {children ? <span aria-hidden="true"> / </span> : null}
      {children}
    </nav>
  );
}

export function CategoryView({ slug }: { slug: string }) {
  const t = useT();
  const articles = useArticles();
  const category = categoryFor(slug);
  if (!category) return <NotFound />;
  const list = inCategory(category.slug, articles);
  return (
    <div className="ency stack-lg">
      <Crumbs>
        <span>{t(category.title)}</span>
      </Crumbs>
      <header className="ency-hero ency-hero-small">
        <div className="ency-hero-text">
          <h1>{t(category.title)}</h1>
          <p>{t(category.description)}</p>
        </div>
        <Illustration name={category.illustration} className="ency-hero-illustration" />
      </header>
      <EnglishOnlyNote />
      {list.length > 0 ? (
        <div className="ency-grid">
          {list.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="ency-empty">{t("Articles for this category are being prepared and reviewed.")}</p>
      )}
      {category.slug === "medical-discoveries" ? (
        <p>
          <Link className="btn btn-secondary" href="/encyclopedia/timeline">
            {t("See the full timeline")}
          </Link>
        </p>
      ) : null}
      {category.slug === "eastern-medicine" || category.slug === "western-medicine" ? (
        <p>
          <Link className="btn btn-secondary" href="/encyclopedia/eastern-western">
            {t("Explore Eastern & Western Medicine")}
          </Link>
        </p>
      ) : null}
      <nav className="ency-chips" aria-label={t("Other categories")}>
        {CATEGORIES.filter((item) => item.slug !== category.slug).map((item) => (
          <Link key={item.slug} className="ency-chip" href={`/encyclopedia/categories/${item.slug}`}>
            {t(item.title)}
          </Link>
        ))}
      </nav>
      <Disclaimer />
    </div>
  );
}

function NotFound() {
  const t = useT();
  return (
    <div className="ency stack-lg">
      <Crumbs />
      <h1>{t("This page is not in the encyclopedia")}</h1>
      <p>{t("It may have been moved or archived.")}</p>
      <Link className="btn btn-primary" href="/encyclopedia">
        {t("Back to the Health Encyclopedia")}
      </Link>
    </div>
  );
}

export function AskAboutArticle({ article }: { article: Article }) {
  const t = useT();
  return (
    <Link className="btn btn-secondary" href={`/lifezoi-ai?article=${article.slug}`}>
      {t("Ask LifeZoi AI about this article")}
    </Link>
  );
}

export function ArticlePage({ slug }: { slug: string }) {
  const t = useT();
  const articles = useArticles();
  const article = findArticle(slug, articles);
  const { add } = useRecentArticles();
  useEffect(() => {
    if (article) add(article.slug);
  }, [article, add]);
  if (!article) return <NotFound />;
  const category = categoryFor(article.category);
  const related = relatedArticles(article, articles, 3);
  return (
    <div className="ency stack-lg">
      <Crumbs>
        {category ? <Link href={`/encyclopedia/categories/${category.slug}`}>{t(category.title)}</Link> : null}
      </Crumbs>
      <ArticleBody
        article={article}
        actions={
          <>
            <FavoriteToggle slug={article.slug} />
            <AskAboutArticle article={article} />
          </>
        }
      />
      {related.length > 0 ? (
        <section className="ency-block">
          <h2>{t("Related articles")}</h2>
          <div className="ency-grid">
            {related.map((item) => (
              <ArticleCard key={item.slug} article={item} compact />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function TimelineView() {
  const t = useT();
  const [era, setEra] = useState<TimelineEra | "all">("all");
  const shown = TIMELINE.filter((event) => era === "all" || event.era === era);
  return (
    <div className="ency stack-lg">
      <Crumbs>
        <span>{t("Medical discoveries timeline")}</span>
      </Crumbs>
      <header className="ency-hero ency-hero-small">
        <div className="ency-hero-text">
          <h1>{t("Medical Discoveries: A 60-Year Timeline")}</h1>
          <p>{t("Major developments in medicine from 1960 to today, and what researchers are working on next. Each entry links to its source.")}</p>
        </div>
        <Illustration name="timeline" className="ency-hero-illustration" />
      </header>
      <EnglishOnlyNote />
      <div className="ency-chips ency-era-tabs" role="group" aria-label={t("Choose a decade")}>
        <button type="button" className="ency-chip" aria-pressed={era === "all"} onClick={() => setEra("all")}>
          {t("All decades")}
        </button>
        {TIMELINE_ERAS.map((item) => (
          <button key={item.id} type="button" className="ency-chip" aria-pressed={era === item.id} onClick={() => setEra(item.id)}>
            {t(item.label)}
          </button>
        ))}
      </div>
      {TIMELINE_ERAS.filter((item) => shown.some((event) => event.era === item.id)).map((item) => (
        <section key={item.id} className="ency-era" aria-labelledby={`era-${item.id}`}>
          <h2 id={`era-${item.id}`}>{t(item.label)}</h2>
          <ol className="ency-timeline">
            {shown
              .filter((event) => event.era === item.id)
              .map((event) => (
                <li key={event.id} className={event.status === "research" ? "ency-event ency-event-research" : "ency-event"}>
                  <div className="ency-event-year">{event.status === "research" ? t("In research") : event.year}</div>
                  <details className="ency-event-card">
                    <summary>
                      <span className="ency-event-field" lang="en">
                        {event.field}
                      </span>
                      <span className="ency-event-title" lang="en">
                        {event.title}
                      </span>
                    </summary>
                    <dl lang="en">
                      <div>
                        <dt>{t("What happened")}</dt>
                        <dd>{event.what}</dd>
                      </div>
                      <div>
                        <dt>{t("Who contributed")}</dt>
                        <dd>{event.who}</dd>
                      </div>
                      <div>
                        <dt>{t("Why it mattered")}</dt>
                        <dd>{event.why}</dd>
                      </div>
                      <div>
                        <dt>{t("Its impact today")}</dt>
                        <dd>{event.today}</dd>
                      </div>
                    </dl>
                    <p className="ency-event-links">
                      {event.sources.map((source) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" lang="en">
                          {t("Source")}: {source.publisher}
                        </a>
                      ))}
                      {event.articleSlug ? <Link href={`/encyclopedia/articles/${event.articleSlug}`}>{t("Read the related article")}</Link> : null}
                    </p>
                  </details>
                </li>
              ))}
          </ol>
        </section>
      ))}
      <p className="hint">{t("Research directions under Future developments are not established treatments.")}</p>
      <Disclaimer />
    </div>
  );
}

const PRACTICES = ["eastern-and-western-medicine", "acupuncture", "herbal-medicine-chinese-and-ayurvedic", "meditation-and-mind-body", "evidence-based-medicine"];

export function EasternWesternView() {
  const t = useT();
  const articles = useArticles();
  const list = PRACTICES.map((slug) => findArticle(slug, articles)).filter((item): item is Article => Boolean(item));
  const rows: [string, string, string][] = [
    [t("Health"), t("Balance of the whole person, often described as energy or constitution"), t("Measurable body systems, studied through anatomy, chemistry, and genetics")],
    [t("Symptoms"), t("Read as patterns across the whole body"), t("Clues to an underlying cause that can be tested")],
    [t("Prevention"), t("Daily routines, food, movement, and calm"), t("Daily habits plus vaccines and screening")],
    [t("Treatment"), t("Several practices fitted to the person"), t("Treatments tested in groups of people in clinical trials")],
  ];
  return (
    <div className="ency stack-lg">
      <Crumbs>
        <span>{t("Eastern & Western Medicine")}</span>
      </Crumbs>
      <header className="ency-hero ency-hero-small">
        <div className="ency-hero-text">
          <h1>{t("Eastern & Western Medicine — Two Approaches to Understanding Health")}</h1>
          <p>{t("Eastern medicine is not one system. Each practice below is weighed on its own evidence, without calling traditions effective or ineffective as a whole.")}</p>
        </div>
        <Illustration name="balance" className="ency-hero-illustration" />
      </header>
      <section className="ency-block card">
        <h2>{t("How the approaches tend to differ")}</h2>
        <div className="ency-table-wrap">
          <table className="ency-compare">
            <thead>
              <tr>
                <th scope="col">{t("Topic")}</th>
                <th scope="col">{t("Many traditional systems")}</th>
                <th scope="col">{t("Modern Western medicine")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([topic, east, west]) => (
                <tr key={topic}>
                  <th scope="row">{topic}</th>
                  <td>{east}</td>
                  <td>{west}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">{t("These are tendencies, not rules. Many clinicians combine both in integrative care.")}</p>
      </section>
      <EnglishOnlyNote />
      <section className="ency-block">
        <h2>{t("Practices and the evidence")}</h2>
        <p>{t("Each article answers: What is the traditional approach? What does modern research say? What is supported, what is uncertain, what are the risks, and when should you see a qualified professional?")}</p>
        <div className="ency-grid">
          {list.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}

export function LibraryView() {
  const t = useT();
  const articles = useArticles();
  const { state, ready } = useCompanion();
  const { slugs, clear } = useRecentArticles();
  const saved = state.media.favorites
    .filter((id) => id.startsWith("ency:"))
    .map((id) => findArticle(id.slice(5), articles))
    .filter((item): item is Article => Boolean(item));
  const recent = slugs.map((slug) => findArticle(slug, articles)).filter((item): item is Article => Boolean(item));
  return (
    <div className="ency stack-lg">
      <Crumbs>
        <span>{t("My Library")}</span>
      </Crumbs>
      <h1>{t("My Library")}</h1>
      <section className="ency-block">
        <h2>{t("Saved articles")}</h2>
        {!ready ? <p className="hint">{t("Loading…")}</p> : null}
        {ready && saved.length === 0 ? <p className="ency-empty">{t("Nothing saved yet. Use Save to My Library on any article.")}</p> : null}
        <div className="ency-grid">
          {saved.map((article) => (
            <div key={article.slug} className="stack">
              <ArticleCard article={article} compact />
              <FavoriteToggle slug={article.slug} />
            </div>
          ))}
        </div>
        <p className="hint">{t("Saved articles are kept with your other LifeZoi favorites.")}</p>
      </section>
      <SavedFacts />
      <section className="ency-block">
        <div className="ency-block-head">
          <h2>{t("Recently viewed")}</h2>
          {recent.length > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={clear}>
              {t("Clear history")}
            </button>
          ) : null}
        </div>
        {recent.length === 0 ? <p className="ency-empty">{t("Articles you open will appear here.")}</p> : null}
        <div className="ency-grid">
          {recent.map((article) => (
            <ArticleCard key={article.slug} article={article} compact />
          ))}
        </div>
        <p className="hint">{t("Recently viewed articles are kept only in this browser, for your account, and are never sent anywhere.")}</p>
      </section>
    </div>
  );
}

export function GlossaryView() {
  const t = useT();
  const [query, setQuery] = useState("");
  const needle = query.trim().toLocaleLowerCase();
  const shown = GLOSSARY.filter((term) => !needle || `${term.term} ${term.meaning}`.toLocaleLowerCase().includes(needle));
  return (
    <div className="ency stack-lg">
      <Crumbs>
        <span>{t("Medical words explained")}</span>
      </Crumbs>
      <h1>{t("Medical words explained")}</h1>
      <EnglishOnlyNote />
      <label className="ency-search">
        <span className="sr-only">{t("Find a word")}</span>
        <input type="search" value={query} placeholder={t("Find a word")} onChange={(event) => setQuery(event.target.value)} />
      </label>
      <dl className="ency-glossary" lang="en">
        {shown.map((term) => (
          <div key={term.id} id={`term-${term.id}`}>
            <dt>{term.term}</dt>
            <dd>{term.meaning}</dd>
          </div>
        ))}
      </dl>
      {shown.length === 0 ? <p className="ency-empty">{t("No word matches that search.")}</p> : null}
    </div>
  );
}

export { favoriteId };
