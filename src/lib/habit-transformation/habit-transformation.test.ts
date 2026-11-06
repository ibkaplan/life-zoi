import { describe, expect, it, vi } from "vitest";
import { prepareAccountWrite, isBlankSession, rowsToSession } from "@/lib/account-records";
import {
  DIFFICULT_LINE,
  LIBRARY,
  MICHIE_URL,
  NOTICE,
  RESTART_LINE,
  TINY,
  WELLNESS_COACH_PATH,
} from "@/lib/habit-transformation/catalog";
import { coachNote, ruleCoachNote, toWellnessCoachRequest } from "@/lib/habit-transformation/coach";
import {
  earnedAchievements,
  planFor,
  plansFor,
  progressSnapshot,
  showRestart,
  smallerNextStep,
  weekBars,
} from "@/lib/habit-transformation/engine";
import {
  emptyFollowUp,
  emptyHabitJourney,
  isEmptyHabitJourney,
  logAction,
  sanitizeHabitJourney,
  savePicks,
  type HabitPick,
} from "@/lib/habit-transformation/model";
import { sanitizeSession } from "@/lib/session";
import { emptySession } from "@/lib/types";

const USER = "11111111-1111-4111-8111-111111111111";
const WHEN = "2026-11-06T12:00:00.000Z";

function sugarPick(patch: Partial<HabitPick["followUp"]> = {}): HabitPick {
  return {
    habitId: "sugar",
    otherText: "",
    followUp: {
      ...emptyFollowUp(),
      whenId: "evening",
      triggerId: "tired",
      durationId: "months",
      triedId: "swap",
      hardId: "no-time",
      motivationId: "steadier",
      confidenceId: "possible",
      supportId: "packed",
      easierId: "smaller",
      ...patch,
    },
  };
}

