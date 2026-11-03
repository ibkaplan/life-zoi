import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockProvider } from "@/lib/ai/provider";
import { containsProhibitedClaim } from "@/lib/claims";
import {
  DIGNITY_NOTE,
  HEALTH_BRIDGE,
  KARMA_NOTE,
  PURPOSE_KEY,
  clearPurpose,
  emptyPurpose,
  healthSupports,
  purposeCopyIsEducational,
  purposeLines,
  purposeReflection,
  publicPurposeCopy,
  sanitizePurpose,
  weeklyActions,
  writePurpose,
} from "@/lib/purpose";

describe("Your Life Matters", () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
  };

  beforeEach(() => {
    memory.clear();
    vi.stubGlobal("window", { sessionStorage: storage });
    clearPurpose(storage);
  });

  it("keeps philosophy copy educational and treats karma as a metaphor", () => {
    expect(purposeCopyIsEducational()).toBe(true);
    expect(containsProhibitedClaim(publicPurposeCopy().join(" "))).toBe(false);
    expect(KARMA_NOTE.toLowerCase()).toContain("not a scientifically proven medical principle");
    expect(KARMA_NOTE.toLowerCase()).toContain("does not guarantee");
    expect(DIGNITY_NOTE.toLowerCase()).toContain("disabilities");
  });

  it("builds an encouraging statement and does not invent an impact score", () => {
    expect(purposeLines({})).toEqual([]);
    const lines = purposeLines({
      accomplish: "Teach one practical skill",
      help: "My grandchildren",
    });
    expect(lines.join(" ")).toContain("Teach one practical skill");
    expect(lines.join(" ").toLowerCase()).not.toMatch(/score|humanity|percent/);
  });

  it("connects travel, work, and community hopes with ordinary habits", () => {
    const travel = healthSupports("I want enough energy to travel with my grandchildren");
    expect(travel.map((item) => item.id)).toContain("travel");
    expect(travel.flatMap((item) => item.actions).join(" ").toLowerCase()).toMatch(/walk|balance|sleep/);
    const work = healthSupports("I want to create a small business");
    expect(work.map((item) => item.id)).toContain("create");
    expect(work[0]?.actions.join(" ").toLowerCase()).toMatch(/movement break|stress/);
    const community = healthSupports("I want to help my community");
    expect(community.map((item) => item.id)).toContain("community");
    expect(weeklyActions(community).length).toBeGreaterThan(0);
    expect(healthSupports("").length).toBe(0);
    expect(purposeReflection("travel more and spend active time with my family")).toContain(HEALTH_BRIDGE);
    expect(purposeReflection("   ")).toBe("");
  });

  it("saves, edits, and clears reflections in session storage", () => {
    writePurpose({
      ...emptyPurpose(),
      legacy: { meaning: "Time with people I love" },
      milestones: [
        {
          id: "m1",
          title: "Walk with my sister",
          kind: "loved",
          note: "",
          done: false,
          createdAt: "2026-11-03T15:00:00.000Z",
        },
      ],
      ripples: [
        { id: "r1", kind: "encourage", note: "Called a friend", createdAt: "2026-11-03T16:00:00.000Z" },
      ],
    });
    const raw = storage.getItem(PURPOSE_KEY);
    expect(raw).toBeTruthy();
    const saved = sanitizePurpose(JSON.parse(raw ?? "null"));
    expect(saved.legacy.meaning).toBe("Time with people I love");
    expect(saved.milestones).toHaveLength(1);
    expect(saved.ripples[0]?.note).toBe("Called a friend");
    writePurpose({ ...saved, legacy: { ...saved.legacy, meaning: "Updated hope" } });
    expect(sanitizePurpose(JSON.parse(storage.getItem(PURPOSE_KEY) ?? "null")).legacy.meaning).toBe(
      "Updated hope",
    );
    clearPurpose(storage);
    expect(storage.getItem(PURPOSE_KEY)).toBeNull();
  });

  it("drops invented measurements and unsafe text shapes", () => {
    const clean = sanitizePurpose({
      legacy: { accomplish: "x".repeat(500), unknown: "no" },
      milestones: [{ id: "bad", title: "A score of humanity", kind: "impact", note: "", done: true, createdAt: "nope" }],
      ripples: [{ id: "ok", kind: "help", note: "Held the door", createdAt: "2026-11-03T12:00:00.000Z" }],
    });
    expect(clean.legacy.accomplish?.length).toBe(400);
    expect(clean.milestones).toEqual([]);
    expect(clean.ripples).toHaveLength(1);
  });

  it("answers a grandchildren travel question with a warm mock and no lifespan promise", async () => {
    const provider = createMockProvider();
    const result = await provider.complete({
      model: "mock",
      messages: [{ role: "user", content: "I want to have enough energy to travel with my grandchildren." }],
      maxOutputTokens: 400,
      prices: { promptCentsPer1k: 0, completionCentsPer1k: 0 },
    });
    expect(result.providerId).toBe("mock");
    expect(result.text).toMatch(/wonderful goal/i);
    expect(result.text.toLowerCase()).toMatch(/sleep/);
    expect(result.text.toLowerCase()).toMatch(/movement/);
    expect(containsProhibitedClaim(result.text)).toBe(false);
    expect(result.text.toLowerCase()).not.toMatch(/stop (your )?medication|guaranteed/);
  });
});
