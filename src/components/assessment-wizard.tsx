"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session-provider";
import { useMessages, useT } from "@/components/locale-provider";
import { msg } from "@/lib/i18n/translate";
import { translateError } from "@/lib/i18n/translate-error";
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
  DAILY_SETTINGS,
  dailySettingLabels,
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
  const t = useT();
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
      <legend className="qz-label">{t("Other allergies, intolerances, or sensitivities")}</legend>
      <p className="qz-hint">
        {t("For example a specific fruit, vegetable, or ingredient. Start typing to search, or type your own. A diagnosed allergy is a strict exclusion. Intolerances and sensitivities are also left out of meal ideas.")}
      </p>
      <div className="qz-reaction">
        <div className="qz-subfield">
          <label className="qz-sublabel" htmlFor="reaction-food">
            {t("Food")}
          </label>
          <input
            id="reaction-food"
            className="qz-input"
            type="text"
            list="assessment-food-words"
            placeholder={t("For example: strawberries")}
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
            {t("Kind of reaction")}
          </label>
          <select id="reaction-type" className="qz-input qz-select" value={type} onChange={(event) => setType(event.target.value as ReactionType)}>
            {REACTION_TYPES.map((value) => (
              <option key={value} value={value}>
                {t(reactionLabels[value])}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-secondary qz-add" type="button" onClick={add}>
          {t("+ Add this food")}
        </button>
      </div>
      {reactions.length > 0 ? (
        <ul className="chip-list">
          {reactions.map((item) => (
            <li key={item.food} className="chip">
              {item.food} · {t(reactionLabels[item.type])}
              <button
                type="button"
                className="chip-remove"
                aria-label={t("Remove {food}", { food: item.food })}
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
    title: msg("About you"),
    why: msg("Name and age range are optional. An exact age and the female or male column are asked only because the official population table is organized that way. Height, weight, and a country note are optional context. They are not identifiers, and they are not a score."),
  },
  sleep: {
    title: msg("Sleep"),
    why: msg("Sleep is one of the habits the suggestions and WHAT IF? illustrations can talk about. A rough answer is enough."),
  },
  movement: {
    title: msg("Movement"),
    why: msg("These questions describe a typical week, not a test. Sitting time is included because public guidance talks about both activity and sedentary time."),
  },
  nourishment: {
    title: msg("Food and water"),
    why: msg("This is a pattern, not a food diary and not a diet score."),
  },
  substances: {
    title: msg("Tobacco and alcohol"),
    why: msg("These are optional. You can skip them. They are here because public health sources discuss both, and because some people want them in the picture."),
  },
  mind: {
    title: msg("Stress, mood, and people"),
    why: msg("A simple description helps the suggestions stay relevant. It is not a mental health screening."),
  },
  health: {
    title: msg("Health information"),
    why: msg("Every question here is optional, and \u201cI don't know\u201d or \u201cPrefer not to answer\u201d are fine. LifeZoi uses these answers only to keep suggestions safe, for example skipping your allergens or offering seated movement. It never fills in a missing measurement and does not diagnose."),
  },
  goals: {
    title: msg("What you want to work on"),
    why: msg("Choose at least one focus. lifeZoi uses this, with your other answers, to decide what to emphasize."),
  },
  results: {
    title: msg("UPLOAD YOUR HEALTH RESULTS (OPTIONAL)"),
    why: msg("Nothing is uploaded or analyzed. This step does not send a file anywhere."),
  },
  review: {
    title: msg("Review"),
    why: msg("Check the answers before saving them in this browser tab. You can come back and change them."),
  },
};

const OPTIONAL_ONE = msg("Optional. Choose one.");

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
  const t = useT();
  const m = useMessages();
  const { ready, sample, session, setDraft, setDraftStep, completeAssessment } = useSession();
  const accountReady = useAccount().phase === "ready";
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  // Which question to move to after the next render. A new object each time, so the same field can be requested twice.
  const [focusTarget, setFocusTarget] = useState<{ field: string } | null>(null);

  useEffect(() => {
    if (focusTarget) focusField(focusTarget.field);
  }, [focusTarget]);

  if (!ready) return <LoadingState label={t("Loading your assessment…")} />;

  const step = STEP_IDS[session.draftStep] ?? "about";
  const draft = session.draft;
  const copy = stepCopy[step];
  const errorFields = orderedErrorFields(errors);
  const describe = (field: string) =>
    friendlyError(field, errors[field], t, (message) => translateError(message, m) ?? message);
  const err = (field: string) => (errors[field] ? describe(field) : undefined);

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
        <p className="kicker">{t("Lifestyle assessment")}</p>
        <h1>{t(copy.title)}</h1>
        <p className="lede">{t(copy.why)}</p>
      </div>
      <div>
        <div className="progress-label">
          <span>{t("Step {current} of {total}", { current: session.draftStep + 1, total: STEP_IDS.length })}</span>
          <span>{t(copy.title)}</span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEP_IDS.length}
          aria-valuenow={session.draftStep + 1}
          aria-label={t("Assessment progress")}
        >
          <span style={{ width: `${((session.draftStep + 1) / STEP_IDS.length) * 100}%` }} />
        </div>
      </div>
      {sample ? (
        <p className="banner banner-sample">
          {t("You are viewing sample answers. They cannot be edited. Turn the sample off in Settings to use your own.")}
        </p>
      ) : null}
      {saved ? (
        <p className="alert alert-ok" role="status">
          {accountReady ? t("Saved to your account as a new assessment. Earlier assessments are kept.") : t("Saved in this browser tab as a new assessment. Sign in to keep it in your account.")}{" "}
          <Link href="/plan">{t("Open My Life Improvement Plan")}</Link>,{" "}
          <Link href="/outlook">{t("See the educational outlook")}</Link>, <Link href="/dashboard">{t("go to the dashboard")}</Link>, {t("or")}{" "}
          <Link href="/what-if">{t("open WHAT IF?")}</Link>
        </p>
      ) : null}
      {errors.form ? (
        <p className="alert alert-error" role="alert" id="assessment-form-error" tabIndex={-1}>
          {translateError(errors.form, m)}
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
          {t("Type your answer in the white boxes. Tap or click a card to choose it. A purple card with a check mark is selected.")}
        </p>
        {errorFields.length > 0 ? (
          <div className="qz-summary" role="alert" aria-labelledby="qz-summary-title">
            <p id="qz-summary-title" className="qz-summary-title">
              {errorFields.length === 1 ? t("One answer needs attention:") : t("{count} answers need attention:", { count: errorFields.length })}
            </p>
            <ul>
              {errorFields.map((field) => (
                <li key={field}>
                  <button type="button" className="qz-summary-link" onClick={() => jumpTo(field)}>
                    {describe(field)}
                    {fieldStep(field) && fieldStep(field) !== step
                      ? t(" (on {step})", { step: t(stepCopy[fieldStep(field) as StepId].title) })
                      : ""}
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
                label={fieldLabel("displayName", t)}
                hint={t("Optional. Leave blank to skip.")}
                placeholder={t("Enter your name")}
                maxLength={40}
                value={draft.displayName}
                error={err("displayName")}
                onChange={(displayName) => update({ displayName })}
              />
              <ChoiceQuestion
                legend={t("Age range")}
                name="ageRange"
                hint={t(OPTIONAL_ONE)}
                value={draft.ageRange}
                options={AGE_RANGES.map((value) => ({ value, label: t(ageLabels[value]) }))}
                onChange={(ageRange) => update({ ageRange })}
              />
              <TextQuestion
                id="exactAge"
                label={fieldLabel("exactAge", t)}
                hint={t("Optional. Used only to look up one published population row. Leave blank to skip the number.")}
                placeholder={t("Enter your age")}
                unit={t("years")}
                inputMode="numeric"
                maxLength={3}
                value={draft.exactAge}
                error={err("exactAge")}
                onChange={(exactAge) => update({ exactAge })}
              />
              <ChoiceQuestion
                legend={t("Which published column should the population table use?")}
                name="tableSex"
                hint={t("Optional. The official table has female and male columns only. Another answer will not be assigned a column.")}
                value={draft.tableSex}
                options={TABLE_SEX.map((value) => ({
                  value,
                  label: t(value === "prefer-not" ? "Prefer not to say" : value === "another" ? "Another or not listed" : value === "female" ? "Female column" : "Male column"),
                }))}
                onChange={(tableSex) => update({ tableSex })}
              />
              <TextQuestion
                id="populationNote"
                label={t("Country or population you want noted")}
                hint={t("Optional. The embedded table is the Social Security area, not a substitute for another country.")}
                placeholder={t("For example: Canada")}
                maxLength={280}
                value={draft.populationNote}
                onChange={(populationNote) => update({ populationNote })}
              />
              <TextQuestion
                id="heightCm"
                label={fieldLabel("heightCm", t)}
                hint={t("Optional. Stored as what you report. Not used to invent a result.")}
                placeholder={t("Enter your height")}
                unit={t("cm")}
                inputMode="numeric"
                maxLength={3}
                value={draft.heightCm}
                error={err("heightCm")}
                onChange={(heightCm) => update({ heightCm })}
              />
              <TextQuestion
                id="weightKg"
                label={fieldLabel("weightKg", t)}
                hint={t("Optional. Stored as what you report. Not used to invent a result.")}
                placeholder={t("Enter your weight")}
                unit={t("kg")}
                inputMode="numeric"
                maxLength={3}
                value={draft.weightKg}
                error={err("weightKg")}
                onChange={(weightKg) => update({ weightKg })}
              />
              <TextQuestion
                id="desiredWeightKg"
                label={fieldLabel("desiredWeightKg", t)}
                hint={t("Optional. Only used if one of your goals is about weight. It is your own target, not a medical recommendation.")}
                placeholder={t("Enter your goal weight")}
                unit={t("kg")}
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
                label={fieldLabel("sleepHours", t)}
                hint={t("Required. A rough number from 0 to 24 is enough.")}
                placeholder={t("Enter hours of sleep")}
                unit={t("hours")}
                inputMode="decimal"
                maxLength={5}
                value={draft.sleepHours}
                error={err("sleepHours")}
                onChange={(sleepHours) => update({ sleepHours })}
              />
              <ChoiceQuestion
                legend={fieldLabel("sleepQuality", t)}
                name="sleepQuality"
                hint={t("Required. Choose one.")}
                value={draft.sleepQuality}
                error={err("sleepQuality")}
                options={SLEEP_QUALITIES.map((value) => ({
                  value,
                  label: t(sleepQualityLabels[value]),
                }))}
                onChange={(sleepQuality) => update({ sleepQuality })}
              />
            </>
          ) : null}
          {step === "movement" ? (
            <>
              <TextQuestion
                id="activityDays"
                label={fieldLabel("activityDays", t)}
                hint={t("Required. Count brisk walking and anything of similar effort. Whole days from 0 to 7.")}
                placeholder={t("Enter number of days")}
                unit={t("days")}
                inputMode="numeric"
                maxLength={2}
                value={draft.activityDays}
                error={err("activityDays")}
                onChange={(activityDays) => update({ activityDays })}
              />
              <TextQuestion
                id="activityMinutes"
                label={fieldLabel("activityMinutes", t)}
                hint={t("If you chose 0 days, you can leave this blank. Otherwise enter 0 to 300.")}
                placeholder={t("Enter number of minutes")}
                unit={t("minutes")}
                inputMode="numeric"
                maxLength={3}
                value={draft.activityMinutes}
                error={err("activityMinutes")}
                onChange={(activityMinutes) => update({ activityMinutes })}
              />
              <TextQuestion
                id="sedentaryHours"
                label={fieldLabel("sedentaryHours", t)}
                hint={t("Required. A typical day, from 0 to 24. This is an estimate.")}
                placeholder={t("Enter hours of sitting")}
                unit={t("hours")}
                inputMode="decimal"
                maxLength={5}
                value={draft.sedentaryHours}
                error={err("sedentaryHours")}
                onChange={(sedentaryHours) => update({ sedentaryHours })}
              />
              <CheckQuestion
                id="dailySetting"
                legend={t("Work and daily activity")}
                hint={t("Optional. Choose any that describe a usual day. LifeZoi uses this only to suggest short breaks from sitting.")}
                values={draft.dailySetting}
                options={DAILY_SETTINGS.map((value) => ({ value, label: t(dailySettingLabels[value]) }))}
                onChange={(dailySetting) => {
                  const added = dailySetting.find((item) => !draft.dailySetting.includes(item));
                  if (added === "prefer-not") update({ dailySetting: [added] });
                  else update({ dailySetting: dailySetting.filter((item) => item !== "prefer-not") });
                }}
              />
              <p className="qz-hint">{t("Walking, strength, balance, and flexibility are optional. They help the plan name a kind of movement. There is no required distance.")}</p>
              {(["walking", "strength", "balance", "flexibility"] as const).map((name) => (
                <ChoiceQuestion
                  key={name}
                  legend={t(name === "walking" ? "Walking" : name === "strength" ? "Strength" : name === "balance" ? "Balance" : "Flexibility")}
                  name={name}
                  hint={t(OPTIONAL_ONE)}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: t(vegetableLabels[value]) }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "nourishment" ? (
            <>
              <ChoiceQuestion
                legend={fieldLabel("vegetables", t)}
                name="vegetables"
                hint={t("Required. Choose one.")}
                value={draft.vegetables}
                error={err("vegetables")}
                options={VEGETABLE_PATTERNS.map((value) => ({
                  value,
                  label: t(vegetableLabels[value]),
                }))}
                onChange={(vegetables) => update({ vegetables })}
              />
              <ChoiceQuestion
                legend={fieldLabel("hydration", t)}
                name="hydration"
                hint={t("Required. Choose one.")}
                value={draft.hydration}
                error={err("hydration")}
                options={HYDRATION_PATTERNS.map((value) => ({
                  value,
                  label: t(hydrationLabels[value]),
                }))}
                onChange={(hydration) => update({ hydration })}
              />
              <ChoiceQuestion
                legend={t("How do you usually eat?")}
                name="eatingPattern"
                hint={t(OPTIONAL_ONE)}
                value={draft.eatingPattern}
                options={EATING_PATTERNS.map((value) => ({ value, label: t(eatingPatternLabels[value]) }))}
                onChange={(eatingPattern) => update({ eatingPattern })}
              />
              <p className="qz-hint">{t("Fruit, fiber, protein, and added sugar are optional. Natural sugar in fruit is not treated as the same thing as sugary drinks.")}</p>
              {([
                ["fruit", msg("Fruit")],
                ["fiber", msg("Fiber foods")],
                ["protein", msg("Protein foods")],
                ["addedSugar", msg("Added sugar or sugary drinks")],
              ] as const).map(([name, label]) => (
                <ChoiceQuestion
                  key={name}
                  legend={t(label)}
                  name={name}
                  hint={t(OPTIONAL_ONE)}
                  value={draft[name]}
                  options={VEGETABLE_PATTERNS.map((value) => ({ value, label: t(vegetableLabels[value]) }))}
                  onChange={(value) => update({ [name]: value })}
                />
              ))}
            </>
          ) : null}
          {step === "substances" ? (
            <>
              <ChoiceQuestion
                legend={t("Tobacco")}
                name="smoking"
                hint={t(OPTIONAL_ONE)}
                value={draft.smoking}
                options={SMOKING_PATTERNS.map((value) => ({
                  value,
                  label: t(smokingLabels[value]),
                }))}
                onChange={(smoking) => update({ smoking })}
              />
              <ChoiceQuestion
                legend={t("Alcohol")}
                name="alcohol"
                hint={t(OPTIONAL_ONE)}
                value={draft.alcohol}
                options={ALCOHOL_PATTERNS.map((value) => ({
                  value,
                  label: t(alcoholLabels[value]),
                }))}
                onChange={(alcohol) => update({ alcohol })}
              />
              <button className="btn btn-secondary qz-skip" type="button" onClick={() => goTo(session.draftStep + 1)}>
                {t("Skip this step")}
              </button>
            </>
          ) : null}
          {step === "mind" ? (
            <>
              <ChoiceQuestion
                legend={fieldLabel("stress", t)}
                name="stress"
                hint={t("Required. Choose one.")}
                value={draft.stress}
                error={err("stress")}
                options={STRESS_LEVELS.map((value) => ({ value, label: t(stressLabels[value]) }))}
                onChange={(stress) => update({ stress })}
              />
              <ChoiceQuestion
                legend={fieldLabel("mood", t)}
                name="mood"
                hint={t("Required. Choose one.")}
                value={draft.mood}
                error={err("mood")}
                options={MOOD_LEVELS.map((value) => ({ value, label: t(moodLabels[value]) }))}
                onChange={(mood) => update({ mood })}
              />
              <ChoiceQuestion
                legend={fieldLabel("social", t)}
                name="social"
                hint={t("Required. Choose one.")}
                value={draft.social}
                error={err("social")}
                options={SOCIAL_LEVELS.map((value) => ({ value, label: t(socialLabels[value]) }))}
                onChange={(social) => update({ social })}
              />
              <p className="qz-hint">{t("These notes are optional and sensitive. They are asked so you can remember what to discuss with a clinician. lifeZoi does not diagnose from them and does not need your name, address, or record number.")}</p>
              <TextQuestion
                id="conditionsNote"
                label={t("Conditions you want to mention")}
                hint={t("Optional.")}
                placeholder={t("Type any conditions you want to remember, or leave blank")}
                multiline
                maxLength={280}
                value={draft.conditionsNote}
                onChange={(conditionsNote) => update({ conditionsNote })}
              />
              <TextQuestion
                id="familyNote"
                label={t("Family history you want to mention")}
                hint={t("Optional.")}
                placeholder={t("Type any family history you want to remember, or leave blank")}
                multiline
                maxLength={280}
                value={draft.familyNote}
                onChange={(familyNote) => update({ familyNote })}
              />
              <TextQuestion
                id="bloodPressure"
                label={t("Blood pressure, if you already know it")}
                hint={t("Optional. Copy it as written on your own record.")}
                placeholder={t("For example: 128/82")}
                maxLength={40}
                value={draft.bloodPressure}
                onChange={(bloodPressure) => update({ bloodPressure })}
              />
              <TextQuestion
                id="glucose"
                label={t("Glucose, if you already know it")}
                hint={t("Optional. Copy the number and unit as written on your own record.")}
                placeholder={t("Type the number and unit, or leave blank")}
                maxLength={40}
                value={draft.glucose}
                onChange={(glucose) => update({ glucose })}
              />
              <TextQuestion
                id="hba1c"
                label={t("HbA1c, if you already know it")}
                hint={t("Optional. Copy the number and unit as written on your own record.")}
                placeholder={t("Type the number and unit, or leave blank")}
                maxLength={40}
                value={draft.hba1c}
                onChange={(hba1c) => update({ hba1c })}
              />
              <TextQuestion
                id="cholesterol"
                label={t("Cholesterol, if you already know it")}
                hint={t("Optional. Copy the number and unit as written on your own record.")}
                placeholder={t("Type the number and unit, or leave blank")}
                maxLength={40}
                value={draft.cholesterol}
                onChange={(cholesterol) => update({ cholesterol })}
              />
            </>
          ) : null}
          {step === "health" ? (
            <>
              <ChoiceQuestion
                legend={t("How is your energy on a typical day?")}
                name="energyLevel"
                hint={t(OPTIONAL_ONE)}
                value={draft.energyLevel}
                options={ENERGY_LEVELS.map((value) => ({ value, label: t(energyLabels[value]) }))}
                onChange={(energyLevel) => update({ energyLevel })}
              />
              <ChoiceQuestion
                legend={t("Blood sugar")}
                name="bloodSugarStatus"
                hint={t(OPTIONAL_ONE)}
                value={draft.bloodSugarStatus}
                options={BLOOD_SUGAR_STATUSES.map((value) => ({ value, label: t(bloodSugarLabels[value]) }))}
                onChange={(bloodSugarStatus) => update({ bloodSugarStatus })}
              />
              <ChoiceQuestion
                legend={t("Cholesterol")}
                name="cholesterolStatus"
                hint={t(OPTIONAL_ONE)}
                value={draft.cholesterolStatus}
                options={CHOLESTEROL_STATUSES.map((value) => ({ value, label: t(cholesterolLabels[value]) }))}
                onChange={(cholesterolStatus) => update({ cholesterolStatus })}
              />
              <ChoiceQuestion
                legend={t("Blood pressure")}
                name="bloodPressureStatus"
                hint={t(OPTIONAL_ONE)}
                value={draft.bloodPressureStatus}
                options={BLOOD_PRESSURE_STATUSES.map((value) => ({ value, label: t(bloodPressureLabels[value]) }))}
                onChange={(bloodPressureStatus) => update({ bloodPressureStatus })}
              />
              <p className="qz-hint">
                {t("If you have actual lab numbers, you can type them on the previous step (blood pressure, glucose, HbA1c, cholesterol). Leave them blank if you do not have them. LifeZoi never guesses a number.")}
              </p>
              <CheckQuestion
                id="foodAllergies"
                legend={t("Diagnosed food allergies")}
                hint={t("Optional. Choose all that apply. These are treated as strict exclusions: no recipe with them is suggested.")}
                values={draft.foodAllergies}
                options={ALLERGENS.map((value) => ({ value, label: t(allergenLabels[value]) }))}
                onChange={(foodAllergies) => update({ foodAllergies })}
              />
              <ReactionEditor
                reactions={draft.foodReactions}
                onChange={(foodReactions) => update({ foodReactions })}
              />
              <CheckQuestion
                id="dietRequirements"
                legend={t("Do you follow any religious, cultural, or personal dietary requirements?")}
                hint={t("Optional. Choose all that apply. LifeZoi only uses what you choose here and never guesses.")}
                values={draft.dietRequirements}
                options={DIET_REQUIREMENTS.map((value) => ({ value, label: t(dietRequirementLabels[value]) }))}
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
                legend={t("How do you eat?")}
                hint={t("Optional. Choose any combination.")}
                values={draft.dietPatterns}
                options={DIET_PATTERNS.map((value) => ({ value, label: t(dietPatternLabels[value]) }))}
                onChange={(dietPatterns) => {
                  const added = dietPatterns.find((item) => !draft.dietPatterns.includes(item));
                  update({ dietPatterns: added === "none" ? ["none"] : dietPatterns.filter((item) => item !== "none") });
                }}
              />
              <TextQuestion
                id="dietNote"
                label={t("Other requirements or preferences")}
                hint={t("Optional.")}
                placeholder={t("For example: no pork, low salt")}
                maxLength={140}
                value={draft.dietNote}
                onChange={(dietNote) => update({ dietNote })}
              />
              <CheckQuestion
                id="mobilityLimits"
                legend={t("Mobility")}
                hint={t("Optional. Choose all that apply. This helps LifeZoi offer seated or supported movement first.")}
                values={draft.mobilityLimits}
                options={MOBILITY_LIMITS.map((value) => ({ value, label: t(mobilityLabels[value]) }))}
                onChange={(mobilityLimits) => {
                  const added = mobilityLimits.find((item) => !draft.mobilityLimits.includes(item));
                  if (added === "none" || added === "prefer-not") update({ mobilityLimits: [added] });
                  else update({ mobilityLimits: mobilityLimits.filter((item) => item !== "none" && item !== "prefer-not") });
                }}
              />
              <TextQuestion
                id="exerciseRestrictions"
                label={t("Current injuries or exercise restrictions")}
                hint={t("Optional. For example, “no kneeling after knee surgery”.")}
                placeholder={t("Type any injuries or restrictions, or leave blank")}
                multiline
                maxLength={280}
                value={draft.exerciseRestrictions}
                onChange={(exerciseRestrictions) => update({ exerciseRestrictions })}
              />
              <button className="btn btn-secondary qz-skip" type="button" onClick={() => goTo(session.draftStep + 1)}>
                {t("Skip this step")}
              </button>
            </>
          ) : null}
          {step === "results" ? (
            <div className="upload-placeholder" role="note">
              <p>
                <strong>{t("Nothing is uploaded or analyzed.")}</strong>
              </p>
              <p>
                {t("There is no file control here. A lab report, photo, or other document is not received, stored, or read.")}
              </p>
              <p>
                {t("Blood pressure, glucose, HbA1c, and cholesterol can still be typed by hand on Stress, mood, and people. Those notes stay in this browser tab. They are not a diagnosis.")}
              </p>
            </div>
          ) : null}
          {step === "goals" ? (
            <>
              <CheckQuestion
                id="wellnessGoals"
                legend={t("Your personal goals")}
                hint={t("Optional. Choose as many as you like. You can change them at any time.")}
                values={draft.wellnessGoals}
                options={WELLNESS_GOALS.map((value) => ({ value, label: t(wellnessGoalLabels[value]) }))}
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
                  legend={t("Which goal matters most right now?")}
                  name="primaryGoal"
                  value={draft.primaryGoal}
                  options={draft.wellnessGoals.map((value) => ({ value, label: t(wellnessGoalLabels[value]) }))}
                  onChange={(primaryGoal) => update({ primaryGoal })}
                />
              ) : null}
              <CheckQuestion
                id="goals"
                legend={fieldLabel("goals", t)}
                hint={t("Required. Choose at least one.")}
                values={draft.goals}
                options={GOAL_IDS.map((value) => ({ value, label: t(goalLabels[value]) }))}
                error={err("goals")}
                onChange={(goals) => update({ goals })}
              />
              <TextQuestion
                id="habitNote"
                label={fieldLabel("habitNote", t)}
                hint={t("Optional. 280 characters or fewer.")}
                placeholder={t("Type a note to yourself, or leave blank")}
                multiline
                maxLength={280}
                value={draft.habitNote}
                error={err("habitNote")}
                onChange={(habitNote) => update({ habitNote })}
              />
              <TextQuestion
                id="purposeHope"
                label={fieldLabel("purposeHope", t)}
                hint={t("Optional, and separate from the health answers above. This is a personal hope, not a medical score. 280 characters or fewer.")}
                placeholder={t("For example: keep gardening, travel, play with my grandchildren")}
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
              <p>{t("Saving adds this as a new assessment in your history. Earlier assessments are never overwritten.")}</p>
              <Review draft={draft} onEdit={(index) => goTo(index)} />
            </div>
          ) : null}
        </fieldset>
        <div className="qz-nav">
          {session.draftStep > 0 ? (
            <button className="btn btn-secondary qz-nav-btn" type="button" onClick={() => goTo(session.draftStep - 1)}>
              <span aria-hidden="true">←</span> {t("Back")}
            </button>
          ) : null}
          {step === "review" ? (
            <button className="btn btn-primary qz-nav-btn qz-nav-next" type="submit" disabled={sample}>
              <span aria-hidden="true">✓</span> {t("Save answers")}
            </button>
          ) : (
            <button className="btn btn-primary qz-nav-btn qz-nav-next" type="submit" disabled={sample}>
              {t("Continue")} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </form>
      <p className="footer-note">
        {t("This assessment is not a diagnosis and not a substitute for professional care.")}
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
  const t = useT();
  const none = t("Not provided");
  const items: { label: string; value: string; step: StepId }[] = [
    { label: t("Name"), value: draft.displayName || none, step: "about" },
    {
      label: t("Age range"),
      value: draft.ageRange ? t(ageLabels[draft.ageRange]) : none,
      step: "about",
    },
    { label: t("Exact age"), value: draft.exactAge || none, step: "about" },
    {
      label: t("Life table column"),
      value:
        draft.tableSex === "female"
          ? t("Female column")
          : draft.tableSex === "male"
            ? t("Male column")
            : draft.tableSex === "another"
              ? t("Another or not listed")
              : draft.tableSex === "prefer-not"
                ? t("Prefer not to say")
                : none,
      step: "about",
    },
    { label: t("Population note"), value: draft.populationNote || none, step: "about" },
    { label: t("Height"), value: draft.heightCm ? t("{value} cm", { value: draft.heightCm }) : none, step: "about" },
    { label: t("Weight"), value: draft.weightKg ? t("{value} kg", { value: draft.weightKg }) : none, step: "about" },
    { label: t("Desired weight"), value: draft.desiredWeightKg ? t("{value} kg", { value: draft.desiredWeightKg }) : none, step: "about" },
    {
      label: t("Sleep"),
      value: draft.sleepHours
        ? t("{hours} hours, {quality}", {
            hours: draft.sleepHours,
            quality: draft.sleepQuality ? t(sleepQualityLabels[draft.sleepQuality]) : t("quality not set"),
          })
        : none,
      step: "sleep",
    },
    {
      label: t("Activity"),
      value: draft.activityDays
        ? t("{days} days, {minutes} minutes", { days: draft.activityDays, minutes: draft.activityMinutes || "0" })
        : none,
      step: "movement",
    },
    {
      label: t("Sitting or reclining"),
      value: draft.sedentaryHours ? t("{value} hours", { value: draft.sedentaryHours }) : none,
      step: "movement",
    },
    {
      label: t("Work and daily activity"),
      value: draft.dailySetting.map((item) => t(dailySettingLabels[item])).join(", ") || none,
      step: "movement",
    },
    { label: t("Walking"), value: draft.walking ? t(vegetableLabels[draft.walking]) : none, step: "movement" },
    { label: t("Strength"), value: draft.strength ? t(vegetableLabels[draft.strength]) : none, step: "movement" },
    { label: t("Balance"), value: draft.balance ? t(vegetableLabels[draft.balance]) : none, step: "movement" },
    { label: t("Flexibility"), value: draft.flexibility ? t(vegetableLabels[draft.flexibility]) : none, step: "movement" },
    {
      label: t("Vegetables and fruit"),
      value: draft.vegetables ? t(vegetableLabels[draft.vegetables]) : none,
      step: "nourishment",
    },
    { label: t("Fruit"), value: draft.fruit ? t(vegetableLabels[draft.fruit]) : none, step: "nourishment" },
    { label: t("Fiber"), value: draft.fiber ? t(vegetableLabels[draft.fiber]) : none, step: "nourishment" },
    { label: t("Protein"), value: draft.protein ? t(vegetableLabels[draft.protein]) : none, step: "nourishment" },
    { label: t("Added sugar or sugary drinks"), value: draft.addedSugar ? t(vegetableLabels[draft.addedSugar]) : none, step: "nourishment" },
    {
      label: t("Water"),
      value: draft.hydration ? t(hydrationLabels[draft.hydration]) : none,
      step: "nourishment",
    },
    {
      label: t("Tobacco"),
      value: draft.smoking ? t(smokingLabels[draft.smoking]) : none,
      step: "substances",
    },
    {
      label: t("Alcohol"),
      value: draft.alcohol ? t(alcoholLabels[draft.alcohol]) : none,
      step: "substances",
    },
    {
      label: t("Stress"),
      value: draft.stress ? t(stressLabels[draft.stress]) : none,
      step: "mind",
    },
    {
      label: t("Mood"),
      value: draft.mood ? t(moodLabels[draft.mood]) : none,
      step: "mind",
    },
    {
      label: t("Social connection"),
      value: draft.social ? t(socialLabels[draft.social]) : none,
      step: "mind",
    },
    { label: t("Conditions you reported"), value: draft.conditionsNote || none, step: "mind" },
    { label: t("Family history you reported"), value: draft.familyNote || none, step: "mind" },
    { label: t("Blood pressure you typed"), value: draft.bloodPressure || none, step: "mind" },
    { label: t("Glucose you typed"), value: draft.glucose || none, step: "mind" },
    { label: t("HbA1c you typed"), value: draft.hba1c || none, step: "mind" },
    { label: t("Cholesterol you typed"), value: draft.cholesterol || none, step: "mind" },
    { label: t("Eating pattern"), value: draft.eatingPattern ? t(eatingPatternLabels[draft.eatingPattern]) : none, step: "nourishment" },
    { label: t("Blood sugar"), value: draft.bloodSugarStatus ? t(bloodSugarLabels[draft.bloodSugarStatus]) : none, step: "health" },
    { label: t("Cholesterol status"), value: draft.cholesterolStatus ? t(cholesterolLabels[draft.cholesterolStatus]) : none, step: "health" },
    { label: t("Blood pressure status"), value: draft.bloodPressureStatus ? t(bloodPressureLabels[draft.bloodPressureStatus]) : none, step: "health" },
    {
      label: t("Food allergies"),
      value: [...draft.foodAllergies.map((item) => t(allergenLabels[item])), draft.allergyNote].filter(Boolean).join(", ") || none,
      step: "health",
    },
    {
      label: t("Other food reactions"),
      value: draft.foodReactions.map((item) => `${item.food} (${t(reactionLabels[item.type]).toLocaleLowerCase()})`).join(", ") || none,
      step: "health",
    },
    {
      label: t("Dietary requirements"),
      value: draft.dietRequirements.map((item) => t(dietRequirementLabels[item])).join(", ") || none,
      step: "health",
    },
    {
      label: t("Eating pattern choices"),
      value: [...draft.dietPatterns.map((item) => t(dietPatternLabels[item])), draft.dietNote].filter(Boolean).join(", ") || none,
      step: "health",
    },
    { label: t("Energy"), value: draft.energyLevel ? t(energyLabels[draft.energyLevel]) : none, step: "health" },
    { label: t("Mobility"), value: draft.mobilityLimits.map((item) => t(mobilityLabels[item])).join(", ") || none, step: "health" },
    { label: t("Injuries or exercise restrictions"), value: draft.exerciseRestrictions || none, step: "health" },
    {
      label: t("Personal goals"),
      value: draft.wellnessGoals.map((goal) => t(wellnessGoalLabels[goal])).join(", ") || none,
      step: "goals",
    },
    { label: t("Primary goal"), value: draft.primaryGoal ? t(wellnessGoalLabels[draft.primaryGoal]) : none, step: "goals" },
    {
      label: t("Focus"),
      value: draft.goals.length ? draft.goals.map((goal) => t(goalLabels[goal])).join(", ") : none,
      step: "goals",
    },
    { label: t("Note"), value: draft.habitNote || none, step: "goals" },
    {
      label: t("Hope for what health could support"),
      value: draft.purposeHope || none,
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
              {t("Edit {item}", { item: item.label })}
            </button>
          </dd>
        </div>
      ))}
    </dl>
  );
}
