/** One story shown on the dashboard. Every field comes from a public feed; nothing is written by lifeZoi. */
export type NewsCategory = "world" | "us" | "politics" | "business" | "science" | "culture" | "aging" | "brain" | "nutrition" | "exercise" | "research";

export type NewsSection = "world" | "health";

export type NewsStory = {
  id: string;
  title: string;
  /** One or two sentences from the feed's own description. May be empty when the feed has none. */
  summary: string;
  /** Link to the original article. Always http or https. */
  url: string;
  /** ISO 8601 publication time taken from the feed. */
  publishedAt: string;
  source: string;
  category: NewsCategory;
  /** BCP 47 language of the headline and summary, as the source published them. */
  language: string;
};

export type NewsFeed = {
  id: string;
  section: NewsSection;
  category: NewsCategory;
  source: string;
  url: string;
  language: string;
};

export type NewsSectionResult = {
  stories: NewsStory[];
  /** Feeds that answered with at least one readable item. */
  sourcesReached: number;
  sourcesTried: number;
};

export type NewsPayload = {
  world: NewsSectionResult;
  health: NewsSectionResult;
  /** When the server last read the feeds. */
  fetchedAt: string;
};
