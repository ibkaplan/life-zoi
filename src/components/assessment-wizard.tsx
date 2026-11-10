"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { LoadingState } from "@/components/sources";
import { useMessages } from "@/components/locale-provider";
import { fmt } from "@/lib/i18n/config";
import { translateError } from "@/lib/i18n/translate-error";
import {
  AGE_RANGES,
  ALCOHOL_PATTERNS,
  GOAL_IDS,
  HYDRATION_PATTERNS,
  MOOD_LEVELS,
  SLEEP_QUALITIES,
  SMOKING_PATTERNS,
  SOCIAL_LEVELS,
  STEP_IDS,
  STRESS_LEVELS,
  TABLE_SEX,
  VEGETABLE_PATTERNS,
  type Assessment,
  type GoalId,
  type StepId,
} from "@/lib/types";
import { firstInvalidStep, validateStep } from "@/lib/validation";
import { ALLERGENS } from "@/lib/food-plan/types";
import { FOOD_WORDS } from "@/lib/food-words";
import {
  BLOOD_PRESSURE_STATUSES,
  BLOOD_SUGAR_STATUSES,
  CHOLESTEROL_STATUSES,
  DIET_PATTERNS,
  DIET_REQUIREMENTS,
  ENERGY_LEVELS,
  REACTION_TYPES,
  type ReactionType,
  EATING_PATTERNS,
  MOBILITY_LIMITS,
  WELLNESS_GOALS,
} from "@/lib/health-profile";

function toggle<T extends string>(list: T[], value: T, on: boolean): T[] {
  return on ? (list.includes(value) ? list : [...list, value]) : list.filter((item) => item !== value);
}

