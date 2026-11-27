import { describe, expect, it } from "vitest";
import { sitemapEntries } from "./seo";
import { articlePlainText, BLOG_ARTICLES, BLOG_VIDEOS } from "./articles";
import { parseVideoLink } from "./video-link";

describe("Health tips articles", () => {
  it("has 8 to 10 articles with unique, address-safe slugs", () => {
    expect(BLOG_ARTICLES.length).toBeGreaterThanOrEqual(8);
    expect(BLOG_ARTICLES.length).toBeLessThanOrEqual(10);
    const slugs = BLOG_ARTICLES.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("cites at least one public source and gives things to try in every article", () => {
    for (const article of BLOG_ARTICLES) {
      expect(article.sourceIds.length, article.slug).toBeGreaterThan(0);
      expect(article.tryThis.length, article.slug).toBeGreaterThanOrEqual(3);
      expect(article.sections.length, article.slug).toBeGreaterThanOrEqual(2);
      expect(article.summary.length, article.slug).toBeLessThanOrEqual(200);
    }
  });

  it("makes no percentage, risk-reduction, cure, or lifespan claim", () => {
    for (const article of BLOG_ARTICLES) {
      const text = articlePlainText(article) + " " + article.tryThis.join(" ");
      expect(text, article.slug).not.toMatch(/%|percent|reduces? (your )?risk|cures?\b|add years|live longer|life expectancy/i);
    }
  });

  it("shows only videos whose link is a plain YouTube or Vimeo address", () => {
    const videos = [...BLOG_VIDEOS, ...BLOG_ARTICLES.flatMap((article) => (article.video ? [article.video] : []))];
    expect(videos.length).toBeGreaterThan(0);
    for (const video of videos) expect(parseVideoLink(video.link), video.link).not.toBeNull();
  });

  it("lists every article and no members' page in the sitemap", () => {
    const urls = sitemapEntries().map((entry) => entry.url);
    for (const article of BLOG_ARTICLES) expect(urls).toContain(`https://www.lifezoi.com/blog/${article.slug}`);
    expect(urls.some((url) => /dashboard|my-health|api/.test(url))).toBe(false);
  });
});
