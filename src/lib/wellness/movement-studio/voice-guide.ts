/**
 * Read-aloud for Find My Movement cards. It now speaks through the shared
 * LifeZoi voice (src/lib/voice/engine.ts), like every other Listen button.
 * Nothing is sent to a server.
 */

import { player } from "@/lib/voice/engine";
import { chooseVoice, DEFAULT_VOICE_TONE, segmentsFromText, voiceLanguage, type VoiceTone } from "@/lib/voice/voices";

export type GuideVoice = { name: string; lang: string };

/**
 * The best voice for a language, ranked like every other Listen button: the
 * person's saved voice, then the chosen voice type (soft female by default),
 * then the more natural voices. Null when no voice speaks the language.
 */
export function pickGuideVoice<V extends GuideVoice>(
  voices: readonly V[],
  lang: string,
  saved?: { voice?: string | null; tone?: VoiceTone },
): V | null {
  const base = voiceLanguage({ lang });
  if (!base) return null;
  return chooseVoice(voices, base, saved?.voice, saved?.tone ?? DEFAULT_VOICE_TONE);
}


export function guideSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.speechSynthesis?.speak === "function";
}

const GUIDE_OWNER = "find-my-movement";

/**
 * Speaks `text` in `lang` with the LifeZoi voice: the shared read-aloud player,
 * so it uses the saved voice, speed, volume, and natural voice, and never
 * talks over another Listen button or a guided session.
 * Returns false when the browser cannot speak, so the page can say so.
 */
export function speakGuide(text: string, lang: string, onEnd?: () => void): boolean {
  if (!guideSpeechSupported()) return false;
  const base = voiceLanguage({ lang }) ?? "en";
  player.play(GUIDE_OWNER, segmentsFromText(text, base), { stepWait: 0, rateFactor: 0.95, onEnd: () => onEnd?.() });
  return true;
}

export function stopGuide() {
  player.stop(GUIDE_OWNER);
}
