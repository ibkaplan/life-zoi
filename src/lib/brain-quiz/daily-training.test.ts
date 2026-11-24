import { afterEach, describe, expect, it } from "vitest";
import type { Activity } from "@/lib/brain-quiz/activities";
import { activitiesFor, activityById } from "@/lib/brain-quiz/catalog";
import {
  buildDailyRound,
  dailyCategories,
  dailyRoundFor,
  dayNumber,
  ensureDailyRound,
  freshFor,
  RECENT_DAYS,
} from "@/lib/brain-quiz/daily";
import { buildGenerated, generatedId, isGeneratedId } from "@/lib/brain-quiz/generated";
import {
  activityCalendar,
  baseActivityId,
  BRAIN_LIMITS,
  CATEGORY_IDS,
  completeDaily,
  emptyBrainProgress,
  markSeen,
  nextMilestones,
  POINT_VALUES,
  recordOutcome,
  sanitizeBrain,
  saveDailyPick,
  weeklyHistory,
  welcomeFor,
  type BrainProgress,
} from "@/lib/brain-quiz/progress";
import { emptyCompanion, sanitizeCompanion } from "@/lib/companion/state";
import { fitForAccount } from "@/lib/companion/store";
import { addIsoDays, localISODate } from "@/lib/dates";
import { fmt } from "@/lib/i18n/config";

const DAY1 = "2026-11-24";
const DAY2 = "2026-11-25";

function isLocked(activity: Activity) {
  return activity.kind === "choice" || activity.kind === "multi" || activity.kind === "rebus";
}

/** What the quiz page does when one part is answered. */
function answer(progress: BrainProgress, date: string, activity: Activity, correct: boolean): BrainProgress {
  const base = baseActivityId(activity.id);
  const builtGame = activity.kind === "memory" || activity.kind === "attention";
  const outcome = recordOutcome(progress, {
    today: date,
    activityId: activity.id,
    category: activity.category,
    difficulty: activity.difficulty,
    correct,
    lock: isLocked(activity),
    baseId: !builtGame && base !== activity.id ? base : undefined,
  });
  const next = markSeen(outcome.progress, [activity.id], dayNumber(date));
  return saveDailyPick(next, date, { id: activity.id, correct, note: "ok", gained: outcome.gained, picked: [] });
}

/** Open the daily challenge, answer all five, and let the page claim the bonus. */
function playDay(progress: BrainProgress, date: string, correct: (index: number) => boolean = () => true) {
  let next = ensureDailyRound(progress, date);
  const round = dailyRoundFor(next, date);
  round.items.forEach((item, index) => {
    next = answer(next, date, item, correct(index));
  });
  const bonus = completeDaily(next, date, round.items.length);
  return { progress: bonus.progress, round, bonus };
}

/** Save and load again, the way a refresh reads the companion record back. */
function reload(progress: BrainProgress): BrainProgress {
  const stored = JSON.parse(JSON.stringify(fitForAccount({ ...emptyCompanion(), brainQuiz: progress }))) as unknown;
  return sanitizeCompanion(stored).brainQuiz;
}

describe("TEST 1: finish all five parts of today's challenge", () => {
  it("records five answers, the points for each level, and one 25-point bonus", () => {
    const { progress, round, bonus } = playDay(emptyBrainProgress(), DAY1);
    expect(round.items).toHaveLength(5);
    expect(progress.dailyDone).toEqual([DAY1]);
    expect(bonus.gained).toBe(POINT_VALUES.dailyBonus);
    const itemPoints = round.items.reduce((sum, item) => sum + POINT_VALUES[item.difficulty], 0);
    expect(progress.points).toBe(itemPoints + 25);
    expect(progress.dailyScores[0]).toEqual({ date: DAY1, score: itemPoints + 25, correct: 5 });
    expect(progress.right).toBe(5);
    expect(progress.wrong).toBe(0);
    expect(welcomeFor(progress, DAY1, dayNumber(DAY1)).title).toMatch(/done/);
  });

  it("balances the levels and never repeats a question inside one day", () => {
    let progress = emptyBrainProgress();
    const levels = { easy: 0, medium: 0, hard: 0 };
    for (let day = 0; day < 120; day += 1) {
      const date = addIsoDays(DAY1, day);
      const round = buildDailyRound(date, progress);
      expect(round.items).toHaveLength(5);
      const bases = round.items.map((item) => baseActivityId(item.id));
      expect(new Set(bases).size).toBe(5);
      expect(round.items.map((item) => item.category)).toEqual(dailyCategories(date));
      for (const item of round.items) levels[item.difficulty] += 1;
      if (day < 7) expect(round.items.map((item) => item.difficulty).sort()).toEqual(["easy", "easy", "hard", "medium", "medium"]);
      progress = playDay(progress, date).progress;
    }
    // Two easy, two medium, and one hard a day, give or take when a small bank runs low.
    expect(levels.easy / 600).toBeGreaterThan(0.3);
    expect(levels.medium / 600).toBeGreaterThan(0.3);
    expect(levels.hard / 600).toBeGreaterThan(0.12);
  });
});

