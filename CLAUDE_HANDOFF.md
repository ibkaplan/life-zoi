# lifeZoi handoff for Claude

Inspection date: 2026-11-09. Repository: https://github.com/ibkaplan/life-zoi. This file describes the tree as it is. It does not redesign the app.

**Start at `main` commit `22bc90c82ab8ce196cec0cf5b1f46614a31c45ff`.** That commit was `origin/main` and `HEAD` after `git pull origin main` on 2026-11-09. Subject: `Merge pull request #19 from ibkaplan/cursor/community-moderation`. Pull request #18 merged earlier as `c49beaad5649af5bf4cb01a65b256c5527a7cd4d`. Pull request #19 merged after `main` was merged into that branch, resolving conflicts in `.env.example`, `README.md`, the privacy page, `src/app/globals.css`, and `src/components/app-shell.tsx`. The launch-readiness merge remains `9872803fdfe6268b5f96544512e1c574b94b90a0`. This handoff file is the documentation commit on top of `22bc90c`.

Product status: **READY FOR INTERNAL TESTING**. This is not a public launch.

## Ready for Claude

Yes. Claude can clone `main` and work from that commit. The application tree was clean, matched `origin/main`, and had no unpushed commits at inspection. Committed instructions already exist: root `CLAUDE.md` and `docs/claude-migration/`.

What a fresh clone will not have, and what is behind the code:

- This handoff is committed on `main`. A copy of the same file is at `/cursor/stores/self/docs/claude-handoff.md` in the Cursor project store. The first version landed in `9a88ce89c74f0c0dad65ffb313473fe860c77bf0`. This revision updates it after pull requests #18 and #19 merged.
- `docs/claude-migration/ACTIVE_WORK.md` and `INDEX.md` are still a 2026-11-05 snapshot. `ACTIVE_WORK.md` records `main` at `a857fce` and, at that date, no open pull requests. `INDEX.md` records the snapshot as `1d6a333`. Both are older than `22bc90c`. `ENVIRONMENT_SETUP.md` gained a `GEMINI_API_KEY` row in the #18 merge and still says not to add `OPENAI_API_KEY` and that the service-role name is absent from `.env.example`. Those two sentences are behind #19.
- The “Current priority” paragraph in `CLAUDE.md` still says LZ-3 is unanswered. That decision was already made: `main` is canonical, and pull request #1 stays closed. The index agrees. Trust this handoff and `docs/claude-migration/INDEX.md` over that one paragraph. The architecture paragraph in `CLAUDE.md` now mentions the Gemini wellness route.
- `ACTIVE_WORK.md` and `INDEX.md` do not describe the 2026-11-06 product: My Day, the food plan, Emotional Wellness, Share the Care, the Brain & Habit Quiz, Movement Studio, Habit Transformation, the prepared wellness assistant, the free exercise library, or Community.
- `package.json` has no `engines` field and there is no `.nvmrc`. Use Node.js 22 anyway.
- There is no GitHub Actions workflow. Vercel is the only automated check, and it does not run `npm test`.
- No secret values are in git. `GEMINI_API_KEY`, `OPENAI_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are unset in this environment, and the public Supabase names are unset here too. Account testing needs the public Supabase names set on the host by a person. This inspection did not call Supabase. `npm test` was re-run; typecheck, lint, and build were not.

## Git status at inspection

Checked after `git pull origin main` on 2026-11-09. The working tree was clean. No pull requests were open. This revision changes only `CLAUDE_HANDOFF.md`.

| Item | Value |
| --- | --- |
| Branch | `main` |
| Upstream | `origin/main`, up to date before this documentation commit |
| Ahead / behind | 0 / 0 before this documentation commit |
| Unpushed commits | none before this documentation commit |
| Dirty files before this revision | none |
| App commit on `main` | `22bc90c82ab8ce196cec0cf5b1f46614a31c45ff` |
| Open pull requests | none |
| Remote | `https://github.com/ibkaplan/life-zoi` |

