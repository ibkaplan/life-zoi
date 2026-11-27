# 7-day email challenge

Owner request, 2026-11-25: "7-day challenge with emails. A person leaves an email and gets a short task each day."

## What it is

- Public page `/free/challenge` (no sign-in, same as the other free tools). It shows all seven tasks, so anyone can follow along on the page without email.
- Sign-up form: an email address (a signed-in member's account address is used instead), an unticked consent box, a hidden honeypot field, and a plain privacy note. The browser's language and time zone are sent with it.
- A visitor's address is **pending** until they press the button on `/free/challenge/confirm?token=…` from the one confirmation email. A member's account address is already verified, so it starts **active**.
- One email a day, in the person's language, in order: day 1 on the first run after joining, then one per local calendar day. A missed run never skips a day and never sends two on one day.
- Every email has a stop link (`/free/challenge/stop?token=…`) and `List-Unsubscribe` + `List-Unsubscribe-Post` headers for the mail app's own one-click button (`POST /api/challenge/unsubscribe`). The pages only act when the person presses the button, so mail scanners that open links cannot confirm or stop anything.
- A members' card on `/start` (Get started) links to the page. The main menu is unchanged.
- Text: `src/lib/email-challenge/content.ts` holds the seven tasks and the email wording in English, Ukrainian, Russian, and Greek. Page wording is in `src/lib/i18n/catalog/<locale>/email-challenge.json`. The tasks are everyday habits with no health numbers, promises, or medical advice (a test checks for digits in the "why" lines).

## Data and privacy

Table `challenge_signups` (`supabase/migrations/20261127180000_email_challenge.sql`, also in `schema.sql` and `verify.sql`). New table only; nothing existing changes. Row level security is on with no policies and no browser grants: only the server's service role uses it.

Kept: email, language, time zone, consent time and wording version (`CONSENT_VERSION` in `types.ts`), confirm and stop tokens, how many emails were sent and the local date of the last one. No health data, and the address is never sent to an AI service.

Deleted: when the person stops (link or the members' button), right after the seventh email, 14 days after an unconfirmed sign-up (on a live run), and with the account (`on delete cascade`) for a member.

The form answers the same whether or not an address already signed up, so it cannot be used to find out who joined. One network address gets at most five sign-ups an hour per server instance.

## Sending: off until the owner switches it on

Nothing is sent today. `src/lib/email-challenge/mailer.ts` is the only code that could send, and it returns "dry-run" unless the server has all three of:

| Variable | Value |
| --- | --- |
| `EMAIL_PROVIDER` | `resend` |
| `RESEND_API_KEY` | A Resend API key with "Sending access" only (server only, never `NEXT_PUBLIC_`) |
| `EMAIL_FROM` | e.g. `LifeZoi <challenge@lifezoi.com>` on a domain verified in Resend |

The sending run is `GET /api/challenge/send` with `Authorization: Bearer <CRON_SECRET>`. Without `CRON_SECRET` (16+ characters) it is refused. With the provider off it only reports counts and changes nothing. Its answer holds counts, never addresses. No schedule is set up in this repository.

To switch it on (owner's decision, not done by Claude):

1. Merge the PR so the migration runs, and check the verify result in the Database migrations Action.
2. In Resend (the owner already uses it as Supabase's SMTP sender), confirm the plan and its daily limit fit the expected number of people, and create a sending-only key.
3. In Vercel Production, add `EMAIL_PROVIDER`, `RESEND_API_KEY`, `EMAIL_FROM`, and `CRON_SECRET`.
4. Add a daily schedule, for example a `vercel.json` cron for `/api/challenge/send` (Vercel sends the `CRON_SECRET` header itself). Until then, the run can be started by hand with curl and the secret.

## Not done

- No HTML email design: the emails are plain text.
- No resend of a lost confirmation email (one per address, on purpose, to limit abuse). The person can stop and sign up again after 14 days, or sign in as a member.
- The "Daily tip by email or Telegram" thread is building a shared `src/lib/messaging/` adapter with the same shape. When both are merged, this mailer can move onto it.
