import type { NewsFeed, NewsSection } from "./types";

/**
 * Free public RSS feeds from established newsrooms and research bodies.
 * No API key, account, or paid plan is involved. Reading a feed sends no
 * information about the visitor: the server asks for the feed on its own.
 */
export const NEWS_FEEDS: readonly NewsFeed[] = [
  { id: "bbc-world", section: "world", category: "world", source: "BBC News", url: "https://feeds.bbci.co.uk/news/world/rss.xml", language: "en" },
  { id: "npr-news", section: "world", category: "us", source: "NPR", url: "https://feeds.npr.org/1001/rss.xml", language: "en" },
  { id: "npr-politics", section: "world", category: "politics", source: "NPR", url: "https://feeds.npr.org/1014/rss.xml", language: "en" },
  { id: "bbc-business", section: "world", category: "business", source: "BBC News", url: "https://feeds.bbci.co.uk/news/business/rss.xml", language: "en" },
  { id: "bbc-science", section: "world", category: "science", source: "BBC News", url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", language: "en" },
  { id: "bbc-technology", section: "world", category: "science", source: "BBC News", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", language: "en" },
  { id: "bbc-culture", section: "world", category: "culture", source: "BBC News", url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", language: "en" },
  { id: "sd-healthy-aging", section: "health", category: "aging", source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/health_medicine/healthy_aging.xml", language: "en" },
  { id: "sd-memory", section: "health", category: "brain", source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/mind_brain/memory.xml", language: "en" },
  { id: "sd-nutrition", section: "health", category: "nutrition", source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/health_medicine/nutrition.xml", language: "en" },
  { id: "sd-fitness", section: "health", category: "exercise", source: "ScienceDaily", url: "https://www.sciencedaily.com/rss/health_medicine/fitness.xml", language: "en" },
  { id: "nih-news", section: "health", category: "research", source: "National Institutes of Health", url: "https://www.nih.gov/news-releases/feed.xml", language: "en" },
  { id: "harvard-health", section: "health", category: "research", source: "Harvard Health Publishing", url: "https://www.health.harvard.edu/blog/feed", language: "en" },
];

export const SECTION_LIMITS: Record<NewsSection, { min: number; max: number; maxAgeHours: number }> = {
  // World news must be from the last two days so yesterday's headline is never shown as today's.
  world: { min: 3, max: 5, maxAgeHours: 48 },
  // Research news moves more slowly; two weeks keeps it recent without padding the list.
  health: { min: 2, max: 3, maxAgeHours: 24 * 14 },
};

/** How long the server keeps the feeds before reading them again. */
export const NEWS_REFRESH_SECONDS = 6 * 60 * 60;
