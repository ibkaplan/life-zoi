"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { useAccount } from "@/lib/account-store";
import { LoadingState } from "@/components/sources";
import { CheckQuestion, ChoiceQuestion, TextQuestion } from "@/components/assessment/question-fields";
import { fieldLabel, fieldStep, friendlyError, orderedErrorFields } from "@/lib/assessment-fields";
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
    <fieldset className="qz-field qz-group">
      <legend className="qz-label">Other allergies, intolerances, or sensitivities</legend>
      <p className="qz-hint">
        For example a specific fruit, vegetable, or ingredient. Start typing to search, or type your own. A diagnosed allergy is a strict exclusion. Intolerances and sensitivities are also left out of meal ideas.
      </p>
      <div className="qz-reaction">
        <div className="qz-subfield">
          <label className="qz-sublabel" htmlFor="reaction-food">
            Food
          </label>
          <input
            id="reaction-food"
            className="qz-input"
            type="text"
            list="assessment-food-words"
            placeholder="For example: strawberries"
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
        </div>
        <div className="qz-subfield">
          <label className="qz-sublabel" htmlFor="reaction-type">
            Kind of reaction
          </label>
          <select id="reaction-type" className="qz-input qz-select" value={type} onChange={(event) => setType(event.target.value as ReactionType)}>
            {REACTION_TYPES.map((value) => (
              <option key={value} value={value}>
                {reactionLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-secondary qz-add" type="button" onClick={add}>
          + Add this food
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

const OPTIONAL_ONE = "Optional. Choose one.";

/** Moves the person to a question that needs attention: scroll it into view and put the cursor there. */
function focusField(field: string) {
  const target = document.getElementById(field === "form" ? "assessment-form-error" : field);
  if (!target) return false;
  const control =
    target instanceof HTMLFieldSetElement
      ? (target.querySelector<HTMLInputElement>("input:checked") ?? target.querySelector<HTMLInputElement>("input"))
      : target;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  (control ?? target).focus({ preventScroll: true });
  return true;
}

export function AssessmentWizard() {
  const { ready, sample, session, setDraft, setDraftStep, completeAssessment } = useSession();
  const accountReady = useAccount().phase === "ready";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  // Which question to move to after the next render. A new object each time, so the same field can be requested twice.
  const [focusTarget, setFocusTarget] = useState<{ field: string } | null>(null);

  useEffect(() => {
    if (focusTarget) focusField(focusTarget.field);
  }, [focusTarget]);

  if (!ready) return <LoadingState label="Loading your assessment…" />;

  const step = STEP_IDS[session.draftStep] ?? "about";
  const draft = session.draft;
  const copy = stepCopy[step];
  const errorFields = orderedErrorFields(errors);
  const err = (field: string) => (errors[field] ? friendlyError(field, errors[field]) : undefined);

  function update(partial: Partial<Assessment>) {
    setSaved(false);
    setDraft({ ...draft, ...partial });
  }

  function goTo(index: number) {
    setErrors({});
    setDraftStep(index);
  }

  /** Show errors, open the step that holds the first one, and move the person to it. */
  function showErrors(nextErrors: Record<string, string>, fallbackStep: StepId) {
    setErrors(nextErrors);
    const first = orderedErrorFields(nextErrors)[0];
    const target = (first && fieldStep(first)) || fallbackStep;
    if (target !== step) setDraftStep(STEP_IDS.indexOf(target));
    setFocusTarget({ field: first ?? "form" });
  }

  function continueStep() {
    const nextErrors = validateStep(step, draft);
    if (Object.keys(nextErrors).length > 0) {
      showErrors(nextErrors, step);
      return;
    }
    goTo(Math.min(session.draftStep + 1, STEP_IDS.length - 1));
  }

  function save() {
    const invalid = firstInvalidStep(draft);
    if (invalid) {
      showErrors(validateStep(invalid, draft), invalid);
      return;
    }
    const result = completeAssessment();
    if (!result.ok) {
      showErrors(result.fields, step);
      return;
    }
    setErrors({});
    setSaved(true);
  }

  function jumpTo(field: string) {
    const target = fieldStep(field);
    if (target && target !== step) setDraftStep(STEP_IDS.indexOf(target));
    setFocusTarget({ field });
  }

  return (
    <div className="stack-lg narrow qz">
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
          {accountReady ? "Saved to your account as a new assessment. Earlier assessments are kept." : "Saved in this browser tab as a new assessment. Sign in to keep it in your account."}{" "}
          <Link href="/plan">Open My Life Improvement Plan</Link>,
          <Link href="/outlook">See the educational outlook</Link>, <Link href="/dashboard">go to the dashboard</Link>, or <Link href="/what-if">open WHAT IF?</Link>
        </p>
      ) : null}
      {errors.form ? (
        <p className="alert alert-error" role="alert" id="assessment-form-error" tabIndex={-1}>
          {errors.form}
        </p>
      ) : null}
      <form
        className="card stack qz-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step === "review") save();
          else continueStep();
        }}
      >
        <p className="qz-instructions">
          Type your answer in the white boxes. Tap or click a card to choose it. A purple card with a check mark is selected.
        </p>
        {errorFields.length > 0 ? (
          <div className="qz-summary" role="alert" aria-labelledby="qz-summary-title">
            <p id="qz-summary-title" className="qz-summary-title">
              {errorFields.length === 1 ? "One answer needs attention:" : `${errorFields.length} answers need attention:`}
            </p>
            <ul>
              {errorFields.map((field) => (
                <li key={field}>
                  <button type="button" className="qz-summary-link" onClick={() => jumpTo(field)}>
                    {friendlyError(field, errors[field])}
                    {fieldStep(field) && fieldStep(field) !== step ? ` (on ${stepCopy[fieldStep(field) as StepId].title})` : ""}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <fieldset disabled={sample} className="stack qz-body">
          {step === "about" ? (
            <>
              <TextQuestion
                id="displayName"
                label={fieldLabel("displayName")}
                hint="Optional. Leave blank to skip."
                placeholder="Enter your name"
                maxLength={40}
                value={draft.displayName}
                error={err("displayName")}
                onChange={(displayName) => update({ displayName })}
              />
              <ChoiceQuestion
                legend="Age range"
                name="ageRange"
                hint={OPTIONAL_ONE}
                value={draft.ageRange}
                options={AGE_RANGES.map((value) => ({ value, label: ageLabels[value] }))}
                onChange={(ageRange) => update({ ageRange })}
              />
              <TextQuestion
                id="exactAge"
                label={fieldLabel("exactAge")}
                hint="Optional. Used only to look up one published population row. Leave blank to skip the number."
                placeholder="Enter your age"
                unit="years"
                inputMode="numeric"
                maxLength={3}
                value={draft.exactAge}
                error={err("exactAge")}
                onChange={(exactAge) => update({ exactAge })}
              />
              <ChoiceQuestion
                legend="Which published column should the population table use?"
                name="tableSex"
                hint="Optional. The official table has female and male columns only. Another answer will not be assigned a column."
                value={draft.tableSex}
                options={TABLE_SEX.map((value) => ({
                  value,
                  label: value === "prefer-not" ? "Prefer not to say" : value === "another" ? "Another or not listed" : value === "female" ? "Female column" : "Male column",
                }))}
                onChange={(tableSex) => update({ tableSex })}
              />
              <TextQuestion
                id="populationNote"
                label="Country or population you want noted"
                hint="Optional. The embedded table is the Social Security area, not a substitute for another country."
                placeholder="For example: Canada"
                maxLength={280}
                value={draft.populationNote}
                onChange={(populationNote) => update({ populationNote })}
              />
              <TextQuestion
                id="heightCm"
                label={fieldLabel("heightCm")}
                hint="Optional. Stored as what you report. Not used to invent a result."
                placeholder="Enter your height"
                unit="cm"
                inputMode="numeric"
                maxLength={3}
                value={draft.heightCm}
                error={err("heightCm")}
                onChange={(heightCm) => update({ heightCm })}
              />
              <TextQuestion
                id="weightKg"
                label={fieldLabel("weightKg")}
                hint="Optional. Stored as what you report. Not used to invent a result."
                placeholder="Enter your weight"
                unit="kg"
                inputMode="numeric"
                maxLength={3}
                value={draft.weightKg}
                error={err("weightKg")}
                onChange={(weightKg) => update({ weightKg })}
              />
              <TextQuestion
                id="desiredWeightKg"
                label={fieldLabel("desiredWeightKg")}
                hint="Optional. Only used if one of your goals is about weight. It is your own target, not a medical recommendation."
                placeholder="Enter a weight"
                unit="kg"
                inputMode="numeric"
                maxLength={3}
                value={draft.desiredWeightKg}
                error={err("desiredWeightKg")}
                onChange={(desiredWeightKg) => update({ desiredWeightKg })}
              />
            </>
          ) : null}
          {step === "sleep" ? (
            <>
              <TextQuestion
                id="sleepHours"
                label={fieldLabel("sleepHours")}
                hint="Required. A rough number from 0 to 24 is enough."
                placeholder="Enter hours"
                unit="hours"
                inputMode="decimal"
                maxLength={5}
                value={draft.sleepHours}
                error={err("sleepHours")}
                onChange={(sleepHours) => update({ sleepHours })}
              />
              <ChoiceQuestion
                legend={fieldLabel("sleepQuality")}
                name="sleepQuality"
                hint="Required. Choose one."
                value={draft.sleepQuality}
                error={err("sleepQuality")}
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
              <TextQuestion
                id="activityDays"
                label={fieldLabel("activityDays")}
                hint="Required. Count brisk walking and anything of similar effort. Whole days from 0 to 7."
                placeholder="Enter 0 to 7"
                unit="days"
                inputMode="numeric"
                maxLength={2}
                value={draft.activityDays}
                error={err("activityDays")}
                onChange={(activityDays) => update({ activityDays })}
              />
              <TextQuestion
                id="activityMinutes"
                label={fieldLabel("activityMinutes")}
                hint="If you chose 0 days, you can leave this blank. Otherwise enter 0 to 300."
                placeholder="Enter minutes"
                unit="minutes"
                inputMode="numeric"
                maxLength={3}
                value={draft.activityMinutes}
                error={err("activityMinutes")}
                onChange={(activityMinutes) => update({ activityMinutes })}
              />
              <TextQuestion
                id="sedentaryHours"
                label={fieldLabel("sedentaryHours")}
                hint="Required. A typical day, from 0 to 24. This is an estimate."
                placeholder="Enter hours"
                unit="hours"
                inputMode="decimal"
                maxLength={5}
                value={draft.sedentaryHours}
                error={err("sedentaryHours")}
                onChange={(sedentaryHours) => update({ sedentaryHours })}
              />
              <p className="qz-hint">Walking, strength, balance, and flexibility are optional. They help the plan name a kind of movement. There is no required distance.</p>
              {(["walking", "strength", "balance", "flexibility"] as const).map((name) => (
                <ChoiceQuestion
                  key={name}
                  legend={name === "walking" ? "Walking" : name === "strength" ? "Strength" : name === "balance" ? "Balance" : "Flexibility"}
                  name={name}
                  hint={OPTIONAL_ONE}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: vegetableLabels[value] }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "nourishment" ? (
            <>
              <ChoiceQuestion
                legend={fieldLabel("vegetables")}
                name="vegetables"
                hint="Required. Choose one."
                value={draft.vegetables}
                error={err("vegetables")}
                options={VEGETABLE_PATTERNS.map((value) => ({
                  value,
                  label: vegetableLabels[value],
                }))}
                onChange={(vegetables) => update({ vegetables })}
              />
              <ChoiceQuestion
                legend={fieldLabel("hydration")}
                name="hydration"
                hint="Required. Choose one."
                value={draft.hydration}
                error={err("hydration")}
                options={HYDRATION_PATTERNS.map((value) => ({
                  value,
                  label: hydrationLabels[value],
                }))}
                onChange={(hydration) => update({ hydration })}
              />
              <ChoiceQuestion
                legend="How do you usually eat?"
                name="eatingPattern"
                hint={OPTIONAL_ONE}
                value={draft.eatingPattern}
                options={EATING_PATTERNS.map((value) => ({ value, label: eatingPatternLabels[value] }))}
                onChange={(eatingPattern) => update({ eatingPattern })}
              />
              <p className="qz-hint">Fruit, fiber, protein, and added sugar are optional. Natural sugar in fruit is not treated as the same thing as sugary drinks.</p>
              {([
                ["fruit", "Fruit"],
                ["fiber", "Fiber foods"],
                ["protein", "Protein foods"],
                ["addedSugar", "Added sugar or sugary drinks"],
              ] as const).map(([name, label]) => (
                <ChoiceQuestion
                  key={name}
                  legend={label}
                  name={name}
                  hint={OPTIONAL_ONE}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: vegetableLabels[value] }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "substances" ? (
            <>
              <ChoiceQuestion
                legend="Tobacco"
                name="smoking"
                hint={OPTIONAL_ONE}
                value={draft.smoking}
                options={SMOKING_PATTERNS.map((value) => ({
                  value,
                  label: smokingLabels[value],
                }))}
                onChange={(smoking) => update({ smoking })}
              />
              <ChoiceQuestion
                legend="Alcohol"
                name="alcohol"
                hint={OPTIONAL_ONE}
                value={draft.alcohol}
                options={ALCOHOL_PATTERNS.map((value) => ({
                  value,
                  label: alcoholLabels[value],
                }))}
                onChange={(alcohol) => update({ alcohol })}
              />
              <button className="btn btn-secondary qz-skip" type="button" onClick={() => goTo(session.draftStep + 1)}>
                Skip this step
              </button>
            </>
          ) : null}
          {step === "mind" ? (
            <>
              <ChoiceQuestion
                legend={fieldLabel("stress")}
                name="stress"
                hint="Required. Choose one."
                value={draft.stress}
                error={err("stress")}
                options={STRESS_LEVELS.map((value) => ({ value, label: stressLabels[value] }))}
                onChange={(stress) => update({ stress })}
              />
              <ChoiceQuestion
                legend={fieldLabel("mood")}
                name="mood"
                hint="Required. Choose one."
                value={draft.mood}
                error={err("mood")}
                options={MOOD_LEVELS.map((value) => ({ value, label: moodLabels[value] }))}
                onChange={(mood) => update({ mood })}
              />
              <ChoiceQuestion
                legend={fieldLabel("social")}
                name="social"
                hint="Required. Choose one."
                value={draft.social}
                error={err("social")}
                options={SOCIAL_LEVELS.map((value) => ({ value, label: socialLabels[value] }))}
                onChange={(social) => update({ social })}
              />
              <p className="qz-hint">These notes are optional and sensitive. They are asked so you can remember what to discuss with a clinician. lifeZoi does not diagnose from them and does not need your name, address, or record number.</p>
              <TextQuestion
                id="conditionsNote"
                label="Conditions you want to mention"
                hint="Optional."
                placeholder="Type any conditions you want to remember, or leave blank"
                multiline
                maxLength={280}
                value={draft.conditionsNote}
                onChange={(conditionsNote) => update({ conditionsNote })}
              />
              <TextQuestion
                id="familyNote"
                label="Family history you want to mention"
                hint="Optional."
                placeholder="Type any family history you want to remember, or leave blank"
                multiline
                maxLength={280}
                value={draft.familyNote}
                onChange={(familyNote) => update({ familyNote })}
              />
              <TextQuestion
                id="bloodPressure"
                label="Blood pressure, if you already know it"
                hint="Optional. Copy it as written on your own record."
                placeholder="For example: 128/82"
                maxLength={40}
                value={draft.bloodPressure}
                onChange={(bloodPressure) => update({ bloodPressure })}
              />
              <TextQuestion
                id="glucose"
                label="Glucose, if you already know it"
                hint="Optional. Copy the number and unit as written on your own record."
                placeholder="Type the number and unit, or leave blank"
                maxLength={40}
                value={draft.glucose}
                onChange={(glucose) => update({ glucose })}
              />
              <TextQuestion
                id="hba1c"
                label="HbA1c, if you already know it"
                hint="Optional. Copy the number and unit as written on your own record."
                placeholder="Type the number and unit, or leave blank"
                maxLength={40}
                value={draft.hba1c}
                onChange={(hba1c) => update({ hba1c })}
              />
              <TextQuestion
                id="cholesterol"
                label="Cholesterol, if you already know it"
                hint="Optional. Copy the number and unit as written on your own record."
                placeholder="Type the number and unit, or leave blank"
                maxLength={40}
                value={draft.cholesterol}
                onChange={(cholesterol) => update({ cholesterol })}
              />
            </>
          ) : null}
          {step === "health" ? (
            <>
              <ChoiceQuestion
                legend="How is your energy on a typical day?"
                name="energyLevel"
                hint={OPTIONAL_ONE}
                value={draft.energyLevel}
                options={ENERGY_LEVELS.map((value) => ({ value, label: energyLabels[value] }))}
                onChange={(energyLevel) => update({ energyLevel })}
              />
              <ChoiceQuestion
                legend="Blood sugar"
                name="bloodSugarStatus"
                hint={OPTIONAL_ONE}
                value={draft.bloodSugarStatus}
                options={BLOOD_SUGAR_STATUSES.map((value) => ({ value, label: bloodSugarLabels[value] }))}
                onChange={(bloodSugarStatus) => update({ bloodSugarStatus })}
              />
              <ChoiceQuestion
                legend="Cholesterol"
                name="cholesterolStatus"
                hint={OPTIONAL_ONE}
                value={draft.cholesterolStatus}
                options={CHOLESTEROL_STATUSES.map((value) => ({ value, label: cholesterolLabels[value] }))}
                onChange={(cholesterolStatus) => update({ cholesterolStatus })}
              />
              <ChoiceQuestion
                legend="Blood pressure"
                name="bloodPressureStatus"
                hint={OPTIONAL_ONE}
                value={draft.bloodPressureStatus}
                options={BLOOD_PRESSURE_STATUSES.map((value) => ({ value, label: bloodPressureLabels[value] }))}
                onChange={(bloodPressureStatus) => update({ bloodPressureStatus })}
              />
              <p className="qz-hint">
                If you have actual lab numbers, you can type them on the previous step (blood pressure, glucose, HbA1c, cholesterol). Leave them blank if you do not have them. LifeZoi never guesses a number.
              </p>
              <CheckQuestion
                id="foodAllergies"
                legend="Diagnosed food allergies"
                hint="Optional. Choose all that apply. These are treated as strict exclusions: no recipe with them is suggested."
                values={draft.foodAllergies}
                options={ALLERGENS.map((value) => ({ value, label: allergenLabels[value] }))}
                onChange={(foodAllergies) => update({ foodAllergies })}
              />
              <ReactionEditor
                reactions={draft.foodReactions}
                onChange={(foodReactions) => update({ foodReactions })}
              />
              <CheckQuestion
                id="dietRequirements"
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
              <CheckQuestion
                id="dietPatterns"
                legend="How do you eat?"
                hint="Optional. Choose any combination."
                values={draft.dietPatterns}
                options={DIET_PATTERNS.map((value) => ({ value, label: dietPatternLabels[value] }))}
                onChange={(dietPatterns) => {
                  const added = dietPatterns.find((item) => !draft.dietPatterns.includes(item));
                  update({ dietPatterns: added === "none" ? ["none"] : dietPatterns.filter((item) => item !== "none") });
                }}
              />
              <TextQuestion
                id="dietNote"
                label="Other requirements or preferences"
                hint="Optional."
                placeholder="For example: no pork, low salt"
                maxLength={140}
                value={draft.dietNote}
                onChange={(dietNote) => update({ dietNote })}
              />
              <CheckQuestion
                id="mobilityLimits"
                legend="Mobility"
                hint="Optional. Choose all that apply. This helps LifeZoi offer seated or supported movement first."
                values={draft.mobilityLimits}
                options={MOBILITY_LIMITS.map((value) => ({ value, label: mobilityLabels[value] }))}
                onChange={(mobilityLimits) => {
                  const added = mobilityLimits.find((item) => !draft.mobilityLimits.includes(item));
                  if (added === "none" || added === "prefer-not") update({ mobilityLimits: [added] });
                  else update({ mobilityLimits: mobilityLimits.filter((item) => item !== "none" && item !== "prefer-not") });
                }}
              />
              <TextQuestion
                id="exerciseRestrictions"
                label="Current injuries or exercise restrictions"
                hint="Optional. For example, “no kneeling after knee surgery”."
                placeholder="Type any injuries or restrictions, or leave blank"
                multiline
                maxLength={280}
                value={draft.exerciseRestrictions}
                onChange={(exerciseRestrictions) => update({ exerciseRestrictions })}
              />
              <button className="btn btn-secondary qz-skip" type="button" onClick={() => goTo(session.draftStep + 1)}>
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
              <CheckQuestion
                id="wellnessGoals"
                legend="Your personal goals"
                hint="Optional. Choose as many as you like. You can change them at any time."
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
                <ChoiceQuestion
                  legend="Which goal matters most right now?"
                  name="primaryGoal"
                  value={draft.primaryGoal}
                  options={draft.wellnessGoals.map((value) => ({ value, label: wellnessGoalLabels[value] }))}
                  onChange={(primaryGoal) => update({ primaryGoal })}
                />
              ) : null}
              <CheckQuestion
                id="goals"
                legend={fieldLabel("goals")}
                hint="Required. Choose at least one."
                values={draft.goals}
                options={GOAL_IDS.map((value) => ({ value, label: goalLabels[value] }))}
                error={err("goals")}
                onChange={(goals) => update({ goals })}
              />
              <TextQuestion
                id="habitNote"
                label={fieldLabel("habitNote")}
                hint="Optional. 280 characters or fewer."
                placeholder="Type a note to yourself, or leave blank"
                multiline
                maxLength={280}
                value={draft.habitNote}
                error={err("habitNote")}
                onChange={(habitNote) => update({ habitNote })}
              />
              <TextQuestion
                id="purposeHope"
                label={fieldLabel("purposeHope")}
                hint="Optional, and separate from the health answers above. This is a personal hope, not a medical score. 280 characters or fewer."
                placeholder="For example: keep gardening, travel, play with my grandchildren"
                multiline
                maxLength={280}
                value={draft.purposeHope}
                error={err("purposeHope")}
                onChange={(purposeHope) => update({ purposeHope })}
              />
            </>
          ) : null}
          {step === "review" ? (
            <div className="stack">
              <p>Saving adds this as a new assessment in your history. Earlier assessments are never overwritten.</p>
              <Review draft={draft} onEdit={(index) => goTo(index)} />
            </div>
          ) : null}
        </fieldset>
        <div className="qz-nav">
          {session.draftStep > 0 ? (
            <button className="btn btn-secondary qz-nav-btn" type="button" onClick={() => goTo(session.draftStep - 1)}>
              <span aria-hidden="true">←</span> Back
            </button>
          ) : null}
          {step === "review" ? (
            <button className="btn btn-primary qz-nav-btn qz-nav-next" type="submit" disabled={sample}>
              <span aria-hidden="true">✓</span> Save answers
            </button>
          ) : (
            <button className="btn btn-primary qz-nav-btn qz-nav-next" type="submit" disabled={sample}>
              Continue <span aria-hidden="true">→</span>
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
