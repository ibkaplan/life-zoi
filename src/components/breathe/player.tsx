"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { commitBreathe, saveBreatheSession, useBreathe } from "@/components/breathe/use-breathe";
import { ScalePicker } from "@/components/breathe/shared";
import { formatClock } from "@/components/companion/shared";
import { STOP_SIGNS } from "@/lib/breathe/content";
import { buildSession, focusFor, LENGTH_LABEL, MIN_SAVED_SECONDS, PACES, phaseAt, sessionSeconds, type SessionFocus } from "@/lib/breathe/program";
import { rateSession } from "@/lib/breathe/state";
import { localISODate } from "@/lib/dates";
import { useAudioFocus } from "@/components/background-music/use-audio-focus";
import { useLocale } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { VoiceChoices, useVoicePrefs } from "@/components/voice/read-aloud";
import type { Locale } from "@/lib/i18n/config";
import { player } from "@/lib/voice/engine";
import { segmentsFromText } from "@/lib/voice/voices";

type Status = "ready" | "running" | "paused" | "finished" | "stopped";

const VOICE_OWNER = "breathing-guide";

/** Spoken instructions go through the shared read-aloud player, so they use the best voice and never overlap. */
function speak(text: string, locale: Locale) {
  try {
    player.play(VOICE_OWNER, segmentsFromText(text, locale), { rateFactor: 0.9, stepWait: 0 });
  } catch {
    // Spoken instructions are optional. The written ones are always shown.
  }
}

function hush() {
  player.stop(VOICE_OWNER);
}

const SMALL = 0.55;
const BIG = 1;
const REST = 0.75;

/** Slow at both ends, like a real breath, so the ball never starts or stops with a jolt. */
function ease(progress: number): number {
  return 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, progress)));
}

/** Size of the breathing ball: grows through the in-breath, shrinks through the out-breath or hum. */
export function ballScale(phase: string, progress: number, phaseElapsed: number): number {
  if (phase === "in") return SMALL + (BIG - SMALL) * ease(progress);
  if (phase === "out" || phase === "hum") return BIG - (BIG - SMALL) * ease(progress);
  // Normal breathing: settle to a resting size, then float very slightly.
  const settle = SMALL + (REST - SMALL) * ease(phaseElapsed / 4);
  return settle + 0.03 * Math.sin((phaseElapsed / 8) * 2 * Math.PI) * ease(phaseElapsed / 4);
}

/** What the guide says as each breath begins. Short, so the counting that follows stays on the beat. */
const CUE: Record<string, string> = { in: msg("Breathe in"), out: msg("Breathe out"), hum: msg("Hum softly") };
const SHOWN_CUE: Record<string, string> = { in: msg("Breathe in slowly"), out: msg("Now breathe out gently"), hum: msg("Hum softly"), natural: msg("Breathe naturally") };
const NUMBER = ["", msg("One"), msg("Two"), msg("Three"), msg("Four"), msg("Five"), msg("Six"), msg("Seven"), msg("Eight"), msg("Nine"), msg("Ten")];

