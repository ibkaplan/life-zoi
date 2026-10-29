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
  VEGETABLE_PATTERNS,
  type Assessment,
  type GoalId,
  type StepId,
} from "@/lib/types";
import { firstInvalidStep, validateStep } from "@/lib/validation";

const stepCopy: Record<StepId, { title: string; why: string }> = {
  about: {
    title: "About you",
    why: "Name and age range are optional. They only personalize the welcome. lifeZoi does not need them to continue.",
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
  goals: {
    title: "What you want to work on",
    why: "Choose at least one focus. lifeZoi uses this, with your other answers, to decide what to emphasize.",
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
          <Link href="/dashboard">Go to the dashboard</Link> or <Link href="/what-if">open WHAT IF?</Link>
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
            </>
          ) : null}
          {step === "goals" ? (
            <>
              <fieldset className="field">
                <legend>Choose one or more</legend>
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
    {
      label: "Vegetables and fruit",
      value: draft.vegetables ? vegetableLabels[draft.vegetables] : "Not provided",
      step: "nourishment",
    },
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
    {
      label: "Focus",
      value: draft.goals.length ? draft.goals.map((goal) => goalLabels[goal]).join(", ") : "Not provided",
      step: "goals",
    },
    { label: "Note", value: draft.habitNote || "Not provided", step: "goals" },
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
