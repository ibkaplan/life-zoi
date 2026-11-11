import { describe, expect, it } from "vitest";
import { DAILY_CATEGORIES, DAILY_VIDEO_SEEDS } from "@/lib/wellness-library/daily-movement-videos";
import { STUDIO_VIDEO_SEEDS } from "@/lib/wellness-library/chair-yoga-videos";
import {
  categoryCounts,
  dailyProfile,
  dailyVideos,
  planDay,
  pickVideo,
  ROUTINES,
  type DailyProfile,
  type PlanItem,
} from "@/lib/wellness-library/daily-movement";

const TODAY = "2026-11-11";

function videoCategory(items: PlanItem[]) {
  const video = items.find((item) => item.kind === "video");
  return video && video.kind === "video" ? video.category : null;
}

describe("Daily Movement videos", () => {
  it("has unique, well-formed YouTube ids that are not chair yoga classes", () => {
    const ids = DAILY_VIDEO_SEEDS.map((seed) => seed.youtubeId);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[A-Za-z0-9_-]{11}$/);
    const chair = new Set(STUDIO_VIDEO_SEEDS.map((seed) => seed.youtubeId));
    expect(ids.filter((id) => chair.has(id))).toEqual([]);
    for (const seed of DAILY_VIDEO_SEEDS) expect(seed.title).not.toMatch(/\bchair\b/i);
  });

  it("has at least two classes in every category", () => {
    const counts = categoryCounts();
    for (const category of DAILY_CATEGORIES) expect(counts[category], category).toBeGreaterThanOrEqual(2);
  });

  it("plays through the privacy-enhanced YouTube player", () => {
    for (const video of dailyVideos) {
      expect(video.embedUrl).toBe(`https://www.youtube-nocookie.com/embed/${video.youtubeId}`);
      expect(video.channelUrl).toMatch(/^https:\/\/www\.youtube\.com\/@/);
    }
  });

  it("only uses minutes that appear in the title", () => {
    for (const seed of DAILY_VIDEO_SEEDS) if (seed.minutes !== null) expect(seed.title, seed.youtubeId).toContain(String(seed.minutes));
  });

  it("keeps every written routine to clear numbered movements", () => {
    for (const routine of Object.values(ROUTINES)) {
      expect(routine.steps.length).toBeGreaterThanOrEqual(5);
      expect(routine.minutes).toBe(5);
    }
  });
});

describe("Daily Movement profile and plan", () => {
  const owner = dailyProfile({ mobilityLimits: ["none"], wellnessGoals: ["energy", "fitness", "flexibility-balance"], primaryGoal: "energy", dailySetting: [] }, null);

  it("gives a person with no mobility limits morning aerobics plus a 5-minute stretch", () => {
    const plan = planDay(owner, TODAY);
    expect(plan.chairFirst).toBe(false);
    expect(videoCategory(plan.morning!.items)).toBe("morning-aerobics");
    expect(plan.morning!.items).toContainEqual({ kind: "routine", routine: ROUTINES["morning-stretch"] });
    expect(videoCategory(plan.evening!.items)).toBe("evening");
    expect(plan.evening!.items).toContainEqual({ kind: "routine", routine: ROUTINES["evening-relax"] });
    expect(plan.morning!.minutes).toBe(20);
  });

  it("never reads age, so an older person with no limits still gets standing classes", () => {
    const answers = { mobilityLimits: ["none" as const], wellnessGoals: [], primaryGoal: "" as const, dailySetting: [], exactAge: "85", ageRange: "75+" };
    const older = dailyProfile(answers, null);
    const younger = { ...answers, exactAge: "30", ageRange: "25-34" };
    expect(older).toEqual(dailyProfile(younger, null));
    const plan = planDay(older, TODAY);
    expect(plan.chairFirst).toBe(false);
    const morning = plan.morning!.items.find((item) => item.kind === "video");
    expect(morning?.kind === "video" && morning.video.position).toBe("standing");
  });

  it("points people who cannot stand for long to Chair Yoga Studio", () => {
    const plan = planDay(dailyProfile({ mobilityLimits: ["limited-standing"] }, null), TODAY);
    expect(plan.chairFirst).toBe(true);
    expect(plan.morning).toBeNull();
  });

  it("respects a chosen preference for chair exercises", () => {
    expect(planDay(dailyProfile({ mobilityLimits: ["none"] }, null, true), TODAY).chairFirst).toBe(true);
  });

  it("keeps people with balance concerns standing with support and off the floor", () => {
    const profile = dailyProfile({ mobilityLimits: ["balance-concerns"] }, null);
    const plan = planDay(profile, TODAY);
    expect(plan.chairFirst).toBe(false);
    expect(videoCategory(plan.morning!.items)).toBe("morning-stretch");
    for (const slot of [plan.morning!, plan.evening!])
      for (const item of slot.items) if (item.kind === "video") expect(item.video.position).toBe("standing");
    expect(plan.cautions.some((caution) => caution.includes("counter"))).toBe(true);
  });

  it("swaps aerobics for low-impact walking with joint pain, and for stretching with breathlessness", () => {
    expect(videoCategory(planDay(dailyProfile({ mobilityLimits: ["joint-pain"] }, null), TODAY).morning!.items)).toBe("low-impact");
    expect(videoCategory(planDay(dailyProfile({ mobilityLimits: ["breathlessness"] }, null), TODAY).morning!.items)).toBe("morning-stretch");
  });

  it("does not suggest intermediate classes first at beginner level", () => {
    const beginner: DailyProfile = { ...owner, level: 0 };
    for (let offset = 0; offset < 3; offset += 1) expect(pickVideo("morning-aerobics", beginner, `seed-${offset}`)?.level).toBe("beginner");
  });

  it("is the same all day and changes with Show another", () => {
    const first = planDay(owner, TODAY);
    expect(planDay(owner, TODAY)).toEqual(first);
    const next = planDay(owner, TODAY, { morning: 1 });
    expect(next.morning!.items[0]).not.toEqual(first.morning!.items[0]);
  });

  it("prefers classes with spoken instruction for the evening", () => {
    for (const day of ["2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"]) {
      const evening = planDay(owner, day).evening!.items[0]!;
      expect(evening.kind === "video" && evening.video.talking).toBe("unchecked");
    }
  });
});
