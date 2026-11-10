# lifeZoi

lifeZoi is a calm web app for reflecting on everyday habits, exploring a WHAT IF? change, and keeping a simple progress record. It is educational. It does not diagnose illness, recommend medication changes, or predict how long someone will live.

The product name in the interface is **lifeZoi**. WHAT IF? is a feature inside it.

## Accounts and this browser

Email and password sign-in uses Supabase Auth when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set. The browser uses that public anon key and the signed-in session. It does not use the service role key.

- After sign-in, assessment answers, WHAT IF? scenarios, habit goals, check-ins, the in-progress assessment, and the reassessment choice are stored in that person’s rows. Row level security requires `auth.uid()` to match `user_id`.
- An authenticator app can be enrolled with a QR code or secret and a 6-digit code. Later sign-ins ask for a new code before those rows open. This is Supabase Auth’s built-in TOTP support.
- Email confirmation stays at the project’s existing setting.
- Without an account, or when those variables are missing, answers stay in this browser tab (`sessionStorage`). Closing the tab clears that copy.
- That tab storage is not encrypted by lifeZoi and is not a secure health record.
- Sample data is labeled “Sample visitor” and is not written into an account.
- Suggestion and WHAT IF? requests go to this app’s own server for validation, then are discarded. They are not sent to an AI service.
- The Wellness Assistant at `/ai-assistant` keeps 50 prepared questions and answers in the app. Ask in your own words calls this app’s server. If `GEMINI_API_KEY` is set, the server sends that session’s questions to Google’s free-tier Gemini model `gemini-3.5-flash-lite` and does not send lab results, diagnoses, or account records. If the key is missing or the free tier cannot answer, the prepared answer is shown. Listening uses the browser’s speech synthesis and does not send answer text to a speech service. Ask by voice is optional and uses the browser’s speech recognition. LifeZoi does not receive that audio. `AI_PROVIDER=mock` is the only enabled mode on the separate development endpoint `POST /api/ai-assistant`. A different provider name there is refused. No payment service is contacted.
- Community posts and comments at `/community` are checked before they are public. When `OPENAI_API_KEY` is set, the server calls the free OpenAI Moderations endpoint only (`POST /v1/moderations`, model `omni-moderation-latest`). That key is never a `NEXT_PUBLIC_` variable. The community does not call chat completions and does not enable billing. Without the key, messages stay in review. Members see a chosen name only. Submitted message text may be processed by that moderation provider. Do not post identifying information, health records, or questionnaire answers. Rejected messages, removed messages, and closed reports are kept for 30 days, then deleted.
- Lab education can ask MedlinePlus Connect for a verified LOINC code only. Responses are cached for 12 hours. Personal results and documents are not sent. Real document upload is described in `docs/claude-migration/DOCUMENT_PROCESSING_PLAN.md` and is not active.
- The daily companion (My Day, My Life Improvement Plan, the Wellness Library, Today's meals, music, books, brain games, and the weekly check-in) keeps its data in this browser (`localStorage`, one copy per account or guest). When signed in and the `companion_state` table exists, it is also saved to that account. Without the table it stays on the device, and the page says so.
- Your Life Matters reflections, Change Lab notes, the assistant conversation, and wellness notes stay in this browser tab. Your Life Matters notes are personal reflections about purpose and kindness. They are not a medical score, and positive karma is presented as a philosophical metaphor.

`GET /api/status` reports `authentication: "supabase"` and `persistence: "account"` only when the account adapter is active and the public Supabase URL and anon key are set. Otherwise it reports `persistence: "development"` and `authentication: "not-configured"`.

## Local setup

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` and set the public Supabase URL and anon key to use accounts locally. Do not commit real secrets. Do not put the service role key in `.env` as a `NEXT_PUBLIC_` variable.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local app |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate Next.js route types, then `tsc --noEmit` |
| `npm test` | Unit tests (questionnaire, WHAT IF?, recommendations, access rules) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

## What’s in the app

- Landing page, dashboard, profile, lifestyle assessment, WHAT IF?, progress, settings, and privacy.
- Desktop navigation and a compact mobile bar.
- A multi-step assessment with Back, Continue, skip for tobacco and alcohol, review, and validation.
- WHAT IF? illustrations for walking, sleep, smoking, eating, stress, alcohol, and social connection, plus a custom note that does not invent evidence.
- Monthly check-ins, goals, and a chart only after two or more check-ins for a habit in that month.
- Rule-based suggestions with links to the public sources they rely on. No AI provider is configured.
- A daily companion: My Day (a new schedule each day, customizable, with Start, Play, Completed, Partially completed, Skip, and Replace), My Life Improvement Plan (nine areas, daily, weekly, or anytime guidance, and personal goals in your own words), and a weekly check-in with next-week suggestions to accept, change, or reject, plus weekly, monthly, and 90-day reports.
- The Wellness Library at `/academy/move/library`: 14 activity types, 10 to 60 minutes, matched to level, experience, mobility, and limits. Age alone never raises the level. Videos use the official YouTube player only, and sources start as pending until an administrator approves them in a reviewed change. `npm run check:library` checks videos through YouTube oEmbed when a person runs it.
- Today's meals and My food choices under Food & Wellness. Every ingredient, including sauces and swaps, is checked against allergies, requirements, and exclusions. LifeZoi never says a recipe is safe for an allergy.
- My Music (`/library/music`): one site-wide player with six categories (Classical, Meditation & Peace, Yoga & Wellness, Nature Sounds, Happy & Positive, Sleep & Calm), previous/next, progress, volume, and a Music ON/OFF switch. It plays softly under exercise videos, guided breathing, and spoken instructions at a separate session volume. Pieces are synthesized in the browser (original or public-domain melodies); verified Pixabay recordings can be added by following `public/audio/library/CREDITS.md`. Also short original books with reading and device read-aloud, and brain games (Sudoku, memory, words, attention, logic) that are never presented as a test.

## Languages

The header has a 🌐 LANGUAGE button with English (default), Українська, Русский, and Ελληνικά. Switching re-renders in place: no reload, no navigation, and the assessment draft and progress are untouched. The choice is saved in this browser under `lifezoi.locale.v1` (a language code only). A first visit follows the browser's language list when it names one of the four, otherwise English. Settings has the same choice.

Translations are typed TypeScript files in `src/lib/i18n/messages/` (`en.ts` is the source). No library, service, or API is used, so there is no cost. `src/lib/i18n/i18n.test.ts` fails if any key, placeholder, or answer option is missing in any language. To translate a new page, add keys to `en.ts`, then to `uk.ts`, `ru.ts`, and `el.ts` (the typecheck will list what is missing), and read them with `useMessages()`.

Server validation stays in English; `translateError` maps those known messages on the client. Headings in Cyrillic and Greek use Noto Serif Display because Fraunces has no such letters.

What is translated so far: header, menus, footer, notices, homepage, sign-in and password pages, invitation welcome, the full lifestyle assessment (questions, answers, review, validation), dashboard, and settings. Other sections still show English and are listed in the pull request that added this. The health wording in Ukrainian, Russian, and Greek needs a native-speaker review before launch.

## Sources

Factual health statements are tied to pages that were reachable while this app was written, including WHO, NHLBI, NIMH, NIAAA, Nutrition.gov, the Dietary Guidelines for Americans, Smokefree.gov, ODPHP’s Physical Activity Guidelines page, and SAMHSA’s 988 page. The app does not calculate a lifespan or a date of death.

## Supabase

The live project already has `profiles`, `assessments`, `scenarios`, `habit_goals`, and `check_ins`. The `companion_state` table for the daily companion is new and has not been applied: run `supabase/migrations/2026-11-09-companion-state.sql` (or the whole `schema.sql`) in the SQL editor when you are ready. `supabase/schema.sql` matches those tables and adds the profile role, the in-progress session fields, authenticator-aware policies, and account deletion.

1. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the host’s environment. Do not ship the service role key to the browser, and do not use it to read user rows.
2. Sign-up and sign-in use email and password. The admin account is `tatyanaserikovaru@gmail.com`. The database trigger sets `profiles.role` from that email. The client cannot grant admin. `GET /api/account` checks the same allowlist from the verified session.
3. Authenticator enrollment is in Settings. Confirm a 6-digit code. Later sign-ins require that code before saved rows open.
4. Account deletion calls `delete_own_account()`, which removes that person’s rows and login.
5. `decideAccess` in `src/lib/access.ts` runs before an account write. Hiding a button is not authorization; row level security still applies.
6. New accounts are closed. Only the allowlisted email can sign in: turn off **Allow new users to sign up** in Supabase, and the `auth_users_allowlist` trigger in `schema.sql` refuses any other email in the database. The one account is created in the Supabase dashboard (see the setup guide). The app has a **Sign in** page and no sign-up button.
7. Password recovery: **Forgot password?** on the Sign in page emails a link to `/reset-password`, where the person sets a new password. Signed-in people can use **Change password** under Account. Add `/reset-password` on each site to Supabase's redirect URLs, and set a custom SMTP sender before real people sign up.

Step-by-step dashboard setup, including the read-only check `supabase/verify.sql`, is in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md). `scripts/test-schema.sh` applies `supabase/schema.sql` twice to a throwaway local Postgres and checks the row level security rules. It never contacts Supabase.

## Deploy

The intended Vercel team is Right Intent LLC, slug `risi-0778846f`, team id `team_FthCxfnSPZ3JpaY3feKlqmIc`.

No environment variables are required to run the tab-only mode. Accounts need the public Supabase URL and anon key. Production should be served over HTTPS. Vercel provides that. Security headers set by the app are `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, and `Permissions-Policy`. Every response also sends `X-Robots-Tag: noindex, nofollow`, and the root layout sets the same robots metadata. Leave both in place until a production privacy notice matches the real system. They ask search engines not to index the site. A `robots.txt` disallow rule is not a substitute.

Do not deploy with a claim of HIPAA, GDPR, or other compliance.

## Known limitations

- Search indexing is off until a reviewed privacy notice matches the real system. Do not remove the `noindex` metadata or `X-Robots-Tag` header before that review.
- Accounts store the signed-in session described above. There is no HIPAA, GDPR, or other compliance claim.
- Data without an account is tab-local and easy to lose. Tab storage and account storage are not encrypted by lifeZoi beyond what the host and Supabase provide.
- Suggestions on the main flows are rules, not a clinician and not an AI model.
- The wellness assistant uses prepared answers unless `GEMINI_API_KEY` is set on the server. That key calls only the free-tier Gemini model named in `.env.example`. It is not a clinician.
- Quantitative personal risk, “years gained,” and dates of death are intentionally absent.
- The GitHub token used in this environment could not change the repository from public to private.
- Row level security is in `supabase/schema.sql` and is enabled on the account tables.
