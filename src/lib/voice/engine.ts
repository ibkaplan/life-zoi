import { audioFocus } from "@/lib/background-music/audio-focus";
import {
  chooseVoice,
  clampRate,
  DEFAULT_VOICE_PREFS,
  estimatedSeconds,
  parseVoicePrefs,
  serializeVoicePrefs,
  SPEECH_TAG,
  VOICE_STORAGE_KEY,
  type DeviceVoice,
  type Segment,
  type VoiceLang,
  type VoicePrefs,
} from "@/lib/voice/voices";

/**
 * The one read-aloud player for the whole site. Every Listen button, the
 * breathing guide, the book reader, and the assistant speak through it, so only
 * one voice ever speaks at a time and starting a new section stops the last one.
 *
 * Pause works the same way on every device: the sentence is stopped and Resume
 * reads it again from its start. Phones do not reliably support pausing in the
 * middle of a sentence, and a half-paused voice that never resumes is worse.
 */

export type VoiceStatus = "idle" | "playing" | "paused" | "waiting";
export type VoiceProblem = "unsupported" | "no-voice" | "failed" | null;

export type VoiceState = {
  status: VoiceStatus;
  /** Which Listen button owns the current reading. */
  owner: string | null;
  index: number;
  total: number;
  /** Block (step or paragraph) of the sentence being read. */
  block: number;
  lang: VoiceLang | null;
  voiceName: string | null;
  /** While waiting between steps: seconds left, or `null` when waiting for the person to tap Next. */
  waitLeft: number | null;
  problem: VoiceProblem;
  problemLang: VoiceLang | null;
};

const IDLE: VoiceState = {
  status: "idle",
  owner: null,
  index: 0,
  total: 0,
  block: 0,
  lang: null,
  voiceName: null,
  waitLeft: null,
  problem: null,
  problemLang: null,
};

export type PlayOptions = {
  /** Multiplies the person's saved speed, for example 0.9 for a slower breathing guide. */
  rateFactor?: number;
  /** Wait after each numbered step: seconds, or `null` for "until I tap Next". Defaults to the saved choice. */
  stepWait?: number | null;
  /** The text may include the person's own information: use only voices that run on the device. */
  localOnly?: boolean;
  onEnd?: () => void;
};

type Listener = () => void;

const FOCUS_ID = "read-aloud";
const PREFS_EVENT = "lifezoi:voice-prefs";

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const value = window.speechSynthesis;
  return value && typeof value.speak === "function" ? value : null;
}

export function speechSupported(): boolean {
  return synth() !== null && typeof window.SpeechSynthesisUtterance === "function";
}

// ---- Device voices -----------------------------------------------------------

let voiceCache: SpeechSynthesisVoice[] = [];
let voiceKey = "";
const voiceListeners = new Set<Listener>();
let voicesWatched = false;

function refreshVoices(): boolean {
  const engine = synth();
  const list = engine ? engine.getVoices() : [];
  const key = list.map((voice) => `${voice.lang}:${voice.name}`).join("|");
  if (key === voiceKey) return false;
  voiceKey = key;
  voiceCache = list;
  return true;
}

function watchVoices() {
  if (voicesWatched) return;
  const engine = synth();
  if (!engine) return;
  voicesWatched = true;
  const update = () => {
    if (refreshVoices()) for (const listener of voiceListeners) listener();
  };
  engine.addEventListener?.("voiceschanged", update);
  // Some browsers load voices late and never fire the event.
  for (const delay of [250, 1000, 3000]) setTimeout(update, delay);
}

export function subscribeVoices(listener: Listener): () => void {
  voiceListeners.add(listener);
  watchVoices();
  return () => {
    voiceListeners.delete(listener);
  };
}

export function deviceVoices(): SpeechSynthesisVoice[] {
  if (voiceCache.length === 0) refreshVoices();
  return voiceCache;
}

const noVoices: SpeechSynthesisVoice[] = [];
export function serverVoices(): SpeechSynthesisVoice[] {
  return noVoices;
}

// ---- Saved preference ---------------------------------------------------------

let prefsCache: VoicePrefs | null = null;

export function readVoicePrefs(): VoicePrefs {
  if (prefsCache) return prefsCache;
  try {
    prefsCache = parseVoicePrefs(window.localStorage.getItem(VOICE_STORAGE_KEY));
  } catch {
    prefsCache = { ...DEFAULT_VOICE_PREFS, voices: {} };
  }
  return prefsCache;
}

export function serverVoicePrefs(): VoicePrefs {
  return DEFAULT_VOICE_PREFS;
}

export function saveVoicePrefs(change: Partial<VoicePrefs>) {
  const current = readVoicePrefs();
  const next: VoicePrefs = {
    rate: clampRate(change.rate ?? current.rate),
    voices: { ...current.voices, ...(change.voices ?? {}) },
    stepWait: change.stepWait !== undefined ? change.stepWait : current.stepWait,
  };
  prefsCache = next;
  try {
    window.localStorage.setItem(VOICE_STORAGE_KEY, serializeVoicePrefs(next));
  } catch {
    // Storage can be blocked. The choice still applies until the page closes.
  }
  window.dispatchEvent(new Event(PREFS_EVENT));
  // A new speed or voice takes effect from the sentence being read.
  if (change.rate !== undefined || change.voices) player.restartSentence();
}

