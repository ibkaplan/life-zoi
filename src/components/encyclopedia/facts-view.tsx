"use client";

import "@/components/encyclopedia/encyclopedia.css";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { Illustration } from "@/components/encyclopedia/illustrations";
import { ArticleCard, Disclaimer, EnglishOnlyNote } from "@/components/encyclopedia/parts";
import { useArticles } from "@/components/encyclopedia/use-encyclopedia";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import { toggleFavorite } from "@/lib/companion/state";
import { localISODate } from "@/lib/dates";
import { findArticle } from "@/lib/encyclopedia/catalog";
import { questionFor } from "@/lib/encyclopedia/fact-quiz";
import {
  FACT_CATEGORIES,
  FACT_EVIDENCE,
  factArchive,
  factCategory,
  factOfTheDay,
  findFact,
  relatedFacts,
  searchFacts,
  type FactEvidence,
  type HealthFact,
} from "@/lib/encyclopedia/facts";
import type { Article } from "@/lib/encyclopedia/types";

export const factFavoriteId = (id: string) => `fact:${id}`;

/** Today's date in the member's own time zone. Empty until the page runs in the browser. */
const noSubscribe = () => () => {};
function useToday(): string {
  return useSyncExternalStore(noSubscribe, () => localISODate(), () => "");
}

/** The category named in the address (?category=…), read in the browser only. */
function useLinkedCategory(): string | null {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const wanted = new URLSearchParams(window.location.search).get("category");
      return wanted && factCategory(wanted) ? wanted : null;
    },
    () => null,
  );
}

function categoryArt(fact: HealthFact) {
  return factCategory(fact.category)?.illustration ?? "microscope";
}

export function FactEvidenceBadge({ level }: { level: FactEvidence }) {
  const t = useT();
  return (
    <span className={`ency-badge fact-badge-${level}`} title={t(FACT_EVIDENCE[level].meaning)}>
      <span aria-hidden="true" className="ency-badge-dot" />
      {t(FACT_EVIDENCE[level].label)}
    </span>
  );
}

