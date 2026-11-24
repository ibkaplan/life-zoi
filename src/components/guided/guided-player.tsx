"use client";

import "@/components/guided/guided.css";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { CategorySelect, MusicOnOffSwitch, MusicVolume } from "@/components/background-music/controls";
import { isSounding, useBackgroundMusic } from "@/components/background-music/provider";
import { useLocale } from "@/components/locale-provider";
import { languageName, useVoicePrefs, VoiceChoices } from "@/components/voice/read-aloud";
import type { SaveResult } from "@/components/guided/guided-provider";
import { KIND_ICON, KIND_LABEL, NOT_MEDICAL } from "@/lib/guided/catalog";
import type { GuidedController } from "@/lib/guided/controller";
import { clockText } from "@/lib/guided/timeline";
import type { GuidedSession } from "@/lib/guided/types";
import { saveVoicePrefs } from "@/lib/voice/engine";
import { VOICE_TONES, type VoiceTone } from "@/lib/voice/voices";

const noop = () => () => undefined;

function useController(controller: GuidedController) {
  return useSyncExternalStore(controller.subscribe, controller.state, controller.state);
}

/** Re-renders a few times a second while the session plays, for the progress bar and countdown. */
function useTick(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [active]);
  return now;
}

/**
 * The guided-session player: one look for every activity. Large Play, Pause,
 * Resume, Stop, and Restart buttons, the current step in big type, progress
 * with time left, and the voice and music settings in one place.
 */
