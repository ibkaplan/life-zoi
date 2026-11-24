import { audioFocus } from "@/lib/background-music/audio-focus";
import { LOCALES } from "@/lib/i18n/config";
import { NEURAL_STORAGE_KEY, NEURAL_VOICES, lengthScaleFor, parseNeuralChoice, softenEdges, type NeuralVoice } from "@/lib/voice/neural/catalog";
import type { VoiceLang } from "@/lib/voice/voices";

/**
 * The page side of the lifeZoi natural voice. Speech is made by a worker
 * (public/voice/piper-worker.js) on this device and played here. Anything that
 * goes wrong (an old browser, no space, a failed download) leaves the device's
 * own voices in charge, so a Listen button always works.
 */

export type NeuralPhase = "absent" | "checking" | "downloading" | "ready" | "failed";
export type NeuralLangState = { phase: NeuralPhase; enabled: boolean; progress: number };
export type NeuralState = Record<VoiceLang, NeuralLangState>;

type Listener = () => void;

const SAMPLE: Record<VoiceLang, string> = {
  en: "Hello.",
  ru: "Здравствуйте.",
  uk: "Привіт.",
  el: "Γεια σας.",
};

function initial(): NeuralState {
  const state = {} as NeuralState;
  for (const lang of LOCALES) state[lang] = { phase: "checking", enabled: false, progress: 0 };
  return state;
}

const SERVER_STATE: NeuralState = (() => {
  const state = {} as NeuralState;
  for (const lang of LOCALES) state[lang] = { phase: "absent", enabled: false, progress: 0 };
  return state;
})();

let state: NeuralState = initial();
let started = false;
const listeners = new Set<Listener>();
let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (value: WorkerReply) => void; reject: (error: Error) => void; onProgress?: (fraction: number) => void }>();

type WorkerReply = { id: number; ok?: boolean; error?: string; installed?: string[]; pcm?: Float32Array; sampleRate?: number; progress?: { loaded: number; total: number } };

export function neuralSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof Worker === "function" &&
    typeof WebAssembly === "object" &&
    "caches" in window &&
    typeof BigInt64Array === "function" &&
    (typeof AudioContext === "function" || typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext === "function")
  );
}

function set(lang: VoiceLang, change: Partial<NeuralLangState>) {
  state = { ...state, [lang]: { ...state[lang], ...change } };
  for (const listener of listeners) listener();
}

function readEnabled(): Partial<Record<VoiceLang, boolean>> {
  try {
    return parseNeuralChoice(window.localStorage.getItem(NEURAL_STORAGE_KEY));
  } catch {
    return {};
  }
}

function writeEnabled() {
  const value: Partial<Record<VoiceLang, boolean>> = {};
  for (const lang of LOCALES) if (state[lang].enabled) value[lang] = true;
  try {
    window.localStorage.setItem(NEURAL_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be blocked; the choice lasts until the page closes.
  }
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker("/voice/piper-worker.js");
  worker.onmessage = (event: MessageEvent<WorkerReply>) => {
    const message = event.data;
    const waiting = pending.get(message.id);
    if (!waiting) return;
    if (message.progress) {
      const { loaded, total } = message.progress;
      waiting.onProgress?.(total > 0 ? Math.min(1, loaded / total) : 0);
      return;
    }
    pending.delete(message.id);
    if (message.ok) waiting.resolve(message);
    else waiting.reject(new Error(message.error || "failed"));
  };
  worker.onerror = () => {
    for (const waiting of pending.values()) waiting.reject(new Error("worker"));
    pending.clear();
    worker?.terminate();
    worker = null;
  };
  return worker;
}

function ask(message: Record<string, unknown>, onProgress?: (fraction: number) => void, transfer: Transferable[] = []): Promise<WorkerReply> {
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject, onProgress });
    getWorker().postMessage({ ...message, id }, transfer);
  });
}

function voiceMessage(voice: NeuralVoice) {
  return { key: voice.key, model: voice.model, config: voice.config, speaker: voice.speaker ?? 0 };
}

/** Looks once per page load at which natural voices are already saved in this browser. */
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (!neuralSupported()) {
    for (const lang of LOCALES) set(lang, { phase: "absent", enabled: false });
    return;
  }
  const enabled = readEnabled();
  // Only wake the worker when a natural voice was turned on before.
  if (!LOCALES.some((lang) => enabled[lang])) {
    for (const lang of LOCALES) set(lang, { phase: "absent", enabled: false });
    return;
  }
  void caches
    .open("lifezoi-natural-voice-v1")
    .then(async (cache) => {
      for (const lang of LOCALES) {
        const voice = NEURAL_VOICES[lang];
        const here = Boolean((await cache.match(voice.model)) && (await cache.match(voice.config)));
        set(lang, { phase: here ? "ready" : "absent", enabled: here && Boolean(enabled[lang]) });
      }
    })
    .catch(() => {
      for (const lang of LOCALES) set(lang, { phase: "absent", enabled: false });
    });
}

