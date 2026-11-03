"use client";

import { useSyncExternalStore, useState } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import {
  BASELINE_FIELDS,
  EXPERIMENTS,
  buildPlan,
  compareChangeLab,
  encouragement,
  fieldLabel,
  getChangeLab,
  getChangeLabServer,
  habitJourneySummary,
  subscribeChangeLab,
  writeChangeLab,
  type ChangeLabState,
  type ExperimentId,
} from "@/lib/change-lab";

const STEPS = [
  "Baseline",
  "Discover",
  "Choose",
  "Plan",
  "Daily progress",
  "Reassess",
  "Before and after",
];

function ChoiceGroup({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      <div className="choices">
        {options.map(([option, label]) => (
          <label className="choice" key={option}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ChangeLabView() {
  const { ready, sample } = useSession();
  const state = useSyncExternalStore(subscribeChangeLab, getChangeLab, getChangeLabServer);
  const [measure, setMeasure] = useState({ kind: "Walking minutes", value: "", unit: "minutes", measuredOn: "" });
  if (!ready) return <LoadingState label="Loading Change Lab…" />;

  function update(patch: Partial<ChangeLabState>) {
    writeChangeLab({ ...state, ...patch });
  }

  const plan = state.experimentId ? buildPlan(state.experimentId, state.duration) : [];
  const done = state.checkIns.filter((item) => item.done).length;
  const answered = BASELINE_FIELDS.filter((field) => state.baseline[field.id]).map((field) => field.label);

  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">LifeZoi Change Lab</p>
        <h1>Your personal health and lifestyle experiment</h1>
        <p className="lede">
          Choose one small habit experiment, practice it, and compare what you entered before and after. This is education, not a treatment, and it does not promise a health outcome.
        </p>
      </div>
      <p className="banner" role="status">
        Saved in this browser tab only. Nothing here is sent to an AI provider or to MedlinePlus.
        {sample ? " The sample-visitor banner is about the older assessment, not this experiment." : ""}
      </p>
      <ol className="step-list" aria-label="Change Lab progress">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              className={state.step === index ? "is-current" : undefined}
              aria-current={state.step === index ? "step" : undefined}
              onClick={() => update({ step: index })}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>

      {state.step === 0 ? (
        <section className="card stack">
          <h2>Step 1. Baseline</h2>
          <p>Answer only what you want. Every question is optional. A rough answer is enough.</p>
          {BASELINE_FIELDS.map((field) => (
            <ChoiceGroup
              key={field.id}
              legend={field.label}
              name={field.id}
              value={state.baseline[field.id] ?? ""}
              options={field.options}
              onChange={(value) => update({ baseline: { ...state.baseline, [field.id]: value } })}
            />
          ))}
          <h3>Optional demonstration measurements</h3>
          <p>Type a practice number if you want it in the later comparison. Leave this blank to skip it. These numbers stay in this tab.</p>
          <div className="grid-2">
            <label className="field">
              <span>Measurement name</span>
              <input value={measure.kind} onChange={(event) => setMeasure({ ...measure, kind: event.target.value })} />
            </label>
            <label className="field">
              <span>Value</span>
              <input inputMode="decimal" value={measure.value} onChange={(event) => setMeasure({ ...measure, value: event.target.value })} />
            </label>
            <label className="field">
              <span>Unit</span>
              <input value={measure.unit} onChange={(event) => setMeasure({ ...measure, unit: event.target.value })} />
            </label>
            <label className="field">
              <span>Date</span>
              <input type="date" value={measure.measuredOn} onChange={(event) => setMeasure({ ...measure, measuredOn: event.target.value })} />
            </label>
          </div>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              const value = Number(measure.value);
              if (!measure.kind.trim() || !Number.isFinite(value) || !measure.measuredOn) return;
              update({
                baselineMeasurements: [
                  ...state.baselineMeasurements,
                  {
                    id: crypto.randomUUID(),
                    kind: measure.kind.trim().slice(0, 40),
                    value,
                    unit: measure.unit.trim().slice(0, 24) || "units",
                    measuredOn: measure.measuredOn,
                  },
                ],
              });
            }}
          >
            Add baseline measurement
          </button>
          <ul>
            {state.baselineMeasurements.map((item) => (
              <li key={item.id}>
                {item.kind}: {item.value} {item.unit} on {item.measuredOn}
              </li>
            ))}
          </ul>
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 1 })}>
            See the overview
          </button>
        </section>
      ) : null}

      {state.step === 1 ? (
        <section className="card stack">
          <h2>Step 2. Discover</h2>
          <p>This overview repeats what you entered. It does not score your health.</p>
          <h3>Answers on file</h3>
          {answered.length === 0 ? <p>No baseline answers yet. You can still choose an experiment.</p> : null}
          <ul>
            {BASELINE_FIELDS.filter((field) => state.baseline[field.id]).map((field) => (
              <li key={field.id}>
                <strong>{field.label}: </strong>
                {fieldLabel(field.id, state.baseline[field.id] as string)}
              </li>
            ))}
          </ul>
          <h3>Patterns you may want to practice</h3>
          <ul>
            {state.baseline.sugar === "often" ? <li>Sugary drinks were marked as most days.</li> : null}
            {state.baseline.sleep === "short" ? <li>Sleep was marked as often short.</li> : null}
            {state.baseline.activity === "rare" ? <li>Walking was marked as rare.</li> : null}
            {state.baseline.sedentary === "often" ? <li>Long sitting stretches were marked as often.</li> : null}
            {answered.length === 0 ? <li>Add a baseline answer if you want a pattern listed here.</li> : null}
          </ul>
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 2 })}>
            Choose an experiment
          </button>
        </section>
      ) : null}

      {state.step === 2 ? (
        <section className="card stack">
          <h2>Step 3. Choose an experiment</h2>
          <div className="choices">
            {EXPERIMENTS.map((experiment) => (
              <label className="choice" key={experiment.id}>
                <input
                  type="radio"
                  name="experiment"
                  checked={state.experimentId === experiment.id}
                  onChange={() => update({ experimentId: experiment.id as ExperimentId })}
                />
                <span>
                  <strong>{experiment.title}</strong>
                  <span className="hint">{experiment.summary}</span>
                </span>
              </label>
            ))}
          </div>
          <fieldset className="field">
            <legend>Length</legend>
            <div className="choices">
              {[7, 30].map((days) => (
                <label className="choice" key={days}>
                  <input
                    type="radio"
                    name="duration"
                    checked={state.duration === days}
                    onChange={() => update({ duration: days as 7 | 30 })}
                  />
                  <span>{days} days</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-primary" type="button" disabled={!state.experimentId} onClick={() => update({ step: 3 })}>
            Build the plan
          </button>
        </section>
      ) : null}

      {state.step === 3 ? (
        <section className="card stack">
          <h2>Step 4. Personal plan</h2>
          {plan.length === 0 ? <p>Choose an experiment first.</p> : null}
          <ol>
            {plan.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 4 })}>
            Go to daily progress
          </button>
        </section>
      ) : null}

      {state.step === 4 ? (
        <section className="card stack">
          <h2>Step 5. Daily progress</h2>
          <p role="status">{encouragement(done, state.duration)}</p>
          <ul className="record-list">
            {plan.map((line, index) => {
              const date = `day-${index + 1}`;
              const checked = state.checkIns.some((item) => item.date === date && item.done);
              return (
                <li key={date}>
                  <label className="choice">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const rest = state.checkIns.filter((item) => item.date !== date);
                        update({
                          checkIns: event.target.checked
                            ? [...rest, { date, done: true, note: "" }]
                            : rest,
                        });
                      }}
                    />
                    <span>{line}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 5, followUp: state.followUp ?? { ...state.baseline } })}>
            Reassess
          </button>
        </section>
      ) : null}

      {state.step === 5 ? (
        <section className="card stack">
          <h2>Step 6. Reassessment</h2>
          <p>Enter a new answer only where something feels different. The first answers stay as the baseline.</p>
          {BASELINE_FIELDS.map((field) => (
            <ChoiceGroup
              key={field.id}
              legend={field.label}
              name={`follow-${field.id}`}
              value={state.followUp?.[field.id] ?? ""}
              options={field.options}
              onChange={(value) => update({ followUp: { ...(state.followUp ?? {}), [field.id]: value } })}
            />
          ))}
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 6 })}>
            See before and after
          </button>
        </section>
      ) : null}

      {state.step === 6 ? (
        <section className="card stack">
          <h2>Step 7. Before and after</h2>
          <p>
            The table shows words and numbers you typed. A difference is a change in the record, not proof that the experiment caused a health effect.
          </p>
          <p role="status">{habitJourneySummary(state)}</p>
          <table>
            <caption>What you entered at baseline and at reassessment</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Before</th>
                <th scope="col">After</th>
              </tr>
            </thead>
            <tbody>
              {compareChangeLab(state).map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.before}</td>
                  <td>{row.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
