"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useT } from "@/components/locale-provider";
import { ArticleLinks, formatDate, useMindStore } from "@/components/mind/shared";
import { exerciseById } from "@/lib/mind/exercises";
import { buildPlan, PLAN_DAYS, PLAN_GOALS, PLAN_NOTICE, planSummary, updatePlanDay, type PlanGoal } from "@/lib/mind/plan";
import { updateMindProgress } from "@/lib/mind/store";

export function MindPlan() {
  const t = useT();
  const { locale } = useLocale();
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
        <p className="mind-note">{t(PLAN_NOTICE)}</p>
        <section className="card stack" aria-labelledby="plan-goals">
          <h2 id="plan-goals">{t("What would you like to work on?")}</h2>
          <p>{t("Choose one or more goals. LifeZoi Mind will suggest an activity for each day, and you can change any of them.")}</p>
          <div className="mind-chips" role="group" aria-labelledby="plan-goals">
            {PLAN_GOALS.map((goal) => (
              <button key={goal.id} type="button" className="mind-chip" aria-pressed={goals.includes(goal.id)} onClick={() => toggle(goal.id)}>
                {goals.includes(goal.id) ? "✓ " : ""}
                {t(goal.label)}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={goals.length === 0}
            onClick={() => updateMindProgress((current) => ({ ...current, plan: buildPlan(goals, new Date().toISOString()) }))}
          >
            {t("Create my 7-day plan")}
          </button>
          <p className="hint">
            {store.consent
              ? t("Your plan will be saved in this browser.")
              : t("Saving is off, so your plan lasts until you close this tab. You can turn saving on in My progress.")}
          </p>
        </section>
        <section className="card stack">
          <h2>{t("What the week looks like")}</h2>
          <ol className="mind-list">
            {PLAN_DAYS.map((day) => (
              <li key={day.day}>
                <strong>{t("Day {day}: {theme}", { day: day.day, theme: t(day.theme) })}.</strong> {t(day.intro)}
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }

  const summary = planSummary(plan);
  const goalLabels = plan.goals.map((goal) => PLAN_GOALS.find((entry) => entry.id === goal)?.label)
    .filter((label): label is (typeof PLAN_GOALS)[number]["label"] => !!label)
    .map((label) => t(label));

  return (
    <div className="stack-lg">
      <p className="mind-note">{t(PLAN_NOTICE)}</p>
      <section className="card stack" aria-live="polite">
        <h2>{t("Your plan")}</h2>
        <p>
          {t("Started {date}", { date: formatDate(plan.startedAt, locale) })} · {t("Goals: {goals}", { goals: goalLabels.join(", ") })}
        </p>
        <p>
          {t("Done: {count}", { count: summary.done })} · {t("Skipped: {count}", { count: summary.skipped })} · {t("Still to try: {count}", { count: summary.left })}. {t("Go at your own pace; the days don't have to be done in a row.")}
        </p>
      </section>
      {PLAN_DAYS.map((template, index) => {
        const day = plan.days[index];
        const exercise = exerciseById(day.exercise);
        return (
          <section key={template.day} className="mind-card mind-day" data-status={day.status} aria-labelledby={`day-${template.day}`}>
            <div className="mind-day-head">
              <h3 id={`day-${template.day}`}>
                {t("Day {day}: {theme}", { day: template.day, theme: t(template.theme) })}
              </h3>
              <span className="mind-tag">{day.status === "done" ? `✓ ${day.doneCount > 1 ? t("Done, times: {count}", { count: day.doneCount }) : t("Done")}` : day.status === "skipped" ? t("Skipped") : t("To try")}</span>
            </div>
            <p>{t(template.intro)}</p>
            <label className="stack" style={{ gap: "0.3rem" }}>
              <span>{t("Activity")}</span>
              <select value={day.exercise} onChange={(event) => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, { exercise: event.target.value }) } : current))}>
                {template.options.map((option) => (
                  <option key={option.exercise} value={option.exercise}>
                    {t(exerciseById(option.exercise)?.title ?? option.exercise)}
                  </option>
                ))}
              </select>
            </label>
            {exercise ? <p className="hint">{t(exercise.summary)}</p> : null}
            <p>
              <em>{t("Reflection question:")}</em> {t(template.reflection)}
            </p>
            <ArticleLinks slugs={[template.article]} title={t("Reading for this day")} />
            <div className="actions">
              <Link className="btn btn-primary btn-small" href={`/mind/exercises/${day.exercise}`}>
                {t("Start activity")}
              </Link>
              {day.status === "done" ? (
                <button type="button" className="btn btn-secondary btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "repeat") } : current))}>
                  {t("I did it again")}
                </button>
              ) : (
                <button type="button" className="btn btn-secondary btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "done") } : current))}>
                  {t("Mark as done")}
                </button>
              )}
              {day.status === "todo" ? (
                <button type="button" className="btn btn-ghost btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "skip") } : current))}>
                  {t("Skip this day")}
                </button>
              ) : (
                <button type="button" className="btn btn-ghost btn-small" onClick={() => updateMindProgress((current) => (current.plan ? { ...current, plan: updatePlanDay(current.plan, index, "reset") } : current))}>
                  {t("Mark as not done")}
                </button>
              )}
            </div>
          </section>
        );
      })}
      <section className="card stack">
        <h2>{t("Change the plan")}</h2>
        {confirmReset ? (
          <div className="actions">
            <button type="button" className="btn btn-danger" onClick={() => {
              updateMindProgress((current) => ({ ...current, plan: null }));
              setConfirmReset(false);
            }}>
              {t("Yes, delete this plan")}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(false)}>
              {t("Keep it")}
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn-secondary" onClick={() => setConfirmReset(true)}>
            {t("Start over with different goals")}
          </button>
        )}
      </section>
    </div>
  );
}
