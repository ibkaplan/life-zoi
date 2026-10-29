"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AGE_OPTIONS,
  ACTIVITY_OPTIONS,
  ALCOHOL_OPTIONS,
  GOALS,
  HYDRATION_OPTIONS,
  MEAL_OPTIONS,
  MOOD_OPTIONS,
  PLANTS_OPTIONS,
  SEDENTARY_OPTIONS,
  SLEEP_HOUR_OPTIONS,
  SLEEP_QUALITY_OPTIONS,
  SMOKING_OPTIONS,
  SOCIAL_OPTIONS,
  STEPS,
  STRESS_OPTIONS,
  emptyAnswers,
  reviewRows,
  validateStep,
  type Answers,
  type FieldError,
  type GoalId,
} from "@/lib/assessment";
import { LOCAL_SAVE_NOTE } from "@/lib/copy";
import { completeAssessment, latestAssessment, saveDraft } from "@/lib/user-data";
import { Button, ChoiceGroup, FieldError as ErrorText, PageHeader, TextAreaField } from "@/components/ui";
import { DataGate, postValidation } from "@/components/user-data-provider";

export function AssessmentView() {
  return (
    <DataGate>
      {(ready) => <Wizard data={ready.data} commit={ready.commit} />}
    </DataGate>
  );
}