describe("TEST 2: refreshing keeps the day's set, answers, and points", () => {
  it("shows the same five with the same answers after a reload, mid-way and at the end", () => {
    let progress = ensureDailyRound(emptyBrainProgress(), DAY1);
    const ids = dailyRoundFor(progress, DAY1).items.map((item) => item.id);
    const first = dailyRoundFor(progress, DAY1).items[0] as Activity;
    progress = answer(progress, DAY1, first, true);
    const reloaded = reload(progress);
    expect(dailyRoundFor(reloaded, DAY1).items.map((item) => item.id)).toEqual(ids);
    expect(reloaded.lastDaily?.picks.map((pick) => pick.id)).toEqual([first.id]);
    expect(reloaded.points).toBe(progress.points);

    const done = playDay(reloaded, DAY1).progress;
    const after = reload(done);
    expect(after.points).toBe(done.points);
    expect(after.dailyDone).toEqual([DAY1]);
    expect(after.round).toEqual({ date: DAY1, ids });
    // Rebuilding from the reloaded record must not change the saved set.
    expect(ensureDailyRound(after, DAY1)).toBe(after);
  });
});

describe("TEST 3: the next calendar day brings five different questions", () => {
  it("unlocks a new set with none of yesterday's five, and keeps yesterday's results", () => {
    const day1 = playDay(emptyBrainProgress(), DAY1);
    const day2Open = ensureDailyRound(day1.progress, DAY2);
    const day2 = dailyRoundFor(day2Open, DAY2);
    expect(day2.items).toHaveLength(5);
    const yesterday = new Set(day1.round.items.map((item) => baseActivityId(item.id)));
    expect(day2.items.filter((item) => yesterday.has(baseActivityId(item.id)))).toEqual([]);
    expect(day2.items.map((item) => item.id)).not.toEqual(day1.round.items.map((item) => item.id));
    expect(dailyCategories(DAY2)).not.toEqual(dailyCategories(DAY1));
    // A new day: not finished yet, but yesterday's score and total points stay.
    expect(day2Open.dailyDone.includes(DAY2)).toBe(false);
    expect(day2Open.points).toBe(day1.progress.points);
    expect(day2Open.dailyScores[0]?.date).toBe(DAY1);
  });

  it("never shows the exact same set on two days in a row across a year", () => {
    let progress = emptyBrainProgress();
    let before: string[] = [];
    for (let day = 0; day < 365; day += 1) {
      const date = addIsoDays("2026-01-01", day);
      const played = playDay(progress, date, (index) => (day + index) % 3 !== 0);
      const ids = played.round.items.map((item) => baseActivityId(item.id));
      expect(ids.some((id) => before.includes(id))).toBe(false);
      before = ids;
      progress = played.progress;
    }
    expect(progress.dailyDone.length).toBe(365);
    expect(progress.dailyScores.length).toBe(365);
  });
});

describe("TEST 4: My Brain Journey shows yesterday and today", () => {
  it("keeps both days in the history, calendar, and weekly totals", () => {
    const day1 = playDay(emptyBrainProgress(), DAY1, (index) => index !== 2).progress;
    let progress = ensureDailyRound(day1, DAY2);
    const part = dailyRoundFor(progress, DAY2).items[0] as Activity;
    progress = reload(answer(progress, DAY2, part, true));
    expect(progress.days.map((day) => day.date)).toEqual([DAY2, DAY1]);
    expect(progress.days.find((day) => day.date === DAY1)).toMatchObject({ right: 4, wrong: 1 });
    expect(progress.days.find((day) => day.date === DAY2)).toMatchObject({ right: 1, wrong: 0 });
    expect(progress.dailyScores.map((item) => item.date)).toEqual([DAY1]);
    const calendar = activityCalendar(progress, DAY2, 12);
    expect(calendar.find((day) => day.date === DAY1)).toMatchObject({ daily: true });
    expect(calendar.find((day) => day.date === DAY2)?.plays).toBe(1);
    expect(calendar.at(-1)?.date).toBe(DAY2);
    const week = weeklyHistory(progress, DAY2, 12).at(-1);
    expect(week).toMatchObject({ start: "2026-11-23", activeDays: 2, right: 5, wrong: 1, dailies: 1 });
    expect(progress.streak).toBe(2);
    expect(nextMilestones(progress).find((item) => item.id === "daily")).toMatchObject({ value: 1, target: 5 });

    const finished = playDay(progress, DAY2).progress;
    expect(finished.dailyScores.map((item) => item.date)).toEqual([DAY2, DAY1]);
  });
});

