"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSpeechSupport } from "@/components/voice/read-aloud";
import { formatDate, useMindStore } from "@/components/mind/shared";
import { EVIDENCE_LABELS } from "@/lib/mind/evidence";
import { MIND_EXERCISES, planExercise, plannedSeconds, type MindExercise, type TimedStep } from "@/lib/mind/exercises";
import { newId } from "@/lib/mind/progress";
import { updateMindProgress } from "@/lib/mind/store";
import { player } from "@/lib/voice/engine";
import { segmentsFromText } from "@/lib/voice/voices";

const OWNER = "lifezoi-mind-exercise";

const CATEGORY_LABEL: Record<string, string> = {
  "calm the body": "Calm the body",
  mindfulness: "Mindfulness",
  thinking: "Thoughts",
  feelings: "Feelings",
  relationships: "Relationships and boundaries",
  sleep: "Sleep",
  mood: "Mood",
  stress: "Stress",
};

export function MindExerciseList() {
  const categories = [...new Set(MIND_EXERCISES.map((exercise) => exercise.category))];
  const [filter, setFilter] = useState<string | null>(null);
  const shown = filter ? MIND_EXERCISES.filter((exercise) => exercise.category === filter) : MIND_EXERCISES;
  return (
    <div className="stack-lg">
      <p className="mind-note">All exercises are optional. Choose one that suits you, pick a length, and stop whenever you like. Each one can be read aloud step by step.</p>
      <div className="mind-chips" role="group" aria-label="Filter exercises">
        <button type="button" className="mind-chip" aria-pressed={filter === null} onClick={() => setFilter(null)}>
          All
        </button>
        {categories.map((category) => (
          <button key={category} type="button" className="mind-chip" aria-pressed={filter === category} onClick={() => setFilter(category)}>
            {CATEGORY_LABEL[category] ?? category}
          </button>
        ))}
      </div>
      <div className="mind-grid">
        {shown.map((exercise) => (
          <Link key={exercise.id} href={`/mind/exercises/${exercise.id}`} className="mind-card">
            <span className="mind-tag">{CATEGORY_LABEL[exercise.category] ?? exercise.category}</span>
            <h3>{exercise.title}</h3>
            <p>{exercise.summary}</p>
            <p className="mind-card-meta">
              {exercise.lengths.join(", ")} minutes · {EVIDENCE_LABELS[exercise.evidence].label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

type Phase = "ready" | "running" | "paused" | "finished";

export function MindExercisePlayer({ exercise }: { exercise: MindExercise }) {
  const store = useMindStore();
  const canSpeak = useSpeechSupport();
  const [minutes, setMinutes] = useState(exercise.lengths[Math.min(1, exercise.lengths.length - 1)]);
  const [voiceOn, setVoiceOn] = useState(true);
  const [phase, setPhase] = useState<Phase>("ready");
  const [steps, setSteps] = useState<TimedStep[]>([]);
  const [index, setIndex] = useState(0);
  const [left, setLeft] = useState(0);
  const [saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const token = useRef(0);

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(
    () => () => {
      token.current += 1;
      if (timer.current) clearInterval(timer.current);
      player.stop(OWNER);
    },
    [],
  );

  function runStep(list: TimedStep[], at: number) {
    clear();
    token.current += 1;
    const mine = token.current;
    if (at >= list.length) {
      player.stop(OWNER);
      setPhase("finished");
      return;
    }
    setIndex(at);
    setLeft(list[at].pause);
    const countdown = () => {
      timer.current = setInterval(() => {
        setLeft((value) => {
          if (value <= 1) {
            clear();
            setTimeout(() => runStep(list, at + 1), 0);
            return 0;
          }
          return value - 1;
        });
      }, 1000);
    };
    if (voiceOn && canSpeak) {
      player.play(OWNER, segmentsFromText(list[at].text, "en"), {
        stepWait: 0,
        rateFactor: 0.9,
        // Stopping the voice (Pause, Stop, leaving the page) also ends it: only continue if this step is still current.
        onEnd: () => {
          if (mine === token.current) countdown();
        },
      });
    } else countdown();
  }

  function start() {
    const list = planExercise(exercise, minutes);
    setSteps(list);
    setSaved(false);
    setPhase("running");
    runStep(list, 0);
  }

  function pause() {
    token.current += 1;
    clear();
    player.stop(OWNER);
    setPhase("paused");
  }

  function resume() {
    setPhase("running");
    token.current += 1;
    // Resume the quiet time where it was, without reading the step again.
    timer.current = setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          clear();
          setTimeout(() => runStep(steps, index + 1), 0);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }

  function stop() {
    token.current += 1;
    clear();
    player.stop(OWNER);
    setPhase("ready");
  }

  function save() {
    updateMindProgress((current) => ({
      ...current,
      exercises: [...current.exercises, { id: newId(), exercise: exercise.id, minutes, date: new Date().toISOString() }],
    }));
    setSaved(true);
  }

  const history = store.progress.exercises.filter((entry) => entry.exercise === exercise.id).slice(-3).reverse();
  const evidence = EVIDENCE_LABELS[exercise.evidence];

  return (
    <div className="stack-lg">
      <section className="card stack">
        <p>{exercise.summary}</p>
        <p>
          <strong>Why it may help:</strong> {exercise.why}
        </p>
        <p>
          <span className="mind-evidence" data-level={exercise.evidence}>
            {evidence.label}
          </span>{" "}
          <span className="hint">{evidence.meaning}</span>
        </p>
        {exercise.caution ? <p className="mind-note">{exercise.caution}</p> : null}
        {exercise.sourceUrl ? (
          <p className="hint">
            Source:{" "}
            <a href={exercise.sourceUrl} target="_blank" rel="noreferrer">
              {exercise.sourceLabel}
            </a>
          </p>
        ) : null}
      </section>

      <section className="mind-player" aria-labelledby="player-title">
        <h2 id="player-title">{phase === "finished" ? "Well done for taking this time" : exercise.title}</h2>
        {phase === "ready" ? (
          <>
            <p>Choose how long you would like.</p>
            <div className="mind-lengths" role="group" aria-label="Length">
              {exercise.lengths.map((length) => (
                <button key={length} type="button" className="mind-chip" aria-pressed={minutes === length} onClick={() => setMinutes(length)}>
                  {length} minutes
                </button>
              ))}
            </div>
            <label className="mind-toggle">
              <input type="checkbox" checked={voiceOn && canSpeak !== false} disabled={canSpeak === false} onChange={(event) => setVoiceOn(event.target.checked)} />
              Read the steps aloud
            </label>
            {canSpeak === false ? <p className="hint">This browser cannot read aloud. The steps will appear on screen.</p> : null}
            <p className="hint">About {Math.round(plannedSeconds(planExercise(exercise, minutes)) / 60)} minutes with quiet pauses between steps.</p>
            <button type="button" className="btn btn-primary" onClick={start}>
              Start
            </button>
          </>
        ) : phase === "finished" ? (
          <>
            <p>Notice how you feel now. There is no right way to feel after an exercise.</p>
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={start}>
                Repeat
              </button>
              {store.consent ? (
                saved ? (
                  <span className="mind-tag validated" role="status">
                    Saved to My progress
                  </span>
                ) : (
                  <button type="button" className="btn btn-primary" onClick={save}>
                    Save to My progress
                  </button>
                )
              ) : (
                <Link className="btn btn-ghost" href="/mind/progress">
                  Turn on saving to keep a record
                </Link>
              )}
              <Link className="btn btn-ghost" href="/mind/exercises">
                Other exercises
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mind-orb" data-paused={phase === "paused"} aria-hidden="true" />
            <p className="mind-count">
              Step {index + 1} of {steps.length}
            </p>
            <p className="mind-step-text" aria-live="polite">
              {steps[index]?.text}
            </p>
            <p className="mind-count" aria-live="off">
              {phase === "paused" ? "Paused" : left > 0 ? `${left} seconds of quiet` : "…"}
            </p>
            <div className="actions">
              {phase === "paused" ? (
                <button type="button" className="btn btn-primary" onClick={resume}>
                  Resume
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={pause}>
                  Pause
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => runStep(steps, index + 1)}>
                Next step
              </button>
              <button type="button" className="btn btn-ghost" onClick={stop}>
                Stop
              </button>
            </div>
          </>
        )}
      </section>

      {exercise.writing ? (
        <section className="card stack">
          <h2>Write it down (optional)</h2>
          <p className="hint">What you write here is not saved or sent anywhere. It disappears when you leave the page, so copy it to paper if you want to keep it.</p>
          <div className="mind-writing">
            {exercise.writing.map((prompt) => (
              <label key={prompt}>
                {prompt}
                <textarea />
              </label>
            ))}
          </div>
        </section>
      ) : null}

      <section className="card stack">
        <h2>All the steps</h2>
        <ol className="mind-list">
          {exercise.steps.map((step) => (
            <li key={step.text}>{step.text}</li>
          ))}
        </ol>
        {history.length ? (
          <p className="hint">You saved this exercise on: {history.map((entry) => `${formatDate(entry.date)} (${entry.minutes} min)`).join(", ")}.</p>
        ) : null}
      </section>
    </div>
  );
}
