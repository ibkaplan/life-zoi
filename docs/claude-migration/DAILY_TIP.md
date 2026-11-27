# Daily tip by email or Telegram

Members can ask for one short, general wellness tip a day at `/daily/tip` (menu: Dashboard, "Daily tip by email or Telegram", and the footer). The page is members-only, like the rest of LifeZoi.

## What is built

- **Tip bank**: 35 tips in `src/lib/daily-tip/tips.ts` across movement, sleep, food, water, mind, people and outdoors, in EN, RU, UK and EL (`src/lib/i18n/catalog/*/daily-tip.json`). Tips are qualitative: no percentages, risk figures or lifespan claims (a test checks). Everyone gets the same tip on the same local date. It is never based on the member's answers or health records.
- **Choices**: email and/or Telegram, the tip language, a local hour from 06:00 to 21:00, and the device's time zone. "Stop daily tips" deletes the row.
- **Email address**: no address is stored for tips. The send reads the account's own sign-in address with the service role, so a member cannot point tips at someone else.
- **Telegram linking without a webhook**: the member makes a private link (`t.me/<bot>?start=<code>`, valid 30 minutes), presses Start in Telegram, then "I pressed Start". The server reads the bot's recent messages (`getUpdates`) for `/start <code>` from a private chat and stores only that chat id. No new public address is needed.
- **Adapter**: `src/lib/messaging/` (`OutboundMessage`, `Sender`, Resend email, Telegram, dry run). The 7-day email challenge uses the same environment variable names and can switch to it.
- **Daily send**: `runDailySend` in `src/lib/daily-tip/sender.ts` sends each due member one tip once their local hour is reached, at most once per local day (`last_sent_on`). `POST /api/admin/daily-tip` (administrator only) runs one pass now and returns counts.
- **Storage**: `daily_tip_subscriptions` (`supabase/migrations/20261127180100_daily_tip_subscriptions.sql`, additive only). Owner-only row level security, deleted with the account (cascade). Also added to `schema.sql`, `verify.sql` and `supabase/test/policies.sql`.

## Off by default

Nothing is sent by this code as merged. Every sender is a dry run unless all of these are set on the server (never as `NEXT_PUBLIC_`):

| Variable | Needed for |
| --- | --- |
| `DAILY_TIP_SENDING=on` | Master switch. Without it every send is a dry run. |
| `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `EMAIL_FROM` | Email through Resend (has a free tier; needs a verified sending domain). |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` | Telegram (free; a bot created by a person with @BotFather). |
| `SUPABASE_SERVICE_ROLE_KEY` | The daily send reads every active row and the sign-in address. Already used by feedback and invitations. |

## Not done yet (needs the owner)

1. **A schedule.** Nothing calls the send automatically yet. Options: Vercel Cron or a GitHub Actions schedule calling a secret-protected endpoint once an hour. That adds a public, secret-checked API path and needs approval.
2. **One-click unsubscribe without signing in.** Emails link to `/daily/tip`, which needs a sign-in. Before real email goes out, add a signed public unsubscribe link (the 7-day challenge work is building one at `/challenge/unsubscribe` that could be shared).
3. **Accounts and keys**: creating the Telegram bot, the Resend account and domain, and putting the keys in Vercel. Claude did not create any of them.
4. Privacy notice wording for tip emails and Telegram.
5. Not clicked through in a browser: members' pages need a real Supabase sign-in, which the build machine does not have. The logic is covered by unit tests, and the database rules by `scripts/test-schema.sh` (run locally on Postgres 16, all checks passed).
