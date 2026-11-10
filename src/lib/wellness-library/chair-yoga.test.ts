import { describe, expect, it } from "vitest";
import { emptyCompanion, recordEntry, sanitizeCompanion, type CompanionState } from "@/lib/companion/state";
import { findDuplicates, reviewQueue, studioVideos, VIDEOS } from "@/lib/wellness-library/catalog";
import {
  activityIdFor,
  alternativeFor,
  EMPTY_FILTER,
  filterVideos,
  inBand,
  libraryVideos,
  matchesQuery,
  recommendToday,
  sectionCounts,
  todayPickKey,
  unsafeForProfile,
  videoByYoutubeId,
  weekPractice,
} from "@/lib/wellness-library/chair-yoga";
import { STUDIO_SECTIONS, STUDIO_VIDEO_SEEDS } from "@/lib/wellness-library/chair-yoga-videos";
import type { MoverProfile } from "@/lib/wellness-library/discover";

function profile(overrides: Partial<MoverProfile> = {}): MoverProfile {
  return {
    age: null,
    level: null,
    experience: "",
    wantsChallenge: false,
    seatedFirst: false,
    fallRisk: false,
    kneeLimit: false,
    jointLimit: false,
    injury: false,
    disliked: [],
    ...overrides,
  };
}

const TODAY = "2026-11-11"; // a Wednesday

describe("Chair Yoga Studio catalog", () => {
  it("includes both videos the owner supplied", () => {
    expect(videoByYoutubeId("RjqME9aAOpA")?.instructor).toBe("Yoga ETC with Tina");
    expect(videoByYoutubeId("2ej34NqjnLc")?.instructor).toBe("Yoga & You");
  });

  it("has no empty category and at least 20 videos", () => {
    const counts = sectionCounts();
    expect(libraryVideos().length).toBeGreaterThanOrEqual(20);
    for (const section of STUDIO_SECTIONS) expect(counts[section]).toBeGreaterThan(0);
  });

  it("uses only official YouTube embeds and thumbnails, with no duplicates", () => {
    for (const video of studioVideos) {
      expect(video.embedUrl).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}$/);
      expect(video.originalUrl).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]{11}$/);
      expect(video.studio?.thumbnailUrl).toMatch(/^https:\/\/i\.ytimg\.com\/vi\/[A-Za-z0-9_-]{11}\/hqdefault\.jpg$/);
      expect(video.durationSeconds).toBeNull();
    }
    expect(new Set(STUDIO_VIDEO_SEEDS.map((seed) => seed.youtubeId)).size).toBe(STUDIO_VIDEO_SEEDS.length);
    expect(findDuplicates(VIDEOS)).toEqual([]);
  });

  it("stated minutes come from the title only", () => {
    for (const seed of STUDIO_VIDEO_SEEDS) {
      if (seed.minutes !== null) expect(seed.title).toMatch(new RegExp(`\\b${seed.minutes}\\b`));
    }
  });

  it("makes no treatment or cure claim in LifeZoi's own notes", () => {
    for (const seed of STUDIO_VIDEO_SEEDS) {
      // Sentences that say LifeZoi makes no claim are the disclaimer itself.
      const claims = seed.note.split(/(?<=\.)\s+/).filter((sentence) => !/does not claim|makes no .* claim/i.test(sentence)).join(" ");
      expect(claims).not.toMatch(/\b(cures?|heals?|treats|reverses|prevents|relieves)\b/i);
    }
  });

  it("keeps the unverified free status visible to administrators", () => {
    expect(reviewQueue().some((issue) => issue.id === "yt-RjqME9aAOpA" && /Free status/.test(issue.problem))).toBe(true);
  });
});

