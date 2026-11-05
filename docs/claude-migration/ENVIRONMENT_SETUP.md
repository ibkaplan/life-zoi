# Environment and integrations

No secret values belong in this file or in git. Names of variables are documented. Values stay in the host or in an untracked local file.

Checked 2026-11-01 against `main` at `a6bfdcc` and the GitHub repository settings that the token could read.

## Repository

| | |
| --- | --- |
| GitHub | https://github.com/ibkaplan/life-zoi |
| Default branch | `main` |
| Visibility | Public |
| Open pull request to leave alone | https://github.com/ibkaplan/life-zoi/pull/1 |
| Permissions Claude needs | Contents read/write and pull requests on this repo for normal development. Admin is not required for documentation or app edits. |
| Cloud agent | Yes, once GitHub is connected to Claude Code. |
| Local agent | Yes. Clone the repo. |
| Manual step | Authorize Claude Code for this repository. Confirm the session is not authenticated in a way that prints tokens into the chat. |
| Verify | `git ls-remote https://github.com/ibkaplan/life-zoi.git HEAD` or `gh repo view ibkaplan/life-zoi`. |

There is a single repository. No second app repo was listed.

## Runtime

| Tool | Expected |
| --- | --- |
| Node.js | 22. Documentation host had v22.23.4. |
| npm | 10. Documentation host had 10.9.9. Install from `package-lock.json`. |
| Python | Not used |
| Package manager | npm only |

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

| Script | Command | Notes |
| --- | --- | --- |
| Dev | `npm run dev` | Next.js dev server |
| Test | `npm test` | `vitest run` |
| Types | `npm run typecheck` | `next typegen && tsc --noEmit` |
| Lint | `npm run lint` | `eslint .` |
| Build | `npm run build` | Production build |
| Start | `npm start` | Serves the build |

Cloud and local agents both need Node 22 and npm to run these. No extra system libraries were required by the repository files.

Verify: `node -v` prints a 22.x version, then `npm test` exits 0. The migration documentation pass did not run that test.

## Environment variables

File: `.env.example`. Copy only if you want the names locally. Leave values blank. `.env*` is gitignored except `.env.example`.

| Name | Purpose | Required now |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL. The browser client inlines this direct `process.env` read. | Only for accounts |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key. Not a license to skip row level security. | Only for accounts |
| `AI_PROVIDER` | Must stay `mock`. Any other value is refused and does not call a network. | No |
| `AI_MODEL` | Label only. Default in code is `gpt-4o-mini` if unset or invalid. Not called. | No |
| `AI_PLAN` | `basic`, `premium`, or `advanced`. Planning only. There is no unlimited plan. | No |
| `AI_PROMPT_CENTS_PER_1K` and `AI_COMPLETION_CENTS_PER_1K` | Planning estimates, not a bill. | No |

`src/lib/status.ts` reports `authentication: "supabase"` and `persistence: "account"` only when `SESSION_ADAPTER` is `supabase` and both public values pass `isPublicSupabaseConfig` (https URL, anon key length 20–4096, no whitespace). Otherwise status stays `not-configured`.

Do not add `SUPABASE_SERVICE_ROLE_KEY` to any client bundle. It is not in `.env.example`. Do not add `OPENAI_API_KEY`. The mock does not use one.

Cloud and local test runs do not need these variables. Account testing needs the public pair in the environment, not in git. Production values belong in Vercel, and this refresh did not read them.

Verify development mode:

```bash
curl -s http://localhost:3000/api/status
```

Expect JSON with `persistence` `development` and `authentication` `not-configured` when the public Supabase variables are unset. With the account adapter and those variables set, expect `authentication` `supabase` and `persistence` `account`.

## Vercel

