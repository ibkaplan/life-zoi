"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useSession } from "@/components/session-provider";
import { formatLongDate, localISODate } from "@/lib/dates";
import { getChangeLab, getChangeLabServer, subscribeChangeLab } from "@/lib/change-lab";
import type { EnergyLevel, WeeklyAccomplishmentId, WeightUnit } from "@/lib/types";
import {
  describeWeightTrend,
  energyFace,
  flagsFromIds,
  formatMinuteTotal,
  formatWeekRange,
  formatWeightValue,
  habitTally,
  journeyStatus,
  movementLogsFromMeasurements,
  progressDates,
  selectedAccomplishments,
  sumMovementMinutes,
  WEEKLY_ACCOMPLISHMENTS,
  weekRange,
  ENERGY_CHOICES,
} from "@/lib/weekly-progress";

const EMPTY_FLAGS: Record<WeeklyAccomplishmentId, boolean> = {
  movement: false,
  food: false,
  water: false,
  sleep: false,
  relax: false,
};

export function WeeklyProgress() {
  const { ready, sample, session, saveWeeklyCheckIn, saveWeight, removeWeight } = useSession();
  const changeLab = useSyncExternalStore(subscribeChangeLab, getChangeLab, getChangeLabServer);
  const today = localISODate();
  const week = weekRange(today);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [flags, setFlags] = useState(EMPTY_FLAGS);
  const [proud, setProud] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [weekMessage, setWeekMessage] = useState("");
  const [weekError, setWeekError] = useState("");
  const [weightDate, setWeightDate] = useState(today);
  const [weightValue, setWeightValue] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lb");
  const [weightMessage, setWeightMessage] = useState("");
  const [weightError, setWeightError] = useState("");

  if (!ready || !week) return null;

  const logs = movementLogsFromMeasurements([
    ...changeLab.baselineMeasurements,
    ...changeLab.followUpMeasurements,
  ]);
  const minutes = sumMovementMinutes(logs, week.start, week.end);
  const savedWeek = sample ? null : session.weeklyCheckIns.find((item) => item.weekStart === week.start) ?? null;
  const earlierWeeks = sample
    ? []
    : session.weeklyCheckIns
        .filter((item) => item.weekStart !== week.start)
        .sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  const tally = habitTally(savedWeek?.accomplishments ?? []);
  const face = energyFace(savedWeek?.energy ?? null);
  const weights = sample ? [] : [...session.weightEntries].sort((a, b) => b.date.localeCompare(a.date) || a.unit.localeCompare(b.unit));
  const trend = describeWeightTrend(weights);
  const dates = progressDates({
    assessments: sample ? [] : session.history.map((item) => item.completedAt),
    checkInDates: sample ? [] : session.checkIns.map((item) => item.date),
    weeklyWeekStarts: sample ? [] : session.weeklyCheckIns.map((item) => item.weekStart),
    weightDates: sample ? [] : session.weightEntries.map((item) => item.date),
    movementDates: logs.map((item) => item.date),
  });
  const journey = journeyStatus(dates);
  const showForm = !savedWeek || drafting;

  function clearForm() {
    setEnergy(null);
    setFlags(EMPTY_FLAGS);
    setProud("");
  }

  return (
    <div className="week-layout">
      <section id="my-progress" className="stack" aria-labelledby="my-progress-title">
        <div className="stack">
          <h2 id="my-progress-title">MY PROGRESS</h2>
          <p className="lede">Every small step counts.</p>
          {sample ? (
            <p className="banner banner-sample" role="status">
              Sample data is not shown on these cards.
            </p>
          ) : null}
        </div>
        <div className="progress-cards">
          <article className="card stack">
            <h3>Movement</h3>
            {minutes === null ? (
              <p>No movement minutes are saved for this week.</p>
            ) : (
              <p>
                <strong>{formatMinuteTotal(minutes)} {minutes === 1 ? "minute" : "minutes"}</strong> logged this week.
              </p>
            )}
          </article>
          <article className="card stack">
            <h3>Healthy habits</h3>
            {tally === null ? (
              <p>No check-in items are marked for this week.</p>
            ) : (
              <p>
                <strong>
                  {tally.marked} / {tally.total}
                </strong>{" "}
                items you marked this week.
              </p>
            )}
          </article>
          <article className="card stack">
            <h3>Weight</h3>
            <h4>Your trend</h4>
            {trend ? <p>{trend}</p> : <p>No measurements yet.</p>}
            {weights.length > 0 ? (
              <ul className="record-list">
                {weights.map((entry) => (
                  <li key={entry.id}>
                    <p>
                      {formatLongDate(entry.date)} · {formatWeightValue(entry.value)} {entry.unit}
                    </p>
                    <button
                      className="btn btn-ghost"
                      type="button"
                      disabled={sample}
                      onClick={() => removeWeight(entry.id)}
                    >
                      Remove measurement
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <h4>Enter your measurements</h4>
            <form
              className="stack"
              onSubmit={(event) => {
                event.preventDefault();
                const value = Number(weightValue);
                const result = saveWeight({ date: weightDate, value, unit: weightUnit });
                setWeightError(result ?? "");
                setWeightMessage(result ? "" : "Measurement saved in this tab.");
                if (!result) setWeightValue("");
              }}
            >
              <label className="field" htmlFor="weight-date">
                <span>Date</span>
                <input
                  id="weight-date"
                  type="date"
                  value={weightDate}
                  max={today}
                  onChange={(event) => setWeightDate(event.target.value)}
                />
              </label>
              <label className="field" htmlFor="weight-value">
                <span>Weight</span>
                <input
                  id="weight-value"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={weightValue}
                  onChange={(event) => setWeightValue(event.target.value)}
                />
              </label>
              <label className="field" htmlFor="weight-unit">
                <span>Unit</span>
                <select
                  id="weight-unit"
                  value={weightUnit}
                  onChange={(event) => setWeightUnit(event.target.value as WeightUnit)}
                >
                  <option value="lb">lb</option>
                  <option value="kg">kg</option>
                </select>
              </label>
              <button className="btn btn-primary" type="submit" disabled={sample}>
                Save measurement
              </button>
            </form>
            {weightError ? (
              <p className="field-error" role="alert">
                {weightError}
              </p>
            ) : null}
            {weightMessage ? (
              <p className="alert alert-ok" role="status">
                {weightMessage}
              </p>
            ) : null}
          </article>
          <article className="card stack">
            <h3>Energy</h3>
            <p>
              <Link href="#weekly-check-in">Feeling good?</Link>
            </p>
            {face && savedWeek?.energy ? (
              <p aria-label={`Energy ${savedWeek.energy} of 5`}>
                <span aria-hidden="true">{face}</span> {savedWeek.energy}
              </p>
            ) : (
              <p>No energy choice saved for this week.</p>
            )}
          </article>
        </div>
        <section className="card stack" aria-labelledby="journey-title">
          <h3 id="journey-title">Your journey</h3>
          <p className="hint">
            These are labels of time. A mark means a saved date reaches that span. It is not a result, and it does not promise a change.
          </p>
          <ol className="journey-list">
            {journey.map((step) => (
              <li key={step.id} className={step.reached ? "is-reached" : undefined}>
                <span className="journey-mark" aria-hidden="true" />
                <span>
                  <strong>{step.label}</strong>
                  <span className="hint">
                    {step.reached ? "A saved date reaches this span." : "No saved date reaches this span yet."}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </section>

      <section id="weekly-check-in" className="card stack" aria-labelledby="weekly-check-in-title">
        <div className="stack">
          <h2 id="weekly-check-in-title">MY WEEKLY CHECK-IN</h2>
          <p className="lede">Your week. Your progress. Your next step.</p>
          <p className="hint">{formatWeekRange(week.start, week.end)}. Nothing here is marked until you choose it.</p>
        </div>
        {savedWeek ? <SavedWeek weekStart={savedWeek.weekStart} energy={savedWeek.energy} accomplishments={savedWeek.accomplishments} proudOf={savedWeek.proudOf} /> : null}
        {earlierWeeks.length > 0 ? (
          <div className="stack">
            <h3>Earlier weeks</h3>
            {earlierWeeks.map((item) => (
              <SavedWeek
                key={item.id}
                weekStart={item.weekStart}
                energy={item.energy}
                accomplishments={item.accomplishments}
                proudOf={item.proudOf}
              />
            ))}
          </div>
        ) : null}
        {showForm ? (
          <form
            className="stack"
            onSubmit={(event) => {
              event.preventDefault();
              const result = saveWeeklyCheckIn({
                energy,
                accomplishments: selectedAccomplishments(flags),
                proudOf: proud,
              });
              setWeekError(result ?? "");
              setWeekMessage(result ? "" : "Week saved in this tab.");
              if (!result) {
                clearForm();
                setDrafting(false);
              }
            }}
          >
            {savedWeek ? (
              <p className="hint">Saving again updates this week. Earlier weeks stay in the list.</p>
            ) : null}
            <fieldset className="field">
              <legend>How are you feeling?</legend>
              <span className="hint">Energy, 1 to 5. This is your own choice, not a score.</span>
              <div className="energy-choices">
                {ENERGY_CHOICES.map((choice) => (
                  <label className="energy-choice" key={choice.level}>
                    <input
                      type="radio"
                      name="weekly-energy"
                      value={choice.level}
                      checked={energy === choice.level}
                      onChange={() => setEnergy(choice.level)}
                    />
                    <span aria-hidden="true">{choice.face}</span>
                    <span className="sr-only">Energy {choice.level} of 5</span>
                    <span aria-hidden="true">{choice.level}</span>
                  </label>
                ))}
              </div>
              {energy !== null ? (
                <button className="btn btn-ghost" type="button" onClick={() => setEnergy(null)}>
                  Clear energy choice
                </button>
              ) : null}
            </fieldset>
            <fieldset className="field">
              <legend>What did you accomplish this week?</legend>
              {WEEKLY_ACCOMPLISHMENTS.map((item) => (
                <label className="check-row" key={item.id}>
                  <input
                    type="checkbox"
                    checked={flags[item.id]}
                    onChange={(event) => setFlags({ ...flags, [item.id]: event.target.checked })}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </fieldset>
            <label className="field" htmlFor="proud-of">
              <span>One thing I am proud of</span>
              <span className="hint">A small win is still a win.</span>
              <input
                id="proud-of"
                type="text"
                maxLength={280}
                placeholder="A small win is still a win."
                value={proud}
                onChange={(event) => setProud(event.target.value)}
              />
            </label>
            <button className="btn btn-primary" type="submit" disabled={sample}>
              Save week
            </button>
          </form>
        ) : (
          <div className="actions">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setEnergy(savedWeek?.energy ?? null);
                setFlags(flagsFromIds(savedWeek?.accomplishments ?? []));
                setProud(savedWeek?.proudOf ?? "");
                setDrafting(true);
                setWeekMessage("");
                setWeekError("");
              }}
            >
              Update this week
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                clearForm();
                setDrafting(true);
                setWeekMessage("");
                setWeekError("");
              }}
            >
              Start a new week
            </button>
          </div>
        )}
        {weekError ? (
          <p className="field-error" role="alert">
            {weekError}
          </p>
        ) : null}
        {weekMessage ? (
          <p className="alert alert-ok" role="status">
            {weekMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function SavedWeek({
  weekStart,
  energy,
  accomplishments,
  proudOf,
}: {
  weekStart: string;
  energy: EnergyLevel | null;
  accomplishments: readonly WeeklyAccomplishmentId[];
  proudOf: string;
}) {
  const range = weekRange(weekStart);
  const face = energyFace(energy);
  return (
    <article className="saved-week stack">
      <h3>{range ? formatWeekRange(range.start, range.end) : formatLongDate(weekStart)}</h3>
      {face && energy ? (
        <p aria-label={`Energy ${energy} of 5`}>
          <span aria-hidden="true">{face}</span> Energy {energy}
        </p>
      ) : (
        <p>No energy choice saved.</p>
      )}
      <ul className="record-list">
        {WEEKLY_ACCOMPLISHMENTS.map((item) => {
          const marked = accomplishments.includes(item.id);
          return (
            <li key={item.id}>
              <p>{marked ? "Marked by you" : "Not marked"}: {item.label}</p>
            </li>
          );
        })}
      </ul>
      {proudOf ? <p>{proudOf}</p> : <p>No note saved.</p>}
    </article>
  );
}
