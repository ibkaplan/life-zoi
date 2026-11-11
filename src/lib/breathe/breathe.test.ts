import { describe, expect, it } from "vitest";
import { containsProhibitedClaim } from "@/lib/claims";
import {
  AGE_FIGURE_NOTE,
  BREATHE_DISCLAIMER,
  BREATHE_SOURCES,
  breatheCopy,
  MEDICAL_CAUTION,
  NOT_A_CURE,
  ORAL_BACTERIA,
  PROGRAM_LIMITS,
  SAFETY_RULES,
  STOP_SIGNS,
  SUPPLEMENT_NOTE,
  TECHNIQUES,
} from "@/lib/breathe/content";
import {
  buildSession,
  CHALLENGE_WEEKS,
  challengeDay,
  challengeSummary,
  challengeWeek,
  compareHabits,
  describeChange,
  focusFor,
  habitsFromAssessment,
  isPracticeDay,
  last30Days,
  lifeChanges,
  PACES,
  phaseAt,
  sessionSeconds,
  weekCalendar,
  weekProgress,
} from "@/lib/breathe/program";
import {
  addSession,
  emptyBreathe,
  emptyHabits,
  finishChallenge,
  sanitizeBreathe,
  saveCheckIn,
  saveExtras,
  startChallenge,
  toggleDay,
  type BreatheSession,
} from "@/lib/breathe/state";
import { emptyCompanion, isEmptyCompanion, sanitizeCompanion } from "@/lib/companion/state";
import { addIsoDays } from "@/lib/dates";
import { EMPTY_ASSESSMENT } from "@/lib/types";

const emptyAssessment = () => ({ ...EMPTY_ASSESSMENT });

const session = (date: string, id = `s-${date}`, extra: Partial<BreatheSession> = {}): BreatheSession => ({ id, date, seconds: 540, complete: true, feltAfter: null, ...extra });