export function subscribeNeural(listener: Listener): () => void {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
  };
}

export function neuralState(): NeuralState {
  start();
  return state;
}

export function serverNeuralState(): NeuralState {
  return SERVER_STATE;
}

/** True when the natural voice for `lang` is downloaded and turned on. */
export function neuralActive(lang: VoiceLang): boolean {
  start();
  return state[lang].phase === "ready" && state[lang].enabled;
}

export async function installNeural(lang: VoiceLang): Promise<boolean> {
  if (!neuralSupported() || state[lang].phase === "downloading") return false;
  set(lang, { phase: "downloading", progress: 0 });
  try {
    // Ask the browser to keep the download even when space runs low.
    await navigator.storage?.persist?.().catch(() => false);
    const voice = NEURAL_VOICES[lang];
    await ask(
      { type: "install", voice: voiceMessage(voice), sample: SAMPLE[lang], expectedBytes: voice.downloadMb * 1_000_000 },
      (fraction) => set(lang, { progress: fraction }),
    );
    set(lang, { phase: "ready", enabled: true, progress: 1 });
    writeEnabled();
    return true;
  } catch {
    set(lang, { phase: "failed", enabled: false, progress: 0 });
    writeEnabled();
    return false;
  }
}

export function setNeuralEnabled(lang: VoiceLang, enabled: boolean) {
  if (state[lang].phase !== "ready") return;
  set(lang, { enabled });
  writeEnabled();
}

export async function removeNeural(lang: VoiceLang) {
  try {
    await ask({ type: "remove", voice: voiceMessage(NEURAL_VOICES[lang]) });
  } catch {
    // Removing is best effort; the browser can also clear site data.
  }
  set(lang, { phase: "absent", enabled: false, progress: 0 });
  writeEnabled();
}

// ---- Speaking -----------------------------------------------------------------

type Clip = { pcm: Float32Array; sampleRate: number };
const clips = new Map<string, Promise<Clip>>();

/** Makes the sound for one sentence. Recent sentences are kept so Replay and the next sentence start at once. */
export function synthesize(lang: VoiceLang, text: string, rate: number): Promise<Clip> {
  const scale = lengthScaleFor(rate);
  const key = `${lang}|${scale}|${text}`;
  const known = clips.get(key);
  if (known) return known;
  const made = ask({ type: "speak", voice: voiceMessage(NEURAL_VOICES[lang]), text, lengthScale: scale }).then((reply) => {
    if (!reply.pcm || !reply.sampleRate) throw new Error("no-audio");
    return { pcm: softenEdges(reply.pcm, reply.sampleRate), sampleRate: reply.sampleRate };
  });
  made.catch(() => clips.delete(key));
  clips.set(key, made);
  while (clips.size > 8) clips.delete(clips.keys().next().value as string);
  return made;
}

let context: AudioContext | null = null;
let playing: AudioBufferSourceNode | null = null;
let finishPlaying: (() => void) | null = null;

function audioContext(): AudioContext {
  if (context) return context;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  context = new Ctor();
  return context;
}

/** Call from a tap: phones only allow sound that a person started. */
export function unlockNeuralAudio() {
  if (typeof window === "undefined" || !neuralSupported()) return;
  try {
    const ctx = audioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    // ignore
  }
}

/** Plays one sentence. Resolves when it ends or is stopped. */
export async function playClip(clip: Clip, volume = 1): Promise<void> {
  stopClip();
  const ctx = audioContext();
  if (ctx.state === "suspended") await ctx.resume().catch(() => undefined);
  const buffer = ctx.createBuffer(1, clip.pcm.length, clip.sampleRate);
  buffer.getChannelData(0).set(clip.pcm);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  if (volume < 1) {
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, volume);
    source.connect(gain);
    gain.connect(ctx.destination);
  } else source.connect(ctx.destination);
  playing = source;
  // Background music lowers itself while a voice speaks.
  audioFocus.claim("natural-voice", "voice");
  await new Promise<void>((resolve) => {
    finishPlaying = resolve;
    source.onended = () => resolve();
    source.start();
  });
  if (playing === source) {
    playing = null;
    finishPlaying = null;
  }
  if (!playing) audioFocus.release("natural-voice");
}

export function stopClip() {
  const source = playing;
  const done = finishPlaying;
  playing = null;
  finishPlaying = null;
  audioFocus.release("natural-voice");
  if (!source) return;
  try {
    source.onended = null;
    source.stop();
  } catch {
    // already stopped
  }
  done?.();
}
