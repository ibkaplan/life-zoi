"use client";

import "./reminders.css";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { useAccount } from "@/lib/account-store";
import { LOCALE_META } from "@/lib/i18n/config";
import { msg } from "@/lib/i18n/translate";
import { ALL_DAYS, MAX_TIMES, nextSlot, REMINDER_INFO, TIMED_REMINDER_IDS, type TimedReminder, type TimedReminderId } from "@/lib/reminders/schedule";
import { clearTimedReminders, saveTimedReminders, useTimedReminders } from "./reminder-store";

type Permission = "unknown" | "unsupported" | NotificationPermission;

const DESCRIPTIONS: Record<TimedReminderId, string> = {
  blood_pressure: msg("A reminder to measure and write it in the health diary."),
  glucose: msg("A reminder to check and write it in the health diary."),
  daily_checkin: msg("A reminder for the short LifeZoi Daily check-in."),
  my_day: msg("A reminder to look at today's plan for your habits."),
};

/** Monday first. */
const WEEK = [1, 2, 3, 4, 5, 6, 0];

export function ReminderSettingsView() {
  const { t, locale } = useLocale();
  const account = useAccount();
  const userId = account.phase === "ready" ? account.userId : null;
  const reminders = useTimedReminders(userId);
  const [permission, setPermission] = useState<Permission>("unknown");
  const [tested, setTested] = useState("");
  const [now, setNow] = useState(0);
  const lang = LOCALE_META[locale].htmlLang;

  useEffect(() => {
    const id = window.setTimeout(() => {
      setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
      setNow(Date.now());
    }, 0);
    return () => window.clearTimeout(id);
  }, [reminders]);

  const formats = useMemo(() => {
    const weekday = new Intl.DateTimeFormat(lang, { weekday: "short" });
    const longWeekday = new Intl.DateTimeFormat(lang, { weekday: "long" });
    const when = new Intl.DateTimeFormat(lang, { weekday: "long", hour: "2-digit", minute: "2-digit" });
    // 2024-01-07 was a Sunday, so day n of the week is 7 + n.
    const dayDate = (day: number) => new Date(2024, 0, 7 + day);
    return { day: (day: number) => weekday.format(dayDate(day)), longDay: (day: number) => longWeekday.format(dayDate(day)), when: (at: number) => when.format(new Date(at)) };
  }, [lang]);

  if (account.phase === "loading") return <p className="hint">{t("Checking sign-in…")}</p>;
  if (!userId) return <p className="alert">{t("Sign in to set reminders. They are kept for your account in this browser.")}</p>;

  const update = (id: TimedReminderId, change: (current: TimedReminder) => TimedReminder) =>
    saveTimedReminders(userId, (current) => ({ ...current, [id]: { ...change(current[id]), since: Date.now() } }));
  const next = now > 0 ? nextSlot(reminders, new Date(now)) : null;
  const anyOn = TIMED_REMINDER_IDS.some((id) => reminders[id].on);

  const test = () => {
    try {
      new Notification("LifeZoi", { body: t("This is how a LifeZoi reminder looks."), tag: "lifezoi-reminder-test" });
      setTested(t("A test notification was sent. If you do not see it, check your browser and system notification settings."));
    } catch {
      setTested(t("This browser does not show notifications from a web page. Reminders will appear at the top of LifeZoi pages instead."));
    }
  };

  return (
    <div className="stack-lg tr-page">
      <section className="stack">
        <p className="kicker">{t("My Health")}</p>
        <h1>{t("My reminders")}</h1>
        <p className="lede">{t("Choose times to be reminded to measure blood pressure, check blood sugar, and keep your daily habits. You can change or turn off any reminder at any time.")}</p>
      </section>

      <section className="card stack">
        <h2>{t("How reminders work")}</h2>
        <ul className="tr-list">
          <li>{t("At the time you choose, a reminder appears at the top of any LifeZoi page you have open.")}</li>
          <li>{t("If you allow browser notifications, you also get one when LifeZoi is open in a background tab.")}</li>
          <li>{t("If LifeZoi is not open in any tab, no reminder can arrive. LifeZoi does not send e-mails, text messages, or push messages, and uses no paid service.")}</li>
          <li>{t("Reminders are saved in this browser for your account. They are not health data and are not sent to a server. On another device, set them again.")}</li>
          <li>{t("A reminder only names the activity. It is not medical advice. Ask your doctor how often you should measure.")}</li>
        </ul>
        <div className="tr-list">
          {permission === "default" ? (
            <div className="lz-buttons">
              <button className="btn btn-secondary" type="button" onClick={() => void Notification.requestPermission().then(setPermission)}>
                {t("Allow browser notifications")}
              </button>
            </div>
          ) : null}
          {permission === "granted" ? (
            <>
              <p className="hint">{t("Browser notifications are allowed for this site. You can turn them off in your browser settings.")}</p>
              <div className="lz-buttons">
                <button className="btn btn-ghost" type="button" onClick={test}>
                  {t("Send a test notification")}
                </button>
              </div>
            </>
          ) : null}
          {permission === "denied" ? <p className="hint">{t("Browser notifications are blocked for this site. Reminders still appear at the top of LifeZoi pages. To allow notifications, change the site settings in your browser.")}</p> : null}
          {permission === "unsupported" ? <p className="hint">{t("This browser does not show notifications from a web page. Reminders will appear at the top of LifeZoi pages instead.")}</p> : null}
          {tested ? (
            <p className="hint" role="status">
              {tested}
            </p>
          ) : null}
        </div>
      </section>

      {TIMED_REMINDER_IDS.map((id) => (
        <ReminderCard key={id} id={id} reminder={reminders[id]} update={(change) => update(id, change)} day={formats.day} longDay={formats.longDay} />
      ))}

      <section className="card stack">
        <h2>{t("Summary")}</h2>
        <p role="status">
          {next
            ? t("Next reminder: {what}, {when}.", { what: t(REMINDER_INFO[next.id].title), when: formats.when(next.at) })
            : t("No reminders are on.")}
        </p>
        {anyOn ? (
          <div className="lz-buttons">
            <button className="btn btn-ghost" type="button" onClick={() => clearTimedReminders(userId)}>
              {t("Turn off all reminders")}
            </button>
          </div>
        ) : null}
        <p className="hint">
          <Link href="/my-health/diary">{t("Open the health diary")}</Link> · <Link href="/my-health">{t("Back to My Health")}</Link>
        </p>
      </section>
    </div>
  );
}