export function GuidedPlayer({
  session,
  controller,
  saved,
  silent,
  onClose,
}: {
  session: GuidedSession;
  controller: GuidedController;
  saved: SaveResult;
  silent: "unsupported" | "no-voice" | null;
  onClose: () => void;
}) {
  const { t, locale } = useLocale();
  const state = useController(controller);
  const prefs = useVoicePrefs();
  const music = useBackgroundMusic();
  const now = useTick(state.status === "playing");
  const titleId = useId();
  const volumeId = useId();
  const toneId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  // Focus moves into the player when it opens, and Escape closes it.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const total = controller.total();
  const elapsed = Math.min(total, controller.elapsed(now));
  const remaining = Math.max(0, total - elapsed);
  const percent = total > 0 ? Math.round((elapsed / total) * 100) : 0;
  const stepIndex = state.status === "finished" ? session.steps.length - 1 : (beatStep(controller, session, state.index) ?? 0);
  const step = session.steps[stepIndex];
  const cue = state.status === "idle" ? null : session.steps[stepIndex]?.cues[cueIndex(session, state.index)];
  const holdLeft =
    state.phase === "holding"
      ? state.status === "paused"
        ? (state.holdLeft ?? 0)
        : Math.max(0, ((state.holdUntil ?? now) - now) / 1000)
      : null;
  const musicOn = isSounding(music.status) || music.status === "held";

  const statusLine =
    state.status === "idle"
      ? t("Press Play and the instructor will guide you. You can put your phone down and listen.")
      : state.status === "paused"
        ? state.interruption === "blocked"
          ? t("The browser needs a tap before the voice can speak. Press Resume.")
          : state.interruption
            ? t("Paused, because another sound started. Press Resume to continue from this step.")
            : t("Paused. Resume continues from this step.")
        : state.status === "finished"
          ? t(session.complete)
          : holdLeft !== null && holdLeft > 2
            ? step?.rest
              ? t("Resting… {seconds} seconds", { seconds: Math.ceil(holdLeft) })
              : t("Your time… {seconds} seconds", { seconds: Math.ceil(holdLeft) })
            : t("The instructor is speaking.");

  return (
    <div className="gs-backdrop" role="presentation">
      <div className="gs-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef}>
        <header className="gs-head">
          <p className="gs-kind">
            <span aria-hidden="true">{KIND_ICON[session.kind]} </span>
            {t(KIND_LABEL[session.kind])} · {t("{minutes} min", { minutes: session.minutes })} · {t(session.position)}
          </p>
          <h2 id={titleId}>{t(session.title)}</h2>
          <button type="button" className="gs-close" onClick={onClose} aria-label={t("Close the guided session")}>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="gs-now" aria-live="off">
          {state.status === "finished" ? (
            <>
              <p className="gs-step">{t("Session complete")}</p>
              <p className="gs-cue gs-done">
                <span aria-hidden="true">🌟 </span>
                {t(session.complete)}
              </p>
              {saved === "saved" ? <p className="gs-saved">{t("Saved to your activity history.")}</p> : null}
              {saved === "sample" ? <p className="gs-saved">{t("Sample data is on, so this session was not saved.")}</p> : null}
            </>
          ) : state.status === "idle" ? (
            <>
              <p className="gs-step">{t(session.summary)}</p>
              <p className="gs-care" role="note">
                {t(session.care)}
              </p>
            </>
          ) : (
            <>
              <p className="gs-step">
                {t("Step {step} of {steps}: {title}", { step: stepIndex + 1, steps: session.steps.length, title: t(step?.title ?? "") })}
              </p>
              <p className="gs-cue">{cue ? t(cue.say) : ""}</p>
            </>
          )}
        </div>

        <div className="gs-progress">
          <div
            className="gs-bar"
            role="progressbar"
            aria-label={t("Session progress")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={t("{remaining} left of {total}", { remaining: clockText(remaining), total: clockText(total) })}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
          <p className="gs-times">
            <span>{clockText(elapsed)}</span>
            <span>{t("{remaining} left", { remaining: clockText(remaining) })}</span>
            <span>{t("Total {total}", { total: clockText(total) })}</span>
          </p>
        </div>

        <p className="gs-status" role="status" aria-live="polite">
          {statusLine}
        </p>
        {silent ? (
          <p className="gs-note" role="alert">
            {silent === "no-voice"
              ? t("This device has no {language} voice, so the steps are shown on screen and timed without a voice. You can add a voice in your device's speech settings.", {
                  language: languageName(t, locale),
                })
              : t("This browser cannot speak, so the steps are shown on screen and timed without a voice.")}
          </p>
        ) : null}

        <div className="gs-controls" role="group" aria-label={t("Session controls")}>
          {state.status === "playing" ? (
            <button type="button" className="btn gs-main" onClick={() => controller.pause()}>
              <span aria-hidden="true">❚❚ </span>
              {t("Pause")}
            </button>
          ) : state.status === "paused" ? (
            <button type="button" className="btn gs-main" onClick={() => controller.resume()}>
              <span aria-hidden="true">▶ </span>
              {t("Resume")}
            </button>
          ) : (
            <button type="button" className="btn gs-main" disabled={!hydrated} onClick={() => (state.status === "finished" ? controller.restart() : controller.play())}>
              <span aria-hidden="true">▶ </span>
              {state.status === "finished" ? t("Play again") : t("Play")}
            </button>
          )}
          <div className="gs-secondary">
            <button type="button" className="btn btn-secondary" onClick={() => controller.skip(-1)} disabled={state.status === "idle" || state.status === "finished"}>
              <span aria-hidden="true">⏮ </span>
              {t("Previous step")}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => controller.skip(1)} disabled={state.status === "idle" || state.status === "finished"}>
              {t("Next step")}
              <span aria-hidden="true"> ⏭</span>
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => controller.restart()} disabled={state.status === "idle"}>
              <span aria-hidden="true">↺ </span>
              {t("Restart")}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => controller.stop()} disabled={state.status === "idle"}>
              <span aria-hidden="true">■ </span>
              {t("Stop")}
            </button>
          </div>
        </div>

        <details className="gs-settings">
          <summary>{t("Voice and music")}</summary>
          <div className="gs-settings-grid">
            <section className="stack" aria-label={t("Instructor voice")}>
              <h3>{t("Instructor voice")}</h3>
              <label className="field" htmlFor={volumeId}>
                <span>
                  {t("Voice volume")} <span className="hint">{Math.round(prefs.volume * 100)}%</span>
                </span>
                <input id={volumeId} type="range" min={0.2} max={1} step={0.05} value={prefs.volume} onChange={(event) => saveVoicePrefs({ volume: Number(event.target.value) })} />
              </label>
              <label className="field" htmlFor={toneId}>
                <span>{t("Voice type")}</span>
                <select id={toneId} value={prefs.tone} onChange={(event) => saveVoicePrefs({ tone: event.target.value as VoiceTone })}>
                  {VOICE_TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone === "soft" ? t("Soft female voice (recommended)") : tone === "deep" ? t("Male voice") : t("Any voice, most natural first")}
                    </option>
                  ))}
                </select>
              </label>
              <VoiceChoices lang={locale} steps={false} rate={prefs.rate} stepWait={prefs.stepWait} />
              <p className="hint">{t("Changes apply from the next sentence. Some phones, such as iPhone, keep the voice at full volume; use the music volume to balance them.")}</p>
            </section>
            <section className="stack" aria-label={t("Background music")}>
              <h3>{t("Background music")}</h3>
              <MusicOnOffSwitch />
              {musicOn ? (
                <>
                  <CategorySelect />
                  <MusicVolume />
                  <MusicVolume session />
                </>
              ) : null}
              <p className="hint">{t("Music gets quieter by itself while the instructor speaks, and comes back up during the quiet parts.")}</p>
            </section>
          </div>
        </details>

        <p className="gs-medical">{t(NOT_MEDICAL)}</p>
      </div>
    </div>
  );
}

function beatStep(_controller: GuidedController, session: GuidedSession, index: number): number | null {
  let count = 0;
  for (let at = 0; at < session.steps.length; at += 1) {
    const cues = session.steps[at]?.cues.length ?? 0;
    if (index < count + cues) return at;
    count += cues;
  }
  return null;
}

function cueIndex(session: GuidedSession, index: number): number {
  let count = 0;
  for (const step of session.steps) {
    if (index < count + step.cues.length) return index - count;
    count += step.cues.length;
  }
  return 0;
}
