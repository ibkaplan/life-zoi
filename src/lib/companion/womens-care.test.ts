import { describe, expect, it } from "vitest";
import { mealsForDay, type DayMeals } from "@/lib/companion/nutrition";
import { emptyCompanion, emptyFoodPrefs, emptyWomensCare, isEmptyCompanion, sanitizeCompanion, type FoodPrefs, type WomensCarePrefs } from "@/lib/companion/state";
import {
  careClinician,
  careTips,
  focusFor,
  plannedMeals,
  womensCareActive,
  WOMENS_CARE_MESSAGE,
  WOMENS_CARE_RECIPES,
  WOMENS_CARE_TITLE,
} from "@/lib/companion/womens-care";
import { coerceHealthProfile, emptyHealthProfile, type HealthProfileFields } from "@/lib/health-profile";

/** Synthetic profiles only. No real person's data. */
function person(health: Partial<HealthProfileFields> = {}) {
  return { ...emptyHealthProfile(), ...coerceHealthProfile(health) };
}

function food(patch: Partial<FoodPrefs> = {}): FoodPrefs {
  return { ...emptyFoodPrefs(), ...patch };
}

function care(patch: Partial<WomensCarePrefs> = {}): WomensCarePrefs {
  return { ...emptyWomensCare(), identifiesAsWoman: true, relevant: true, ...patch };
}

function allMeals(day: DayMeals) {
  return [...day.slots.breakfast, ...day.slots.lunch, ...day.slots.dinner, ...day.slots.snack];
}

const SEED = "2026-11-10";

describe("Women's Care: opt-in", () => {
  it("is off unless the person ticks both boxes, and then the plan is unchanged", () => {
    const base = mealsForDay(person(), food(), "general", SEED);
    for (const prefs of [emptyWomensCare(), { ...emptyWomensCare(), identifiesAsWoman: true }, { ...emptyWomensCare(), relevant: true }, null]) {
      expect(womensCareActive(prefs)).toBe(false);
      const planned = plannedMeals(person(), food(), "general", SEED, null, prefs);
      expect(planned.care).toBeNull();
      expect(planned.day).toEqual(base);
    }
  });

  it("is never switched on by the assessment or a name", () => {
    const answers = person({ displayName: "Maria" } as Partial<HealthProfileFields>);
    expect(plannedMeals(answers, food(), "general", SEED, null, emptyCompanion().womensCare).care).toBeNull();
  });

  it("uses the requested title and core message", () => {
    expect(WOMENS_CARE_TITLE).toBe("WOMEN'S CARE – Nutrition That Understands Your Body");
    expect(WOMENS_CARE_MESSAGE).toBe("We care about women at every stage of life. Your body changes, and your nutrition can change with it.");
  });
});

describe("Women's Care: adapting the existing plan", () => {
  it("adds iron and vitamin C focus during a period and moves iron-rich meals up", () => {
    const planned = plannedMeals(person(), food(), "general", SEED, null, care({ stage: "cycle", phase: "period" }));
    expect(planned.care).not.toBeNull();
    const ids = planned.care?.focus.map((item) => item.id) ?? [];
    expect(ids).toContain("iron");
    expect(ids).toContain("vitamin-c");
    expect(planned.care?.highlights.length).toBeGreaterThan(0);
    expect(planned.care?.highlights.some((item) => item.focus.includes("iron"))).toBe(true);
    // Still the same four slots of the same daily plan, not a separate plan.
    expect(Object.keys(planned.day.slots)).toEqual(["breakfast", "lunch", "dinner", "snack"]);
    expect(planned.day.guidance).toEqual(mealsForDay(person(), food(), "general", SEED).guidance);
  });

  it("focuses on calcium, protein, and fiber for menopause", () => {
    const ids = focusFor(care({ stage: "menopause" }));
    expect(ids).toEqual(expect.arrayContaining(["calcium", "protein", "fiber"]));
    expect(focusFor(care({ stage: "menopause", phase: "period" }))).not.toContain("warm");
  });

  it("covers perimenopause too", () => {
    expect(focusFor(care({ stage: "perimenopause" }))).toEqual(expect.arrayContaining(["calcium", "iron"]));
  });

  it("offers satisfying options: meat, fish, and healthy desserts when the person eats them", () => {
    const planned = plannedMeals(person(), food(), "general", SEED, null, care({ stage: "cycle", phase: "luteal", symptoms: ["sweet-cravings"] }));
    const hearty = planned.care?.hearty ?? [];
    expect(hearty.some(({ recipe }) => recipe.ingredients.some((item) => item.kind === "meat" || item.kind === "fish"))).toBe(true);
    expect(planned.care?.desserts.length).toBeGreaterThan(0);
    expect(planned.day.slots.snack[0]?.recipe.tags).toContain("dessert");
    expect(planned.care?.plantOnly).toBe(false);
  });
});

