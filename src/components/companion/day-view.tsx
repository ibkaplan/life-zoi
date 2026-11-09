"use client";

import Link from "next/link";
import { useState } from "react";
import { ActivityCard } from "@/components/companion/activity-card";
import { Art } from "@/components/companion/art";
import { SaveNote } from "@/components/companion/shared";
import { useProfile } from "@/components/companion/use-profile";
import { DAY_SLOTS, daySchedule, nextOption, planContext, SLOT_INFO, type DaySlot } from "@/lib/companion/day-plan";
import { commitCompanion } from "@/lib/companion/store";
import { withDay, type DayLog } from "@/lib/companion/state";
import { checkInDue } from "@/lib/companion/weekly";
import { formatLongDate, localISODate } from "@/lib/dates";
import { safetyFlags } from "@/lib/health-profile";

const SCALE = [1, 2, 3, 4, 5] as const;

function DailyLog({ day, today }: { day: DayLog | null; today: string }) {
  const { sample } = useProfile();
  function save(patch: Partial<DayLog>) {
    commitCompanion((state) => withDay(state, today, (current) => ({ ...current, ...patch })));
  }
  return (
    <section className="card stack">
      <h2>How are you today?</h2>
      <p className="hint">Answer any, all, or none. These are your own notes, not measurements.</p>
      {(["mood", "energy"] as const).map((key) => (
        <fieldset key={key} className="field">
          <legend>{key === "mood" ? "Mood" : "Energy"} (1 low, 5 high)</legend>
          <div className="lz-tabs">
            {SCALE.map((value) => (
              <button key={value} type="button" className="lz-tab" disabled={sample} aria-pressed={day?.[key] === value} onClick={() => save({ [key]: day?.[key] === value ? null : value })}>
                {value}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="field">
        <span>Hours of sleep last night</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          max={16}
          step={0.5}
          disabled={sample}
          value={day?.sleepHours ?? ""}
          onChange={(event) => {
            const value = event.target.value === "" ? null : Number(event.target.value);
            save({ sleepHours: value !== null && value >= 0 && value <= 16 ? value : null });
          }}
        />
      </label>
      {day ? (
        <ul className="record-list">
          <li>Walking: {day.walkingMinutes} min · Exercise: {day.exerciseMinutes} min</li>
          <li>Pages read: {day.readingPages} · Listening: {day.listeningMinutes} min · Brain games: {day.brainGames}</li>
          <li>Meals and food habits: {day.nutritionHabits}</li>
        </ul>
      ) : null}
    </section>
  );
}

function Customize({ today }: { today: string }) {
  const { companion, sample } = useProfile();
  const { hidden, times } = companion.customize;
  return (
    <details className="lz-section">
      <summary>
        <span>Customize my day</span>
      </summary>
      <div className="lz-section-body">
        <p className="hint">Turn parts of the day on or off and set the times that suit you. Your choices stay until you change them.</p>
        {DAY_SLOTS.map((slot) => (
          <div key={slot} className="inline-form">
            <label className="check-row">
              <input
                type="checkbox"
                disabled={sample}
                checked={!hidden.includes(slot)}
                onChange={(event) =>
                  commitCompanion((state) => ({
                    ...state,
                    customize: { ...state.customize, hidden: event.target.checked ? state.customize.hidden.filter((item) => item !== slot) : [...state.customize.hidden, slot] },
                  }))
                }
              />
              <span>{SLOT_INFO[slot].label}</span>
            </label>
            <input
              type="time"
              aria-label={`Time for ${SLOT_INFO[slot].label}`}
              disabled={sample}
              value={times[slot] ?? SLOT_INFO[slot].time}
              onChange={(event) =>
                /^\d{2}:\d{2}$/.test(event.target.value) &&
                commitCompanion((state) => ({ ...state, customize: { ...state.customize, times: { ...state.customize.times, [slot]: event.target.value } } }))
              }
            />
          </div>
        ))}
        <button
          className="btn btn-ghost"
          type="button"
          disabled={sample}
          onClick={() =>
            commitCompanion((state) => {
              const picks = Object.fromEntries(Object.entries(state.customize.picks).filter(([key]) => !key.startsWith(`${today}:`)));
              return { ...state, customize: { hidden: [], times: {}, picks } };
            })
          }
        >
          Reset to the suggested day
        </button>
      </div>
    </details>
  );
}

export function CompanionDayView() {
  const { ready, companion, answers, sample } = useProfile();
  const [showAll, setShowAll] = useState(false);
  if (!ready) return <p className="hint">Loading your day…</p>;
  const today = localISODate();
  const day = companion.days[today] ?? null;
  const flags = answers ? safetyFlags(answers) : null;
  const ctx = planContext(companion, flags, answers?.wellnessGoals ?? []);
  const items = daySchedule(today, ctx, companion.customize, day);
  const done = items.filter((item) => {
    const status = day?.entries[`day-${item.slot}`]?.status;
    return status === "done" || status === "partial";
  }).length;
  const visible = showAll ? items : items.slice(0, 6);
  function replace(slot: DaySlot, nextId: string) {
    commitCompanion((state) => ({ ...state, customize: { ...state.customize, picks: { ...state.customize.picks, [`${today}:${slot}`]: nextId } } }));
  }
  return (
    <div className="stack-lg">
      <div className="lz-hero-row">
        <div className="lz-hello">
          <p className="kicker">My Day · {formatLongDate(today)}</p>
          <h1>Good to see you{answers?.displayName ? `, ${answers.displayName}` : ""}</h1>
          <p className="script brand-line">Live Joy. Live Better.</p>
          <p>Here is a gentle plan for today. Open anything to start it right here. Skip or replace whatever does not suit you.</p>
        </div>
        <Art name="day" />
      </div>
      <SaveNote />
      {!answers ? (
        <p className="alert">
          This day is general for now. <Link href="/assessment">Fill out your assessment</Link> and it will follow your goals, level, and food needs.
        </p>
      ) : null}
      {checkInDue(companion, today) ? (
        <p className="alert">
          It has been a week. <Link href="/progress/weekly">Take your weekly check-in</Link> to shape next week.
        </p>
      ) : null}
      <p role="status">
        <strong>
          {done} of {items.length}
        </strong>{" "}
        activities completed or partly completed today. Anything you do counts.
      </p>
      <div className="stack">
        {visible.map((item) => (
          <ActivityCard
            key={`${item.slot}-${item.activity.id}`}
            time={`${item.time} · ${SLOT_INFO[item.slot].label}`}
            activity={item.activity}
            activityId={`day-${item.slot}`}
            onReplace={item.options.length > 1 && !sample ? () => replace(item.slot, nextOption(item).id) : undefined}
          />
        ))}
      </div>
      {items.length > visible.length ? (
        <button className="btn btn-secondary" type="button" onClick={() => setShowAll(true)}>
          Show the rest of the day ({items.length - visible.length} more)
        </button>
      ) : null}
      <DailyLog day={day} today={today} />
      <Customize today={today} />
      <p className="hint">
        A new day is planned each morning from your saved answers, so you do not need to repeat the assessment. Looking for the earlier day tracker? It is still at{" "}
        <Link href="/my-day/classic">My Day classic</Link>.
      </p>
    </div>
  );
}