function Wizard({ data, commit }: { data: import("@/lib/user-data").UserData; commit: (next: import("@/lib/user-data").UserData) => string | null }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [hydrated, setHydrated] = useState(false);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [message, setMessage] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [finished, setFinished] = useState(false);
  const dataRef = useRef(data);
  const commitRef = useRef(commit);

  useEffect(() => {
    dataRef.current = data;
    commitRef.current = commit;
  });

  useEffect(() => {
    const draft = dataRef.current.draft;
    const latest = latestAssessment(dataRef.current);
    if (draft) {
      setStepIndex(draft.step);
      setAnswers(draft.answers);
    } else if (latest) {
      setAnswers(latest.answers);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || finished) return;
    const result = saveDraft(dataRef.current, stepIndex, answers, new Date().toISOString());
    if (!result.ok) return;
    const error = commitRef.current(result.data);
    setSavedNote(error ?? LOCAL_SAVE_NOTE);
  }, [answers, stepIndex, hydrated, finished]);

  const step = STEPS[stepIndex];
  const progress = Math.round((stepIndex / (STEPS.length - 1)) * 100);

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors([]);
  }

  function toggleGoal(id: GoalId) {
    setAnswers((current) => ({
      ...current,
      goals: current.goals.includes(id) ? current.goals.filter((goal) => goal !== id) : [...current.goals, id],
    }));
    setErrors([]);
  }

  function goForward() {
    const stepErrors = validateStep(step.id, answers);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }
    setStepIndex((current) => Math.min(STEPS.length - 1, current + 1));
  }

  async function finish() {
    const stepErrors = validateStep("review", answers);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      setMessage("Fix the highlighted answers before saving.");
      return;
    }
    const server = await postValidation("/api/validate/assessment", { answers });
    if (!server.ok) {
      setErrors(server.errors ?? []);
      setMessage(server.message);
      return;
    }
    const result = completeAssessment(dataRef.current, answers, new Date().toISOString(), crypto.randomUUID());
    if (!result.ok) {
      setErrors(result.errors);
      setMessage("Nothing was saved.");
      return;
    }
    const error = commit(result.data);
    if (error) {
      setMessage(error);
      return;
    }
    setFinished(true);
    setMessage("");
  }

  if (finished) {
    return (
      <div className="grid gap-4">
        <PageHeader eyebrow="Lifestyle assessment" title="Assessment saved on this device" lede="Guidance and WHAT IF? can now use the answers you just reviewed. They are still general education." />
        <div className="flex flex-wrap gap-3">
          <Link className="inline-flex min-h-11 items-center rounded-full bg-forest px-4 font-semibold text-surface" href="/recommendations">
            See guidance
          </Link>
          <Link className="inline-flex min-h-11 items-center rounded-full border border-forest px-4 font-semibold text-forest" href="/what-if">
            Open WHAT IF?
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Lifestyle assessment"
        title={step.title}
        lede="These questions support wellness education. They are not a diagnosis, and you can change your answers later."
      />
      <div>
        <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full bg-forest" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted" role="status">
          Step {stepIndex + 1} of {STEPS.length}
        </p>
      </div>
      {step.id === "intro" ? <Intro /> : null}
      {step.id === "goals" ? <GoalsStep answers={answers} errors={errors} onToggle={toggleGoal} onNote={(goalNote) => update("goalNote", goalNote)} /> : null}
      {step.id === "sleep" ? (
        <div className="grid gap-6">
          <ChoiceGroup legend="How much do you usually sleep?" name="sleepHours" hint="A typical night is enough. This is not a sleep study." value={answers.sleepHours} options={SLEEP_HOUR_OPTIONS} error={errorFor(errors, "sleepHours")} onChange={(value) => update("sleepHours", value as Answers["sleepHours"])} />
          <ChoiceGroup legend="How does that sleep usually feel?" name="sleepQuality" value={answers.sleepQuality} options={SLEEP_QUALITY_OPTIONS} error={errorFor(errors, "sleepQuality")} onChange={(value) => update("sleepQuality", value as Answers["sleepQuality"])} />
        </div>
      ) : null}
      {step.id === "movement" ? (
        <div className="grid gap-6">
          <ChoiceGroup legend="How often do you do intentional activity?" name="activityDays" hint="Walking, sport, chores, or exercise all count. There is no target score." value={answers.activityDays} options={ACTIVITY_OPTIONS} error={errorFor(errors, "activityDays")} onChange={(value) => update("activityDays", value as Answers["activityDays"])} />
          <ChoiceGroup legend="How much of the day do you spend sitting?" name="sedentary" value={answers.sedentary} options={SEDENTARY_OPTIONS} error={errorFor(errors, "sedentary")} onChange={(value) => update("sedentary", value as Answers["sedentary"])} />
        </div>
      ) : null}
      {step.id === "eating" ? (
        <div className="grid gap-6">
          <ChoiceGroup legend="How often are vegetables or fruit part of your eating?" name="plants" hint="This helps with food ideas. It is not a diet rating." value={answers.plants} options={PLANTS_OPTIONS} error={errorFor(errors, "plants")} onChange={(value) => update("plants", value as Answers["plants"])} />
          <ChoiceGroup legend="How regular are your meals?" name="mealRhythm" value={answers.mealRhythm} options={MEAL_OPTIONS} error={errorFor(errors, "mealRhythm")} onChange={(value) => update("mealRhythm", value as Answers["mealRhythm"])} />
          <ChoiceGroup legend="How often is water what you drink?" name="hydration" value={answers.hydration} options={HYDRATION_OPTIONS} error={errorFor(errors, "hydration")} onChange={(value) => update("hydration", value as Answers["hydration"])} />
        </div>
      ) : null}
      {step.id === "substances" ? (
        <div className="grid gap-6">
          <ChoiceGroup legend="Tobacco" name="smoking" hint="Optional in the sense that Prefer not to say is a complete answer. It is used only if you want quitting ideas." value={answers.smoking} options={SMOKING_OPTIONS} error={errorFor(errors, "smoking")} onChange={(value) => update("smoking", value as Answers["smoking"])} />
          <ChoiceGroup legend="Alcohol" name="alcohol" hint="Prefer not to say is a complete answer. lifeZoi will not tell you what is safe for you." value={answers.alcohol} options={ALCOHOL_OPTIONS} error={errorFor(errors, "alcohol")} onChange={(value) => update("alcohol", value as Answers["alcohol"])} />
        </div>
      ) : null}
      {step.id === "mind" ? (
        <div className="grid gap-6">
          <ChoiceGroup legend="How does stress feel lately?" name="stress" value={answers.stress} options={STRESS_OPTIONS} error={errorFor(errors, "stress")} onChange={(value) => update("stress", value as Answers["stress"])} />
          <ChoiceGroup legend="How has your mood been?" name="mood" hint="Prefer not to say is a complete answer. A low mood here is not a diagnosis." value={answers.mood} options={MOOD_OPTIONS} error={errorFor(errors, "mood")} onChange={(value) => update("mood", value as Answers["mood"])} />
          <ChoiceGroup legend="How much supportive contact do you have?" name="social" value={answers.social} options={SOCIAL_OPTIONS} error={errorFor(errors, "social")} onChange={(value) => update("social", value as Answers["social"])} />
        </div>
      ) : null}
      {step.id === "about" ? (
        <ChoiceGroup legend="Age range" name="ageRange" hint="Optional. lifeZoi does not use age to estimate lifespan. Prefer not to say is a complete answer." value={answers.ageRange} options={AGE_OPTIONS} error={errorFor(errors, "ageRange")} onChange={(value) => update("ageRange", value as Answers["ageRange"])} />
      ) : null}
      {step.id === "review" ? <Review answers={answers} errors={errors} onEdit={setStepIndex} /> : null}
      {message ? <p role="alert" className="font-semibold text-danger">{message}</p> : null}
      {savedNote ? <p className="text-sm text-muted">{savedNote}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={() => setStepIndex((current) => Math.max(0, current - 1))} disabled={stepIndex === 0}>
          Back
        </Button>
        {step.id === "review" ? (
          <Button type="button" onClick={finish}>
            Save assessment
          </Button>
        ) : (
          <Button type="button" onClick={goForward}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}

function Intro() {
  return (
    <div className="grid gap-3 text-lg leading-relaxed text-muted">
      <p>lifeZoi asks about habits so WHAT IF? and the guidance can stay tied to what you actually said.</p>
      <p>You can move back, change an answer, and stop whenever you want. Progress stays in this browser. It is not sent to a health record.</p>
      <p>Tobacco, alcohol, mood, and age include Prefer not to say.</p>
    </div>
  );
}

function GoalsStep({
  answers,
  errors,
  onToggle,
  onNote,
}: {
  answers: Answers;
  errors: FieldError[];
  onToggle: (id: GoalId) => void;
  onNote: (value: string) => void;
}) {
  return (
    <div className="grid gap-5">
      <fieldset>
        <legend className="text-lg font-semibold">Choose one or more focuses</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {GOALS.map((goal) => (
            <label key={goal.id} className={`flex min-h-11 gap-3 rounded-2xl border px-3 py-3 ${answers.goals.includes(goal.id) ? "border-forest bg-sage" : "border-line bg-surface"}`}>
              <input type="checkbox" checked={answers.goals.includes(goal.id)} onChange={() => onToggle(goal.id)} className="mt-1 size-4 accent-forest" />
              <span>
                <span className="block font-semibold">{goal.label}</span>
                <span className="text-sm text-muted">{goal.hint}</span>
              </span>
            </label>
          ))}
        </div>
        <ErrorText>{errorFor(errors, "goals")}</ErrorText>
      </fieldset>
      <TextAreaField id="goal-note" label="Anything you want to add" hint="Optional. One short note, 280 characters." value={answers.goalNote} maxLength={280} error={errorFor(errors, "goalNote")} onChange={(event) => onNote(event.target.value)} />
    </div>
  );
}

function Review({ answers, errors, onEdit }: { answers: Answers; errors: FieldError[]; onEdit: (index: number) => void }) {
  return (
    <div className="grid gap-3">
      {reviewRows(answers).map((row) => (
        <div key={row.field} className="flex flex-col gap-2 rounded-2xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-muted">{row.label}</p>
            <p>{row.value}</p>
            <ErrorText>{errorFor(errors, row.field)}</ErrorText>
          </div>
          <Button type="button" variant="quiet" onClick={() => onEdit(STEPS.findIndex((step) => step.id === row.step))}>
            Edit
          </Button>
        </div>
      ))}
    </div>
  );
}

function errorFor(errors: FieldError[], field: string): string | undefined {
  return errors.find((error) => error.field === field)?.message;
}