describe("Women's Care: every idea still passes the person's checks", () => {
  it("vegetarian: no meat or fish in meals, hearty options, or example foods", () => {
    const planned = plannedMeals(person({ dietPatterns: ["vegetarian"] }), food(), "general", SEED, null, care({ stage: "cycle", phase: "period", symptoms: ["salty-cravings"] }));
    for (const { recipe } of allMeals(planned.day)) {
      for (const item of recipe.ingredients) expect(["meat", "fish"]).not.toContain(item.kind);
    }
    expect(planned.care?.plantOnly).toBe(true);
    const examples = planned.care?.focus.flatMap((item) => item.examples).join(" ") ?? "";
    expect(examples).not.toMatch(/beef|lamb|chicken|turkey|sardine|salmon|fish/i);
    expect(examples).toMatch(/lentils/i);
    expect(planned.day.excluded.some((item) => item.recipe.id === "wc-beef-bean-chili")).toBe(true);
  });

  it("vegan: no dairy, egg, or honey anywhere", () => {
    const planned = plannedMeals(person({ dietPatterns: ["vegan"] }), food(), "general", SEED, null, care({ stage: "menopause" }));
    for (const { recipe } of allMeals(planned.day)) {
      for (const item of recipe.ingredients) expect(["meat", "fish", "dairy", "egg", "honey"]).not.toContain(item.kind);
    }
    const examples = planned.care?.focus.flatMap((item) => item.examples).join(" ") ?? "";
    expect(examples).not.toMatch(/yogurt|cheese|eggs/i);
    expect(examples).toMatch(/fortified plant drink/i);
  });

  it("a milk allergy removes the chocolate yogurt pot and dark chocolate, with no swap", () => {
    const planned = plannedMeals(person({ foodAllergies: ["milk"] }), food(), "general", SEED, null, care({ stage: "cycle", phase: "luteal", symptoms: ["sweet-cravings"] }));
    expect(allMeals(planned.day).some(({ recipe }) => recipe.id === "wc-choc-berry-yogurt")).toBe(false);
    expect(planned.day.excluded.find((item) => item.recipe.id === "wc-choc-berry-yogurt")?.reason).toMatch(/allergy/);
    expect(planned.care?.focus.flatMap((item) => item.examples).join(" ")).not.toMatch(/chocolate|milk/i);
    // A dairy-free dessert can still be offered.
    expect(planned.care?.desserts.some(({ recipe }) => recipe.id === "wc-choc-chia-pudding")).toBe(true);
  });

  it("halal and no-beef requirements leave out pork and beef, swapping beef in the chili", () => {
    const planned = plannedMeals(person({ dietRequirements: ["halal", "no-beef"] }), food(), "general", SEED, null, care({ stage: "cycle", phase: "period" }));
    const chili = allMeals(planned.day).find(({ recipe }) => recipe.id === "wc-beef-bean-chili");
    if (chili) expect(chili.swaps.join(" ")).toMatch(/Made without lean beef mince/);
    const examples = planned.care?.focus.flatMap((item) => item.examples).join(" ") ?? "";
    expect(examples).not.toMatch(/beef|pork/i);
  });

  it("a personal exclusion is never shown as a meal ingredient or example", () => {
    const planned = plannedMeals(person(), food({ exclusions: ["spinach"] }), "general", SEED, null, care({ stage: "cycle", phase: "period" }));
    for (const { recipe } of allMeals(planned.day)) {
      expect(recipe.ingredients.some((item) => /spinach/i.test(item.name))).toBe(false);
    }
    expect(planned.care?.focus.flatMap((item) => item.examples).join(" ")).not.toMatch(/spinach/i);
  });

  it("the added recipe ideas are all run through the same checks", () => {
    const planned = plannedMeals(person({ foodAllergies: ["fish", "wheat", "milk", "soy"] }), food(), "general", SEED, null, care({ stage: "cycle" }));
    const shown = new Set(allMeals(planned.day).map(({ recipe }) => recipe.id));
    const excluded = new Set(planned.day.excluded.map((item) => item.recipe.id));
    for (const recipe of WOMENS_CARE_RECIPES) expect(shown.has(recipe.id) || excluded.has(recipe.id)).toBe(true);
    expect(shown.has("wc-sardine-toast")).toBe(false);
  });
});

