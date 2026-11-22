"use client";

import Link from "next/link";
import { useLocale, useT } from "@/components/locale-provider";
import { Illustration } from "@/components/encyclopedia/illustrations";
import { TEXT_SIZES, useReadingPrefs } from "@/components/encyclopedia/use-encyclopedia";
import { commitCompanion, useCompanion } from "@/lib/companion/store";
import { toggleFavorite } from "@/lib/companion/state";
import { readingMinutes } from "@/lib/encyclopedia/catalog";
import { categoryFor, ENCYCLOPEDIA_DISCLAIMER, EVIDENCE_INFO, SAFETY_NOTES, STUDY_TYPE_TEXT } from "@/lib/encyclopedia/categories";
import type { Article, EvidenceClaim, EvidenceLevel, SafetyTopic } from "@/lib/encyclopedia/types";
import { VOICE_SKIP_ATTR } from "@/lib/voice/dom";

export const favoriteId = (slug: string) => `ency:${slug}`;

export function ArticleArt({ article, className }: { article: Article; className?: string }) {
  const image = article.image;
  if (image?.url) {
    return (
      <figure className={`ency-photo ${className ?? ""}`}>
        {/* An editor's licensed image, from any https host. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.url} alt={image.alt} loading="lazy" />
        {image.credit || image.license ? (
          <figcaption>
            {image.credit}
            {image.credit && image.license ? " · " : ""}
            {image.license}
          </figcaption>
        ) : null}
      </figure>
    );
  }
  const name = image?.illustration ?? categoryFor(article.category)?.illustration ?? "microscope";
  return <Illustration name={name} alt={image?.alt} className={className} />;
}

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const t = useT();
  return (
    <span className={`ency-badge ency-badge-${level}`}>
      <span aria-hidden="true" className="ency-badge-dot" />
      {t(EVIDENCE_INFO[level].label)}
    </span>
  );
}

export function EvidenceList({ claims }: { claims: readonly EvidenceClaim[] }) {
  const t = useT();
  if (claims.length === 0) return null;
  return (
    <section className="ency-evidence" aria-labelledby="ency-evidence-title">
      <h2 id="ency-evidence-title">{t("Evidence check")}</h2>
      <p className="hint">{t("Each label applies to one specific claim, not to the whole topic.")}</p>
      <ul>
        {claims.map((claim) => (
          <li key={claim.claim}>
            <EvidenceBadge level={claim.level} />
            <span lang="en">{claim.claim}</span>
            <span className="hint">{t(STUDY_TYPE_TEXT[claim.basis])}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function EvidenceLegend() {
  const t = useT();
  return (
    <dl className="ency-legend">
      {(Object.keys(EVIDENCE_INFO) as EvidenceLevel[]).map((level) => (
        <div key={level}>
          <dt>
            <EvidenceBadge level={level} />
          </dt>
          <dd>{t(EVIDENCE_INFO[level].meaning)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SafetyNotes({ topics }: { topics?: readonly SafetyTopic[] }) {
  const t = useT();
  if (!topics || topics.length === 0) return null;
  return (
    <div className="ency-safety">
      {topics.map((topic) => (
        <aside key={topic} className="ency-safety-note" role="note">
          <strong>{t(SAFETY_NOTES[topic].title)}</strong>
          <p>{t(SAFETY_NOTES[topic].text)}</p>
        </aside>
      ))}
    </div>
  );
}

export function Disclaimer() {
  const t = useT();
  return <p className="ency-disclaimer">{t(ENCYCLOPEDIA_DISCLAIMER)}</p>;
}

/** Shown when the site language is not English, because article bodies are English only for now. */
export function EnglishOnlyNote() {
  const { locale, t } = useLocale();
  if (locale === "en") return null;
  return (
    <p className="ency-lang-note" role="note">
      {t("Encyclopedia articles are written in English for now. Menus, buttons, labels, and safety notes are translated.")}
    </p>
  );
}

export function FavoriteToggle({ slug }: { slug: string }) {
  const t = useT();
  const { state } = useCompanion();
  const on = state.media.favorites.includes(favoriteId(slug));
  return (
    <button className="btn btn-secondary" type="button" aria-pressed={on} onClick={() => commitCompanion((current) => toggleFavorite(current, favoriteId(slug)))}>
      {on ? `★ ${t("Saved to My Library")}` : `☆ ${t("Save to My Library")}`}
    </button>
  );
}

export function ArticleCard({ article, onOpen, compact = false }: { article: Article; onOpen?: (slug: string) => void; compact?: boolean }) {
  const t = useT();
  const category = categoryFor(article.category);
  const minutes = readingMinutes(article);
  return (
    <article className={`ency-card${compact ? " ency-card-compact" : ""}`}>
      <div className="ency-card-art">
        <ArticleArt article={article} />
      </div>
      <div className="ency-card-body">
        <p className="ency-card-meta">
          {category ? t(category.title) : ""} · {t("{minutes} min read", { minutes })}
        </p>
        <h3 lang="en">{article.title}</h3>
        <p lang="en">{article.easySummary}</p>
        {onOpen ? (
          <button className="btn btn-primary" type="button" onClick={() => onOpen(article.slug)}>
            {t("Read Full Article")}
          </button>
        ) : (
          <Link className="btn btn-primary" href={`/encyclopedia/articles/${article.slug}`}>
            {t("Read Full Article")}
          </Link>
        )}
      </div>
    </article>
  );
}

/** Easy / Standard and text size. Saved in this browser. */
export function ReadingControls() {
  const t = useT();
  const [prefs, save] = useReadingPrefs();
  return (
    <div className="ency-reading" role="group" aria-label={t("Reading options")} {...{ [VOICE_SKIP_ATTR]: "" }}>
      <div className="ency-seg" role="radiogroup" aria-label={t("Reading mode")}>
        <button type="button" role="radio" aria-checked={prefs.mode === "easy"} onClick={() => save({ mode: "easy" })}>
          {t("Easy Reading")}
        </button>
        <button type="button" role="radio" aria-checked={prefs.mode === "standard"} onClick={() => save({ mode: "standard" })}>
          {t("Standard Reading")}
        </button>
      </div>
      <div className="ency-seg" role="radiogroup" aria-label={t("Text size")}>
        {TEXT_SIZES.map((size, index) => (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={prefs.size === size}
            aria-label={t("Text size {n} of {total}", { n: index + 1, total: TEXT_SIZES.length })}
            onClick={() => save({ size })}
            style={{ fontSize: `${0.85 + index * 0.18}rem` }}
          >
            A
          </button>
        ))}
      </div>
    </div>
  );
}
