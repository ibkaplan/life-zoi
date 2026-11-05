# lifeZoi project overview

Facts below describe GitHub `main` at `1d6a333` unless a sentence names another commit. Status was checked on 2026-11-05. Nothing here was redeployed or retested as part of this documentation refresh. Earlier sentences that said Supabase was not connected are withdrawn.

## Purpose

lifeZoi helps someone reflect on everyday habits, explore one lifestyle change at a time, read educational guidance tied to public sources, and keep a simple progress record. It is a companion for reflection, not a clinic and not a fitness score.

Business objective of the first version: a polished, trustworthy, responsive web app that can run without Supabase or an AI key, and that does not overstate medical certainty. Public launch is not approved. Privacy, security, scientific, and legal review are still required.

## People who use it

An adult using a phone or desktop browser, looking at their own sleep, movement, food, tobacco, alcohol, stress, mood, connection, and goals. Sensitive questions can be skipped. The interface is English. Email and password accounts exist when Supabase public settings are present, including an authenticator-app step. There is still no clinician portal. Igor Kaplansky owns the product brief. His wife uses a separate Cursor setup and is the admin allowlist identity in `src/lib/admin-allowlist.ts`. Her agents are not visible here.

## What `main` implements

These flows exist on `main`. Account storage applies only when the public Supabase config is present. Other notes below stay in the tab.

| Area | Status on `main` | Where |
| --- | --- | --- |
| Landing page, including a lifestyle-profile prompt | Implemented | `src/app/page.tsx`, `src/lib/home-gauge.ts` |
| Dashboard, profile, assessment, WHAT IF?, progress, settings, privacy | Implemented | `src/app/(app)/` |
| Your Life Matters | Implemented, tab storage | `src/app/(app)/life-matters/page.tsx`, `src/lib/purpose.ts` |
| Life outlook, including a copied SSA population figure | Implemented | `src/app/(app)/outlook/page.tsx`, `src/lib/outlook.ts`, `src/lib/life-table.ts` |
| Change Lab experiments | Implemented, tab storage | `src/app/(app)/change-lab/page.tsx`, `src/lib/change-lab.ts` |
| Nutrition, movement, nature, urges, habits, choices, wellness coach | Implemented | `src/app/(app)/academy/`, `nature/`, `urges/`, `habits/`, `choices/`, `wellness-coach/` |
| Lab education and MedlinePlus by LOINC | Implemented. No file upload | `src/app/(app)/lab-results/page.tsx`, `src/lib/medlineplus.ts` |
| AI Health Assistant | Development mock only | `src/app/(app)/ai-assistant/page.tsx`, `src/lib/ai/` |
| Supabase email/password accounts and authenticator enrollment | Implemented when public env vars are set | `src/lib/account-store.ts`, `src/lib/mfa.ts`, `supabase/schema.sql` |
| Desktop nav and a compact mobile bar | Implemented | `src/components/app-shell.tsx` |
| `noindex` | Implemented | `src/app/layout.tsx`, `X-Robots-Tag` in `next.config.ts` |

Assessment steps: about, sleep, movement, nourishment, substances, mind, goals, review (`STEP_IDS` in `src/lib/types.ts`). Tobacco and alcohol can be left unanswered. Age range includes prefer-not.

WHAT IF? habit ids: `walk`, `sleep`, `eating`, `smoking`, `stress`, `alcohol`, `connection`, and `custom`. Custom notes do not receive invented evidence. Illustrations separate a current routine, a proposed change, likely benefits, challenges, next steps, established guidance, and an explicit uncertainty statement. Copy that matches a prohibited-claim check is withheld (`src/lib/claims.ts`).

Progress stores goals (days per week) and check-ins (`done` boolean plus a note). A chart is shown only after two check-ins for that habit in the month. There is no partial/skipped status on `main`.

Suggestions are generated from the completed assessment. The list is not capped at four. A wording check can withhold the whole list. The suggestion route does not call a model.

The assistant route does call the in-process mock. Replies are labeled development mock replies. `resolveAiProvider` rejects every provider name except `mock` and does not open a network connection for that rejection.

Life outlook can show one number copied from the SSA Period Life Table for an exact age and the female or male column, with the label “Population-based statistical estimate — not an individual prediction.” Ages that were not copied are left blank. It is not a personal lifespan and not a date of death. Qualitative labels on the same page are readings of reported answers, and the code says no validated prediction model is implemented.

Session keys `lifezoi.session.v1` and `lifezoi.sample.v1` remain in `sessionStorage`. Change Lab, purpose notes, the assistant thread, and wellness notes use their own session keys. Closing the tab drops them. Signed-in assessment data is additionally stored in Supabase. Sample data stays labeled `Sample visitor` and is not written into an account.

