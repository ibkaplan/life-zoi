import { LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * Pure helpers for the read-aloud voice: which device voice sounds best for a
 * language, which language a piece of text is written in, and how to cut text
 * into sentences with natural pauses. Nothing here touches the browser, so it
 * is unit tested. The voices themselves are the ones the device already has
 * (Web Speech API). No text is sent to a paid or remote voice service by lifeZoi.
 */

export type VoiceLang = Locale;

/** The fields lifeZoi reads from a `SpeechSynthesisVoice`. */
export type DeviceVoice = {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
  voiceURI?: string;
};

/** The region each language prefers when a device has several accents. */
const PREFERRED_REGION: Record<VoiceLang, string[]> = {
  en: ["en-us", "en-gb", "en-au", "en-ca", "en-ie", "en-nz"],
  uk: ["uk-ua"],
  ru: ["ru-ru"],
  el: ["el-gr"],
};

/** BCP 47 tag set on the utterance when no exact voice is known. */
export const SPEECH_TAG: Record<VoiceLang, string> = { en: "en-US", uk: "uk-UA", ru: "ru-RU", el: "el-GR" };

function normalTag(lang: string): string {
  return lang.trim().replace(/_/g, "-").toLowerCase();
}

export function voiceLanguage(voice: Pick<DeviceVoice, "lang">): VoiceLang | null {
  const base = normalTag(voice.lang).split("-")[0];
  return (LOCALES as readonly string[]).includes(base) ? (base as VoiceLang) : null;
}

// Voices that macOS and iOS ship as jokes or effects. They are never a good reading voice.
const NOVELTY =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|junior|ralph|kathy|princess|fred)\b/i;
// Older formant or "Eloquence" voices: understandable, but plainly robotic.
const ROBOTIC = /\b(espeak|mbrola|grandma|grandpa|rocko|shelley|sandy|flo|eddy|reed|pico)\b/i;
// Words platforms use for their higher quality voices.
const NATURAL = /\b(natural|neural|wavenet|studio|journey|polyglot)\b/i;
const ENHANCED = /\b(premium|enhanced|high quality|hq)\b|\((premium|enhanced)\)/i;
const ONLINE = /\bonline\b|-network\b/i;
// Apple voices with a warm, clear reading style in their compact form too.
const PLEASANT = /\b(ava|zoe|allison|evan|nathan|serena|susan|karen|moira|tessa|daniel|kate|milena|katya|yuri|lesya|melina|nikos|aria|jenny|guy|sonia|libby|ryan|svetlana|dmitry|polina|ostap|athina|nestoras)\b/i;

/** Which kind of voice the person prefers. Most people find a soft female voice the calmest for guidance. */
export const VOICE_TONES = ["soft", "deep", "any"] as const;
export type VoiceTone = (typeof VOICE_TONES)[number];
export const DEFAULT_VOICE_TONE: VoiceTone = "soft";

// Browsers do not say whether a voice is female or male, so lifeZoi guesses from the
// names the big platforms use (Windows, macOS and iOS, Android and Chrome, Edge).
const FEMALE =
  /\b(female|woman|zira|hazel|susan|heera|catherine|linda|eva|irina|ekaterina|svetlana|dariya|polina|natasha|milena|katya|lesya|ava|zoe|allison|samantha|karen|moira|tessa|serena|kate|fiona|victoria|veena|aria|jenny|sonia|libby|michelle|emma|clara|maisie|ana|amy|joanna|salli|kimberly|ivy|kendra|tatyana|melina|athina|anna|alena|sara|isla|natalie|molly|elizabeth|nicole|olivia|ruby|tatiana|oksana|mariya|maria)\b/i;
const MALE =
  /\b(male|man|david|mark|george|richard|pavel|ostap|dmitry|dmitri|daniel|alex|aaron|arthur|gordon|lee|oliver|rishi|yuri|guy|ryan|eric|christopher|roger|steffan|thomas|andrew|brian|nikos|nestoras|evan|nathan|tom|james|william|liam|matthew|justin|joey|maxim|denis|ruslan|stefanos|tony|jacob)\b/i;
// Chrome's own voices are female unless the name says Male.
const GOOGLE_FEMALE = /^google\s/i;

