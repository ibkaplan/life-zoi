import { beatSeconds, duckThrough, plannedSeconds, secondsBefore, speechSeconds, stepStart } from "@/lib/guided/timeline";
import type { Beat } from "@/lib/guided/types";

/**
 * The state machine behind every guided session. It knows nothing about the
 * browser: speech, timers, and music ducking are passed in, so the tests can
 * drive it with fakes. In the app, `narrator` is the shared LifeZoi voice.
 *
 * Rules (each one has a test):
 * - Only one cue is ever spoken at a time. The voice is stopped before each new cue.
 * - Pause stops the voice at once. Resume says the interrupted cue again from its
 *   start, or finishes the quiet hold that was left. Nothing is skipped.
 * - Stop ends the session and silences everything. Restart begins again at the first cue.
 * - Callbacks from a cue that was stopped, paused, or replaced are ignored.
 * - Music is lowered while the voice speaks and through short gaps, and comes
 *   back up during longer holds, while paused, and when the session ends.
 * - Completion is reported once, only when the last cue and its hold are done.
 */

export type GuidedStatus = "idle" | "playing" | "paused" | "finished";
export type GuidedPhase = "speaking" | "holding" | null;

export type Narrator = {
  /**
   * Say `text`, replacing anything being said. Call `done` when it has been
   * said, or `interrupted` when something else (another Listen button,
   * leaving the page, the browser refusing sound) stopped it.
   */
  speak(text: string, done: () => void, interrupted: (reason: "replaced" | "stopped" | "blocked" | "no-voice") => void): void;
  stop(): void;
};

export type Timers = {
  now(): number;
  set(callback: () => void, ms: number): unknown;
  clear(handle: unknown): void;
};

export type ControllerState = {
  status: GuidedStatus;
  phase: GuidedPhase;
  index: number;
  total: number;
  /** While holding: when the hold ends (ms, from `timers.now`). */
  holdUntil: number | null;
  /** While paused in a hold: seconds of quiet still to go. */
  holdLeft: number | null;
  /** When the current phase started (ms). */
  phaseStart: number;
  /** Why the voice stopped by itself, when it did. Cleared by Play or Resume. */
  interruption: "replaced" | "stopped" | "blocked" | "no-voice" | null;
};

export type ControllerOptions = {
  beats: readonly Beat[];
  narrator: Narrator;
  timers: Timers;
  /** Lowers background music (true) or lets it come back up (false). */
  duck: (on: boolean) => void;
  /** Current speaking speed, for the progress estimate. */
  rate?: () => number;
  /** Called once when the session reaches its end. `activeSeconds` leaves out time spent paused. */
  onComplete?: (result: { activeSeconds: number }) => void;
};

