"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { fmt, LOCALE_META } from "@/lib/i18n/config";
import type { NewsPayload, NewsSectionResult, NewsStory } from "@/lib/news/types";
import { SECTION_LIMITS } from "@/lib/news/sources";

type State = { phase: "loading" } | { phase: "ready"; payload: NewsPayload } | { phase: "failed" };

function isPayload(value: unknown): value is NewsPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<NewsPayload>;
  return Array.isArray(v.world?.stories) && Array.isArray(v.health?.stories) && typeof v.fetchedAt === "string";
}

/**
 * Today's World News and Health & Longevity News on the dashboard. The stories
 * come from /api/news, which reads public feeds on the server and caches them.
 * When nothing could be read, a plain "not available" note is shown instead of
 * filler content.
 */
export function NewsSections() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/news", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => setState(isPayload(body) ? { phase: "ready", payload: body } : { phase: "failed" }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ phase: "failed" });
      });
    return () => controller.abort();
  }, []);

  const payload = state.phase === "ready" ? state.payload : null;
  return (
    <div className="news-sections">
      <NewsBlock kind="world" phase={state.phase} result={payload?.world ?? null} fetchedAt={payload?.fetchedAt} />
      <NewsBlock kind="health" phase={state.phase} result={payload?.health ?? null} />
    </div>
  );
}

function NewsBlock({
  kind,
  phase,
  result,
  fetchedAt,
}: {
  kind: "world" | "health";
  phase: State["phase"];
  result: NewsSectionResult | null;
  fetchedAt?: string;
}) {
  const { locale, messages: m } = useLocale();
  const n = m.news;
  const titleId = `news-${kind}-title`;
  const stories = result?.stories ?? [];
  const dateFormat = new Intl.DateTimeFormat(LOCALE_META[locale].htmlLang, { dateStyle: "medium", timeStyle: "short" });

  return (
    <section className={`card news-card news-${kind} stack`} aria-labelledby={titleId} aria-busy={phase === "loading"}>
      <div className="news-head">
        <span className="news-icon" aria-hidden="true">
          {kind === "world" ? <GlobeIcon /> : <LeafIcon />}
        </span>
        <div className="stack-sm">
          <h2 id={titleId}>{kind === "world" ? n.worldTitle : n.healthTitle}</h2>
          <p className="hint">{kind === "world" ? n.worldIntro : n.healthIntro}</p>
        </div>
      </div>
      {kind === "health" ? (
        <p className="news-advice" role="note">
          {n.healthNote}
        </p>
      ) : null}
      {phase === "loading" ? (
        <p className="hint" role="status">
          {n.loading}
        </p>
      ) : stories.length === 0 ? (
        <p className="news-unavailable" role="status">
          {n.unavailable}
        </p>
      ) : (
        <>
          <ol className="news-list">
            {stories.map((story) => (
              <StoryItem key={story.id} story={story} dateFormat={dateFormat} />
            ))}
          </ol>
          {stories.length < SECTION_LIMITS[kind].min ? <p className="hint">{fmt(n.fewer, { count: stories.length })}</p> : null}
          {locale !== "en" || fetchedAt ? (
            <p className="hint news-meta-note">
              {locale !== "en" ? `${n.languageNote} ` : ""}
              {fetchedAt ? fmt(n.updated, { time: dateFormat.format(new Date(fetchedAt)) }) : null}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

function StoryItem({ story, dateFormat }: { story: NewsStory; dateFormat: Intl.DateTimeFormat }) {
  const { messages: m } = useLocale();
  const n = m.news;
  const date = new Date(story.publishedAt);
  return (
    <li className="news-story">
      <article className="stack-sm">
        <p className="news-chip">{n.categories[story.category]}</p>
        <h3 lang={story.language}>{story.title}</h3>
        {story.summary ? <p lang={story.language}>{story.summary}</p> : <p className="hint">{n.noSummary}</p>}
        <p className="news-byline">
          <span>{fmt(n.source, { source: story.source })}</span>
          <span aria-hidden="true"> · </span>
          <time dateTime={story.publishedAt}>{fmt(n.published, { date: dateFormat.format(date) })}</time>
        </p>
        <a
          className="news-link"
          href={story.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={fmt(n.readFullAt, { source: story.source })}
        >
          {n.readFull} <span aria-hidden="true">↗</span>
        </a>
      </article>
    </li>
  );
}

function GlobeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9M12 3C9.5 5.7 8.2 8.7 8.2 12s1.3 6.3 3.8 9" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" />
      <path d="M5 19c3-4 6-7 10-9" />
    </svg>
  );
}