function FactCard({ fact, date }: { fact: HealthFact; date?: string }) {
  const t = useT();
  const { locale } = useLocale();
  const category = factCategory(fact.category);
  return (
    <article className={`fact-card fact-cat-${fact.category}`}>
      <div className="fact-card-art">
        <Illustration name={categoryArt(fact)} />
      </div>
      <div className="fact-card-body">
        <p className="fact-card-meta">
          {date ? `${new Date(`${date}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "long" })} · ` : ""}
          {category ? t(category.title) : ""}
        </p>
        <h3 lang="en">{fact.headline}</h3>
        <p lang="en">{fact.fact}</p>
        <div className="fact-card-foot">
          <FactEvidenceBadge level={fact.evidence} />
          <Link className="btn btn-secondary" href={`/encyclopedia/facts/${fact.id}`}>
            {t("Discover More")}
          </Link>
        </div>
      </div>
    </article>
  );
}

/** The "Did You Know?" section on the encyclopedia homepage. */
export function DidYouKnow() {
  const t = useT();
  const articles = useArticles();
  const today = useToday();
  if (!today) return <section className="ency-block fact-today fact-today-loading" aria-busy="true" />;
  const fact = factOfTheDay(today);
  const article = fact.articles?.[0] ? findArticle(fact.articles[0], articles) : undefined;
  const category = factCategory(fact.category);
  return (
    <section className={`ency-block fact-today fact-cat-${fact.category}`} aria-labelledby="fact-today-title">
      <div className="fact-today-art">
        <Illustration name={categoryArt(fact)} />
      </div>
      <div className="fact-today-text">
        <p className="ency-kicker">
          {t("Did You Know? — Amazing Health Facts")} · {t("Fact of the Day")}
        </p>
        <h2 id="fact-today-title" lang="en">
          {fact.headline}
        </h2>
        <p lang="en">{fact.fact}</p>
        <p className="fact-today-meta">
          <FactEvidenceBadge level={fact.evidence} />
          {category ? <span className="hint">{t(category.title)}</span> : null}
        </p>
        <div className="fact-actions">
          <Link className="btn btn-primary" href={`/encyclopedia/facts/${fact.id}`}>
            {t("Discover More")}
          </Link>
          {article ? (
            <Link className="btn btn-secondary" href={`/encyclopedia/articles/${article.slug}`}>
              {t("Read the full article")}
            </Link>
          ) : null}
          <Link className="fact-see-all" href="/encyclopedia/facts">
            {t("See All Facts")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Crumbs({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return (
    <nav className="ency-crumbs" aria-label={t("Breadcrumb")}>
      <Link href="/encyclopedia">{t("Health Encyclopedia")}</Link>
      <span aria-hidden="true"> / </span>
      {children ?? <span>{t("Did You Know?")}</span>}
    </nav>
  );
}

function EvidenceKey() {
  const t = useT();
  return (
    <dl className="ency-legend">
      {(Object.keys(FACT_EVIDENCE) as FactEvidence[]).map((level) => (
        <div key={level}>
          <dt>
            <FactEvidenceBadge level={level} />
          </dt>
          <dd>{t(FACT_EVIDENCE[level].meaning)}</dd>
        </div>
      ))}
    </dl>
  );
}

function ReviewNote() {
  const t = useT();
  return <p className="hint">{t("Each fact was checked against the source it links to. The wording has not yet been reviewed by a qualified health professional.")}</p>;
}

/** All facts: search, category filter, and the Fact of the Day archive. */
export function FactsView() {
  const t = useT();
  const today = useToday();
  const [query, setQuery] = useState("");
  const linked = useLinkedCategory();
  const [picked, setCategory] = useState<string | null | undefined>(undefined);
  const category = picked === undefined ? linked : picked;
  const shown = useMemo(() => searchFacts(query, category), [query, category]);
  const archive = today ? factArchive(today, 30) : [];
  return (
    <div className="ency stack-lg">
      <Crumbs />
      <header className="ency-hero ency-hero-small">
        <div className="ency-hero-text">
          <h1>{t("Did You Know? — Amazing Health Facts")}</h1>
          <p>{t("Surprising facts about the body, medicine, and health, each checked against a trusted source. Open any fact to learn how it works and what science says.")}</p>
          <p>
            <Link className="btn btn-primary" href="/brain-quiz/health-facts">
              {t("Take the Health Facts Quiz")}
            </Link>
          </p>
        </div>
        <Illustration name="magnifier" className="ency-hero-illustration" />
      </header>
      <EnglishOnlyNote />
      {today ? (
        <section className="ency-block">
          <h2>{t("Fact of the Day")}</h2>
          <div className="ency-grid">
            <FactCard fact={factOfTheDay(today)} />
          </div>
        </section>
      ) : null}
      <section className="ency-block" aria-labelledby="facts-browse">
        <h2 id="facts-browse">{t("Browse all facts")}</h2>
        <label className="ency-search">
          <span className="sr-only">{t("Search the facts")}</span>
          <input type="search" value={query} placeholder={t("Search the facts")} onChange={(event) => setQuery(event.target.value)} autoComplete="off" />
        </label>
        <div className="ency-chips" role="group" aria-label={t("Filter by category")}>
          <button type="button" className="ency-chip" aria-pressed={category === null} onClick={() => setCategory(null)}>
            {t("All categories")}
          </button>
          {FACT_CATEGORIES.map((item) => (
            <button key={item.slug} type="button" className="ency-chip" aria-pressed={category === item.slug} onClick={() => setCategory(item.slug)}>
              {t(item.title)}
            </button>
          ))}
        </div>
        <p className="hint" aria-live="polite">
          {t("{count} facts", { count: shown.length })}
        </p>
        {shown.length > 0 ? (
          <div className="ency-grid">
            {shown.map((fact) => (
              <FactCard key={fact.id} fact={fact} />
            ))}
          </div>
        ) : (
          <p className="ency-empty">{t("No fact matches that search. Try a simpler word or another category.")}</p>
        )}
      </section>
      {archive.length > 0 ? (
        <section className="ency-block">
          <h2>{t("Earlier Facts of the Day")}</h2>
          <div className="ency-grid">
            {archive.map((item) => (
              <FactCard key={item.date} fact={item.fact} date={item.date} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="ency-block card">
        <h2>{t("How we label the facts")}</h2>
        <EvidenceKey />
        <ReviewNote />
      </section>
      <Disclaimer />
    </div>
  );
}

export function FactSaveToggle({ id }: { id: string }) {
  const t = useT();
  const { state } = useCompanion();
  const on = state.media.favorites.includes(factFavoriteId(id));
  return (
    <button className="btn btn-secondary" type="button" aria-pressed={on} onClick={() => commitCompanion((current) => toggleFavorite(current, factFavoriteId(id)))}>
      {on ? `★ ${t("Saved to My Library")}` : `☆ ${t("Save to My Library")}`}
    </button>
  );
}

function ShareFact({ fact }: { fact: HealthFact }) {
  const t = useT();
  const [status, setStatus] = useState("");
  async function share() {
    const url = `${window.location.origin}/encyclopedia/facts/${fact.id}`;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: fact.headline, text: fact.fact, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus(t("Link copied. Only LifeZoi members can open it."));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(t("Could not share. You can copy the address from your browser."));
    }
  }
  return (
    <>
      <button className="btn btn-secondary" type="button" onClick={share}>
        {t("Share")}
      </button>
      {status ? (
        <span className="hint" role="status">
          {status}
        </span>
      ) : null}
    </>
  );
}

export function FactPage({ id }: { id: string }) {
  const t = useT();
  const articles = useArticles();
  const fact = findFact(id);
  if (!fact) {
    return (
      <div className="ency stack-lg">
        <Crumbs />
        <h1>{t("This fact is not in the encyclopedia")}</h1>
        <Link className="btn btn-primary" href="/encyclopedia/facts">
          {t("See All Facts")}
        </Link>
      </div>
    );
  }
  const category = factCategory(fact.category);
  const linked = (fact.articles ?? []).map((slug) => findArticle(slug, articles)).filter((item): item is Article => Boolean(item));
  const ask = `/lifezoi-ai?q=${encodeURIComponent(`Explain this fact: ${fact.headline}`)}${linked[0] ? `&article=${linked[0].slug}` : ""}`;
  const sections: [string, string | undefined][] = [
    [t("Why it is interesting"), fact.why],
    [t("How it works"), fact.how],
    [t("What science says"), fact.science],
    [t("History and culture"), fact.history],
    [t("Related discoveries"), fact.related],
  ];
  return (
    <div className="ency stack-lg">
      <Crumbs>
        <Link href="/encyclopedia/facts">{t("Did You Know?")}</Link>
        {category ? (
          <>
            <span aria-hidden="true"> / </span>
            <Link href={`/encyclopedia/facts?category=${category.slug}`}>{t(category.title)}</Link>
          </>
        ) : null}
      </Crumbs>
      <article className={`fact-detail fact-cat-${fact.category}`}>
        <header className="fact-detail-head">
          <div className="fact-today-art">
            <Illustration name={categoryArt(fact)} />
          </div>
          <div>
            <p className="ency-kicker">{t("Did You Know?")}</p>
            <h1 lang="en">{fact.headline}</h1>
            <p className="fact-detail-lead" lang="en">
              {fact.fact}
            </p>
            <p>
              <FactEvidenceBadge level={fact.evidence} /> <span className="hint">{t(FACT_EVIDENCE[fact.evidence].meaning)}</span>
            </p>
          </div>
        </header>
        <EnglishOnlyNote />
        <div className="fact-actions">
          <FactSaveToggle id={fact.id} />
          <ShareFact fact={fact} />
          <Link className="btn btn-secondary" href={ask}>
            {t("Ask LifeZoi AI to explain")}
          </Link>
          {questionFor(fact.id) ? (
            <Link className="btn btn-secondary" href={`/brain-quiz/health-facts?fact=${fact.id}`}>
              {t("Test yourself on this fact")}
            </Link>
          ) : null}
        </div>
        {sections
          .filter((entry): entry is [string, string] => Boolean(entry[1]))
          .map(([heading, text]) => (
            <section key={heading} className="fact-section">
              <h2>{heading}</h2>
              <p lang="en">{text}</p>
            </section>
          ))}
        <section className="fact-section">
          <h2>{t("Sources")}</h2>
          <ul className="fact-sources">
            {fact.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" lang="en">
                  {source.title}
                </a>{" "}
                <span className="hint" lang="en">
                  {source.publisher}
                </span>
              </li>
            ))}
          </ul>
          <ReviewNote />
        </section>
      </article>
      {linked.length > 0 ? (
        <section className="ency-block">
          <h2>{t("Related articles")}</h2>
          <div className="ency-grid">
            {linked.map((article) => (
              <ArticleCard key={article.slug} article={article} compact />
            ))}
          </div>
        </section>
      ) : null}
      <section className="ency-block">
        <div className="ency-block-head">
          <h2>{t("More facts like this")}</h2>
          <Link href="/encyclopedia/facts">{t("See All Facts")}</Link>
        </div>
        <div className="ency-grid">
          {relatedFacts(fact).map((other) => (
            <FactCard key={other.id} fact={other} />
          ))}
        </div>
      </section>
      <Disclaimer />
    </div>
  );
}

/** Saved facts, for My Library. */
export function SavedFacts() {
  const t = useT();
  const { state, ready } = useCompanion();
  const saved = state.media.favorites
    .filter((id) => id.startsWith("fact:"))
    .map((id) => findFact(id.slice(5)))
    .filter((fact): fact is HealthFact => Boolean(fact));
  return (
    <section className="ency-block">
      <h2>{t("Saved facts")}</h2>
      {ready && saved.length === 0 ? (
        <p className="ency-empty">
          {t("No facts saved yet.")} <Link href="/encyclopedia/facts">{t("See All Facts")}</Link>
        </p>
      ) : null}
      <div className="ency-grid">
        {saved.map((fact) => (
          <div key={fact.id} className="stack">
            <FactCard fact={fact} />
            <FactSaveToggle id={fact.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
