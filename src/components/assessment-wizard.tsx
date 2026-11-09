"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/components/session-provider";
import { LoadingState } from "@/components/sources";
import {
  ageLabels,
  alcoholLabels,
  goalLabels,
  hydrationLabels,
  moodLabels,
  sleepQualityLabels,
  smokingLabels,
  socialLabels,
  stressLabels,
  vegetableLabels,
} from "@/lib/labels";
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
  allergenLabels,
  BLOOD_PRESSURE_STATUSES,
  BLOOD_SUGAR_STATUSES,
  bloodPressureLabels,
  bloodSugarLabels,
  CHOLESTEROL_STATUSES,
  cholesterolLabels,
  DIET_PATTERNS,
  DIET_REQUIREMENTS,
  dietPatternLabels,
  dietRequirementLabels,
  ENERGY_LEVELS,
  energyLabels,
  REACTION_TYPES,
  reactionLabels,
  type ReactionType,
  EATING_PATTERNS,
  eatingPatternLabels,
  MOBILITY_LIMITS,
  mobilityLabels,
  WELLNESS_GOALS,
  wellnessGoalLabels,
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
  function add() {
    const clean = food.trim().toLowerCase().slice(0, 40);
    if (!clean) return;
    onChange([...reactions.filter((item) => item.food !== clean), { food: clean, type }]);
    setFood("");
  }
  return (
    <fieldset className="field">
      <legend>Other allergies, intolerances, or sensitivities</legend>
      <p className="hint">
        For example a specific fruit, vegetable, or ingredient. Start typing to search, or type your own. A diagnosed allergy is a strict exclusion. Intolerances and sensitivities are also left out of meal ideas.
      </p>
      <div className="inline-form">
        <input
          aria-label="Food"
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
        <select aria-label="Kind of reaction" value={type} onChange={(event) => setType(event.target.value as ReactionType)}>
          {REACTION_TYPES.map((value) => (
            <option key={value} value={value}>
              {reactionLabels[value]}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" type="button" onClick={add}>
          Add
        </button>
      </div>
      {reactions.length > 0 ? (
        <ul className="chip-list">
          {reactions.map((item) => (
            <li key={item.food} className="chip">
              {item.food} · {reactionLabels[item.type]}
              <button
                type="button"
                className="chip-remove"
                aria-label={`Remove ${item.food}`}
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

const stepCopy: Record<StepId, { title: string; why: string }> = {
  about: {
    title: "About you",
    why: "Name and age range are optional. An exact age and the female or male column are asked only because the official population table is organized that way. Height, weight, and a country note are optional context. They are not identifiers, and they are not a score.",
  },
  sleep: {
    title: "Sleep",
    why: "Sleep is one of the habits the suggestions and WHAT IF? illustrations can talk about. A rough answer is enough.",
  },
  movement: {
    title: "Movement",
    why: "These questions describe a typical week, not a test. Sitting time is included because public guidance talks about both activity and sedentary time.",
  },
  nourishment: {
    title: "Food and water",
    why: "This is a pattern, not a food diary and not a diet score.",
  },
  substances: {
    title: "Tobacco and alcohol",
    why: "These are optional. You can skip them. They are here because public health sources discuss both, and because some people want them in the picture.",
  },
  mind: {
    title: "Stress, mood, and people",
    why: "A simple description helps the suggestions stay relevant. It is not a mental health screening.",
  },
  health: {
    title: "Health information",
    why: "Every question here is optional, and \u201cI don't know\u201d or \u201cPrefer not to answer\u201d are fine. LifeZoi uses these answers only to keep suggestions safe, for example skipping your allergens or offering seated movement. It never fills in a missing measurement and does not diagnose.",
  },
  goals: {
    title: "What you want to work on",
    why: "Choose at least one focus. lifeZoi uses this, with your other answers, to decide what to emphasize.",
  },
  results: {
    title: "UPLOAD YOUR HEALTH RESULTS (OPTIONAL)",
    why: "Nothing is uploaded or analyzed. This step does not send a file anywhere.",
  },
  review: {
    title: "Review",
    why: "Check the answers before saving them in this browser tab. You can come back and change them.",
  },
};

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
            <span className="choice-mark">{value === option.value ? "Selected" : ""}</span>
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  if (!ready) return <LoadingState label="Loading your assessment…" />;

  const step = STEP_IDS[session.draftStep] ?? "about";
  const draft = session.draft;
  const copy = stepCopy[step];

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
        <p className="kicker">Lifestyle assessment</p>
        <h1>{copy.title}</h1>
        <p className="lede">{copy.why}</p>
      </div>
      <div>
        <div className="progress-label">
          <span>
            Step {session.draftStep + 1} of {STEP_IDS.length}
          </span>
          <span>{copy.title}</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEP_IDS.length}
          aria-valuenow={session.draftStep + 1}
          aria-label="Assessment progress"
        >
          <span style={{ width: `${((session.draftStep + 1) / STEP_IDS.length) * 100}%` }} />
        </div>
      </div>
      {sample ? (
        <p className="banner banner-sample">
          You are viewing sample answers. They cannot be edited. Turn the sample off in Settings to use your own.
        </p>
      ) : null}
      {saved ? (
        <p className="alert alert-ok" role="status">
          Saved in this browser tab. It is not stored in an account.{" "}
          <Link href="/outlook">See the educational outlook</Link>, <Link href="/dashboard">go to the dashboard</Link>, or <Link href="/what-if">open WHAT IF?</Link>
        </p>
      ) : null}
      {errors.form ? (
        <p className="alert alert-error" role="alert">
          {errors.form}
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
                <span>What should lifeZoi call you?</span>
                <span className="hint">Optional. Leave blank to skip.</span>
                <input
                  id="displayName"
                  type="text"
                  maxLength={40}
                  value={draft.displayName}
                  onChange={(event) => update({ displayName: event.target.value })}
                />
              </label>
              <Choice
                legend="Age range"
                name="ageRange"
                value={draft.ageRange}
                options={AGE_RANGES.map((value) => ({ value, label: ageLabels[value] }))}
                onChange={(ageRange) => update({ ageRange })}
              />
              <NumberField
                id="exactAge"
                label="Exact age"
                hint="Optional. Used only to look up one published population row. Leave blank to skip the number."
                value={draft.exactAge}
                max={100}
                error={errors.exactAge}
                onChange={(exactAge) => update({ exactAge })}
              />
              <Choice
                legend="Which published column should the population table use?"
                name="tableSex"
                value={draft.tableSex}
                options={TABLE_SEX.map((value) => ({
                  value,
                  label: value === "prefer-not" ? "Prefer not to say" : value === "another" ? "Another or not listed" : value === "female" ? "Female column" : "Male column",
                }))}
                onChange={(tableSex) => update({ tableSex })}
              />
              <p className="hint">The official table has female and male columns only. Another answer will not be assigned a column.</p>
              <label className="field" htmlFor="populationNote">
                <span>Country or population you want noted</span>
                <span className="hint">Optional. The embedded table is the Social Security area, not a substitute for another country.</span>
                <input id="populationNote" value={draft.populationNote} maxLength={280} onChange={(event) => update({ populationNote: event.target.value })} />
              </label>
              <NumberField
                id="heightCm"
                label="Height in centimeters"
                hint="Optional. Stored as what you report. Not used to invent a result."
                value={draft.heightCm}
                max={250}
                error={errors.heightCm}
                onChange={(heightCm) => update({ heightCm })}
              />
              <NumberField
                id="weightKg"
                label="Weight in kilograms"
                hint="Optional. Stored as what you report. Not used to invent a result."
                value={draft.weightKg}
                max={300}
                error={errors.weightKg}
                onChange={(weightKg) => update({ weightKg })}
              />
              <NumberField
                id="desiredWeightKg"
                label="Desired weight in kilograms"
                hint="Optional. Only used if one of your goals is about weight. It is your own target, not a medical recommendation."
                value={draft.desiredWeightKg}
                max={300}
                error={errors.desiredWeightKg}
                onChange={(desiredWeightKg) => update({ desiredWeightKg })}
              />
            </>
          ) : null}
          {step === "sleep" ? (
            <>
              <NumberField
                id="sleepHours"
                label="Hours of sleep on a typical night"
                hint="A rough number from 0 to 24 is enough."
                value={draft.sleepHours}
                max={24}
                error={errors.sleepHours}
                onChange={(sleepHours) => update({ sleepHours })}
              />
              <Choice
                legend="How does that sleep usually feel?"
                name="sleepQuality"
                value={draft.sleepQuality}
                error={errors.sleepQuality}
                options={SLEEP_QUALITIES.map((value) => ({
                  value,
                  label: sleepQualityLabels[value],
                }))}
                onChange={(sleepQuality) => update({ sleepQuality })}
              />
            </>
          ) : null}
          {step === "movement" ? (
            <>
              <NumberField
                id="activityDays"
                label="Days with physical activity in a typical week"
                hint="Count brisk walking and anything of similar effort. Whole days from 0 to 7."
                value={draft.activityDays}
                max={7}
                error={errors.activityDays}
                onChange={(activityDays) => update({ activityDays })}
              />
              <NumberField
                id="activityMinutes"
                label="Minutes on those days"
                hint="If you chose 0 days, you can leave this blank. Otherwise enter 0 to 300."
                value={draft.activityMinutes}
                max={300}
                error={errors.activityMinutes}
                onChange={(activityMinutes) => update({ activityMinutes })}
              />
              <NumberField
                id="sedentaryHours"
                label="Hours sitting or reclining while awake"
                hint="A typical day, from 0 to 24. This is an estimate."
                value={draft.sedentaryHours}
                max={24}
                error={errors.sedentaryHours}
                onChange={(sedentaryHours) => update({ sedentaryHours })}
              />
              <p className="hint">Walking, strength, balance, and flexibility are optional. They help the plan name a kind of movement. There is no required distance.</p>
              {(["walking", "strength", "balance", "flexibility"] as const).map((name) => (
                <Choice
                  key={name}
                  legend={name === "walking" ? "Walking" : name === "strength" ? "Strength" : name === "balance" ? "Balance" : "Flexibility"}
                  name={name}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: vegetableLabels[value] }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "nourishment" ? (
            <>
              <Choice
                legend="Vegetables or fruit"
                name="vegetables"
                value={draft.vegetables}
                error={errors.vegetables}
                options={VEGETABLE_PATTERNS.map((value) => ({
                  value,
                  label: vegetableLabels[value],
                }))}
                onChange={(vegetables) => update({ vegetables })}
              />
              <Choice
                legend="Water across the day"
                name="hydration"
                value={draft.hydration}
                error={errors.hydration}
                options={HYDRATION_PATTERNS.map((value) => ({
                  value,
                  label: hydrationLabels[value],
                }))}
                onChange={(hydration) => update({ hydration })}
              />
              <Choice
                legend="How do you usually eat?"
                name="eatingPattern"
                value={draft.eatingPattern}
                options={EATING_PATTERNS.map((value) => ({ value, label: eatingPatternLabels[value] }))}
                onChange={(eatingPattern) => update({ eatingPattern })}
              />
              <p className="hint">Fruit, fiber, protein, and added sugar are optional. Natural sugar in fruit is not treated as the same thing as sugary drinks.</p>
              {([
                ["fruit", "Fruit"],
                ["fiber", "Fiber foods"],
                ["protein", "Protein foods"],
                ["addedSugar", "Added sugar or sugary drinks"],
              ] as const).map(([name, label]) => (
                <Choice
                  key={name}
                  legend={label}
                  name={name}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: vegetableLabels[value] }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "substances" ? (
            <>
              <Choice
                legend="Tobacco"
                name="smoking"
                value={draft.smoking}
                options={SMOKING_PATTERNS.map((value) => ({
                  value,
                  label: smokingLabels[value],
                }))}
                onChange={(smoking) => update({ smoking })}
              />
              <Choice
                legend="Alcohol"
                name="alcohol"
                value={draft.alcohol}
                options={ALCOHOL_PATTERNS.map((value) => ({
                  value,
                  label: alcoholLabels[value],
                }))}
                onChange={(alcohol) => update({ alcohol })}
              />
              <button className="btn btn-ghost" type="button" onClick={() => goTo(session.draftStep + 1)}>
                Skip this step
              </button>
            </>
          ) : null}
          {step === "mind" ? (
            <>
              <Choice
                legend="Stress lately"
                name="stress"
                value={draft.stress}
                error={errors.stress}
                options={STRESS_LEVELS.map((value) => ({ value, label: stressLabels[value] }))}
                onChange={(stress) => update({ stress })}
              />
              <Choice
                legend="Mood lately"
                name="mood"
                value={draft.mood}
                error={errors.mood}
                options={MOOD_LEVELS.map((value) => ({ value, label: moodLabels[value] }))}
                onChange={(mood) => update({ mood })}
              />
              <Choice
                legend="Connection with other people"
                name="social"
                value={draft.social}
                error={errors.social}
                options={SOCIAL_LEVELS.map((value) => ({ value, label: socialLabels[value] }))}
                onChange={(social) => update({ social })}
              />
              <p className="hint">These notes are optional and sensitive. They are asked so you can remember what to discuss with a clinician. lifeZoi does not diagnose from them and does not need your name, address, or record number.</p>
              <label className="field" htmlFor="conditionsNote">
                <span>Conditions you want to mention</span>
                <textarea id="conditionsNote" maxLength={280} value={draft.conditionsNote} onChange={(event) => update({ conditionsNote: event.target.value })} />
              </label>
              <label className="field" htmlFor="familyNote">
                <span>Family history you want to mention</span>
                <textarea id="familyNote" maxLength={280} value={draft.familyNote} onChange={(event) => update({ familyNote: event.target.value })} />
              </label>
              <label className="field" htmlFor="bloodPressure">
                <span>Blood pressure, if you already know it</span>
                <input id="bloodPressure" value={draft.bloodPressure} maxLength={40} onChange={(event) => update({ bloodPressure: event.target.value })} />
              </label>
              <label className="field" htmlFor="glucose">
                <span>Glucose, if you already know it</span>
                <input id="glucose" value={draft.glucose} maxLength={40} onChange={(event) => update({ glucose: event.target.value })} />
              </label>
              <label className="field" htmlFor="hba1c">
                <span>HbA1c, if you already know it</span>
                <input id="hba1c" value={draft.hba1c} maxLength={40} onChange={(event) => update({ hba1c: event.target.value })} />
              </label>
              <label className="field" htmlFor="cholesterol">
                <span>Cholesterol, if you already know it</span>
                <input id="cholesterol" value={draft.cholesterol} maxLength={40} onChange={(event) => update({ cholesterol: event.target.value })} />
              </label>
            </>
          ) : null}
          {step === "health" ? (
            <>
              <Choice
                legend="How is your energy on a typical day?"
                name="energyLevel"
                value={draft.energyLevel}
                options={ENERGY_LEVELS.map((value) => ({ value, label: energyLabels[value] }))}
                onChange={(energyLevel) => update({ energyLevel })}
              />
              <Choice
                legend="Blood sugar"
                name="bloodSugarStatus"
                value={draft.bloodSugarStatus}
                options={BLOOD_SUGAR_STATUSES.map((value) => ({ value, label: bloodSugarLabels[value] }))}
                onChange={(bloodSugarStatus) => update({ bloodSugarStatus })}
              />
              <Choice
                legend="Cholesterol"
                name="cholesterolStatus"
                value={draft.cholesterolStatus}
                options={CHOLESTEROL_STATUSES.map((value) => ({ value, label: cholesterolLabels[value] }))}
                onChange={(cholesterolStatus) => update({ cholesterolStatus })}
              />
              <Choice
                legend="Blood pressure"
                name="bloodPressureStatus"
                value={draft.bloodPressureStatus}
                options={BLOOD_PRESSURE_STATUSES.map((value) => ({ value, label: bloodPressureLabels[value] }))}
                onChange={(bloodPressureStatus) => update({ bloodPressureStatus })}
              />
              <p className="hint">
                If you have actual lab numbers, you can type them on the previous step (blood pressure, glucose, HbA1c, cholesterol). Leave them blank if you do not have them. LifeZoi never guesses a number.
              </p>
              <CheckList
                legend="Diagnosed food allergies"
                hint="Optional. These are treated as strict exclusions: no recipe with them is suggested."
                values={draft.foodAllergies}
                options={ALLERGENS.map((value) => ({ value, label: allergenLabels[value] }))}
                onChange={(foodAllergies) => update({ foodAllergies })}
              />
              <ReactionEditor
                reactions={draft.foodReactions}
                onChange={(foodReactions) => update({ foodReactions })}
              />
              <CheckList
                legend="Do you follow any religious, cultural, or personal dietary requirements?"
                hint="Optional. Choose all that apply. LifeZoi only uses what you choose here and never guesses."
                values={draft.dietRequirements}
                options={DIET_REQUIREMENTS.map((value) => ({ value, label: dietRequirementLabels[value] }))}
                onChange={(dietRequirements) => {
                  const added = dietRequirements.find((item) => !draft.dietRequirements.includes(item));
                  update({
                    dietRequirements:
                      added === "prefer-not" ? ["prefer-not"] : dietRequirements.filter((item) => item !== "prefer-not"),
                  });
                }}
              />
              <CheckList
                legend="How do you eat?"
                hint="Choose any combination."
                values={draft.dietPatterns}
                options={DIET_PATTERNS.map((value) => ({ value, label: dietPatternLabels[value] }))}
                onChange={(dietPatterns) => {
                  const added = dietPatterns.find((item) => !draft.dietPatterns.includes(item));
                  update({ dietPatterns: added === "none" ? ["none"] : dietPatterns.filter((item) => item !== "none") });
                }}
              />
              <label className="field" htmlFor="dietNote">
                <span>Other requirements or preferences</span>
                <input id="dietNote" maxLength={140} value={draft.dietNote} onChange={(event) => update({ dietNote: event.target.value })} />
              </label>
              <CheckList
                legend="Mobility"
                hint="Optional. This helps LifeZoi offer seated or supported movement first."
                values={draft.mobilityLimits}
                options={MOBILITY_LIMITS.map((value) => ({ value, label: mobilityLabels[value] }))}
                onChange={(mobilityLimits) => {
                  const added = mobilityLimits.find((item) => !draft.mobilityLimits.includes(item));
                  if (added === "none" || added === "prefer-not") update({ mobilityLimits: [added] });
                  else update({ mobilityLimits: mobilityLimits.filter((item) => item !== "none" && item !== "prefer-not") });
                }}
              />
              <label className="field" htmlFor="exerciseRestrictions">
                <span>Current injuries or exercise restrictions</span>
                <span className="hint">Optional. For example, &ldquo;no kneeling after knee surgery&rdquo;.</span>
                <textarea id="exerciseRestrictions" maxLength={280} value={draft.exerciseRestrictions} onChange={(event) => update({ exerciseRestrictions: event.target.value })} />
              </label>
              <button className="btn btn-ghost" type="button" onClick={() => goTo(session.draftStep + 1)}>
                Skip this step
              </button>
            </>
          ) : null}
          {step === "results" ? (
            <div className="upload-placeholder" role="note">
              <p>
                <strong>Nothing is uploaded or analyzed.</strong>
              </p>
              <p>
                There is no file control here. A lab report, photo, or other document is not received, stored, or read.
              </p>
              <p>
                Blood pressure, glucose, HbA1c, and cholesterol can still be typed by hand on Stress, mood, and people. Those notes stay in this browser tab. They are not a diagnosis.
              </p>
            </div>
          ) : null}
          {step === "goals" ? (
            <>
              <CheckList
                legend="Your personal goals"
                hint="Choose as many as you like. You can change them at any time."
                values={draft.wellnessGoals}
                options={WELLNESS_GOALS.map((value) => ({ value, label: wellnessGoalLabels[value] }))}
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
                  legend="Which goal matters most right now?"
                  name="primaryGoal"
                  value={draft.primaryGoal}
                  options={draft.wellnessGoals.map((value) => ({ value, label: wellnessGoalLabels[value] }))}
                  onChange={(primaryGoal) => update({ primaryGoal })}
                />
              ) : null}
              <fieldset className="field">
                <legend>Habits to track day by day (choose one or more)</legend>
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
                      <span>{goalLabels[goal]}</span>
                    </label>
                  ))}
                </div>
                {errors.goals ? (
                  <p className="field-error" role="alert">
                    {errors.goals}
                  </p>
                ) : null}
              </fieldset>
              <label className="field" htmlFor="habitNote">
                <span>Anything you want to remember</span>
                <span className="hint">Optional. 280 characters or fewer.</span>
                <textarea
                  id="habitNote"
                  maxLength={280}
                  value={draft.habitNote}
                  onChange={(event) => update({ habitNote: event.target.value })}
                />
              </label>
              <label className="field" htmlFor="purposeHope">
                <span>What would you like your health to help you experience or accomplish?</span>
                <span className="hint">
                  Optional, and separate from the health answers above. This is a personal hope, not a medical score. 280 characters or fewer.
                </span>
                <textarea
                  id="purposeHope"
                  maxLength={280}
                  value={draft.purposeHope}
                  onChange={(event) => update({ purposeHope: event.target.value })}
                />
                {errors.purposeHope ? (
                  <p className="field-error" role="alert">
                    {errors.purposeHope}
                  </p>
                ) : null}
              </label>
            </>
          ) : null}
          {step === "review" ? (
            <div className="stack">
              <p>Saving keeps this version in the browser tab and adds it to your progress history.</p>
              <Review draft={draft} onEdit={(index) => goTo(index)} />
            </div>
          ) : null}
        </fieldset>
        <div className="actions">
          {session.draftStep > 0 ? (
            <button className="btn btn-ghost" type="button" onClick={() => goTo(session.draftStep - 1)}>
              Back
            </button>
          ) : null}
          {step === "review" ? (
            <button className="btn btn-primary" type="submit" disabled={sample}>
              Save assessment
            </button>
          ) : (
            <button className="btn btn-primary" type="submit" disabled={sample}>
              Continue
            </button>
          )}
        </div>
      </form>
      <p className="footer-note">
        This assessment is not a diagnosis and not a substitute for professional care.
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
  const items: { label: string; value: string; step: StepId }[] = [
    { label: "Name", value: draft.displayName || "Not provided", step: "about" },
    {
      label: "Age range",
      value: draft.ageRange ? ageLabels[draft.ageRange] : "Not provided",
      step: "about",
    },
    { label: "Exact age", value: draft.exactAge || "Not provided", step: "about" },
    {
      label: "Life table column",
      value:
        draft.tableSex === "female"
          ? "Female column"
          : draft.tableSex === "male"
            ? "Male column"
            : draft.tableSex === "another"
              ? "Another or not listed"
              : draft.tableSex === "prefer-not"
                ? "Prefer not to say"
                : "Not provided",
      step: "about",
    },
    { label: "Population note", value: draft.populationNote || "Not provided", step: "about" },
    { label: "Height", value: draft.heightCm ? `${draft.heightCm} cm` : "Not provided", step: "about" },
    { label: "Weight", value: draft.weightKg ? `${draft.weightKg} kg` : "Not provided", step: "about" },
    { label: "Desired weight", value: draft.desiredWeightKg ? `${draft.desiredWeightKg} kg` : "Not provided", step: "about" },
    {
      label: "Sleep",
      value: draft.sleepHours
        ? `${draft.sleepHours} hours, ${draft.sleepQuality ? sleepQualityLabels[draft.sleepQuality] : "quality not set"}`
        : "Not provided",
      step: "sleep",
    },
    {
      label: "Activity",
      value: draft.activityDays
        ? `${draft.activityDays} days, ${draft.activityMinutes || "0"} minutes`
        : "Not provided",
      step: "movement",
    },
    {
      label: "Sitting or reclining",
      value: draft.sedentaryHours ? `${draft.sedentaryHours} hours` : "Not provided",
      step: "movement",
    },
    { label: "Walking", value: draft.walking ? vegetableLabels[draft.walking] : "Not provided", step: "movement" },
    { label: "Strength", value: draft.strength ? vegetableLabels[draft.strength] : "Not provided", step: "movement" },
    { label: "Balance", value: draft.balance ? vegetableLabels[draft.balance] : "Not provided", step: "movement" },
    { label: "Flexibility", value: draft.flexibility ? vegetableLabels[draft.flexibility] : "Not provided", step: "movement" },
    {
      label: "Vegetables and fruit",
      value: draft.vegetables ? vegetableLabels[draft.vegetables] : "Not provided",
      step: "nourishment",
    },
    { label: "Fruit", value: draft.fruit ? vegetableLabels[draft.fruit] : "Not provided", step: "nourishment" },
    { label: "Fiber", value: draft.fiber ? vegetableLabels[draft.fiber] : "Not provided", step: "nourishment" },
    { label: "Protein", value: draft.protein ? vegetableLabels[draft.protein] : "Not provided", step: "nourishment" },
    { label: "Added sugar or sugary drinks", value: draft.addedSugar ? vegetableLabels[draft.addedSugar] : "Not provided", step: "nourishment" },
    {
      label: "Water",
      value: draft.hydration ? hydrationLabels[draft.hydration] : "Not provided",
      step: "nourishment",
    },
    {
      label: "Tobacco",
      value: draft.smoking ? smokingLabels[draft.smoking] : "Not provided",
      step: "substances",
    },
    {
      label: "Alcohol",
      value: draft.alcohol ? alcoholLabels[draft.alcohol] : "Not provided",
      step: "substances",
    },
    {
      label: "Stress",
      value: draft.stress ? stressLabels[draft.stress] : "Not provided",
      step: "mind",
    },
    {
      label: "Mood",
      value: draft.mood ? moodLabels[draft.mood] : "Not provided",
      step: "mind",
    },
    {
      label: "Social connection",
      value: draft.social ? socialLabels[draft.social] : "Not provided",
      step: "mind",
    },
    { label: "Conditions you reported", value: draft.conditionsNote || "Not provided", step: "mind" },
    { label: "Family history you reported", value: draft.familyNote || "Not provided", step: "mind" },
    { label: "Blood pressure you typed", value: draft.bloodPressure || "Not provided", step: "mind" },
    { label: "Glucose you typed", value: draft.glucose || "Not provided", step: "mind" },
    { label: "HbA1c you typed", value: draft.hba1c || "Not provided", step: "mind" },
    { label: "Cholesterol you typed", value: draft.cholesterol || "Not provided", step: "mind" },
    { label: "Eating pattern", value: draft.eatingPattern ? eatingPatternLabels[draft.eatingPattern] : "Not provided", step: "nourishment" },
    { label: "Blood sugar", value: draft.bloodSugarStatus ? bloodSugarLabels[draft.bloodSugarStatus] : "Not provided", step: "health" },
    { label: "Cholesterol status", value: draft.cholesterolStatus ? cholesterolLabels[draft.cholesterolStatus] : "Not provided", step: "health" },
    { label: "Blood pressure status", value: draft.bloodPressureStatus ? bloodPressureLabels[draft.bloodPressureStatus] : "Not provided", step: "health" },
    {
      label: "Food allergies",
      value: [...draft.foodAllergies.map((item) => allergenLabels[item]), draft.allergyNote].filter(Boolean).join(", ") || "Not provided",
      step: "health",
    },
    {
      label: "Other food reactions",
      value: draft.foodReactions.map((item) => `${item.food} (${reactionLabels[item.type].toLowerCase()})`).join(", ") || "Not provided",
      step: "health",
    },
    {
      label: "Dietary requirements",
      value: draft.dietRequirements.map((item) => dietRequirementLabels[item]).join(", ") || "Not provided",
      step: "health",
    },
    {
      label: "Eating pattern choices",
      value: [...draft.dietPatterns.map((item) => dietPatternLabels[item]), draft.dietNote].filter(Boolean).join(", ") || "Not provided",
      step: "health",
    },
    { label: "Energy", value: draft.energyLevel ? energyLabels[draft.energyLevel] : "Not provided", step: "health" },
    { label: "Mobility", value: draft.mobilityLimits.map((item) => mobilityLabels[item]).join(", ") || "Not provided", step: "health" },
    { label: "Injuries or exercise restrictions", value: draft.exerciseRestrictions || "Not provided", step: "health" },
    {
      label: "Personal goals",
      value: draft.wellnessGoals.map((goal) => wellnessGoalLabels[goal]).join(", ") || "Not provided",
      step: "goals",
    },
    { label: "Primary goal", value: draft.primaryGoal ? wellnessGoalLabels[draft.primaryGoal] : "Not provided", step: "goals" },
    {
      label: "Focus",
      value: draft.goals.length ? draft.goals.map((goal) => goalLabels[goal]).join(", ") : "Not provided",
      step: "goals",
    },
    { label: "Note", value: draft.habitNote || "Not provided", step: "goals" },
    {
      label: "Hope for what health could support",
      value: draft.purposeHope || "Not provided",
      step: "goals",
    },
  ];
  return (
    <dl className="review-list">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            {item.value}{" "}
            <button className="btn btn-ghost" type="button" onClick={() => onEdit(STEP_IDS.indexOf(item.step))}>
              Edit {item.label}
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}
