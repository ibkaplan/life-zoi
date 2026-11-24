import { describe, expect, it } from "vitest";
import { addGuidedSession, emptyCompanion, sanitizeCompanion } from "@/lib/companion/state";
import { DAY_PICKS, GUIDED_SESSIONS, guidedById } from "@/lib/guided/catalog";
import { createGuidedController, type Narrator, type Timers } from "@/lib/guided/controller";
import { addGuidedRecord, emptyGuided, guidedOn, sanitizeGuided } from "@/lib/guided/history";
import { MEDITATION_MINUTES, MEDITATION_THEMES } from "@/lib/guided/meditation";
import { beatsOf, plannedSeconds, stepStart } from "@/lib/guided/timeline";
import type { Beat } from "@/lib/guided/types";

/** Timers driven by hand: `advance(ms)` runs whatever falls due. */
function fakeTimers() {
  let now = 0;
  let nextId = 1;
  const due = new Map<number, { at: number; callback: () => void }>();
  const timers: Timers = {
    now: () => now,
    set: (callback, ms) => {
      const id = nextId++;
      due.set(id, { at: now + ms, callback });
      return id;
    },
    clear: (handle) => {
      due.delete(handle as number);
    },
  };
  function advance(ms: number) {
    const end = now + ms;
    for (;;) {
      const next = [...due.entries()].filter(([, item]) => item.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      due.delete(next[0]);
      now = next[1].at;
      next[1].callback();
    }
    now = end;
  }
  return { timers, advance, pending: () => due.size };
}

/** A voice that only finishes when the test says so, and notices overlapping speech. */
function fakeNarrator() {
  const spoken: string[] = [];
  let current: { text: string; done: () => void; interrupted: (reason: "replaced" | "stopped" | "blocked" | "no-voice") => void } | null = null;
  let overlaps = 0;
  let stops = 0;
  const narrator: Narrator = {
    speak(text, done, interrupted) {
      if (current) overlaps += 1;
      current = { text, done, interrupted };
      spoken.push(text);
    },
    stop() {
      stops += 1;
      current = null;
    },
  };
  return {
    narrator,
    spoken,
    speaking: () => current?.text ?? null,
    finish() {
      const item = current;
      current = null;
      item?.done();
    },
    interrupt(reason: "replaced" | "stopped" | "blocked" = "replaced") {
      const item = current;
      current = null;
      item?.interrupted(reason);
    },
    overlaps: () => overlaps,
    stops: () => stops,
  };
}

const BEATS: Beat[] = [
  { step: 0, cue: 0, say: "Welcome.", hold: 0 },
  { step: 0, cue: 1, say: "Lie on your mat.", hold: 10 },
  { step: 1, cue: 0, say: "Lift one leg.", hold: 3 },
  { step: 1, cue: 1, say: "Lower it.", hold: 20 },
  { step: 2, cue: 0, say: "Well done.", hold: 0 },
];

function setup(beats: Beat[] = BEATS) {
  const clock = fakeTimers();
  const voice = fakeNarrator();
  const ducks: boolean[] = [];
  const completions: number[] = [];
  const controller = createGuidedController({
    beats,
    narrator: voice.narrator,
    timers: clock.timers,
    duck: (on) => ducks.push(on),
    onComplete: ({ activeSeconds }) => completions.push(activeSeconds),
  });
  return { clock, voice, ducks, completions, controller };
}

describe("guided session player", () => {
  it("does not start until Play is pressed", () => {
    const { voice, controller } = setup();
    expect(controller.state().status).toBe("idle");
    expect(voice.spoken).toEqual([]);
  });

  it("speaks each cue, waits through its hold, and moves on", () => {
    const { voice, clock, controller } = setup();
    controller.play();
    expect(voice.speaking()).toBe("Welcome.");
    voice.finish();
    expect(voice.speaking()).toBe("Lie on your mat.");
    voice.finish();
    expect(controller.state().phase).toBe("holding");
    clock.advance(9_000);
    expect(voice.speaking()).toBeNull();
    clock.advance(1_000);
    expect(voice.speaking()).toBe("Lift one leg.");
  });

  it("pause stops the voice at once, and resume says the same cue again", () => {
    const { voice, controller } = setup();
    controller.play();
    voice.finish();
    expect(voice.speaking()).toBe("Lie on your mat.");
    controller.pause();
    expect(controller.state().status).toBe("paused");
    expect(voice.speaking()).toBeNull();
    controller.resume();
    expect(voice.speaking()).toBe("Lie on your mat.");
    expect(controller.state().index).toBe(1);
  });

  it("pause during a hold keeps the time that was left", () => {
    const { voice, clock, controller } = setup();
    controller.play();
    voice.finish();
    voice.finish(); // hold of 10 s starts
    clock.advance(4_000);
    controller.pause();
    expect(controller.state().holdLeft).toBeCloseTo(6, 5);
    clock.advance(60_000); // a long break: nothing happens while paused
    expect(voice.speaking()).toBeNull();
    expect(controller.state().status).toBe("paused");
    controller.resume();
    clock.advance(5_900);
    expect(voice.speaking()).toBeNull();
    clock.advance(100);
    expect(voice.speaking()).toBe("Lift one leg.");
  });

  it("never lets two cues overlap, even when buttons are pressed quickly", () => {
    const { voice, controller } = setup();
    controller.play();
    controller.skip(1);
    controller.skip(1);
    controller.restart();
    controller.pause();
    controller.resume();
    controller.skip(-1);
    voice.finish();
    expect(voice.overlaps()).toBe(0);
  });

  it("ignores the end of a cue that was already stopped or paused", () => {
    const { voice, controller } = setup();
    controller.play();
    const stale = voice;
    controller.pause();
    // The browser reports the end of the cancelled sentence late.
    stale.finish();
    expect(controller.state().status).toBe("paused");
    expect(controller.state().index).toBe(0);
  });

  it("stop silences everything and goes back to the start", () => {
    const { voice, clock, controller, ducks } = setup();
    controller.play();
    voice.finish();
    voice.finish();
    controller.stop();
    expect(controller.state()).toMatchObject({ status: "idle", index: 0, phase: null });
    expect(voice.speaking()).toBeNull();
    expect(clock.pending()).toBe(0);
    expect(ducks.at(-1)).toBe(false);
  });

  it("restart begins again at the first cue", () => {
    const { voice, controller } = setup();
    controller.play();
    voice.finish();
    voice.finish();
    controller.restart();
    expect(voice.speaking()).toBe("Welcome.");
    expect(controller.state().index).toBe(0);
  });

  it("next and previous move by exercise", () => {
    const { voice, controller } = setup();
    controller.play();
    controller.skip(1);
    expect(voice.speaking()).toBe("Lift one leg.");
    controller.skip(-1);
    // At the start of a step, back goes to the step before.
    expect(voice.speaking()).toBe("Welcome.");
    expect(stepStart(BEATS, 3, -1)).toBe(2);
  });

  it("pauses, keeping its place, when another voice takes over or the browser wants a tap", () => {
    const { voice, controller } = setup();
    controller.play();
    voice.finish();
    voice.interrupt("blocked");
    expect(controller.state()).toMatchObject({ status: "paused", index: 1, interruption: "blocked" });
    controller.resume();
    expect(voice.speaking()).toBe("Lie on your mat.");
    expect(controller.state().interruption).toBeNull();
  });

  it("lowers music while speaking and through short gaps, and lets it back up in long holds and when paused", () => {
    const { voice, clock, controller, ducks } = setup();
    controller.play();
    expect(controller.ducked()).toBe(true);
    voice.finish();
    voice.finish(); // 10 s hold: music comes back up
    expect(controller.ducked()).toBe(false);
    clock.advance(10_000);
    expect(controller.ducked()).toBe(true); // speaking again
    voice.finish(); // 3 s gap: stays low
    expect(controller.ducked()).toBe(true);
    controller.pause();
    expect(controller.ducked()).toBe(false);
    // Only real changes are sent to the music player.
    expect(ducks.every((value, index) => index === 0 || value !== ducks[index - 1])).toBe(true);
  });

  it("reports completion once, with the time spent playing, and not after Stop", () => {
    const { voice, clock, controller, completions } = setup();
    controller.play();
    voice.finish();
    clock.advance(2_000);
    voice.finish();
    controller.pause();
    clock.advance(300_000); // paused time does not count
    controller.resume();
    clock.advance(10_000);
    voice.finish();
    clock.advance(3_000);
    voice.finish();
    clock.advance(20_000);
    voice.finish();
    expect(controller.state().status).toBe("finished");
    expect(completions).toEqual([35]);
    voice.finish();
    expect(completions).toHaveLength(1);

    const second = setup();
    second.controller.play();
    second.voice.finish();
    second.controller.stop();
    expect(second.completions).toEqual([]);
  });

  it("shows progress and time left that add up", () => {
    const { voice, clock, controller } = setup();
    const total = controller.total();
    expect(total).toBeCloseTo(plannedSeconds(BEATS), 5);
    controller.play();
    expect(controller.elapsed()).toBe(0);
    voice.finish();
    voice.finish();
    clock.advance(5_000);
    const mid = controller.elapsed();
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(total);
    controller.pause();
    expect(controller.elapsed()).toBeCloseTo(mid, 5);
  });
});

describe("guided session content", () => {
  it("has unique ids and every My Day suggestion exists", () => {
    const ids = GUIDED_SESSIONS.map((session) => session.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const picks of Object.values(DAY_PICKS)) for (const pick of picks) expect(guidedById(pick.id), pick.id).not.toBeNull();
  });

  it("covers every kind the brief asked for", () => {
    const kinds = new Set(GUIDED_SESSIONS.map((session) => session.kind));
    for (const kind of ["pilates", "yoga", "stretching", "mobility", "breathing", "relaxation", "meditation"]) expect(kinds.has(kind as never)).toBe(true);
    for (const theme of MEDITATION_THEMES) for (const minutes of MEDITATION_MINUTES) expect(guidedById(`meditation-${theme}-${minutes}`)).not.toBeNull();
  });

  it("lasts about as long as the card says", () => {
    for (const session of GUIDED_SESSIONS) {
      const planned = plannedSeconds(beatsOf(session), 0.95 * session.rateFactor) / 60;
      const tolerance = 0.06;
      expect(Math.abs(planned - session.minutes) / session.minutes, `${session.id}: ${planned.toFixed(1)} min`).toBeLessThanOrEqual(tolerance);
    }
  });

  it("keeps the instructor talking: no silence longer than two minutes", () => {
    for (const session of GUIDED_SESSIONS) for (const beat of beatsOf(session)) expect(beat.hold, `${session.id}: ${beat.say}`).toBeLessThanOrEqual(120);
  });

  it("is gentle: a safety note on every session and nothing that asks for pain, breath holding, or a number to reach", () => {
    for (const session of GUIDED_SESSIONS) {
      expect(session.care.length, session.id).toBeGreaterThan(40);
      expect(session.complete.length).toBeGreaterThan(10);
      for (const beat of beatsOf(session)) {
        expect(beat.say, session.id).not.toMatch(/\b(hold your breath|push through|no pain|burn|calories|lose weight|cure|treat)\b/i);
        // One `msg` per cue, so it can be translated.
        expect(beat.say.length).toBeLessThan(220);
      }
    }
  });
});

describe("guided session history", () => {
  const record = { id: "g-1", session: "pilates-gentle", kind: "pilates" as const, date: "2026-11-24", seconds: 610 };

  it("saves finished sessions newest first and adds exercise minutes for movement", () => {
    let state = addGuidedSession(emptyCompanion(), record);
    state = addGuidedSession(state, { ...record, id: "g-2", session: "meditation-morning-5", kind: "meditation", seconds: 300 });
    expect(state.guided.sessions.map((item) => item.id)).toEqual(["g-2", "g-1"]);
    expect(state.days["2026-11-24"]?.exerciseMinutes).toBe(10);
    expect(guidedOn(state.guided, "2026-11-24")).toEqual({ sessions: 2, minutes: 15 });
  });

  it("survives saving and loading, and drops anything malformed", () => {
    const state = addGuidedSession(emptyCompanion(), record);
    const loaded = sanitizeCompanion(JSON.parse(JSON.stringify(state)) as unknown);
    expect(loaded.guided.sessions).toEqual([record]);
    expect(sanitizeGuided({ sessions: [record, { ...record, id: "x", kind: "boxing" }, { ...record, id: "y", date: "2026-02-31" }, "junk"] }).sessions).toEqual([record]);
    expect(addGuidedRecord(emptyGuided(), { ...record, seconds: Number.NaN })).toEqual(emptyGuided());
  });
});
