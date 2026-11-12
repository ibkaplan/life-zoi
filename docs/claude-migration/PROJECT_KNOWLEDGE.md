# Project knowledge

Use this file to avoid repeating rejected ideas or breaking safety rules. Pair it with root `CLAUDE.md`.

## How to read the categories

- Permanent rules stay in force across tasks.
- Current decisions describe `main` at `a6bfdcc` and can change with an explicit task.
- Historical context explains how the repo got here.
- Temporary information may be stale after the next merge. Recheck GitHub before acting.

## Permanent development rules

- The product name is lifeZoi. WHAT IF? is a feature inside it.
- Do not diagnose, recommend changing prescription medication, promise a specific lifespan, predict a date of death, or present uncertain estimates as medical facts.
- Do not invent citations, percentages, or risk reductions. If a number is not in the cited public source and the person’s own answer, do not create one.
- Quantitative personal risk and “years gained” stay out of the product. A copied Social Security population figure may be shown only with the existing population label, and only for an age row that was copied. Do not interpolate it or call it the person’s lifespan.
- Guidance stays qualitative. Separate established public guidance from outcomes that vary by person.
- Sample data is always labeled as sample data and is not the person’s record.
- If Supabase or AI credentials are missing, stay in a clearly documented local development mode. Do not fake authentication or secure storage.
- Do not claim HIPAA, GDPR, or any other compliance.
- Do not describe `supabase/schema.sql` or development mode as a completed secure health record.
- Keep API keys and service-role keys on the server. Never prefix a secret with `NEXT_PUBLIC_`.
- Validate on the server as well as in the browser. Do not store assessment bodies in application storage on the server.
- Remember that a host can still log those request bodies.
- `noindex` remains until a production privacy notice matches the real system. `main` sets it in metadata and in `X-Robots-Tag`. Do not remove either unless the legal review says the notice matches.
- The 988 line is for the United States. Do not generalize it to other countries without review.
- Source links need a human check before launch. They were chosen because the pages were reachable when the copy was written. They can move.
- Before public launch, privacy, security, scientific, and legal review are still required.
- Do not commit secrets. `.env*` stays ignored except `.env.example`.
- Preserve working behavior unless the task asks for a change.
- Do not report a test, build, or deploy as passed unless it was run.

People: the project brief names Igor Kaplansky. The GitHub login on the repository is `ibkaplan`. His wife also works on the repo from a separate Cursor setup. Her agents and task tracker are not visible from this project. The admin allowlist email is the one already committed in `src/lib/admin-allowlist.ts` and `README.md`.

## Current project decisions

These match `main`, not pull request #1.

- `main` is the canonical tree (owner decision LZ-3, 2026-11-05). Pull request #1 stays closed.

- `SESSION_ADAPTER` is `"supabase"`. Signed-in assessment answers use Supabase Auth and row level security when the public URL and anon key pass `isPublicSupabaseConfig`. `getAppStatus` reports `authentication: "supabase"` and `persistence: "account"` only then. Missing configuration stays `persistence: "development"` and `authentication: "not-configured"`, even if stray variables are present but invalid.
- The browser client must read `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY` as direct property accesses. Passing `process.env` through an argument stays empty in the client bundle (`1d6a333`).
- Without an account, assessment answers stay in the browser tab (`sessionStorage`). Change Lab, Your Life Matters, the assistant thread, and wellness notes stay in the tab even when an account exists. Sample data labeled `Sample visitor` is not written into an account.
- The assistant is mock-only. `AI_PROVIDER` other than `mock` is refused with no outbound call. `.env.example` prices and `gpt-4o-mini` are labels, not a live bill or a live model.
- Settings clear the tab, and for a signed-in person also clear that account’s rows, after a confirm button. They do not ask the person to type `delete`, and they do not export JSON. A separate control deletes the login.
- The only admin email is `tatyanaserikovaru@gmail.com`, checked on the server and set by a database trigger. The client cannot grant admin.
- Check-ins are done or not done. They are not a three-way done / partial / skipped record.
- Suggestion cards are not capped at four.
- An internal wording filter withholds illustrations or suggestion lists that trip `src/lib/claims.ts`.
- Authorization helper `decideAccess` in `src/lib/access.ts` runs before an account write. Row level security still requires `auth.uid()` to match `user_id`.
- Security headers are set in `next.config.ts`.
- The intended host is Vercel for Right Intent LLC. The team slug in `README.md` is `risi-0778846f`. No env vars are required for development mode.
- The repository is public. An earlier attempt to make it private did not succeed. Do not assume a later agent can flip visibility.
- Package scripts on `main`: `typecheck` runs `next typegen && tsc --noEmit`. Lint target is `eslint .`.

- Music is streamed, never downloaded (owner decision, 2026-11-11). My Music plays real public domain, CC0, CC BY, and CC BY-SA recordings that the listener's browser streams from Wikimedia Commons (`src/lib/music-library/streams.ts`). Do not add audio files to the repository or proxy them through LifeZoi's servers. Each category also links to one of Spotify's own playlists (`SPOTIFY_PLAYLISTS`), as a plain outbound link, not an embed. A subscription cannot be shared with listeners. The synthesized pieces left the library; only the two breathing guides remain there. The Pixabay and `public/audio/classical` download paths are superseded.

- Breathe for Life (`/breathe`, added 2026-11-10) keeps nitric oxide copy qualitative. The Oregon State Extension figure of a 75% decline in NO production between ages 20 and 70 has no reference on that page and could not be traced to a study, so the app does not use it and says why. The humming figure is stated only as about 15 times higher nasal NO output in a ten-person study (Weitzberg & Lundberg 2002), never as whole-body NO. Wording tests live in `src/lib/breathe/breathe.test.ts`. Breathing data is stored in the companion state under `breathe`.

