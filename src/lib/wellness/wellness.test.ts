import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import { populationFigure } from "@/lib/life-table";
import { POPULATION_LABEL, populationBlock } from "@/lib/outlook";
import { buildCombination, buildScenario } from "@/lib/scenarios";
import { validateComplete } from "@/lib/validation";
import { validAnswers } from "@/lib/validation.test";
import { challenges } from "@/lib/wellness/challenges";
import { foods } from "@/lib/wellness/foods";
import { EXAMPLE_MOMENT_STORY, buildMomentPlan } from "@/lib/wellness/moments";
import { removeHabitKeepHistory } from "@/lib/wellness/life-plan";
import { natureCopyText, outdoorMoodSentence } from "@/lib/wellness/nature";
import { wellnessSources } from "@/lib/wellness/sources";
import { emptyWellnessLog, sanitizeWellness } from "@/lib/wellness/storage";
import { urgeCopyText } from "@/lib/wellness/urges";
import type { NatureEntry, WellnessLog } from "@/lib/wellness/types";

const banned = /alkalize|detox|live longer|7 years longer/i;

describe("wellness records", () => {
  it("drops an urge with a bad intensity and keeps a valid one", () => {
    const log = sanitizeWellness({
      urges: [
        { id: "bad-urge", date: "2026-11-03", intensity: 12, want: "chocolate" },
        { id: "good-urge", date: "2026-11-03", intensity: 4, want: "water", factors: ["thirst-not-real", "bored"] },
      ],
    });
    expect(log.urges.map((item) => item.id)).toEqual(["good-urge"]);
    expect(log.urges[0]?.factors).toEqual(["bored"]);
    expect(JSON.stringify(log)).not.toContain("Sample visitor");
    expect(JSON.stringify(log)).not.toContain(EXAMPLE_MOMENT_STORY);
  });

  it("keeps habit marks when a habit is removed", () => {
    const log: WellnessLog = {
      ...emptyWellnessLog(),
      habits: [
        {
          id: "habit-water",
          slug: "water",
          title: "Water",
          cadence: "daily",
          target: 1,
          paused: true,
          createdOn: "2026-11-01",
          note: "",
        },
      ],
      habitMarks: [{ id: "mark-1", slug: "water", date: "2026-11-03" }],
    };
    const next = removeHabitKeepHistory(log, "habit-water");
    expect(next.habits).toHaveLength(0);
    expect(next.habitMarks).toHaveLength(1);
  });
});

describe("source registry and foods", () => {
  it("lists opened sources with the fields a reader needs", () => {
    expect(wellnessSources.length).toBeGreaterThan(20);
    for (const source of wellnessSources) {
      expect(source.id).toMatch(/^[a-z0-9-]{1,80}$/);
      expect(source.name.length).toBeGreaterThan(3);
      expect(source.publisher.length).toBeGreaterThan(3);
      expect(source.url.startsWith("https://")).toBe(true);
      expect(source.license.length).toBeGreaterThan(3);
      expect(["permitted", "unclear-link-out"]).toContain(source.commercialReuse);
      expect(source.accessMethod.length).toBeGreaterThan(3);
      expect(source.attribution.length).toBeGreaterThan(3);
      expect(source.lastChecked).toBe("2026-11-03");
    }
    const ids = wellnessSources.map((source) => source.id);
    for (const id of ["fdc-sr-legacy", "nimh-sad", "cdc-sun-safety", "pmc-green-space", "cleveland-earthing", "nci-if-then"]) {
      expect(ids).toContain(id);
    }
  });

  it("keeps the USDA subset and challenge lengths", () => {
    expect(foods.length).toBe(55);
    expect(foods.every((food) => Number.isInteger(food.fdcId))).toBe(true);
    for (const challenge of challenges) {
      expect(challenge.plan.length === 7 || challenge.plan.length === 30).toBe(true);
    }
    expect(challenges.some((item) => item.id === "nature-7" && item.plan.length === 7)).toBe(true);
    expect(challenges.some((item) => item.id === "nature-30" && item.plan.length === 30)).toBe(true);
  });
});

describe("education copy", () => {
  it("does not invent a lifespan or a detox claim", () => {
    const text = `${urgeCopyText()}\n${natureCopyText()}`;
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(banned.test(text)).toBe(false);
  });

  it("builds a moment plan without saving the example story", () => {
    const plan = buildMomentPlan({ minutes: 10, filters: ["learn"], categories: ["mind"] });
    expect(plan.detail).not.toContain(EXAMPLE_MOMENT_STORY);
    expect(plan.title.length).toBeGreaterThan(0);
  });

  it("describes an outdoor mood pattern only from enough notes", () => {
    const note = (id: string, outdoor: boolean, mood: number): NatureEntry => ({
      id,
      date: "2026-11-03",
      outdoorMinutes: outdoor ? 10 : 0,
      weather: outdoor ? "cloudy" : "window",
      moodBefore: 3,
      moodAfter: mood,
      energy: null,
      sleep: null,
      activities: [],
      movement: "",
      connection: "",
      reflection: "",
    });
    expect(outdoorMoodSentence([note("a", true, 4)])).toContain("not enough");
    const enough = [
      note("a", true, 5),
      note("b", true, 4),
      note("c", false, 2),
      note("d", false, 2),
    ];
    expect(outdoorMoodSentence(enough)).toContain("Your journal shows that you often report a better mood");
    expect(outdoorMoodSentence(enough)).not.toContain("diagnosis of seasonal depression is confirmed");
  });
});

describe("population table and hypothetical combination", () => {
  it("shows a copied SSA figure only for a copied age and column", () => {
    expect(populationFigure(40, "male")).toBe(38.59);
    expect(populationFigure(65, "female")).toBe(20.66);
    expect(populationFigure(41, "male")).toBeNull();
    const missing = validateComplete(validAnswers());
    expect(missing.ok).toBe(true);
    if (!missing.ok) return;
    const hidden = populationBlock(missing.value);
    expect(hidden.shown).toBe(false);
    expect(hidden.text).toContain("https://www.ssa.gov/oact/STATS/table4c6.html");
    expect(hidden.text).not.toContain("38.59");

    const parsed = validateComplete(validAnswers({ exactAge: "40", tableSex: "male" }));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const shown = populationBlock(parsed.value);
    expect(shown.shown).toBe(true);
    expect(shown.text).toContain("38.59");
    expect(shown.text).toContain(POPULATION_LABEL);
    expect(shown.text.toLowerCase()).not.toContain("you will live");
    expect(shown.text.toLowerCase()).not.toContain("date of death");
    expect(containsProhibitedClaim(shown.text)).toBe(false);
  });

  it("keeps a two-habit comparison hypothetical", () => {
    const parsed = validateComplete(validAnswers());
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const walk = buildScenario("walk", parsed.value, "");
    const sleep = buildScenario("sleep", parsed.value, "");
    expect(walk && sleep).toBeTruthy();
    if (!walk || !sleep) return;
    const combo = buildCombination(walk, sleep);
    expect(combo.label).toBe("Hypothetical");
    expect(combo.together.toLowerCase()).not.toContain("7 years longer");
    expect(containsProhibitedClaim(`${combo.current} ${combo.oneChange} ${combo.together}`)).toBe(false);
  });
});