## Which branch to use

Use **`main`**. New work branches from `22bc90c82ab8ce196cec0cf5b1f46614a31c45ff`, or from the documentation commit directly on top of it. No pull requests are open.

Merged into `main`:

| PR | Merge commit | What landed |
| --- | --- | --- |
| https://github.com/ibkaplan/life-zoi/pull/18 | `c49beaad5649af5bf4cb01a65b256c5527a7cd4d` | Free Gemini reply on the wellness assistant. Inactive until `GEMINI_API_KEY` is set. |
| https://github.com/ibkaplan/life-zoi/pull/19 | `22bc90c82ab8ce196cec0cf5b1f46614a31c45ff` | Community moderation. Merged after `main` was merged into the branch. Inactive or in-memory until the key and SQL are applied. |
| https://github.com/ibkaplan/life-zoi/pull/24 | `9872803fdfe6268b5f96544512e1c574b94b90a0` | Launch-readiness journey. #22 and #23 are on `main` because #24 included them. |

Closed and not merged: pull request #1 (`cursor/lifezoi-app-ce49`). Do not reopen or merge it. Pull requests #4, #5, #6, and #7 were closed after their work landed through later integration.

## Project overview

lifeZoi is a responsive educational wellness web app. The product name is **lifeZoi**. WHAT IF? is a feature inside it, not the product name.

People use it to reflect on everyday habits, compare a lifestyle change with public guidance, and keep a simple progress record. It is educational wellness only. It does not diagnose, recommend medication changes, or predict lifespan. It does not show a personal “years gained” figure or a date of death. The Life outlook page may show a copied Social Security population figure only with the existing “not an individual prediction” label.

The owner on the GitHub repo is Igor Kaplansky (`ibkaplan`). The recorded homepage is https://life-zoi.vercel.app. The repository is public. Search indexing stays off.