describe("filters and search", () => {
  it("filters seated and standing", () => {
    const seated = filterVideos({ ...EMPTY_FILTER, position: "seated" });
    expect(seated.length).toBeGreaterThan(0);
    expect(seated.every((video) => video.studio.position === "seated")).toBe(true);
    const standing = filterVideos({ ...EMPTY_FILTER, position: "standing" });
    expect(standing.length).toBeGreaterThan(0);
    expect(standing.every((video) => video.studio.position === "standing" || video.studio.position === "mixed")).toBe(true);
  });

  it("uses duration bands and hides unknown lengths only when a band is chosen", () => {
    expect(inBand(10, "5-10")).toBe(true);
    expect(inBand(20, "15-20")).toBe(true);
    expect(inBand(30, "30")).toBe(true);
    expect(inBand(45, "45-60")).toBe(true);
    expect(inBand(null, "5-10")).toBe(false);
    expect(inBand(null, null)).toBe(true);
    for (const band of ["5-10", "15-20", "30", "45-60"] as const) {
      expect(filterVideos({ ...EMPTY_FILTER, duration: band }).length).toBeGreaterThan(0);
    }
  });

  it("filters by level and age group", () => {
    expect(filterVideos({ ...EMPTY_FILTER, level: "intermediate" }).every((video) => video.level === "intermediate")).toBe(true);
    expect(filterVideos({ ...EMPTY_FILTER, audience: "60+" }).length).toBeGreaterThan(0);
    expect(filterVideos({ ...EMPTY_FILTER, audience: "50+" }).length).toBeGreaterThan(0);
    expect(filterVideos({ ...EMPTY_FILTER, audience: "all" }).length).toBeGreaterThan(0);
  });

  it("searches by topic", () => {
    const wrists = filterVideos({ ...EMPTY_FILTER, query: "wrists" });
    expect(wrists.some((video) => video.studio.youtubeId === "wEw9ZViomTI")).toBe(true);
    expect(filterVideos({ ...EMPTY_FILTER, query: "balance" }).length).toBeGreaterThan(3);
    const video = videoByYoutubeId("Aj6pPn30bfo");
    if (!video) throw new Error("missing");
    expect(matchesQuery(video, "desk")).toBe(true);
    expect(matchesQuery(video, "zzzz")).toBe(false);
    expect(filterVideos({ ...EMPTY_FILTER, query: "nothing-matches-this" })).toEqual([]);
  });
});

describe("today's recommended practice", () => {
  it("gives seated classes only to someone who cannot stand for long", () => {
    const plan = recommendToday(profile({ seatedFirst: true, age: 78 }), emptyCompanion(), TODAY);
    expect(plan.main?.studio.position).toBe("seated");
    expect(plan.standingAlternative).toBeNull();
  });

  it("starts seated with a balance concern, offers chair-supported standing, and never suggests the floor", () => {
    const person = profile({ fallRisk: true, age: 72 });
    const plan = recommendToday(person, emptyCompanion(), TODAY);
    expect(plan.main?.studio.position).toBe("seated");
    expect(plan.standingAlternative?.studio.position).not.toBe("mat");
    expect(plan.cautions.join(" ")).toMatch(/both hands on the chair/);
    const mat = libraryVideos().find((video) => video.studio.position === "mat");
    if (!mat) throw new Error("no mat video");
    expect(unsafeForProfile(mat, person)).not.toBeNull();
  });

  it("moves someone to standing after a week of seated classes", () => {
    let state: CompanionState = emptyCompanion();
    const seated = libraryVideos().filter((video) => video.studio.position === "seated").slice(0, 2);
    for (const [index, video] of seated.entries()) {
      state = recordEntry(state, `2026-11-0${9 + index}`, activityIdFor(video), { status: "done", minutes: 15, replacedWith: "" });
    }
    const plan = recommendToday(profile({ age: 55 }), state, TODAY);
    expect(plan.main?.studio.section).toBe("standing");
    expect(plan.seatedAlternative?.studio.position).toBe("seated");
  });

  it("does not recommend intermediate classes at beginner level", () => {
    for (const date of ["2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"]) {
      expect(recommendToday(profile({ age: 66 }), emptyCompanion(), date).main?.level).toBe("beginner");
    }
  });
});

describe("daily integration", () => {
  it("counts completed classes in this week's practice", () => {
    const video = libraryVideos()[0];
    if (!video) throw new Error("empty");
    let state = recordEntry(emptyCompanion(), "2026-11-10", activityIdFor(video), { status: "done", minutes: 20, replacedWith: "" }, { exerciseMinutes: 20 });
    state = recordEntry(state, "2026-11-08", activityIdFor(video), { status: "done", minutes: 20, replacedWith: "" });
    const week = weekPractice(state, TODAY);
    expect(week.weekStart).toBe("2026-11-09");
    expect(week.sessions).toBe(1);
    expect(week.minutes).toBe(20);
    expect(week.activeDays).toBe(1);
    expect(state.days["2026-11-10"]?.exerciseMinutes).toBe(20);
  });

  it("keeps today's chosen class through a save and reload, even with many older picks", () => {
    const picks: Record<string, string> = {};
    for (let day = 1; day <= 35; day += 1) picks[`2026-10-${String(day).padStart(2, "0")}:activity`] = "walk";
    picks[todayPickKey(TODAY)] = "-rBDxFKJtlE";
    const state = sanitizeCompanion({ ...emptyCompanion(), customize: { hidden: [], times: {}, picks } });
    expect(state.customize.picks[todayPickKey(TODAY)]).toBe("-rBDxFKJtlE");
  });

  it("offers a seated alternative for each standing class", () => {
    for (const video of libraryVideos().filter((item) => item.studio.section === "standing")) {
      expect(alternativeFor(video, "seated")?.studio.position).toBe("seated");
    }
  });
});
