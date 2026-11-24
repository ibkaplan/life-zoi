import { GUIDED_OFFER, GUIDED_REPLY, matchCommand, PAGES, type GuidedTarget, type Intent } from "@/lib/companion-voice/commands";
import { helloReply } from "@/lib/companion-voice/greeting";
import { COMPANION_STORAGE_KEY, DEFAULT_COMPANION_PREFS, parseCompanionPrefs, serializeCompanionPrefs, type CompanionPrefs } from "@/lib/companion-voice/prefs";
import { msg, type Translate } from "@/lib/i18n/translate";
import type { LibraryCategory as MusicCategory } from "@/lib/music-library/catalog";
import { crisisMessage } from "@/lib/mind/safety";
import { mapError, speechRecognitionCtor, type ListenError, type Recognition } from "@/lib/mind/speech";
import { player, speechSupported } from "@/lib/voice/engine";
import { segmentsFromText, SPEECH_TAG, type VoiceLang } from "@/lib/voice/voices";

/**
 * The voice companion's runtime: one per tab, so hands-free listening carries on when
 * the person moves between pages. It speaks only through the shared LifeZoi read-aloud
 * player, so it uses the same voice, speed, and natural voice as every Listen button.
 *
 * Listening is off until the person turns on the microphone. It stops while any LifeZoi
 * voice is speaking (so it never hears itself), while the tab is hidden, and while
 * another LifeZoi microphone (LifeZoi Mind, LifeZoi AI) is in use. Nothing heard is
 * stored or sent anywhere by LifeZoi: commands are matched in the browser.
 */

export const COMPANION_OWNER = "voice-companion";
/** The guided-session player's read-aloud owner. The companion never greets or listens over it. */
export const GUIDED_OWNER = "guided-session";
/** The guided-session player's start event. `preventDefault()` means the player took it. */
export const GUIDED_START_EVENT = "lifezoi:guided-start";

export type CompanionStatus = "off" | "ready" | "listening" | "thinking" | "speaking" | "paused";

/** A button the companion panel shows next to the last reply. */
export type Suggestion = { kind: "ask-ai"; question: string } | { kind: "profile" } | { kind: "crisis" } | null;

export type CompanionState = {
  prefs: CompanionPrefs;
  /** Read from storage, so the welcome panel does not flash before the saved choice is known. */
  loaded: boolean;
  recognitionSupported: boolean;
  listening: boolean;
  thinking: boolean;
  /** Hands-free is on but listening is paused (by the person, by silence, or a hidden tab). */
  paused: boolean;
  interim: string;
  heard: string | null;
  reply: string | null;
  error: ListenError | null;
  suggestion: Suggestion;
  /** The welcome for this visit: its words, and whether the browser blocked the sound. */
  greeting: { text: string; needsProfile: boolean; blocked: boolean; personal: boolean } | null;
  /** Another LifeZoi microphone is in use. */
  micHeldBy: string | null;
};

export type CompanionActions = {
  navigate: (href: string) => void;
  back: () => void;
  playMusic: (category: MusicCategory | null) => void;
  pauseMusic: () => void;
  t: Translate;
  lang: VoiceLang;
};

type Listener = () => void;

const INITIAL: CompanionState = {
  prefs: DEFAULT_COMPANION_PREFS,
  loaded: false,
  recognitionSupported: false,
  listening: false,
  thinking: false,
  paused: false,
  interim: "",
  heard: null,
  reply: null,
  error: null,
  suggestion: null,
  greeting: null,
  micHeldBy: null,
};

/** Rounds of silence before hands-free pauses itself, about a minute in most browsers. */
const MAX_SILENT_ROUNDS = 8;
/** Errors after which listening cannot work until the person changes something. */
const FATAL: readonly ListenError[] = ["denied", "site-blocked", "service-blocked", "no-microphone", "local-unavailable"];

