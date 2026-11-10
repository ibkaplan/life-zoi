import { parseFeed } from "./parse";
import { NEWS_FEEDS, SECTION_LIMITS } from "./sources";
import type { NewsFeed, NewsPayload, NewsSection, NewsSectionResult, NewsStory } from "./types";

export type FeedFetcher = (url: string) => Promise<string | null>;

const FEED_TIMEOUT_MS = 8_000;
const MAX_FEED_BYTES = 1_500_000;
/** A feed clock a little ahead of ours is fine; a date far in the future is not trusted. */
const FUTURE_TOLERANCE_MS = 60 * 60 * 1000;

/** The default fetcher: a plain GET with a timeout and a size cap. Returns null on any failure. */
export const fetchFeedText: FeedFetcher = async (url) => {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const text = await response.text();
    return text.length > MAX_FEED_BYTES ? null : text;
  } catch {
    return null;
  }
};

const normalizeTitle = (title: string) => title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

function storiesFrom(feed: NewsFeed, xml: string | null, now: number): NewsStory[] | null {
  if (!xml) return null;
  const items = parseFeed(xml);
  if (items.length === 0) return null;
  const oldest = now - SECTION_LIMITS[feed.section].maxAgeHours * 60 * 60 * 1000;
  return items
    .filter((item): item is typeof item & { published: number } =>
      item.published !== null && item.published >= oldest && item.published <= now + FUTURE_TOLERANCE_MS,
    )
    .sort((a, b) => b.published - a.published)
    .map((item) => ({
      id: `${feed.id}:${item.link}`,
      title: item.title,
      summary: item.summary,
      url: item.link,
      publishedAt: new Date(Math.min(item.published, now)).toISOString(),
      source: feed.source,
      category: feed.category,
      language: feed.language,
    }));
}

/**
 * Picks stories for a section: one from each feed in turn, so world news covers
 * several topics instead of five versions of one headline, then newest first.
 */
export function selectStories(perFeed: NewsStory[][], max: number): NewsStory[] {
  const queues = perFeed.map((stories) => [...stories]);
  const chosen: NewsStory[] = [];
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  while (chosen.length < max && queues.some((queue) => queue.length > 0)) {
    for (const queue of queues) {
      if (chosen.length >= max) break;
      while (queue.length > 0) {
        const story = queue.shift()!;
        const key = normalizeTitle(story.title);
        if (seenTitles.has(key) || seenUrls.has(story.url)) continue;
        seenTitles.add(key);
        seenUrls.add(story.url);
        chosen.push(story);
        break;
      }
    }
  }
  return chosen.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

async function loadSection(section: NewsSection, fetcher: FeedFetcher, now: number): Promise<NewsSectionResult> {
  const feeds = NEWS_FEEDS.filter((feed) => feed.section === section);
  const results = await Promise.all(feeds.map(async (feed) => storiesFrom(feed, await fetcher(feed.url).catch(() => null), now)));
  const reached = results.filter((result): result is NewsStory[] => result !== null);
  return {
    stories: selectStories(reached, SECTION_LIMITS[section].max),
    sourcesReached: reached.length,
    sourcesTried: feeds.length,
  };
}

/** Reads every feed once and returns only what the feeds actually contain. Nothing is invented or padded. */
export async function loadNews(fetcher: FeedFetcher = fetchFeedText, now: number = Date.now()): Promise<NewsPayload> {
  const [world, health] = await Promise.all([loadSection("world", fetcher, now), loadSection("health", fetcher, now)]);
  return { world, health, fetchedAt: new Date(now).toISOString() };
}

/** True when neither section has a story, so the cache should be short and the page shows the unavailable note. */
export function newsIsEmpty(payload: NewsPayload): boolean {
  return payload.world.stories.length === 0 && payload.health.stories.length === 0;
}
