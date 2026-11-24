import { describe, expect, it } from "vitest";
import { BUILT_IN_ARTICLES } from "@/lib/encyclopedia/articles";
import { STORIES, STORY_KINDS, STORY_THEMES, storiesFor, videoEmbedUrl } from "@/lib/encyclopedia/stories";

const SLUGS = new Set(BUILT_IN_ARTICLES.map((article) => article.slug));

describe("Real People. Real Stories.", () => {
  it("labels every story as real or composite, with sources, science, and limits", () => {
    expect(Object.keys(STORY_KINDS)).toEqual(["real", "composite"]);
    expect(new Set(STORIES.map((story) => story.id)).size).toBe(STORIES.length);
    for (const story of STORIES) {
      expect(story.id).toMatch(/^[a-z0-9-]{1,70}$/);
      expect(story.story.length, story.id).toBeGreaterThan(0);
      expect(story.science.length, story.id).toBeGreaterThan(0);
      expect(story.limits.length, story.id).toBeGreaterThan(20);
      expect(story.sources.length, story.id).toBeGreaterThan(0);
      for (const source of story.sources) expect(source.url, story.id).toMatch(/^https:\/\//);
      for (const video of story.videos ?? []) {
        expect(video.url, story.id).toMatch(/^https:\/\//);
        if (video.youtubeId) expect(videoEmbedUrl(video)).toBe(`https://www.youtube-nocookie.com/embed/${video.youtubeId}`);
      }
      for (const slug of story.articles ?? []) expect(SLUGS.has(slug), `${story.id} → ${slug}`).toBe(true);
      for (const theme of story.themes) expect(STORY_THEMES.some((item) => item.slug === theme)).toBe(true);
      expect(story.story.join(" "), story.id).not.toMatch(/\bcured?\b|miracle/i);
    }
  });

  it("has the approved stories, real and composite, Eastern and Western", () => {
    expect(STORIES.length).toBeGreaterThanOrEqual(8);
    expect(STORIES.some((story) => story.kind === "composite")).toBe(true);
    expect(STORIES.some((story) => story.approaches.includes("eastern"))).toBe(true);
    expect(STORIES.some((story) => story.approaches.includes("western"))).toBe(true);
    for (const story of STORIES.filter((item) => item.kind === "composite")) expect(story.story[0], story.id).toMatch(/is not a real person/);
  });

  it("filters by theme, condition, approach, and kind", () => {
    const sample = [
      { ...STORY_FIXTURE, id: "a", kind: "real" as const, themes: ["aging" as const], conditions: ["heart" as const], approaches: ["western" as const] },
      { ...STORY_FIXTURE, id: "b", kind: "composite" as const, themes: ["recovery" as const], conditions: ["stroke" as const], approaches: ["eastern" as const] },
    ];
    expect(storiesFor({ theme: "aging" }, sample).map((story) => story.id)).toEqual(["a"]);
    expect(storiesFor({ kind: "composite" }, sample).map((story) => story.id)).toEqual(["b"]);
    expect(storiesFor({ condition: "heart" }, sample).map((story) => story.id)).toEqual(["a"]);
    expect(storiesFor({ approach: "eastern" }, sample).map((story) => story.id)).toEqual(["b"]);
    expect(storiesFor({}, sample)).toHaveLength(2);
  });
});

const STORY_FIXTURE = {
  title: "t",
  teaser: "t",
  place: "p",
  illustration: "heart",
  story: ["s"],
  science: [{ point: "p", level: "established" as const }],
  limits: "l",
  sources: [],
};