## Historical context

- The first commit is `57cddd7` (placeholder). `2ed8ef7` added the development-mode app to `main`. `a6bfdcc` ignored local Vercel env files. `c9f003a` added the first Claude migration docs.
- Pull request #1 (`0ab8b12`) was a second app. It was closed without merge on 2026-11-04. Pull requests #3 and #8 brought the later stacked product onto `main`. #9 fixed primary button contrast. #10 merged the quieter homepage. `39be250` added accounts. `1d6a333` fixed browser inlining of the public Supabase settings.
- Igor’s MacBook Air has a local clone at `~/github/life-zoi`, created by Cursor agent `bc-52dc787f-c35a-51fa-8c57-6796ebe25a65` on a self-hosted worker. That path is a Cursor feature. Claude Desktop or local Claude Code is the replacement.
- The product specification asked for Next.js App Router, TypeScript, and Tailwind, and for an honest development mode when credentials were missing. Both trees followed that shape. They did not stay on one branch.
- Cursor project memory outside git was limited to `notes.md`, the specification, the builder’s implementation report, and the migration assignment. Transcripts were not part of that store.

## Successful patterns worth keeping

- Put user-facing health statements next to a source object in `src/lib/sources.ts`.
- Run copy through `assertEducationalCopy` before returning it.
- Keep sample sessions on a separate flag from the typed session.
- Sanitize anything read back from browser storage (`sanitizeSession`). Corrupt history is dropped rather than thrown at the person.
- Return generic client errors from route handlers. Field errors are for validation, not for stack traces.
- State development mode in the shell banner so a deployed URL cannot be mistaken for accounts.
- Test the access rule, the questionnaire, the scenario wording, and the SQL file’s row level security text.

## Rejected or not accepted approaches

- Pretending Supabase is connected because env vars exist.
- Using the service role to read user data.
- Showing a health score, biological age, or lifespan. Exception (owner request, 2026-11-12): the dashboard’s “My Wellness Score & Progress” counts habit areas from the person’s own saved assessments that match public guidance (for example “5 of 7”). It is labeled as not a medical test, diagnosis, or prediction, and it is empty until an assessment is saved.
- Inventing check-ins the person did not enter.
- Treating sample layouts as saved personal data.
- Claiming compliance because HTTPS or row level security exists on paper.
- An AI provider in this version. A later provider must stay server-side and must reject outputs that add numbers, diagnoses, or lifespan claims.
- Merging pull request #1 as if it were a small feature branch. It replaces most of the app and does not apply cleanly.

## Known pitfalls

- Two early trees diverged. Pull request #1 is closed, not merged. Check `main` before trusting older docs that say Supabase is disconnected or that `noindex` is missing.
- Feature pull requests #4 through #7 were closed without a separate merge. Their commits arrived through #8. Do not reopen them to “land” work that is already on `main`.
- `npm run typecheck` on `main` needs the Next.js typegen step. A bare `tsc` script from the other branch is not this branch’s script.
- Vitest on `main` uses `vitest.config.ts`. The pull request uses `vitest.config.mts`.
- Browser storage is not encrypted by the app.
- Public deployment can exist without a launch review. Vercel success is not a privacy approval.
- The 988 copy appears in more than one module. Change it in every user-facing path, including tests that look for `988`.

## Security and reliability

- Collect only what the assessment already asks for.
- Do not log health answers from application code. Assume the platform might.
- Production transport is HTTPS on Vercel.
- No application rate limit, account lockout, or audit log is implemented beyond Supabase Auth’s own controls and the MedlinePlus outbound cap.
- No performance budget is documented. Runtime dependencies are Next, React, and `@supabase/supabase-js`.
- Charts must stay understandable on a phone and must not use color as the only signal. The progress view describes bars with the words Done and Not done.

## Incidents

No production incident is recorded. The earlier miss of a public site without `noindex` is corrected on `main`. The remaining product risk is reading the SSA population figure, or the mock assistant, as personal medical advice.

## Design decisions not to reverse casually

- Educational tone and the professional-care notice in `src/lib/sources.ts`.
- Server-side validation of suggestions and scenarios.
- Row level security for account rows, owner-only, no service-role reads, AAL2 after a verified authenticator factor.
- Honest `/api/status`: account mode only when the adapter and public config are both real.
- Mock-only assistant until a person approves a provider.
- Separation of sample data.
- The prohibited-claim filter.

## Temporary task-specific information

- Migration documentation was written 2026-11-01 and refreshed 2026-11-05 by Cursor agent `bc-d9827e20-0c85-51e9-8d6d-eaa0b1f3ed8c`. The refresh did not change application code.
- Agent metadata is point-in-time. The local-clone agent was not in the list this run could read.
- On 2026-11-05 GitHub reported `main` as `protected: false`, so GitHub enforces no review or check.

## Inaccessible knowledge

- Full Cursor chats, including any verbal decisions that never reached git or the project store.
- The work, if any, inside agent `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6` and inside `bc-3073812f-5e00-5bf8-9506-46876dee1c1b` beyond its name.
- Igor’s wife’s Cursor chats and tracker.
- The transcript of the MacBook clone agent. The tracker says the clone path is `~/github/life-zoi`.
- Live Supabase contents. The README states the tables exist. The values of Vercel environment variables were not read and must not be copied into git.
- Whether the deployed HTML matches `1d6a333`. This refresh did not browse the site.