Security headers from `next.config.ts`: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` with camera, microphone, and geolocation disabled, and `X-Robots-Tag: noindex, nofollow`. The root layout sets the same robots metadata. `poweredByHeader` is false.

## Pull request history that matters

https://github.com/ibkaplan/life-zoi/pull/1 is closed, not merged (closed 2026-11-04). It remains a second app on `cursor/lifezoi-app-ce49` at `0ab8b12`: `localStorage`, its own validation routes, and `src/lib/lifezoi.test.ts`. Do not merge it. The tracker checkbox LZ-3 still asks the owner to decide whether that closed request or `main` is canonical.

Pull requests #3 and #8 merged the stacked work onto `main` (`cd15d65`): `noindex`, the homepage redesign, the mock assistant, Change Lab, Your Life Matters, and the nutrition, wellness, and habit tools. #4, #5, #6, and #7 are closed and were not merged. On 2026-11-05 GitHub showed them closed at the same time as #1. Their commits are already on `main` through #8. An earlier note that the coordinator could not close them is out of date.

Pull request #9 merged the primary-button contrast fix (`0c1bef4`). Pull request #10 merged the quieter homepage (`6063296`). `39be250` added Supabase accounts. `1d6a333` inlines the public Supabase settings in the browser client.

`AGENTS.md` on `main` is the stock Next.js agent-rules comment, not a product specification.

## Planned and not built

- A reviewed production privacy notice, crisis wording outside the United States, and a decision to remove `noindex`.
- Scientific review of WHAT IF?, outlook, and guidance text against the cited pages, including the SSA table.
- A paid AI provider. The mock must keep refusing other provider names until that approval, and outputs that add diagnoses or personal lifespan claims must still be rejected.
- Document upload. See [DOCUMENT_PROCESSING_PLAN.md](DOCUMENT_PROCESSING_PLAN.md). Accounts for assessment rows do not satisfy that plan.
- Making the repository private. It was still public on 2026-11-05.

The Cursor tracker is not in git. On 2026-11-05 its open product item was LZ-3. LZ-7 is this documentation refresh.

## Architecture

The browser holds a tab session and, when configured, a Supabase Auth session. `decideAccess` runs before an account write. Row level security still applies. Route handlers for suggestions and WHAT IF? validate JSON, respond, and do not store the body. The assistant handler stays inside the mock. The references route may call MedlinePlus Connect with a LOINC code and caches the response for 12 hours.

```text
Browser
  sessionStorage for tab-only answers, Change Lab, purpose, assistant, wellness
  Supabase JS client (anon key, PKCE) when public env vars inline
    -> profiles, assessments, scenarios, habit_goals, check_ins
POST /api/recommendations and POST /api/what-if
  -> validate, build from rules, discard
GET|POST /api/ai-assistant
  -> mock, or a refusal if AI_PROVIDER is not mock
GET /api/references?loinc=
  -> MedlinePlus Connect, code only
GET /api/status
  -> account/supabase only when SESSION_ADAPTER is supabase and the public config is valid
  -> otherwise development/not-configured
```

There is no separate backend service, queue, or background worker. `@supabase/supabase-js` is a runtime dependency.

## Stack

| Piece | Version or choice on `main` |
| --- | --- |
| Node.js | 22 (README). The documentation environment had Node v22.23.4 and npm 10.9.9. |
| Package manager | npm, with `package-lock.json` |
| Next.js | 16.4.3 (`cacheComponents` and `partialPrefetching` enabled) |
| React | 19.3.0 |
| Tailwind | 4, via `@tailwindcss/turbopack` |
| TypeScript | 5 |
| ESLint | 9 with `eslint-config-next` 16.4.3 |
| Tests | Vitest 5, `vitest.config.ts`, `src/**/*.test.ts` |
| Fonts | Fraunces and Source Sans 3 |
| Host intended for production | Vercel. Repo homepage https://life-zoi.vercel.app. Team slug recorded in `README.md`: `risi-0778846f`. |

`package.json` name is `life-zoi`. The closed pull request #1 branch names the package `lifezoi`. Node on the documentation host was not rechecked on 2026-11-05; the README still requires Node.js 22.

## Data model

Browser session (`src/lib/types.ts`): draft assessment, draft step, assessment history, saved scenarios, habit goals, check-ins. Limits while sanitizing: 24 history entries, 30 scenarios, 400 check-ins (`src/lib/session.ts`).

Account tables, used by the app when the public config is present: `profiles` (including `role` and `session_state`), `assessments`, `scenarios`, `habit_goals`, `check_ins`. Row level security uses `auth.uid()` plus `auth_session_may_use_rows()`, which requires AAL2 after a verified authenticator factor. The SQL does not grant the service role a bypass for reads. The README says the live project already has the original tables and that `supabase/schema.sql` adds the role, session fields, authenticator policies, and `delete_own_account()`. This documentation pass did not run that SQL or query the live database.

## APIs and integrations

| Integration | Role now |
| --- | --- |
| Supabase Auth and Postgres | Active code path. Public URL and anon key required at runtime. Service role is not in `.env.example` and must not be added as `NEXT_PUBLIC_`. |
| AI provider | Mock only. Env names in `.env.example` are planning labels. A non-mock provider is refused. |
| MedlinePlus Connect | `https://connect.medlineplus.gov/service`, LOINC only, 12-hour cache, 20 outbound calls per minute in `src/lib/medlineplus.ts`. |
| Vercel | Host. Homepage recorded as https://life-zoi.vercel.app. This refresh did not request it. |
| Public health pages | `src/lib/sources.ts` and `src/lib/wellness/sources.ts`, plus the SSA period life table URL in `src/lib/life-table.ts`. |
| Stripe, email, SMS | Not present |
| GitHub Actions | No workflows (`total_count` 0 on 2026-11-05) |
| MCP servers | None in the repository |

