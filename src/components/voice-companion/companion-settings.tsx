"use client";

import { useEffect, useState } from "react";
import { useBackgroundMusic } from "@/components/background-music/provider";
import { useLocale, useT } from "@/components/locale-provider";
import { MicConsent } from "@/components/voice-companion/mic-consent";
import { statusLabel, useCompanionVoice } from "@/components/voice-companion/voice-companion";
import { useVoicePrefs, useVoiceState } from "@/components/voice/read-aloud";
import { companion, companionStatus } from "@/lib/companion-voice/runtime";
import { player, saveVoicePrefs } from "@/lib/voice/engine";
import { segmentsFromText, type VoicePrefs } from "@/lib/voice/voices";

type MicPermission = "granted" | "denied" | "prompt" | "unknown";

/** What the browser says about microphone permission for this site, where it tells. */
function useMicPermission(): MicPermission {
  const [value, setValue] = useState<MicPermission>("unknown");
  useEffect(() => {
    let status: PermissionStatus | null = null;
    const update = () => setValue(status ? (status.state as MicPermission) : "unknown");
    navigator.permissions
      ?.query({ name: "microphone" as PermissionName })
      .then((result) => {
        status = result;
        update();
        result.addEventListener("change", update);
      })
      .catch(() => undefined);
    return () => status?.removeEventListener("change", update);
  }, []);
  return value;
}

function Switch({ checked, disabled, onChange, label, hint }: { checked: boolean; disabled?: boolean; onChange: (value: boolean) => void; label: string; hint: string }) {
  return (
    <label className="vc-switch">
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span>
        {label}
        <span className="hint" style={{ display: "block", fontWeight: 400 }}>
          {hint}
        </span>
      </span>
    </label>
  );
}

