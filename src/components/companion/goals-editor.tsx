"use client";

import { useState } from "react";
import { useProfile } from "@/components/companion/use-profile";
import { goalActivity } from "@/lib/companion/day-plan";
import { commitCompanion } from "@/lib/companion/store";
import { cleanText, LIMITS, type PersonalGoal } from "@/lib/companion/state";
import { localISODate } from "@/lib/dates";

/** Personal goals in the person's own words. Each becomes a small daily step. */
export function GoalsEditor() {
  const { companion, sample } = useProfile();
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const goals = companion.goals.filter((goal) => !goal.archivedOn);
  const today = localISODate();

  function add() {
    const clean = cleanText(text);
    if (!clean) return;
    commitCompanion((state) => {
      const id = `g${today.replace(/-/g, "")}${state.goals.length.toString(36)}`;
      const goal: PersonalGoal = { id, text: clean, createdOn: today, updatedOn: today, archivedOn: "" };
      return { ...state, goals: [goal, ...state.goals.filter((item) => item.id !== id)].slice(0, LIMITS.goals) };
    });
    setText("");
  }

  function update(id: string, patch: Partial<PersonalGoal>) {
    commitCompanion((state) => ({ ...state, goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...patch, updatedOn: today } : goal)) }));
  }

  return (
    <div className="stack">
      <p>Write a goal in your own words, such as “Walk to the park with my grandchildren” or “Feel calmer in the evenings”. LifeZoi turns each one into a small daily step.</p>
      {sample ? <p className="hint">Sample data is on. Goals are not saved.</p> : null}
      <div className="inline-form">
        <input aria-label="A new goal" value={text} maxLength={LIMITS.text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && add()} />
        <button className="btn btn-primary" type="button" onClick={add} disabled={!text.trim()}>
          Add goal
        </button>
      </div>
      {goals.length === 0 ? <p className="hint">No personal goals yet.</p> : null}
      <ul className="record-list">
        {goals.map((goal) => (
          <li key={goal.id} className="stack">
            {editing === goal.id ? (
              <div className="inline-form">
                <input aria-label="Edit goal" value={draft} maxLength={LIMITS.text} onChange={(event) => setDraft(event.target.value)} />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    const clean = cleanText(draft);
                    if (clean) update(goal.id, { text: clean });
                    setEditing(null);
                  }}
                >
                  Save
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <strong>{goal.text}</strong>
                <span className="hint">Daily step: {goalActivity(goal).title.replace(/^Toward “.*”: ?/, "") || "one small step"}</span>
                <div className="lz-buttons">
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      setEditing(goal.id);
                      setDraft(goal.text);
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => update(goal.id, { archivedOn: today })}>
                    Remove
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