describe("habit transformation", () => {
  it("keeps a journey inside the account session and a local empty session blank", () => {
    expect(isEmptyHabitJourney(emptyHabitJourney())).toBe(true);
    expect(isBlankSession(emptySession())).toBe(true);
    const session = sanitizeSession({
      ...emptySession(),
      habitJourney: { picks: [sugarPick()] },
    });
    expect(session.habitJourney.picks).toHaveLength(1);
    expect(isBlankSession(session)).toBe(false);
    const prepared = prepareAccountWrite(session, USER, WHEN);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.rows.profile.session_state.habitJourney.picks[0]?.habitId).toBe("sugar");
    const loaded = rowsToSession({
      profile: { display_name: null, session_state: prepared.rows.profile.session_state },
      assessments: [],
      scenarios: [],
      goals: [],
      checkIns: [],
    });
    expect(loaded.habitJourney.picks[0]?.followUp.hardId).toBe("no-time");
  });

  it("drops unknown answers and keeps one mark per day", () => {
    const clean = sanitizeHabitJourney({
      picks: [{ habitId: "nope" }, { habitId: "other", otherText: "  evening tea  ", followUp: { whenId: "nope" } }],
      tunes: [
        {
          habitId: "sugar",
          logs: [
            { date: "2026-11-01", status: "complete" },
            { date: "2026-11-01", status: "skipped" },
            { date: "bad", status: "complete" },
          ],
        },
      ],
    });
    expect(clean.picks.map((pick) => pick.habitId)).toEqual(["other"]);
    expect(clean.picks[0]?.otherText).toBe("evening tea");
    expect(clean.picks[0]?.followUp.whenId).toBe("");
    expect(clean.tunes[0]?.logs).toEqual([{ date: "2026-11-01", status: "complete" }]);
  });

  it("writes a small COM-B plan without a score or a shame label", () => {
    const plan = planFor(sugarPick());
    expect(plan.difficultLine).toBe(DIFFICULT_LINE);
    expect(plan.reading.part).toBe("opportunity");
    expect(plan.reading.barrier.toLowerCase()).toContain("may");
    expect(plan.routine).toBe(`After I sit down after dinner, I will ${TINY.sugar.action}.`);
    expect(plan.smallAction).toBe(TINY.sugar.action);
    expect(plan.easierAction).toBe(TINY.sugar.easier);
    expect(planFor(sugarPick()).smallAction).toMatch(/evening snack|five-minute walk|10-minute wind-down|glass of water/);
    const exercise = planFor({ habitId: "exercise", otherText: "", followUp: { ...emptyFollowUp(), whenId: "lunch" } });
    const sleep = planFor({ habitId: "sleep", otherText: "", followUp: { ...emptyFollowUp(), whenId: "wind" } });
    expect(exercise.smallAction).toContain("five-minute walk");
    expect(sleep.smallAction).toContain("10-minute wind-down");
    const blob = `${plan.why} ${plan.reading.barrier} ${plan.reading.strategy} ${ruleCoachNote({
      habitId: "sugar",
      habitName: plan.name,
      barrier: plan.reading.part,
      barrierLabel: plan.reading.partLabel,
      smallAction: plan.smallAction,
      easierAction: plan.easierAction,
    })}`;
    expect(blob).not.toMatch(/\d+\s*%|lazy|streak|guaranteed/i);
    expect(plan.reading.barrier).not.toMatch(/diagnosis/i);
  });

  it("offers a smaller step and keeps achievements after a quiet day", () => {
    let journey = savePicks(emptyHabitJourney(), [sugarPick()]);
    journey = logAction(journey, "sugar", "2026-11-01", "complete");
    const before = earnedAchievements(journey, "2026-11-04");
    expect(before).toContain("first-complete");
    expect(before).toContain("started");
    expect(showRestart(journey, "2026-11-04")).toBe(true);
    expect(RESTART_LINE).toBe("Every day is a new opportunity. Would you like to try a smaller step today?");
    const afterQuiet = earnedAchievements(journey, "2026-11-04");
    expect(afterQuiet).toEqual(before);
    journey = logAction(journey, "sugar", "2026-11-04", "easier");
    expect(earnedAchievements(journey, "2026-11-04")).toEqual(expect.arrayContaining(["first-complete", "easier", "returned"]));
    const offer = smallerNextStep(
      {
        date: "2026-11-04",
        habitId: "sugar",
        completed: "not-today",
        difficulty: "heavy",
        feeling: "tender",
        helpedId: "unsure",
        helpedNote: "",
        wayId: "time",
        wayNote: "",
      },
      TINY.sugar.easier,
    );
    expect(offer.kind).toBe("smaller");
    expect(offer.text).toContain(RESTART_LINE);
    expect(offer.text).toContain(TINY.sugar.easier);
  });

  it("charts only saved completions and check-ins", () => {
    let journey = savePicks(emptyHabitJourney(), [sugarPick()]);
    expect(weekBars(journey, "2026-11-06")).toHaveLength(7);
    expect(progressSnapshot(journey, "2026-11-06").completed).toBe(0);
    journey = logAction(journey, "sugar", "2026-11-05", "complete");
    journey = logAction(journey, "sugar", "2026-11-06", "skipped");
    const bars = weekBars(journey, "2026-11-06");
    expect(bars.find((bar) => bar.date === "2026-11-05")?.completed).toBe(1);
    expect(bars.find((bar) => bar.date === "2026-11-06")?.completed).toBe(0);
    expect(progressSnapshot(journey, "2026-11-06").completed).toBe(1);
    expect(progressSnapshot(journey, "2026-11-06").habits[0]?.name).toMatch(/Sweet drinks/);
  });

  it("uses rules until the wellness route is explicitly allowed", async () => {
    const input = {
      habitId: "sleep" as const,
      habitName: "Sleep",
      barrier: "opportunity" as const,
      barrierLabel: "Opportunity",
      smallAction: TINY.sleep.action,
      easierAction: TINY.sleep.easier,
    };
    const body = toWellnessCoachRequest(input);
    expect(body.source).toBe("habit-transformation");
    expect(WELLNESS_COACH_PATH).toBe("/api/ai-assistant/wellness");
    const ruled = await coachNote(input);
    expect(ruled.via).toBe("rules");
    expect(ruled.text).toContain("not clinically validated");
    const fetchImpl = vi.fn(async () => Response.json({ note: "From the later route." }));
    const routed = await coachNote(input, { allowRoute: true, fetchImpl });
    expect(routed).toEqual({ text: "From the later route.", via: "wellness" });
    expect(fetchImpl).toHaveBeenCalledWith(WELLNESS_COACH_PATH, expect.objectContaining({ method: "POST" }));
    const missing = await coachNote(input, {
      allowRoute: true,
      fetchImpl: vi.fn(async () => {
        throw new Error("missing");
      }),
    });
    expect(missing.via).toBe("rules");
  });

  it("keeps library copy original and points at a public source", () => {
    expect(LIBRARY).toHaveLength(10);
    expect(NOTICE).toBe(
      "LifeZoi Habit Transformation is an educational wellness tool informed by behavior-change research. It is not a medical or psychological diagnostic tool. Individual results vary, and no specific health outcome is guaranteed.",
    );
    expect(LIBRARY.map((item) => item.slug)).toEqual([
      "nutrition",
      "movement",
      "sleep",
      "stress",
      "smoking",
      "alcohol",
      "hydration",
      "healthy-aging",
      "digital-habits",
      "motivation",
    ]);
    for (const item of LIBRARY) {
      expect(item.explanation.length).toBeGreaterThan(40);
      expect(item.action.length).toBeGreaterThan(8);
      expect(["capability", "opportunity", "motivation"]).toContain(item.barrier);
      const host = new URL(item.sourceUrl).hostname;
      expect(
        host.endsWith("nih.gov") || host.endsWith("cdc.gov") || host.endsWith("nhs.uk") || host === "pmc.ncbi.nlm.nih.gov",
      ).toBe(true);
    }
    expect(LIBRARY.find((item) => item.slug === "motivation")?.sourceUrl).toBe(MICHIE_URL);
    const plans = plansFor(savePicks(emptyHabitJourney(), [sugarPick({ hardId: "feeling", confidenceId: "heavy" })]));
    expect(plans[0]?.reading.part).toBe("motivation");
    expect(plans[0]?.reading.extra).toMatch(/not a score/);
  });
});