function CheckList<T extends string>({
  legend,
  hint,
  values,
  options,
  onChange,
}: {
  legend: string;
  hint?: string;
  values: T[];
  options: { value: T; label: string }[];
  onChange: (values: T[]) => void;
}) {
  return (
    <fieldset className="field">
      <legend>{legend}</legend>
      {hint ? <p className="hint">{hint}</p> : null}
      <div className="check-grid">
        {options.map((option) => (
          <label className="check-row" key={option.value}>
            <input
              type="checkbox"
              checked={values.includes(option.value)}
              onChange={(event) => onChange(toggle(values, option.value, event.target.checked))}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function ReactionEditor({
  reactions,
  onChange,
}: {
  reactions: { food: string; type: ReactionType }[];
  onChange: (next: { food: string; type: ReactionType }[]) => void;
}) {
  const [food, setFood] = useState("");
  const [type, setType] = useState<ReactionType>("allergy");
  const m = useMessages();
  const h = m.assessment.health;
  function add() {
    const clean = food.trim().toLowerCase().slice(0, 40);
    if (!clean) return;
    onChange([...reactions.filter((item) => item.food !== clean), { food: clean, type }]);
    setFood("");
  }
  return (
    <fieldset className="field">
      <legend>{h.reactions}</legend>
      <p className="hint">{h.reactionsHint}</p>
      <div className="inline-form">
        <input
          aria-label={h.food}
          list="assessment-food-words"
          value={food}
          maxLength={40}
          onChange={(event) => setFood(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <datalist id="assessment-food-words">
          {FOOD_WORDS.map((word) => (
            <option key={word} value={word} />
          ))}
        </datalist>
        <select aria-label={h.reactionKind} value={type} onChange={(event) => setType(event.target.value as ReactionType)}>
          {REACTION_TYPES.map((value) => (
            <option key={value} value={value}>
              {m.labels.reaction[value]}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" type="button" onClick={add}>
          {m.common.add}
        </button>
      </div>
      {reactions.length > 0 ? (
        <ul className="chip-list">
          {reactions.map((item) => (
            <li key={item.food} className="chip">
              {item.food} · {m.labels.reaction[item.type]}
              <button
                type="button"
                className="chip-remove"
                aria-label={fmt(m.common.remove, { item: item.food })}
                onClick={() => onChange(reactions.filter((other) => other.food !== item.food))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </fieldset>
  );
}

function Choice<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
  error,
}: {
  legend: string;
  name: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  error?: string;
}) {
  const errorId = `${name}-error`;
  const selected = useMessages().common.selected;
  return (
    <fieldset
      className="field"
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend>{legend}</legend>
      <div className="choices">
        {options.map((option) => (
          <label className="choice" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
            <span className="choice-mark">{value === option.value ? selected : ""}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  max,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  max: number;
}) {
  const errorId = `${id}-error`;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <span className="hint" id={`${id}-hint`}>{hint}</span>
      <input
        id={id}
        inputMode="decimal"
        value={value}
        max={max}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-hint ${errorId}` : `${id}-hint`}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <span className="field-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function AssessmentWizard() {
  const { ready, sample, session, setDraft, setDraftStep, completeAssessment } = useSession();
  const accountReady = useAccount().phase === "ready";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const m = useMessages();
  const a = m.assessment;
  const l = m.labels;
  const err = (key: string) => translateError(errors[key], m);
  if (!ready) return <LoadingState label={a.loading} />;

  const step = STEP_IDS[session.draftStep] ?? "about";
  const draft = session.draft;
  const copy = a.steps[step];

  function update(partial: Partial<Assessment>) {
    setSaved(false);
    setDraft({ ...draft, ...partial });
  }

  function goTo(index: number) {
    setErrors({});
    setDraftStep(index);
  }

  function continueStep() {
    const nextErrors = validateStep(step, draft);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    goTo(Math.min(session.draftStep + 1, STEP_IDS.length - 1));
  }

  function save() {
    const invalid = firstInvalidStep(draft);
    if (invalid) {
      setErrors(validateStep(invalid, draft));
      setDraftStep(STEP_IDS.indexOf(invalid));
      return;
    }
    const result = completeAssessment();
    if (!result.ok) {
      setErrors(result.fields);
      return;
    }
    setErrors({});
    setSaved(true);
  }

  return (
    <div className="stack-lg narrow">
      <div>
        <p className="kicker">{a.kicker}</p>
        <h1>{copy.title}</h1>
        <p className="lede">{copy.why}</p>
      </div>
      <div>
        <div className="progress-label">
          <span>{fmt(a.stepOf, { step: session.draftStep + 1, total: STEP_IDS.length })}</span>
          <span>{copy.title}</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEP_IDS.length}
          aria-valuenow={session.draftStep + 1}
          aria-label={a.progressLabel}
        >
          <span style={{ width: `${((session.draftStep + 1) / STEP_IDS.length) * 100}%` }} />
        </div>
      </div>
      {sample ? (
        <p className="banner banner-sample">
          {a.sampleNote}
        </p>
      ) : null}
      {saved ? (
        <p className="alert alert-ok" role="status">
          {accountReady ? a.savedAccount : a.savedTab}{" "}
          <Link href="/plan">{a.openPlan}</Link>,{" "}
          <Link href="/outlook">{a.seeOutlook}</Link>, <Link href="/dashboard">{a.goDashboard}</Link>, {a.or}{" "}
          <Link href="/what-if">{a.openWhatIf}</Link>
        </p>
      ) : null}
      {errors.form ? (
        <p className="alert alert-error" role="alert">
          {err("form")}
        </p>
      ) : null}
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          if (step === "review") save();
          else continueStep();
        }}
      >
        <fieldset disabled={sample} className="stack">
          {step === "about" ? (
            <>
              <label className="field" htmlFor="displayName">
                <span>{a.about.name}</span>
                <span className="hint">{a.about.nameHint}</span>
                <input
                  id="displayName"
                  type="text"
                  maxLength={40}
                  value={draft.displayName}
                  onChange={(event) => update({ displayName: event.target.value })}
                />
              </label>
              <Choice
                legend={a.about.ageRange}
                name="ageRange"
                value={draft.ageRange}
                options={AGE_RANGES.map((value) => ({ value, label: l.age[value] }))}
                onChange={(ageRange) => update({ ageRange })}
              />
              <NumberField
                id="exactAge"
                label={a.about.exactAge}
                hint={a.about.exactAgeHint}
                value={draft.exactAge}
                max={100}
                error={err("exactAge")}
                onChange={(exactAge) => update({ exactAge })}
              />
              <Choice
                legend={a.about.tableSex}
                name="tableSex"
                value={draft.tableSex}
                options={TABLE_SEX.map((value) => ({ value, label: l.tableSex[value] }))}
                onChange={(tableSex) => update({ tableSex })}
              />
              <p className="hint">{a.about.tableSexHint}</p>
              <label className="field" htmlFor="populationNote">
                <span>{a.about.population}</span>
                <span className="hint">{a.about.populationHint}</span>
                <input id="populationNote" value={draft.populationNote} maxLength={280} onChange={(event) => update({ populationNote: event.target.value })} />
              </label>
              <NumberField
                id="heightCm"
                label={a.about.height}
                hint={a.about.measureHint}
                value={draft.heightCm}
                max={250}
                error={err("heightCm")}
                onChange={(heightCm) => update({ heightCm })}
              />
              <NumberField
                id="weightKg"
                label={a.about.weight}
                hint={a.about.measureHint}
                value={draft.weightKg}
                max={300}
                error={err("weightKg")}
                onChange={(weightKg) => update({ weightKg })}
              />
              <NumberField
                id="desiredWeightKg"
                label={a.about.desiredWeight}
                hint={a.about.desiredWeightHint}
                value={draft.desiredWeightKg}
                max={300}
                error={err("desiredWeightKg")}
                onChange={(desiredWeightKg) => update({ desiredWeightKg })}
              />
            </>
          ) : null}
          {step === "sleep" ? (
            <>
              <NumberField
                id="sleepHours"
                label={a.sleep.hours}
                hint={a.sleep.hoursHint}
                value={draft.sleepHours}
                max={24}
                error={err("sleepHours")}
                onChange={(sleepHours) => update({ sleepHours })}
              />
              <Choice
                legend={a.sleep.quality}
                name="sleepQuality"
                value={draft.sleepQuality}
                error={err("sleepQuality")}
                options={SLEEP_QUALITIES.map((value) => ({
                  value,
                  label: l.sleepQuality[value],
                }))}
                onChange={(sleepQuality) => update({ sleepQuality })}
              />
            </>
          ) : null}
          {step === "movement" ? (
            <>
              <NumberField
                id="activityDays"
                label={a.movement.days}
                hint={a.movement.daysHint}
                value={draft.activityDays}
                max={7}
                error={err("activityDays")}
                onChange={(activityDays) => update({ activityDays })}
              />
              <NumberField
                id="activityMinutes"
                label={a.movement.minutes}
                hint={a.movement.minutesHint}
                value={draft.activityMinutes}
                max={300}
                error={err("activityMinutes")}
                onChange={(activityMinutes) => update({ activityMinutes })}
              />
              <NumberField
                id="sedentaryHours"
                label={a.movement.sitting}
                hint={a.movement.sittingHint}
                value={draft.sedentaryHours}
                max={24}
                error={err("sedentaryHours")}
                onChange={(sedentaryHours) => update({ sedentaryHours })}
              />
              <p className="hint">{a.movement.kindsHint}</p>
              {(["walking", "strength", "balance", "flexibility"] as const).map((name) => (
                <Choice
                  key={name}
                  legend={a.movement[name]}
                  name={name}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: l.frequency[value] }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "nourishment" ? (
            <>
              <Choice
                legend={a.nourishment.vegetables}
                name="vegetables"
                value={draft.vegetables}
                error={err("vegetables")}
                options={VEGETABLE_PATTERNS.map((value) => ({
                  value,
                  label: l.frequency[value],
                }))}
                onChange={(vegetables) => update({ vegetables })}
              />
              <Choice
                legend={a.nourishment.water}
                name="hydration"
                value={draft.hydration}
                error={err("hydration")}
                options={HYDRATION_PATTERNS.map((value) => ({
                  value,
                  label: l.hydration[value],
                }))}
                onChange={(hydration) => update({ hydration })}
              />
              <Choice
                legend={a.nourishment.eating}
                name="eatingPattern"
                value={draft.eatingPattern}
                options={EATING_PATTERNS.map((value) => ({ value, label: l.eatingPattern[value] }))}
                onChange={(eatingPattern) => update({ eatingPattern })}
              />
              <p className="hint">{a.nourishment.kindsHint}</p>
              {(["fruit", "fiber", "protein", "addedSugar"] as const).map((name) => (
                <Choice
                  key={name}
                  legend={a.nourishment[name]}
                  name={name}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: l.frequency[value] }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "substances" ? (
            <>
              <Choice
                legend={a.substances.tobacco}
                name="smoking"
                value={draft.smoking}
                options={SMOKING_PATTERNS.map((value) => ({
                  value,
                  label: l.smoking[value],
                }))}
                onChange={(smoking) => update({ smoking })}
              />
              <Choice
                legend={a.substances.alcohol}
                name="alcohol"
                value={draft.alcohol}
                options={ALCOHOL_PATTERNS.map((value) => ({
                  value,
                  label: l.alcohol[value],
                }))}
                onChange={(alcohol) => update({ alcohol })}
              />
              <button className="btn btn-ghost" type="button" onClick={() => goTo(session.draftStep + 1)}>
                {m.common.skipStep}
              </button>
            </>
          ) : null}
          {step === "mind" ? (
            <>
              <Choice
                legend={a.mind.stress}
                name="stress"
                value={draft.stress}
                error={err("stress")}
                options={STRESS_LEVELS.map((value) => ({ value, label: l.stress[value] }))}
                onChange={(stress) => update({ stress })}
              />
              <Choice
                legend={a.mind.mood}
                name="mood"
                value={draft.mood}
                error={err("mood")}
                options={MOOD_LEVELS.map((value) => ({ value, label: l.mood[value] }))}
                onChange={(mood) => update({ mood })}
              />
              <Choice
                legend={a.mind.social}
                name="social"
                value={draft.social}
                error={err("social")}
                options={SOCIAL_LEVELS.map((value) => ({ value, label: l.social[value] }))}
                onChange={(social) => update({ social })}
              />
              <p className="hint">{a.mind.notesHint}</p>
              <label className="field" htmlFor="conditionsNote">
                <span>{a.mind.conditions}</span>
                <textarea id="conditionsNote" maxLength={280} value={draft.conditionsNote} onChange={(event) => update({ conditionsNote: event.target.value })} />
              </label>
              <label className="field" htmlFor="familyNote">
                <span>{a.mind.family}</span>
                <textarea id="familyNote" maxLength={280} value={draft.familyNote} onChange={(event) => update({ familyNote: event.target.value })} />
              </label>
              <label className="field" htmlFor="bloodPressure">
                <span>{a.mind.bloodPressure}</span>
                <input id="bloodPressure" value={draft.bloodPressure} maxLength={40} onChange={(event) => update({ bloodPressure: event.target.value })} />
              </label>
              <label className="field" htmlFor="glucose">
                <span>{a.mind.glucose}</span>
                <input id="glucose" value={draft.glucose} maxLength={40} onChange={(event) => update({ glucose: event.target.value })} />
              </label>
              <label className="field" htmlFor="hba1c">
                <span>{a.mind.hba1c}</span>
                <input id="hba1c" value={draft.hba1c} maxLength={40} onChange={(event) => update({ hba1c: event.target.value })} />
              </label>
              <label className="field" htmlFor="cholesterol">
                <span>{a.mind.cholesterol}</span>
                <input id="cholesterol" value={draft.cholesterol} maxLength={40} onChange={(event) => update({ cholesterol: event.target.value })} />
              </label>
            </>
          ) : null}
          {step === "health" ? (
            <>
              <Choice
                legend={a.health.energy}
                name="energyLevel"
                value={draft.energyLevel}
                options={ENERGY_LEVELS.map((value) => ({ value, label: l.energy[value] }))}
                onChange={(energyLevel) => update({ energyLevel })}
              />
              <Choice
                legend={a.health.bloodSugar}
                name="bloodSugarStatus"
                value={draft.bloodSugarStatus}
                options={BLOOD_SUGAR_STATUSES.map((value) => ({ value, label: l.bloodSugar[value] }))}
                onChange={(bloodSugarStatus) => update({ bloodSugarStatus })}
              />
              <Choice
                legend={a.health.cholesterol}
                name="cholesterolStatus"
                value={draft.cholesterolStatus}
                options={CHOLESTEROL_STATUSES.map((value) => ({ value, label: l.cholesterol[value] }))}
                onChange={(cholesterolStatus) => update({ cholesterolStatus })}
              />
              <Choice
                legend={a.health.bloodPressure}
                name="bloodPressureStatus"
                value={draft.bloodPressureStatus}
                options={BLOOD_PRESSURE_STATUSES.map((value) => ({ value, label: l.bloodPressure[value] }))}
                onChange={(bloodPressureStatus) => update({ bloodPressureStatus })}
              />
              <p className="hint">{a.health.labHint}</p>
              <CheckList
                legend={a.health.allergies}
                hint={a.health.allergiesHint}
                values={draft.foodAllergies}
                options={ALLERGENS.map((value) => ({ value, label: l.allergen[value] }))}
                onChange={(foodAllergies) => update({ foodAllergies })}
              />
              <ReactionEditor
                reactions={draft.foodReactions}
                onChange={(foodReactions) => update({ foodReactions })}
              />
              <CheckList
                legend={a.health.requirements}
                hint={a.health.requirementsHint}
                values={draft.dietRequirements}
                options={DIET_REQUIREMENTS.map((value) => ({ value, label: l.dietRequirement[value] }))}
                onChange={(dietRequirements) => {
                  const added = dietRequirements.find((item) => !draft.dietRequirements.includes(item));
                  update({
                    dietRequirements:
                      added === "prefer-not" ? ["prefer-not"] : dietRequirements.filter((item) => item !== "prefer-not"),
                  });
                }}
              />
              <CheckList
                legend={a.health.patterns}
                hint={a.health.patternsHint}
                values={draft.dietPatterns}
                options={DIET_PATTERNS.map((value) => ({ value, label: l.dietPattern[value] }))}
                onChange={(dietPatterns) => {
                  const added = dietPatterns.find((item) => !draft.dietPatterns.includes(item));
                  update({ dietPatterns: added === "none" ? ["none"] : dietPatterns.filter((item) => item !== "none") });
                }}
              />
              <label className="field" htmlFor="dietNote">
                <span>{a.health.dietNote}</span>
                <input id="dietNote" maxLength={140} value={draft.dietNote} onChange={(event) => update({ dietNote: event.target.value })} />
              </label>
              <CheckList
                legend={a.health.mobility}
                hint={a.health.mobilityHint}
                values={draft.mobilityLimits}
                options={MOBILITY_LIMITS.map((value) => ({ value, label: l.mobility[value] }))}
                onChange={(mobilityLimits) => {
                  const added = mobilityLimits.find((item) => !draft.mobilityLimits.includes(item));
                  if (added === "none" || added === "prefer-not") update({ mobilityLimits: [added] });
                  else update({ mobilityLimits: mobilityLimits.filter((item) => item !== "none" && item !== "prefer-not") });
                }}
              />
              <label className="field" htmlFor="exerciseRestrictions">
                <span>{a.health.restrictions}</span>
                <span className="hint">{a.health.restrictionsHint}</span>
                <textarea id="exerciseRestrictions" maxLength={280} value={draft.exerciseRestrictions} onChange={(event) => update({ exerciseRestrictions: event.target.value })} />
              </label>
              <button className="btn btn-ghost" type="button" onClick={() => goTo(session.draftStep + 1)}>
                {m.common.skipStep}
              </button>
            </>
          ) : null}
          {step === "results" ? (
            <div className="upload-placeholder" role="note">
              <p>
                <strong>{a.results.nothing}</strong>
              </p>
              <p>{a.results.noFile}</p>
              <p>{a.results.typed}</p>
            </div>
          ) : null}
          {step === "goals" ? (
            <>
              <CheckList
                legend={a.goals.personal}
                hint={a.goals.personalHint}
                values={draft.wellnessGoals}
                options={WELLNESS_GOALS.map((value) => ({ value, label: l.wellnessGoal[value] }))}
                onChange={(wellnessGoals) => {
                  const added = wellnessGoals.find((goal) => !draft.wellnessGoals.includes(goal));
                  const weight = ["lose-weight", "gain-weight", "maintain-weight"];
                  const next = added && weight.includes(added)
                    ? wellnessGoals.filter((goal) => goal === added || !weight.includes(goal))
                    : wellnessGoals;
                  update({
                    wellnessGoals: next,
                    primaryGoal: next.includes(draft.primaryGoal as never) ? draft.primaryGoal : next[0] ?? "",
                  });
                }}
              />
              {draft.wellnessGoals.length > 1 ? (
                <Choice
                  legend={a.goals.primary}
                  name="primaryGoal"
                  value={draft.primaryGoal}
                  options={draft.wellnessGoals.map((value) => ({ value, label: l.wellnessGoal[value] }))}
                  onChange={(primaryGoal) => update({ primaryGoal })}
                />
              ) : null}
              <fieldset className="field">
                <legend>{a.goals.track}</legend>
                <div className="stack">
                  {GOAL_IDS.map((goal) => (
                    <label className="check-row" key={goal}>
                      <input
                        type="checkbox"
                        checked={draft.goals.includes(goal)}
                        onChange={(event) => {
                          const goals: GoalId[] = event.target.checked
                            ? [...draft.goals, goal]
                            : draft.goals.filter((item) => item !== goal);
                          update({ goals });
                        }}
                      />
                      <span>{l.goal[goal]}</span>
                    </label>
                  ))}
                </div>
                {errors.goals ? (
                  <p className="field-error" role="alert">
                    {err("goals")}
                  </p>
                ) : null}
              </fieldset>
              <label className="field" htmlFor="habitNote">
                <span>{a.goals.note}</span>
                <span className="hint">{a.goals.noteHint}</span>
                <textarea
                  id="habitNote"
                  maxLength={280}
                  value={draft.habitNote}
                  onChange={(event) => update({ habitNote: event.target.value })}
                />
              </label>
              <label className="field" htmlFor="purposeHope">
                <span>{a.goals.hope}</span>
                <span className="hint">{a.goals.hopeHint}</span>
                <textarea
                  id="purposeHope"
                  maxLength={280}
                  value={draft.purposeHope}
                  onChange={(event) => update({ purposeHope: event.target.value })}
                />
                {errors.purposeHope ? (
                  <p className="field-error" role="alert">
                    {err("purposeHope")}
                  </p>
                ) : null}
              </label>
            </>
          ) : null}
          {step === "review" ? (
            <div className="stack">
              <p>{a.review.intro}</p>
              <Review draft={draft} onEdit={(index) => goTo(index)} />
            </div>
          ) : null}
        </fieldset>
        <div className="actions">
          {session.draftStep > 0 ? (
            <button className="btn btn-ghost" type="button" onClick={() => goTo(session.draftStep - 1)}>
              {m.common.back}
            </button>
          ) : null}
          {step === "review" ? (
            <button className="btn btn-primary" type="submit" disabled={sample}>
              {a.save}
            </button>
          ) : (
            <button className="btn btn-primary" type="submit" disabled={sample}>
              {m.common.continue}
            </button>
          )}
        </div>
      </form>
      <p className="footer-note">
        {a.footer}
      </p>
    </div>
  );
}

function Review({
  draft,
  onEdit,
}: {
  draft: Assessment;
  onEdit: (index: number) => void;
}) {
  const m = useMessages();
  const r = m.assessment.review;
  const l = m.labels;
  const none = m.common.notProvided;
  const pick = <K extends string>(value: K | "", labels: Record<K, string>) => (value ? labels[value] : none);
  const list = (values: string[]) => values.filter(Boolean).join(", ") || none;
  const items: { label: string; value: string; step: StepId }[] = [
    { label: r.name, value: draft.displayName || none, step: "about" },
    { label: r.ageRange, value: pick(draft.ageRange, l.age), step: "about" },
    { label: r.exactAge, value: draft.exactAge || none, step: "about" },
    { label: r.tableColumn, value: pick(draft.tableSex, l.tableSex), step: "about" },
    { label: r.population, value: draft.populationNote || none, step: "about" },
    { label: r.height, value: draft.heightCm ? fmt(r.cm, { value: draft.heightCm }) : none, step: "about" },
    { label: r.weight, value: draft.weightKg ? fmt(r.kg, { value: draft.weightKg }) : none, step: "about" },
    { label: r.desiredWeight, value: draft.desiredWeightKg ? fmt(r.kg, { value: draft.desiredWeightKg }) : none, step: "about" },
    {
      label: r.sleep,
      value: draft.sleepHours
        ? fmt(r.sleepValue, {
            hours: draft.sleepHours,
            quality: draft.sleepQuality ? l.sleepQuality[draft.sleepQuality] : r.qualityNotSet,
          })
        : none,
      step: "sleep",
    },
    {
      label: r.activity,
      value: draft.activityDays ? fmt(r.activityValue, { days: draft.activityDays, minutes: draft.activityMinutes || "0" }) : none,
      step: "movement",
    },
    { label: r.sitting, value: draft.sedentaryHours ? fmt(r.hoursValue, { hours: draft.sedentaryHours }) : none, step: "movement" },
    { label: r.walking, value: pick(draft.walking, l.frequency), step: "movement" },
    { label: r.strength, value: pick(draft.strength, l.frequency), step: "movement" },
    { label: r.balance, value: pick(draft.balance, l.frequency), step: "movement" },
    { label: r.flexibility, value: pick(draft.flexibility, l.frequency), step: "movement" },
    { label: r.vegetables, value: pick(draft.vegetables, l.frequency), step: "nourishment" },
    { label: r.fruit, value: pick(draft.fruit, l.frequency), step: "nourishment" },
    { label: r.fiber, value: pick(draft.fiber, l.frequency), step: "nourishment" },
    { label: r.protein, value: pick(draft.protein, l.frequency), step: "nourishment" },
    { label: r.addedSugar, value: pick(draft.addedSugar, l.frequency), step: "nourishment" },
    { label: r.water, value: pick(draft.hydration, l.hydration), step: "nourishment" },
    { label: r.tobacco, value: pick(draft.smoking, l.smoking), step: "substances" },
    { label: r.alcohol, value: pick(draft.alcohol, l.alcohol), step: "substances" },
    { label: r.stress, value: pick(draft.stress, l.stress), step: "mind" },
    { label: r.mood, value: pick(draft.mood, l.mood), step: "mind" },
    { label: r.social, value: pick(draft.social, l.social), step: "mind" },
    { label: r.conditions, value: draft.conditionsNote || none, step: "mind" },
    { label: r.family, value: draft.familyNote || none, step: "mind" },
    { label: r.bloodPressureTyped, value: draft.bloodPressure || none, step: "mind" },
    { label: r.glucoseTyped, value: draft.glucose || none, step: "mind" },
    { label: r.hba1cTyped, value: draft.hba1c || none, step: "mind" },
    { label: r.cholesterolTyped, value: draft.cholesterol || none, step: "mind" },
    { label: r.eatingPattern, value: pick(draft.eatingPattern, l.eatingPattern), step: "nourishment" },
    { label: r.bloodSugar, value: pick(draft.bloodSugarStatus, l.bloodSugar), step: "health" },
    { label: r.cholesterolStatus, value: pick(draft.cholesterolStatus, l.cholesterol), step: "health" },
    { label: r.bloodPressureStatus, value: pick(draft.bloodPressureStatus, l.bloodPressure), step: "health" },
    { label: r.allergies, value: list([...draft.foodAllergies.map((item) => l.allergen[item]), draft.allergyNote]), step: "health" },
    {
      label: r.reactions,
      value: list(draft.foodReactions.map((item) => `${item.food} (${l.reaction[item.type].toLocaleLowerCase()})`)),
      step: "health",
    },
    { label: r.requirements, value: list(draft.dietRequirements.map((item) => l.dietRequirement[item])), step: "health" },
    { label: r.patterns, value: list([...draft.dietPatterns.map((item) => l.dietPattern[item]), draft.dietNote]), step: "health" },
    { label: r.energy, value: pick(draft.energyLevel, l.energy), step: "health" },
    { label: r.mobility, value: list(draft.mobilityLimits.map((item) => l.mobility[item])), step: "health" },
    { label: r.restrictions, value: draft.exerciseRestrictions || none, step: "health" },
    { label: r.personalGoals, value: list(draft.wellnessGoals.map((goal) => l.wellnessGoal[goal])), step: "goals" },
    { label: r.primaryGoal, value: pick(draft.primaryGoal, l.wellnessGoal), step: "goals" },
    { label: r.focus, value: list(draft.goals.map((goal) => l.goal[goal])), step: "goals" },
    { label: r.note, value: draft.habitNote || none, step: "goals" },
    { label: r.hope, value: draft.purposeHope || none, step: "goals" },
  ];
  return (
    <dl className="review-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.value}{" "}
            <button className="btn btn-ghost" type="button" onClick={() => onEdit(STEP_IDS.indexOf(item.step))}>
              {fmt(m.common.edit, { label: item.label })}
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}
