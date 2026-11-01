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
- Quantitative personal risk and “years gained” stay out of the product.
- Guidance stays qualitative. Separate established public guidance from outcomes that vary by person.
- Sample data is always labeled as sample data and is not the person’s record.
- If Supabase or AI credentials are missing, stay in a clearly documented local development mode. Do not fake authentication or secure storage.
- Do not claim HIPAA, GDPR, or any other compliance.
- Do not describe `supabase/schema.sql` or development mode as a completed secure health record.
- Keep API keys and service-role keys on the server. Never prefix a secret with `NEXT_PUBLIC_`.
- Validate on the server as well as in the browser. Do not store assessment bodies in application storage on the server.
- Remember that a host can still log those request bodies.
- `noindex` remains until a production privacy notice matches the real system. `main` is currently missing this guard. Do not drop `noindex` once it exists unless the legal review says the notice matches.
- The 988 line is for the United States. Do not generalize it to other countries without review.
- Source links need a human check before launch. They were chosen because the pages were reachable when the copy was written. They can move.
- Before public launch, privacy, security, scientific, and legal review are still required.
- Do not commit secrets. `.env*` stays ignored except `.env.example`.
- Preserve working behavior unless the task asks for a change.
- Do not report a test, build, or deploy as passed unless it was run.

People: the project brief names Igor Kaplansky. The GitHub login on the repository is `ibkaplan`.

## Current project decisions

These match `main`, not pull request #1.

- Local development mode is the system. `getAppStatus` always returns `persistence: "development"` and `authentication: "not-configured"`, even if Supabase variables are present (`src/lib/status.ts`).
- Notes and answers stay in the browser tab (`sessionStorage`). There is no account system and no AI provider.
- Settings clear the tab after a confirm button. They do not ask the person to type `delete`, and they do not export JSON.
- Sample label string is `Sample visitor`.
- Check-ins are done or not done. They are not a three-way done / partial / skipped record.
- Suggestion cards are not capped at four.
- An internal wording filter withholds illustrations or suggestion lists that trip `src/lib/claims.ts`.
- Future authorization helper is `decideAccess` in `src/lib/access.ts`. It is not wired to a session.
- Security headers are set in `next.config.ts`.
- The intended host is Vercel for Right Intent LLC. The team slug in `README.md` is `risi-0778846f`. No env vars are required for development mode.
- The repository is public. An earlier attempt to make it private did not succeed. Do not assume a later agent can flip visibility.
- Package scripts on `main`: `typecheck` runs `next typegen && tsc --noEmit`. Lint target is `eslint .`.

## Historical context

- The first commit is `57cddd7` (placeholder). `2ed8ef7` added the development-mode app to `main`. `a6bfdcc` ignored local Vercel env files, including an OIDC token path.
- Separately, Cursor agent `bc-efe0545d-9f0c-5bcb-9551-93e15378ce49` built another full app and opened pull request #1 at `0ab8b12`. The project tracker marked LZ-1 done against that pull request. The pull request conflicts with `main`.
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
- Showing a health score, biological age, or lifespan.
- Inventing check-ins the person did not enter.
- Treating sample layouts as saved personal data.
- Claiming compliance because HTTPS or row level security exists on paper.
- An AI provider in this version. A later provider must stay server-side and must reject outputs that add numbers, diagnoses, or lifespan claims.
- Merging pull request #1 as if it were a small feature branch. It replaces most of the app and does not apply cleanly.

## Known pitfalls

- Two agents editing “the lifeZoi app” produced two products. Check open pulls and `main` before a large change.
- `README.md` on `main` is ahead of some assumptions in the pull request report (storage, export, noindex, test file layout). Read the tree you are on.
- `npm run typecheck` on `main` needs the Next.js typegen step. A bare `tsc` script from the other branch is not this branch’s script.
- Vitest on `main` uses `vitest.config.ts`. The pull request uses `vitest.config.mts`.
- Browser storage is not encrypted by the app.
- Public deployment can exist without a launch review. Vercel success is not a privacy approval.
- The 988 copy appears in more than one module. Change it in every user-facing path, including tests that look for `988`.

## Security and reliability

- Collect only what the assessment already asks for.
- Do not log health answers from application code. Assume the platform might.
- Production transport is HTTPS on Vercel.
- No rate limit, account lockout, or audit log exists, because there are no accounts.
- No performance budget is documented. Avoid large client dependencies; the runtime dependency list is only Next and React.
- Charts must stay understandable on a phone and must not use color as the only signal. The progress view describes bars with the words Done and Not done.

## Incidents

No production incident is recorded. The operational miss that matters is the divergent implementations and the public site on `main` without `noindex`.

## Design decisions not to reverse casually

- Educational tone and the professional-care notice in `src/lib/sources.ts`.
- Server-side validation of suggestions and scenarios.
- Row level security as the future database rule, owner-only, no service-role reads.
- Honest development mode in `/api/status`.
- Separation of sample data.
- The prohibited-claim filter.

## Temporary task-specific information

- Migration documentation was written 2026-11-01 by Cursor agent `bc-d9827e20-0c85-51e9-8d6d-eaa0b1f3ed8c`. It did not change application code and did not merge pull request #1.
- Agent metadata, mergeability, and the live HEAD response are point-in-time. Recheck before relying on them.
- Branch protection was not readable with the token used (403). Rulesets returned an empty list. Whether a review is required to merge was not proven by a settings read.

## Inaccessible knowledge

- Full Cursor chats, including any verbal decisions that never reached git or the project store.
- The work, if any, inside agent `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6`.
- The identity of the session that pushed `main`, beyond the git author “Cursor Agent” and a co-author trailer for the GitHub login `ibkaplan`.
- Supabase project state. There is no evidence a project was created.
- Contents of Vercel environment variables. They must not be copied into git.
- Whether the deployed HTML still matches `a6bfdcc`. Only response headers were checked.