/** A guess at the voice type from its name: "soft" (female), "deep" (male), or null when unknown. */
export function voiceTone(voice: Pick<DeviceVoice, "name">): Exclude<VoiceTone, "any"> | null {
  const name = voice.name.replace(/\bonline\b|\(natural\)|\(premium\)|\(enhanced\)/gi, " ");
  if (/\bmale\b/i.test(name) && !/\bfemale\b/i.test(name)) return "deep";
  if (FEMALE.test(name)) return "soft";
  if (MALE.test(name)) return "deep";
  if (GOOGLE_FEMALE.test(name)) return "soft";
  return null;
}

/**
 * A score for how pleasant a voice is likely to sound for `lang`. Higher is better.
 * Voices for another language score `-Infinity`. The score is a guess from the
 * voice name and type: lifeZoi cannot hear the voice, so the person can always
 * choose another one.
 */
export function voiceScore(voice: DeviceVoice, lang: VoiceLang, tone: VoiceTone = DEFAULT_VOICE_TONE): number {
  if (voiceLanguage(voice) !== lang) return Number.NEGATIVE_INFINITY;
  const name = voice.name;
  const tag = normalTag(voice.lang);
  let score = 0;
  const region = PREFERRED_REGION[lang].indexOf(tag);
  score += region === -1 ? 0 : 12 - region * 2;
  if (NATURAL.test(name)) score += 60;
  if (ENHANCED.test(name)) score += 45;
  if (ONLINE.test(name) || ONLINE.test(voice.voiceURI ?? "")) score += 35;
  if (/\bgoogle\b/i.test(name)) score += 30;
  if (/\bsiri\b/i.test(name)) score += 35;
  if (PLEASANT.test(name)) score += 10;
  if (voice.localService === false) score += 8;
  if (voice.default) score += 2;
  // People find the plain compact "Samantha" voice flat. Its enhanced version still ranks well.
  if (/\bsamantha\b/i.test(name) && !ENHANCED.test(name)) score -= 20;
  if (tone !== "any") {
    const kind = voiceTone(voice);
    // Strong enough to beat "natural" or "online" on its own: a harsh voice of the wrong kind is what people notice first.
    if (kind === tone) score += 70;
    else if (kind !== null) score -= 70;
  }
  if (ROBOTIC.test(name)) score -= 60;
  if (NOVELTY.test(name)) score -= 200;
  return score;
}

/** Voices for `lang`, best first. Novelty voices are left out entirely. */
export function rankVoices<V extends DeviceVoice>(voices: readonly V[], lang: VoiceLang, tone: VoiceTone = DEFAULT_VOICE_TONE): V[] {
  return voices
    .map((voice, index) => ({ voice, index, score: voiceScore(voice, lang, tone) }))
    .filter((item) => item.score > -150)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.voice);
}

/** The voice to use: the person's saved choice if the device still has it, otherwise the best ranked one. */
export function chooseVoice<V extends DeviceVoice>(
  voices: readonly V[],
  lang: VoiceLang,
  preferred?: string | null,
  tone: VoiceTone = DEFAULT_VOICE_TONE,
): V | null {
  const ranked = rankVoices(voices, lang, tone);
  if (preferred) {
    const saved = ranked.find((voice) => voice.name === preferred) ?? voices.find((voice) => voice.name === preferred && voiceLanguage(voice) === lang);
    if (saved) return saved;
  }
  return ranked[0] ?? null;
}

/** A shorter label for a voice in a menu, without repeating the language. */
export function voiceLabel(voice: DeviceVoice): string {
  const region = normalTag(voice.lang).split("-")[1];
  const name = voice.name.replace(/^Microsoft\s+/i, "").replace(/\s+-\s+.*$/, "").trim();
  return region ? `${name} (${region.toUpperCase()})` : name;
}

const LATIN = /[A-Za-z]/g;
const CYRILLIC = /[Ѐ-ӿ]/g;
const GREEK = /[Ͱ-Ͽἀ-῿]/g;
const UKRAINIAN_ONLY = /[іїєґІЇЄҐ]/;
const RUSSIAN_ONLY = /[ыэъёЫЭЪЁ]/;

/**
 * The language a piece of text is written in, from its alphabet. Ukrainian and
 * Russian share most letters, so letters only one of them uses decide, and the
 * site language breaks a tie. Text without letters follows the site language.
 */
