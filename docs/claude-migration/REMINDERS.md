# My reminders: timed reminders for measurements and daily habits

Owner request, 2026-11-25: reminders to measure blood pressure and blood sugar, and for daily habits, at times the person chooses, free and privacy-friendly.

## Where it is

`/my-health/reminders` ("My reminders"), in the My Health section after the Health diary (menu, My Health hub card, footer), and linked from the diary's Reminders card. Code: `src/lib/reminders/schedule.ts` (rules, tested in `schedule.test.ts`), `src/components/reminders/` (store, settings page, banner). The banner is mounted once in `AppShell`, next to the sitting-break reminder.

## What it does

- Four reminders, all off by default: Measure blood pressure and Check blood sugar (open the health diary), LifeZoi Daily check-in (`/daily`), and Today's habits plan (`/my-day`).
- Each has an on/off switch, up to four times of day, and days of the week. "Turn off all reminders" clears them.
- At a chosen time, a banner appears at the top of any open LifeZoi page with: open the page, Done, Remind me in 15 minutes, Change reminders. Only the latest passed time today is shown; yesterday's are not, and times before the reminder was turned on or changed are not.
- Optional browser notification (Web Notifications API) when LifeZoi is open in a background tab, after the person allows it; a test button is on the page. Where the browser refuses page notifications (some phone browsers), the banner still shows.
- Reminder text names the activity only ("Time to measure your blood pressure."). No medical advice; the page says to ask a doctor how often to measure.

## Storage and privacy

- localStorage only, per account: `lifezoi.timed-reminders.v1:<user id>` and today's done/snoozed list `lifezoi.timed-reminders.log.v1:<user id>`. A preference, not health data. Nothing is sent to a server. No database table and no migration.
- No push service, service worker, e-mail, or text messages; there is no e-mail provider in the app besides Supabase's sign-in e-mails. So a reminder cannot arrive while no LifeZoi tab is open, and the page says so.
- The existing per-kind due reminders in the diary (daily, weekly, monthly, every 3 months) are unchanged.

## Not checked

- Not clicked through while signed in: the members' pages need a real sign-in, and no local sign-in bypass was used. Check `/my-health/reminders` on the Vercel preview after sign-in, including a notification in a background tab.
- Russian, Ukrainian, and Greek text needs a read by a native speaker.
