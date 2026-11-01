# Automations

Inventory date: 2026-11-01. Nothing here was disabled.

## What was checked

- `.github/` is absent. GitHub Actions workflows API: `total_count` 0.
- `package.json` scripts are dev, build, start, lint, typecheck, and test. None start an agent or a cron.
- No `vercel.json` crons. No in-app queue or scheduled function.
- This Cursor run’s event-subscription list was empty.
- No Cursor automation id appears in the project store, the repository, or `notes.md`. `GetAutomation` cannot be called without an id, so no automation record was retrieved. That is “none found,” not “proven that the owner’s Cursor account has zero automations.”
- Vercel GitHub checks exist on commits. Those are deploys, not Cursor agents.

## Repository automations

### Vercel deployment on push

| | |
| --- | --- |
| Trigger | Push or pull request activity that the already-installed Vercel GitHub integration receives. Exact branch filters were not readable from the repo. |
| Purpose | Build and host the Next.js app. |
| Responsible agent | None. Vercel’s builder. |
| Tools | Vercel project for team slug `risi-0778846f`, GitHub app. |
| Actions | Deploy. On 2026-11-01, `main` commit `a6bfdcc` and pull request #1 both showed a successful Vercel status. |
| Expected outcome | A deployment URL and a commit status. |
| Errors | Not observed during this inventory. Retry behavior is Vercel’s, not something in git. |
| Claude equivalent | None needed. Leave the Git integration in place. Claude should not redeploy as a side effect of reading the repo. A push still can. |
| Automatic in Claude Code | No. Claude does not receive this webhook. |
| Manual setup | Already installed. A person manages it in Vercel. |

## Cursor and Claude agent triggers

No scheduled task, GitHub-event agent, PR babysitter, CI repair bot, recurring maintenance agent, or bug-scan agent was defined in the accessible project.

Claude Code Projects do not gain those triggers by importing this documentation. Do not claim that a Claude Project will open pull requests when Vercel fails or when someone comments.

## If a trigger is wanted later

| Need | Realistic option | Automatic in Claude today |
| --- | --- | --- |
| Run unit tests on every pull request | A GitHub Actions workflow running `npm test`, `npm run typecheck`, and `npm run lint` | No, until someone adds the workflow. Out of scope for the migration docs PR if it would add CI config. Not added. |
| Notice a failed Vercel deploy | GitHub notifications or the Vercel UI | No |
| Weekly dependency or copy review | A person’s calendar, or a GitHub Action that only opens an issue | No |
| Resume a stalled coding agent | Not available. Start a new Claude session from the open pull request. | No |

Adding GitHub Actions would be an application-repository change beyond documentation. Do it only as its own reviewed pull request.

## What not to do

- Do not turn off Vercel while moving to Claude. The site and previews depend on it.
- Do not create a Cursor automation as part of leaving Cursor.
- Do not invent a scheduler in Claude to replace one that was not here.