## Authentication and authorization

Email and password sign-in uses the browser Supabase client when the public config is valid. Authenticator enrollment uses Supabase TOTP. `GET /api/account` reads a verified session from the `Authorization` header and returns `signedIn`, `isAdmin`, and `email`. Admin is an allowlist in `src/lib/admin-allowlist.ts` and a database trigger. The client cannot grant it. `decideAccess` still denies a missing actor and a mismatched owner. Hiding a button is not authorization. Do not use the service role to read user rows.

## Hosting

Vercel serves HTTPS. The README says no environment variables are required for development mode. There is no `vercel.json` in the repo. `.vercel` and `.env*.local` are gitignored (`a6bfdcc` specifically keeps the local Vercel OIDC token out of git).

This migration did not deploy and did not change project settings.

## Dependencies that matter

Runtime: `next`, `react`, `react-dom`, and `@supabase/supabase-js`. Dev: Tailwind, TypeScript, ESLint, Vitest, `vite-tsconfig-paths`. No paid AI SDK.

## Limitations and debt

- Tab storage is unencrypted, shared with anything else that can read that origin’s `sessionStorage`, and lost when the tab closes. It is not a backup and not a health record.
- Application code does not store suggestion or WHAT IF? bodies. The host can still log them. Account rows are a different store.
- Tab storage is not a backup. Account storage is not a claim of compliance, and it is not encrypted by lifeZoi beyond Supabase and HTTPS.
- Change Lab, purpose, assistant, and wellness notes are not in the account tables.
- Source URLs can move. They need a check before launch. The SSA figures were copied on 2026-11-03 and are not interpolated.
- Guidance is educational, not a clinical guideline. The population figure is easy to misread as a personal lifespan.
- 988 is United States wording.
- `noindex` is present and must stay until the privacy review.
- Pull request #1 is closed, not merged, and still differs from `main`. The tracker has not recorded the owner’s decision.
- The repository is public.
- Unit tests were not executed during this documentation pass. Fifty-one `it()` cases are written in twelve files under `src/lib/`, including account, assistant, Change Lab, MedlinePlus, outlook-related, wellness, and the original assessment tests. They do not connect to a live database.
- No GitHub issues were open on 2026-11-01. This refresh did not re-list issues.

## Requirements that still govern the product

Performance and reliability targets are not written as numbers. The practical bar is: forms remain usable on a phone, charts appear only with enough real entries, errors from the route handlers stay generic (`400` / `500` without echoing secrets), and the app runs with empty Supabase variables.

Security requirements: HTTPS in production, security headers already set, secrets out of git, server-side validation, no service-role key in the client, no claim of HIPAA or GDPR compliance.

## Decisions and why

| Decision | Why |
| --- | --- |
| Development mode when Supabase env is missing | Empty configuration must not look like a signed-in account. |
| Supabase anon key and RLS for account rows | The service role must not read user rows. A verified authenticator factor requires AAL2. |
| `sessionStorage` for notes the account tables do not hold | Change Lab, purpose, assistant, and wellness notes stay on the tab. |
| Mock assistant that refuses other providers | A model name in `.env.example` is not a live integration. |
| SSA figure only from copied rows, with a population label | Avoids an interpolated personal lifespan. |
| `noindex` plus `X-Robots-Tag` | The public URL is not a reviewed launch. |
| Sample data in a separate flag | Demo content must not be confused with a person’s answers. |

## Related documents

- [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md)
- [ACTIVE_WORK.md](ACTIVE_WORK.md)
- [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md)
- [DOCUMENT_PROCESSING_PLAN.md](DOCUMENT_PROCESSING_PLAN.md)
- Repository `README.md`