describe("Breathe for Life wording", () => {
  const all = breatheCopy().join("\n");

  it("never presents nitric oxide as a cure or as preventing disease", () => {
    // Every sentence that mentions curing, preventing, or treating must be a negative one.
    const sentences = all.split(/(?<=[.!?])\s+|\n/);
    for (const line of sentences.filter((item) => /\b(cure[sd]?|prevent(s|ed|ing)?|treat(s|ed|ing)?|revers(e|es|ing))\b/i.test(item))) {
      expect(line).toMatch(/\b(not|no|nothing|never|does not|do not)\b/i);
    }
    expect(NOT_A_CURE).toMatch(/not a cure/i);
    expect(PROGRAM_LIMITS).toMatch(/not proven to prevent disease or to restore age-related nitric oxide/i);
    expect(BREATHE_DISCLAIMER).toMatch(/does not measure nitric oxide/i);
  });

  it("uses no percentage and passes the app's wording check", () => {
    expect(containsProhibitedClaim(all)).toBe(false);
    expect(all).not.toMatch(/\d\s*%|percent/i);
  });

  it("states the 15-fold figure only as nasal output in a small study, never whole-body", () => {
    const sentences = all.split(/(?<=[.!?])\s+/).filter((line) => /15|fifteen/i.test(line));
    expect(sentences.length).toBeGreaterThan(0);
    for (const line of sentences) {
      if (/15 times|15-fold/i.test(line)) {
        // Either it says the figure is nasal, or it says what the figure is not.
        expect(/nose|nasal/i.test(line) || /\bnot a 15-fold\b/i.test(line)).toBe(true);
      }
    }
    const bhramari = TECHNIQUES.find((item) => item.id === "bhramari");
    const text = bhramari?.science.map((item) => item.text).join(" ") ?? "";
    expect(text).toMatch(/small study/i);
    expect(text).toMatch(/not a 15-fold increase in nitric oxide in the whole body/i);
  });

  it("does not use the unverified age-decline figure as a fact", () => {
    expect(all).not.toMatch(/\b75\b|seventy-five/i);
    expect(AGE_FIGURE_NOTE.text).toMatch(/could not find/i);
    expect(AGE_FIGURE_NOTE.text).toMatch(/does not use that number/i);
  });

  it("labels every technique's science and includes traditional teaching for yoga practices", () => {
    for (const technique of TECHNIQUES) expect(technique.science.length).toBeGreaterThan(0);
    const levels = (id: string) => TECHNIQUES.find((item) => item.id === id)?.science.map((item) => item.level) ?? [];
    expect(levels("bhramari")).toEqual(expect.arrayContaining(["preliminary", "traditional"]));
    expect(levels("alternate")).toContain("traditional");
  });

  it("never asks for breath holding, fast breathing, or force in the instructions", () => {
    const steps = TECHNIQUES.flatMap((item) => item.steps).join(" ");
    expect(steps).not.toMatch(/\bhold (your|the) breath\b(?! between)/i);
    expect(steps).toMatch(/Do not hold your breath/);
    expect(SAFETY_RULES.join(" ")).toMatch(/Never hold your breath, breathe very fast, or force/);
    expect(SAFETY_RULES.join(" ")).toMatch(/stop at any time/i);
  });

  it("tells people when to stop and gives cautions for lung and heart conditions", () => {
    for (const sign of ["dizzy", "short of breath", "chest discomfort", "unusual"]) expect(STOP_SIGNS).toContain(sign);
    expect(MEDICAL_CAUTION).toMatch(/asthma/);
    expect(MEDICAL_CAUTION).toMatch(/heart disease/);
    expect(MEDICAL_CAUTION).toMatch(/do not replace your inhalers, medicines/);
  });

  it("does not tell people to stop mouthwash or to take supplements", () => {
    expect(ORAL_BACTERIA.mouthwash).toMatch(/do not stop a prescribed rinse/i);
    expect(ORAL_BACTERIA.mouthwash).toMatch(/ask your dentist or clinician/i);
    expect(SUPPLEMENT_NOTE).toMatch(/does not recommend/i);
    expect(SUPPLEMENT_NOTE).toMatch(/clinician or pharmacist/i);
  });

  it("cites the five requested sources with working https links", () => {
    const urls = BREATHE_SOURCES.map((source) => source.url);
    for (const url of [
      "https://extension.oregonstate.edu/catalog/em-9442-say-no-disease-benefits-nitric-oxide",
      "https://pubmed.ncbi.nlm.nih.gov/12119224/",
      "https://pubmed.ncbi.nlm.nih.gov/12952268/",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC3482987/",
      "https://www.sciencedirect.com/science/article/pii/S1089860322000659",
    ]) {
      expect(urls).toContain(url);
    }
    for (const url of urls) expect(url).toMatch(/^https:\/\//);
  });
});

describe("guided session", () => {
  it("follows the suggested 2 + 2 + 3 + 1½ minute session, between 5 and 10 minutes", () => {
    const full = buildSession("full", "gentle");
    expect(full.map((step) => step.id)).toEqual(["nasal", "bhramari", "diaphragm", "rest"]);
    // Whole breaths: 12 breaths of 10 s, 11 hums of 11 s, 18 breaths of 10 s, then rest.
    expect(full.map((step) => step.seconds)).toEqual([120, 121, 180, 90]);
    const short = buildSession("short", "gentle");
    for (const steps of [full, short, buildSession("full", "standard", "foundations"), buildSession("short", "standard", "foundations")]) {
      const minutes = sessionSeconds(steps) / 60;
      // "About 5" to "about 9" minutes: whole breaths can move a session by a few seconds.
      expect(minutes).toBeGreaterThanOrEqual(4.5);
      expect(minutes).toBeLessThanOrEqual(10);
    }
    const quick = sessionSeconds(buildSession("quick", "gentle")) / 60;
    expect(quick).toBeGreaterThanOrEqual(2.5);
    expect(quick).toBeLessThanOrEqual(3.5);
  });

  it("has no hold phase, keeps breaths slow, and never makes the out-breath shorter", () => {
    for (const pace of Object.values(PACES)) {
      expect(pace.inhale).toBeGreaterThanOrEqual(3);
      expect(pace.exhale).toBeGreaterThanOrEqual(pace.inhale);
      expect(pace.hum).toBeGreaterThanOrEqual(pace.inhale);
    }
    for (const step of buildSession("full", "standard")) {
      for (const part of step.pattern) expect(["in", "out", "hum"]).toContain(part.phase);
    }
  });

  it("week 1 of the challenge leaves out humming", () => {
    expect(buildSession("full", "gentle", "foundations").map((step) => step.id)).toEqual(["nasal", "diaphragm", "rest"]);
  });

  it("uses a calm default of 4 seconds in and 6 out", () => {
    expect(PACES.gentle).toMatchObject({ inhale: 4, exhale: 6 });
    expect(PACES.standard.exhale).toBeGreaterThanOrEqual(5);
  });

  it("never cuts a breath short at the end of a step", () => {
    for (const length of ["quick", "short", "full"] as const)
      for (const pace of ["gentle", "standard"] as const)
        for (const step of buildSession(length, pace)) {
          const cycle = step.pattern.reduce((sum, item) => sum + item.seconds, 0);
          if (cycle > 0) expect(step.seconds % cycle).toBe(0);
        }
  });

  it("moves through breaths and steps on a timer", () => {
    const steps = buildSession("full", "gentle"); // in 4, out 6, hum 7
    expect(phaseAt(steps, 0)).toMatchObject({ stepIndex: 0, phase: "in", phaseLength: 4 });
    expect(phaseAt(steps, 3.9)).toMatchObject({ stepIndex: 0, phase: "in" });
    expect(phaseAt(steps, 4.5)).toMatchObject({ stepIndex: 0, phase: "out", phaseElapsed: 0.5, phaseLength: 6 });
    expect(phaseAt(steps, 10)).toMatchObject({ phase: "in" });
    expect(phaseAt(steps, 121)).toMatchObject({ stepIndex: 1, phase: "in" });
    expect(phaseAt(steps, 125)).toMatchObject({ stepIndex: 1, phase: "hum", phaseLength: 7 });
    expect(phaseAt(steps, 422)).toMatchObject({ stepIndex: 3, phase: "natural" });
    expect(phaseAt(steps, 511).done).toBe(true);
    expect(phaseAt(steps, 0).totalRemaining).toBe(511);
    // each new phase gets a new key
    expect(phaseAt(steps, 1).phaseKey).not.toBe(phaseAt(steps, 4).phaseKey);
    expect(phaseAt(steps, 1).phaseKey).toBe(phaseAt(steps, 2).phaseKey);
  });

});

describe("weekly calendar", () => {
  const today = "2026-11-11"; // a Wednesday

  it("recommends four days by default and counts any day practiced", () => {
    let state = emptyBreathe();
    expect(state.days).toHaveLength(4);
    const calendar = weekCalendar(state, today);
    expect(calendar).toHaveLength(7);
    expect(calendar[0]?.date).toBe("2026-11-09");
    expect(calendar.filter((day) => day.recommended)).toHaveLength(4);
    state = addSession(state, session("2026-11-09"));
    state = addSession(state, session("2026-11-10")); // not a default day
    state = addSession(state, session("2026-11-10", "second"));
    const progress = weekProgress(state, today);
    expect(progress).toMatchObject({ practiceDays: 2, recommendedDone: 1, extraDays: 1, target: 4, met: false });
    state = addSession(addSession(state, session("2026-11-11")), session("2026-11-13"));
    expect(weekProgress(state, today).met).toBe(true);
    // a session from last week does not count
    expect(weekProgress(addSession(emptyBreathe(), session("2026-11-08")), today).practiceDays).toBe(0);
  });

  it("lets the person choose days but always keeps at least one", () => {
    let state = { ...emptyBreathe(), days: [2] };
    expect(isPracticeDay(state, today)).toBe(true);
    state = toggleDay(state, 2);
    expect(state.days).toEqual([2]);
    state = toggleDay(state, 5);
    expect(state.days).toEqual([2, 5]);
    expect(toggleDay(state, 9)).toBe(state);
  });

  it("shows the last 30 days, oldest first", () => {
    const days = last30Days([session(today), session(addIsoDays(today, -29)), session(addIsoDays(today, -30))], today);
    expect(days).toHaveLength(30);
    expect(days[0]?.date).toBe(addIsoDays(today, -29));
    expect(days.filter((day) => day.practiced)).toHaveLength(2);
  });
});

describe("30-day challenge", () => {
  const start = "2026-11-02";

  it("has four weekly goals in the requested order", () => {
    expect(CHALLENGE_WEEKS.map((week) => week.title)).toEqual([
      "Learn nasal and diaphragmatic breathing",
      "Add Bhramari humming",
      "Breathing, walking, and nitrate-rich foods",
      "Build a steady routine",
    ]);
  });

  it("counts days and weeks, with days 29 and 30 in week 4", () => {
    const c = { startedOn: start };
    expect(challengeDay(c, "2026-11-01")).toBe(0);
    expect(challengeDay(c, start)).toBe(1);
    expect(challengeDay(c, addIsoDays(start, 29))).toBe(30);
    expect(challengeDay(c, addIsoDays(start, 60))).toBe(31);
    expect([1, 7, 8, 14, 15, 21, 22, 30].map(challengeWeek)).toEqual([1, 1, 2, 2, 3, 3, 4, 4]);
  });

  it("uses the foundations session only in week 1 of an active challenge", () => {
    const state = startChallenge(emptyBreathe(), start, emptyHabits());
    expect(focusFor(state.challenge, start)).toBe("foundations");
    expect(focusFor(state.challenge, addIsoDays(start, 7))).toBe("complete");
    expect(focusFor(null, start)).toBe("complete");
  });

  it("summarizes sessions, weekly consistency, and self-rated stress and relaxation", () => {
    let state = startChallenge(emptyBreathe(), start, { ...emptyHabits(), practice: "rarely", stress: 4, relaxation: 2 });
    for (const offset of [0, 2, 4, 6, 8, 10, 22, 23, 28, 29]) state = addSession(state, session(addIsoDays(start, offset)));
    state = addSession(state, session(addIsoDays(start, 30), "after-window")); // day 31 is not counted
    state = addSession(state, session(addIsoDays(start, 1), "partial", { complete: false, seconds: 120, feltAfter: 4 }));
    state = saveExtras(state, { date: addIsoDays(start, 15), walked: true, greens: true });
    state = saveExtras(state, { date: addIsoDays(start, 16), walked: true, greens: false });
    state = saveCheckIn(state, { date: addIsoDays(start, 14), stress: 3, relaxation: 3 });
    const mid = challengeSummary(state, addIsoDays(start, 20));
    expect(mid).toMatchObject({ day: 21, week: 3, ended: false, sessions: 11, completeSessions: 10, walkDays: 2, greensDays: 1, stressBefore: 4, stressLatest: 3, relaxLatest: 3, feltAfterAverage: 4 });
    expect(mid?.weeks.map((week) => week.practiceDays)).toEqual([5, 2, 0, 4]);
    expect(mid?.weeks.map((week) => week.met)).toEqual([true, false, false, true]);

    state = finishChallenge(state, addIsoDays(start, 30), { ...emptyHabits(), practice: "often", stress: 2, relaxation: 4 }, "Calmer in the evenings.");
    const end = challengeSummary(state, addIsoDays(start, 30));
    expect(end).toMatchObject({ ended: true, stressLatest: 2, relaxLatest: 4 });
    expect(describeChange("stress", end?.stressBefore ?? null, end?.stressLatest ?? null)).toMatch(/went from 4 to 2/);
    expect(describeChange("relaxation", null, 3)).toMatch(/Rate your relaxation/);
    const rows = compareHabits(state.challenge!.before, state.challenge!.after);
    expect(rows[0]).toEqual({ label: "Breathing practice", before: "Rarely", after: "Often" });
  });

  it("offers a new plan that archives the old one and starts from the new habits", () => {
    let state = startChallenge(emptyBreathe(), start, emptyHabits());
    state = addSession(state, session(start));
    state = finishChallenge(state, addIsoDays(start, 30), { ...emptyHabits(), practice: "often" }, "");
    state = startChallenge(state, addIsoDays(start, 31), state.challenge!.after!);
    expect(state.challenge).toMatchObject({ round: 2, startedOn: addIsoDays(start, 31), finishedOn: "" });
    expect(state.challenge?.before.practice).toBe("often");
    expect(state.past).toEqual([{ startedOn: start, finishedOn: addIsoDays(start, 30), round: 1, sessions: 1 }]);
  });
});

describe("My Current Life and My New Life", () => {
  it("is built only from what was reported", () => {
    expect(lifeChanges(null, null)).toEqual([]);
    const answers = { ...emptyAssessment(), activityDays: "1", vegetables: "rarely" as const, stress: "high" as const };
    const ids = lifeChanges(answers, { practice: "rarely", mouthBreathing: "often" }).map((item) => item.id);
    expect(ids).toEqual(["practice", "humming", "mouth", "activity", "greens", "stress"]);
    const calm = { ...emptyAssessment(), activityDays: "5", vegetables: "daily" as const, stress: "low" as const };
    expect(lifeChanges(calm, { practice: "often", mouthBreathing: "rarely" })).toEqual([]);
  });

  it("never claims a measured or percentage change", () => {
    const answers = { ...emptyAssessment(), activityDays: "0", vegetables: "rarely" as const, stress: "high" as const };
    const text = lifeChanges(answers, { practice: "rarely", mouthBreathing: "often" })
      .flatMap((item) => [item.current, item.next, item.why])
      .join(" ");
    expect(containsProhibitedClaim(text)).toBe(false);
    expect(text).not.toMatch(/increase(s)? (your )?(whole-body )?nitric oxide by/i);
  });

  it("prefills habit answers from the assessment", () => {
    const answers = { ...emptyAssessment(), vegetables: "daily" as const, walking: "rarely" as const, stress: "high" as const };
    expect(habitsFromAssessment(answers)).toEqual({ greens: "most-days", walking: "rarely", stress: 4 });
    expect(habitsFromAssessment(null)).toEqual({});
  });
});

describe("saved data", () => {
  it("is part of the companion state and survives sanitizing", () => {
    expect(isEmptyCompanion(emptyCompanion())).toBe(true);
    const state = { ...emptyCompanion(), breathe: addSession(emptyBreathe(), session("2026-11-09")) };
    expect(isEmptyCompanion(state)).toBe(false);
    const round = sanitizeCompanion(JSON.parse(JSON.stringify(state)));
    expect(round.breathe.sessions).toHaveLength(1);
    // older saved copies without the field still load
    expect(sanitizeCompanion({ version: 1 }).breathe).toEqual(emptyBreathe());
  });

  it("drops bad values", () => {
    const clean = sanitizeBreathe({
      days: [0, 0, 9, -1, 3],
      sessions: [{ id: "ok", date: "2026-11-09", seconds: 300 }, { id: "bad date", date: "2026-13-40", seconds: 300 }, { id: "x", date: "2026-11-09", seconds: 99999 }],
      challenge: { startedOn: "2026-11-02", before: { practice: "never", stress: 9 }, checkIns: [{ date: "2026-11-03", stress: 2 }] },
      pace: "fast",
    });
    expect(clean.days).toEqual([0, 3]);
    expect(clean.sessions.map((item) => item.id)).toEqual(["ok"]);
    expect(clean.challenge?.before).toEqual(emptyHabits());
    expect(clean.challenge?.checkIns).toEqual([{ date: "2026-11-03", stress: 2, relaxation: null }]);
    expect(clean.pace).toBe("gentle");
  });
});