export function detectTextLanguage(text: string, siteLocale: VoiceLang): VoiceLang {
  const latin = text.match(LATIN)?.length ?? 0;
  const cyrillic = text.match(CYRILLIC)?.length ?? 0;
  const greek = text.match(GREEK)?.length ?? 0;
  const most = Math.max(latin, cyrillic, greek);
  if (most === 0) return siteLocale;
  if (greek === most) return "el";
  if (cyrillic === most) {
    if (UKRAINIAN_ONLY.test(text)) return "uk";
    if (RUSSIAN_ONLY.test(text)) return "ru";
    return siteLocale === "uk" ? "uk" : "ru";
  }
  return "en";
}

/** Cleans text so a voice does not read symbols aloud. */
export function speakableText(text: string): string {
  return text
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, " ")
    // Pages show some labels in capitals with CSS; a voice may spell those out letter by letter.
    .replace(/\p{Lu}{5,}/gu, (word) => word.charAt(0) + word.slice(1).toLowerCase())
    .replace(/[•·|]/g, ", ")
    .replace(/[→←↑↓▶►◀]/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/(,\s*){2,}/g, ", ")
    .replace(/\s+/g, " ")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .trim();
}

/** Longest piece given to one utterance. Some browsers stop long utterances part way. */
export const MAX_CHUNK = 220;

/**
 * Splits text into sentences, and long sentences at commas, so each one is its
 * own utterance. The pause between utterances is what makes reading sound calm.
 */