describe("TEST 5: the daily bonus cannot be claimed twice", () => {
  it("adds the 25 points once, however often the finish is claimed", () => {
    const { progress } = playDay(emptyBrainProgress(), DAY1);
    const again = completeDaily(progress, DAY1, 5);
    expect(again.gained).toBe(0);
    expect(again.already).toBe(true);
    expect(again.progress.points).toBe(progress.points);
    // After a reload, and even if the done list were lost, the saved bonus key still blocks it.
    const reloaded = reload(progress);
    expect(completeDaily(reloaded, DAY1, 5).gained).toBe(0);
    expect(completeDaily({ ...reloaded, dailyDone: [] }, DAY1, 5).gained).toBe(0);
  });

  it("does not score the same part again, in the daily set or in practice", () => {
    let progress = ensureDailyRound(emptyBrainProgress(), DAY1);
    const round = dailyRoundFor(progress, DAY1);
    const written = round.items.find(isLocked) as Activity;
    progress = answer(progress, DAY1, written, true);
    const points = progress.points;
    const twice = recordOutcome(progress, { today: DAY1, activityId: written.id, category: written.category, difficulty: written.difficulty, correct: true, lock: true });
    expect(twice.gained).toBe(0);
    expect(twice.progress.points).toBe(points);
    // A daily copy of an already answered question marks the original too.
    const copy = activityById(`${baseActivityId(written.id)}_d${dayNumber(DAY2) + 40}`) as Activity;
    const scored = answer(progress, DAY2, copy, true);
    expect(scored.attempted).toContain(baseActivityId(written.id));
  });

  it("is not reached before all five parts are answered", () => {
    let progress = ensureDailyRound(emptyBrainProgress(), DAY1);
    const round = dailyRoundFor(progress, DAY1);
    for (const item of round.items.slice(0, 4)) progress = answer(progress, DAY1, item, true);
    expect(completeDaily(progress, DAY1, 5).gained).toBe(0);
  });
});

describe("TEST 6: category banks rotate instead of repeating a small set", () => {
  it("offers new items in every category across a month of daily practice", () => {
    for (const category of CATEGORY_IDS) {
      let progress = emptyBrainProgress();
      const shown = new Map<string, number>();
      const layouts = new Set<string>();
      const bank = new Set(activitiesFor(category).map((item) => item.id));
      for (let day = 0; day < 30; day += 1) {
        const date = addIsoDays(DAY1, day);
        const items = freshFor(progress, category, "medium", date, 3);
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          const base = baseActivityId(item.id);
          const last = shown.get(base);
          // A written question comes back only after the whole bank for the category was shown,
          // and never within the recent window while fresh ones exist.
          if (last !== undefined && category !== "memory" && category !== "attention") {
            const seenSoFar = [...shown.keys()].filter((id) => bank.has(id)).length;
            expect(seenSoFar >= bank.size - 3 || day - last >= RECENT_DAYS, `${category} ${base}`).toBe(true);
          }
          shown.set(base, day);
          layouts.add(item.id);
          progress = answer(progress, date, item, true);
        }
      }
      expect(layouts.size, category).toBeGreaterThanOrEqual(30);
    }
  });

  it("builds thousands of correct Logic and Numbers puzzles from seeds", () => {
    const ids = new Set<string>();
    for (const category of ["logic", "numbers"] as const) {
      for (const level of ["easy", "medium", "hard"] as const) {
        for (let seed = 0; seed < 1000; seed += 1) {
          const id = generatedId(category, level, seed);
          expect(isGeneratedId(id)).toBe(true);
          const item = buildGenerated(id);
          if (!item) throw new Error(id);
          expect(item.category).toBe(category);
          expect(item.difficulty).toBe(level);
          expect(new Set(item.choices).size).toBe(4);
          const answer = Number(item.choices[item.correctIndex]);
          // The worked explanation ends with the answer it computed.
          const worked = fmt(item.explanations[item.correctIndex], item.values.explanations[item.correctIndex]);
          expect(worked).toContain(String(answer));
          if (item.prompt === "What is {a} + {b}?") expect(answer).toBe(Number(item.values.prompt.a) + Number(item.values.prompt.b));
          if (item.prompt === "What is {a} × {b} − {c}?") {
            const { a, b, c } = item.values.prompt;
            expect(answer).toBe(Number(a) * Number(b) - Number(c));
          }
          ids.add(id);
        }
      }
    }
    expect(ids.size).toBe(6000);
    expect(buildGenerated("GL-e-0042")).toEqual(buildGenerated("GL-e-0042"));
    expect(activityById("GN-h-0007")?.id).toBe("GN-h-0007");
  });

  it("builds a new memory and attention layout for every day", () => {
    const one = activityById("M-sequence-e_d327");
    const two = activityById("M-sequence-e_d328");
    expect(one?.kind).toBe("memory");
    expect(one?.id).not.toBe(two?.id);
    expect(activityById("A-hidden-h_d10")?.kind).toBe("attention");
    expect(activityById("nope_d10")).toBeUndefined();
  });
});