Source for the internal-testing status: the launch report at `/cursor/stores/self/docs/launch-readiness.md` (pull request #24). That report’s checks were not repeated for this handoff.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16.4.3 App Router, React 19.3.0, TypeScript 5 |
| Style | Tailwind CSS 4, loaded through `@tailwindcss/turbopack` in `next.config.ts` |
| Tests | Vitest 5 (`vitest.config.ts`) |
| Lint | ESLint 9 with `eslint-config-next` 16.4.3 |
| Accounts | `@supabase/supabase-js` 2.x, anon key, row level security |
| Fonts | `next/font/google`: Fraunces and Source Sans 3 |
| Package manager | npm. Lockfile: `package-lock.json` |
| Runtime | Node.js 22. The inspection host had Node v22.23.4 and npm 10.9.9 |
| Host | Vercel. No `vercel.json`. No `.github/workflows` |

`SESSION_ADAPTER` in `src/lib/session-adapter.ts` is `"supabase"`.

`next.config.ts` sets `cacheComponents`, `partialPrefetching`, and `poweredByHeader: false`. Every response gets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, a locked-down `Permissions-Policy` (camera, microphone, and geolocation denied), and `X-Robots-Tag: noindex, nofollow`. The root layout sets the same robots metadata (`index: false`, `follow: false`).

## Directory structure

```
/agent/repos/life-zoi
  AGENTS.md                 Next.js generated notice only
  CLAUDE.md                 committed Claude rules; one paragraph is stale (see above)
  CLAUDE_HANDOFF.md         this file; committed on main
  README.md                 setup, accounts, deploy, limitations
  .env.example              names only; no real values
  next.config.ts
  package.json
  docs/claude-migration/    2026-11-05 migration docs (behind main)
  public/                   page images, nutrition photos, library PDFs
  scripts/write-library-pdfs.mts
  supabase/schema.sql       account schema; the app does not execute this file
  src/app/                  pages, layout, and route handlers
  src/app/api/              same-origin JSON routes
  src/app/(app)/            signed-in-style app pages
  src/components/           shell, assessment, feature views
  src/lib/                  validation, accounts, wellness modules, tests
```

Primary navigation in `src/components/app-shell.tsx` includes Home (`/dashboard`), My Day, Your Life Matters, Life outlook, WHAT IF?, Nutrition, Food & wellness, Movement, Health Library, Nature, Habit Transformation, Progress, Profile, and a More menu (assessment, improvement plan, wellness coach, academy, daily choices, urges, challenges, Wellness Assistant, Community, Emotional Wellness, Share the Care, Settings, Change Lab, lab education, Sugar Detective, food labels, balance challenge, Brain & Habit Quiz).

There is no `/signup` route. Registration is **Create account** on `/settings`.

## How the frontend and backend communicate

There is one Next.js app. There is no separate API server. Account writes use the browser anon key. Community shared storage can use a server-only service role when `SUPABASE_SERVICE_ROLE_KEY` is set. That key is not sent to the browser and is not used to read assessment or health rows. It is unset, so community rows stay in the server process.

**Browser to Supabase.** `src/lib/supabase-browser.ts` builds a browser client only when `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are a real public https config. Those two names are read as direct `process.env` properties so Next can inline them. Passing `process.env` through an argument stays empty in the client bundle. The client uses the anon key, PKCE, and the signed-in session. Row level security requires `auth.uid()` to match `user_id`. A verified authenticator factor also requires an AAL2 session (`auth_session_may_use_rows` in `supabase/schema.sql`). Writes go through `src/lib/account-store.ts` into `profiles`, `assessments`, `scenarios`, `habit_goals`, and `check_ins`. `decideAccess` in `src/lib/access.ts` runs before an account write. Hiding a button is not authorization.

**Same-origin route handlers.** Pages call these with `fetch`:

| Route | Role |
| --- | --- |
| `GET /api/status` | Reports `authentication` and `persistence`. `supabase` / `account` only when the adapter is supabase and both public values pass `isPublicSupabaseConfig`. Otherwise `not-configured` / `development`. |
| `GET /api/account` | Reads the `Authorization` header and returns whether that verified session is the allowlisted admin. It does not use a service-role key. |
| `GET` and `POST /api/ai-assistant` | Development mock. `AI_PROVIDER` other than `mock` is refused and makes no network call. |
| `GET` and `POST /api/ai-assistant/wellness` | Prepared answers. Calls Gemini `gemini-3.5-flash-lite` only when server-only `GEMINI_API_KEY` is set. Without the key, or when the free tier cannot answer, the prepared library is the reply. The key is unset. |
| `GET` and `POST /api/community` | Community board. A local filter runs first. OpenAI Moderations runs only when server-only `OPENAI_API_KEY` is set. Without that key, a message that passes the local filter stays pending and is not published. |
| `POST /api/what-if` | Validates the scenario on the server, returns an illustration, and discards the body. Not sent to an AI service. |
| `POST /api/recommendations` | Validates the assessment and returns rule-based suggestions. Discarded after the response. Not sent to an AI service. |
| `GET /api/references` | Curated public links. A `loinc` query calls MedlinePlus Connect only for a verified LOINC code. Personal results are not sent. Responses are cached in process memory for 12 hours. |
| `GET` under academy move resources `.../guides/[slug]/pdf` | Serves a generated guide PDF. |

**What stays in the browser.** Without a valid public Supabase config, assessment answers stay in `sessionStorage` for the tab. Sample data is labeled `Sample visitor` and is rejected if a save tries to write it into an account. Change Lab, Your Life Matters, the assistant thread, and wellness notes stay in `sessionStorage` even when an account exists. Emotional Wellness notes stay in `localStorage`, scoped with `src/lib/owned-local.ts`, and are not uploaded. My Day also keeps a browser copy; signed-in completions are included in `profiles.session_state` with the draft, weekly check-ins, weight entries, brain quiz, habit journey, and food plan (`src/lib/account-records.ts`). That JSON is kept under the existing 24000-octet profile check by dropping the oldest My Day records, then shortening notes.

`src/lib/owned-local.ts` splits browser keys into a guest key and a per-user key. A leftover unscoped blob is claimed once by the first empty account, then the shared key is removed. An account that already has data does not absorb someone else’s blob. Signing out clears only that user’s copies.

## Environment variable names

Names only. No values belong in git, in chat, or in this file. `.env*` is gitignored except `.env.example`.

On `main` today:

| Name | Where it is read | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser client and `src/lib/status.ts` | Only for accounts |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client and status | Only for accounts. Public only because row level security is on |
| `AI_PROVIDER` | `src/lib/ai/provider.ts` | No. Anything other than `mock` is refused |
| `AI_MODEL` | Label only. Default in code if unset or invalid: the planned economical model name in `readModelName` | No. Not called |
| `AI_PLAN` | `basic`, `premium`, or `advanced`. Planning limits only | No |
| `AI_PROMPT_CENTS_PER_1K` | Planning estimate, not a bill | No |
| `AI_COMPLETION_CENTS_PER_1K` | Planning estimate, not a bill | No |
| `NODE_ENV` | `isProductionSite` for Share the Care link origin | Set by the runtime |
| `VERCEL_ENV` | Same production-site check. `preview` and `development` are not the published origin | Set by Vercel |
| `GEMINI_API_KEY` | Server-only. `POST /api/ai-assistant/wellness` calls `gemini-3.5-flash-lite` `generateContent` on the free tier, with no grounding or other paid tools. Empty keeps the 50 prepared answers | No. Unset. Must never be `NEXT_PUBLIC_` |
| `OPENAI_API_KEY` | Server-only. `POST https://api.openai.com/v1/moderations` with model `omni-moderation-latest`. Does not call chat completions | No. Unset. Must never be `NEXT_PUBLIC_` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional. Server-only shared community storage. Not used to read assessment or health rows. Commented in `.env.example` | No. Unset. Must never be `NEXT_PUBLIC_` |

Do not put any service-role key, `GEMINI_API_KEY`, or `OPENAI_API_KEY` in the browser or in a `NEXT_PUBLIC_` name. All three are unset here, and the example file has no secret values. Without them, the Gemini reply stays on the prepared library, community messages that pass the local filter stay pending, and community storage stays in the server process.

## Database and integrations

**Supabase Auth and Postgres.** Email and password sign-in, optional authenticator (TOTP) enrollment, and `delete_own_account()`. Email confirmation stays at the project’s existing setting. The README says the live project already has `profiles`, `assessments`, `scenarios`, `habit_goals`, and `check_ins`. This inspection did not query that database. `supabase/schema.sql` matches those tables and adds `profiles.role`, `profiles.session_state`, authenticator-aware policies, an admin-role trigger, sample-data rejection, and account deletion. The admin role is set in the database from one allowlisted email. The client cannot grant admin. `GET /api/account` checks the same allowlist. The address is in `supabase/schema.sql` and `README.md`; it is not repeated here.

**`care_invitations` is repository-only.** The table, `revoke_care_invitation`, and `note_care_invitation` are in `supabase/schema.sql` with row security. The app does not run that file. Nothing in the launch work executed it. Until someone applies it in the Supabase SQL editor, Share the Care does not create a link and invitation counts stay unavailable. A row is a random token and counts. It does not store a recipient name, email, or health information.

**Community tables are repository-only too.** `community_profiles`, `community_messages`, `community_reports`, `community_blocks`, and `community_mutes` are in the same `supabase/schema.sql`. Browser roles cannot read them. A server-only service role may write them. That SQL has not been applied, and `SUPABASE_SERVICE_ROLE_KEY` is unset, so community rows stay in process memory and can disappear when the process restarts. They are still checked before they are public. The tables store a chosen name and message text. They do not store an email address or a health record.

**MedlinePlus Connect** (`https://connect.medlineplus.gov/service`) for a verified LOINC code only.

**Not integrated on `main`:** Stripe, transactional email, SMS, document upload, password recovery, GitHub Actions, cron. Document upload is a future plan in `docs/claude-migration/DOCUMENT_PROCESSING_PLAN.md` and is not active. No paid chat model is called. The Gemini and OpenAI calls below are in the code and stay inactive while their keys are unset.

The Wellness Assistant at `/ai-assistant` keeps 50 prepared questions and answers, plus browser speech. Listening uses the browser’s speech synthesis. Optional speech recognition stays in the browser. lifeZoi does not receive that audio. Ask-in-your-own-words calls `POST /api/ai-assistant/wellness`. If `GEMINI_API_KEY` is set, the server sends that session’s questions to Google’s free-tier model `gemini-3.5-flash-lite` and does not send lab results, diagnoses, or account records. The key is unset, so the prepared answer is shown. The separate `POST /api/ai-assistant` mock still refuses any `AI_PROVIDER` other than `mock`.

Community at `/community` checks posts and comments before they are public. A local filter runs on the server. When `OPENAI_API_KEY` is set, the server also calls the OpenAI Moderations endpoint only. The key is unset, so a message the local filter does not reject stays in review and is not published. Members see a chosen name only.

## Deployment

Vercel builds `main` for the team named in `README.md`: Right Intent LLC, slug `risi-0778846f`. The team id is in that same Deploy section. Do not create a second Vercel project.

No environment variables are required for tab-only mode. Accounts need the two public Supabase names on the Vercel project. Production is served over HTTPS by Vercel. `AI_PROVIDER` stays `mock`.

On 2026-11-09, `https://life-zoi.vercel.app/` returned HTTP 200 with `X-Robots-Tag: noindex, nofollow`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a locked-down `Permissions-Policy`. This check did not read a deployment SHA. The launch report says Vercel preview checks on pull request #24 passed (`Vercel` and `Vercel Preview Comments`) and that a production deploy may start from the merge. No SQL was applied and nothing was deployed by hand in that work.

Do not deploy from a Claude session unless a person explicitly asks. Do not claim HIPAA, GDPR, or other compliance.

## Feature status

From the launch report. Status is internal testing, not a public launch.

### Complete

- Register, sign in, sign out, and session persistence in the existing Settings account panel. Not retested against a live project in the launch environment, which had no Supabase keys. Without config, Settings says account sign-in is not configured.
- Onboarding assessment, including updates. Unsigned answers stay in the browser. Account save uses the existing profile path.
- Profile from saved answers only: sleep, food, habit, and emotional context. No invented diagnosis. Journal text is not copied onto the profile.
- My Day from nutrition, movement, brain, habit, emotional wellness, and sleep, when those answers exist. A saved food-plan meal replaces the generic meal cue. Brain marks, sleep hours, habit actions, and emotional notes are used only from what is already saved.
- Mark an activity complete and keep it in that browser. Completions are written into the account session state. A second device was not tested.
- Progress as a count of My Day marks. The page says this is not a health result.
- Each module reads only that user’s data in unit tests for the browser keys. Not tested with two live accounts.
- Emotional Wellness as an educational page. The page still says: “This page has not been reviewed by a licensed clinician. It must not be called clinically validated.”

Also on `main` from earlier merged work, and not re-audited line by line for this handoff: landing page, dashboard, WHAT IF?, nutrition and food plan, Movement and Movement Studio, free exercise resources, health library, nature, habit transformation, brain quiz, weekly check-in, Change Lab, Your Life Matters, outlook, lab education, urges, academy, and the prepared wellness assistant. The launch report’s route list for the production build included `/my-day`, `/emotional-wellness`, `/share-the-care`, and `/welcome`.

### Partial

- Share the Care. The page is in the app. Invitation counts stay unavailable, and no link is created, until `care_invitations` is applied in the Supabase SQL editor. If the table is missing, the page must not pretend a link was created. It says counts could not be loaded, and that it does not store a name, an email, or health information.
- Free Gemini assistant (pull request #18, merged). The route and UI are on `main`. `GEMINI_API_KEY` is unset, so replies stay on the 50 prepared answers. When the key is set, the call is free only while the Google project stays on the free tier, and free-tier prompts may be used to improve Google’s products. That is a privacy gap for wellness text.
- Community moderation (pull request #19, merged). The page, local filter, and moderations client are on `main`. `OPENAI_API_KEY` is unset, so automatic provider checking is not configured and messages stay in review. `SUPABASE_SERVICE_ROLE_KEY` is unset and the community SQL is not applied, so storage falls back to the server process. The moderations call sends member text off site. It does not call chat completions. Current pricing was not re-verified, so zero cost is not confirmed.

### Not implemented

- Password recovery. There is no reset flow. It was not added. A search of `src` found no password-reset API.
- Document upload.
- A live model on the development endpoint. `POST /api/ai-assistant` still refuses any `AI_PROVIDER` other than `mock` and does not call the network. The wellness route can call Gemini only when `GEMINI_API_KEY` is set. That key is unset.
- Paid services of any kind. Budget for research, nutrition data, educational content, exercise libraries, and AI is $0: free public sources only.

### Known bugs and remaining gaps

Fixed on `main` by pull request #24. Do not undo these:

- Brain quiz, habit journey, My Day, emotional notes, the wellness log, and movement studio had used shared browser keys, so an empty account could absorb the previous person’s saved blob. Storage is now split by account.
- My Day completions lived only in the browser. They are now part of `profiles.session_state`. No new table.
- My Day ignored a saved food-plan meal, brain marks, and emotional notes when those answers already existed. It uses them now. Emotional notes add a sentence that they are not a diagnosis and that the page has not been clinically reviewed.
- Share the Care had conflicted with `main` in `src/app/globals.css` and `src/components/app-shell.tsx`. That conflict was resolved in the merge.

Still true:

- Emotional Wellness has not been clinically reviewed. Do not call that page validated. Habit Transformation copy also says it is not clinically validated.
- `care_invitations` is not applied, so Share the Care does not create invitation links. The community tables in the same file are not applied either.
- Password recovery does not exist.
- Live account persistence was not retested in the launch environment: register, sign-in, sign-out, session, completions on another device, or two-account isolation.
- On a shared browser, the first signed-in account whose slice is empty still claims an old unscoped blob once. After that, the shared key is deleted.
- The 988 wording is for the United States and still needs review before a public launch.
- Hosts can log validation request bodies even though application code does not store them.
- Tab storage and account storage are not encrypted by lifeZoi beyond what the browser, the host, and Supabase provide.
- GitHub branch protection was reported off on 2026-11-05 (`protected: false`). Do not bypass a failed check if protection is later turned on. Run the scripts locally before merging.

Tests the launch report actually ran, on the committed tree before pull request #24, and not re-run as typecheck, lint, or build for this update:

- `npm test` — 26 files, 193 tests passed.
- `npm run typecheck` — passed.
- `npm run build` — passed.
- `npm run lint` — passed on the committed tree after the pull request was opened.

On 2026-11-09, after `git pull` of `22bc90c82ab8ce196cec0cf5b1f46614a31c45ff`, this update re-ran `npm test` (Vitest): 28 files, 221 tests passed. `npm run typecheck`, `npm run lint`, and `npm run build` were not re-run.

A browser pass on a local production server used a synthetic person only. Desktop 1280px and mobile 390px passed the flows named in the launch report. No real health data was used.

## How to run locally

Requirements: Node.js 22 and npm. From the repository root:

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js dev server at http://localhost:3000 |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | `next typegen`, then `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm start` | Serve the production build |

Copy `.env.example` to an untracked local env file only when accounts are needed. Set the two public Supabase names. Leave `AI_PROVIDER` as `mock`. Do not commit that file.

With the Supabase names unset, `GET /api/status` returns `persistence` `development` and `authentication` `not-configured`. With a valid public pair and the supabase adapter, it returns `persistence` `account` and `authentication` `supabase`. `GET /api/ai-assistant` reports mock mode.

A production build may fetch Google font metadata. Unit tests generally do not need the network. A LOINC lookup calls MedlinePlus only when that route is exercised.

## Important decisions

- Educational wellness only. No diagnoses, no medication changes, no personal lifespan figures, no invented citations, percentages, or risk reductions.
- $0 budget. Free public sources only. No paid APIs, subscriptions, billing, exercise apps, or video libraries.
- `noindex` stays in the root layout and as `X-Robots-Tag: noindex, nofollow` until a public launch whose privacy notice matches the real system. A `robots.txt` disallow rule is not a substitute. Do not remove either mechanism before that review.
- Emotional Wellness is not clinically reviewed. The on-page sentence must stay.
- Share the Care `care_invitations` SQL is not applied. Do not pretend a link was created. Apply the SQL only in the Supabase SQL editor when a person chooses to turn invitation tracking on.
- Password recovery is absent. Do not imply it exists.
- Pull requests #18 and #19 are merged. Their keys are not set, and the community SQL is not applied, so the Gemini reply falls back to prepared answers and community posts stay in review with in-process storage. `GEMINI_API_KEY` is server-only. The Gemini call is free only while the Google project stays on the free tier, and free-tier prompts may be used to improve Google’s products. That is a privacy gap for wellness text. `OPENAI_API_KEY` is server-only and calls the moderations endpoint only, not chat completions. That call sends member text off site. Current pricing was not re-verified, so zero cost is not confirmed. Optional `SUPABASE_SERVICE_ROLE_KEY` must never be `NEXT_PUBLIC_`.
- `main` is canonical. Pull request #1 stays closed.
- Empty Supabase variables stay `not-configured`. Do not fake authentication.
- Do not describe the mock assistant as a live model.
- Do not claim HIPAA, GDPR, or other regulatory compliance.
- Sample data stays labeled `Sample visitor` and must not be written into a person’s saved session.
- Do not put a service-role key in the browser or in a `NEXT_PUBLIC_` variable.
- Preserve working behavior unless the task asks for a change. Match the existing style: small typed modules, server validation beside any client check, plain language in the UI.

## Recommended next steps

1. Read this handoff, then root `CLAUDE.md`, then the current code. Treat `docs/claude-migration/ACTIVE_WORK.md` as historical. Ignore the stale LZ-3 paragraph in `CLAUDE.md`.
2. Branch new work from `main` at `22bc90c82ab8ce196cec0cf5b1f46614a31c45ff`, or from the documentation commit on top of it. Do not start from pull request #1. #18 and #19 are already on `main`.
3. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run lint` before relying on the tree. Add `npm run build` when routing, config, or rendering changes. GitHub will not run those scripts for you.
4. Keep the product in internal testing. Do not remove `noindex`, do not call Emotional Wellness validated, and do not announce a public launch.
5. Leave `GEMINI_API_KEY` and `OPENAI_API_KEY` unset unless a person accepts the privacy and cost consequences. Gemini free-tier prompts may be used to improve Google’s products. OpenAI moderation sends member text off site, and its current price was not re-verified.
6. Apply `care_invitations` or the community tables only when a person asks, and only in the Supabase SQL editor. Until then, Share the Care must keep saying that a link was not created, and community storage stays in the server process.
7. Password recovery, a clinical review, a privacy notice that matches the real system, and a live two-account retest are human decisions. They are not implied by this handoff.
8. Do not add a paid provider, document upload, or a service-role key in the client.
9. If `docs/claude-migration/` should catch up to `main`, including the stale “do not add `OPENAI_API_KEY`” line in `ENVIRONMENT_SETUP.md`, do that as its own docs change. This revision commits only `CLAUDE_HANDOFF.md`.