export function BreathingPlayer() {
  const { ready, sample, breathe, breathless } = useBreathe();
  const { locale, t } = useLocale();
  const voicePrefs = useVoicePrefs();
  const today = localISODate();
  const suggestedFocus = focusFor(breathe.challenge, today);
  const [focusOverride, setFocusOverride] = useState<SessionFocus | null>(null);
  const focus = focusOverride ?? suggestedFocus;
  const steps = useMemo(() => buildSession(breathe.length, breathe.pace, focus), [breathe.length, breathe.pace, focus]);
  const total = sessionSeconds(steps);

  const [status, setStatus] = useState<Status>("ready");
  // Background music pauses for the whole guided session, spoken cues or not.
  useAudioFocus(status === "running" || status === "paused", "guided-breathing");
  const [elapsed, setElapsed] = useState(0);
  const [breathCues, setBreathCues] = useState(true);
  const [countAloud, setCountAloud] = useState(true);
  const ballRef = useRef<HTMLDivElement>(null);
  const introSpeaking = useRef(false);
  const lastBeat = useRef("");
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
    [sample],
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
        if (breathe.voice) speak(t("Your session is complete. Take a moment before you get up."), locale);
        save(total, true);
      }
    }, 200);
    return () => window.clearInterval(timer);
  }, [status, total, breathe.voice, save, locale]);

  // The number shown in the ball: 1, 2, 3, 4 while breathing in, 1 to 6 while breathing out.
  const beat = state.phase === "natural" || !state.step ? 0 : Math.min(Math.max(1, Math.round(state.phaseLength)), Math.floor(state.phaseElapsed) + 1);

  // Spoken guidance, on the same clock as the ball and the count: the step's instruction when it
  // begins, then "Breathe in" on the first second of each breath and the count on the others.
  useEffect(() => {
    if (status !== "running" || !state.step) return;
    if (state.stepIndex !== lastStep.current) {
      lastStep.current = state.stepIndex;
      lastKey.current = state.phaseKey;
      lastBeat.current = `${state.phaseKey}:${beat}`;
      if (breathe.voice) {
        introSpeaking.current = true;
        speak(`${t(state.step.title)}. ${t(state.step.intro)}`, locale);
      }
      return;
    }
    const key = `${state.phaseKey}:${beat}`;
    if (key === lastBeat.current) return;
    lastBeat.current = key;
    lastKey.current = state.phaseKey;
    if (!breathe.voice || beat === 0) return;
    // Let the step's instruction finish; the ball and the numbers carry on meanwhile.
    if (introSpeaking.current) {
      const voice = player.state();
      if (voice.owner === VOICE_OWNER && voice.status === "playing") return;
      // Join in at the start of the next breath, not in the middle of a count.
      if (beat !== 1) return;
      introSpeaking.current = false;
    }
    if (beat === 1 && breathCues) speak(t(CUE[state.phase] ?? ""), locale);
    else if (countAloud) speak(NUMBER[beat] ? t(NUMBER[beat]) : String(beat), locale);
  }, [status, state.stepIndex, state.phaseKey, state.phase, state.step, beat, breathe.voice, breathCues, countAloud, locale]);

  // Bring the ball into view when a session starts, so the person can follow it without scrolling.
  useEffect(() => {
    if (status !== "running" || elapsed > 0.5) return;
    ballRef.current?.closest(".bf-stage")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [status, elapsed]);

  // The ball moves on every screen frame from the same clock as the timer, so it is smooth and in step.
  useEffect(() => {
    if (status !== "running" && status !== "paused") return;
    let frame = 0;
    const draw = () => {
      const now = status === "running" ? banked.current + (performance.now() - startedAt.current) / 1000 : banked.current;
      const at = phaseAt(steps, Math.min(now, total));
      const progress = at.phaseLength > 0 ? at.phaseElapsed / at.phaseLength : 0;
      if (ballRef.current) ballRef.current.style.transform = `scale(${ballScale(at.phase, progress, at.phaseElapsed).toFixed(4)})`;
      if (status === "running") frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [status, steps, total]);

  useEffect(() => () => hush(), []);

  function start() {
    setElapsed(0);
    banked.current = 0;
    startedAt.current = performance.now();
    lastStep.current = -1;
    lastKey.current = -1;
    lastBeat.current = "";
    introSpeaking.current = false;
    hush();
    setSavedId(null);
    setUnwell(false);
    setNote(null);
    setStatus("running");
  }

  function pause() {
    // Exact time, so the ball stays where it is instead of jumping back.
    banked.current = banked.current + (performance.now() - startedAt.current) / 1000;
    setElapsed(banked.current);
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
          {breathless ? <p className="alert">{t("Your assessment mentions shortness of breath or a heart or chest concern. Use the gentle pace and the short session, and check with your clinician first.")}</p> : null}
          <fieldset className="field">
            <legend>{t("Session length")}</legend>
            <div className="lz-tabs">
              {(["quick", "short", "full"] as const).map((length) => (
                <button key={length} type="button" className="lz-tab" aria-pressed={breathe.length === length} disabled={sample} onClick={() => commitBreathe((s) => ({ ...s, length }))}>
                  {t(LENGTH_LABEL[length])}
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
            <span>{t("Say “breathe in” and “breathe out” as each breath begins")}</span>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={countAloud} disabled={!breathe.voice} onChange={(event) => setCountAloud(event.target.checked)} />
            <span>{t("Count the seconds aloud, in time with the ball")}</span>
          </label>
          {breathe.voice ? (
            <details className="voice-options">
              <summary>{t("Voice and speed")}</summary>
              <VoiceChoices lang={locale} steps={false} rate={voicePrefs.rate} stepWait={voicePrefs.stepWait} />
            </details>
          ) : null}
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
          <div className="bf-ball-wrap" aria-hidden="true">
            <div ref={ballRef} className="bf-ball" data-phase={state.phase}>
              {state.phase === "hum" && status === "running" ? <span className="bf-ripple" /> : null}
            </div>
            {beat > 0 ? (
              <span key={`${state.phaseKey}-${beat}`} className="bf-ball-count">
                {beat}
              </span>
            ) : null}
          </div>
          <p className="bf-cue" aria-live="polite">
            {status === "paused" ? t("Paused. Breathe normally.") : t(SHOWN_CUE[state.phase] ?? "")}
          </p>
          {beat > 0 && status === "running" ? (
            <p className="bf-beat" aria-hidden="true">
              {Array.from({ length: Math.round(state.phaseLength) }, (_, index) => (
                <span key={index} data-on={index < beat}>
                  {index + 1}
                </span>
              ))}
            </p>
          ) : null}
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
                {t("Resume")}
              </button>
            )}
            <button className="btn btn-primary bf-big" type="button" onClick={() => stop(false)}>
              {t("Stop")}
            </button>
            <button className="btn btn-secondary bf-big" type="button" onClick={start}>
              {t("Restart")}
            </button>
            {breathe.voice ? (
              <button
                className="btn btn-secondary bf-big"
                type="button"
                onClick={() => {
                  introSpeaking.current = true;
                  speak(`${t(state.step!.title)}. ${t(state.step!.intro)}`, locale);
                }}
              >
                {t("Repeat the instruction")}
              </button>
            ) : null}
            <button className="btn btn-ghost bf-big" type="button" onClick={() => stop(true)}>
              {t("I feel dizzy or unwell. Stop now")}
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