const NAV_OFF = msg("Voice navigation is turned off. You can turn it on in Voice Companion settings.");
const NOT_UNDERSTOOD = msg("Sorry, I didn't quite catch that. You can say things like: open My Day, start Pilates, or play relaxing music.");
const HELP = msg(
  "You can say things like: open My Day, start Pilates, start a meditation, play relaxing music, show my meals, show my progress, or go home. To ask a health question, say: ask LifeZoi, and then your question.",
);
const ASK_OFFER = msg("That's a good question for LifeZoi AI. Shall I open it with your question ready?");
const ASK_OPENED = msg("I've opened LifeZoi AI with your question ready. Tap Ask when you're ready.");
const STOPPED = msg("Okay, I've stopped listening. Tap the LifeZoi button whenever you need me.");
const OKAY = msg("Okay.");
const WELCOME = msg("You're very welcome!");
const FEEL_GOOD = msg("That's wonderful to hear! Would you like to look at My Day?");
const FEEL_LOW = msg("I'm sorry you're feeling that way. Would you like a short breathing exercise? It only takes a few minutes.");
const MUSIC_ON = msg("Here's some music for you.");
const MUSIC_OFF = msg("I've paused the music.");
const GOING_BACK = msg("Going back.");

function readPrefs(): CompanionPrefs {
  try {
    return parseCompanionPrefs(window.localStorage.getItem(COMPANION_STORAGE_KEY));
  } catch {
    return { ...DEFAULT_COMPANION_PREFS };
  }
}

function writePrefs(prefs: CompanionPrefs) {
  try {
    window.localStorage.setItem(COMPANION_STORAGE_KEY, serializeCompanionPrefs(prefs));
  } catch {
    // Private mode: the choice lasts until the tab closes.
  }
}

/** True while a LifeZoi voice other than the companion is speaking or waiting between steps. */
function otherVoiceBusy(): boolean {
  const voice = player.state();
  return voice.status !== "idle" && voice.owner !== COMPANION_OWNER;
}

function companionSpeaking(): boolean {
  const voice = player.state();
  return voice.owner === COMPANION_OWNER && (voice.status === "playing" || voice.status === "waiting");
}

/** Speaking, or about to: the player waits a moment for the device's voices before the first sentence. */
function companionBusy(): boolean {
  const voice = player.state();
  return companionSpeaking() || (voice.owner === COMPANION_OWNER && voice.status === "idle" && voice.total > 0 && !voice.problem);
}

export function companionStatus(state: CompanionState, speaking: boolean): CompanionStatus {
  if (speaking) return "speaking";
  if (state.thinking) return "thinking";
  if (state.listening) return "listening";
  if (state.prefs.handsFree && state.prefs.mic !== "none") return "paused";
  if (!state.prefs.voiceOutput && state.prefs.mic === "none") return "off";
  return "ready";
}