function ReminderCard({
  id,
  reminder,
  update,
  day,
  longDay,
}: {
  id: TimedReminderId;
  reminder: TimedReminder;
  update: (change: (current: TimedReminder) => TimedReminder) => void;
  day: (day: number) => string;
  longDay: (day: number) => string;
}) {
  const { t } = useLocale();
  const info = REMINDER_INFO[id];
  const [draft, setDraft] = useState("");
  const titleId = `tr-title-${id}`;
  const canAdd = reminder.times.length < MAX_TIMES;

  const addTime = () => {
    if (!/^\d{2}:\d{2}$/.test(draft)) return;
    update((current) => ({ ...current, times: [...current.times, draft] }));
    setDraft("");
  };

  return (
    <section className="card stack tr-card" aria-labelledby={titleId}>
      <h2 id={titleId}>{t(info.title)}</h2>
      <p className="hint">{t(DESCRIPTIONS[id])}</p>
      <label className="check-row">
        <input
          type="checkbox"
          checked={reminder.on}
          disabled={reminder.times.length === 0 || reminder.days.length === 0}
          onChange={(event) => {
            const on = event.target.checked;
            update((current) => ({ ...current, on }));
          }}
        />
        <span>{t("Remind me")}</span>
      </label>

      <fieldset className="field">
        <legend>{t("Times of day")}</legend>
        {reminder.times.length === 0 ? <p className="hint">{t("Add at least one time to turn this reminder on.")}</p> : null}
        <ul className="tr-times">
          {reminder.times.map((time) => (
            <li key={time}>
              <span className="tr-time">{time}</span>
              <button
                className="btn btn-ghost tr-remove"
                type="button"
                aria-label={t("Remove {time}", { time })}
                onClick={() => update((current) => ({ ...current, times: current.times.filter((item) => item !== time) }))}
              >
                {t("Remove")}
              </button>
            </li>
          ))}
        </ul>
        {canAdd ? (
          <div className="tr-add">
            <label htmlFor={`tr-new-${id}`}>{t("Add a time")}</label>
            <input id={`tr-new-${id}`} type="time" value={draft} onChange={(event) => setDraft(event.target.value)} />
            <button className="btn btn-secondary" type="button" disabled={!draft} onClick={addTime}>
              {t("Add")}
            </button>
          </div>
        ) : (
          <p className="hint">{t("Up to {count} times a day.", { count: MAX_TIMES })}</p>
        )}
      </fieldset>

      <fieldset className="field">
        <legend>{t("Days")}</legend>
        <div className="lz-tabs">
          {WEEK.map((value) => {
            const on = reminder.days.includes(value);
            return (
              <button
                key={value}
                type="button"
                className="lz-tab"
                aria-pressed={on}
                aria-label={longDay(value)}
                onClick={() => update((current) => ({ ...current, days: on ? current.days.filter((item) => item !== value) : [...current.days, value] }))}
              >
                {day(value)}
              </button>
            );
          })}
        </div>
        <div className="lz-buttons">
          <button className="btn btn-ghost" type="button" onClick={() => update((current) => ({ ...current, days: [...ALL_DAYS] }))}>
            {t("Every day")}
          </button>
        </div>
      </fieldset>
    </section>
  );
}
