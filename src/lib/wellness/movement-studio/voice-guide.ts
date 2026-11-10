/**
 * Read-aloud for Find My Movement cards, with the browser's own speech voices.
 * Nothing is sent to a server. This is the hook the planned LifeZoi natural
 * voice assistant can replace: give `speakGuide` a different speaker.
 */

export type GuideVoice = { name: string; lang: string };

/** Voice names that browsers use for their more natural voices. */
const NATURAL_HINT = /natural|neural|premium|enhanced|online|google/i;

/** The best voice for a language: same language first, then a more natural one. Null when none speaks it. */
export function pickGuideVoice<V extends GuideVoice>(voices: readonly V[], lang: string): V | null {
  const base = lang.toLowerCase().split(/[-_]/)[0] ?? "";
  const same = voices.filter((voice) => voice.lang.toLowerCase().split(/[-_]/)[0] === base);
  if (same.length === 0) return null;
  return same.find((voice) => NATURAL_HINT.test(voice.name)) ?? same[0] ?? null;
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
  const voice = pickGuideVoice(synth.getVoices(), lang);
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
