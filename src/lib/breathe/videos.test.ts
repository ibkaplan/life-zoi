import { describe, expect, it } from "vitest";
import { TECHNIQUES } from "@/lib/breathe/content";
import { BREATHE_VIDEO_TEXT, breatheVideos, videosForTechnique } from "@/lib/breathe/videos";

describe("Breathe for Life videos", () => {
  it("uses only official YouTube embeds and thumbnails, with no duplicates", () => {
    const ids = new Set<string>();
    for (const video of breatheVideos) {
      expect(video.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(video.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${video.youtubeId}`);
      expect(video.originalUrl).toBe(`https://www.youtube.com/watch?v=${video.youtubeId}`);
      expect(video.thumbnailUrl).toBe(`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`);
      expect(video.channelUrl).toMatch(/^https:\/\/www\.youtube\.com\/@/);
      expect(ids.has(video.youtubeId)).toBe(false);
      ids.add(video.youtubeId);
    }
  });

  it("covers every technique the program teaches, with humming first", () => {
    for (const technique of TECHNIQUES) expect(videosForTechnique(technique.id).length).toBeGreaterThan(0);
    expect(breatheVideos[0].technique).toBe("bhramari");
  });

  it("does not repeat a nitric oxide claim in lifeZoi's own words", () => {
    const own = [...Object.values(BREATHE_VIDEO_TEXT), ...breatheVideos.map((video) => video.note)].join(" ");
    expect(own).not.toMatch(/blood flow|in your blood|cure|prevent|detox|boost/i);
    expect(own).not.toMatch(/\d+\s?%/);
    expect(BREATHE_VIDEO_TEXT.noHold).toMatch(/never asks/);
  });
});
