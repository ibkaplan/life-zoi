/**
 * Read-aloud for Find My Movement cards, with the browser's own speech voices.
 * Nothing is sent to a server. This is the hook the planned LifeZoi natural
 * voice assistant can replace: give `speakGuide` a different speaker.
 */

import { readVoicePrefs } from "@/lib/voice/engine";
import { chooseVoice, DEFAULT_VOICE_TONE, voiceLanguage, type VoiceTone } from "@/lib/voice/voices";

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

function savedChoice(lang: string): { voice?: string; tone: VoiceTone } {
  const base = voiceLanguage({ lang });
  const prefs = readVoicePrefs();
  return { voice: base ? prefs.voices[base] : undefined, tone: prefs.tone };
}

export function guideSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof window.speechSynthesis?.speak === "function";
}

/** Speaks `text` in `lang`. Returns false when the browser cannot speak, so the page can say so. */
export function speakGuide(text: string, lang: string, onEnd?: () => void): boolean {
  if (!guideSpeechSupported()) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  const voice = pickGuideVoice(synth.getVoices(), lang, savedChoice(lang));
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  synth.speak(utterance);
  return true;
}

export function stopGuide() {
  if (guideSpeechSupported()) window.speechSynthesis.cancel();
}
