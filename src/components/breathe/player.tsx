"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { commitBreathe, saveBreatheSession, useBreathe } from "@/components/breathe/use-breathe";
import { ScalePicker } from "@/components/breathe/shared";
import { formatClock } from "@/components/companion/shared";
import { STOP_SIGNS } from "@/lib/breathe/content";
import { buildSession, focusFor, MIN_SAVED_SECONDS, PACES, PHASE_WORD, phaseAt, sessionSeconds, type SessionFocus } from "@/lib/breathe/program";
import { rateSession } from "@/lib/breathe/state";
import { localISODate } from "@/lib/dates";
import { useLocale, useT } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";

type Status = "ready" | "running" | "paused" | "finished" | "stopped";

/** Voices for each language. The device chooses the voice; English stays US English as before. */
const SPEECH_LANG: Record<string, string> = { en: "en-US", uk: "uk-UA", ru: "ru-RU", el: "el-GR" };

function speak(text: string, lang = "en-US") {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Spoken instructions are optional. The written ones are always shown.
  }
}

function hush() {
  try {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}

/** Scale for the breathing circle: grows on the in-breath, shrinks on the out-breath or hum. */
function circleScale(phase: string, progress: number): number {
  const small = 0.6;
  const big = 1;
  if (phase === "in") return small + (big - small) * progress;
  if (phase === "out" || phase === "hum") return big - (big - small) * progress;
  return 0.8;
}

export function BreathingPlayer() {
  const { ready, sample, breathe, breathless } = useBreathe();
  const t = useT();
  const { locale } = useLocale();
  const voiceLang = SPEECH_LANG[locale] ?? LOCALE_META[locale].htmlLang;
  const today = localISODate();
  const suggestedFocus = focusFor(breathe.challenge, today);
  const [focusOverride, setFocusOverride] = useState<SessionFocus | null>(null);
  const focus = focusOverride ?? suggestedFocus;
  const steps = useMemo(() => buildSession(breathe.length, breathe.pace, focus), [breathe.length, breathe.pace, focus]);
  const total = sessionSeconds(steps);

  const [status, setStatus] = useState<Status>("ready");
  const [elapsed, setElapsed] = useState(0);
  const [breathCues, setBreathCues] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [unwell, setUnwell] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const startedAt = useRef<number>(0);
  const banked = useRef<number>(0);
  const lastStep = useRef<number>(-1);
  const lastKey = useRef<number>(-1);

  const state = phaseAt(steps, elapsed);

  const save = useCallback(
    (seconds: number, complete: boolean) => {
      if (seconds < MIN_SAVED_SECONDS) {
        setNote(t("Sessions shorter than a minute are not saved. Any practice is still worthwhile."));
        return;
      }
      if (sample) {
        setNote(t("Sample data is on, so this session was not saved."));
        return;
      }
      const id = `b-${Date.now().toString(36)}`;
      const ok = saveBreatheSession({ id, date: localISODate(), seconds: Math.round(seconds), complete, feltAfter: null });
      if (ok) {
        setSavedId(id);
        setNote(complete ? t("Session saved. Well done.") : t("Saved as a partial session of {time}.", { time: formatClock(seconds) }));
      }
    },
    [sample, t],
  );

  // The clock. Elapsed time comes from timestamps, so a slow tab does not stretch the breaths.
  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      const now = banked.current + (performance.now() - startedAt.current) / 1000;
      setElapsed(now);
      if (now >= total) {
        window.clearInterval(timer);
        setElapsed(total);
        setStatus("finished");
        if (breathe.voice) speak(t("Your session is complete. Take a moment before you get up."), voiceLang);
        save(total, true);
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [status, total, breathe.voice, save, t, voiceLang]);

  // Spoken instructions on each new step, and optional short cues on each breath.
  useEffect(() => {
    if (status !== "running" || !state.step) return;
    if (state.stepIndex !== lastStep.current) {
      lastStep.current = state.stepIndex;
      lastKey.current = state.phaseKey;
      if (breathe.voice) speak(`${t(state.step.title)}. ${t(state.step.intro)}`, voiceLang);
      return;
    }
    if (state.phaseKey !== lastKey.current) {
      lastKey.current = state.phaseKey;
      if (breathe.voice && breathCues && state.phase !== "natural") speak(t(PHASE_WORD[state.phase]), voiceLang);
    }
  }, [status, state.stepIndex, state.phaseKey, state.phase, state.step, breathe.voice, breathCues, t, voiceLang]);

  useEffect(() => () => hush(), []);

  function start() {
    setElapsed(0);
    banked.current = 0;
    startedAt.current = performance.now();
    lastStep.current = -1;
    lastKey.current = -1;
    setSavedId(null);
    setUnwell(false);
    setNote(null);
    setStatus("running");
  }

  function pause() {
    banked.current = elapsed;
    hush();
    setStatus("paused");
  }

  function resume() {
    startedAt.current = performance.now();
    setStatus("running");
  }

  function stop(feelingUnwell: boolean) {
    hush();
    const seconds = status === "running" ? banked.current + (performance.now() - startedAt.current) / 1000 : elapsed;
    setStatus("stopped");
    setUnwell(feelingUnwell);
    save(seconds, false);
  }

  if (!ready) return <p className="hint">{t("Loading the breathing guide…")}</p>;

  const active = status === "running" || status === "paused";
  const progress = state.phaseLength > 0 ? Math.min(1, state.phaseElapsed / state.phaseLength) : 0;
  const scale = active ? circleScale(state.phase, progress) : 0.8;
  const secondsLeftInPhase = Math.max(1, Math.ceil(state.phaseLength - state.phaseElapsed));
  const savedSession = savedId ? breathe.sessions.find((item) => item.id === savedId) : null;

  return (
    <section className="card stack bf-player" aria-labelledby="bf-player-title">
      <h2 id="bf-player-title">{t("Guided breathing session")}</h2>

      {!active ? (
        <div className="stack">
          <p>
            {t("About {minutes} minutes: {steps}. You can stop at any time.", {
              minutes: Math.round(total / 60),
              steps: steps.map((step) => t(step.title).toLowerCase()).join(t(", then ")),
            })}
          </p>
          {suggestedFocus === "foundations" ? (
            <p className="alert">
              {t("Week 1 of your challenge: this session teaches nasal and belly breathing. Humming is added next week.")}{" "}
              <button className="btn btn-ghost" type="button" onClick={() => setFocusOverride(focus === "foundations" ? "complete" : "foundations")}>
                {focus === "foundations" ? t("Include humming anyway") : t("Use the week 1 session")}
              </button>
            </p>
          ) : null}
          {breathless ? (
            <p className="alert">
              {t("Your assessment mentions shortness of breath or a heart or chest concern. Use the gentle pace and the short session, and check with your clinician first.")}
            </p>
          ) : null}
          <fieldset className="field">
            <legend>{t("Session length")}</legend>
            <div className="lz-tabs">
              {(["full", "short"] as const).map((length) => (
                <button key={length} type="button" className="lz-tab" aria-pressed={breathe.length === length} disabled={sample} onClick={() => commitBreathe((s) => ({ ...s, length }))}>
                  {length === "full" ? t("About 9 minutes") : t("About 5 minutes")}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend>{t("Breathing pace")}</legend>
            <div className="lz-tabs">
              {(["gentle", "standard"] as const).map((pace) => (
                <button key={pace} type="button" className="lz-tab" aria-pressed={breathe.pace === pace} disabled={sample} onClick={() => commitBreathe((s) => ({ ...s, pace }))}>
                  {t(PACES[pace].label)}
                </button>
              ))}
            </div>
            <span className="hint">{t("Choose whatever feels easy. If a count feels long, use the gentle pace or simply breathe at your own rhythm.")}</span>
          </fieldset>
          <label className="check-row">
            <input type="checkbox" checked={breathe.voice} disabled={sample} onChange={(event) => commitBreathe((s) => ({ ...s, voice: event.target.checked }))} />
            <span>{t("Spoken instructions (uses your device's voice)")}</span>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={breathCues} disabled={!breathe.voice} onChange={(event) => setBreathCues(event.target.checked)} />
            <span>{t("Also say “breathe in” and “breathe out” on each breath")}</span>
          </label>
          <button className="btn btn-primary bf-big" type="button" onClick={start}>
            {status === "ready" ? t("Start Breathing Session") : t("Start a new session")}
          </button>
        </div>
      ) : null}

      {active && state.step ? (
        <div className="bf-stage">
          <p className="kicker">
            {t("Step {current} of {total} · {time} left in this step", { current: state.stepIndex + 1, total: steps.length, time: formatClock(state.stepRemaining) })}
          </p>
          <h3>{t(state.step.title)}</h3>
          <div className="bf-circle-wrap" aria-hidden="true">
            <div className="bf-circle" data-phase={state.phase} style={{ transform: `scale(${scale})` }}>
              {state.phase === "hum" ? <span className="bf-ripple" /> : null}
            </div>
          </div>
          <p className="bf-cue" aria-live="polite">
            {status === "paused" ? t("Paused. Breathe normally.") : t(PHASE_WORD[state.phase])}
            {status === "running" && state.phase !== "natural" ? <span className="bf-count"> {secondsLeftInPhase}</span> : null}
          </p>
          <div className="bf-bar" role="progressbar" aria-label={t("This breath")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <span style={{ width: `${progress * 100}%` }} data-phase={state.phase} />
          </div>
          <p>{t(state.step.intro)}</p>
          <ul className="hint">
            {state.step.cues.map((cue) => (
              <li key={cue}>{t(cue)}</li>
            ))}
          </ul>
          <p className="hint">{t("Session time left: {time}", { time: formatClock(state.totalRemaining) })}</p>
          <div className="lz-buttons">
            {status === "running" ? (
              <button className="btn btn-secondary bf-big" type="button" onClick={pause}>
                {t("Pause")}
              </button>
            ) : (
              <button className="btn btn-teal bf-big" type="button" onClick={resume}>
                {t("Continue")}
              </button>
            )}
            <button className="btn btn-primary bf-big" type="button" onClick={() => stop(false)}>
              {t("Stop")}
            </button>
            <button className="btn btn-ghost bf-big" type="button" onClick={() => stop(true)}>
              {t("I feel unwell. Stop now")}
            </button>
          </div>
        </div>
      ) : null}

      {unwell ? (
        <div className="alert alert-error" role="alert">
          <p>
            <strong>{t("You stopped, and that was the right thing to do.")}</strong> {t("Breathe normally and rest sitting down.")}
          </p>
          <p>{t(STOP_SIGNS)}</p>
        </div>
      ) : null}
      {note ? <p role="status">{note}</p> : null}
      {status === "finished" || (status === "stopped" && savedSession) ? (
        savedSession ? (
          <ScalePicker
            legend={t("How relaxed do you feel now? (1 not at all, 5 very relaxed)")}
            value={savedSession.feltAfter}
            onChange={(value) => commitBreathe((s) => rateSession(s, savedSession.id, value))}
          />
        ) : null
      ) : null}
    </section>
  );
}
