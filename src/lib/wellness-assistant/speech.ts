import {
  NO_ENGLISH_VOICE_MESSAGE,
  RECOGNITION_DENIED_MESSAGE,
  RECOGNITION_FAILED_MESSAGE,
  SPEECH_UNSUPPORTED_MESSAGE,
} from "@/lib/wellness-assistant/copy";

export const USUAL_SPEECH_RATE = 1;
export const SLOWER_SPEECH_RATE = 0.8;

export type VoiceChoice = {
  name: string;
  lang: string;
};

export function englishVoices(voices: VoiceChoice[]): VoiceChoice[] {
  return voices.filter((voice) => /^en([-_]|$)/i.test(voice.lang.trim()));
}

export function pauseAndResumeSupported(
  synth: { pause?: unknown; resume?: unknown } | null | undefined,
): boolean {
  return Boolean(synth && typeof synth.pause === "function" && typeof synth.resume === "function");
}

export function speechPlaybackSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.speechSynthesis?.speak === "function";
}

const noEnglishVoices: VoiceChoice[] = [];
let englishVoiceCache: VoiceChoice[] = noEnglishVoices;
let englishVoiceKey = "";

export function subscribeEnglishVoices(onChange: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return () => undefined;
  const synth = window.speechSynthesis;
  synth.addEventListener("voiceschanged", onChange);
  return () => synth.removeEventListener("voiceschanged", onChange);
}

export function englishVoiceSnapshot(): VoiceChoice[] {
  if (!speechPlaybackSupported()) return noEnglishVoices;
  const next = englishVoices(
    window.speechSynthesis.getVoices().map((voice) => ({ name: voice.name, lang: voice.lang })),
  );
  const key = next.map((voice) => `${voice.lang}:${voice.name}`).join("|");
  if (key === englishVoiceKey) return englishVoiceCache;
  englishVoiceKey = key;
  englishVoiceCache = next.length === 0 ? noEnglishVoices : next;
  return englishVoiceCache;
}

export function englishVoiceServerSnapshot(): VoiceChoice[] {
  return noEnglishVoices;
}

/** Speech tags used to read answers aloud and to listen, by interface language. */
export const SPEECH_LANG: Record<string, string> = { en: "en-US", uk: "uk-UA", ru: "ru-RU", el: "el-GR" };

/** Voices whose language matches `lang`, such as "uk" for Ukrainian voices. */
export function voicesForLanguage(voices: VoiceChoice[], lang: string): VoiceChoice[] {
  const base = lang.trim().toLowerCase().split(/[-_]/)[0];
  if (base === "en") return englishVoices(voices);
  return voices.filter((voice) => voice.lang.trim().toLowerCase().split(/[-_]/)[0] === base);
}

const voiceCaches = new Map<string, { key: string; voices: VoiceChoice[] }>();

/** A stable snapshot of the browser's voices for one language, for `useSyncExternalStore`. */
export function languageVoiceSnapshot(lang: string): () => VoiceChoice[] {
  if (lang === "en") return englishVoiceSnapshot;
  return () => {
    if (!speechPlaybackSupported()) return noEnglishVoices;
    const next = voicesForLanguage(
      window.speechSynthesis.getVoices().map((voice) => ({ name: voice.name, lang: voice.lang })),
      lang,
    );
    const key = next.map((voice) => `${voice.lang}:${voice.name}`).join("|");
    const cached = voiceCaches.get(lang);
    if (cached && cached.key === key) return cached.voices;
    const voices = next.length === 0 ? noEnglishVoices : next;
    voiceCaches.set(lang, { key, voices });
    return voices;
  };
}

export function speechSupportSnapshot(): boolean | null {
  return speechPlaybackSupported();
}

export function speechSupportServerSnapshot(): boolean | null {
  return null;
}

export function pauseSupportSnapshot(): boolean {
  return typeof window !== "undefined" && pauseAndResumeSupported(window.speechSynthesis);
}

export function pauseSupportServerSnapshot(): boolean {
  return false;
}

export function recognitionSupportSnapshot(): boolean | null {
  return recognitionConstructor() !== null;
}

export function recognitionSupportServerSnapshot(): boolean | null {
  return null;
}

export function speechUnavailableMessage(hasEnglishVoice: boolean, playbackSupported: boolean): string | null {
  if (!playbackSupported) return SPEECH_UNSUPPORTED_MESSAGE;
  if (!hasEnglishVoice) return NO_ENGLISH_VOICE_MESSAGE;
  return null;
}

export type RecognitionResultEvent = {
  results: ArrayLike<{ 0?: { transcript?: string } }>;
};

export type RecognitionHandle = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => RecognitionHandle;

export function recognitionConstructor(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const host = window as Window & {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

export function transcriptFromResults(event: RecognitionResultEvent): string {
  const parts: string[] = [];
  for (let index = 0; index < event.results.length; index += 1) {
    const text = event.results[index]?.[0]?.transcript ?? "";
    if (text) parts.push(text);
  }
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function recognitionFailureMessage(error: string): string | null {
  if (error === "aborted" || error === "no-speech") return null;
  if (error === "not-allowed" || error === "service-not-allowed") return RECOGNITION_DENIED_MESSAGE;
  return RECOGNITION_FAILED_MESSAGE;
}
