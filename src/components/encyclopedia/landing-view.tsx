"use client";

import "@/components/encyclopedia/encyclopedia.css";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useT } from "@/components/locale-provider";
import { DidYouKnow } from "@/components/encyclopedia/facts-view";
import { StoriesTeaser } from "@/components/encyclopedia/stories-view";
import { Illustration } from "@/components/encyclopedia/illustrations";
import { ArticleCard, Disclaimer, EnglishOnlyNote, EvidenceLegend } from "@/components/encyclopedia/parts";
import { useArticles, useRecentArticles } from "@/components/encyclopedia/use-encyclopedia";
import { featuredArticles, findArticle, inCategory, recentlyUpdated, searchArticles } from "@/lib/encyclopedia/catalog";
import {
  CATEGORIES,
  ENCYCLOPEDIA_INTRO,
  ENCYCLOPEDIA_PHILOSOPHY,
  ENCYCLOPEDIA_SUBTITLE,
  ENCYCLOPEDIA_TAGLINE,
  ENCYCLOPEDIA_TITLE,
  POPULAR_SEARCHES,
} from "@/lib/encyclopedia/categories";
import { TIMELINE } from "@/lib/encyclopedia/timeline";
import type { Article } from "@/lib/encyclopedia/types";

export function EncyclopediaSearch({ initial = "" }: { initial?: string }) {
  const t = useT();
  const articles = useArticles();
  const [query, setQuery] = useState(initial);
  const hits = useMemo(() => searchArticles(query, articles), [query, articles]);
  const asked = query.trim().length > 1;
  return (
    <section className="ency-search" aria-labelledby="ency-search-label">
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label id="ency-search-label" htmlFor="ency-search-input" className="sr-only">
          {t("Search the encyclopedia")}
        </label>
        <input
          id="ency-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("Search health topics, discoveries, and medical research...")}
          autoComplete="off"
        />
      </form>
      <div className="ency-chips" aria-label={t("Popular topics")}>
        <span className="hint">{t("Popular topics")}:</span>
        {POPULAR_SEARCHES.map((term) => (
          <button key={term} type="button" className="ency-chip" onClick={() => setQuery(term)} lang="en">
            {term}
          </button>
        ))}
      </div>
      {asked ? (
        <div className="ency-results" aria-live="polite">
          {hits.length > 0 ? (
            <>
              <p className="hint">{t("{count} articles found", { count: hits.length })}</p>
              <div className="ency-grid">
                {hits.map((article) => (
                  <ArticleCard key={article.slug} article={article} compact />
                ))}
              </div>
            </>
          ) : (
            <div className="ency-empty">
              <p>
                <strong>{t("No articles match that search yet.")}</strong> {t("Try a simpler word, or browse one of these categories:")}
              </p>
              <div className="ency-chips">
                {CATEGORIES.slice(0, 6).map((category) => (
                  <Link key={category.slug} className="ency-chip" href={`/encyclopedia/categories/${category.slug}`}>
                    {t(category.title)}
                  </Link>
                ))}
              </div>
              <p className="hint">
                {t("You can also ask LifeZoi AI.")} <Link href={`/lifezoi-ai?q=${encodeURIComponent(query.trim())}`}>{t("Ask LifeZoi AI")}</Link>
              </p>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function RecentlyViewed({ articles }: { articles: Article[] }) {
  const t = useT();
  const { slugs } = useRecentArticles();
  const recent = slugs.map((slug) => findArticle(slug, articles)).filter((item): item is Article => Boolean(item)).slice(0, 3);
  if (recent.length === 0) return null;
  return (
    <section className="ency-block">
      <div className="ency-block-head">
        <h2>{t("Continue reading")}</h2>
        <Link href="/encyclopedia/library">{t("My Library")}</Link>
      </div>
      <div className="ency-grid">
        {recent.map((article) => (
          <ArticleCard key={article.slug} article={article} compact />
        ))}
      </div>
    </section>
  );
}

export function EncyclopediaLanding() {
  const t = useT();
  const articles = useArticles();
  const featured = featuredArticles(articles, 6);
  const updated = recentlyUpdated(articles, 4);
  const highlights = TIMELINE.filter((event) => ["ct-scan", "smallpox-eradicated", "imatinib", "crispr", "mrna-vaccines", "crispr-therapy"].includes(event.id));

  return (
    <div className="ency stack-lg">
      <header className="ency-hero">
        <div className="ency-hero-text">
          <p className="ency-kicker">{t(ENCYCLOPEDIA_TAGLINE)}</p>
          <h1>{t(ENCYCLOPEDIA_TITLE)}</h1>
          <p className="ency-subtitle">{t(ENCYCLOPEDIA_SUBTITLE)}</p>
          <p>{t(ENCYCLOPEDIA_INTRO)}</p>
        </div>
        <Illustration name="microscope" className="ency-hero-illustration" />
      </header>

      <EncyclopediaSearch />
      <EnglishOnlyNote />

      <section className="ency-entry-row" aria-label={t("Two ways to learn")}>
        <Link className="ency-entry" href="#ency-browse">
          <Illustration name="plate" />
          <span>
            <strong>{t("Read the Encyclopedia")}</strong>
            <span>{t("Browse categories and read full articles at your own pace. No AI needed.")}</span>
          </span>
        </Link>
        <Link className="ency-entry ency-entry-ai" href="/lifezoi-ai">
          <Illustration name="ai" />
          <span>
            <strong>{t("Ask LifeZoi AI")}</strong>
            <span>{t("Ask a question in your own words and get an answer with matching articles.")}</span>
          </span>
        </Link>
      </section>

      <DidYouKnow />

      <section className="ency-block">
        <div className="ency-block-head">
          <h2>{t("Featured articles")}</h2>
        </div>
        <div className="ency-grid">
          {featured.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </section>

      <StoriesTeaser />

      <RecentlyViewed articles={articles} />

      <section className="ency-block" id="ency-browse">
        <div className="ency-block-head">
          <h2>{t("Browse by category")}</h2>
        </div>
        <div className="ency-cats">
          {CATEGORIES.map((category) => (
            <Link key={category.slug} href={`/encyclopedia/categories/${category.slug}`} className="ency-cat">
              <Illustration name={category.illustration} />
              <span className="ency-cat-title">{t(category.title)}</span>
              <span className="ency-cat-text">{t(category.description)}</span>
              <span className="ency-cat-count">{t("{count} articles", { count: inCategory(category.slug, articles).length })}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="ency-block ency-feature-east">
        <Illustration name="balance" />
        <div>
          <h2>{t("Eastern & Western Medicine — Two Approaches to Understanding Health")}</h2>
          <p>{t("Traditional Chinese medicine, Ayurveda, acupuncture, and mind-body practices, compared with modern evidence-based medicine. Each practice is weighed on its own evidence.")}</p>
          <Link className="btn btn-primary" href="/encyclopedia/eastern-western">
            {t("Explore Eastern & Western Medicine")}
          </Link>
        </div>
      </section>

      <section className="ency-block">
        <div className="ency-block-head">
          <h2>{t("Medical discoveries timeline")}</h2>
          <Link href="/encyclopedia/timeline">{t("See the full timeline")}</Link>
        </div>
        <ol className="ency-mini-timeline">
          {highlights.map((event) => (
            <li key={event.id}>
              <span className="ency-year">{event.year}</span>
              <span lang="en">{event.title}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="ency-block">
        <div className="ency-block-head">
          <h2>{t("Recently updated")}</h2>
        </div>
        <div className="ency-grid">
          {updated.map((article) => (
            <ArticleCard key={article.slug} article={article} compact />
          ))}
        </div>
      </section>

      <section className="ency-block card">
        <h2>{t("How we label the evidence")}</h2>
        <p>{t("Every article separates what is well established from what is still being studied. Each label is assigned to one specific claim and names the kind of studies behind it.")}</p>
        <EvidenceLegend />
        <p className="hint">
          <Link href="/encyclopedia/glossary">{t("Medical words explained")}</Link> · <Link href="/encyclopedia/facts">{t("Did You Know?")}</Link> · <Link href="/encyclopedia/library">{t("My Library")}</Link>
        </p>
      </section>

      <p className="ency-philosophy">{t(ENCYCLOPEDIA_PHILOSOPHY)}</p>
      <Disclaimer />
    </div>
  );
}