| | |
| --- | --- |
| Purpose | Host the Next.js app over HTTPS |
| Config in repo | No `vercel.json`. Headers are in `next.config.ts`. Team slug `risi-0778846f` is written in `README.md`. |
| Recorded homepage | https://life-zoi.vercel.app |
| Cloud agent | Not required for coding. A push to GitHub can trigger Vercel because the Git integration is already installed. |
| Local agent | Optional. `npx vercel` is not part of the documented workflow. |
| Permissions | Vercel project access for the team that owns the project, only when deploying or reading logs. |
| Manual in Claude | Do not create a new Vercel project. Do not change production env vars unless the task is an approved deploy. |
| Verify | GitHub commit status context `Vercel`, or a HEAD request to the homepage. On 2026-11-01 the homepage returned 200 with `strict-transport-security`, `x-frame-options: DENY`, `x-content-type-options: nosniff`, and a locked-down `permissions-policy`. |

`main` commit `a6bfdcc` had a successful Vercel status. Pull request #1 also had a successful Vercel preview status. Preview URLs change. Look them up on the pull request rather than baking them into docs.

## Supabase

| | |
| --- | --- |
| Purpose | Accounts and the five user tables. Code is connected when the public env vars are valid. |
| Config | `supabase/schema.sql`. Client: `@supabase/supabase-js` in `src/lib/supabase-browser.ts`. No `supabase/config.toml`. |
| Cloud / local | Not required to run unit tests. Required to exercise sign-in. |
| Permissions | The public anon key plus a user session. Not the service role. |
| Manual | The README says the live project already has the tables. Applying `schema.sql` again is a database change and was not done here. Set the public URL and anon key on the host. |
| Verify | `GET /api/status` matches the env actually loaded. This refresh did not call the live Supabase API. |

## Not used

Stripe, transactional email, and SMS have no code. MedlinePlus Connect is used for LOINC lookups. A third-party AI API is named only so the mock can refuse it. Do not add a provider key in a documentation pass.

## CI/CD

GitHub Actions: no `.github/workflows` and the workflows API returned `total_count: 0`.

The only automated check observed is Vercel’s GitHub deployment status. It does not run `npm test`.

Deployment procedure today: Vercel builds the default branch. Accounts on the deployed site need the public Supabase variables in the Vercel project. `AI_PROVIDER` should remain `mock`. This refresh did not deploy.

Background jobs and cron: none in the app and none in GitHub Actions.

## MCP and Cursor-only tools

No MCP server is configured in the repository. Claude does not need a Cursor MCP connection to build lifeZoi.

Cursor-only context that does not travel automatically:

- Project store task list and the builder’s implementation report (summarized in these docs).
- Cloud agent roster and computer-use browser runs.
- The token that talks to Cursor’s agent APIs.

`AGENTS.md` on `main` is the generated Next.js notice, not custom policy. `CLAUDE.md` is the instruction file for Claude.

## Auth dependencies outside the app

GitHub authentication for pushing branches. Vercel’s GitHub app for deploys. End-user sign-in is Supabase Auth, not a separate OAuth app in this repo. Local `.env.local` may contain a Vercel OIDC token after `vercel link`; `a6bfdcc` ignores it. Never commit that file.

A checkout on Igor’s Mac at `~/github/life-zoi` was made by a Cursor self-hosted worker. For Claude, open that directory in Claude Desktop or the local Claude Code CLI. Do not expect `agent worker start` to be part of the Claude setup.

## Network

Local dev binds to the machine running `next dev`. Most unit tests do not need the network. A LOINC lookup calls MedlinePlus when that route is exercised. Builds may fetch Google font metadata because `src/app/layout.tsx` uses `next/font/google` (Fraunces and Source Sans 3). A locked-down cloud builder needs outbound access to those font hosts, `registry.npmjs.org`, and, for a live reference lookup, `connect.medlineplus.gov`. Supabase hosts are needed only when accounts are configured.

## Verify the whole local loop

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run dev
```

In another shell: `curl -s http://localhost:3000/api/status`.

Sign-in should be absent. The banner should say development mode.
