"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import { useLocale, useT } from "@/components/locale-provider";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
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
  msg("Baseline"),
  msg("Discover"),
  msg("Choose"),
  msg("Plan"),
  msg("Daily progress"),
  msg("Reassess"),
  msg("Before and after"),
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
  const t = useT();
  return (
    <fieldset className="field">
      <legend>{t(legend)}</legend>
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
            <span>{t(label)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ChangeLabView() {
  const { ready, sample } = useSession();
  const t = useT();
  const { locale } = useLocale();
  const state = useSyncExternalStore(subscribeChangeLab, getChangeLab, getChangeLabServer);
  // The suggested name and unit are shown in the chosen language until the person types their own.
  const [measure, setMeasure] = useState<{ kind: string | null; value: string; unit: string | null; measuredOn: string }>({
    kind: null,
    value: "",
    unit: null,
    measuredOn: "",
  });
  if (!ready) return <LoadingState label={t("Loading Change Lab…")} />;
  const measureKind = measure.kind ?? t("Walking minutes");
  const measureUnit = measure.unit ?? t("minutes");
  const dateText = (iso: string) => {
    const [year, month, day] = iso.split("-").map(Number);
    const value = new Date(Date.UTC(year, month - 1, day));
    return Number.isNaN(value.getTime())
      ? iso
      : value.toLocaleDateString(LOCALE_META[locale].htmlLang, { timeZone: "UTC", year: "numeric", month: "long", day: "numeric" });
  };

  function update(patch: Partial<ChangeLabState>) {
    writeChangeLab({ ...state, ...patch });
  }

  const plan = state.experimentId ? buildPlan(state.experimentId, state.duration, t) : [];
  const done = state.checkIns.filter((item) => item.done).length;
  const answered = BASELINE_FIELDS.filter((field) => state.baseline[field.id]).map((field) => field.label);

  return (
    <div className="change-lab stack-lg">
      <div className="stack">
        <p className="kicker">{t("LifeZoi Change Lab")}</p>
        <h1>{t("Your personal health and lifestyle experiment")}</h1>
        <p className="lede">
          {t(
            "Choose one small habit experiment, practice it, and compare what you entered before and after. This is education, not a treatment, and it does not promise a health outcome. It can be the Plan and Act steps in",
          )}{" "}
          <Link href="/life-matters">{t("Your Life Matters")}</Link>.
        </p>
      </div>
      <p className="banner" role="status">
        {t("Saved in this browser tab only. Nothing here is sent to an AI provider or to MedlinePlus.")}
        {sample ? ` ${t("The sample-visitor banner is about the older assessment, not this experiment.")}` : ""}
      </p>
      <ol className="step-list" aria-label={t("Change Lab progress")}>
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              className={state.step === index ? "is-current" : undefined}
              aria-current={state.step === index ? "step" : undefined}
              onClick={() => update({ step: index })}
            >
              {index + 1}. {t(label)}
            </button>
          </li>
        ))}
      </ol>

      {state.step === 0 ? (
        <section className="card stack">
          <h2>{t("Step 1. Baseline")}</h2>
          <p>{t("Answer only what you want. Every question is optional. A rough answer is enough.")}</p>
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
          <h3>{t("Optional demonstration measurements")}</h3>
          <p>{t("Type a practice number if you want it in the later comparison. Leave this blank to skip it. These numbers stay in this tab.")}</p>
          <div className="grid-2">
            <label className="field">
              <span>{t("Measurement name")}</span>
              <input value={measureKind} onChange={(event) => setMeasure({ ...measure, kind: event.target.value })} />
            </label>
            <label className="field">
              <span>{t("Value")}</span>
              <input inputMode="decimal" value={measure.value} onChange={(event) => setMeasure({ ...measure, value: event.target.value })} />
            </label>
            <label className="field">
              <span>{t("Unit")}</span>
              <input value={measureUnit} onChange={(event) => setMeasure({ ...measure, unit: event.target.value })} />
            </label>
            <label className="field">
              <span>{t("Date")}</span>
              <input type="date" value={measure.measuredOn} onChange={(event) => setMeasure({ ...measure, measuredOn: event.target.value })} />
            </label>
          </div>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              const value = Number(measure.value);
              if (!measureKind.trim() || !Number.isFinite(value) || !measure.measuredOn) return;
              update({
                baselineMeasurements: [
                  ...state.baselineMeasurements,
                  {
                    id: crypto.randomUUID(),
                    kind: measureKind.trim().slice(0, 40),
                    value,
                    unit: measureUnit.trim().slice(0, 24) || "units",
                    measuredOn: measure.measuredOn,
                  },
                ],
              });
            }}
          >
            {t("Add baseline measurement")}
          </button>
          <ul>
            {state.baselineMeasurements.map((item) => (
              <li key={item.id}>
                {t(item.kind)}:{" "}
                {t("{value} {unit} on {date}", { value: item.value, unit: t(item.unit), date: dateText(item.measuredOn) })}
              </li>
            ))}
          </ul>
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 1 })}>
            {t("See the overview")}
          </button>
        </section>
      ) : null}

      {state.step === 1 ? (
        <section className="card stack">
          <h2>{t("Step 2. Discover")}</h2>
          <p>{t("This overview repeats what you entered. It does not score your health.")}</p>
          <h3>{t("Answers on file")}</h3>
          {answered.length === 0 ? <p>{t("No baseline answers yet. You can still choose an experiment.")}</p> : null}
          <ul>
            {BASELINE_FIELDS.filter((field) => state.baseline[field.id]).map((field) => (
              <li key={field.id}>
                <strong>{t(field.label)}: </strong>
                {fieldLabel(field.id, state.baseline[field.id] as string, t)}
              </li>
            ))}
          </ul>
          <h3>{t("Patterns you may want to practice")}</h3>
          <ul>
            {state.baseline.sugar === "often" ? <li>{t("Sugary drinks were marked as most days.")}</li> : null}
            {state.baseline.sleep === "short" ? <li>{t("Sleep was marked as often short.")}</li> : null}
            {state.baseline.activity === "rare" ? <li>{t("Walking was marked as rare.")}</li> : null}
            {state.baseline.sedentary === "often" ? <li>{t("Long sitting stretches were marked as often.")}</li> : null}
            {answered.length === 0 ? <li>{t("Add a baseline answer if you want a pattern listed here.")}</li> : null}
          </ul>
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 2 })}>
            {t("Choose an experiment")}
          </button>
        </section>
      ) : null}

      {state.step === 2 ? (
        <section className="card stack">
          <h2>{t("Step 3. Choose an experiment")}</h2>
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
                  <strong>{t(experiment.title)}</strong>
                  <span className="hint">{t(experiment.summary)}</span>
                </span>
              </label>
            ))}
          </div>
          <fieldset className="field">
            <legend>{t("Length")}</legend>
            <div className="choices">
              {[7, 30].map((days) => (
                <label className="choice" key={days}>
                  <input
                    type="radio"
                    name="duration"
                    checked={state.duration === days}
                    onChange={() => update({ duration: days as 7 | 30 })}
                  />
                  <span>{t("{days} days", { days })}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-primary" type="button" disabled={!state.experimentId} onClick={() => update({ step: 3 })}>
            {t("Build the plan")}
          </button>
        </section>
      ) : null}

      {state.step === 3 ? (
        <section className="card stack">
          <h2>{t("Step 4. Personal plan")}</h2>
          {plan.length === 0 ? <p>{t("Choose an experiment first.")}</p> : null}
          <ol>
            {plan.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
          <button className="btn btn-primary" type="button" onClick={() => update({ step: 4 })}>
            {t("Go to daily progress")}
          </button>
        </section>
      ) : null}

      {state.step === 4 ? (
        <section className="card stack">
          <h2>{t("Step 5. Daily progress")}</h2>
          <p role="status">{encouragement(done, state.duration, t)}</p>
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
            {t("Reassess")}
          </button>
        </section>
      ) : null}

      {state.step === 5 ? (
        <section className="card stack">
          <h2>{t("Step 6. Reassessment")}</h2>
          <p>{t("Enter a new answer only where something feels different. The first answers stay as the baseline.")}</p>
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
            {t("See before and after")}
          </button>
        </section>
      ) : null}

      {state.step === 6 ? (
        <section className="card stack">
          <h2>{t("Step 7. Before and after")}</h2>
          <p>
            {t("The table shows words and numbers you typed. A difference is a change in the record, not proof that the experiment caused a health effect.")}
          </p>
          <p role="status">{habitJourneySummary(state, t)}</p>
          <table>
            <caption>{t("What you entered at baseline and at reassessment")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("Item")}</th>
                <th scope="col">{t("Before")}</th>
                <th scope="col">{t("After")}</th>
              </tr>
            </thead>
            <tbody>
              {compareChangeLab(state, t, dateText).map((row) => (
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