export function subscribeVoicePrefs(listener: Listener): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === VOICE_STORAGE_KEY) {
      prefsCache = null;
      listener();
    }
  };
  window.addEventListener(PREFS_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(PREFS_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** The voice that will read `lang`, or null when the device has none for it. */
export function voiceFor(lang: VoiceLang, localOnly = false): SpeechSynthesisVoice | null {
  const voices = localOnly ? deviceVoices().filter((voice) => voice.localService !== false) : deviceVoices();
  return chooseVoice(voices, lang, readVoicePrefs().voices[lang]);
}

// ---- Player -------------------------------------------------------------------

function createPlayer() {
  let state: VoiceState = IDLE;
  const listeners = new Set<Listener>();
  let segments: Segment[] = [];
  let options: PlayOptions = {};
  // Bumped on every start, stop, and pause, so late callbacks from an old utterance are ignored.
  let ticket = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let tick: ReturnType<typeof setInterval> | null = null;
  let watchdog: ReturnType<typeof setTimeout> | null = null;
  // Chrome can drop an utterance that nothing references, and then never reports its end.
  let current: SpeechSynthesisUtterance | null = null;
  let pausedWait: number | null | undefined;

  function set(change: Partial<VoiceState>) {
    state = { ...state, ...change };
    if (state.status === "playing") audioFocus.claim(FOCUS_ID, "voice");
    else audioFocus.release(FOCUS_ID);
    for (const listener of listeners) listener();
  }

  function clearTimers() {
    if (timer) clearTimeout(timer);
    if (tick) clearInterval(tick);
    if (watchdog) clearTimeout(watchdog);
    timer = tick = watchdog = null;
  }

  function cancelSpeech() {
    current = null;
    try {
      synth()?.cancel();
    } catch {
      // ignore
    }
  }

  function finish() {
    const done = options.onEnd;
    clearTimers();
    ticket += 1;
    segments = [];
    set({ ...IDLE });
    done?.();
  }

  function stepWait(): number | null {
    return options.stepWait !== undefined ? options.stepWait : readVoicePrefs().stepWait;
  }

  function wait(seconds: number | null, then: () => void) {
    const mine = ticket;
    if (seconds === null) {
      set({ status: "waiting", waitLeft: null });
      return;
    }
    const until = Date.now() + seconds * 1000;
    set({ status: "waiting", waitLeft: Math.ceil(seconds) });
    tick = setInterval(() => {
      if (mine !== ticket) return;
      set({ waitLeft: Math.max(0, Math.ceil((until - Date.now()) / 1000)) });
    }, 500);
    timer = setTimeout(() => {
      if (mine !== ticket) return;
      clearTimers();
      then();
    }, seconds * 1000);
  }

  function afterSentence(at: number) {
    const segment = segments[at];
    const next = at + 1;
    if (next >= segments.length) {
      finish();
      return;
    }
    const mine = ticket;
    const pause = stepWait();
    if (segment?.endsStep && pause !== 0) {
      wait(pause, () => speakAt(next));
      // Remember where to continue when the person taps Next.
      set({ index: next });
      return;
    }
    const gap = (segment?.pauseMs ?? 400) / Math.max(0.6, readVoicePrefs().rate * (options.rateFactor ?? 1));
    timer = setTimeout(() => {
      if (mine === ticket) speakAt(next);
    }, gap);
  }

  function speakAt(at: number) {
    clearTimers();
    const engine = synth();
    const segment = segments[at];
    if (!engine || !segment) {
      finish();
      return;
    }
    const known = deviceVoices();
    const voice = voiceFor(segment.lang, options.localOnly);
    if (!voice && known.length > 0) {
      // Never read the text with a voice for another language.
      const owner = state.owner;
      clearTimers();
      ticket += 1;
      segments = [];
      set({ ...IDLE, owner, problem: "no-voice", problemLang: segment.lang });
      return;
    }
    // Some Android browsers list no voices at all but still speak: the language tag then picks the voice.
    ticket += 1;
    const mine = ticket;
    const rate = clampRate(readVoicePrefs().rate * (options.rateFactor ?? 1));
    const utterance = new SpeechSynthesisUtterance(segment.text);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || SPEECH_TAG[segment.lang];
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    let ended = false;
    const done = () => {
      if (ended || mine !== ticket) return;
      ended = true;
      if (watchdog) clearTimeout(watchdog);
      current = null;
      afterSentence(at);
    };
    utterance.onend = done;
    utterance.onerror = (event) => {
      if (mine !== ticket) return;
      const error = (event as SpeechSynthesisErrorEvent).error;
      if (error === "interrupted" || error === "canceled") return;
      if (error === "not-allowed") {
        // The browser wants a tap first (iPhone, some Android). Keep the place so Play continues here.
        ticket += 1;
        set({ status: "paused" });
        return;
      }
      done();
    };
    current = utterance;
    set({
      status: "playing",
      index: at,
      block: segment.block,
      lang: segment.lang,
      voiceName: voice?.name ?? null,
      waitLeft: null,
      problem: null,
      problemLang: null,
    });
    try {
      engine.speak(utterance);
      // Chrome on some systems leaves speech paused after an earlier pause() elsewhere.
      if (engine.paused) engine.resume();
    } catch {
      set({ ...IDLE, problem: "failed" });
      return;
    }
    // Safety net: some voices never fire `end`. Move on after twice the expected time.
    watchdog = setTimeout(done, (estimatedSeconds(segment.text, rate) * 2 + 6) * 1000);
  }

  return {
    state(): VoiceState {
      return state;
    },
    /** The sentence being spoken. Holding it here also keeps the browser from dropping it. */
    utterance(): SpeechSynthesisUtterance | null {
      return current;
    },
    subscribe(listener: Listener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Starts reading. Anything already being read is stopped first. */
    play(owner: string, next: Segment[], opts: PlayOptions = {}, startAt = 0) {
      const previous = options.onEnd;
      const previousOwner = state.owner;
      clearTimers();
      ticket += 1;
      cancelSpeech();
      if (previousOwner && previousOwner !== owner) previous?.();
      if (!speechSupported()) {
        set({ ...IDLE, owner, problem: "unsupported" });
        return;
      }
      segments = next.filter((segment) => segment.text.trim());
      options = opts;
      if (segments.length === 0) {
        set({ ...IDLE });
        return;
      }
      set({ ...IDLE, owner, total: segments.length });
      watchVoices();
      // A short gap after cancel(): starting at once is sometimes dropped by Chrome and Safari.
      // On a first visit the device may still be loading its voices, so give it a moment.
      const mine = ticket;
      const first = Math.min(Math.max(0, startAt), segments.length - 1);
      timer = setTimeout(() => {
        if (mine !== ticket) return;
        if (deviceVoices().length > 0) speakAt(first);
        else
          timer = setTimeout(() => {
            if (mine === ticket) speakAt(first);
          }, 900);
      }, 60);
    },
    pause() {
      if (state.status === "playing") {
        ticket += 1;
        clearTimers();
        cancelSpeech();
        pausedWait = undefined;
        set({ status: "paused" });
      } else if (state.status === "waiting") {
        ticket += 1;
        pausedWait = state.waitLeft;
        clearTimers();
        set({ status: "paused" });
      }
    },
    resume() {
      if (state.status !== "paused") return;
      if (pausedWait !== undefined) {
        const left = pausedWait;
        pausedWait = undefined;
        ticket += 1;
        const at = state.index;
        wait(left, () => speakAt(at));
        return;
      }
      speakAt(state.index);
    },
    stop(owner?: string) {
      if (owner && state.owner !== owner) return;
      if (state.status === "idle" && !state.problem) return;
      cancelSpeech();
      finish();
    },
    /** Reads again from the first sentence. */
    replay() {
      if (segments.length === 0) return;
      ticket += 1;
      clearTimers();
      cancelSpeech();
      pausedWait = undefined;
      speakAt(0);
    },
    /** Moves to the next or previous step (block). */
    skip(direction: 1 | -1) {
      if (segments.length === 0) return;
      const block = segments[state.index]?.block ?? 0;
      const waitingForNext = state.status === "waiting" || (state.status === "paused" && pausedWait !== undefined);
      let at: number;
      if (direction === 1) {
        // While waiting, `index` already points at the next step.
        at = waitingForNext ? state.index : segments.findIndex((segment) => segment.block > block);
      } else {
        const target = waitingForNext ? (segments[state.index - 1]?.block ?? 0) : block - 1;
        at = segments.findIndex((segment) => segment.block >= Math.max(0, target));
      }
      ticket += 1;
      clearTimers();
      cancelSpeech();
      pausedWait = undefined;
      if (at === -1) {
        finish();
        return;
      }
      speakAt(at);
    },
    /** Reads the current sentence again with the latest speed or voice. */
    restartSentence() {
      if (state.status !== "playing") return;
      ticket += 1;
      clearTimers();
      cancelSpeech();
      const at = state.index;
      setTimeout(() => speakAt(at), 60);
    },
    /** Clears a "no voice" note. */
    clearProblem() {
      if (state.problem) set({ problem: null, problemLang: null });
    },
  };
}

export const player = createPlayer();

export function serverVoiceState(): VoiceState {
  return IDLE;
}

/** Stops all speech, for example when the person moves to another page. */
export function stopAllSpeech() {
  player.stop();
  try {
    synth()?.cancel();
  } catch {
    // ignore
  }
}

/** Ranks are worked out on plain objects so they can be unit tested. */
export function toDeviceVoice(voice: SpeechSynthesisVoice): DeviceVoice {
  return { name: voice.name, lang: voice.lang, localService: voice.localService, default: voice.default, voiceURI: voice.voiceURI };
}
