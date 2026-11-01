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
| `NEXT_PUBLIC_SUPABASE_URL` | Future public Supabase URL. Commented out. | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Future anon key. Not a license to skip row level security. | No |

`src/lib/status.ts` reads those two names and still reports that the app does not connect.

Do not add `SUPABASE_SERVICE_ROLE_KEY` to any client bundle. The README forbids shipping it to the browser. It is not in `.env.example`.

Pull request #1’s `.env.example` also comments `# OPENAI_API_KEY=` as a future server-only name. That line is not on `main`. There is no AI client in either tree’s dependency list. Do not create a key for this migration.

Cloud agents do not need these variables to build or test. Local agents do not either. If a person later adds them on Vercel, add them in the Vercel project settings, not in git.

Verify development mode:

```bash
curl -s http://localhost:3000/api/status
```

Expect JSON with `persistence` `development` and `authentication` `not-configured`.

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
| Purpose | Planned accounts and database. Not active. |
| Config | `supabase/schema.sql`. No `supabase/config.toml`. No JS client dependency. |
| Cloud / local | Neither needs a Supabase login to develop this version. |
| Permissions | A person with a Supabase account, later. |
| Manual | Create a project, run the SQL in the SQL editor, then implement a server adapter. Keys alone do nothing. |
| Verify | `GET /api/status` stays `not-configured` until that adapter exists and the status code is intentionally changed. Querying a live project was not possible; no project URL is configured. |

## Not used

Stripe, email, SMS, and third-party AI APIs have no code, env names on `main`, or package dependencies. Do not add them in a migration or cleanup pass.

## CI/CD

GitHub Actions: no `.github/workflows` and the workflows API returned `total_count: 0`.

The only automated check observed is Vercel’s GitHub deployment status. It does not run `npm test`.

Deployment procedure today: Vercel builds the default branch. The README says to import the repo as Next.js and leave Supabase and AI variables empty. This migration did not deploy.

Background jobs and cron: none in the app and none in GitHub Actions.

## MCP and Cursor-only tools

No MCP server is configured in the repository. Claude does not need a Cursor MCP connection to build lifeZoi.

Cursor-only context that does not travel automatically:

- Project store task list and the builder’s implementation report (summarized in these docs).
- Cloud agent roster and computer-use browser runs.
- The token that talks to Cursor’s agent APIs.

`AGENTS.md` is not on `main`. The copy on pull request #1 is a generated Next.js notice, not custom policy. `CLAUDE.md` is the instruction file for Claude.

## Auth dependencies outside the app

GitHub authentication for pushing branches. Vercel’s GitHub app for deploys. No OAuth app for end users. Local `.env.local` may contain a Vercel OIDC token after `vercel link`; `a6bfdcc` ignores it. Never commit that file.

## Network

Local dev binds to the machine running `next dev`. Tests are unit tests and do not need the network. Builds may fetch Google font metadata because `src/app/layout.tsx` uses `next/font/google` (Fraunces and Source Sans 3). A locked-down cloud builder needs outbound access to those font hosts and to `registry.npmjs.org`.

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
