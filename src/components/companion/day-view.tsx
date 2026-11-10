"use client";

import { ChairYogaTodayCard } from "@/components/companion/chair-yoga-studio";
import Link from "next/link";
import { useState } from "react";
import { ActivityCard } from "@/components/companion/activity-card";
import { Art } from "@/components/companion/art";
import { SaveNote } from "@/components/companion/shared";
import { MovementBreakDayCard } from "@/components/movement-breaks/views";
import { useProfile } from "@/components/companion/use-profile";
import { DAY_SLOTS, daySchedule, nextOption, planContext, SLOT_INFO, type DaySlot } from "@/lib/companion/day-plan";
import { commitCompanion } from "@/lib/companion/store";
import { withDay, type DayLog } from "@/lib/companion/state";
import { checkInDue } from "@/lib/companion/weekly";
import { localISODate } from "@/lib/dates";
import { useT } from "@/components/locale-provider";
import { Rich, useDates } from "@/components/companion/i18n";
import { safetyFlags } from "@/lib/health-profile";

const SCALE = [1, 2, 3, 4, 5] as const;

function DailyLog({ day, today }: { day: DayLog | null; today: string }) {
  const { sample } = useProfile();
  const t = useT();
  function save(patch: Partial<DayLog>) {
    commitCompanion((state) => withDay(state, today, (current) => ({ ...current, ...patch })));
  }
  return (
    <section className="card stack">
      <h2>{t("How are you today?")}</h2>
      <p className="hint">{t("Answer any, all, or none. These are your own notes, not measurements.")}</p>
      {(["mood", "energy"] as const).map((key) => (
        <fieldset key={key} className="field">
          <legend>{key === "mood" ? t("Mood (1 low, 5 high)") : t("Energy (1 low, 5 high)")}</legend>
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
        <span>{t("Hours of sleep last night")}</span>
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
          <li>{t("Walking: {walking} min · Exercise: {exercise} min", { walking: day.walkingMinutes, exercise: day.exerciseMinutes })}</li>
          <li>{t("Pages read: {pages} · Listening: {listening} min · Brain games: {games}", { pages: day.readingPages, listening: day.listeningMinutes, games: day.brainGames })}</li>
          <li>{t("Meals and food habits: {count}", { count: day.nutritionHabits })}</li>
        </ul>
      ) : null}
    </section>
  );
}

function Customize({ today }: { today: string }) {
  const { companion, sample } = useProfile();
  const t = useT();
  const { hidden, times } = companion.customize;
  return (
    <details className="lz-section">
      <summary>
        <span>{t("Customize my day")}</span>
      </summary>
      <div className="lz-section-body">
        <p className="hint">{t("Turn parts of the day on or off and set the times that suit you. Your choices stay until you change them.")}</p>
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
              <span>{t(SLOT_INFO[slot].label)}</span>
            </label>
            <input
              type="time"
              aria-label={t("Time for {part}", { part: t(SLOT_INFO[slot].label) })}
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
          {t("Reset to the suggested day")}
        </button>
      </div>
    </details>
  );
}

export function CompanionDayView() {
  const { ready, companion, answers, sample } = useProfile();
  const [showAll, setShowAll] = useState(false);
  const t = useT();
  const dates = useDates();
  if (!ready) return <p className="hint">{t("Loading your day…")}</p>;
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
          <p className="kicker">{t("My Day · {date}", { date: dates.long(today) })}</p>
          <h1>{answers?.displayName ? t("Good to see you, {name}", { name: answers.displayName }) : t("Good to see you")}</h1>
          <p className="script brand-line">{t("Live Joy. Live Better.")}</p>
          <p>{t("Here is a gentle plan for today. Open anything to start it right here. Skip or replace whatever does not suit you.")}</p>
        </div>
        <Art name="day" />
      </div>
      <SaveNote />
      {!answers ? (
        <p className="alert">
          <Rich text={t("This day is general for now. <0>Fill out your assessment</0> and it will follow your goals, level, and food needs.")} parts={[(label) => <Link href="/assessment">{label}</Link>]} />
        </p>
      ) : null}
      {checkInDue(companion, today) ? (
        <p className="alert">
          <Rich text={t("It has been a week. <0>Take your weekly check-in</0> to shape next week.")} parts={[(label) => <Link href="/progress/weekly">{label}</Link>]} />
        </p>
      ) : null}
      <p role="status">
        <strong>{t("{done} of {total}", { done, total: items.length })}</strong>{" "}
        {t("activities completed or partly completed today. Anything you do counts.")}
      </p>
      <div className="stack">
        {visible.map((item) => (
          <ActivityCard
            key={`${item.slot}-${item.activity.id}`}
            time={`${item.time} · ${t(SLOT_INFO[item.slot].label)}`}
            activity={item.activity}
            activityId={`day-${item.slot}`}
            onReplace={item.options.length > 1 && !sample ? () => replace(item.slot, nextOption(item).id) : undefined}
          />
        ))}
      </div>
      {items.length > visible.length ? (
        <button className="btn btn-secondary" type="button" onClick={() => setShowAll(true)}>
          {t("Show the rest of the day ({count} more)", { count: items.length - visible.length })}
        </button>
      ) : null}
      <MovementBreakDayCard />
      <ChairYogaTodayCard />
      <DailyLog day={day} today={today} />
      <Customize today={today} />
      <p className="hint">
        <Rich
          text={t("A new day is planned each morning from your saved answers, so you do not need to repeat the assessment. Looking for the earlier day tracker? It is still at <0>My Day classic</0>.")}
          parts={[(label) => <Link href="/my-day/classic">{label}</Link>]}
        />
      </p>
    </div>
  );
}
