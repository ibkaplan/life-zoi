import { describe, expect, it } from "vitest";
import { LIBRARY_CATEGORIES } from "@/lib/wellness-library/moves";
import {
  allSlots,
  LIBRARY_DURATIONS,
  LIBRARY_VIDEO_SEEDS,
  LIBRARY_VIDEOS,
  missingSlots,
  slotsFor,
  VIDEO_LEVELS,
} from "@/lib/wellness-library/video-library";

describe("Wellness Library video collection", () => {
  it("offers all six lengths in each of the 14 activities", () => {
    expect(LIBRARY_CATEGORIES).toHaveLength(14);
    for (const category of LIBRARY_CATEGORIES) {
      expect(slotsFor(category).map((slot) => slot.minutes)).toEqual([10, 15, 20, 30, 45, 60]);
    }
    expect(allSlots()).toHaveLength(84);
  });

  it("puts each video in the slot for its own activity and length", () => {
    for (const slot of allSlots()) {
      for (const video of [slot.video, ...slot.alternatives].filter((value) => value !== null)) {
        expect(video.category).toBe(slot.category);
        expect(video.minutes).toBe(slot.minutes);
      }
    }
  });

  it("only lists a length that appears in the video's own title", () => {
    for (const seed of LIBRARY_VIDEO_SEEDS) {
      const spoken = seed.minutes === 60 ? /(60[\s-]*min|1[\s-]*hour)/i : new RegExp(`\\b${seed.minutes}\\s*[-.]?\\s*(min|minute)`, "i");
      expect(seed.title, seed.youtubeId).toMatch(spoken);
    }
  });

  it("uses only official YouTube embed, watch, and thumbnail addresses", () => {
    for (const video of LIBRARY_VIDEOS) {
      expect(video.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(video.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${video.youtubeId}`);
      expect(video.originalUrl).toBe(`https://www.youtube.com/watch?v=${video.youtubeId}`);
      expect(video.thumbnailUrl).toBe(`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`);
      expect(video.channelUrl).toMatch(/^https:\/\/www\.youtube\.com\/@[^/\s]+$/);
    }
  });

  it("keeps the fields the library needs for every video", () => {
    for (const video of LIBRARY_VIDEOS) {
      expect(video.title.trim()).not.toBe("");
      expect(video.instructor.trim()).not.toBe("");
      expect(VIDEO_LEVELS).toContain(video.level);
      expect(LIBRARY_DURATIONS).toContain(video.minutes);
      expect(video.language).toBe("en");
      expect(video.license).toMatch(/YouTube/);
      expect(video.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("has no duplicate video", () => {
    const ids = LIBRARY_VIDEO_SEEDS.map((seed) => seed.youtubeId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reports empty slots as missing instead of filling them", () => {
    const missing = missingSlots();
    for (const slot of missing) {
      expect(slot.video).toBeNull();
      expect(slot.alternatives).toEqual([]);
    }
    expect(missing.length + allSlots().filter((slot) => slot.video).length).toBe(84);
  });

  it("keeps chair and balance classes gentle or beginner", () => {
    for (const video of LIBRARY_VIDEOS.filter((item) => item.category === "chair")) {
      expect(["gentle", "beginner"]).toContain(video.level);
      expect(video.equipment).toContain("chair");
    }
  });
});
