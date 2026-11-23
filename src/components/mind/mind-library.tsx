"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { ExerciseLinks, formatDate, MotifArt } from "@/components/mind/shared";
import { ARTICLES, recommendArticles, type Article } from "@/lib/mind/articles";
import { EVIDENCE_LABELS } from "@/lib/mind/evidence";

export function MindLibrary() {
  const t = useT();
  const [query, setQuery] = useState("");
  const categories = [...new Set(ARTICLES.map((article) => article.category))];
  const [category, setCategory] = useState<string | null>(null);
  const searched = query.trim()
    ? (() => {
        const lower = query.trim().toLowerCase();
        const byText = ARTICLES.filter((article) => `${article.title} ${article.summary} ${t(article.title)} ${t(article.summary)}`.toLowerCase().includes(lower));
        const byKeyword = recommendArticles(query, ARTICLES.length);
        return [...new Map([...byText, ...byKeyword].map((article) => [article.slug, article])).values()];
      })()
    : ARTICLES;
  const shown = category ? searched.filter((article) => article.category === category) : searched;
  return (
    <div className="stack-lg">
      <p className="mind-note">
        {t("Short, plain-language articles based on public guidance from the American Psychological Association, the National Institute of Mental Health, other U.S. health agencies, and published research. Each section is labeled by how settled the evidence is. LifeZoi Mind also suggests articles while you talk.")}{" "}
        <Link href="/mind">{t("Talk")}</Link>
      </p>
      <label className="stack" style={{ gap: "0.3rem" }}>
        <span>
          <strong>{t("Search the encyclopedia")}</strong>
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("For example: sleep, worry, loneliness")}
          style={{ font: "inherit", minHeight: 52, borderRadius: 14, border: "1px solid var(--line)", padding: "0.5rem 0.9rem" }}
        />
      </label>
      <div className="mind-chips" role="group" aria-label={t("Filter by topic")}>
        <button type="button" className="mind-chip" aria-pressed={category === null} onClick={() => setCategory(null)}>
          {t("All topics")}
        </button>
        {categories.map((entry) => (
          <button key={entry} type="button" className="mind-chip" aria-pressed={category === entry} onClick={() => setCategory(entry)}>
            {t(entry)}
          </button>
        ))}
      </div>
      {shown.length === 0 ? <p>{t("No article matches that yet. Try another word.")}</p> : null}
      <div className="mind-grid">
        {shown.map((article) => (
          <Link key={article.slug} href={`/mind/library/${article.slug}`} className="mind-card">
            <MotifArt motif={article.motif} className="mind-card-art" />
            <span className="mind-tag">{t(article.category)}</span>
            <h3>{t(article.title)}</h3>
            <p>{t(article.summary)}</p>
            <p className="mind-card-meta">{t("{minutes} min read", { minutes: article.minutes })}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function MindArticle({ article }: { article: Article }) {
  const t = useT();
  const { locale } = useLocale();
  const related = ARTICLES.filter((entry) => entry.slug !== article.slug && entry.category === article.category).slice(0, 3);
  return (
    <article className="mind-article">
      <MotifArt motif={article.motif} className="mind-article-art" />
      <p className="mind-card-meta">
        {t(article.category)} · {t("{minutes} min read", { minutes: article.minutes })} · {t("Reviewed {date}", { date: formatDate(article.reviewed, locale) })}
      </p>
      <p className="lede">{t(article.summary)}</p>
      {article.sections.map((section) => (
        <section key={section.heading}>
          <h2>{t(section.heading)}</h2>
          {section.evidence ? (
            <span className="mind-evidence" data-level={section.evidence} title={t(EVIDENCE_LABELS[section.evidence].meaning)}>
              {t(EVIDENCE_LABELS[section.evidence].label)}
            </span>
          ) : null}
          {section.paragraphs.map((text) => (
            <p key={text}>{t(text)}</p>
          ))}
        </section>
      ))}
      <aside className="mind-example">
        <strong>{t(article.example.title)}</strong>
        <p>{t(article.example.text)}</p>
        <p className="hint">{t("This example is made up to illustrate the idea. It is not a real person.")}</p>
      </aside>
      <ExerciseLinks ids={article.exercises} />
      <section>
        <h2>{t("References")}</h2>
        <ul className="mind-refs" lang="en">
          {article.references.map((reference) => (
            <li key={reference.url}>
              <a href={reference.url} target="_blank" rel="noreferrer">
                {reference.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="hint">{t("Links go to the original source. Educational information only; it is not medical advice.")}</p>
      </section>
      <section>
        <h2>{t("What the evidence labels mean")}</h2>
        <ul className="mind-list">
          {Object.values(EVIDENCE_LABELS).map((entry) => (
            <li key={entry.label}>
              <strong>{t(entry.label)}:</strong> {t(entry.meaning)}
            </li>
          ))}
        </ul>
      </section>
      <div className="actions">
        <Link className="btn btn-primary" href="/mind">
          {t("Back to my conversation")}
        </Link>
        <Link className="btn btn-secondary" href="/mind/library">
          {t("All articles")}
        </Link>
      </div>
      {related.length ? (
        <section>
          <h2>{t("Related articles")}</h2>
          <ul className="mind-list">
            {related.map((entry) => (
              <li key={entry.slug}>
                <Link href={`/mind/library/${entry.slug}`}>{t(entry.title)}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
