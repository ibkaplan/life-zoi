import { describe, expect, it } from "vitest";
import { daySchedule, goalActivity, nextOption, planContext, planSections, SECTION_IDS } from "@/lib/companion/day-plan";
import { emptyCompanion, emptyDay, recordEntry, type WeeklyReview } from "@/lib/companion/state";
import { checkInDue, compare, nextWeekSuggestions, NOT_PROOF, oftenSkipped, progressNotes, totalsFor, weekTotals } from "@/lib/companion/weekly";
import { addIsoDays } from "@/lib/dates";

const NO_CUSTOM = { hidden: [], times: {}, picks: {} };

describe("My Life Improvement Plan", () => {
  it("has the nine sections, with personal goals turned into daily steps", () => {
    const state = { ...emptyCompanion(), goals: [{ id: "g1", text: "Walk to the park with my grandchildren", createdOn: "2026-11-01", updatedOn: "2026-11-01", archivedOn: "" }] };
    const sections = planSections(planContext(state, null, []));
    expect(Object.keys(sections)).toEqual([...SECTION_IDS]);
    expect(sections.goals).toHaveLength(1);
    expect(sections.goals[0]?.view.type).toBe("walk");
    for (const id of SECTION_IDS.filter((item) => item !== "goals")) expect(sections[id].length).toBeGreaterThan(0);
  });

  it("converts goals written in the person's own words", () => {
    const goal = (text: string) => goalActivity({ id: "g", text, createdOn: "", updatedOn: "", archivedOn: "" });
    expect(goal("Read more books").view.type).toBe("book");
    expect(goal("Feel calmer in the evenings").view.type).toBe("music");
    expect(goal("Learn to paint").view.type).toBe("steps");
  });

  it("leaves out disliked activities and keeps seated-first people seated", () => {
    const state = { ...emptyCompanion(), movement: { ...emptyCompanion().movement, disliked: ["pilates" as const] } };
    const flags = { seatedFirst: true, fallRisk: false, bloodSugarCare: false, lowBloodSugar: false, allergies: false, gentleMovement: true, clinicianDiet: false, injuryNote: false };
    const moves = planSections(planContext(state, flags, [])).movement;
    for (const move of moves) {
      expect(move.title).not.toMatch(/Pilates/);
      if (move.view.type === "movement") expect(["chair", "stretching", "breathing", "qigong"]).toContain(move.view.category);
    }
  });
});

describe("My Day", () => {
  it("covers the day from morning routine to sleep preparation, and changes by date", () => {
    const ctx = planContext(emptyCompanion(), null, []);
    const today = daySchedule("2026-11-09", ctx, NO_CUSTOM, null);
    const slots = today.map((item) => item.slot);
    for (const slot of ["morning-routine", "breakfast", "activity", "brain", "music", "reading", "lunch", "dinner", "relaxation", "evening-routine", "sleep-prep"]) expect(slots).toContain(slot);
    const ids = (date: string) => daySchedule(date, ctx, NO_CUSTOM, null).map((item) => item.activity.id).join();
    const days = new Set([0, 1, 2, 3, 4, 5, 6].map((n) => ids(addIsoDays("2026-11-09", n))));
    expect(days.size).toBeGreaterThan(1);
  });

  it("honours hidden parts, times, and replacements", () => {
    const ctx = planContext(emptyCompanion(), null, []);
    const first = daySchedule("2026-11-09", ctx, NO_CUSTOM, null).find((item) => item.slot === "music");
    if (!first) throw new Error("no music slot");
    const replacement = nextOption(first);
    const custom = { hidden: ["reading"], times: { music: "07:15" }, picks: { "2026-11-09:music": replacement.id } };
    const day = daySchedule("2026-11-09", ctx, custom, null);
    expect(day.some((item) => item.slot === "reading")).toBe(false);
    const music = day.find((item) => item.slot === "music");
    expect(music?.time).toBe("07:15");
    expect(music?.activity.id).toBe(replacement.id);
  });

  it("offers an indoor session when the walk is declined", () => {
    const ctx = planContext(emptyCompanion(), null, []);
    const walkDay = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14", "2026-11-15"].find(
      (date) => daySchedule(date, ctx, NO_CUSTOM, null).find((item) => item.slot === "activity")?.activity.view.type === "walk",
    );
    if (!walkDay) return;
    const inside = { ...emptyDay(walkDay), stayInside: true };
    expect(daySchedule(walkDay, ctx, NO_CUSTOM, inside).find((item) => item.slot === "activity")?.activity.view.type).toBe("movement");
  });
});

describe("weekly check-in", () => {
  const review: WeeklyReview = {
    id: "w1",
    weekStart: "2026-11-09",
    savedAt: "2026-11-15T10:00:00.000Z",
    feeling: 2,
    energy: 2,
    exerciseDays: 1,
    walkingMinutes: 20,
    booksRead: 0,
    pagesRead: 2,
    brainGames: 0,
    nutrition: "rarely",
    weightKg: null,
    bloodSugar: "",
    bloodPressure: "",
    cholesterol: "",
    difficult: "Getting up early",
    improveNext: "Walk after lunch",
    disliked: ["aerobics"],
    goalsChanged: false,
  };

  it("compares weeks with what was recorded and names progress without guilt", () => {
    let state = emptyCompanion();
    state = recordEntry(state, "2026-11-03", "day-activity", { status: "done", minutes: 10, replacedWith: "" }, { exerciseMinutes: 10 });
    state = recordEntry(state, "2026-11-10", "day-activity", { status: "done", minutes: 20, replacedWith: "" }, { exerciseMinutes: 20 });
    const current = weekTotals(state, "2026-11-09");
    const previous = weekTotals(state, "2026-11-02");
    expect(current.exerciseMinutes).toBe(20);
    expect(compare(current, previous).find((row) => row.label === "Exercise")?.change).toBe("more");
    expect(progressNotes(current, previous).join(" ")).toMatch(/More exercise/);
    expect(NOT_PROOF).toMatch(/not proof/);
  });

  it("suggests a next week that includes the person's own words and drops disliked activities", () => {
    const suggestions = nextWeekSuggestions(review, totalsFor([]), []);
    const text = suggestions.map((item) => item.text).join(" | ");
    expect(text).toMatch(/Walk after lunch/);
    expect(text).toMatch(/aerobics/);
    expect(suggestions.every((item) => item.status === "proposed")).toBe(true);
    expect(text).not.toMatch(/fail|should have|lazy/i);
  });

  it("finds activities skipped more than once, and knows when a check-in is due", () => {
    let state = emptyCompanion();
    for (const date of ["2026-11-09", "2026-11-10"]) state = recordEntry(state, date, "day-reading", { status: "skipped", minutes: 0, replacedWith: "" });
    expect(oftenSkipped(Object.values(state.days))).toEqual(["day-reading"]);
    expect(checkInDue(state, "2026-11-10")).toBe(true);
    const reviewed = { ...state, reviews: [review] };
    expect(checkInDue(reviewed, "2026-11-17")).toBe(false);
    expect(checkInDue(reviewed, "2026-11-22")).toBe(true);
  });
});
