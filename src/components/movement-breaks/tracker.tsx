"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useProfile } from "@/components/companion/use-profile";
import { resetSitting, saveReminder, useReminder } from "@/components/movement-breaks/reminder-store";
import { commitCompanion } from "@/lib/companion/store";
import { clearEntry, recordEntry } from "@/lib/companion/state";
import { localISODate } from "@/lib/dates";
import { MB } from "@/lib/movement-breaks/content";
import { addMovementBreak, breakHistory, isTracked, reminderDue, REMINDER_MINUTES, TRACK_ITEMS, type TrackItemId } from "@/lib/movement-breaks/personal";

/** Drink water, take a movement break, walk, calf raises, breathing, and the daily movement goal. */
export function MovementTracker() {
  const { companion, sample } = useProfile();
  const today = localISODate();
  const day = companion.days[today] ?? null;
  const breaks = day?.movementBreaks ?? 0;
  const history = breakHistory(companion, today);
  const most = Math.max(1, ...history.map((item) => item.breaks));

  function toggle(id: TrackItemId, on: boolean) {
    if (id === "mb-break" && on) {
      commitCompanion((state) => addMovementBreak(state, today));
      resetSitting();
      return;
    }
    commitCompanion((state) => (on ? recordEntry(state, today, id, { status: "done", minutes: 0, replacedWith: "" }) : clearEntry(state, today, id)));
  }

  return (
    <section className="card stack" aria-labelledby="mb-tracker-title">
      <h2 id="mb-tracker-title">Today: drink, breathe, move</h2>
      <p className="hint">Tick what you have done today. Anything you do counts. {sample ? "Sample data is on, so nothing is saved." : ""}</p>
      <ul className="mb-checks">
        {TRACK_ITEMS.map((item) => (
          <li key={item.id}>
            <label className="check-row mb-check">
              <input type="checkbox" disabled={sample} checked={isTracked(day, item.id)} onChange={(event) => toggle(item.id, event.target.checked)} />
              <span>
                <strong>{item.label}</strong>
                <span className="hint">{item.hint}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mb-count" role="status">
        <p>
          <strong className="mb-count-num">{breaks}</strong> movement {breaks === 1 ? "break" : "breaks"} today
        </p>
        <button
          className="btn btn-secondary mb-big"
          type="button"
          disabled={sample}
          onClick={() => {
            commitCompanion((state) => addMovementBreak(state, today));
            resetSitting();
          }}
        >
          I took a movement break
        </button>
      </div>
      <figure className="mb-week">
        <figcaption className="hint">Movement breaks in the last 7 days</figcaption>
        <ol className="mb-week-bars">
          {history.map((item) => (
            <li key={item.date} title={`${item.date}: ${item.breaks}`}>
              <span className="mb-week-bar" style={{ height: `${Math.round((item.breaks / most) * 100)}%` }} />
              <span className="mb-week-num">{item.breaks}</span>
              <span className="mb-week-day">{new Date(`${item.date}T12:00:00`).toLocaleDateString("en", { weekday: "short" })}</span>
            </li>
          ))}
        </ol>
      </figure>
    </section>
  );
}

/** Settings for the optional reminder: on or off, how often, and an optional browser notification. */
export function ReminderSettingsCard() {
  const reminder = useReminder();
  const [permission, setPermission] = useState<string>("unknown");
  useEffect(() => {
    const id = window.setTimeout(() => setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission), 0);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <section className="card stack" aria-labelledby="mb-reminder-title">
      <h2 id="mb-reminder-title">Optional sitting-break reminder</h2>
      <p>
        Useful if you work at a desk or computer, or sit for long periods. While a LifeZoi page is open, it shows the message “{MB.rule.prompt}” after the time you choose.
      </p>
      <label className="check-row">
        <input
          type="checkbox"
          checked={reminder.on}
          onChange={(event) => {
            const on = event.target.checked;
            saveReminder((current) => ({ ...current, on, since: on ? Date.now() : 0 }));
          }}
        />
        <span>Remind me to take a movement break</span>
      </label>
      {reminder.on ? (
        <>
          <fieldset className="field">
            <legend>Remind me after sitting for</legend>
            <div className="lz-tabs">
              {REMINDER_MINUTES.map((minutes) => (
                <button key={minutes} type="button" className="lz-tab" aria-pressed={reminder.minutes === minutes} onClick={() => saveReminder((current) => ({ ...current, minutes, since: Date.now() }))}>
                  {minutes} minutes
                </button>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-ghost" type="button" onClick={() => saveReminder((current) => ({ ...current, since: Date.now() }))}>
            I just sat down: start counting now
          </button>
          {permission === "default" ? (
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                void Notification.requestPermission().then(setPermission);
              }}
            >
              Also show a browser notification when this tab is in the background
            </button>
          ) : null}
          {permission === "granted" ? <p className="hint">Browser notifications are allowed for this site. You can turn them off in your browser settings.</p> : null}
        </>
      ) : null}
      <p className="hint">
        The reminder is saved on this device only. It works while LifeZoi is open in a browser tab, and it does not use a paid notification service or send anything to a server.
      </p>
    </section>
  );
}

/** The reminder banner. It is mounted once in the app shell and shows nothing unless the reminder is on and due. */
export function SittingReminder() {
  const reminder = useReminder();
  const [now, setNow] = useState(0);
  const [notified, setNotified] = useState(0);
  useEffect(() => {
    if (!reminder.on) return;
    const check = () => setNow(Date.now());
    const id = window.setInterval(check, 15_000);
    const first = window.setTimeout(check, 0);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [reminder.on]);
  const due = now > 0 && reminderDue(reminder, now);
  useEffect(() => {
    if (!due || notified === reminder.since) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted" || !document.hidden) return;
    try {
      new Notification("LifeZoi", { body: MB.rule.prompt, tag: "lifezoi-sitting-break" });
    } catch {
      // Some browsers only allow notifications from a service worker. The banner still shows.
    }
    const id = window.setTimeout(() => setNotified(reminder.since), 0);
    return () => window.clearTimeout(id);
  }, [due, notified, reminder.since]);
  if (!due) return null;
  return (
    <aside className="mb-reminder" role="alert" aria-labelledby="mb-reminder-banner">
      <p id="mb-reminder-banner" className="mb-reminder-title">
        {MB.rule.prompt}
      </p>
      <p>{MB.rule.explain}</p>
      <div className="lz-buttons">
        <Link className="btn btn-gold mb-big" href="/academy/move/breaks#break" onClick={() => resetSitting()}>
          Start the 2-minute break
        </Link>
        <button className="btn btn-secondary mb-big" type="button" onClick={() => resetSitting()}>
          I just moved
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => saveReminder((current) => ({ ...current, on: false, since: 0 }))}>
          Turn off reminders
        </button>
      </div>
    </aside>
  );
}
