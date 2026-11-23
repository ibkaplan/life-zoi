"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/components/locale-provider";
import { downloadSize, NEURAL_VOICES } from "@/lib/voice/neural/catalog";
import { installNeural, neuralState, neuralSupported, removeNeural, serverNeuralState, setNeuralEnabled, subscribeNeural } from "@/lib/voice/neural/client";
import { LOCALES } from "@/lib/i18n/config";
import type { Translate } from "@/lib/i18n/translate";
import type { VoiceLang } from "@/lib/voice/voices";

function languageName(t: Translate, lang: VoiceLang): string {
  if (lang === "uk") return t("Ukrainian");
  if (lang === "ru") return t("Russian");
  if (lang === "el") return t("Greek");
  return t("English");
}

const subscribeNothing = () => () => undefined;

export function useNeuralState() {
  return useSyncExternalStore(subscribeNeural, neuralState, serverNeuralState);
}

function useNeuralSupport(): boolean | null {
  return useSyncExternalStore(subscribeNothing, neuralSupported, () => null);
}

/** Settings row: download, turn on or off, and remove the lifeZoi natural voice for one language. */
export function NaturalVoiceRow({ lang }: { lang: VoiceLang }) {
  const t = useT();
  const state = useNeuralState();
  const supported = useNeuralSupport();
  if (supported !== true) return null;
  const voice = NEURAL_VOICES[lang];
  const mine = state[lang];
  const installed = LOCALES.filter((item) => state[item].phase === "ready").length;
  const language = languageName(t, lang);

  return (
    <div className="natural-voice stack">
      <h4>{t("lifeZoi natural voice: {name}", { name: voice.name })}</h4>
      {mine.phase === "ready" ? (
        <>
          <label className="natural-voice-toggle">
            <input type="checkbox" checked={mine.enabled} onChange={(event) => setNeuralEnabled(lang, event.target.checked)} />
            {t("Use the natural voice for {language}", { language })}
          </label>
          <div className="voice-buttons">
            <button className="btn btn-secondary" type="button" onClick={() => void removeNeural(lang)}>
              {t("Remove from this device")}
            </button>
          </div>
        </>
      ) : mine.phase === "downloading" ? (
        <div className="stack">
          <progress max={100} value={Math.round(mine.progress * 100)} aria-label={t("Download progress")} />
          <p className="hint" role="status" aria-live="polite">
            {t("Downloading and checking the voice: {percent}%. You can keep using lifeZoi.", { percent: Math.round(mine.progress * 100) })}
          </p>
        </div>
      ) : mine.phase === "checking" ? null : (
        <>
          <p className="hint">
            {t("A free, more natural voice that runs on this device, so the words being read never leave it. It downloads about {size} MB once. Wi-Fi is best.", {
              size: downloadSize(lang, installed),
            })}
          </p>
          {mine.phase === "failed" ? (
            <p className="voice-note" role="alert">
              {t("The natural voice could not be downloaded or did not start on this device. lifeZoi keeps using the device voice.")}
            </p>
          ) : null}
          <div className="voice-buttons">
            <button className="btn btn-secondary" type="button" onClick={() => void installNeural(lang)}>
              {mine.phase === "failed" ? t("Try again") : t("Download natural voice")}
            </button>
          </div>
        </>
      )}
      <p className="hint">{t("Voice license: {license}.", { license: voice.license })}</p>
    </div>
  );
}

/** A note under a voice menu when the natural voice reads that language. */
export function NaturalVoiceNote({ lang }: { lang: VoiceLang }) {
  const t = useT();
  const state = useNeuralState();
  if (state[lang].phase !== "ready" || !state[lang].enabled) return null;
  return <p className="hint">{t("The lifeZoi natural voice {name} reads this language. The voice below is used only if it cannot start.", { name: NEURAL_VOICES[lang].name })}</p>;
}
