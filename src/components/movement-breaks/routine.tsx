"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { player } from "@/lib/voice/engine";
import { segmentsFromText } from "@/lib/voice/voices";
import { formatClock } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { StepArt } from "@/components/movement-breaks/illustrations";
import { resetSitting } from "@/components/movement-breaks/reminder-store";
import { commitCompanion } from "@/lib/companion/store";
import { localISODate } from "@/lib/dates";
import { safetyFlags } from "@/lib/health-profile";
import { MB, ROUTINE, ROUTINE_SECONDS } from "@/lib/movement-breaks/content";
import { addMovementBreak } from "@/lib/movement-breaks/personal";

type Run = { index: number; left: number; running: boolean; finished: boolean };

const START: Run = { index: 0, left: ROUTINE[0]?.seconds ?? 0, running: false, finished: false };

function tick(run: Run): Run {
  if (!run.running) return run;
  if (run.left > 1) return { ...run, left: run.left - 1 };
  const next = run.index + 1;
  const step = ROUTINE[next];
  if (!step) return { ...run, left: 0, running: false, finished: true };
  return { ...run, index: next, left: step.seconds };
}

/** The guided 2 to 3 minute break, with a countdown, a figure for each step, and a seated version. */
export function MovementBreakRoutine() {
  const { answers, sample } = useProfile();
  const flags = answers ? safetyFlags(answers) : null;
  const [seatedChoice, setSeatedChoice] = useState<boolean | null>(null);
  const seated = seatedChoice ?? Boolean(flags?.seatedFirst);
  const [run, setRun] = useState<Run>(START);
  const [saved, setSaved] = useState(false);
  // Read each step aloud as the timer reaches it, so the person can watch their body, not the screen.
  const [spoken, setSpoken] = useState(true);
  const { locale } = useLocale();
  const lastSpoken = useRef(-1);

  useEffect(() => {
    if (!run.running) return;
    const id = window.setInterval(() => setRun(tick), 1000);
    return () => window.clearInterval(id);
  }, [run.running]);

  useEffect(() => {
    if (!run.running || !spoken) {
      if (!run.running) lastSpoken.current = -1;
      return;
    }
    if (lastSpoken.current === run.index) return;
    lastSpoken.current = run.index;
    const current = ROUTINE[run.index];
    if (current) player.play("movement-break", segmentsFromText(`${current.title}. ${seated ? current.seated : current.standing}`, locale), { rateFactor: 0.95, stepWait: 0 });
  }, [run.running, run.index, spoken, seated, locale]);

  useEffect(() => {
    if (run.finished && spoken) player.play("movement-break", segmentsFromText("Break complete. Well done.", locale), { stepWait: 0 });
  }, [run.finished, spoken, locale]);

  useEffect(() => () => player.stop("movement-break"), []);

  const step = ROUTINE[run.index] ?? ROUTINE[0];
  if (!step) return null;
  const elapsed = ROUTINE.slice(0, run.index).reduce((sum, item) => sum + item.seconds, 0) + (step.seconds - run.left);

  function finish() {
    if (saved) return;
    setSaved(true);
    resetSitting();
    if (!sample) commitCompanion((state) => addMovementBreak(state, localISODate()));
  }

  function go(index: number) {
    const target = ROUTINE[index];
    if (!target) return;
    setRun((current) => ({ ...current, index, left: target.seconds, finished: false }));
  }

  return (
    <section className="card stack mb-routine" id="break" aria-labelledby="mb-routine-title">
      <p className="kicker">About 2 to 3 minutes · at your desk or in your chair</p>
      <h2 id="mb-routine-title">The 30-minute movement break</h2>
      <p>Follow the steps at your own pace. The timer is only a guide: move on whenever you are ready, or stop at any time.</p>
      <fieldset className="field">
        <legend>How would you like to do it?</legend>
        <div className="lz-tabs">
          <button type="button" className="lz-tab" aria-pressed={!seated} onClick={() => setSeatedChoice(false)}>
            Standing, with support nearby
          </button>
          <button type="button" className="lz-tab" aria-pressed={seated} onClick={() => setSeatedChoice(true)}>
            Seated in a sturdy chair
          </button>
        </div>
        {flags?.seatedFirst ? <p className="hint">The seated version is chosen first because you said standing for long is hard.</p> : null}
        {flags?.fallRisk && !seated ? <p className="hint">You mentioned balance or a walking aid. Keep one hand on something sturdy, or choose the seated version.</p> : null}
      </fieldset>
      <label className="check-row">
        <input
          type="checkbox"
          checked={spoken}
          onChange={(event) => {
            setSpoken(event.target.checked);
            if (!event.target.checked) player.stop("movement-break");
          }}
        />
        <span>Read each step aloud when it starts</span>
      </label>

      {run.finished ? (
        <div className="stack mb-done" role="status">
          <h3>Break complete. Well done.</h3>
          <p>{sample ? "Sample data is on, so this break was not saved." : saved ? "Saved to today's tracker." : "Press the button to save it to today's tracker."}</p>
          <div className="lz-buttons">
            {!saved && !sample ? (
              <button className="btn btn-primary" type="button" onClick={finish}>
                Save this break
              </button>
            ) : null}
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setSaved(false);
                setRun(START);
              }}
            >
              Start again
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-stage">
          <StepArt step={step.id} seated={seated} animate={run.running} />
          <div className="stack">
            <p className="mb-step-count">
              Step {run.index + 1} of {ROUTINE.length}
            </p>
            <h3 className="mb-step-title">{step.title}</h3>
            <p className="mb-step-text">{seated ? step.seated : step.standing}</p>
            <p className="mb-clock" aria-live="off">
              {formatClock(run.left)}
            </p>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${Math.min(100, Math.round((elapsed / ROUTINE_SECONDS) * 100))}%` }} />
            </div>
            <div className="lz-buttons">
              <button
                className="btn btn-primary mb-big"
                type="button"
                onClick={() => {
                  if (run.running) player.stop("movement-break");
                  setRun((current) => ({ ...current, running: !current.running }));
                }}
              >
                {run.running ? "Pause" : run.index === 0 && run.left === step.seconds ? "Start the break" : "Continue"}
              </button>
              <button className="btn btn-secondary mb-big" type="button" disabled={run.index === 0} onClick={() => go(run.index - 1)}>
                Back
              </button>
              <button
                className="btn btn-secondary mb-big"
                type="button"
                onClick={() => (run.index + 1 < ROUTINE.length ? go(run.index + 1) : setRun((current) => ({ ...current, running: false, finished: true })))}
              >
                {run.index + 1 < ROUTINE.length ? "Next step" : "Finish"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ol className="mb-step-list">
        {ROUTINE.map((item, index) => (
          <li key={item.id} aria-current={!run.finished && index === run.index ? "step" : undefined}>
            <strong>{item.title}.</strong> {seated ? item.seated : item.standing}
          </li>
        ))}
      </ol>
      <p className="hint">{MB.rule.walkBetter}</p>
      <p className="alert">{MB.safety.dvt}</p>
    </section>
  );
}
