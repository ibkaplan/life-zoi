import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { firstNameOf } from "./greeting";
import { loadNews, newsIsEmpty, selectStories, type FeedFetcher } from "./load";
import { parseFeed, safeLink, shortSummary, toPlainText } from "./parse";
import { NEWS_FEEDS, SECTION_LIMITS } from "./sources";
import type { NewsStory } from "./types";

const fixture = (name: string) => readFileSync(join(__dirname, "fixtures", name), "utf8");
const NOW = Date.parse("2026-11-10T08:00:00Z");

const fixtureFetcher: FeedFetcher = async (url) => {
  if (url.includes("bbci.co.uk/news/world/rss")) return fixture("bbc-world.xml");
  if (url.includes("feeds.npr.org/1001")) return fixture("npr-news.xml");
  if (url.includes("nih.gov")) return fixture("nih-atom.xml");
  return null;
};

describe("parseFeed", () => {
  it("reads RSS items with CDATA, entities, and dates", () => {
    const items = parseFeed(fixture("bbc-world.xml"));
    expect(items.map((item) => item.title)).toEqual([
      "Fixture: Leaders meet for climate talks",
      "Fixture: Port reopens after storm",
      "Fixture: Last week's story",
      "Fixture: Undated story",
    ]);
    expect(items[0].summary).toBe("Delegates from many countries gathered on Monday. Talks continue all week.");
    expect(items[1].summary).toBe("Ships returned to the harbour & trade resumed.");
    expect(items[0].published).toBe(Date.parse("2026-11-10T06:30:00Z"));
    expect(items[3].published).toBeNull();
  });

  it("strips markup and drops unsafe links", () => {
    const items = parseFeed(fixture("npr-news.xml"));
    expect(items.map((item) => item.link)).not.toContain("javascript:alert(1)");
    expect(items).toHaveLength(2);
    expect(items[0].summary).toBe("Lawmakers voted late on Monday. The bill now goes to the president.");
    expect(items[0].published).toBe(Date.parse("2026-11-10T07:15:00Z"));
  });

  it("reads Atom entries", () => {
    const items = parseFeed(fixture("nih-atom.xml"));
    expect(items[0]).toMatchObject({
      title: "Fixture: Walking linked to better memory in older adults",
      link: "https://www.nih.gov/news-events/news-releases/fixture-4",
      summary: "Researchers followed older adults for several years. The study was observational.",
    });
    expect(items[1].published).toBe(Date.parse("2026-09-01T10:00:00Z"));
  });

  it("returns nothing for empty or non-feed text", () => {
    expect(parseFeed("")).toEqual([]);
    expect(parseFeed("<html><body>Not a feed</body></html>")).toEqual([]);
  });
});

describe("text helpers", () => {
  it("removes scripts and tags", () => {
    expect(toPlainText("<![CDATA[<script>bad()</script><b>Hello</b> &amp; welcome]]>")).toBe("Hello & welcome");
  });
  it("keeps one or two sentences and caps long text", () => {
    expect(shortSummary("One. Two. Three.")).toBe("One. Two.");
    const long = shortSummary("word ".repeat(200));
    expect(long.length).toBeLessThanOrEqual(261);
    expect(long.endsWith("…")).toBe(true);
  });
  it("allows only http and https links", () => {
    expect(safeLink("https://example.org/a")).toBe("https://example.org/a");
    expect(safeLink("javascript:alert(1)")).toBeNull();
    expect(safeLink("data:text/html,hi")).toBeNull();
    expect(safeLink("https://user:pass@example.org")).toBeNull();
    expect(safeLink("not a url")).toBeNull();
  });
});

describe("loadNews", () => {
  it("shows only recent, dated stories from the feeds, without duplicates", async () => {
    const news = await loadNews(fixtureFetcher, NOW);
    const worldTitles = news.world.stories.map((story) => story.title);
    expect(worldTitles).toEqual([
      "Fixture: Congress passes spending bill",
      "Fixture: Leaders meet for climate talks",
      "Fixture: Port reopens after storm",
    ]);
    expect(worldTitles).not.toContain("Fixture: Last week's story");
    expect(worldTitles).not.toContain("Fixture: Undated story");
    expect(worldTitles).not.toContain("Fixture: Leaders meet for climate talks!");
    expect(news.world.stories.length).toBeLessThanOrEqual(SECTION_LIMITS.world.max);
    expect(news.world.sourcesReached).toBe(2);

    expect(news.health.stories.map((story) => story.title)).toEqual(["Fixture: Walking linked to better memory in older adults"]);
    expect(news.health.stories[0]).toMatchObject({ source: "National Institutes of Health", category: "research", language: "en" });
    expect(news.fetchedAt).toBe(new Date(NOW).toISOString());
  });

  it("returns empty sections, never filler, when every feed fails", async () => {
    const news = await loadNews(async () => null, NOW);
    expect(news.world.stories).toEqual([]);
    expect(news.health.stories).toEqual([]);
    expect(newsIsEmpty(news)).toBe(true);
  });

  it("survives a fetcher that throws", async () => {
    const news = await loadNews(async () => {
      throw new Error("offline");
    }, NOW);
    expect(newsIsEmpty(news)).toBe(true);
  });

  it("does not trust dates far in the future", async () => {
    const future = `<rss><channel><item><title>Future</title><link>https://www.bbc.co.uk/x</link><pubDate>Fri, 01 Jan 2027 00:00:00 GMT</pubDate></item></channel></rss>`;
    const news = await loadNews(async (url) => (url.includes("bbci.co.uk/news/world/rss") ? future : null), NOW);
    expect(news.world.stories).toEqual([]);
  });
});

describe("selectStories", () => {
  const story = (feed: string, n: number, hoursAgo: number): NewsStory => ({
    id: `${feed}-${n}`,
    title: `${feed} story ${n}`,
    summary: "",
    url: `https://example.org/${feed}/${n}`,
    publishedAt: new Date(NOW - hoursAgo * 3_600_000).toISOString(),
    source: feed,
    category: "world",
    language: "en",
  });

  it("takes one story from each feed in turn before a second from any feed", () => {
    const picked = selectStories(
      [
        [story("a", 1, 1), story("a", 2, 2), story("a", 3, 3)],
        [story("b", 1, 5)],
        [story("c", 1, 6)],
      ],
      4,
    );
    expect(picked.map((item) => item.id)).toEqual(["a-1", "a-2", "b-1", "c-1"]);
  });
});

describe("feed list", () => {
  it("uses only https public feeds with no keys in the URL", () => {
    for (const feed of NEWS_FEEDS) {
      const url = new URL(feed.url);
      expect(url.protocol).toBe("https:");
      expect(url.search).toBe("");
    }
    expect(NEWS_FEEDS.filter((feed) => feed.section === "world").length).toBeGreaterThanOrEqual(SECTION_LIMITS.world.max);
    expect(NEWS_FEEDS.filter((feed) => feed.section === "health").length).toBeGreaterThanOrEqual(SECTION_LIMITS.health.max);
  });
});

describe("firstNameOf", () => {
  it("uses the first word of the saved name", () => {
    expect(firstNameOf("Anna Maria Smith")).toBe("Anna");
    expect(firstNameOf("  Олена ")).toBe("Олена");
    expect(firstNameOf("")).toBeUndefined();
    expect(firstNameOf(undefined)).toBeUndefined();
    expect(firstNameOf("1234")).toBeUndefined();
  });
});
