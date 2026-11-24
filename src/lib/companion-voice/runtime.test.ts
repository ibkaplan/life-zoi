import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { matchCommand } from "@/lib/companion-voice/commands";

/**
 * The companion runtime against a fake browser: a speech engine that "speaks" for a
 * moment, and a speech recognizer the test speaks into. It checks the behaviour the
 * person relies on: LifeZoi never listens while it speaks, commands really navigate,
 * guided sessions start through the player's event, and the microphone stays off
 * until it is turned on.
 */

class FakeRecognition {
  static all: FakeRecognition[] = [];
  lang = "";
  interimResults = false;
  continuous = false;
  maxAlternatives = 1;
  started = false;
  aborted = false;
  onresult: ((event: { resultIndex: number; results: unknown }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  onstart: (() => void) | null = null;
  constructor() {
    FakeRecognition.all.push(this);
  }
  start() {
    this.started = true;
    queueMicrotask(() => this.onstart?.());
  }
  stop() {
    this.onend?.();
  }
  abort() {
    this.aborted = true;
    this.onerror?.({ error: "aborted" });
    this.onend?.();
  }
  /** The person says something. */
  hear(text: string) {
    const result = Object.assign([{ transcript: text }], { isFinal: true });
    this.onresult?.({ resultIndex: 0, results: [result] });
    this.onend?.();
  }
  silence() {
    this.onerror?.({ error: "no-speech" });
    this.onend?.();
  }
}

type Utterance = { text: string; onend?: () => void; onerror?: (event: { error: string }) => void };

function fakeBrowser() {
  const spoken: string[] = [];
  const speakingNow: Utterance[] = [];
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
  const target = new EventTarget();
  const synth = {
    speaking: false,
    paused: false,
    getVoices: () => [],
    speak(utterance: Utterance) {
      spoken.push(utterance.text);
      speakingNow.push(utterance);
      // Each sentence takes 300 ms to say.
      setTimeout(() => {
        const index = speakingNow.indexOf(utterance);
        if (index >= 0) speakingNow.splice(index, 1);
        utterance.onend?.();
      }, 300);
    },
    cancel() {
      speakingNow.splice(0);
    },
    pause() {},
    resume() {},
    addEventListener() {},
  };
  class SpeechSynthesisUtterance {
    text: string;
    voice: unknown = null;
    lang = "";
    rate = 1;
    pitch = 1;
    volume = 1;
    onend?: () => void;
    onerror?: (event: { error: string }) => void;
    constructor(text: string) {
      this.text = text;
    }
  }
  const doc = Object.assign(new EventTarget(), { visibilityState: "visible" as "visible" | "hidden" });
  const win = Object.assign(target, {
    localStorage: storage,
    sessionStorage: storage,
    speechSynthesis: synth,
    SpeechSynthesisUtterance,
    SpeechRecognition: FakeRecognition,
    location: { href: "http://localhost/" },
  });
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", doc);
  vi.stubGlobal("navigator", { userActivation: { hasBeenActive: true } });
  vi.stubGlobal("SpeechSynthesisUtterance", SpeechSynthesisUtterance);
  vi.stubGlobal("CustomEvent", class extends Event {
    detail: unknown;
    constructor(type: string, init?: { detail?: unknown; cancelable?: boolean }) {
      super(type, init);
      this.detail = init?.detail;
    }
  });
  vi.stubGlobal("Audio", class {});
  return { spoken, speakingNow, store, doc, win };
}

async function setup(prefs: Record<string, unknown>) {
  vi.resetModules();
  FakeRecognition.all = [];
  const browser = fakeBrowser();
  browser.store.set("lifezoi.voice-companion.v1", JSON.stringify({ setup: "done", ...prefs }));
  const { companion } = await import("@/lib/companion-voice/runtime");
  const navigate = vi.fn();
  const playMusic = vi.fn();
  companion.attach({ navigate, back: vi.fn(), playMusic, pauseMusic: vi.fn(), t: (text) => text, lang: "en" });
  return { companion, navigate, playMusic, ...browser };
}

const latest = () => FakeRecognition.all[FakeRecognition.all.length - 1];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("voice companion runtime", () => {
  it("keeps the microphone off until the person turns it on", async () => {
    const { companion } = await setup({ mic: "none", handsFree: true });
    await vi.advanceTimersByTimeAsync(2000);
    expect(FakeRecognition.all).toHaveLength(0);
    companion.talk();
    await vi.advanceTimersByTimeAsync(500);
    expect(FakeRecognition.all).toHaveLength(0);
  });

  it("opens My Day when the person says so, and never listens while LifeZoi speaks", async () => {
    const { navigate, spoken, speakingNow, companion } = await setup({ mic: "browser", handsFree: true });
    await vi.advanceTimersByTimeAsync(600);
    expect(latest()?.started).toBe(true);
    expect(companion.state().listening).toBe(true);
    latest().hear("Open My Day");
    // The player waits up to a second for the device's voices, then speaks.
    await vi.advanceTimersByTimeAsync(1050);
    expect(spoken[0]).toBe("Of course!");
    expect(speakingNow.length).toBeGreaterThan(0);
    // While the reply is spoken (and while it was about to be), no new recognizer starts.
    expect(FakeRecognition.all.length).toBe(1);
    expect(companion.state().listening).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1500);
    expect(navigate).toHaveBeenCalledWith("/my-day");
    // Hands-free: it listens again after speaking.
    await vi.advanceTimersByTimeAsync(1000);
    expect(FakeRecognition.all.length).toBe(2);
    expect(companion.state().listening).toBe(true);
  });

  it("starts Pilates in the guided-session player when it is there", async () => {
    const { navigate, win } = await setup({ mic: "browser", handsFree: true });
    const started: unknown[] = [];
    win.addEventListener("lifezoi:guided-start", (event) => {
      started.push((event as CustomEvent).detail);
      event.preventDefault();
    });
    await vi.advanceTimersByTimeAsync(600);
    latest().hear("Start Pilates");
    await vi.advanceTimersByTimeAsync(3000);
    expect(started).toEqual([{ id: "pilates-gentle", start: true }]);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("opens the closest existing page when the guided player is not there", async () => {
    const { navigate } = await setup({ mic: "browser", handsFree: true });
    await vi.advanceTimersByTimeAsync(600);
    latest().hear("Start meditation");
    await vi.advanceTimersByTimeAsync(3000);
    expect(navigate).toHaveBeenCalledWith("/breathe");
  });

  it("sends an open question to LifeZoi AI only after a yes, and never sends it anywhere itself", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { navigate, companion } = await setup({ mic: "browser", handsFree: true });
    await vi.advanceTimersByTimeAsync(600);
    latest().hear("What helps memory as we age?");
    await vi.advanceTimersByTimeAsync(3000);
    expect(navigate).not.toHaveBeenCalled();
    expect(matchCommand("What helps memory as we age?", 9).kind).toBe("question");
    expect(companion.state().suggestion).toEqual({ kind: "ask-ai", question: "What helps memory as we age?" });
    latest().hear("yes");
    await vi.advanceTimersByTimeAsync(3000);
    expect(navigate).toHaveBeenCalledWith(`/lifezoi-ai?q=${encodeURIComponent("What helps memory as we age?")}`);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("stops listening when asked, and when the tab is hidden", async () => {
    const { companion, doc } = await setup({ mic: "browser", handsFree: true });
    await vi.advanceTimersByTimeAsync(600);
    latest().hear("stop listening");
    await vi.advanceTimersByTimeAsync(3000);
    expect(companion.state().listening).toBe(false);
    const count = FakeRecognition.all.length;
    await vi.advanceTimersByTimeAsync(3000);
    expect(FakeRecognition.all.length).toBe(count);

    companion.setHandsFree(true);
    await vi.advanceTimersByTimeAsync(300);
    expect(companion.state().listening).toBe(true);
    doc.visibilityState = "hidden";
    doc.dispatchEvent(new Event("visibilitychange"));
    expect(latest().aborted).toBe(true);
    expect(companion.state().listening).toBe(false);
  });

  it("pauses hands-free after a long silence instead of listening forever", async () => {
    const { companion } = await setup({ mic: "browser", handsFree: true });
    await vi.advanceTimersByTimeAsync(600);
    for (let round = 0; round < 12; round += 1) {
      latest()?.silence();
      await vi.advanceTimersByTimeAsync(400);
    }
    expect(FakeRecognition.all.length).toBeLessThanOrEqual(9);
    expect(companion.state().listening).toBe(false);
    expect(companion.state().paused).toBe(true);
  });

  it("steps aside while another LifeZoi microphone is in use", async () => {
    const { companion } = await setup({ mic: "browser", handsFree: true });
    await vi.advanceTimersByTimeAsync(600);
    companion.holdMic("lifezoi-ai");
    expect(latest().aborted).toBe(true);
    const count = FakeRecognition.all.length;
    await vi.advanceTimersByTimeAsync(2000);
    expect(FakeRecognition.all.length).toBe(count);
    companion.releaseMic("lifezoi-ai");
    await vi.advanceTimersByTimeAsync(1000);
    expect(FakeRecognition.all.length).toBe(count + 1);
  });

  it("shows the one-tap welcome button when the browser has not had a tap yet", async () => {
    const { companion, spoken } = await setup({ mic: "none" });
    vi.stubGlobal("navigator", { userActivation: { hasBeenActive: false } });
    companion.greet("Good evening, Tatyana! Welcome back.", false, true);
    expect(companion.state().greeting?.blocked).toBe(true);
    expect(spoken).toHaveLength(0);
    companion.replayGreeting();
    await vi.advanceTimersByTimeAsync(1200);
    expect(spoken.join(" ")).toContain("Good evening, Tatyana!");
  });

  it("opens the microphone straight from the tap, even when another Listen button was left paused", async () => {
    const { companion } = await setup({ mic: "browser", handsFree: false });
    const { player } = await import("@/lib/voice/engine");
    const { segmentsFromText } = await import("@/lib/voice/voices");
    player.play("page-listen", segmentsFromText("A long article read aloud.", "en"), { stepWait: 0 });
    await vi.advanceTimersByTimeAsync(1000);
    player.pause();
    expect(player.state().status).toBe("paused");
    companion.talk();
    // No timer needed: the recognizer starts inside the tap.
    expect(latest()?.started).toBe(true);
    expect(player.state().status).toBe("idle");
  });

  it("says it heard nothing after a single tap with silence, instead of doing nothing", async () => {
    const { companion } = await setup({ mic: "browser", handsFree: false });
    companion.talk();
    await vi.advanceTimersByTimeAsync(10);
    latest().silence();
    expect(companion.state().error).toBe("no-speech");
  });
});
