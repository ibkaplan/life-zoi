"use client";

import "@/components/encyclopedia/encyclopedia.css";
import Link from "next/link";
import { useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { Illustration } from "@/components/encyclopedia/illustrations";
import { ArticleCard, Disclaimer } from "@/components/encyclopedia/parts";
import { useArticles } from "@/components/encyclopedia/use-encyclopedia";
import { findArticle } from "@/lib/encyclopedia/catalog";
import { FACT_EVIDENCE } from "@/lib/encyclopedia/facts";
import { findStory, STORIES, STORY_APPROACHES, STORY_CONDITIONS, STORY_KINDS, STORY_THEMES, storiesFor, videoEmbedUrl, type HealthStory, type StoryKind, type StoryVideo } from "@/lib/encyclopedia/stories";
import type { Article } from "@/lib/encyclopedia/types";

const TITLE = "Real People. Real Stories. Real Medical Knowledge.";
const TAGLINE = "Learn from human experience. Discover what science really says.";

function art(story: HealthStory): string {
  return story.illustration;
}

function Crumbs({ children }: { children?: React.ReactNode }) {
  const t = useT();
  return (
    <nav className="ency-crumbs" aria-label={t("Breadcrumb")}>
      <Link href="/encyclopedia">{t("Health Encyclopedia")}</Link>
      <span aria-hidden="true"> / </span>
      {children ?? <span>{t("Real Stories")}</span>}
    </nav>
  );
}

function KindBadge({ kind }: { kind: StoryKind }) {
  const t = useT();
  return <span className={`ency-badge story-kind-${kind}`}>{t(STORY_KINDS[kind].label)}</span>;
}

function StoryCard({ story }: { story: HealthStory }) {
  const t = useT();
  return (
    <article className="fact-card story-card">
      <div className="fact-card-art">
        <Illustration name={art(story)} />
      </div>
      <div className="fact-card-body">
        <p className="fact-card-meta">{t(story.place)}</p>
        <h3>{t(story.title)}</h3>
        <p>{t(story.teaser)}</p>
        <div className="fact-card-foot">
          <KindBadge kind={story.kind} />
          <Link className="btn btn-secondary" href={`/encyclopedia/stories/${story.id}`}>
            {t("Read the story")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function ChipFilter({
  label,
  all,
  items,
  value,
  onChange,
}: {
  label: string;
  all: string;
  items: readonly { slug: string; title: string }[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const t = useT();
  return (
    <div className="ency-chips" role="group" aria-label={label}>
      <span className="hint">{label}:</span>
      <button type="button" className="ency-chip" aria-pressed={value === null} onClick={() => onChange(null)}>
        {all}
      </button>
      {items.map((item) => (
        <button key={item.slug} type="button" className="ency-chip" aria-pressed={value === item.slug} onClick={() => onChange(item.slug)}>
          {t(item.title)}
        </button>
      ))}
    </div>
  );
}

function VideoItem({ video }: { video: StoryVideo }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);
  const embed = videoEmbedUrl(video);
  return (
    <li className="story-video">
      <p>
        <strong lang="en">{video.title}</strong> <span className="hint">{video.publisher}</span>
      </p>
      {embed && playing ? (
        <div className="video-frame story-video-frame">
          <iframe
            src={`${embed}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : embed ? (
        <button type="button" className="btn btn-secondary" onClick={() => setPlaying(true)}>
          ▶ {t("Play video")}
        </button>
      ) : (
        <a className="btn btn-secondary" href={video.url} target="_blank" rel="noopener noreferrer">
          {t("Watch on the publisher's website")}
        </a>
      )}
      {embed ? <p className="hint">{t("The video plays from YouTube only after you press Play.")}</p> : null}
    </li>
  );
}

/** Stories are translated; source titles and video titles keep their original language. */
function StoriesLanguageNote() {
  const { locale, t } = useLocale();
  if (locale === "en") return null;
  return (
    <p className="ency-lang-note" role="note">
      {t("Stories are translated. Source titles and videos stay in their original language.")}
    </p>
  );
}

function EmptyStories() {
  const t = useT();
  return <p className="ency-empty">{t("Stories are being prepared. Each one is checked against its sources before it is published.")}</p>;
}

/** The stories block on the encyclopedia homepage. */
export function StoriesTeaser() {
  const t = useT();
  const first = STORIES.slice(0, 3);
  return (
    <section className="ency-block" aria-labelledby="stories-teaser">
      <div className="ency-block-head">
        <h2 id="stories-teaser">{t(TITLE)}</h2>
        <Link href="/encyclopedia/stories">{t("See all stories")}</Link>
      </div>
      <p>{t(TAGLINE)}</p>
      {first.length > 0 ? (
        <div className="ency-grid">
          {first.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <EmptyStories />
      )}
    </section>
  );
}

function HowWeTell() {
  const t = useT();
  return (
    <section className="ency-block card">
      <h2>{t("How we tell these stories")}</h2>
      <dl className="ency-legend">
        {(Object.keys(STORY_KINDS) as StoryKind[]).map((kind) => (
          <div key={kind}>
            <dt>
              <KindBadge kind={kind} />
            </dt>
            <dd>{t(STORY_KINDS[kind].note)}</dd>
          </div>
        ))}
      </dl>
      <p className="hint">{t("One person's experience is not proof that something works for everyone. Each story is paired with what research shows, and with its limits.")}</p>
    </section>
  );
}

export function StoriesView() {
  const t = useT();
  const [theme, setTheme] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [approach, setApproach] = useState<string | null>(null);
  const [kind, setKind] = useState<StoryKind | null>(null);
  const shown = storiesFor({ theme, condition, approach, kind });
  return (
    <div className="ency stack-lg">
      <Crumbs />
      <header className="ency-hero ency-hero-small">
        <div className="ency-hero-text">
          <h1>{t(TITLE)}</h1>
          <p>{t(TAGLINE)}</p>
          <p>{t("Stories of courage, uncertainty, treatment, discipline, recovery, aging, family, and community. Some are inspiring and some are difficult. Every story is honest about what it does and does not show.")}</p>
        </div>
        <Illustration name="heart" className="ency-hero-illustration" />
      </header>
      <StoriesLanguageNote />
      <ChipFilter label={t("Health condition")} all={t("All conditions")} items={STORY_CONDITIONS} value={condition} onChange={setCondition} />
      <ChipFilter label={t("Approach to care")} all={t("All approaches")} items={STORY_APPROACHES} value={approach} onChange={setApproach} />
      <ChipFilter label={t("Theme")} all={t("All themes")} items={STORY_THEMES} value={theme} onChange={setTheme} />
      <ChipFilter
        label={t("Kind of story")}
        all={t("All stories")}
        items={(Object.keys(STORY_KINDS) as StoryKind[]).map((slug) => ({ slug, title: STORY_KINDS[slug].label }))}
        value={kind}
        onChange={(value) => setKind(value as StoryKind | null)}
      />
      <p className="hint" aria-live="polite">
        {t("{count} stories", { count: shown.length })}
      </p>
      {shown.length > 0 ? (
        <div className="ency-grid">
          {shown.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <EmptyStories />
      )}
      <HowWeTell />
      <Disclaimer />
    </div>
  );
}

export function StoryPage({ id }: { id: string }) {
  const t = useT();
  const articles = useArticles();
  const story = findStory(id);
  if (!story) {
    return (
      <div className="ency stack-lg">
        <Crumbs />
        <h1>{t("This story is not in the encyclopedia")}</h1>
        <Link className="btn btn-primary" href="/encyclopedia/stories">
          {t("See all stories")}
        </Link>
      </div>
    );
  }
  const linked = (story.articles ?? []).map((slug) => findArticle(slug, articles)).filter((item): item is Article => Boolean(item));
  return (
    <div className="ency stack-lg">
      <Crumbs>
        <Link href="/encyclopedia/stories">{t("Real Stories")}</Link>
      </Crumbs>
      <article className="fact-detail">
        <header className="fact-detail-head">
          <div className="fact-today-art">
            <Illustration name={art(story)} />
          </div>
          <div>
            <p className="ency-kicker">{t(story.place)}</p>
            <h1>{t(story.title)}</h1>
            <p>
              <KindBadge kind={story.kind} /> <span className="hint">{t(STORY_KINDS[story.kind].note)}</span>
            </p>
            <p className="ency-chips">
              {[...story.conditions.map((slug) => STORY_CONDITIONS.find((item) => item.slug === slug)?.title), ...story.approaches.map((slug) => STORY_APPROACHES.find((item) => item.slug === slug)?.title)]
                .filter((title): title is NonNullable<typeof title> => Boolean(title))
                .map((title) => (
                  <span key={title} className="ency-chip">
                    {t(title)}
                  </span>
                ))}
            </p>
          </div>
        </header>
        <StoriesLanguageNote />
        <section className="fact-section">
          <h2>{t("The story")}</h2>
          {story.story.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{t(paragraph)}</p>
          ))}
        </section>
        <section className="fact-section">
          <h2>{t("What science says")}</h2>
          <ul className="story-science">
            {story.science.map((item) => (
              <li key={item.point}>
                <span className={`ency-badge fact-badge-${item.level}`}>{t(FACT_EVIDENCE[item.level].label)}</span> <span>{t(item.point)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="fact-section">
          <h2>{t("What this story does not show")}</h2>
          <p>{t(story.limits)}</p>
        </section>
        {story.videos && story.videos.length > 0 ? (
          <section className="fact-section">
            <h2>{t("Watch")}</h2>
            <ul className="story-videos">
              {story.videos.map((video) => (
                <VideoItem key={video.url} video={video} />
              ))}
            </ul>
          </section>
        ) : null}
        <section className="fact-section">
          <h2>{t("Sources")}</h2>
          <ul className="fact-sources">
            {story.sources.map((source) => (
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
        </section>
        <div className="fact-actions">
          <Link className="btn btn-secondary" href={`/lifezoi-ai?q=${encodeURIComponent(`What does science say about: ${story.title}`)}${linked[0] ? `&article=${linked[0].slug}` : ""}`}>
            {t("Ask LifeZoi AI what science says")}
          </Link>
        </div>
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
      <Disclaimer />
    </div>
  );
}
