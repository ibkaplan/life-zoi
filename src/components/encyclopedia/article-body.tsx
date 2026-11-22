"use client";

import { useT } from "@/components/locale-provider";
import { usePageFormat } from "@/components/page-format";
import { ReadAloud } from "@/components/voice/read-aloud";
import { ArticleArt, Disclaimer, EnglishOnlyNote, EvidenceList, ReadingControls, SafetyNotes } from "@/components/encyclopedia/parts";
import { useReadingPrefs } from "@/components/encyclopedia/use-encyclopedia";
import { readingMinutes } from "@/lib/encyclopedia/catalog";
import { categoryFor } from "@/lib/encyclopedia/categories";
import { glossaryTerm } from "@/lib/encyclopedia/glossary";
import type { Article } from "@/lib/encyclopedia/types";
import { VOICE_SKIP_ATTR } from "@/lib/voice/dom";

const sectionId = (slug: string, index: number) => `ency-${slug}-s${index}`;

/**
 * One article in the chosen reading mode. Used by the article page, the editor's
 * preview, and LifeZoi AI's in-place reader, so all three show the same thing.
 * Listen reads exactly the text shown here, in the mode shown.
 */
export function ArticleBody({ article, actions, headingLevel = 1 }: { article: Article; actions?: React.ReactNode; headingLevel?: 1 | 2 }) {
  const t = useT();
  const { longDate } = usePageFormat();
  const [prefs] = useReadingPrefs();
  const easy = prefs.mode === "easy";
  const category = categoryFor(article.category);
  const readId = `ency-read-${article.slug}`;
  const Title = headingLevel === 1 ? "h1" : "h2";
  const Sub = headingLevel === 1 ? "h2" : "h3";
  const terms = (article.terms ?? []).map(glossaryTerm).filter((term) => term !== undefined);

  return (
    <article className={`ency-article ency-mode-${prefs.mode}`} style={{ "--ency-scale": prefs.size } as React.CSSProperties}>
      <div className="ency-article-tools" {...{ [VOICE_SKIP_ATTR]: "" }}>
        <ReadingControls />
        <div className="ency-listen">
          <ReadAloud key={`${article.slug}-${prefs.mode}`} target={readId} label={t("Listen to Article")} compact />
        </div>
        {actions ? <div className="ency-actions">{actions}</div> : null}
      </div>

      <div id={readId} className="ency-article-text">
        <header className="ency-article-head">
          <p className="ency-kicker" {...{ [VOICE_SKIP_ATTR]: "" }}>
            {category ? t(category.title) : ""} · {t("{minutes} min read", { minutes: readingMinutes(article) })}
          </p>
          <Title lang="en">{article.title}</Title>
          <p className="ency-lead" lang="en">
            {easy ? article.easySummary : article.summary}
          </p>
        </header>

        <div {...{ [VOICE_SKIP_ATTR]: "" }}>
          <EnglishOnlyNote />
          <SafetyNotes topics={article.safety} />
        </div>

        <div className="ency-hero-art" {...{ [VOICE_SKIP_ATTR]: "" }}>
          <ArticleArt article={article} />
        </div>

        {article.sections.length > 2 ? (
          <nav className="ency-toc" aria-label={t("In this article")}>
            <p className="ency-toc-title">{t("In this article")}</p>
            <ol>
              {article.sections.map((section, index) => (
                <li key={index}>
                  <a href={`#${sectionId(article.slug, index)}`} lang="en">
                    {section.heading}
                  </a>
                </li>
              ))}
              <li>
                <a href={`#${sectionId(article.slug, 99)}`}>{t("Key takeaways")}</a>
              </li>
            </ol>
          </nav>
        ) : null}

        {article.sections.map((section, index) => {
          const paragraphs = easy && section.easy && section.easy.length > 0 ? section.easy : section.standard;
          return (
            <section key={index} id={sectionId(article.slug, index)} className="ency-section" lang="en">
              <Sub>{section.heading}</Sub>
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points && section.points.length > 0 ? (
                <ul className="ency-points">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}

        <section id={sectionId(article.slug, 99)} className="ency-takeaways">
          <Sub>{t("Key takeaways")}</Sub>
          <ul lang="en">
            {article.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div {...{ [VOICE_SKIP_ATTR]: "" }}>
        <EvidenceList claims={article.evidence} />
      </div>

      {terms.length > 0 ? (
        <section className="ency-glossary-box" aria-labelledby={`${readId}-terms`}>
          <Sub id={`${readId}-terms`}>{t("Words explained")}</Sub>
          <div className="ency-terms">
            {terms.map((term) => (
              <details key={term.id}>
                <summary lang="en">{term.term}</summary>
                <p lang="en">{term.meaning}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ency-sources" aria-labelledby={`${readId}-sources`}>
        <Sub id={`${readId}-sources`}>{t("Sources and references")}</Sub>
        <ol>
          {article.references.map((ref) => (
            <li key={ref.url + ref.title}>
              <a href={ref.url} target="_blank" rel="noopener noreferrer" lang="en">
                {ref.title}
              </a>
              <span className="hint">
                {" "}
                · {ref.publisher}
                {ref.date ? ` · ${ref.date}` : ""}
              </span>
            </li>
          ))}
        </ol>
        <p className="hint">{t("LifeZoi summaries are written in our own words. Follow the links to read the original sources.")}</p>
      </section>

      <section className="ency-dates" aria-label={t("Article dates")}>
        <dl>
          <div>
            <dt>{t("First published")}</dt>
            <dd>{longDate(article.publishedOn)}</dd>
          </div>
          <div>
            <dt>{t("Last updated")}</dt>
            <dd>{longDate(article.updatedOn)}</dd>
          </div>
          <div>
            <dt>{t("Last reviewed")}</dt>
            <dd>
              {article.review
                ? t("{date}, by {reviewer}", { date: longDate(article.review.reviewedOn), reviewer: article.review.reviewer })
                : t("Not yet reviewed by a qualified health professional")}
            </dd>
          </div>
        </dl>
        <p className="hint">{article.review ? t("Written by {author}.", { author: article.draftedBy }) : t("Draft prepared from the sources above and checked against them. It is waiting for review by a qualified health professional before it is marked as reviewed.")}</p>
      </section>

      <Disclaimer />
    </article>
  );
}