function createRuntime() {
  let state: CompanionState = INITIAL;
  const listeners = new Set<Listener>();
  let actions: CompanionActions | null = null;
  let recognition: Recognition | null = null;
  let silentRounds = 0;
  let restartTimer: ReturnType<typeof setTimeout> | null = null;
  let detachTimer: ReturnType<typeof setTimeout> | null = null;
  let attached = 0;
  let started = false;
  /** Bumped when speech is interrupted, so the action after it (opening a page) is cancelled. */
  let speechTicket = 0;
  /** What "yes" does after LifeZoi asked a question. */
  let pending: Intent | null = null;
  /** The person paused hands-free; only they can start it again. */
  let userPaused = false;

  function set(change: Partial<CompanionState>) {
    state = { ...state, ...change };
    for (const listener of listeners) listener();
  }

  function t(text: string, values?: Record<string, string | number>): string {
    return actions ? actions.t(text, values) : text;
  }

  function lang(): VoiceLang {
    return actions?.lang ?? "en";
  }

  function init() {
    if (started || typeof window === "undefined") return;
    started = true;
    set({ prefs: readPrefs(), loaded: true, recognitionSupported: speechRecognitionCtor() !== null });
    player.subscribe(onVoiceChange);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", (event) => {
      if (event.key === COMPANION_STORAGE_KEY) set({ prefs: readPrefs() });
    });
  }

  let lastVoiceBusy = false;
  function onVoiceChange() {
    const busy = player.state().status !== "idle";
    if (busy && recognition) {
      // Any LifeZoi voice is speaking: stop listening, so LifeZoi never hears itself.
      stopRecognition();
    }
    if (lastVoiceBusy && !busy) scheduleListen(450);
    lastVoiceBusy = busy;
    // The speaking indicator follows the player.
    for (const listener of listeners) listener();
  }

  function onVisibility() {
    if (document.visibilityState === "hidden") {
      stopRecognition();
    } else {
      scheduleListen(300);
    }
  }

  function canListen(): boolean {
    return (
      attached > 0 &&
      state.prefs.mic !== "none" &&
      state.recognitionSupported &&
      !state.micHeldBy &&
      !otherVoiceBusy() &&
      !companionBusy() &&
      !state.thinking &&
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
    );
  }

  function scheduleListen(delay: number) {
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      restartTimer = null;
      if (state.prefs.handsFree && !userPaused && silentRounds < MAX_SILENT_ROUNDS) startRecognition();
    }, delay);
  }

  function stopRecognition() {
    if (restartTimer) clearTimeout(restartTimer);
    restartTimer = null;
    const current = recognition;
    recognition = null;
    if (current) {
      try {
        current.abort();
      } catch {
        // ignore
      }
    }
    if (state.listening || state.interim) set({ listening: false, interim: "" });
  }

  function startRecognition(): boolean {
    if (recognition || !canListen()) return false;
    const Ctor = speechRecognitionCtor();
    if (!Ctor) return false;
    const rec = new Ctor();
    rec.lang = SPEECH_TAG[lang()];
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    const local = state.prefs.mic === "local";
    if (local && "processLocally" in rec) rec.processLocally = true;
    let finalText = "";
    let failed: ListenError | null = null;
    rec.onstart = () => {
      if (recognition === rec) set({ listening: true, error: null, paused: false });
    };
    rec.onresult = (event) => {
      if (recognition !== rec) return;
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += text;
        else interim += text;
      }
      set({ interim: `${finalText}${interim}`.trim() });
    };
    rec.onerror = (event) => {
      if (event.error === "aborted") return;
      failed = event.error === "no-speech" ? "no-speech" : mapError(event.error, local);
    };
    rec.onend = () => {
      if (recognition !== rec) return;
      recognition = null;
      const text = finalText.trim();
      set({ listening: false, interim: "" });
      if (text) {
        silentRounds = 0;
        void handle(text);
        return;
      }
      if (failed && FATAL.includes(failed)) {
        set({ error: failed, paused: true });
        if (state.prefs.handsFree) savePrefs({ handsFree: false });
        return;
      }
      if (failed && failed !== "no-speech") set({ error: failed });
      silentRounds += 1;
      if (state.prefs.handsFree && !userPaused) {
        if (silentRounds >= MAX_SILENT_ROUNDS) set({ paused: true });
        else scheduleListen(failed === "network" ? 4000 : 250);
      }
    };
    recognition = rec;
    try {
      rec.start();
      return true;
    } catch {
      recognition = null;
      set({ error: "other" });
      return false;
    }
  }

  /** Speaks a reply with the LifeZoi voice, then runs `then` unless the person interrupted. */
  function say(text: string, then?: () => void, personal = false) {
    set({ reply: text, thinking: false });
    speechTicket += 1;
    const mine = speechTicket;
    let done = false;
    const finish = () => {
      if (done || mine !== speechTicket) return;
      done = true;
      then?.();
    };
    if (!state.prefs.voiceOutput || !speechSupported()) {
      finish();
      if (!then) scheduleListen(200);
      return;
    }
    player.play(COMPANION_OWNER, segmentsFromText(text, lang()), { stepWait: 0, localOnly: personal, onEnd: finish });
    // If the browser could not speak (no voice, or it wants a tap first), carry on without sound.
    setTimeout(() => {
      if (done || mine !== speechTicket) return;
      const voice = player.state();
      const sounding = voice.owner === COMPANION_OWNER && (voice.status === "playing" || voice.status === "waiting");
      if (!sounding) {
        if (voice.owner === COMPANION_OWNER) player.stop(COMPANION_OWNER);
        finish();
      }
    }, 1800);
  }

  function startGuided(target: GuidedTarget) {
    const event = new CustomEvent(GUIDED_START_EVENT, { detail: { id: target.sessionId, start: true }, cancelable: true });
    const notTaken = window.dispatchEvent(event);
    if (notTaken) actions?.navigate(target.fallback);
  }

  function run(intent: Intent) {
    const a = actions;
    pending = null;
    if (!a) return;
    switch (intent.kind) {
      case "crisis": {
        const message = crisisMessage(intent.kinds, (english) => t(english));
        userPaused = true;
        stopRecognition();
        set({ suggestion: { kind: "crisis" }, paused: true });
        say(`${message.title}. ${message.paragraphs.slice(0, 2).join(" ")}`);
        return;
      }
      case "stop":
        userPaused = true;
        stopRecognition();
        set({ paused: true, suggestion: null });
        say(t(STOPPED));
        return;
      case "yes":
      case "no":
        say(t(OKAY));
        return;
      case "back":
        if (!state.prefs.navigation) return say(t(NAV_OFF));
        say(t(GOING_BACK), () => a.back());
        return;
      case "music":
        say(t(MUSIC_ON), () => a.playMusic(intent.category));
        return;
      case "music-stop":
        a.pauseMusic();
        say(t(MUSIC_OFF));
        return;
      case "guided":
        if (!state.prefs.navigation) return say(t(NAV_OFF));
        say(t(GUIDED_REPLY[intent.activity]), () => startGuided(intent));
        return;
      case "offer":
        pending = intent.target;
        say(t(GUIDED_OFFER[intent.target.activity]));
        return;
      case "page": {
        if (!state.prefs.navigation) return say(t(NAV_OFF));
        const page = PAGES[intent.page];
        say(t(page.reply), () => a.navigate(page.href));
        return;
      }
      case "ask-ai":
        if (!state.prefs.navigation) {
          set({ suggestion: { kind: "ask-ai", question: intent.question } });
          return say(t(NAV_OFF));
        }
        set({ suggestion: null });
        say(t(ASK_OPENED), () => a.navigate(`/lifezoi-ai?q=${encodeURIComponent(intent.question.slice(0, 600))}`), true);
        return;
      case "greeting":
        say(helloReply(new Date().getHours(), t));
        return;
      case "feeling":
        if (intent.mood === "good") {
          pending = { kind: "page", page: "my-day" };
          say(t(FEEL_GOOD));
        } else {
          pending = { kind: "guided", activity: "breathing", sessionId: "breathing-calm", fallback: "/breathe" };
          say(t(FEEL_LOW));
        }
        return;
      case "thanks":
        say(t(WELCOME));
        return;
      case "help":
        say(t(HELP));
        return;
      case "question":
        pending = { kind: "ask-ai", question: intent.text };
        set({ suggestion: { kind: "ask-ai", question: intent.text } });
        say(t(ASK_OFFER));
        return;
      case "unknown":
        // A single stray word is usually background noise: listen again quietly.
        if (intent.text.split(/\s+/).length <= 1 && state.prefs.handsFree) {
          set({ thinking: false });
          scheduleListen(200);
          return;
        }
        say(t(NOT_UNDERSTOOD));
        return;
    }
  }

  async function handle(text: string) {
    set({ heard: text, thinking: true, error: null, suggestion: state.suggestion?.kind === "crisis" ? state.suggestion : null });
    const intent = matchCommand(text);
    const waiting = pending;
    if (waiting && intent.kind === "yes") {
      run(waiting);
      return;
    }
    if (waiting && intent.kind === "no") {
      pending = null;
      set({ suggestion: null });
      say(t(OKAY));
      return;
    }
    run(intent);
  }

  function savePrefs(change: Partial<CompanionPrefs>) {
    const prefs = { ...state.prefs, ...change };
    if (prefs.mic === "none") prefs.handsFree = false;
    writePrefs(prefs);
    set({ prefs });
  }

  return {
    state: () => state,
    speaking: companionSpeaking,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Called by the companion button on every members' page. */
    attach(next: CompanionActions) {
      init();
      actions = next;
      attached += 1;
      if (detachTimer) clearTimeout(detachTimer);
      detachTimer = null;
      if (attached === 1) scheduleListen(400);
      return () => {
        attached = Math.max(0, attached - 1);
        if (attached > 0) return;
        // Moving between page layouts unmounts the button for a moment; leaving the members' area stops everything.
        detachTimer = setTimeout(() => {
          if (attached > 0) return;
          stopRecognition();
          player.stop(COMPANION_OWNER);
        }, 1500);
      };
    },
    /** Keeps the latest translator and router without restarting anything. */
    update(next: CompanionActions) {
      actions = next;
    },
    savePrefs,
    /** The welcome for this visit. Returns false when the browser blocked the sound. */
    greet(text: string, needsProfile: boolean, personal: boolean) {
      if (needsProfile) {
        pending = { kind: "page", page: "profile" };
        set({ suggestion: { kind: "profile" } });
      }
      set({ greeting: { text, needsProfile, blocked: false, personal }, reply: text });
      if (!state.prefs.voiceOutput || !speechSupported()) return;
      // Browsers only let a page speak after the person has tapped or typed on it.
      const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
      if (activation && !activation.hasBeenActive) {
        set({ greeting: { text, needsProfile, blocked: true, personal } });
        return;
      }
      speechTicket += 1;
      const mine = speechTicket;
      player.play(COMPANION_OWNER, segmentsFromText(text, lang()), { stepWait: 0, localOnly: personal });
      setTimeout(() => {
        const greeting = state.greeting;
        if (mine !== speechTicket || !greeting) return;
        const voice = player.state();
        // The engine pauses when the browser refuses to speak without a tap.
        if (voice.owner === COMPANION_OWNER && voice.status === "paused") {
          player.stop(COMPANION_OWNER);
          set({ greeting: { ...greeting, blocked: true } });
        }
      }, 1800);
    },
    /** Plays the welcome again from a tap, which browsers allow. */
    replayGreeting() {
      const greeting = state.greeting;
      if (!greeting) return;
      set({ greeting: { ...greeting, blocked: false } });
      speechTicket += 1;
      player.play(COMPANION_OWNER, segmentsFromText(greeting.text, lang()), { stepWait: 0, localOnly: greeting.personal });
    },
    dismissGreeting() {
      if (state.greeting) set({ greeting: null });
    },
    /** Listens for one sentence (the button), or starts hands-free again after a pause. */
    talk() {
      userPaused = false;
      silentRounds = 0;
      speechTicket += 1;
      player.stop(COMPANION_OWNER);
      set({ paused: false, error: null });
      // Give the browser a moment to stop speaking before the microphone opens.
      setTimeout(() => startRecognition(), 120);
    },
    /** Stops speaking and listening at once (the button while busy, or Esc). */
    interrupt() {
      speechTicket += 1;
      pending = null;
      player.stop(COMPANION_OWNER);
      stopRecognition();
      if (state.prefs.handsFree) {
        userPaused = true;
        set({ paused: true, thinking: false });
      } else set({ thinking: false });
    },
    setHandsFree(on: boolean) {
      savePrefs({ handsFree: on && state.prefs.mic !== "none" });
      userPaused = !on;
      silentRounds = 0;
      if (on) {
        set({ paused: false, error: null });
        setTimeout(() => startRecognition(), 120);
      } else stopRecognition();
    },
    /** Records the microphone choice made in the consent panel. "none" turns the microphone off. */
    setMic(choice: CompanionPrefs["mic"]) {
      savePrefs({ mic: choice });
      if (choice === "none") {
        stopRecognition();
        set({ paused: false });
      }
    },
    /** Another LifeZoi microphone takes over (LifeZoi Mind, LifeZoi AI). */
    holdMic(owner: string) {
      stopRecognition();
      set({ micHeldBy: owner });
    },
    releaseMic(owner: string) {
      if (state.micHeldBy !== owner) return;
      set({ micHeldBy: null });
      scheduleListen(600);
    },
    /** Runs a typed or tapped request the same way as a spoken one. */
    handle,
    clearSuggestion() {
      pending = null;
      set({ suggestion: null });
    },
  };
}

export const companion = createRuntime();

export function serverCompanionState(): CompanionState {
  return INITIAL;
}
