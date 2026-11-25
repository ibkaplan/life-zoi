"use client";

import "./reminders.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/locale-provider";
import { useAccount } from "@/lib/account-store";
import { dueSlots, markHandled, REMINDER_INFO, snooze, SNOOZE_MINUTES } from "@/lib/reminders/schedule";
import { saveReminderLog, useReminderLog, useTimedReminders } from "./reminder-store";

/**
 * Shows a timed reminder when it is due. Mounted once in the app shell. While the
 * tab is in the background it also shows a browser notification, if the person
 * allowed them. Nothing is sent anywhere; it works only while LifeZoi is open.
 */
export function TimedReminderBanner() {
  const account = useAccount();
  const userId = account.phase === "ready" ? account.userId : null;
  const reminders = useTimedReminders(userId);
  const log = useReminderLog(userId);
  const [now, setNow] = useState(0);
  const notified = useRef(new Set<string>());
  const t = useT();
  const anyOn = Object.values(reminders).some((item) => item.on);

  useEffect(() => {
    if (!userId || !anyOn) return;
    const tick = () => setNow(Date.now());
    const id = window.setInterval(tick, 20_000);
    const first = window.setTimeout(tick, 0);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [userId, anyOn]);

  const due = userId && now > 0 ? dueSlots(reminders, log, new Date(now)) : [];
  const dueKeys = due.map((slot) => slot.key).join(",");

  useEffect(() => {
    if (!dueKeys || typeof Notification === "undefined" || Notification.permission !== "granted" || !document.hidden) return;
    for (const key of dueKeys.split(",")) {
      if (notified.current.has(key)) continue;
      notified.current.add(key);
      const id = key.split("|")[0] as keyof typeof REMINDER_INFO;
      try {
        const note = new Notification("LifeZoi", { body: t(REMINDER_INFO[id].prompt), tag: `lifezoi-reminder-${id}` });
        note.onclick = () => {
          window.focus();
          note.close();
        };
      } catch {
        // Some phone browsers allow notifications only from a service worker. The banner still shows.
      }
    }
  }, [dueKeys, t]);

  if (!userId || due.length === 0) return null;
  return (
    <div className="stack tr-banners">
      {due.map((slot) => {
        const info = REMINDER_INFO[slot.id];
        const done = () => saveReminderLog(userId, (current) => markHandled(current, slot.key));
        return (
          <aside key={slot.key} className="mb-reminder tr-banner" role="status" aria-labelledby={`tr-${slot.key}`}>
            <p id={`tr-${slot.key}`} className="mb-reminder-title">
              {t(info.prompt)}
            </p>
            <p className="hint">{t("Reminder set for {time}.", { time: slot.time })}</p>
            <div className="lz-buttons">
              <Link className="btn btn-gold" href={info.href} onClick={done}>
                {t(info.action)}
              </Link>
              <button className="btn btn-secondary" type="button" onClick={done}>
                {t("Done")}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => saveReminderLog(userId, (current) => snooze(current, slot.key))}>
                {t("Remind me in {minutes} minutes", { minutes: SNOOZE_MINUTES })}
              </button>
              <Link className="btn btn-ghost" href="/my-health/reminders">
                {t("Change reminders")}
              </Link>
            </div>
          </aside>
        );
      })}
    </div>
  );
}