describe("Women's Care: tone and safety", () => {
  it("points to a clinician for heavy bleeding, severe symptoms, or iron worries", () => {
    expect(careClinician(care()).urgent).toBe(false);
    expect(careClinician(care()).lines.join(" ")).toMatch(/clinician/);
    for (const flag of [care({ symptoms: ["heavy-bleeding"] }), care({ symptoms: ["severe"] }), care({ ironConcern: true })]) {
      const result = careClinician(flag);
      expect(result.urgent).toBe(true);
      expect(result.lines.length).toBeGreaterThan(1);
    }
  });

  it("makes no medical claims, gives no figures, and does not shame food", () => {
    const all = [...careTips(care({ symptoms: ["tired", "cramps", "bloating", "sweet-cravings", "salty-cravings", "big-appetite", "low-mood", "headache", "hot-flushes", "poor-sleep"], stage: "perimenopause" })),
      ...(plannedMeals(person(), food(), "general", SEED, null, care({ stage: "cycle", phase: "period", symptoms: ["cramps", "poor-sleep", "low-mood"] })).care?.focus.map((item) => item.why) ?? []),
      ...careClinician(care({ symptoms: ["heavy-bleeding", "severe"], ironConcern: true })).lines].join(" ");
    expect(all.replace("There are no good or bad foods here.", "")).not.toMatch(/%|\bmg\b|\bcures?\b|\bheals?\b|\bprevents?\b|\bdetox|\bguilt|\bcheat|\bjunk|\bnaughty|\bbad food/i);
    expect(all).toMatch(/no good or bad foods/i);
  });
});

describe("Women's Care: storage", () => {
  it("keeps only known answers and clears the phase outside the cycle stage", () => {
    const clean = sanitizeCompanion({
      womensCare: { identifiesAsWoman: true, relevant: true, stage: "menopause", phase: "period", symptoms: ["tired", "bogus"], ironConcern: "yes", updatedOn: "2026-11-10" },
    }).womensCare;
    expect(clean).toEqual({ identifiesAsWoman: true, relevant: true, stage: "menopause", phase: "", symptoms: ["tired"], ironConcern: false, updatedOn: "2026-11-10" });
    expect(sanitizeCompanion({}).womensCare).toEqual(emptyWomensCare());
  });

  it("an opted-in state is not treated as empty, so it is not overwritten by an older copy", () => {
    expect(isEmptyCompanion({ ...emptyCompanion(), womensCare: care() })).toBe(false);
    expect(isEmptyCompanion(emptyCompanion())).toBe(true);
  });
});
