# lifeZoi Claude Code migration index

Read this file first.

## Project

lifeZoi is a responsive web app for habit reflection, WHAT IF? lifestyle illustrations, evidence-informed educational guidance, and simple progress tracking. WHAT IF? is a feature, not the product name. The app must not diagnose, promise a lifespan, or present uncertain estimates as medical facts.

| | |
| --- | --- |
| Repository | https://github.com/ibkaplan/life-zoi |
| Default branch | `main` |
| Visibility | Public |
| Homepage recorded on the repo | https://life-zoi.vercel.app |
| Product owner named in the project brief | Igor Kaplansky (GitHub login `ibkaplan`) |
| Snapshot used for these docs | `main` at `a6bfdcc` (2026-10-29), inspected 2026-11-01 |

## Architecture in brief

`main` is a Next.js 16 App Router application (TypeScript, React 19, Tailwind CSS 4). Persistence is development mode: `sessionStorage` in the open tab, cleared when the tab closes. `GET /api/status` reports `persistence: "development"` and `authentication: "not-configured"`. `supabase/schema.sql` is a prepared design with row level security. The app does not connect to Supabase. No AI provider is called. There is no account system.

An earlier Cursor agent also opened https://github.com/ibkaplan/life-zoi/pull/1 on `cursor/lifezoi-app-ce49`. That pull request is a second implementation. On 2026-11-01 GitHub reported it open, conflicting with `main`, and not merged. Do not treat it as the source of truth.

## Migration status

Documentation for a move from Cursor cloud agents to Claude Code was added in the migration pull request that introduced this directory. Application code was not changed. Cursor agents were not stopped. Pull request #1 was not merged. Retirement of the Cursor project still requires the checklist in [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md).

## Documents

| Document | Use it for |
| --- | --- |
| [CLAUDE.md](../../CLAUDE.md) | Short operating rules for every Claude Code session |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Product, stack, architecture, and what is actually built |
| [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md) | Permanent rules, decisions, pitfalls, and gaps |
| [ACTIVE_WORK.md](ACTIVE_WORK.md) | Open pull request, unfinished work, and next actions |
| [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) | Runtimes, commands, integrations, and manual setup |
| [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) | Cursor coordinator and agents that were visible |
| [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md) | Coordinator and worker workflow in Claude Code |
| [AUTOMATIONS.md](AUTOMATIONS.md) | Schedules and triggers, including those that do not exist |
| [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md) | Checks before relying on Claude Code and retiring Cursor |

## Recommended reading order

1. This index.
2. [CLAUDE.md](../../CLAUDE.md) — rules that apply to every change.
3. [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) — what the software is.
4. [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md) — constraints that are easy to violate.
5. [ACTIVE_WORK.md](ACTIVE_WORK.md) — what is unfinished, especially pull request #1.
6. [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) — how to run it.
7. [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md) and [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md) — how work was coordinated and how to continue.
8. [AUTOMATIONS.md](AUTOMATIONS.md) — do not expect hidden schedulers.
9. [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md) — prove the new environment before leaving Cursor.

## Agents that existed

There was no large fleet. Visible Cursor cloud agents on 2026-11-01:

| Agent | Role | Status seen |
| --- | --- | --- |
| [lifeZoi web app](https://cursor.com/agents/bc-df653408-8f63-4fd1-bd42-4e04dfa09f6e) (`bc-df653408-8f63-4fd1-bd42-4e04dfa09f6e`) | Cursor Project coordinator. Tracker lived in the project store, not in git. | Idle. No branch and no pull request on the agent record. |
| [LifeZoi web app](https://cursor.com/agents/bc-efe0545d-9f0c-5bcb-9551-93e15378ce49) (`bc-efe0545d-9f0c-5bcb-9551-93e15378ce49`) | Built the alternative app and opened pull request #1. | Idle. Turn had finished. Pull request open and conflicting. |
| [lifeZoi application](https://cursor.com/agents/bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6) (`bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6`) | Unknown. No branch, pull request, or dashboard events were recorded. | Idle. Work product not identifiable from accessible metadata. |
| Claude Code migration (`bc-d9827e20-0c85-51e9-8d6d-eaa0b1f3ed8c`) | Wrote this documentation only. | This migration task. |

Model recorded for those runs: Grok 4.7. Full prompts and transcripts were not exported. See [AGENT_ARCHITECTURE.md](AGENT_ARCHITECTURE.md).

## Active priorities

1. Keep `main` as the working tree until a person chooses otherwise.
2. Do not merge pull request #1 while it conflicts. Decide whether to close it, salvage pieces, or replace `main`.
3. Do not deploy new behavior or connect Supabase until that decision is explicit.
4. Before any public launch: privacy, security, scientific, and legal review. Keep qualitative guidance. Review 988 wording and indexing.

## Known missing information

- Cursor conversation transcripts and the coordinator’s full operating prompt were not in git and were not copied here.
- Which person or agent pushed `2ed8ef7` and `a6bfdcc` directly to `main` is not linked from the accessible agent metadata.
- The idle agent `bc-bc67516b-2cce-5d31-9ade-5337fb5df8d6` has no recorded artifact.
- Branch protection could not be read (GitHub returned 403 for the protection endpoint). Repository rulesets listed as empty. Required reviews are therefore unconfirmed.
- No Cursor automation id was available to look up. None were found in GitHub Actions or in this agent’s subscriptions.
- Supabase and AI credentials are intentionally absent. Do not invent them.
- Unit tests on `main` were not re-run while writing these documents. Sixteen `it()` cases exist in four files.
- The live site returned HTTP 200 with the app’s security headers on 2026-11-01. Page copy was not reviewed in a browser for this migration.

## Integrations that still need a person

None are required to run development mode. Optional later work needs a person to create a Supabase project, apply `supabase/schema.sql`, and add a server adapter. An AI provider is not part of this version. Vercel already has a project; production changes still need explicit approval. Details: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

## Initialize the Claude coordinator

1. Open the GitHub repository in a Claude Code Project after this documentation is on `main`.
2. Confirm the session loaded root `CLAUDE.md`.
3. Read this index, then [ACTIVE_WORK.md](ACTIVE_WORK.md) and [PROJECT_KNOWLEDGE.md](PROJECT_KNOWLEDGE.md).
4. Use one coordinator session. Do not start parallel implementation workers until pull request #1 has a decision.
5. Track new work in GitHub issues or pull requests so it survives outside Cursor’s project store.
6. Follow [CLAUDE_WORKFLOW.md](CLAUDE_WORKFLOW.md) for model choice and delegation. The Claude Ultra subscription is not an unlimited pool.

## First verification task

From a clean checkout of `main`:

```bash
npm ci
npm test
npm run typecheck
npm run lint
```

Then start `npm run dev` and request `GET /api/status`. Expect `product` `lifeZoi`, `persistence` `development`, and `authentication` `not-configured`. Confirm sample data is labeled and that the UI does not show a lifespan or a health score. Do not merge pull request #1 as part of this check.

## Before retiring Cursor

Complete [MIGRATION_CHECKLIST.md](MIGRATION_CHECKLIST.md). Leave Cursor agents running until a person confirms Claude can edit, test, and open pull requests. Do not delete the Cursor project store until the conflicting pull request decision and the safety rules are accepted in Claude.
