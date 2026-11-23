import type { VoiceLang } from "@/lib/voice/voices";

/**
 * The lifeZoi natural voices: free Piper voices that run inside the browser.
 * One female voice per language, chosen for a calm reading style and an open
 * license. The words being read never leave the device. Only the voice file is
 * downloaded, once, when the person asks for it in Settings.
 */

export type NeuralVoice = {
  key: string;
  lang: VoiceLang;
  /** The speaker's name, shown in Settings. */
  name: string;
  /** Approximate download, in megabytes, including the shared pronunciation data the first time. */
  downloadMb: number;
  model: string;
  config: string;
  /** Speaker number for voices trained on several people. */
  speaker?: number;
  /** License of the recordings the voice was trained on, as its model card states it. */
  license: string;
};

const HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main";

function files(path: string) {
  return { model: `${HF}/${path}.onnx`, config: `${HF}/${path}.onnx.json` };
}

/** Shared by every voice: the pronunciation rules (eSpeak NG data), about 19 MB, downloaded with the first voice. */
export const SHARED_DOWNLOAD_MB = 19;

export const NEURAL_VOICES: Record<VoiceLang, NeuralVoice> = {
  en: { key: "en_US-kristin-medium", lang: "en", name: "Kristin", downloadMb: 64, license: "public domain (LibriVox recordings)", ...files("en/en_US/kristin/medium/en_US-kristin-medium") },
  ru: { key: "ru_RU-irina-medium", lang: "ru", name: "Irina", downloadMb: 63, license: "RHVoice recordings, license not stated by the model card", ...files("ru/ru_RU/irina/medium/ru_RU-irina-medium") },
  uk: { key: "uk_UA-lada-x_low", lang: "uk", name: "Lada", downloadMb: 21, license: "Apache 2.0", ...files("uk/uk_UA/lada/x_low/uk_UA-lada-x_low") },
  el: { key: "el_GR-rapunzelina-low", lang: "el", name: "Rapunzelina", downloadMb: 63, license: "CC0", ...files("el/el_GR/rapunzelina/low/el_GR-rapunzelina-low") },
};

/** Megabytes to download for `lang`, counting the shared data when no natural voice is installed yet. */
export function downloadSize(lang: VoiceLang, installedCount: number): number {
  return NEURAL_VOICES[lang].downloadMb + (installedCount === 0 ? SHARED_DOWNLOAD_MB : 0);
}

/**
 * Piper sets speed with a length scale: larger is slower. lifeZoi's speed is a
 * rate where 1 is usual, so the scale is its inverse, kept in a calm range.
 */
export function lengthScaleFor(rate: number): number {
  const safe = Number.isFinite(rate) && rate > 0 ? rate : 1;
  return Math.round(Math.min(1.6, Math.max(0.65, 1 / safe)) * 100) / 100;
}

/** Natural voices the person turned on, saved in this browser only. */
export const NEURAL_STORAGE_KEY = "lifezoi.voice.natural.v1";

export function parseNeuralChoice(raw: string | null | undefined): Partial<Record<VoiceLang, boolean>> {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const out: Partial<Record<VoiceLang, boolean>> = {};
    for (const lang of Object.keys(NEURAL_VOICES) as VoiceLang[]) if (value[lang] === true) out[lang] = true;
    return out;
  } catch {
    return {};
  }
}

/** Mono 32-bit float samples to a short fade at both ends, so sentences start and stop without a click. */
export function softenEdges(pcm: Float32Array, sampleRate: number): Float32Array {
  const fade = Math.min(Math.floor(sampleRate * 0.008), Math.floor(pcm.length / 2));
  for (let index = 0; index < fade; index += 1) {
    const gain = index / fade;
    pcm[index] *= gain;
    pcm[pcm.length - 1 - index] *= gain;
  }
  return pcm;
}
