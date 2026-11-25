"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale, useMessages, useT } from "@/components/locale-provider";
import { SourceList } from "@/components/sources";
import { BLOG_ARTICLES, BLOG_VIDEOS, type BlogArticle, type BlogVideo } from "@/lib/blog/articles";
import { parseVideoLink } from "@/lib/blog/video-link";
import { LOCALE_META } from "@/lib/i18n/config";
import { SITE_ORIGIN } from "@/lib/site";
import { sources } from "@/lib/sources";

function publishedLabel(iso: string, htmlLang: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return new Intl.DateTimeFormat(htmlLang, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }).format(date);
}

function JoinNote() {
  const t = useT();
  const a = useMessages().access;
  return (
    <aside className="card stack blog-join" aria-label={t("About lifeZoi")}>
      <h2>{t("Want a calm place to keep track?")}</h2>
      <p>{t("LifeZoi members can reflect on their habits, try a WHAT IF? change, and record small steps. Membership is by invitation.")}</p>
      <div className="actions">
        <Link className="btn btn-primary" href="/sign-in">
          {a.logIn}
        </Link>
        <Link className="btn btn-secondary" href="/#invitation">
          {a.haveInvitation}
        </Link>
      </div>
    </aside>
  );
}

function Notice() {
  const t = useT();
  return (
    <p className="hint blog-notice" role="note">
      {t("Health tips are general wellness education. They are not medical advice, a diagnosis, or a treatment plan. Talk with a qualified clinician about your own health.")}
    </p>
  );
}

/** A video shown by link. Nothing loads from the video site until the reader presses Play. */
export function BlogVideoCard({ video }: { video: BlogVideo }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const link = parseVideoLink(video.link);
  if (!link) return null;
  const site = link.provider === "youtube" ? "YouTube" : "Vimeo";
  return (
    <figure className="blog-video">
      {playing ? (
        <div className="video-frame">
          <iframe
            src={`${link.embedUrl}${link.embedUrl.includes("?") ? "&" : "?"}autoplay=1${link.provider === "youtube" ? "&rel=0" : ""}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <button type="button" className="blog-video-start" onClick={() => setPlaying(true)}>
          <span className="blog-video-play" aria-hidden="true">
            ▶
          </span>
          <span>{t("Play video")}</span>
        </button>
      )}
      <figcaption className="stack-sm">
        <strong lang="en">{video.title}</strong>
        <span className="hint">{video.publisher}</span>
        <span>{t(video.note)}</span>
        <a href={link.watchUrl} target="_blank" rel="noopener noreferrer">
          {t("Watch on {site}", { site })}
        </a>
      </figcaption>
    </figure>
  );
}

function ArticleCard({ article }: { article: BlogArticle }) {
  const t = useT();
  return (
    <li className="card blog-card">
      <p className="kicker">{t(article.topic)}</p>
      <h2 className="blog-card-title">
        <Link href={`/blog/${article.slug}`}>{t(article.title)}</Link>
      </h2>
      <p>{t(article.summary)}</p>
      <p className="hint">{t("{minutes} min read", { minutes: article.readMinutes })}</p>
    </li>
  );
}

export function BlogIndexView() {
  const t = useT();
  return (
    <div className="stack-lg blog">
      <header className="stack">
        <p className="kicker">{t("Health tips")}</p>
        <h1>{t("Small steps for everyday wellness")}</h1>
        <p className="blog-lead">
          {t("Short, calm articles about movement, sleep, food, stress, and connection. Each one links to the public guidance it is based on, and ends with a few small things to try.")}
        </p>
        <Notice />
      </header>

      <section aria-labelledby="blog-articles">
        <h2 id="blog-articles" className="sr-only">
          {t("Articles")}
        </h2>
        <ul className="blog-grid">
          {BLOG_ARTICLES.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </ul>
      </section>

      <section className="stack" aria-labelledby="blog-videos">
        <h2 id="blog-videos">{t("Short videos")}</h2>
        <p>{t("Short exercise films from public health organisations. They play from the publisher’s own channel.")}</p>
        <div className="blog-video-grid">
          {BLOG_VIDEOS.map((video) => (
            <BlogVideoCard key={video.link} video={video} />
          ))}
        </div>
      </section>

      <JoinNote />
    </div>
  );
}

/** Share links open the other site only when the reader presses one. No share script is loaded. */
export function ShareButtons({ path, title }: { path: string; title: string }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);
  const url = `${SITE_ORIGIN}${path}`;
  const u = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${text}%20${u}` },
    { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${text}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X", href: `https://x.com/intent/post?url=${u}&text=${text}` },
  ];
  return (
    <section className="blog-share" aria-label={t("Share this article")}>
      <p className="blog-share-title">{t("Share this article")}</p>
      <div className="blog-share-row">
        {canShare ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              navigator.share({ title, url }).catch(() => undefined);
            }}
          >
            {t("Share")}
          </button>
        ) : null}
        {links.map((link) => (
          <a key={link.name} className="btn btn-secondary" href={link.href} target="_blank" rel="noopener noreferrer">
            {link.name}
          </a>
        ))}
        <a className="btn btn-secondary" href={`mailto:?subject=${text}&body=${u}`}>
          {t("Email")}
        </a>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            navigator.clipboard
              ?.writeText(url)
              .then(() => setCopied(true))
              .catch(() => setCopied(false));
          }}
        >
          {copied ? t("Link copied") : t("Copy link")}
        </button>
      </div>
    </section>
  );
}

export function BlogArticleView({ article }: { article: BlogArticle }) {
  const t = useT();
  const { locale } = useLocale();
  const others = BLOG_ARTICLES.filter((item) => item.slug !== article.slug && item.topic === article.topic)
    .concat(BLOG_ARTICLES.filter((item) => item.slug !== article.slug && item.topic !== article.topic))
    .slice(0, 3);
  return (
    <div className="stack-lg blog">
      <nav aria-label={t("Breadcrumb")}>
        <Link href="/blog">← {t("All health tips")}</Link>
      </nav>
      <article className="stack-lg narrow blog-article">
        <header className="stack">
          <p className="kicker">{t(article.topic)}</p>
          <h1>{t(article.title)}</h1>
          <p className="blog-lead">{t(article.summary)}</p>
          <p className="hint">
            <time dateTime={article.published}>{publishedLabel(article.published, LOCALE_META[locale].htmlLang)}</time> ·{" "}
            {t("{minutes} min read", { minutes: article.readMinutes })}
          </p>
        </header>

        {article.sections.map((section) => (
          <section key={section.heading} className="stack">
            <h2>{t(section.heading)}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{t(paragraph)}</p>
            ))}
          </section>
        ))}

        {article.video ? <BlogVideoCard video={article.video} /> : null}

        <section className="card stack blog-try">
          <h2>{t("Try this")}</h2>
          <ul>
            {article.tryThis.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
          </ul>
        </section>

        <section className="stack">
          <SourceList sources={article.sourceIds.map((id) => sources[id])} />
        </section>

        <Notice />
        <ShareButtons path={`/blog/${article.slug}`} title={t(article.title)} />
      </article>

      {others.length > 0 ? (
        <section className="stack" aria-labelledby="blog-more">
          <h2 id="blog-more">{t("More health tips")}</h2>
          <ul className="blog-grid">
            {others.map((item) => (
              <ArticleCard key={item.slug} article={item} />
            ))}
          </ul>
        </section>
      ) : null}

      <JoinNote />
    </div>
  );
}