export function createGuidedController(options: ControllerOptions) {
  const { beats, narrator, timers, duck } = options;
  const rate = () => options.rate?.() ?? 1;
  let state: ControllerState = {
    status: "idle",
    phase: null,
    index: 0,
    total: beats.length,
    holdUntil: null,
    holdLeft: null,
    phaseStart: 0,
    interruption: null,
  };
  const listeners = new Set<() => void>();
  // Bumped whenever the session moves on, so late callbacks from an old cue do nothing.
  let ticket = 0;
  let timer: unknown = null;
  let ducked = false;
  // Time actually spent playing, for the saved minutes.
  let activeMs = 0;
  let activeSince: number | null = null;

  function set(change: Partial<ControllerState>) {
    state = { ...state, ...change };
    for (const listener of listeners) listener();
  }

  function setDuck(on: boolean) {
    if (on === ducked) return;
    ducked = on;
    duck(on);
  }

  function clearTimer() {
    if (timer !== null) timers.clear(timer);
    timer = null;
  }

  function startClock() {
    if (activeSince === null) activeSince = timers.now();
  }

  function stopClock() {
    if (activeSince !== null) activeMs += timers.now() - activeSince;
    activeSince = null;
  }

  function activeSeconds(): number {
    const running = activeSince === null ? 0 : timers.now() - activeSince;
    return Math.round((activeMs + running) / 1000);
  }

  function complete() {
    ticket += 1;
    clearTimer();
    narrator.stop();
    stopClock();
    setDuck(false);
    const seconds = activeSeconds();
    set({ status: "finished", phase: null, index: beats.length, holdUntil: null, holdLeft: null, interruption: null });
    options.onComplete?.({ activeSeconds: seconds });
  }

  function hold(seconds: number, then: () => void) {
    const mine = ticket;
    const now = timers.now();
    setDuck(duckThrough(seconds));
    set({ phase: "holding", holdUntil: now + seconds * 1000, holdLeft: null, phaseStart: now });
    timer = timers.set(() => {
      if (mine !== ticket) return;
      timer = null;
      then();
    }, seconds * 1000);
  }

  function after(index: number) {
    const next = index + 1;
    if (next >= beats.length) complete();
    else speakBeat(next);
  }

  function speakBeat(index: number) {
    const beat = beats[index];
    if (!beat) {
      complete();
      return;
    }
    clearTimer();
    ticket += 1;
    const mine = ticket;
    // Never two voices: whatever was being said stops first.
    narrator.stop();
    setDuck(true);
    set({ status: "playing", phase: "speaking", index, holdUntil: null, holdLeft: null, phaseStart: timers.now(), interruption: null });
    narrator.speak(
      beat.say,
      () => {
        if (mine !== ticket) return;
        if (beat.hold > 0) hold(beat.hold, () => after(index));
        else after(index);
      },
      (reason) => {
        if (mine !== ticket) return;
        // Something else took the voice. Keep the place, so Resume says this cue again.
        ticket += 1;
        clearTimer();
        stopClock();
        setDuck(false);
        set({ status: "paused", phase: "speaking", interruption: reason });
      },
    );
  }

  function start(index: number) {
    startClock();
    speakBeat(index);
  }

  return {
    state(): ControllerState {
      return state;
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Starts from the beginning, or resumes when paused. */
    play() {
      if (state.status === "playing") return;
      if (state.status === "paused") {
        this.resume();
        return;
      }
      activeMs = 0;
      activeSince = null;
      if (beats.length === 0) {
        complete();
        return;
      }
      start(0);
    },
    pause() {
      if (state.status !== "playing") return;
      ticket += 1;
      stopClock();
      setDuck(false);
      if (state.phase === "holding" && state.holdUntil !== null) {
        clearTimer();
        const left = Math.max(0, (state.holdUntil - timers.now()) / 1000);
        set({ status: "paused", holdLeft: left, holdUntil: null });
        return;
      }
      clearTimer();
      narrator.stop();
      set({ status: "paused", phase: "speaking" });
    },
    resume() {
      if (state.status !== "paused") return;
      startClock();
      if (state.phase === "holding" && state.holdLeft !== null) {
        ticket += 1;
        const index = state.index;
        const left = state.holdLeft;
        set({ status: "playing", interruption: null });
        if (left <= 0.05) after(index);
        else hold(left, () => after(index));
        return;
      }
      speakBeat(state.index);
    },
    stop() {
      ticket += 1;
      clearTimer();
      narrator.stop();
      stopClock();
      setDuck(false);
      activeMs = 0;
      set({ status: "idle", phase: null, index: 0, holdUntil: null, holdLeft: null, interruption: null });
    },
    restart() {
      this.stop();
      start(0);
    },
    /** Moves to the next exercise (1) or back to the start of this or the previous one (-1). */
    skip(direction: 1 | -1) {
      if (state.status === "idle" || state.status === "finished") return;
      const at = stepStart(beats, state.index, direction);
      if (at === -1) {
        complete();
        return;
      }
      startClock();
      speakBeat(at);
    },
    /** Planned seconds heard so far, for the progress bar. */
    elapsed(now = timers.now()): number {
      const r = rate();
      if (state.status === "finished") return plannedSeconds(beats, r);
      if (state.status === "idle") return 0;
      const before = secondsBefore(beats, state.index, r);
      const beat = beats[state.index];
      if (!beat) return before;
      const speech = speechSeconds(beat.say, r);
      if (state.phase === "holding") {
        const left = state.status === "paused" ? (state.holdLeft ?? 0) : Math.max(0, ((state.holdUntil ?? now) - now) / 1000);
        return before + speech + Math.max(0, beat.hold - left);
      }
      if (state.status === "paused") return before;
      return before + Math.min(speech, Math.max(0, (now - state.phaseStart) / 1000));
    },
    total(): number {
      return plannedSeconds(beats, rate());
    },
    activeSeconds,
    /** For tests: whether music is lowered right now. */
    ducked(): boolean {
      return ducked;
    },
    beatSeconds: (index: number) => (beats[index] ? beatSeconds(beats[index] as Beat, rate()) : 0),
  };
}

export type GuidedController = ReturnType<typeof createGuidedController>;
