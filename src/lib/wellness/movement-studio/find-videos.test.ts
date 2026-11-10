import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { STUDIO_VIDEO_SEEDS } from "@/lib/wellness-library/chair-yoga-videos";
import { playableLessons } from "@/lib/wellness/movement-studio/catalog";
import {
  ANY_FILTERS,
  FIND_DURATIONS,
  FIND_GOALS,
  FIND_LEVELS,
  FIND_POSITIONS,
  FIND_VIDEOS,
  durationBucket,
  findVideos,
  matchesFind,
  relaxSuggestions,
  type FindFilters,
} from "@/lib/wellness/movement-studio/find-videos";
import { pickGuideVoice } from "@/lib/wellness/movement-studio/voice-guide";

const ids = (filters: Partial<FindFilters>) => findVideos({ ...ANY_FILTERS, ...filters }).map((video) => video.youtubeId);

describe("Find My Movement catalog", () => {
  it("holds at least 50 playable videos, each once", () => {
    expect(FIND_VIDEOS.length).toBeGreaterThanOrEqual(50);
    expect(new Set(FIND_VIDEOS.map((video) => video.youtubeId)).size).toBe(FIND_VIDEOS.length);
    expect(new Set(FIND_VIDEOS.map((video) => video.id)).size).toBe(FIND_VIDEOS.length);
  });

  it("only uses videos already verified in the repository", () => {
    const known = new Set([...STUDIO_VIDEO_SEEDS.map((seed) => seed.youtubeId), ...playableLessons().map((lesson) => lesson.youtubeId)]);
    for (const video of FIND_VIDEOS) expect(known.has(video.youtubeId), video.title).toBe(true);
    // Watch-only talks are not exercise videos.
    expect(FIND_VIDEOS.some((video) => video.youtubeId === "MjMkBaqimFo" || video.youtubeId === "n5kWf0pvEkc")).toBe(false);
  });

  it("gives every video a player, thumbnail, metadata, and license", () => {
    for (const video of FIND_VIDEOS) {
      expect(video.youtubeId).toMatch(/^[A-Za-z0-9_-]{11}$/);
      expect(video.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${video.youtubeId}`);
      expect(video.thumbnailUrl).toBe(`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`);
      expect(video.title.length).toBeGreaterThan(3);
      expect(video.description.length).toBeGreaterThan(10);
      expect(video.description).not.toContain("LifeZoi owner");
      expect(video.positions.length, video.title).toBeGreaterThan(0);
      expect(video.goals.length, video.title).toBeGreaterThan(0);
      expect(video.levels.length).toBeGreaterThan(0);
      for (const position of video.positions) expect(FIND_POSITIONS).toContain(position);
      for (const goal of video.goals) expect(FIND_GOALS).toContain(goal);
      for (const level of video.levels) expect(FIND_LEVELS).toContain(level);
      expect(video.license.embedAllowed).toBe(true);
      expect(video.license.rehostAllowed).toBe(false);
      expect(video.license.sourceUrl).toBe(`https://www.youtube.com/watch?v=${video.youtubeId}`);
      expect(video.license.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(video.license.creator.length).toBeGreaterThan(2);
      expect(containsProhibitedClaim(video.description), video.description).toBe(false);
    }
  });

  it("uses a title length only when the title says it", () => {
    for (const video of FIND_VIDEOS) {
      if (video.lengthSource !== "title") continue;
      const minutes = Math.round((video.durationSeconds ?? 0) / 60);
      expect(video.title, video.title).toMatch(new RegExp(`\\b${minutes}\\b`));
    }
    for (const video of FIND_VIDEOS) if (video.lengthSource === "unknown") expect(video.durationSeconds).toBeNull();
  });

  it("puts each length in the nearest minute choice", () => {
    expect(durationBucket(56)).toBe(5);
    expect(durationBucket(190)).toBe(5);
    expect(durationBucket(7 * 60)).toBe(5);
    expect(durationBucket(606)).toBe(10);
    expect(durationBucket(675)).toBe(10);
    expect(durationBucket(930)).toBe(15);
    expect(durationBucket(1109)).toBe(20);
    expect(durationBucket(1638)).toBe(25);
    expect(durationBucket(30 * 60)).toBe(30);
    expect(durationBucket(35 * 60)).toBeNull();
    expect(durationBucket(null)).toBeNull();
  });

  it("has videos under every minute choice, position, and level", () => {
    for (const minutes of FIND_DURATIONS) expect(ids({ minutes }).length, `${minutes} min`).toBeGreaterThan(0);
    for (const position of FIND_POSITIONS) expect(ids({ position }).length, position).toBeGreaterThan(0);
    for (const goal of FIND_GOALS) expect(ids({ goal }).length, goal).toBeGreaterThan(0);
    for (const level of FIND_LEVELS) expect(ids({ level }).length, level).toBeGreaterThan(0);
    expect(ids({}).length).toBe(FIND_VIDEOS.length);
  });

  it("applies all four filters together, for every combination", () => {
    for (const minutes of [...FIND_DURATIONS, "any"] as const)
      for (const position of [...FIND_POSITIONS, "any"] as const)
        for (const goal of [...FIND_GOALS, "any"] as const)
          for (const level of [...FIND_LEVELS, "any"] as const) {
            const filters = { minutes, position, goal, level };
            const found = findVideos(filters);
            const expected = FIND_VIDEOS.filter(
              (video) =>
                (minutes === "any" || durationBucket(video.durationSeconds) === minutes) &&
                (position === "any" || video.positions.includes(position)) &&
                (goal === "any" || video.goals.includes(goal)) &&
                (level === "any" || video.levels.includes(level)),
            );
            expect(found.map((video) => video.id).sort()).toEqual(expected.map((video) => video.id).sort());
            for (const video of found) expect(matchesFind(video, filters)).toBe(true);
            // Every suggestion in the empty state really shows videos.
            if (found.length === 0)
              for (const offer of relaxSuggestions(filters)) expect(findVideos({ ...filters, [offer.key]: "any" }).length).toBe(offer.count);
          }
  });

  it("answers the examples from the brief", () => {
    expect(ids({ minutes: 10, position: "standing", goal: "balance", level: "beginner" })).toEqual([]);
    expect(relaxSuggestions({ minutes: 10, position: "standing", goal: "balance", level: "beginner" }).length).toBeGreaterThan(0);
    expect(ids({ minutes: 15, position: "standing", goal: "balance", level: "beginner" })).toEqual(
      expect.arrayContaining(["XlI_DOBDYsk", "dHxDJquk2M8", "CmJZRKqv_sY"]),
    );
    expect(ids({ minutes: 20, position: "sitting", goal: "mobility", level: "gentle" })).toEqual(["2ej34NqjnLc"]);
    expect(ids({ minutes: 5, position: "sitting", goal: "mobility" })).toEqual(expect.arrayContaining(["87BeiyTFZyU", "CW0h60-PS4Y"]));
    expect(ids({ position: "chair", goal: "chair-yoga" }).length).toBeGreaterThanOrEqual(30);
  });

  it("sorts shorter videos first and unknown lengths last", () => {
    const all = findVideos(ANY_FILTERS);
    const lengths = all.map((video) => video.durationSeconds ?? Infinity);
    expect([...lengths].sort((a, b) => a - b)).toEqual(lengths);
  });

  it("marks balance and floor videos", () => {
    for (const video of FIND_VIDEOS) {
      if (video.goals.includes("balance") && video.positions.includes("standing")) expect(video.balance, video.title).toBe(true);
      expect(video.floor).toBe(video.positions.includes("mat"));
    }
  });
});

describe("voice guide", () => {
  const voices = [
    { name: "Basic English", lang: "en-US" },
    { name: "Microsoft Ava Online (Natural) - English", lang: "en-US" },
    { name: "Google русский", lang: "ru-RU" },
    { name: "Lesya", lang: "uk-UA" },
  ];

  it("picks a natural voice in the same language", () => {
    expect(pickGuideVoice(voices, "en")?.name).toBe("Microsoft Ava Online (Natural) - English");
    expect(pickGuideVoice(voices, "ru")?.name).toBe("Google русский");
    expect(pickGuideVoice(voices, "uk")?.name).toBe("Lesya");
  });

  it("returns null when no voice speaks the language", () => {
    expect(pickGuideVoice(voices, "el")).toBeNull();
    expect(pickGuideVoice([], "en")).toBeNull();
  });
});