/** Settings: every voice companion switch in one card. Saved in this browser only. */
export function CompanionSettingsSection() {
  const t = useT();
  const { locale } = useLocale();
  const state = useCompanionVoice();
  const voice = useVoiceState();
  const prefs = useVoicePrefs();
  const music = useBackgroundMusic();
  const permission = useMicPermission();
  const [asking, setAsking] = useState(false);
  const speaking = voice.owner === "voice-companion" && (voice.status === "playing" || voice.status === "waiting");
  const status = companionStatus(state, speaking);
  const micOn = state.prefs.mic !== "none";
  // The site-wide voice volume arrives with the guided-session player; show it once it exists.
  const volume = (prefs as VoicePrefs & { volume?: number }).volume;

  return (
    <section className="card stack vc-settings" id="voice-companion" aria-labelledby="vc-settings-title">
      <div className="vc-panel-head">
        <h2 id="vc-settings-title">{t("Voice Companion")}</h2>
        <span className="vc-pill" data-status={status} role="status">
          <span className="vc-dot" aria-hidden="true" /> {statusLabel(t, status)}
        </span>
      </div>
      <p>{t("LifeZoi can welcome you, listen when you allow it, and open pages when you ask. It uses the same LifeZoi voice as every Listen button. These choices are saved in this browser only.")}</p>

      <fieldset>
        <legend className="sr-only">{t("Voice Companion")}</legend>
        <Switch
          checked={state.prefs.autoWelcome}
          onChange={(value) => companion.savePrefs({ autoWelcome: value, setup: "done" })}
          label={t("Automatic welcome")}
          hint={t("LifeZoi tries to greet you once when you open it. If the browser keeps the page quiet, you get a one-tap button instead.")}
        />
        <Switch
          checked={state.prefs.voiceOutput}
          onChange={(value) => {
            companion.savePrefs({ voiceOutput: value });
            if (!value) player.stop("voice-companion");
          }}
          label={t("Voice output")}
          hint={t("LifeZoi speaks its replies. When this is off, replies are shown as text.")}
        />
        <Switch
          checked={state.prefs.navigation}
          onChange={(value) => companion.savePrefs({ navigation: value })}
          label={t("Voice navigation")}
          hint={t("Spoken commands such as “Open My Day” or “Start Pilates” open the page or activity.")}
        />
        <Switch
          checked={state.prefs.handsFree}
          disabled={!micOn || !state.recognitionSupported}
          onChange={(value) => companion.setHandsFree(value)}
          label={t("Hands-free conversation")}
          hint={micOn ? t("LifeZoi listens again after each reply while this page is open, without pressing a button.") : t("Turn on the microphone first.")}
        />
        <Switch
          checked={music.prefs.underSessions}
          onChange={(value) => music.setUnderSessions(value)}
          label={t("Background music during guided activities")}
          hint={t("When on, your music keeps playing quietly while LifeZoi speaks. When off, it pauses until the voice stops.")}
        />
      </fieldset>

      <div className="stack">
        <h3>{t("Microphone")}</h3>
        <p>
          {!state.recognitionSupported
            ? t("Speaking to LifeZoi is not available in this browser. Chrome, Edge, and Safari support it. LifeZoi can still speak to you.")
            : micOn
              ? state.listening
                ? t("On: LifeZoi is listening right now.")
                : t("Enabled: LifeZoi listens only while the button shows Listening.")
              : t("Off. LifeZoi is not listening.")}{" "}
          {permission === "denied" ? t("The browser is blocking the microphone for this site. Allow it in the site settings next to the address bar.") : null}
        </p>
        {asking ? (
          <MicConsent
            lang={locale}
            onChoose={(choice) => {
              setAsking(false);
              if (choice !== "none") {
                companion.setMic(choice);
                companion.talk();
              }
            }}
          />
        ) : state.recognitionSupported ? (
          <div className="actions">
            {micOn ? (
              <button type="button" className="btn btn-secondary" onClick={() => companion.setMic("none")}>
                {t("Disable microphone")}
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => setAsking(true)}>
                {t("Enable microphone")}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <label className="vc-range">
        {t("Voice speed")}: {prefs.rate.toFixed(2)}×
        <input type="range" min={0.6} max={1.5} step={0.05} value={prefs.rate} onChange={(event) => saveVoicePrefs({ rate: Number(event.target.value) })} />
      </label>
      {typeof volume === "number" ? (
        <label className="vc-range">
          {t("Voice volume")}: {Math.round(volume * 100)}%
          <input type="range" min={0.2} max={1} step={0.05} value={volume} onChange={(event) => saveVoicePrefs({ volume: Number(event.target.value) } as Partial<VoicePrefs>)} />
        </label>
      ) : (
        <p className="hint">{t("Voice volume follows your device's volume buttons.")}</p>
      )}
      <div className="actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => player.play("voice-companion", segmentsFromText(t("Hello, I'm LifeZoi. It's lovely to hear you. Shall we plan your day together?"), locale), { stepWait: 0 })}
        >
          {t("Try the LifeZoi voice")}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => companion.savePrefs({ setup: "new" })}>
          {t("Show the welcome panel again")}
        </button>
      </div>

      <details>
        <summary>{t("What is free, and where your voice goes")}</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">{t("Feature")}</th>
              <th scope="col">{t("Cost")}</th>
              <th scope="col">{t("Where it runs")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t("LifeZoi speaking (welcome, replies)")}</td>
              <td>{t("Free")}</td>
              <td>{t("Your device's voices, or the free LifeZoi natural voice made on your device.")}</td>
            </tr>
            <tr>
              <td>{t("Understanding what you say")}</td>
              <td>{t("Free")}</td>
              <td>{t("Your browser's speech recognition. Some browsers send the audio to their maker's speech service (Google for Chrome, Apple for Safari).")}</td>
            </tr>
            <tr>
              <td>{t("Voice commands and navigation")}</td>
              <td>{t("Free")}</td>
              <td>{t("Matched inside your browser. Nothing is sent to LifeZoi or an AI service.")}</td>
            </tr>
            <tr>
              <td>{t("Open health questions")}</td>
              <td>{t("Free, with limits")}</td>
              <td>{t("LifeZoi opens LifeZoi AI with your question typed in, and nothing is sent until you tap Ask. When LifeZoi AI uses its free AI model, that service has daily limits, so unlimited answers are not promised.")}</td>
            </tr>
          </tbody>
        </table>
        <p className="hint">{t("LifeZoi does not record or store your voice, and does not save what you say to the companion. The microphone stops when you leave the page, hide the tab, or choose Microphone off.")}</p>
      </details>
    </section>
  );
}