describe("TEST 7: daily reset in the person's own time zone", () => {
  const original = process.env.TZ;
  afterEach(() => {
    process.env.TZ = original;
  });

  it("uses the local calendar date, so the same moment can be two different days", () => {
    const moment = new Date("2026-11-24T23:30:00Z");
    process.env.TZ = "America/Los_Angeles";
    expect(localISODate(moment)).toBe("2026-11-24");
    process.env.TZ = "Asia/Tokyo";
    expect(localISODate(moment)).toBe("2026-11-25");
    process.env.TZ = "Europe/Kyiv";
    expect(localISODate(moment)).toBe("2026-11-25");
  });

  it("switches to a new set exactly at local midnight, and not before", () => {
    for (const zone of ["America/New_York", "Europe/Athens", "Asia/Kolkata", "Pacific/Auckland"]) {
      process.env.TZ = zone;
      const late = new Date(2026, 10, 24, 23, 59, 59);
      const early = new Date(2026, 10, 25, 0, 0, 1);
      const before = localISODate(late);
      const after = localISODate(early);
      expect(before, zone).toBe("2026-11-24");
      expect(after, zone).toBe("2026-11-25");
      const day1 = playDay(emptyBrainProgress(), before).progress;
      // Still the same local day: the finished set stays finished and no new set appears.
      expect(ensureDailyRound(day1, before)).toBe(day1);
      const opened = ensureDailyRound(day1, after);
      expect(opened.round?.date).toBe(after);
      expect(opened.dailyDone.includes(after)).toBe(false);
      expect(opened.points).toBe(day1.points);
    }
  });

  it("counts days correctly across daylight-saving changes and month and year ends", () => {
    process.env.TZ = "America/New_York";
    expect(localISODate(new Date(2026, 2, 8, 12))).toBe("2026-03-08");
    expect(dayNumber("2026-03-09") - dayNumber("2026-03-08")).toBe(1);
    expect(dayNumber("2026-11-02") - dayNumber("2026-11-01")).toBe(1);
    expect(dayNumber("2027-01-01") - dayNumber("2026-12-31")).toBe(1);
    let progress = emptyBrainProgress();
    for (const date of ["2026-12-30", "2026-12-31", "2027-01-01"]) progress = playDay(progress, date).progress;
    expect(progress.streak).toBe(3);
    expect(progress.dailyDone).toEqual(["2027-01-01", "2026-12-31", "2026-12-30"]);
  });
});

describe("saving brain progress", () => {
  it("keeps it in the companion record and drops bad input", () => {
    const { progress } = playDay(emptyBrainProgress(), DAY1);
    const state = sanitizeCompanion({ ...emptyCompanion(), brainQuiz: progress });
    expect(state.brainQuiz.points).toBe(progress.points);
    expect(sanitizeBrain({ seen: { L01: 3, "bad id": 4, L02: "x" }, round: { date: "nope", ids: ["L01"] } })).toMatchObject({ seen: { L01: 3 }, round: null });
  });

  it("reads records saved before answers were counted", () => {
    const old = sanitizeBrain({ points: 40, correct: 3, games: 5 });
    expect(old.right).toBe(3);
    expect(old.wrong).toBe(2);
  });

  it("keeps a long history within the limits and forgets daily copies before plain ids", () => {
    expect(BRAIN_LIMITS.days).toBeGreaterThanOrEqual(365);
    const awarded = [...Array.from({ length: BRAIN_LIMITS.awarded }, (_, index) => `L01_d${index}`), "L01"];
    const clean = sanitizeBrain({ awarded });
    expect(clean.awarded).toHaveLength(BRAIN_LIMITS.awarded);
    expect(clean.awarded).toContain("L01");
  });
});
