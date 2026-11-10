"use client";

import { useEffect, useState } from "react";
import { formatClock } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { StepArt } from "@/components/movement-breaks/illustrations";
import { resetSitting } from "@/components/movement-breaks/reminder-store";
import { commitCompanion } from "@/lib/companion/store";
import { localISODate } from "@/lib/dates";
import { safetyFlags } from "@/lib/health-profile";
import { MB, ROUTINE, ROUTINE_SECONDS } from "@/lib/movement-breaks/content";
import { addMovementBreak } from "@/lib/movement-breaks/personal";
import { useT } from "@/components/locale-provider";

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
  const t = useT();

  useEffect(() => {
    if (!run.running) return;
    const id = window.setInterval(() => setRun(tick), 1000);
    return () => window.clearInterval(id);
  }, [run.running]);

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
      <p className="kicker">{t("About 2 to 3 minutes · at your desk or in your chair")}</p>
      <h2 id="mb-routine-title">{t("The 30-minute movement break")}</h2>
      <p>{t("Follow the steps at your own pace. The timer is only a guide: move on whenever you are ready, or stop at any time.")}</p>
      <fieldset className="field">
        <legend>{t("How would you like to do it?")}</legend>
        <div className="lz-tabs">
          <button type="button" className="lz-tab" aria-pressed={!seated} onClick={() => setSeatedChoice(false)}>
            {t("Standing, with support nearby")}
          </button>
          <button type="button" className="lz-tab" aria-pressed={seated} onClick={() => setSeatedChoice(true)}>
            {t("Seated in a sturdy chair")}
          </button>
        </div>
        {flags?.seatedFirst ? <p className="hint">{t("The seated version is chosen first because you said standing for long is hard.")}</p> : null}
        {flags?.fallRisk && !seated ? <p className="hint">{t("You mentioned balance or a walking aid. Keep one hand on something sturdy, or choose the seated version.")}</p> : null}
      </fieldset>

      {run.finished ? (
        <div className="stack mb-done" role="status">
          <h3>{t("Break complete. Well done.")}</h3>
          <p>{sample ? t("Sample data is on, so this break was not saved.") : saved ? t("Saved to today's tracker.") : t("Press the button to save it to today's tracker.")}</p>
          <div className="lz-buttons">
            {!saved && !sample ? (
              <button className="btn btn-primary" type="button" onClick={finish}>
                {t("Save this break")}
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
              {t("Start again")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-stage">
          <StepArt step={step.id} seated={seated} animate={run.running} />
          <div className="stack">
            <p className="mb-step-count">
              {t("Step {current} of {total}", { current: run.index + 1, total: ROUTINE.length })}
            </p>
            <h3 className="mb-step-title">{t(step.title)}</h3>
            <p className="mb-step-text">{t(seated ? step.seated : step.standing)}</p>
            <p className="mb-clock" aria-live="off">
              {formatClock(run.left)}
            </p>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${Math.min(100, Math.round((elapsed / ROUTINE_SECONDS) * 100))}%` }} />
            </div>
            <div className="lz-buttons">
              <button className="btn btn-primary mb-big" type="button" onClick={() => setRun((current) => ({ ...current, running: !current.running }))}>
                {run.running ? t("Pause") : run.index === 0 && run.left === step.seconds ? t("Start the break") : t("Continue")}
              </button>
              <button className="btn btn-secondary mb-big" type="button" disabled={run.index === 0} onClick={() => go(run.index - 1)}>
                {t("Back")}
              </button>
              <button
                className="btn btn-secondary mb-big"
                type="button"
                onClick={() => (run.index + 1 < ROUTINE.length ? go(run.index + 1) : setRun((current) => ({ ...current, running: false, finished: true })))}
              >
                {run.index + 1 < ROUTINE.length ? t("Next step") : t("Finish")}
              </button>
            </div>
          </div>
        </div>
      )}
      <ol className="mb-step-list">
        {ROUTINE.map((item, index) => (
          <li key={item.id} aria-current={!run.finished && index === run.index ? "step" : undefined}>
            <strong>{t(item.title)}.</strong> {t(seated ? item.seated : item.standing)}
          </li>
        ))}
      </ol>
      <p className="hint">{t(MB.rule.walkBetter)}</p>
      <p className="alert">{t(MB.safety.dvt)}</p>
    </section>
  );
}