export function splitSentences(text: string, max = MAX_CHUNK): string[] {
  const clean = speakableText(text);
  if (!clean) return [];
  const sentences = clean.match(/[^.!?…;]+(?:[.!?…;]+["»”')\]]*|$)/g) ?? [clean];
  const out: string[] = [];
  for (const raw of sentences) {
    const sentence = raw.trim();
    if (!sentence) continue;
    if (sentence.length <= max) {
      out.push(sentence);
      continue;
    }
    let current = "";
    for (const part of sentence.split(/(?<=[,:–—])\s+/)) {
      if (current && (current + " " + part).length > max) {
        out.push(current);
        current = part;
      } else current = current ? `${current} ${part}` : part;
      while (current.length > max) {
        const cut = current.lastIndexOf(" ", max);
        const at = cut > max / 2 ? cut : max;
        out.push(current.slice(0, at).trim());
        current = current.slice(at).trim();
      }
    }
    if (current) out.push(current);
  }
  // Very short fragments ("Yes.") sound clipped on their own; join them to the sentence before.
  return out.reduce<string[]>((list, piece) => {
    if (list.length > 0 && piece.length < 12 && (list[list.length - 1] + " " + piece).length <= max) list[list.length - 1] += ` ${piece}`;
    else list.push(piece);
    return list;
  }, []);
}

/** What kind of block a piece of text came from. It sets the pause after it. */
export type BlockKind = "heading" | "paragraph" | "step" | "item";

/** One utterance, with the pause that follows it. */
export type Segment = {
  text: string;
  lang: VoiceLang;
  /** Silence after this sentence, before the next one starts. */
  pauseMs: number;
  /** Set on the last sentence of a numbered step, so a guided session can wait there. */
  endsStep?: boolean;
  /** Which block (step, paragraph) this sentence belongs to, counted from 0. */
  block: number;
};

export type Block = { text: string; kind: BlockKind };

const PAUSE: Record<BlockKind, { sentence: number; after: number }> = {
  heading: { sentence: 300, after: 750 },
  paragraph: { sentence: 380, after: 650 },
  step: { sentence: 380, after: 900 },
  item: { sentence: 320, after: 500 },
};

/** Turns blocks of text into utterances with pauses that follow the structure of the page. */
export function buildSegments(blocks: readonly Block[], siteLocale: VoiceLang): Segment[] {
  const segments: Segment[] = [];
  blocks.forEach((block, blockIndex) => {
    // A heading without an end mark is read with a falling tone when it gets one.
    const text = block.kind === "heading" && !/[.!?…:]$/.test(block.text.trim()) ? `${block.text.trim()}.` : block.text;
    const lang = detectTextLanguage(text, siteLocale);
    const sentences = splitSentences(text);
    sentences.forEach((sentence, index) => {
      const last = index === sentences.length - 1;
      segments.push({
        text: sentence,
        lang,
        pauseMs: last ? PAUSE[block.kind].after : PAUSE[block.kind].sentence,
        endsStep: last && block.kind === "step" ? true : undefined,
        block: blockIndex,
      });
    });
  });
  return segments;
}

/** Plain strings (paragraphs) to segments. */
export function segmentsFromText(text: string | readonly string[], siteLocale: VoiceLang, kind: BlockKind = "paragraph"): Segment[] {
  const list = typeof text === "string" ? text.split(/\n{2,}/) : text;
  return buildSegments(
    list.map((item) => ({ text: item, kind })).filter((item) => item.text.trim()),
    siteLocale,
  );
}

/** Rough speaking time, used as a safety net when a browser never reports the end of a sentence. */
export function estimatedSeconds(text: string, rate: number): number {
  return text.length / (14 * Math.max(0.5, rate));
}

// ---- Saved preference -------------------------------------------------------

/** Saved in this browser only. It holds a speed and voice names, never health information. */
export const VOICE_STORAGE_KEY = "lifezoi.voice.v1";

export const RATE_CHOICES = [0.75, 0.85, 0.95, 1, 1.1, 1.25] as const;
/** Slightly slower than the device default: easier to follow while busy, and less rushed. */
export const DEFAULT_RATE = 0.95;

/** Waiting time after a numbered step in a guided session. `null` waits for the person to tap Next. */
export const STEP_WAIT_CHOICES = [0, 10, 20, 30, 60, null] as const;
export type StepWait = (typeof STEP_WAIT_CHOICES)[number];

export type VoicePrefs = {
  rate: number;
  voices: Partial<Record<VoiceLang, string>>;
  stepWait: StepWait;
  /** The kind of voice picked when the person has not chosen one by name. */
  tone: VoiceTone;
  /** Loudness of the LifeZoi voice everywhere, 0.2 to 1. Some browsers (iPhone and iPad Safari) ignore it for device voices. */
  volume: number;
};

export const DEFAULT_VOICE_PREFS: VoicePrefs = { rate: DEFAULT_RATE, voices: {}, stepWait: 0, tone: DEFAULT_VOICE_TONE, volume: 1 };

/** Voice loudness, kept audible: the quietest setting is 20%. */
export function clampVoiceVolume(volume: unknown): number {
  const value = typeof volume === "number" && Number.isFinite(volume) ? volume : 1;
  return Math.min(1, Math.max(0.2, Math.round(value * 100) / 100));
}

export function clampRate(rate: unknown): number {
  const value = typeof rate === "number" && Number.isFinite(rate) ? rate : DEFAULT_RATE;
  return Math.min(1.5, Math.max(0.6, Math.round(value * 100) / 100));
}

export function parseVoicePrefs(raw: string | null | undefined): VoicePrefs {
  if (!raw) return { ...DEFAULT_VOICE_PREFS, voices: {} };
  try {
    const value = JSON.parse(raw) as Partial<VoicePrefs>;
    const voices: Partial<Record<VoiceLang, string>> = {};
    if (value.voices && typeof value.voices === "object") {
      for (const lang of LOCALES) {
        const name = (value.voices as Record<string, unknown>)[lang];
        if (typeof name === "string" && name.length > 0 && name.length < 200) voices[lang] = name;
      }
    }
    const stepWait = (STEP_WAIT_CHOICES as readonly unknown[]).includes(value.stepWait) ? (value.stepWait as StepWait) : 0;
    const tone = (VOICE_TONES as readonly unknown[]).includes(value.tone) ? (value.tone as VoiceTone) : DEFAULT_VOICE_TONE;
    return { rate: clampRate(value.rate), voices, stepWait, tone, volume: clampVoiceVolume(value.volume) };
  } catch {
    return { ...DEFAULT_VOICE_PREFS, voices: {} };
  }
}

export function serializeVoicePrefs(prefs: VoicePrefs): string {
  return JSON.stringify({ rate: clampRate(prefs.rate), voices: prefs.voices, stepWait: prefs.stepWait, tone: prefs.tone, volume: clampVoiceVolume(prefs.volume) });
}
