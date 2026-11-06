"use client";

import Link from "next/link";
import { useState } from "react";
import { HabitFrame } from "@/components/habit-transformation/frame";
import { useHabitJourney } from "@/components/habit-transformation/use-habit-journey";
import {
  CONFIDENCE,
  DURATION,
  EASIER,
  HABIT_IDS,
  HABITS,
  HARD,
  MOTIVATION,
  SUPPORT,
  followPrompts,
  triedChoices,
  triggerChoices,
  whenChoices,
  type Choice,
  type HabitId,
} from "@/lib/habit-transformation/catalog";
import {
  emptyFollowUp,
  savePicks,
  type FollowUp,
  type HabitPick,
} from "@/lib/habit-transformation/model";

const SCREEN_KEYS: (keyof FollowUp)[][] = [
  ["whenId", "triggerId"],
  ["durationId", "triedId", "hardId"],
  ["motivationId", "confidenceId", "supportId", "easierId"],
];

export function JourneyView() {
  return (
    <HabitFrame>
      <JourneyForm />
    </HabitFrame>
  );
}

function JourneyForm() {
  const { journey, ready, sample, save } = useHabitJourney();
  const [picked, setPicked] = useState<HabitId[] | null>(null);
  const [otherText, setOtherText] = useState("");
  const [follow, setFollow] = useState<Partial<Record<HabitId, FollowUp>>>({});
  const [phase, setPhase] = useState<"choose" | "follow" | "saved">("choose");
  const [habitIndex, setHabitIndex] = useState(0);
  const [screen, setScreen] = useState(0);
  const [error, setError] = useState("");

  if (ready && picked === null) {
    const next: Partial<Record<HabitId, FollowUp>> = {};
    for (const pick of journey.picks) next[pick.habitId] = pick.followUp;
    setFollow(next);
    setOtherText(journey.picks.find((pick) => pick.habitId === "other")?.otherText ?? "");
    setPicked(journey.picks.map((pick) => pick.habitId));
  }

  if (!ready || picked === null) return <p className="card">Loading your habit journey…</p>;

  const chosen = picked;
  const habitId = chosen[habitIndex];
  const prompts = habitId ? followPrompts(habitId) : null;
  const answers = habitId ? { ...emptyFollowUp(), ...follow[habitId] } : emptyFollowUp();

  function toggle(id: HabitId) {
    setPicked((current) => {
      const list = current ?? [];
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      return HABIT_IDS.filter((item) => next.includes(item));
    });
    setError("");
  }

  function setField(key: keyof FollowUp, value: string) {
    if (!habitId) return;
    setFollow((current) => ({
      ...current,
      [habitId]: { ...emptyFollowUp(), ...current[habitId], [key]: value },
    }));
    setError("");
  }

  function startFollow() {
    if (sample) return;
    if (chosen.length === 0) {
      setError("Choose at least one habit.");
      return;
    }
    if (chosen.includes("other") && otherText.trim().length === 0) {
      setError("Add a few words for the habit you named.");
      return;
    }
    setPhase("follow");
    setHabitIndex(0);
    setScreen(0);
    setError("");
  }

  function nextScreen() {
    if (!habitId) return;
    const keys = SCREEN_KEYS[screen] ?? [];
    if (keys.some((key) => !answers[key])) {
      setError("Choose an answer for each question on this screen.");
      return;
    }
    setError("");
    if (screen < 2) {
      setScreen(screen + 1);
      return;
    }
    if (habitIndex < chosen.length - 1) {
      setHabitIndex(habitIndex + 1);
      setScreen(0);
      return;
    }
    const picks: HabitPick[] = chosen.map((id) => ({
      habitId: id,
      otherText: id === "other" ? otherText.trim() : "",
      followUp: { ...emptyFollowUp(), ...follow[id] },
    }));
    save(savePicks(journey, picks));
    setPhase("saved");
  }

  function back() {
    setError("");
    if (screen > 0) {
      setScreen(screen - 1);
      return;
    }
    if (habitIndex > 0) {
      setHabitIndex(habitIndex - 1);
      setScreen(2);
      return;
    }
    setPhase("choose");
  }

  if (phase === "saved") {
    return (
      <section className="stack">
        <h1>Your journey is saved</h1>
        <p>The plan uses the answers you just gave. A quiet day later will not erase it.</p>
        <div className="actions">
          <Link className="btn btn-primary" href="/habit-transformation/plan">My Personal Action Plan</Link>
          <Link className="btn btn-secondary" href="/habit-transformation/actions">My Tiny Daily Actions</Link>
        </div>
      </section>
    );
  }

  if (phase === "follow" && habitId && prompts) {
    const meta = HABITS.find((item) => item.id === habitId);
    return (
      <section className="stack">
        <h1>Start My Habit Journey</h1>
        <p>
          {meta?.short} · habit {habitIndex + 1} of {picked.length} · step {screen + 1} of 3
        </p>
        <p className="hint">Short questions. They change with the habit you chose.</p>
        {screen === 0 ? (
          <>
            <ChoiceGroup legend={prompts.when} name={`${habitId}-when`} choices={whenChoices(habitId)} value={answers.whenId} onChange={(value) => setField("whenId", value)} />
            <ChoiceGroup legend={prompts.trigger} name={`${habitId}-trigger`} choices={triggerChoices(habitId)} value={answers.triggerId} onChange={(value) => setField("triggerId", value)} />
          </>
        ) : null}
        {screen === 1 ? (
          <>
            <ChoiceGroup legend={prompts.duration} name={`${habitId}-duration`} choices={DURATION} value={answers.durationId} onChange={(value) => setField("durationId", value)} />
            <ChoiceGroup legend={prompts.tried} name={`${habitId}-tried`} choices={triedChoices(habitId)} value={answers.triedId} onChange={(value) => setField("triedId", value)} />
            <ChoiceGroup legend={prompts.hard} name={`${habitId}-hard`} choices={HARD} value={answers.hardId} onChange={(value) => setField("hardId", value)} />
          </>
        ) : null}
        {screen === 2 ? (
          <>
            <ChoiceGroup legend={prompts.motivation} name={`${habitId}-motivation`} choices={MOTIVATION} value={answers.motivationId} onChange={(value) => setField("motivationId", value)} />
            <ChoiceGroup legend={prompts.confidence} name={`${habitId}-confidence`} choices={CONFIDENCE} value={answers.confidenceId} onChange={(value) => setField("confidenceId", value)} />
            <ChoiceGroup legend={prompts.support} name={`${habitId}-support`} choices={SUPPORT} value={answers.supportId} onChange={(value) => setField("supportId", value)} />
            <ChoiceGroup legend={prompts.easier} name={`${habitId}-easier`} choices={EASIER} value={answers.easierId} onChange={(value) => setField("easierId", value)} />
          </>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
        <div className="actions">
          <button className="btn btn-secondary" type="button" onClick={back}>Back</button>
          <button className="btn btn-primary" type="button" onClick={nextScreen} disabled={sample}>
            {screen === 2 && habitIndex === picked.length - 1 ? "Save my journey" : "Next"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="stack">
      <h1>Start My Habit Journey</h1>
      <p>Pick one or more habits. The next questions stay short, and the wording follows what you pick.</p>
      <fieldset className="stack">
        <legend>Which habits do you want to look at?</legend>
        <div className="choices">
          {HABITS.map((habit) => (
            <label className="choice" key={habit.id}>
              <input
                type="checkbox"
                name="habits"
                checked={picked.includes(habit.id)}
                onChange={() => toggle(habit.id)}
              />
              <span>{habit.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {picked.includes("other") ? (
        <label className="stack">
          <span>Name the habit in a few words</span>
          <input
            type="text"
            value={otherText}
            maxLength={80}
            onChange={(event) => {
              setOtherText(event.target.value);
              setError("");
            }}
          />
        </label>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
      {sample ? <p className="hint">Sample data is read-only. Turn off the sample to save your own journey.</p> : null}
      <button className="btn btn-primary" type="button" onClick={startFollow} disabled={sample}>
        Continue
      </button>
    </section>
  );
}

function ChoiceGroup({
  legend,
  name,
  choices,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="stack">
      <legend>{legend}</legend>
      <div className="choices">
        {choices.map((choice) => (
          <label className="choice" key={choice.id}>
            <input type="radio" name={name} checked={value === choice.id} onChange={() => onChange(choice.id)} />
            <span>{choice.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
