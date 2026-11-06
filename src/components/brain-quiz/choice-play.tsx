"use client";

import { useState } from "react";
import type { ChoiceActivity, MultiActivity, RebusActivity } from "@/lib/brain-quiz/activities";
import { RebusArt } from "@/components/brain-quiz/rebus-art";

type Question = ChoiceActivity | MultiActivity | RebusActivity;

function sameSet(left: readonly number[], right: readonly number[]) {
  if (left.length !== right.length) return false;
  const a = [...left].sort((x, y) => x - y);
  const b = [...right].sort((x, y) => x - y);
  return a.every((value, index) => value === b[index]);
}

export function correctIndexes(activity: Question): number[] {
  return activity.kind === "multi" ? [...activity.correctIndexes] : [activity.correctIndex];
}

export function ChoicePlay({
  activity,
  revealed,
  picked,
  onSubmit,
}: {
  activity: Question;
  revealed: boolean;
  picked: number[];
  onSubmit: (picked: number[], correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number[]>(picked);
  const multi = activity.kind === "multi";
  const show = revealed;

  function toggle(index: number) {
    if (show) return;
    setSelected((current) => {
      if (!multi) return [index];
      return current.includes(index) ? current.filter((item) => item !== index) : [...current, index];
    });
  }

  function submit() {
    if (show || selected.length === 0) return;
    const expected = correctIndexes(activity);
    onSubmit(selected, sameSet(selected, expected));
  }

  return (
    <div className="stack">
      {activity.kind === "rebus" ? <RebusArt layout={activity.rebus} /> : null}
      <p>{activity.prompt}</p>
      {multi ? <p className="hint">Select every correct choice. The full set is required.</p> : null}
      <div className="choices" role="group" aria-label="Choices">
        {activity.choices.map((choice, index) => {
          const on = selected.includes(index);
          const expected = show && correctIndexes(activity).includes(index);
          return (
            <button
              key={choice}
              type="button"
              className="choice"
              aria-pressed={on}
              disabled={show}
              onClick={() => toggle(index)}
            >
              <span>{choice}</span>
              {show ? <span className="choice-mark">{expected ? "Correct" : "Not this one"}</span> : null}
            </button>
          );
        })}
      </div>
      {show ? (
        <div className="stack">
          {activity.choices.map((choice, index) => (
            <p key={choice}>
              <strong>{choice}. </strong>
              {activity.explanations[index]}
            </p>
          ))}
          {activity.kind !== "rebus" && activity.sources?.length ? (
            <ul className="source-list">
              {activity.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url}>{source.name}</a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        <button className="btn btn-primary" type="button" onClick={submit} disabled={selected.length === 0}>
          Check answer
        </button>
      )}
    </div>
  );
}
