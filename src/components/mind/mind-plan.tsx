"use client";

import Link from "next/link";
import { useState } from "react";
import { ArticleLinks, formatDate, useMindStore } from "@/components/mind/shared";
import { exerciseById } from "@/lib/mind/exercises";
import { buildPlan, PLAN_DAYS, PLAN_GOALS, PLAN_NOTICE, planSummary, updatePlanDay, type PlanGoal } from "@/lib/mind/plan";
import { updateMindProgress } from "@/lib/mind/store";

export function MindPlan() {
  const store = useMindStore();
  const plan = store.progress.plan;
  const [goals, setGoals] = useState<PlanGoal[]>([]);
  const [confirmReset, setConfirmReset] = useState(false);

  function toggle(goal: PlanGoal) {
    setGoals((current) => (current.includes(goal) ? current.filter((entry) => entry !== goal) : [...current, goal]));
  }

  if (!plan) {
    return (
      <div className="stack-lg">
        <p className="mind-note">{PLAN_NOTICE}</p>
        <section className="card stack" aria-labelledby="plan-goals">
          <h2 id="plan-goals">What would you like to work on?</h2>
          <p>Choose one or more goals. LifeZoi Mind will suggest an activity for each day, and you can change any of them.</p>
          <div className="mind-chips" role="group" aria-labelledby="plan-goals">
            {PLAN_GOALS.map((goal) => (
              <button key={goal.id} type="button" className="mind-chip" aria-pressed={goals.includes(goal.id)} onClick={() => toggle(goal.id)}>
                {goals.includes(goal.id) ? "✓ " : ""}
                {goal.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={goals.length === 0}
            onClick={() => updateMindProgress((current) => ({ ...current, plan: buildPlan(goals, new Date().toISOString()) }))}
          >
            Create my 7-day plan
          </button>
          <p className="hint">
            {store.consent
              ? "Your plan will be saved in this browser."
              : "Saving is off, so your plan lasts until you close this tab. You can turn saving on in My progress."}
          </p>
        </section>
        <section className="card stack">
          <h2>What the week looks like</h2>
          <ol className="mind-list">
            {PLAN_DAYS.map((day) => (
              <li key={day.day}>
                <strong>Day {day.day}: {day.theme}.</strong> {day.intro}
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }

  const summary = planSummary(plan);
  const goalLabels = plan.goals.map((goal) => PLAN_GOALS.find((entry) => entry.id === goal)?.label).filter(Boolean);

  return (
    <div className="stack-lg">
      <p className="mind-note">{PLAN_NOTICE}</p>
      <section className="card stack" aria-live="polite">
        <h2>Your plan</h2>
        <p>
          Started {formatDate(plan.startedAt)} · Goals: {goalLabels.join(", ")}
        </p>
        <p>
          <strong>{summary.done}</strong> done · <strong>{summary.skipped}</strong> skipped · <strong>{summary.left}</strong> still to try. Go at your own pace; the days don&apos;t have to be done in a row.
        </p>
      </section>
      {PLAN_DAYS.map((template, index) => {
        const day = plan.days[index];
        const exercise = exerciseById(day.exercise);
        return (
          <section key={template.day} className="mind-card mind-day" data-status={day.status} aria-labelledby={`day-${template.day}`}>
            <div className="mind-day-head">
              <h3 id={`day-${template.day}`}>
                Day {template.day}: {template.theme}
              </h3>
              <span className="mind-tag">{day.status === "done" ? `✓ Done${day.doneCount > 1 ? ` ${day.doneCount} times` : ""}` : day.status === "skipped" ? "Skipped" : "To try"}</span>
            </div>
            <p>{template.intro}</p>
            <label className="stack" style={{ gap: "0.3rem" }}>
              <span>Activity</span>
              <select value={day.exercise} onChange={(event) => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, { exercise: event.target.value }) } : current))}>
                {template.options.map((option) => (
                  <option key={option.exercise} value={option.exercise}>
                    {exerciseById(option.exercise)?.title}
                  </option>
                ))}
              </select>
            </label>
            {exercise ? <p className="hint">{exercise.summary}</p> : null}
            <p>
              <em>Reflection question:</em> {template.reflection}
            </p>
            <ArticleLinks slugs={[template.article]} title="Reading for this day" />
            <div className="actions">
              <Link className="btn btn-primary btn-small" href={`/mind/exercises/${day.exercise}`}>
                Start activity
              </Link>
              {day.status === "done" ? (
                <button type="button" className="btn btn-secondary btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "repeat") } : current))}>
                  I did it again
                </button>
              ) : (
                <button type="button" className="btn btn-secondary btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "done") } : current))}>
                  Mark as done
                </button>
              )}
              {day.status === "todo" ? (
                <button type="button" className="btn btn-ghost btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "skip") } : current))}>
                  Skip this day
                </button>
              ) : (
                <button type="button" className="btn btn-ghost btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "reset") } : current))}>
                  Mark as not done
                </button>
              )}
            </div>
          </section>
        );
      })}
      <section className="card stack">
        <h2>Change the plan</h2>
        {confirmReset ? (
          <div className="actions">
            <button type="button" className="btn btn-danger" onClick={() => {
              updateMindProgress((current) => ({ ...current, plan: null }));
              setConfirmReset(false);
            }}>
              Yes, delete this plan
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
              Keep it
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={() => setConfirmReset(true)}>
            Start over with different goals
          </button>
        )}
      </section>
    </div>
  );
}
