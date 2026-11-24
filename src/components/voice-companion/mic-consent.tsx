"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/locale-provider";
import type { MicChoice } from "@/lib/companion-voice/prefs";
import { microphoneBlockedBySite, onDeviceRecognition } from "@/lib/mind/speech";
import { SPEECH_TAG, type VoiceLang } from "@/lib/voice/voices";

/**
 * Asked once before LifeZoi's companion or LifeZoi AI first uses the microphone.
 * It says plainly where speech is turned into text, and offers on-device recognition
 * when the browser reports it.
 */
export function MicConsent({ lang, onChoose }: { lang: VoiceLang; onChoose: (choice: MicChoice) => void }) {
  const t = useT();
  const [local, setLocal] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    void onDeviceRecognition(SPEECH_TAG[lang]).then((result) => {
      if (live) setLocal(result === "available");
    });
    return () => {
      live = false;
    };
  }, [lang]);

  if (microphoneBlockedBySite()) {
    return (
      <div className="vc-consent stack" role="group" aria-label={t("Before you use the microphone")}>
        <p>{t("LifeZoi itself is blocking the microphone on this page, so your browser setting can't help. This is a problem on our side, not yours. Please type for now and let us know.")}</p>
        <button type="button" className="btn btn-ghost" onClick={() => onChoose("none")}>
          {t("Close")}
        </button>
      </div>
    );
  }

  return (
    <div className="vc-consent stack" role="group" aria-labelledby="vc-consent-title">
      <h3 id="vc-consent-title">{t("Before you use the microphone")}</h3>
      <p>
        {t(
          "LifeZoi uses your browser's built-in speech recognition, which is free. LifeZoi does not record or store your voice, and the words are matched to commands inside your browser. But depending on your browser, the sound of your voice may be sent to the browser maker's speech service to be turned into text (for example Google for Chrome, or Apple for Safari), under their privacy terms.",
        )}
      </p>
      {local ? (
        <p>{t("Good news: this browser can turn speech into text on your device, so your voice does not have to leave it.")}</p>
      ) : local === false ? (
        <p>{t("This browser did not report on-device speech recognition, so it may send your audio to its speech service.")}</p>
      ) : null}
      <p className="hint">{t("Your browser will ask for permission to use the microphone. You can turn it off at any time with Microphone off.")}</p>
      <div className="actions">
        {local ? (
          <button type="button" className="btn btn-primary" onClick={() => onChoose("local")}>
            {t("Use on-device recognition only")}
          </button>
        ) : null}
        <button type="button" className={local ? "btn btn-secondary" : "btn btn-primary"} onClick={() => onChoose("browser")}>
          {local ? t("Let the browser decide") : t("I understand, use the microphone")}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onChoose("none")}>
          {t("Not now")}
        </button>
      </div>
    </div>
  );
}
